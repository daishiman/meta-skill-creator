#!/usr/bin/env node

/**
 * フォーム作成スクリプト
 *
 * 使用方法:
 *   node scripts/forms/create-form.js --title "フォームタイトル"
 *   node scripts/forms/create-form.js --config ./form-config.json
 *
 * オプション:
 *   --title, -t    フォームタイトル
 *   --config, -c   設定JSONファイルパス
 *   --publish, -p  作成後に公開する
 *   --folder, -f   保存先フォルダID
 */

const { getFormsClient, getDriveClient } = require('../auth/get-auth-client');
const { retryWithBackoff } = require('../utils/retry-with-backoff');
const fs = require('fs');

async function createForm(options) {
  const { forms } = await getFormsClient();

  // 1. フォーム作成（タイトルのみ）
  console.log('フォームを作成中...');
  const createRes = await retryWithBackoff(async () => {
    return await forms.forms.create({
      requestBody: {
        info: { title: options.title }
      }
    });
  });

  const formId = createRes.data.formId;
  const responderUri = createRes.data.responderUri;

  console.log(`✅ フォーム作成完了: ${formId}`);

  // 2. 質問・設定の追加（batchUpdate）
  if (options.requests && options.requests.length > 0) {
    console.log('質問と設定を追加中...');
    await retryWithBackoff(async () => {
      return await forms.forms.batchUpdate({
        formId,
        requestBody: {
          requests: options.requests,
          includeFormInResponse: true
        }
      });
    });
    console.log(`✅ ${options.requests.length}件のリクエストを適用`);
  }

  // 3. 公開設定
  if (options.publish) {
    console.log('フォームを公開中...');
    await retryWithBackoff(async () => {
      return await forms.forms.setPublishSettings({
        formId,
        requestBody: {
          publishSettings: {
            publishState: {
              isPublished: true,
              isAcceptingResponses: true
            }
          }
        }
      });
    });
    console.log('✅ フォームを公開しました');
  }

  // 4. フォルダ移動
  if (options.folderId) {
    console.log('フォルダに移動中...');
    const { drive } = await getDriveClient();

    const file = await drive.files.get({
      fileId: formId,
      fields: 'parents'
    });

    await retryWithBackoff(async () => {
      return await drive.files.update({
        fileId: formId,
        addParents: options.folderId,
        removeParents: (file.data.parents || []).join(',')
      });
    });
    console.log(`✅ フォルダに移動: ${options.folderId}`);
  }

  // 5. 最終結果を取得
  const finalForm = await forms.forms.get({ formId });

  return {
    success: true,
    formId,
    responderUri,
    editUri: `https://docs.google.com/forms/d/${formId}/edit`,
    linkedSheetId: finalForm.data.linkedSheetId || null,
    title: finalForm.data.info.title
  };
}

// CLIモードで実行
async function main() {
  const args = process.argv.slice(2);
  const options = {
    title: '',
    requests: [],
    publish: false,
    folderId: null
  };

  // 引数パース
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--title':
      case '-t':
        options.title = args[++i];
        break;
      case '--config':
      case '-c':
        const configPath = args[++i];
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        options.title = config.createRequest?.info?.title || config.title;
        options.requests = config.batchUpdateRequests || config.requests || [];
        options.publish = config.publishRequest?.publishSettings?.publishState?.isPublished ?? false;
        options.folderId = config.driveRequest?.folderId || null;
        break;
      case '--publish':
      case '-p':
        options.publish = true;
        break;
      case '--folder':
      case '-f':
        options.folderId = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
使用方法:
  node scripts/forms/create-form.js --title "フォームタイトル"
  node scripts/forms/create-form.js --config ./form-config.json

オプション:
  --title, -t    フォームタイトル
  --config, -c   設定JSONファイルパス
  --publish, -p  作成後に公開する
  --folder, -f   保存先フォルダID
  --help, -h     ヘルプを表示
        `);
        process.exit(0);
    }
  }

  if (!options.title) {
    console.error('エラー: --title または --config を指定してください');
    process.exit(1);
  }

  try {
    const result = await createForm(options);
    console.log('\n' + '='.repeat(50));
    console.log('フォーム作成完了！');
    console.log('='.repeat(50));
    console.log(`タイトル: ${result.title}`);
    console.log(`フォームID: ${result.formId}`);
    console.log(`回答用URL: ${result.responderUri}`);
    console.log(`編集用URL: ${result.editUri}`);
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
module.exports = { createForm };

// 直接実行時
if (require.main === module) {
  main();
}
