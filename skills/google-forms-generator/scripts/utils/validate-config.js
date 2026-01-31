#!/usr/bin/env node

/**
 * フォーム設定検証スクリプト
 *
 * 使用方法:
 *   node scripts/utils/validate-config.js --config <config.json>
 *   cat config.json | node scripts/utils/validate-config.js
 *
 * 検証内容:
 *   - 必須フィールドの存在確認
 *   - 質問タイプの有効性
 *   - 選択肢の整合性
 *   - 条件分岐ロジックの検証
 *   - クイズ設定の検証
 */

const fs = require('fs');
const path = require('path');

// 有効な質問タイプ
const VALID_QUESTION_TYPES = [
  'SHORT_TEXT',
  'LONG_TEXT',
  'RADIO',
  'CHECKBOX',
  'DROP_DOWN',
  'SCALE',
  'GRID_RADIO',
  'GRID_CHECKBOX',
  'DATE',
  'TIME',
  'RATING'
];

// 有効なメール収集タイプ
const VALID_EMAIL_TYPES = [
  'DO_NOT_COLLECT',
  'VERIFIED',
  'RESPONDER_INPUT'
];

// 有効なGoToAction
const VALID_GOTO_ACTIONS = [
  'NEXT_SECTION',
  'RESTART_FORM',
  'SUBMIT_FORM'
];

// 有効なアイコンタイプ
const VALID_ICON_TYPES = [
  'STAR',
  'HEART',
  'THUMB_UP'
];

/**
 * 検証結果クラス
 */
class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  addError(path, message) {
    this.errors.push({ path, message, severity: 'error' });
  }

  addWarning(path, message) {
    this.warnings.push({ path, message, severity: 'warning' });
  }

  get isValid() {
    return this.errors.length === 0;
  }

  print() {
    if (this.errors.length > 0) {
      console.log('\n❌ エラー:');
      this.errors.forEach(e => {
        console.log(`  [${e.path}] ${e.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      this.warnings.forEach(w => {
        console.log(`  [${w.path}] ${w.message}`);
      });
    }

    if (this.isValid && this.warnings.length === 0) {
      console.log('\n✅ 設定は有効です');
    } else if (this.isValid) {
      console.log('\n✅ 設定は有効です（警告あり）');
    } else {
      console.log(`\n❌ ${this.errors.length}件のエラーがあります`);
    }
  }
}

/**
 * 基本情報を検証
 */
function validateBasicInfo(config, result) {
  if (!config.basicInfo) {
    result.addError('basicInfo', '基本情報が必要です');
    return;
  }

  if (!config.basicInfo.title || config.basicInfo.title.trim() === '') {
    result.addError('basicInfo.title', 'タイトルは必須です');
  }

  if (config.basicInfo.folderId && !/^[\w-]+$/.test(config.basicInfo.folderId)) {
    result.addWarning('basicInfo.folderId', 'フォルダIDの形式が正しくない可能性があります');
  }
}

/**
 * 設定を検証
 */
function validateSettings(config, result) {
  if (!config.settings) {
    return; // 設定はオプション
  }

  if (config.settings.emailCollectionType &&
      !VALID_EMAIL_TYPES.includes(config.settings.emailCollectionType)) {
    result.addError(
      'settings.emailCollectionType',
      `無効なメール収集タイプ: ${config.settings.emailCollectionType}. 有効な値: ${VALID_EMAIL_TYPES.join(', ')}`
    );
  }
}

/**
 * 質問を検証
 */
function validateQuestions(config, result) {
  if (!config.questions || !Array.isArray(config.questions)) {
    result.addError('questions', '質問配列が必要です');
    return;
  }

  if (config.questions.length === 0) {
    result.addError('questions', '少なくとも1つの質問が必要です');
    return;
  }

  config.questions.forEach((q, index) => {
    const path = `questions[${index}]`;

    // タイトル
    if (!q.title || q.title.trim() === '') {
      result.addError(`${path}.title`, '質問文は必須です');
    }

    // タイプ
    if (!q.type) {
      result.addError(`${path}.type`, '質問タイプは必須です');
    } else if (!VALID_QUESTION_TYPES.includes(q.type)) {
      result.addError(`${path}.type`, `無効な質問タイプ: ${q.type}`);
    }

    // タイプ別の検証
    validateQuestionByType(q, index, result);
  });
}

/**
 * 質問タイプ別の検証
 */
function validateQuestionByType(q, index, result) {
  const path = `questions[${index}]`;

  switch (q.type) {
    case 'RADIO':
    case 'CHECKBOX':
    case 'DROP_DOWN':
      validateChoiceQuestion(q, path, result);
      break;

    case 'SCALE':
      validateScaleQuestion(q, path, result);
      break;

    case 'GRID_RADIO':
    case 'GRID_CHECKBOX':
      validateGridQuestion(q, path, result);
      break;

    case 'RATING':
      validateRatingQuestion(q, path, result);
      break;

    case 'DATE':
    case 'TIME':
    case 'SHORT_TEXT':
    case 'LONG_TEXT':
      // 追加検証なし
      break;
  }
}

/**
 * 選択式質問の検証
 */
function validateChoiceQuestion(q, path, result) {
  if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
    result.addError(`${path}.options`, '選択肢が必要です');
    return;
  }

  q.options.forEach((opt, i) => {
    const optPath = `${path}.options[${i}]`;
    const optValue = typeof opt === 'string' ? opt : opt.value;

    if (!optValue && !opt.isOther) {
      result.addError(optPath, '選択肢の値が必要です');
    }

    // DROP_DOWNでisOtherは使用不可
    if (q.type === 'DROP_DOWN' && opt.isOther) {
      result.addError(optPath, 'DROP_DOWNでは「その他」オプションは使用できません');
    }

    // CHECKBOXで条件分岐は使用不可
    if (q.type === 'CHECKBOX' && (opt.goToAction || opt.goToSectionId)) {
      result.addError(optPath, 'CHECKBOXでは条件分岐は使用できません');
    }

    // goToActionの検証
    if (opt.goToAction && !VALID_GOTO_ACTIONS.includes(opt.goToAction)) {
      result.addError(optPath, `無効なgoToAction: ${opt.goToAction}`);
    }
  });
}

/**
 * スケール質問の検証
 */
function validateScaleQuestion(q, path, result) {
  if (q.low === undefined) {
    result.addWarning(`${path}.low`, 'lowが未設定です（デフォルト: 1）');
  } else if (q.low !== 0 && q.low !== 1) {
    result.addError(`${path}.low`, 'lowは0または1である必要があります');
  }

  if (q.high === undefined) {
    result.addWarning(`${path}.high`, 'highが未設定です（デフォルト: 5）');
  } else if (q.high < 2 || q.high > 10) {
    result.addError(`${path}.high`, 'highは2〜10の範囲である必要があります');
  }

  if (q.low !== undefined && q.high !== undefined && q.low >= q.high) {
    result.addError(path, 'lowはhighより小さい必要があります');
  }
}

/**
 * グリッド質問の検証
 */
function validateGridQuestion(q, path, result) {
  if (!q.rows || !Array.isArray(q.rows) || q.rows.length === 0) {
    result.addError(`${path}.rows`, '行が必要です');
  }

  if (!q.columns || !Array.isArray(q.columns) || q.columns.length === 0) {
    result.addError(`${path}.columns`, '列が必要です');
  }
}

/**
 * 評価質問の検証
 */
function validateRatingQuestion(q, path, result) {
  if (q.ratingScaleLevel !== undefined) {
    if (q.ratingScaleLevel < 3 || q.ratingScaleLevel > 10) {
      result.addError(`${path}.ratingScaleLevel`, '評価段階は3〜10の範囲である必要があります');
    }
  }

  if (q.iconType && !VALID_ICON_TYPES.includes(q.iconType)) {
    result.addError(`${path}.iconType`, `無効なアイコンタイプ: ${q.iconType}. 有効な値: ${VALID_ICON_TYPES.join(', ')}`);
  }
}

/**
 * 条件分岐を検証
 */
function validateBranchingRules(config, result) {
  if (!config.branchingRules || !Array.isArray(config.branchingRules)) {
    return;
  }

  const sectionIds = new Set();
  if (config.sections) {
    config.sections.forEach((s, i) => {
      if (s.id) sectionIds.add(s.id);
    });
  }

  config.branchingRules.forEach((rule, index) => {
    const path = `branchingRules[${index}]`;

    if (rule.questionIndex === undefined) {
      result.addError(`${path}.questionIndex`, '対象質問のインデックスが必要です');
    } else if (rule.questionIndex >= (config.questions?.length || 0)) {
      result.addError(`${path}.questionIndex`, '存在しない質問を参照しています');
    } else {
      const targetQuestion = config.questions[rule.questionIndex];
      if (targetQuestion && !['RADIO', 'DROP_DOWN'].includes(targetQuestion.type)) {
        result.addError(path, `${targetQuestion.type}では条件分岐は使用できません。RADIO/DROP_DOWNのみ対応。`);
      }
    }

    if (rule.goToSectionId && !sectionIds.has(rule.goToSectionId)) {
      result.addWarning(`${path}.goToSectionId`, `セクションID "${rule.goToSectionId}" が見つかりません`);
    }
  });
}

/**
 * クイズ設定を検証
 */
function validateQuizSettings(config, result) {
  if (!config.settings?.isQuiz) {
    return;
  }

  config.questions?.forEach((q, index) => {
    const path = `questions[${index}]`;

    if (q.grading) {
      // 採点可能なタイプか確認
      const gradableTypes = ['RADIO', 'CHECKBOX', 'DROP_DOWN', 'SHORT_TEXT'];
      if (!gradableTypes.includes(q.type)) {
        result.addWarning(`${path}.grading`, `${q.type}は自動採点に対応していません`);
      }

      // 正解が設定されているか
      if (!q.grading.correctAnswer && !q.grading.correctAnswers) {
        result.addWarning(`${path}.grading`, '正解が設定されていません');
      }
    }
  });
}

/**
 * メイン検証関数
 */
function validateConfig(config) {
  const result = new ValidationResult();

  validateBasicInfo(config, result);
  validateSettings(config, result);
  validateQuestions(config, result);
  validateBranchingRules(config, result);
  validateQuizSettings(config, result);

  return result;
}

/**
 * 引数をパース
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--config':
        options.configPath = args[++i];
        break;
      case '--json':
        options.jsonOutput = true;
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
フォーム設定検証スクリプト

使用方法:
  node validate-config.js --config <config.json>
  cat config.json | node validate-config.js

オプション:
  --config <path>   設定ファイルのパス
  --json            JSON形式で結果を出力

検証内容:
  - 必須フィールドの存在確認
  - 質問タイプの有効性
  - 選択肢の整合性
  - 条件分岐ロジックの検証
  - クイズ設定の検証
`);
}

// メイン実行
if (require.main === module) {
  const options = parseArgs();
  let config;

  try {
    if (options.configPath) {
      const content = fs.readFileSync(options.configPath, 'utf-8');
      config = JSON.parse(content);
    } else {
      // 標準入力から読み込み
      const stdin = fs.readFileSync(0, 'utf-8');
      config = JSON.parse(stdin);
    }
  } catch (error) {
    console.error('設定ファイルの読み込みに失敗:', error.message);
    process.exit(1);
  }

  const result = validateConfig(config);

  if (options.jsonOutput) {
    console.log(JSON.stringify({
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings
    }, null, 2));
  } else {
    console.log('フォーム設定を検証中...');
    result.print();
  }

  process.exit(result.isValid ? 0 : 1);
}

module.exports = { validateConfig, ValidationResult };
