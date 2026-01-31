#!/usr/bin/env node

/**
 * フォーム設定更新スクリプト
 *
 * 使用方法:
 *   node scripts/forms/update-settings.js --formId <formId> [options]
 *
 * オプション:
 *   --formId <id>          対象フォームID（必須）
 *   --quiz <true|false>    クイズモードの有効/無効
 *   --email <type>         メール収集タイプ (DO_NOT_COLLECT|VERIFIED|RESPONDER_INPUT)
 *   --title <title>        フォームタイトル
 *   --description <desc>   フォーム説明文
 */

const { google } = require('googleapis');
const path = require('path');

// .env ファイルをスキルディレクトリから読み込む
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const { getFormsClient } = require('../auth/get-auth-client');
const { retryWithBackoff } = require('../utils/retry-with-backoff');

/**
 * 引数をパース
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--formId':
        options.formId = args[++i];
        break;
      case '--quiz':
        options.isQuiz = args[++i] === 'true';
        break;
      case '--email':
        options.emailCollectionType = args[++i];
        break;
      case '--title':
        options.title = args[++i];
        break;
      case '--description':
        options.description = args[++i];
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
フォーム設定更新スクリプト

使用方法:
  node update-settings.js --formId <formId> [options]

必須オプション:
  --formId <id>          対象フォームID

設定オプション:
  --quiz <true|false>    クイズモードの有効/無効
  --email <type>         メール収集タイプ
                         - DO_NOT_COLLECT: 収集しない
                         - VERIFIED: Googleアカウントから取得
                         - RESPONDER_INPUT: 回答者が入力
  --title <title>        フォームタイトル
  --description <desc>   フォーム説明文

例:
  # クイズモードを有効化
  node update-settings.js --formId 1BxiMVs... --quiz true

  # メール収集を有効化
  node update-settings.js --formId 1BxiMVs... --email VERIFIED

  # タイトルと説明を更新
  node update-settings.js --formId 1BxiMVs... --title "新しいタイトル" --description "説明文"
`);
}

/**
 * フォーム設定を更新
 */
async function updateFormSettings(options) {
  if (!options.formId) {
    console.error('エラー: --formId は必須です');
    showHelp();
    process.exit(1);
  }

  const { forms } = await getFormsClient();
  const requests = [];
  const updateMasks = [];

  // フォーム情報の更新
  if (options.title !== undefined || options.description !== undefined) {
    const info = {};
    const infoMasks = [];

    if (options.title !== undefined) {
      info.title = options.title;
      infoMasks.push('title');
    }

    if (options.description !== undefined) {
      info.description = options.description;
      infoMasks.push('description');
    }

    requests.push({
      updateFormInfo: {
        info,
        updateMask: infoMasks.join(',')
      }
    });
  }

  // 設定の更新
  if (options.isQuiz !== undefined || options.emailCollectionType !== undefined) {
    const settings = {};
    const settingsMasks = [];

    if (options.isQuiz !== undefined) {
      settings.quizSettings = { isQuiz: options.isQuiz };
      settingsMasks.push('quizSettings.isQuiz');
    }

    if (options.emailCollectionType !== undefined) {
      // バリデーション
      const validTypes = ['DO_NOT_COLLECT', 'VERIFIED', 'RESPONDER_INPUT'];
      if (!validTypes.includes(options.emailCollectionType)) {
        console.error(`エラー: 無効なメール収集タイプ: ${options.emailCollectionType}`);
        console.error(`有効な値: ${validTypes.join(', ')}`);
        process.exit(1);
      }
      settings.emailCollectionType = options.emailCollectionType;
      settingsMasks.push('emailCollectionType');
    }

    requests.push({
      updateSettings: {
        settings,
        updateMask: settingsMasks.join(',')
      }
    });
  }

  if (requests.length === 0) {
    console.log('更新する設定がありません。--help でオプションを確認してください。');
    process.exit(0);
  }

  console.log('フォーム設定を更新中...');
  console.log(`対象フォーム: ${options.formId}`);
  console.log(`更新内容: ${requests.length}件のリクエスト\n`);

  try {
    const result = await retryWithBackoff(async () => {
      return await forms.forms.batchUpdate({
        formId: options.formId,
        requestBody: {
          requests,
          includeFormInResponse: true
        }
      });
    });

    console.log('✅ 設定更新完了\n');

    // 更新後の設定を表示
    const updatedForm = result.data.form;
    console.log('='.repeat(50));
    console.log('更新後のフォーム情報');
    console.log('='.repeat(50));
    console.log(`タイトル: ${updatedForm.info.title}`);
    if (updatedForm.info.description) {
      console.log(`説明: ${updatedForm.info.description}`);
    }
    if (updatedForm.settings) {
      console.log(`クイズモード: ${updatedForm.settings.quizSettings?.isQuiz ? 'ON' : 'OFF'}`);
      console.log(`メール収集: ${updatedForm.settings.emailCollectionType || 'DO_NOT_COLLECT'}`);
    }
    console.log('='.repeat(50));

    return {
      success: true,
      formId: options.formId,
      updatedForm
    };

  } catch (error) {
    console.error('❌ 設定更新失敗');
    console.error(`エラー: ${error.message}`);

    if (error.code === 404) {
      console.error('\nフォームが見つかりません。フォームIDを確認してください。');
    } else if (error.code === 403) {
      console.error('\nこのフォームを編集する権限がありません。');
    }

    return {
      success: false,
      error: error.message
    };
  }
}

// メイン実行
if (require.main === module) {
  const options = parseArgs();
  updateFormSettings(options).then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { updateFormSettings };
