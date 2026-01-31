#!/usr/bin/env node

/**
 * フォーム回答をスプレッドシートにエクスポート
 *
 * 使用方法:
 *   node scripts/sheets/export-to-sheet.js --formId <formId> [options]
 *
 * オプション:
 *   --formId <id>          対象フォームID（必須）
 *   --spreadsheetId <id>   出力先スプレッドシートID（省略時は新規作成）
 *   --sheetName <name>     シート名（デフォルト: "Form Responses"）
 *   --includeHeaders       ヘッダー行を含める（デフォルト: true）
 *
 * 注意:
 *   linkedSheetId はAPIで読み取り専用のため、このスクリプトは
 *   responses.list で回答を取得し、Sheets API で書き込みます。
 */

const { google } = require('googleapis');
const path = require('path');

// .env ファイルをスキルディレクトリから読み込む
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const { getAllClients } = require('../auth/get-auth-client');
const { retryWithBackoff } = require('../utils/retry-with-backoff');

/**
 * 引数をパース
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    sheetName: 'Form Responses',
    includeHeaders: true
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--formId':
        options.formId = args[++i];
        break;
      case '--spreadsheetId':
        options.spreadsheetId = args[++i];
        break;
      case '--sheetName':
        options.sheetName = args[++i];
        break;
      case '--no-headers':
        options.includeHeaders = false;
        break;
      case '--help':
        showHelp();
        process.exit(0);
    }
  }

  return options;
}

function showHelp() {
  console.log(`
フォーム回答をスプレッドシートにエクスポート

使用方法:
  node export-to-sheet.js --formId <formId> [options]

必須オプション:
  --formId <id>          対象フォームID

追加オプション:
  --spreadsheetId <id>   出力先スプレッドシートID（省略時は新規作成）
  --sheetName <name>     シート名（デフォルト: "Form Responses"）
  --no-headers           ヘッダー行を含めない

例:
  # 新規スプレッドシートを作成してエクスポート
  node export-to-sheet.js --formId 1BxiMVs...

  # 既存スプレッドシートにエクスポート
  node export-to-sheet.js --formId 1BxiMVs... --spreadsheetId 1AbCdEf...

注意:
  Google Forms API の linkedSheetId は読み取り専用のため、
  このスクリプトは responses.list で回答を取得し、
  Sheets API で書き込みます。
`);
}

/**
 * フォームから質問一覧を取得
 */
async function getFormQuestions(forms, formId) {
  const formData = await forms.forms.get({ formId });
  const questions = [];

  if (formData.data.items) {
    for (const item of formData.data.items) {
      if (item.questionItem) {
        questions.push({
          questionId: item.questionItem.question.questionId,
          title: item.title
        });
      } else if (item.questionGroupItem) {
        // グリッド質問
        for (const q of item.questionGroupItem.questions) {
          questions.push({
            questionId: q.questionId,
            title: `${item.title} - ${q.rowQuestion.title}`
          });
        }
      }
    }
  }

  return questions;
}

/**
 * 全回答を取得
 */
async function getAllResponses(forms, formId) {
  const allResponses = [];
  let pageToken = null;

  do {
    const result = await retryWithBackoff(async () => {
      return await forms.forms.responses.list({
        formId,
        pageSize: 5000,
        pageToken
      });
    });

    if (result.data.responses) {
      allResponses.push(...result.data.responses);
    }

    pageToken = result.data.nextPageToken;
  } while (pageToken);

  return allResponses;
}

/**
 * 新規スプレッドシートを作成
 */
async function createSpreadsheet(sheets, title) {
  const result = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [{ properties: { title: 'Form Responses' } }]
    }
  });

  return result.data.spreadsheetId;
}

/**
 * 回答をスプレッドシートに書き込み
 */
async function writeToSheet(sheets, spreadsheetId, sheetName, headers, rows) {
  const values = [headers, ...rows];

  await retryWithBackoff(async () => {
    return await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
  });

  return values.length;
}

/**
 * メイン処理
 */
async function exportToSheet(options) {
  if (!options.formId) {
    console.error('エラー: --formId は必須です');
    showHelp();
    process.exit(1);
  }

  const { forms, sheets } = await getAllClients();

  console.log('フォーム回答をエクスポート中...\n');

  // 1. フォーム情報を取得
  console.log('1. フォーム情報を取得中...');
  const formData = await forms.forms.get({ formId: options.formId });
  const formTitle = formData.data.info.title;
  console.log(`   タイトル: ${formTitle}`);

  // 2. 質問一覧を取得
  console.log('2. 質問一覧を取得中...');
  const questions = await getFormQuestions(forms, options.formId);
  console.log(`   質問数: ${questions.length}`);

  // 3. 回答を取得
  console.log('3. 回答を取得中...');
  const responses = await getAllResponses(forms, options.formId);
  console.log(`   回答数: ${responses.length}`);

  if (responses.length === 0) {
    console.log('\n回答がありません。エクスポートをスキップします。');
    return { success: true, rowCount: 0 };
  }

  // 4. スプレッドシートを準備
  let spreadsheetId = options.spreadsheetId;
  if (!spreadsheetId) {
    console.log('4. 新規スプレッドシートを作成中...');
    spreadsheetId = await createSpreadsheet(sheets, `${formTitle} - Responses`);
    console.log(`   作成完了: ${spreadsheetId}`);
  } else {
    console.log(`4. 既存スプレッドシートを使用: ${spreadsheetId}`);
  }

  // 5. ヘッダーと行データを構築
  console.log('5. データを整形中...');
  const headers = ['タイムスタンプ', 'メールアドレス', ...questions.map(q => q.title)];

  const rows = responses.map(response => {
    const row = [
      new Date(response.lastSubmittedTime).toLocaleString('ja-JP'),
      response.respondentEmail || ''
    ];

    for (const q of questions) {
      const answer = response.answers?.[q.questionId];
      if (answer) {
        if (answer.textAnswers) {
          row.push(answer.textAnswers.answers.map(a => a.value).join(', '));
        } else if (answer.fileUploadAnswers) {
          row.push(answer.fileUploadAnswers.answers.map(a => a.fileId).join(', '));
        } else {
          row.push('');
        }
      } else {
        row.push('');
      }
    }

    return row;
  });

  // 6. スプレッドシートに書き込み
  console.log('6. スプレッドシートに書き込み中...');
  const rowCount = await writeToSheet(
    sheets,
    spreadsheetId,
    options.sheetName,
    options.includeHeaders ? headers : [],
    options.includeHeaders ? rows : [headers, ...rows].slice(1)
  );

  console.log('\n✅ エクスポート完了\n');
  console.log('='.repeat(50));
  console.log(`フォーム: ${formTitle}`);
  console.log(`回答数: ${responses.length}`);
  console.log(`スプレッドシートID: ${spreadsheetId}`);
  console.log(`URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
  console.log('='.repeat(50));

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    rowCount: responses.length
  };
}

// メイン実行
if (require.main === module) {
  const options = parseArgs();
  exportToSheet(options).then(result => {
    if (result.success) {
      console.log(JSON.stringify(result, null, 2));
    }
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('エラー:', error.message);
    process.exit(1);
  });
}

module.exports = { exportToSheet };
