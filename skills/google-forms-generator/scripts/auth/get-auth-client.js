/**
 * 認証クライアント取得モジュール
 *
 * 使用方法:
 *   const { getAuthClient } = require('./scripts/auth/get-auth-client');
 *   const auth = await getAuthClient();
 */

const { google } = require('googleapis');
const path = require('path');

// .env ファイルをスキルディレクトリから読み込む
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

/**
 * 環境変数を検証
 */
function validateEnv() {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `必要な環境変数が設定されていません: ${missing.join(', ')}\n` +
      `.env ファイルの場所: ${envPath}\n` +
      '.env.example を参考に .env ファイルを作成してください。\n' +
      '初回認証は scripts/auth/setup-oauth.js を実行してください。'
    );
  }
}

/**
 * 認証済みのOAuth2クライアントを取得
 * @returns {Promise<google.auth.OAuth2>} 認証済みクライアント
 */
async function getAuthClient() {
  validateEnv();

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
  );

  // Refresh Tokenを設定
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  // トークン更新イベントをリッスン（デバッグ用）
  oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      console.warn(
        '警告: 新しい Refresh Token が発行されました。\n' +
        '.env ファイルを更新してください:\n' +
        `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`
      );
    }
  });

  // Access Tokenを取得（期限切れの場合は自動更新）
  try {
    await oauth2Client.getAccessToken();
  } catch (error) {
    if (error.message.includes('invalid_grant')) {
      throw new Error(
        '認証エラー: Refresh Token が無効です。\n' +
        'scripts/auth/setup-oauth.js を実行して再認証してください。'
      );
    }
    throw error;
  }

  return oauth2Client;
}

/**
 * Google Forms APIクライアントを取得
 * @returns {Promise<{forms: any, auth: google.auth.OAuth2}>}
 */
async function getFormsClient() {
  const auth = await getAuthClient();
  const forms = google.forms({ version: 'v1', auth });
  return { forms, auth };
}

/**
 * Google Drive APIクライアントを取得
 * @returns {Promise<{drive: any, auth: google.auth.OAuth2}>}
 */
async function getDriveClient() {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });
  return { drive, auth };
}

/**
 * Google Sheets APIクライアントを取得
 * @returns {Promise<{sheets: any, auth: google.auth.OAuth2}>}
 */
async function getSheetsClient() {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, auth };
}

/**
 * 全APIクライアントを取得
 * @returns {Promise<{forms: any, drive: any, sheets: any, auth: google.auth.OAuth2}>}
 */
async function getAllClients() {
  const auth = await getAuthClient();
  return {
    forms: google.forms({ version: 'v1', auth }),
    drive: google.drive({ version: 'v3', auth }),
    sheets: google.sheets({ version: 'v4', auth }),
    auth
  };
}

module.exports = {
  getAuthClient,
  getFormsClient,
  getDriveClient,
  getSheetsClient,
  getAllClients
};
