# OAuth 2.0 認証リファレンス

Google Forms/Drive/Sheets API認証の詳細手順。

---

## 概要

Google APIへのアクセスにはOAuth 2.0認証が必要。
本スキルではLoopback認証（localhost:3000）を使用。

---

## 前提条件

1. Google Cloud Consoleでプロジェクトを作成済み
2. OAuth 2.0クライアントID（デスクトップアプリ）を作成済み
3. 必要なAPIが有効化済み：
   - Google Forms API
   - Google Drive API
   - Google Sheets API

---

## 必要なスコープ

```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/forms.body',           // フォームの読み書き
  'https://www.googleapis.com/auth/forms.responses.readonly', // 回答の読み取り
  'https://www.googleapis.com/auth/drive',                // Drive操作
  'https://www.googleapis.com/auth/spreadsheets'          // Sheets操作
];
```

### スコープ詳細

| スコープ | 用途 |
|---------|------|
| `forms.body` | フォームの作成・編集・削除 |
| `forms.body.readonly` | フォームの読み取りのみ |
| `forms.responses.readonly` | 回答データの読み取り |
| `drive` | ファイル操作（フォルダ移動、共有設定） |
| `drive.file` | このアプリで作成したファイルのみ操作 |
| `spreadsheets` | スプレッドシートの読み書き |

---

## 環境変数の設定

### .env ファイル

```env
# Google OAuth 2.0 認証情報
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_REFRESH_TOKEN=1//xxxxxxxxxxxxx

# オプション: デフォルトの保存先フォルダID
DEFAULT_FOLDER_ID=

# オプション: リダイレクトURI
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

---

## 初回認証フロー

### 1. 認証URLの生成

```javascript
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'  // refresh_tokenを確実に取得
});

console.log('以下のURLにアクセスして認証してください:');
console.log(authUrl);
```

### 2. コールバックサーバーの起動

```javascript
const http = require('http');
const url = require('url');

const server = http.createServer(async (req, res) => {
  const queryParams = url.parse(req.url, true).query;

  if (queryParams.code) {
    // 認証コードをトークンに交換
    const { tokens } = await oauth2Client.getToken(queryParams.code);

    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Access Token:', tokens.access_token);

    res.end('認証が完了しました。このウィンドウを閉じてください。');
    server.close();
  }
});

server.listen(3000, () => {
  console.log('認証サーバーを起動しました: http://localhost:3000');
});
```

### 3. Refresh Tokenの保存

取得した`refresh_token`を`.env`ファイルに保存。

```env
GOOGLE_REFRESH_TOKEN=1//0exxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 認証クライアントの取得

### scripts/auth/get-auth-client.js

```javascript
const { google } = require('googleapis');
require('dotenv').config();

async function getAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
  );

  // Refresh Tokenを設定
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  // Access Tokenを自動取得（期限切れの場合は自動更新）
  await oauth2Client.getAccessToken();

  return oauth2Client;
}

module.exports = { getAuthClient };
```

### 使用例

```javascript
const { getAuthClient } = require('./scripts/auth/get-auth-client');
const { google } = require('googleapis');

async function main() {
  const auth = await getAuthClient();

  const forms = google.forms({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // API操作...
}
```

---

## トークンの自動更新

OAuth2Clientは自動的にAccess Tokenを更新：

```javascript
oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    // 新しいRefresh Tokenが発行された場合
    console.log('New Refresh Token:', tokens.refresh_token);
    // .envを更新するか、安全な場所に保存
  }
});
```

---

## 認証エラーの処理

### エラーコード

| コード | 説明 | 対処法 |
|--------|------|--------|
| 401 | 認証エラー | トークンを再取得 |
| 403 | スコープ不足 | 必要なスコープで再認証 |
| invalid_grant | Refresh Token無効 | 初回認証をやり直す |

### エラーハンドリング

```javascript
async function safeApiCall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.code === 401 || error.message.includes('invalid_grant')) {
      console.error('認証エラー: トークンの再取得が必要です');
      console.error('scripts/auth/setup-oauth.js を実行してください');
      process.exit(1);
    }
    throw error;
  }
}
```

---

## セキュリティベストプラクティス

### 1. .env ファイルの保護

```gitignore
# .gitignore
.env
.env.*
!.env.example
```

### 2. 最小限のスコープを使用

```javascript
// 読み取りのみの場合
const READONLY_SCOPES = [
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly'
];
```

### 3. 定期的なトークンローテーション

- 不要になったトークンは[Google Account Security](https://myaccount.google.com/permissions)で取り消し
- 定期的に新しいトークンを発行

### 4. 環境変数の検証

```javascript
function validateEnv() {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('必要な環境変数が設定されていません:', missing.join(', '));
    console.error('.env.example を参考に .env ファイルを作成してください');
    process.exit(1);
  }
}
```

---

## トラブルシューティング

### "invalid_grant" エラー

**原因**:
- Refresh Tokenの有効期限切れ
- Refresh Tokenが取り消された
- Google Cloud Consoleでアプリが「テスト中」のまま

**解決策**:
1. 初回認証をやり直す
2. `prompt: 'consent'`を指定して新しいRefresh Tokenを取得

### "insufficient_scope" エラー

**原因**:
- 必要なスコープで認証していない

**解決策**:
1. 必要なスコープをすべて含めて再認証
2. `prompt: 'consent'`で強制的にスコープ選択画面を表示

### テスト中のアプリでRefresh Tokenが7日で期限切れ

**原因**:
- Google Cloud Consoleでアプリが「テスト中」ステータス

**解決策**:
1. OAuth同意画面を「本番環境」に公開
2. または7日ごとに再認証
