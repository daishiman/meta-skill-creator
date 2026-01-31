#!/usr/bin/env node

/**
 * フォーム作成結果を保存するスクリプト
 *
 * 使用方法:
 *   node scripts/output/save-form-result.js --design <design.json> --result <result.json>
 *
 * 出力先:
 *   05_Project/GoogleFrom/{タイムスタンプ}_{タイトル}/
 *     ├── 01-design.md   # 下書き・設計情報
 *     └── 02-result.md   # URL情報・結果
 */

const fs = require('fs');
const path = require('path');

// プロジェクトルートを取得（.claude/skills/google-forms-generator/scripts/output から5階層上）
const PROJECT_ROOT = path.resolve(__dirname, '../../../../../');
const OUTPUT_BASE_DIR = path.join(PROJECT_ROOT, '05_Project/GoogleFrom');

/**
 * タイムスタンプを生成（YYYYMMDD_HHMMSS形式）
 */
function generateTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

/**
 * タイトルをディレクトリ名に変換（特殊文字を除去）
 */
function sanitizeTitle(title) {
  return title
    .replace(/[\/\\:*?"<>|]/g, '') // ファイルシステムで使えない文字を除去
    .replace(/\s+/g, '_')           // スペースをアンダースコアに
    .substring(0, 50);              // 長すぎる場合は切り詰め
}

/**
 * 設計情報をMarkdownに変換
 */
function generateDesignMarkdown(design) {
  const lines = [];

  lines.push(`# ${design.basicInfo?.title || 'Untitled'} - フォーム設計書`);
  lines.push('');
  lines.push(`作成日時: ${new Date().toLocaleString('ja-JP')}`);
  lines.push('');

  // 基本情報
  lines.push('## 基本情報');
  lines.push('');
  lines.push('| 項目 | 値 |');
  lines.push('|------|-----|');
  lines.push(`| タイトル | ${design.basicInfo?.title || '-'} |`);
  lines.push(`| 説明 | ${design.basicInfo?.description || '-'} |`);
  lines.push(`| 保存先フォルダID | ${design.basicInfo?.folderId || 'マイドライブルート'} |`);
  lines.push('');

  // 設定
  if (design.settings) {
    lines.push('## 設定');
    lines.push('');
    lines.push('| 項目 | 値 |');
    lines.push('|------|-----|');
    lines.push(`| クイズモード | ${design.settings.isQuiz ? 'ON' : 'OFF'} |`);
    lines.push(`| メール収集 | ${design.settings.emailCollectionType || 'DO_NOT_COLLECT'} |`);
    lines.push(`| 公開設定 | ${design.settings.isPublished !== false ? '公開' : '非公開'} |`);
    lines.push('');
  }

  // 質問一覧
  if (design.questions && design.questions.length > 0) {
    lines.push('## 質問一覧');
    lines.push('');
    lines.push('| # | 質問文 | タイプ | 必須 | 選択肢/設定 |');
    lines.push('|---|--------|--------|------|-------------|');

    design.questions.forEach((q, index) => {
      let options = '-';
      if (q.options) {
        options = q.options.map(o => typeof o === 'string' ? o : o.value).join(', ');
        if (options.length > 50) options = options.substring(0, 47) + '...';
      } else if (q.type === 'SCALE') {
        options = `${q.low || 1}〜${q.high || 5}`;
      } else if (q.type === 'RATING') {
        options = `${q.ratingScaleLevel || 5}段階（${q.iconType || 'STAR'}）`;
      } else if (q.rows && q.columns) {
        options = `行: ${q.rows.length}, 列: ${q.columns.length}`;
      }

      lines.push(`| ${index + 1} | ${q.title} | ${q.type} | ${q.required ? '○' : '-'} | ${options} |`);
    });
    lines.push('');
  }

  // 詳細な質問情報
  if (design.questions && design.questions.length > 0) {
    lines.push('## 質問詳細');
    lines.push('');

    design.questions.forEach((q, index) => {
      lines.push(`### Q${index + 1}: ${q.title}`);
      lines.push('');
      lines.push(`- **タイプ**: ${q.type}`);
      lines.push(`- **必須**: ${q.required ? 'はい' : 'いいえ'}`);
      if (q.description) {
        lines.push(`- **説明**: ${q.description}`);
      }

      if (q.options) {
        lines.push('- **選択肢**:');
        q.options.forEach((opt, i) => {
          const optText = typeof opt === 'string' ? opt : opt.value;
          lines.push(`  ${i + 1}. ${optText}`);
        });
      }

      if (q.type === 'SCALE') {
        lines.push(`- **スケール**: ${q.low || 1}（${q.lowLabel || ''}）〜 ${q.high || 5}（${q.highLabel || ''}）`);
      }

      if (q.rows && q.columns) {
        lines.push('- **行**: ' + q.rows.join(', '));
        lines.push('- **列**: ' + q.columns.join(', '));
      }

      if (q.grading) {
        lines.push(`- **配点**: ${q.grading.pointValue || 0}点`);
        if (q.grading.correctAnswer) {
          lines.push(`- **正解**: ${q.grading.correctAnswer}`);
        }
      }

      lines.push('');
    });
  }

  // セクション構成
  if (design.sections && design.sections.length > 0) {
    lines.push('## セクション構成');
    lines.push('');
    design.sections.forEach((section, index) => {
      lines.push(`### セクション ${index + 1}: ${section.title || '無題'}`);
      if (section.description) {
        lines.push(`${section.description}`);
      }
      lines.push('');
    });
  }

  // 条件分岐
  if (design.branchingRules && design.branchingRules.length > 0) {
    lines.push('## 条件分岐');
    lines.push('');
    lines.push('| 質問 | 選択肢 | 遷移先 |');
    lines.push('|------|--------|--------|');
    design.branchingRules.forEach(rule => {
      const action = rule.goToSectionId || rule.goToAction || '-';
      lines.push(`| Q${rule.questionIndex + 1} | ${rule.optionValue} | ${action} |`);
    });
    lines.push('');
  }

  // 元のJSONデータ（折りたたみ）
  lines.push('## 元データ（JSON）');
  lines.push('');
  lines.push('<details>');
  lines.push('<summary>クリックして展開</summary>');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(design, null, 2));
  lines.push('```');
  lines.push('</details>');
  lines.push('');

  return lines.join('\n');
}

/**
 * 結果情報をMarkdownに変換
 */
function generateResultMarkdown(result, design) {
  const lines = [];
  const title = design?.basicInfo?.title || result?.title || 'Untitled';

  lines.push(`# ${title} - 作成結果`);
  lines.push('');
  lines.push(`作成日時: ${new Date().toLocaleString('ja-JP')}`);
  lines.push('');

  // ステータス
  lines.push('## ステータス');
  lines.push('');
  if (result.success) {
    lines.push('**作成成功**');
  } else if (result.formId) {
    lines.push('**部分的に成功**（一部エラーあり）');
  } else {
    lines.push('**作成失敗**');
  }
  lines.push('');

  // フォーム情報
  if (result.formId) {
    lines.push('## フォーム情報');
    lines.push('');
    lines.push('| 項目 | 値 |');
    lines.push('|------|-----|');
    lines.push(`| タイトル | ${title} |`);
    lines.push(`| フォームID | \`${result.formId}\` |`);
    lines.push('');

    // URL情報
    lines.push('## URL');
    lines.push('');

    if (result.responderUri) {
      lines.push('### 回答用URL');
      lines.push('');
      lines.push('```');
      lines.push(result.responderUri);
      lines.push('```');
      lines.push('');
      lines.push(`[回答フォームを開く](${result.responderUri})`);
      lines.push('');
    }

    if (result.editUri) {
      lines.push('### 編集用URL');
      lines.push('');
      lines.push('```');
      lines.push(result.editUri);
      lines.push('```');
      lines.push('');
      lines.push(`[編集画面を開く](${result.editUri})`);
      lines.push('');
    }

    // 保存先情報
    lines.push('## 保存先');
    lines.push('');
    if (result.folderId) {
      lines.push(`- **フォルダID**: \`${result.folderId}\``);
      lines.push(`- **フォルダURL**: https://drive.google.com/drive/folders/${result.folderId}`);
    } else {
      lines.push('- マイドライブルートに保存');
    }
    lines.push('');
  }

  // スプレッドシート情報
  lines.push('## スプレッドシート連携');
  lines.push('');
  if (result.linkedSheetId) {
    lines.push(`- **スプレッドシートID**: \`${result.linkedSheetId}\``);
    lines.push(`- **スプレッドシートURL**: https://docs.google.com/spreadsheets/d/${result.linkedSheetId}`);
  } else {
    lines.push('スプレッドシートは未連携です。');
    lines.push('');
    lines.push('### 連携方法');
    lines.push('');
    lines.push('1. 編集画面を開く');
    lines.push('2. 「回答」タブをクリック');
    lines.push('3. 「スプレッドシートにリンク」をクリック');
    lines.push('');
    lines.push('※ API経由での自動リンクは非対応です');
  }
  lines.push('');

  // エラー情報
  if (result.errors && result.errors.length > 0) {
    lines.push('## エラー情報');
    lines.push('');
    result.errors.forEach((error, index) => {
      lines.push(`### エラー ${index + 1}`);
      lines.push('');
      lines.push(`- **コード**: ${error.code || '-'}`);
      lines.push(`- **メッセージ**: ${error.message || '-'}`);
      if (error.request) {
        lines.push(`- **該当リクエスト**: ${error.request}`);
      }
      lines.push('');
    });
  }

  // 実行ログ
  if (result.executionLog) {
    lines.push('## 実行ログ');
    lines.push('');
    lines.push('```');
    if (Array.isArray(result.executionLog)) {
      result.executionLog.forEach(log => lines.push(log));
    } else {
      lines.push(result.executionLog);
    }
    lines.push('```');
    lines.push('');
  }

  // 次のステップ
  lines.push('## 次のステップ');
  lines.push('');
  lines.push('1. **回答用URLを共有**: メール、Slack、SNS等で配布');
  lines.push('2. **フォームをプレビュー**: 回答用URLにアクセスして表示確認');
  lines.push('3. **スプレッドシート連携**: 編集画面の「回答」タブから設定');
  lines.push('4. **回答データ取得**: `node scripts/sheets/get-responses.js --formId=' + (result.formId || 'FORM_ID') + '`');
  lines.push('');

  return lines.join('\n');
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  // 引数パース
  let designPath = null;
  let resultPath = null;
  let designData = null;
  let resultData = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--design' && args[i + 1]) {
      designPath = args[i + 1];
      i++;
    } else if (args[i] === '--result' && args[i + 1]) {
      resultPath = args[i + 1];
      i++;
    } else if (args[i] === '--design-json' && args[i + 1]) {
      designData = JSON.parse(args[i + 1]);
      i++;
    } else if (args[i] === '--result-json' && args[i + 1]) {
      resultData = JSON.parse(args[i + 1]);
      i++;
    }
  }

  // JSONファイルから読み込み
  if (designPath && !designData) {
    designData = JSON.parse(fs.readFileSync(designPath, 'utf-8'));
  }
  if (resultPath && !resultData) {
    resultData = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
  }

  // 標準入力から読み込み（パイプ対応）
  if (!designData && !resultData) {
    const stdin = fs.readFileSync(0, 'utf-8');
    const input = JSON.parse(stdin);
    designData = input.design;
    resultData = input.result;
  }

  if (!designData && !resultData) {
    console.error('エラー: --design または --result オプションを指定してください');
    console.error('');
    console.error('使用方法:');
    console.error('  node save-form-result.js --design design.json --result result.json');
    console.error('  node save-form-result.js --design-json \'{"basicInfo":...}\' --result-json \'{"formId":...}\'');
    console.error('  echo \'{"design":..., "result":...}\' | node save-form-result.js');
    process.exit(1);
  }

  // 出力ディレクトリ作成
  const title = designData?.basicInfo?.title || resultData?.title || 'Untitled';
  const timestamp = generateTimestamp();
  const dirName = `${timestamp}_${sanitizeTitle(title)}`;
  const outputDir = path.join(OUTPUT_BASE_DIR, dirName);

  fs.mkdirSync(outputDir, { recursive: true });

  // ファイル出力
  const outputs = [];

  if (designData) {
    const designMd = generateDesignMarkdown(designData);
    const designPath = path.join(outputDir, '01-design.md');
    fs.writeFileSync(designPath, designMd, 'utf-8');
    outputs.push({ type: 'design', path: designPath });
    console.log(`✅ 設計情報を保存: ${designPath}`);
  }

  if (resultData) {
    const resultMd = generateResultMarkdown(resultData, designData);
    const resultPath = path.join(outputDir, '02-result.md');
    fs.writeFileSync(resultPath, resultMd, 'utf-8');
    outputs.push({ type: 'result', path: resultPath });
    console.log(`✅ 結果情報を保存: ${resultPath}`);
  }

  console.log('');
  console.log('='.repeat(50));
  console.log(`出力ディレクトリ: ${outputDir}`);
  console.log('='.repeat(50));

  // 結果をJSON出力（スクリプト連携用）
  console.log(JSON.stringify({
    success: true,
    outputDir,
    files: outputs
  }));
}

main().catch(error => {
  console.error('エラー:', error.message);
  process.exit(1);
});
