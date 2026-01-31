#!/usr/bin/env node

/**
 * 回答データ取得スクリプト
 *
 * 使用方法:
 *   node scripts/sheets/get-responses.js --formId FORM_ID
 *   node scripts/sheets/get-responses.js --formId FORM_ID --output responses.json
 *   node scripts/sheets/get-responses.js --formId FORM_ID --spreadsheetId SHEET_ID
 *
 * オプション:
 *   --formId, -f        対象フォームID
 *   --output, -o        出力ファイルパス（JSON）
 *   --spreadsheetId, -s スプレッドシートに出力
 *   --since             指定日時以降の回答のみ（ISO8601形式）
 *   --csv               CSV形式で出力
 */

const { getFormsClient, getSheetsClient } = require('../auth/get-auth-client');
const fs = require('fs');

/**
 * フォームの回答データを取得
 * @param {string} formId フォームID
 * @param {Object} options オプション
 * @returns {Promise<Object>} 回答データ
 */
async function getResponses(formId, options = {}) {
  const { forms } = await getFormsClient();

  console.log(`フォーム ${formId} の回答を取得中...`);

  // フォーム構造を取得（ヘッダー用）
  const form = await forms.forms.get({ formId });
  const questions = form.data.items
    .filter(item => item.questionItem)
    .map(item => ({
      id: item.questionItem.question.questionId,
      title: item.title
    }));

  // 回答を取得
  const allResponses = [];
  let pageToken = null;

  do {
    const params = {
      formId,
      pageSize: 5000,
      pageToken
    };

    // フィルター（日時指定）
    if (options.since) {
      params.filter = `timestamp >= ${options.since}`;
    }

    const response = await forms.forms.responses.list(params);
    allResponses.push(...(response.data.responses || []));
    pageToken = response.data.nextPageToken;

    console.log(`  ${allResponses.length}件取得...`);
  } while (pageToken);

  console.log(`✅ 合計 ${allResponses.length} 件の回答を取得`);

  return {
    formId,
    formTitle: form.data.info.title,
    questions,
    responses: allResponses,
    totalCount: allResponses.length
  };
}

/**
 * 回答データをスプレッドシートに書き込み
 * @param {Object} data 回答データ
 * @param {string} spreadsheetId スプレッドシートID
 */
async function writeToSpreadsheet(data, spreadsheetId) {
  const { sheets } = await getSheetsClient();

  console.log(`スプレッドシート ${spreadsheetId} に書き込み中...`);

  // ヘッダー行
  const headers = ['タイムスタンプ', 'メールアドレス', ...data.questions.map(q => q.title)];

  // データ行
  const rows = data.responses.map(response => {
    const row = [
      response.lastSubmittedTime || response.createTime,
      response.respondentEmail || ''
    ];

    data.questions.forEach(q => {
      const answer = response.answers?.[q.id];
      if (answer?.textAnswers) {
        row.push(answer.textAnswers.answers.map(a => a.value).join(', '));
      } else if (answer?.fileUploadAnswers) {
        row.push(answer.fileUploadAnswers.answers.map(a => a.fileName).join(', '));
      } else {
        row.push('');
      }
    });

    return row;
  });

  // 書き込み
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [headers, ...rows]
    }
  });

  console.log(`✅ ${rows.length} 件をスプレッドシートに書き込みました`);

  return {
    spreadsheetId,
    rowCount: rows.length,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };
}

/**
 * 回答データをCSV形式に変換
 * @param {Object} data 回答データ
 * @returns {string} CSV文字列
 */
function toCSV(data) {
  const headers = ['タイムスタンプ', 'メールアドレス', ...data.questions.map(q => q.title)];

  const rows = data.responses.map(response => {
    const row = [
      response.lastSubmittedTime || response.createTime,
      response.respondentEmail || ''
    ];

    data.questions.forEach(q => {
      const answer = response.answers?.[q.id];
      if (answer?.textAnswers) {
        row.push(answer.textAnswers.answers.map(a => a.value).join('; '));
      } else {
        row.push('');
      }
    });

    return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
}

// CLIモードで実行
async function main() {
  const args = process.argv.slice(2);
  let formId = null;
  let outputPath = null;
  let spreadsheetId = null;
  let since = null;
  let csvMode = false;

  // 引数パース
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--formId':
      case '-f':
        formId = args[++i];
        break;
      case '--output':
      case '-o':
        outputPath = args[++i];
        break;
      case '--spreadsheetId':
      case '-s':
        spreadsheetId = args[++i];
        break;
      case '--since':
        since = args[++i];
        break;
      case '--csv':
        csvMode = true;
        break;
      case '--help':
      case '-h':
        console.log(`
使用方法:
  node scripts/sheets/get-responses.js --formId FORM_ID
  node scripts/sheets/get-responses.js --formId FORM_ID --output responses.json
  node scripts/sheets/get-responses.js --formId FORM_ID --spreadsheetId SHEET_ID

オプション:
  --formId, -f        対象フォームID
  --output, -o        出力ファイルパス（JSON）
  --spreadsheetId, -s スプレッドシートに出力
  --since             指定日時以降の回答のみ（ISO8601形式）
  --csv               CSV形式で出力
  --help, -h          ヘルプを表示

例:
  # 全回答をJSON出力
  node scripts/sheets/get-responses.js -f FORM_ID -o responses.json

  # 2024年1月以降の回答をスプレッドシートに出力
  node scripts/sheets/get-responses.js -f FORM_ID -s SHEET_ID --since 2024-01-01T00:00:00Z

  # CSV形式で出力
  node scripts/sheets/get-responses.js -f FORM_ID --csv -o responses.csv
        `);
        process.exit(0);
    }
  }

  if (!formId) {
    console.error('エラー: --formId を指定してください');
    process.exit(1);
  }

  try {
    const data = await getResponses(formId, { since });

    // スプレッドシートに出力
    if (spreadsheetId) {
      const result = await writeToSpreadsheet(data, spreadsheetId);
      console.log(`スプレッドシートURL: ${result.url}`);
    }

    // ファイルに出力
    if (outputPath) {
      const content = csvMode ? toCSV(data) : JSON.stringify(data, null, 2);
      fs.writeFileSync(outputPath, content);
      console.log(`✅ ${outputPath} に出力しました`);
    }

    // コンソールに出力（ファイル指定なしの場合）
    if (!outputPath && !spreadsheetId) {
      if (csvMode) {
        console.log('\n' + toCSV(data));
      } else {
        console.log('\n' + JSON.stringify(data, null, 2));
      }
    }

  } catch (error) {
    console.error('エラー:', error.message);
    process.exit(1);
  }
}

// モジュールとして使用可能
module.exports = { getResponses, writeToSpreadsheet, toCSV };

// 直接実行時
if (require.main === module) {
  main();
}
