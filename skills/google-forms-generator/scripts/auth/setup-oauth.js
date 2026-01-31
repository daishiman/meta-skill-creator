#!/usr/bin/env node

/**
 * OAuth 2.0 初回認証セットアップスクリプト
 *
 * 使用方法:
 *   node scripts/auth/setup-oauth.js
 *
 * 前提条件:
 *   1. .env に GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET が設定済み
 *   2. Google Cloud Console で OAuth 同意画面が設定済み
 */

const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const path = require('path');
const open = require('open').default || require('open');

// .env ファイルをスキルディレクトリから読み込む
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const SCOPES = [
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets'
];

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
const PORT = parseInt(new URL(REDIRECT_URI).port) || 3000;

async function main() {
  // 環境変数の検証
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('エラー: .env ファイルに以下の環境変数を設定してください:');
    console.error('  - GOOGLE_CLIENT_ID');
    console.error('  - GOOGLE_CLIENT_SECRET');
    console.error(`\n.env ファイルの場所: ${envPath}`);
    console.error('.env.example を参考にしてください。');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  // 認証URLを生成
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // 確実にrefresh_tokenを取得
  });

  console.log('OAuth 2.0 認証セットアップ');
  console.log('='.repeat(50));
  console.log('\n以下のURLをブラウザで開いて認証してください:\n');
  console.log(authUrl);
  console.log('\n認証完了後、このターミナルに戻ってきてください。');
  console.log('='.repeat(50));

  // 自動でブラウザを開く（オプション）
  try {
    await open(authUrl);
    console.log('\nブラウザを自動で開きました。');
  } catch (e) {
    console.log('\nブラウザを手動で開いてください。');
  }

  // コールバックサーバーを起動
  const server = http.createServer(async (req, res) => {
    const queryParams = url.parse(req.url, true).query;

    if (queryParams.error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>認証エラー</h1><p>${queryParams.error}</p>`);
      server.close();
      process.exit(1);
    }

    if (queryParams.code) {
      try {
        // 認証コードをトークンに交換
        const { tokens } = await oauth2Client.getToken(queryParams.code);

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
          <head><title>認証完了</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1>✅ 認証が完了しました！</h1>
            <p>このウィンドウを閉じて、ターミナルを確認してください。</p>
          </body>
          </html>
        `);

        console.log('\n' + '='.repeat(50));
        console.log('✅ 認証成功！');
        console.log('='.repeat(50));
        console.log(`\n以下の Refresh Token を .env ファイルに追加してください:`);
        console.log(`(.env の場所: ${envPath})\n`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\n' + '='.repeat(50));

        if (tokens.access_token) {
          console.log('\n[参考] Access Token (自動更新されるため保存不要):');
          console.log(tokens.access_token.substring(0, 50) + '...');
        }

        server.close();
        process.exit(0);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>トークン取得エラー</h1><pre>${error.message}</pre>`);
        console.error('トークン取得エラー:', error.message);
        server.close();
        process.exit(1);
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    console.log(`\nコールバックサーバーを起動しました: http://localhost:${PORT}`);
    console.log('認証を待機中...\n');
  });

  // タイムアウト設定（5分）
  setTimeout(() => {
    console.error('\nタイムアウト: 5分以内に認証が完了しませんでした。');
    server.close();
    process.exit(1);
  }, 5 * 60 * 1000);
}

main().catch(console.error);
