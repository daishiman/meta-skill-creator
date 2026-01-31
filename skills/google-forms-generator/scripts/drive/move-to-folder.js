#!/usr/bin/env node

/**
 * フォルダ移動スクリプト
 *
 * 使用方法:
 *   node scripts/drive/move-to-folder.js --formId FORM_ID --folderId FOLDER_ID
 *
 * オプション:
 *   --formId, -f    対象フォームID
 *   --folderId, -d  移動先フォルダID
 */

const { getDriveClient } = require('../auth/get-auth-client');
const { retryWithBackoff } = require('../utils/retry-with-backoff');

/**
 * フォームを指定フォルダに移動
 * @param {string} formId フォームID
 * @param {string} folderId 移動先フォルダID
 * @returns {Promise<Object>} 移動結果
 */
async function moveToFolder(formId, folderId) {
  const { drive } = await getDriveClient();

  console.log(`フォーム ${formId} をフォルダ ${folderId} に移動中...`);

  // 現在の親フォルダを取得
  const file = await drive.files.get({
    fileId: formId,
    fields: 'id, name, parents, webViewLink'
  });

  const originalParents = file.data.parents || [];
  console.log(`現在の場所: ${originalParents.join(', ') || 'root'}`);

  // フォルダ移動
  await retryWithBackoff(async () => {
    return await drive.files.update({
      fileId: formId,
      addParents: folderId,
      removeParents: originalParents.join(','),
      fields: 'id, parents'
    });
  });

  // 移動先フォルダの情報を取得
  let folderName = folderId;
  try {
    const folder = await drive.files.get({
      fileId: folderId,
      fields: 'name'
    });
    folderName = folder.data.name;
  } catch (e) {
    // フォルダ名取得に失敗しても続行
  }

  console.log(`✅ フォルダ「${folderName}」に移動しました`);

  return {
    success: true,
    formId,
    formName: file.data.name,
    folderId,
    folderName,
    originalParents,
    webViewLink: file.data.webViewLink
  };
}

/**
 * フォルダIDの存在確認
 * @param {string} folderId フォルダID
 * @returns {Promise<boolean>}
 */
async function validateFolderId(folderId) {
  const { drive } = await getDriveClient();

  try {
    const folder = await drive.files.get({
      fileId: folderId,
      fields: 'id, mimeType, name'
    });

    if (folder.data.mimeType !== 'application/vnd.google-apps.folder') {
      console.error(`エラー: ${folderId} はフォルダではありません（${folder.data.mimeType}）`);
      return false;
    }

    console.log(`フォルダ確認: ${folder.data.name}`);
    return true;
  } catch (error) {
    if (error.code === 404) {
      console.error(`エラー: フォルダ ${folderId} が見つかりません`);
    } else {
      console.error(`エラー: ${error.message}`);
    }
    return false;
  }
}

// CLIモードで実行
async function main() {
  const args = process.argv.slice(2);
  let formId = null;
  let folderId = null;

  // 引数パース
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--formId':
      case '-f':
        formId = args[++i];
        break;
      case '--folderId':
      case '-d':
        folderId = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
使用方法:
  node scripts/drive/move-to-folder.js --formId FORM_ID --folderId FOLDER_ID

オプション:
  --formId, -f    対象フォームID
  --folderId, -d  移動先フォルダID
  --help, -h      ヘルプを表示

フォルダIDの取得方法:
  1. Google Driveでフォルダを開く
  2. URLの最後の部分がフォルダID
     例: https://drive.google.com/drive/folders/[FOLDER_ID]
        `);
        process.exit(0);
    }
  }

  if (!formId || !folderId) {
    console.error('エラー: --formId と --folderId の両方を指定してください');
    process.exit(1);
  }

  try {
    // フォルダの存在確認
    const isValid = await validateFolderId(folderId);
    if (!isValid) {
      process.exit(1);
    }

    const result = await moveToFolder(formId, folderId);

    console.log('\n' + '='.repeat(50));
    console.log('フォルダ移動完了！');
    console.log('='.repeat(50));
    console.log(`フォーム: ${result.formName}`);
    console.log(`移動先: ${result.folderName}`);
    console.log('='.repeat(50));

    // JSON出力（パイプ用）
    if (process.stdout.isTTY === false) {
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('エラー:', error.message);
    process.exit(1);
  }
}

// モジュールとして使用可能
module.exports = { moveToFolder, validateFolderId };

// 直接実行時
if (require.main === module) {
  main();
}
