#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * 18-skills.md §7.3 に準拠したフィードバック記録を行います。
 * エージェントの最終Phaseで呼び出されることを想定しています。
 *
 * 使用例:
 *   node log_usage.js --result success --phase "Phase 4" --agent "skill-creator"
 *
 * 終了コード:
 *   0: 成功
 *   1: 一般的なエラー
 *   2: 引数エラー
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

function showHelp() {
  console.log(`
スキル使用記録スクリプト (18-skills.md §7.3 準拠)

Usage:
  node log_usage.js [options]

Options:
  --result <success|failure>  実行結果（必須）
  --phase <name>              実行したPhase名（任意）
  --agent <name>              実行したエージェント名（任意）
  --notes <text>              追加のフィードバックメモ（任意）
  -h, --help                  このヘルプを表示

Examples:
  node log_usage.js --result success
  node log_usage.js --result failure --phase "Phase 3" --notes "検証エラー"
  node log_usage.js --result success --phase "Phase 4" --agent "skill-creator"

Files updated:
  - LOGS.md: 実行記録を追記
  - EVALS.json: メトリクスを更新（存在する場合）
  `);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

function ensureLogsFile() {
  const logsPath = join(SKILL_DIR, "LOGS.md");
  if (!existsSync(logsPath)) {
    const header = `# Skill Usage Logs

このファイルにはスキルの使用記録が追記されます。

---

`;
    writeFileSync(logsPath, header, "utf-8");
    console.log("✓ LOGS.md を新規作成しました");
  }
  return logsPath;
}

function ensureEvalsFile() {
  const evalsPath = join(SKILL_DIR, "EVALS.json");
  if (!existsSync(evalsPath)) {
    const initialEvals = {
      skill_name: "skill-creator",
      current_level: 1,
      levels: {
        1: {
          name: "Beginner",
          requirements: {
            min_usage_count: 0,
            min_success_rate: 0,
          },
        },
        2: {
          name: "Intermediate",
          requirements: {
            min_usage_count: 5,
            min_success_rate: 0.6,
          },
        },
        3: {
          name: "Advanced",
          requirements: {
            min_usage_count: 15,
            min_success_rate: 0.75,
          },
        },
        4: {
          name: "Expert",
          requirements: {
            min_usage_count: 30,
            min_success_rate: 0.85,
          },
        },
      },
      metrics: {
        total_usage_count: 0,
        success_count: 0,
        failure_count: 0,
        average_satisfaction: 0,
        last_evaluated: null,
      },
    };
    writeFileSync(evalsPath, JSON.stringify(initialEvals, null, 2), "utf-8");
    console.log("✓ EVALS.json を新規作成しました");
  }
  return evalsPath;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  // 引数解析
  const result = getArg(args, "--result");
  const phase = getArg(args, "--phase") || "unknown";
  const agent = getArg(args, "--agent") || "unknown";
  const notes = getArg(args, "--notes") || "";

  // 引数検証
  if (!result || !["success", "failure"].includes(result)) {
    console.error(
      "Error: --result は success または failure を指定してください",
    );
    process.exit(EXIT_ARGS_ERROR);
  }

  const timestamp = new Date().toISOString();

  // 1. LOGS.md に追記
  try {
    const logsPath = ensureLogsFile();
    const logEntry = `
## [${timestamp}]

- **Agent**: ${agent}
- **Phase**: ${phase}
- **Result**: ${result === "success" ? "✓ 成功" : "✗ 失敗"}
- **Notes**: ${notes || "なし"}

---
`;
    appendFileSync(logsPath, logEntry, "utf-8");
    console.log(`✓ LOGS.md に記録を追記しました`);
  } catch (err) {
    console.error(`Error: LOGS.md の更新に失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }

  // 2. EVALS.json を更新
  try {
    const evalsPath = ensureEvalsFile();
    const evalsData = JSON.parse(readFileSync(evalsPath, "utf-8"));

    // メトリクス更新
    evalsData.metrics.total_usage_count += 1;
    if (result === "success") {
      evalsData.metrics.success_count += 1;
    } else {
      evalsData.metrics.failure_count += 1;
    }
    evalsData.metrics.last_evaluated = timestamp;

    // 成功率計算
    const successRate =
      evalsData.metrics.total_usage_count > 0
        ? evalsData.metrics.success_count / evalsData.metrics.total_usage_count
        : 0;

    console.log(
      `✓ メトリクス更新: 使用回数=${evalsData.metrics.total_usage_count}, 成功率=${(successRate * 100).toFixed(1)}%`,
    );

    // 3. レベルアップ条件チェック
    const currentLevel = evalsData.current_level;
    const nextLevel = currentLevel + 1;

    if (evalsData.levels[nextLevel]) {
      const requirements = evalsData.levels[nextLevel].requirements;
      const canLevelUp =
        evalsData.metrics.total_usage_count >= requirements.min_usage_count &&
        successRate >= requirements.min_success_rate;

      if (canLevelUp) {
        evalsData.current_level = nextLevel;
        console.log(
          `🎉 レベルアップ: Level ${currentLevel} → Level ${nextLevel} (${evalsData.levels[nextLevel].name})`,
        );
      }
    }

    // EVALS.json を保存
    writeFileSync(evalsPath, JSON.stringify(evalsData, null, 2), "utf-8");
    console.log(`✓ EVALS.json を更新しました`);
  } catch (err) {
    console.error(`Error: EVALS.json の処理に失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }

  console.log(`\n✓ フィードバック記録完了: ${result}`);
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
