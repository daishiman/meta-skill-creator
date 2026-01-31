#!/usr/bin/env node

/**
 * フォーム公開設定スクリプト
 *
 * 使用方法:
 *   node scripts/forms/publish-form.js --formId FORM_ID
 *   node scripts/forms/publish-form.js --formId FORM_ID --unpublish
 *   node scripts/forms/publish-form.js --formId FORM_ID --close
 *
 * オプション:
 *   --formId, -f     対象フォームID
 *   --unpublish, -u  非公開にする
 *   --close, -c      回答受付を終了する（公開状態は維持）
 *   --open, -o       回答受付を再開する
 */

const { getFormsClient } = require('../auth/get-auth-client');
const { retryWithBackoff } = require('../utils/retry-with-backoff');

/**
 * フォームの公開設定を変更
 * @param {string} formId フォームID
 * @param {Object} options 設定オプション
 * @returns {Promise<Object>} 更新結果
 */
async function publishForm(formId, options = {}) {
  const { forms } = await getFormsClient();

  const {
    isPublished = true,
    isAcceptingResponses = true
  } = options;

  console.log(`フォーム ${formId} の公開設定を変更中...`);
  console.log(`  公開状態: ${isPublished ? '公開' : '非公開'}`);
  console.log(`  回答受付: ${isAcceptingResponses ? '受付中' : '終了'}`);

  await retryWithBackoff(async () => {
    return await forms.forms.setPublishSettings({
      formId,
      requestBody: {
        publishSettings: {
          publishState: {
            isPublished,
            isAcceptingResponses
          }
        }
      }
    });
  });

  console.log('✅ 公開設定を更新しました');

  // 現在の状態を取得
  const form = await forms.forms.get({ formId });

  return {
    success: true,
    formId,
    title: form.data.info.title,
    responderUri: form.data.responderUri,
    editUri: `https://docs.google.com/forms/d/${formId}/edit`,
    isPublished,
    isAcceptingResponses
  };
}

// CLIモードで実行
async function main() {
  const args = process.argv.slice(2);
  let formId = null;
  const options = {
    isPublished: true,
    isAcceptingResponses: true
  };

  // 引数パース
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--formId':
      case '-f':
        formId = args[++i];
        break;
      case '--unpublish':
      case '-u':
        options.isPublished = false;
        options.isAcceptingResponses = false;
        break;
      case '--close':
      case '-c':
        options.isAcceptingResponses = false;
        break;
      case '--open':
      case '-o':
        options.isPublished = true;
        options.isAcceptingResponses = true;
        break;
      case '--help':
      case '-h':
        console.log(`
使用方法:
  node scripts/forms/publish-form.js --formId FORM_ID
  node scripts/forms/publish-form.js --formId FORM_ID --unpublish
  node scripts/forms/publish-form.js --formId FORM_ID --close

オプション:
  --formId, -f     対象フォームID
  --unpublish, -u  非公開にする
  --close, -c      回答受付を終了する（公開状態は維持）
  --open, -o       回答受付を再開する
  --help, -h       ヘルプを表示

注意:
  2026年3月31日以降、APIで作成されたフォームはデフォルト非公開です。
  回答を受け付けるには、このスクリプトで明示的に公開設定が必要です。
        `);
        process.exit(0);
    }
  }

  if (!formId) {
    console.error('エラー: --formId を指定してください');
    process.exit(1);
  }

  try {
    const result = await publishForm(formId, options);

    console.log('\n' + '='.repeat(50));
    console.log('公開設定更新完了！');
    console.log('='.repeat(50));
    console.log(`タイトル: ${result.title}`);
    console.log(`公開状態: ${result.isPublished ? '公開' : '非公開'}`);
    console.log(`回答受付: ${result.isAcceptingResponses ? '受付中' : '終了'}`);
    if (result.isPublished && result.isAcceptingResponses) {
      console.log(`回答用URL: ${result.responderUri}`);
    }
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
module.exports = { publishForm };

// 直接実行時
if (require.main === module) {
  main();
}
