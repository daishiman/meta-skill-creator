# Google Sheets連携リファレンス

Google Forms回答データのSpreadsheet連携に関する詳細仕様。

---

## 重要な制限事項

### linkedSheetId は読み取り専用

```javascript
// forms.get で取得可能だが、APIで設定することはできない
const form = await forms.forms.get({ formId });
console.log(form.data.linkedSheetId);  // 読み取りのみ
```

**スプレッドシートとのリンク設定はGoogle Forms UIからのみ可能。**

---

## 代替アプローチ

### 方法1: UIでリンク設定を案内

```markdown
## スプレッドシート連携の設定方法

1. [編集画面を開く](https://docs.google.com/forms/d/{formId}/edit)
2. 「回答」タブをクリック
3. スプレッドシートアイコンをクリック
4. 「新しいスプレッドシートを作成」または「既存のスプレッドシートを選択」
```

### 方法2: responses.list で回答を取得→Sheetsに書き込み

```javascript
const { google } = require('googleapis');

async function syncResponsesToSheet(auth, formId, spreadsheetId) {
  const forms = google.forms({ version: 'v1', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. 回答を取得
  const responses = await forms.forms.responses.list({ formId });

  // 2. フォーム構造を取得（ヘッダー用）
  const form = await forms.forms.get({ formId });
  const questions = form.data.items
    .filter(item => item.questionItem)
    .map(item => ({
      id: item.questionItem.question.questionId,
      title: item.title
    }));

  // 3. ヘッダー行を作成
  const headers = ['タイムスタンプ', 'メールアドレス', ...questions.map(q => q.title)];

  // 4. データ行を作成
  const rows = responses.data.responses?.map(response => {
    const row = [
      response.lastSubmittedTime,
      response.respondentEmail || ''
    ];

    questions.forEach(q => {
      const answer = response.answers?.[q.id];
      if (answer?.textAnswers) {
        row.push(answer.textAnswers.answers.map(a => a.value).join(', '));
      } else {
        row.push('');
      }
    });

    return row;
  }) || [];

  // 5. スプレッドシートに書き込み
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [headers, ...rows]
    }
  });

  return { rowCount: rows.length };
}
```

---

## 回答データの取得

### responses.list

```javascript
const forms = google.forms({ version: 'v1', auth });

// 全回答を取得
const allResponses = await forms.forms.responses.list({
  formId,
  pageSize: 5000  // 最大5000件/ページ
});

// ページネーション
let pageToken = null;
const allData = [];

do {
  const response = await forms.forms.responses.list({
    formId,
    pageSize: 1000,
    pageToken
  });

  allData.push(...(response.data.responses || []));
  pageToken = response.data.nextPageToken;
} while (pageToken);
```

### フィルター付き取得

```javascript
// 特定日時以降の回答のみ
const response = await forms.forms.responses.list({
  formId,
  filter: 'timestamp >= 2024-01-01T00:00:00Z'
});

// 特定日時範囲
const response = await forms.forms.responses.list({
  formId,
  filter: 'timestamp >= 2024-01-01T00:00:00Z AND timestamp < 2024-02-01T00:00:00Z'
});
```

---

## 回答データの構造

### レスポンス例

```json
{
  "responses": [
    {
      "responseId": "ACYDBNhxxxxxx",
      "createTime": "2024-01-15T10:30:00.000Z",
      "lastSubmittedTime": "2024-01-15T10:35:00.000Z",
      "respondentEmail": "user@example.com",
      "totalScore": 80,
      "answers": {
        "questionId1": {
          "questionId": "questionId1",
          "textAnswers": {
            "answers": [{ "value": "回答テキスト" }]
          }
        },
        "questionId2": {
          "questionId": "questionId2",
          "textAnswers": {
            "answers": [
              { "value": "選択肢1" },
              { "value": "選択肢2" }
            ]
          }
        },
        "questionId3": {
          "questionId": "questionId3",
          "grade": {
            "score": 10,
            "correct": true
          },
          "textAnswers": {
            "answers": [{ "value": "正解の選択肢" }]
          }
        }
      }
    }
  ],
  "nextPageToken": "..."
}
```

### 回答タイプ別の構造

#### テキスト回答

```json
{
  "textAnswers": {
    "answers": [{ "value": "回答テキスト" }]
  }
}
```

#### 複数選択（CHECKBOX）

```json
{
  "textAnswers": {
    "answers": [
      { "value": "選択肢1" },
      { "value": "選択肢3" }
    ]
  }
}
```

#### グリッド回答

```json
{
  "textAnswers": {
    "answers": [
      { "value": "列1の選択" },
      { "value": "列2の選択" }
    ]
  }
}
```

#### ファイルアップロード（UI作成のみ）

```json
{
  "fileUploadAnswers": {
    "answers": [
      {
        "fileId": "1BxiMVs...",
        "fileName": "document.pdf",
        "mimeType": "application/pdf"
      }
    ]
  }
}
```

---

## Sheets API での書き込み

### 認証スコープ

```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/spreadsheets'
];
```

### 新規スプレッドシート作成

```javascript
const sheets = google.sheets({ version: 'v4', auth });

const spreadsheet = await sheets.spreadsheets.create({
  requestBody: {
    properties: {
      title: 'フォーム回答データ'
    }
  }
});

const spreadsheetId = spreadsheet.data.spreadsheetId;
```

### データ書き込み

```javascript
await sheets.spreadsheets.values.update({
  spreadsheetId,
  range: 'Sheet1!A1',
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [
      ['ヘッダー1', 'ヘッダー2', 'ヘッダー3'],
      ['データ1', 'データ2', 'データ3'],
      ['データ4', 'データ5', 'データ6']
    ]
  }
});
```

### データ追記

```javascript
await sheets.spreadsheets.values.append({
  spreadsheetId,
  range: 'Sheet1!A1',
  valueInputOption: 'USER_ENTERED',
  insertDataOption: 'INSERT_ROWS',
  requestBody: {
    values: [
      ['新しいデータ1', '新しいデータ2', '新しいデータ3']
    ]
  }
});
```

---

## 増分同期の実装

### 最終同期時刻を記録

```javascript
async function incrementalSync(auth, formId, spreadsheetId, lastSyncTime) {
  const forms = google.forms({ version: 'v1', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // 前回同期以降の回答のみ取得
  const filter = lastSyncTime
    ? `timestamp > ${lastSyncTime}`
    : undefined;

  const responses = await forms.forms.responses.list({
    formId,
    filter
  });

  if (!responses.data.responses?.length) {
    return { newRows: 0 };
  }

  // 新しい回答を追記
  const newRows = responses.data.responses.map(r => formatResponseRow(r));

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: newRows }
  });

  return {
    newRows: newRows.length,
    lastSyncTime: new Date().toISOString()
  };
}
```

---

## Watches + Pub/Sub による自動同期

### 概要

```
フォームに新しい回答
    ↓
Watches が検知
    ↓
Pub/Sub にメッセージ送信
    ↓
Cloud Functions がトリガー
    ↓
Sheets に書き込み
```

### Watch の設定

```javascript
const watch = await forms.forms.watches.create({
  formId,
  requestBody: {
    watch: {
      target: {
        topic: {
          topicName: 'projects/your-project/topics/form-responses'
        }
      },
      eventType: 'RESPONSES'
    }
  }
});
```

### 注意事項

- Watchの有効期限は最大7日間
- 定期的な更新（renew）が必要
- フォームあたり20件、プロジェクトあたり2,500件の制限

---

## ベストプラクティス

### 1. 回答取得時のエラーハンドリング

```javascript
async function safeGetResponses(forms, formId) {
  try {
    const responses = await forms.forms.responses.list({ formId });
    return responses.data.responses || [];
  } catch (error) {
    if (error.code === 404) {
      console.error('Form not found');
      return [];
    }
    throw error;
  }
}
```

### 2. 大量データの分割処理

```javascript
const BATCH_SIZE = 100;

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: batch }
  });
}
```

### 3. 列のマッピングを動的に

```javascript
function buildHeaderMapping(form) {
  const mapping = new Map();
  let colIndex = 2;  // A=タイムスタンプ, B=メール

  form.items.forEach(item => {
    if (item.questionItem) {
      mapping.set(item.questionItem.question.questionId, {
        column: colIndex++,
        title: item.title
      });
    }
  });

  return mapping;
}
```
