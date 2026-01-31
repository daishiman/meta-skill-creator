#!/usr/bin/env node

/**
 * Drive 共有設定スクリプト
 *
 * 使用方法:
 *   node scripts/drive/set-permissions.js --fileId <id> --type <type> --role <role> [options]
 *
 * オプション:
 *   --fileId <id>          対象ファイルID（フォームID）（必須）
 *   --type <type>          共有タイプ（必須）: user, group, domain, anyone
 *   --role <role>          権限（必須）: reader, writer, commenter
 *   --email <email>        共有先メールアドレス（type=user/group時に必要）
 *   --domain <domain>      ドメイン（type=domain時に必要）
 *   --notify               共有通知メールを送信
 *   --message <msg>        通知メッセージ
 */

const { google } = require('googleapis');
const path = require('path');

// .env ファイルをスキルディレクトリから読み込む
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const { getDriveClient } = require('../auth/get-auth-client');
const { retryWithBackoff } = require('../utils/retry-with-backoff');

/**
 * 引数をパース
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    sendNotificationEmail: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--fileId':
        options.fileId = args[++i];
        break;
      case '--type':
        options.type = args[++i];
        break;
      case '--role':
        options.role = args[++i];
        break;
      case '--email':
        options.emailAddress = args[++i];
        break;
      case '--domain':
        options.domain = args[++i];
        break;
      case '--notify':
        options.sendNotificationEmail = true;
        break;
      case '--message':
        options.emailMessage = args[++i];
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
Drive 共有設定スクリプト

使用方法:
  node set-permissions.js --fileId <id> --type <type> --role <role> [options]

必須オプション:
  --fileId <id>          対象ファイルID（フォームID）
  --type <type>          共有タイプ
                         - user: 特定ユーザー
                         - group: Googleグループ
                         - domain: 組織ドメイン
                         - anyone: 全員（リンクを知っている人）
  --role <role>          権限
                         - reader: 閲覧のみ
                         - writer: 編集可能
                         - commenter: コメント可能

追加オプション:
  --email <email>        共有先メールアドレス（type=user/group時に必要）
  --domain <domain>      ドメイン（type=domain時に必要）
  --notify               共有通知メールを送信
  --message <msg>        通知メッセージ

例:
  # 特定ユーザーに編集権限を付与
  node set-permissions.js --fileId 1BxiMVs... --type user --role writer --email user@example.com

  # リンクを知っている全員に閲覧権限
  node set-permissions.js --fileId 1BxiMVs... --type anyone --role reader

  # ドメイン内ユーザーに閲覧権限
  node set-permissions.js --fileId 1BxiMVs... --type domain --role reader --domain example.com
`);
}

/**
 * 入力を検証
 */
function validateOptions(options) {
  const errors = [];

  if (!options.fileId) {
    errors.push('--fileId は必須です');
  }

  const validTypes = ['user', 'group', 'domain', 'anyone'];
  if (!options.type || !validTypes.includes(options.type)) {
    errors.push(`--type は必須です (有効な値: ${validTypes.join(', ')})`);
  }

  const validRoles = ['reader', 'writer', 'commenter'];
  if (!options.role || !validRoles.includes(options.role)) {
    errors.push(`--role は必須です (有効な値: ${validRoles.join(', ')})`);
  }

  if ((options.type === 'user' || options.type === 'group') && !options.emailAddress) {
    errors.push(`--email は type=${options.type} の場合に必須です`);
  }

  if (options.type === 'domain' && !options.domain) {
    errors.push('--domain は type=domain の場合に必須です');
  }

  return errors;
}

/**
 * 共有設定を追加
 */
async function setPermission(options) {
  const errors = validateOptions(options);
  if (errors.length > 0) {
    console.error('エラー:');
    errors.forEach(e => console.error(`  - ${e}`));
    showHelp();
    process.exit(1);
  }

  const { drive } = await getDriveClient();

  // パーミッションリソースを構築
  const permission = {
    type: options.type,
    role: options.role
  };

  if (options.emailAddress) {
    permission.emailAddress = options.emailAddress;
  }

  if (options.domain) {
    permission.domain = options.domain;
  }

  console.log('共有設定を追加中...');
  console.log(`対象ファイル: ${options.fileId}`);
  console.log(`共有タイプ: ${options.type}`);
  console.log(`権限: ${options.role}`);
  if (options.emailAddress) console.log(`共有先: ${options.emailAddress}`);
  if (options.domain) console.log(`ドメイン: ${options.domain}`);
  console.log('');

  try {
    const result = await retryWithBackoff(async () => {
      return await drive.permissions.create({
        fileId: options.fileId,
        requestBody: permission,
        sendNotificationEmail: options.sendNotificationEmail,
        emailMessage: options.emailMessage,
        fields: 'id, type, role, emailAddress, domain'
      });
    });

    console.log('✅ 共有設定完了\n');
    console.log('='.repeat(50));
    console.log('追加されたパーミッション');
    console.log('='.repeat(50));
    console.log(`ID: ${result.data.id}`);
    console.log(`タイプ: ${result.data.type}`);
    console.log(`権限: ${result.data.role}`);
    if (result.data.emailAddress) console.log(`メール: ${result.data.emailAddress}`);
    if (result.data.domain) console.log(`ドメイン: ${result.data.domain}`);
    console.log('='.repeat(50));

    return {
      success: true,
      permission: result.data
    };

  } catch (error) {
    console.error('❌ 共有設定失敗');
    console.error(`エラー: ${error.message}`);

    if (error.code === 404) {
      console.error('\nファイルが見つかりません。ファイルIDを確認してください。');
    } else if (error.code === 403) {
      console.error('\nこのファイルの共有設定を変更する権限がありません。');
    } else if (error.code === 400) {
      console.error('\n無効なパラメータです。メールアドレスやドメインを確認してください。');
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 現在の共有設定を一覧表示
 */
async function listPermissions(fileId) {
  const { drive } = await getDriveClient();

  try {
    const result = await drive.permissions.list({
      fileId,
      fields: 'permissions(id, type, role, emailAddress, domain, displayName)'
    });

    console.log('='.repeat(50));
    console.log('現在の共有設定');
    console.log('='.repeat(50));

    result.data.permissions.forEach((p, i) => {
      console.log(`\n[${i + 1}] ${p.displayName || p.emailAddress || p.domain || p.type}`);
      console.log(`    タイプ: ${p.type}`);
      console.log(`    権限: ${p.role}`);
    });

    console.log('');

    return result.data.permissions;

  } catch (error) {
    console.error('共有設定の取得に失敗:', error.message);
    return [];
  }
}

// メイン実行
if (require.main === module) {
  const options = parseArgs();

  if (options.fileId && !options.type && !options.role) {
    // fileIdのみ指定された場合は一覧表示
    listPermissions(options.fileId);
  } else {
    setPermission(options).then(result => {
      process.exit(result.success ? 0 : 1);
    });
  }
}

module.exports = { setPermission, listPermissions };
