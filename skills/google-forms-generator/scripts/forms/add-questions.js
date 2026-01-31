#!/usr/bin/env node

/**
 * 質問追加スクリプト（batchUpdate）
 *
 * 使用方法:
 *   node scripts/forms/add-questions.js --formId FORM_ID --requests ./requests.json
 *
 * オプション:
 *   --formId, -f     対象フォームID
 *   --requests, -r   リクエストJSONファイルパス
 *   --stdin          標準入力からJSON読み込み
 */

const { getFormsClient } = require('../auth/get-auth-client');
const { retryWithBackoff } = require('../utils/retry-with-backoff');
const fs = require('fs');

/**
 * フォームに質問・設定を追加
 * @param {string} formId フォームID
 * @param {Array} requests batchUpdateリクエスト配列
 * @returns {Promise<Object>} 更新結果
 */
async function addQuestions(formId, requests) {
  const { forms } = await getFormsClient();

  console.log(`フォーム ${formId} に ${requests.length} 件のリクエストを適用中...`);

  const response = await retryWithBackoff(async () => {
    return await forms.forms.batchUpdate({
      formId,
      requestBody: {
        requests,
        includeFormInResponse: true
      }
    });
  });

  const replies = response.data.replies || [];
  const errors = replies.filter(r => r.error);

  if (errors.length > 0) {
    console.error('一部のリクエストでエラーが発生しました:');
    errors.forEach((e, i) => {
      console.error(`  [${i}] ${JSON.stringify(e.error)}`);
    });
  }

  const successCount = replies.length - errors.length;
  console.log(`✅ ${successCount}/${requests.length} 件のリクエストが成功`);

  return {
    success: errors.length === 0,
    form: response.data.form,
    replies,
    errors
  };
}

// CLIモードで実行
async function main() {
  const args = process.argv.slice(2);
  let formId = null;
  let requestsPath = null;
  let useStdin = false;

  // 引数パース
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--formId':
      case '-f':
        formId = args[++i];
        break;
      case '--requests':
      case '-r':
        requestsPath = args[++i];
        break;
      case '--stdin':
        useStdin = true;
        break;
      case '--help':
      case '-h':
        console.log(`
使用方法:
  node scripts/forms/add-questions.js --formId FORM_ID --requests ./requests.json
  cat requests.json | node scripts/forms/add-questions.js --formId FORM_ID --stdin

オプション:
  --formId, -f     対象フォームID
  --requests, -r   リクエストJSONファイルパス
  --stdin          標準入力からJSON読み込み
  --help, -h       ヘルプを表示
        `);
        process.exit(0);
    }
  }

  if (!formId) {
    console.error('エラー: --formId を指定してください');
    process.exit(1);
  }

  let requests;

  if (useStdin) {
    // 標準入力から読み込み
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks).toString('utf-8');
    requests = JSON.parse(data);
  } else if (requestsPath) {
    // ファイルから読み込み
    requests = JSON.parse(fs.readFileSync(requestsPath, 'utf-8'));
  } else {
    console.error('エラー: --requests または --stdin を指定してください');
    process.exit(1);
  }

  // requestsが配列でない場合の対応
  if (!Array.isArray(requests)) {
    requests = requests.requests || requests.batchUpdateRequests || [requests];
  }

  try {
    const result = await addQuestions(formId, requests);

    if (result.success) {
      console.log('\n✅ 全てのリクエストが正常に適用されました');
    } else {
      console.log('\n⚠️ 一部のリクエストでエラーが発生しました');
      process.exit(1);
    }

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
module.exports = { addQuestions };

// 直接実行時
if (require.main === module) {
  main();
}
