#!/usr/bin/env node

/**
 * スキル初期化スクリプト
 *
 * 18-skills.md §6.4 に準拠したスキルディレクトリを初期化します。
 *
 * 使用例:
 *   node init_skill.js my-new-skill --path .claude/skills
 *   node init_skill.js my-new-skill --path .claude/skills --resources agents,references
 *
 * 終了コード:
 *   0: 成功
 *   1: 一般的なエラー
 *   2: 引数エラー
 *   3: ファイル不在（パスが存在しない）
 */

import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_PATH_NOT_FOUND = 3;

const DEFAULT_RESOURCES = ["agents", "scripts", "references", "assets"];
const ALLOWED_RESOURCES = new Set(DEFAULT_RESOURCES);

function showHelp() {
  console.log(`
スキル初期化スクリプト (18-skills.md §6.4 準拠)

Usage:
  node init_skill.js <skill-name> [options]

Arguments:
  <skill-name>    スキル名（ハイフンケース、最大64文字）

Options:
  --path <path>   スキルを作成するベースパス（デフォルト: .claude/skills）
  --resources <list>
                  作成するリソースを指定（例: agents,scripts,references,assets）
                  all/none も指定可（デフォルト: all）
  -h, --help      このヘルプを表示

Examples:
  node init_skill.js my-new-skill
  node init_skill.js my-new-skill --path .claude/skills
  node init_skill.js my-new-skill --resources agents,references

Created structure (selected resources only):
  <skill-name>/
  ├── SKILL.md          # メインファイル（TODO付きテンプレート）
  ├── agents/           # Task仕様書ディレクトリ（任意）
  ├── scripts/          # スクリプトディレクトリ（任意）
  │   └── log_usage.js # フィードバック記録スクリプト（scripts指定時のみ）
  ├── references/       # 参照資料ディレクトリ（任意）
  └── assets/           # アセットディレクトリ（任意）
  `);
}

function validateSkillName(name) {
  if (!name) {
    return { valid: false, error: "スキル名が指定されていません" };
  }
  if (name.length > 64) {
    return { valid: false, error: "スキル名は64文字以内である必要があります" };
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    return {
      valid: false,
      error:
        "スキル名はハイフンケース（小文字、数字、ハイフン）である必要があります",
    };
  }
  return { valid: true };
}

function parseResources(value) {
  if (!value) {
    return { valid: true, resources: DEFAULT_RESOURCES };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: true, resources: [] };
  }

  if (trimmed === "all") {
    return { valid: true, resources: DEFAULT_RESOURCES };
  }

  if (trimmed === "none") {
    return { valid: true, resources: [] };
  }

  const resources = trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const unknown = resources.filter((item) => !ALLOWED_RESOURCES.has(item));
  if (unknown.length > 0) {
    return {
      valid: false,
      error: `未知のリソース指定: ${unknown.join(", ")}`,
    };
  }

  return { valid: true, resources: [...new Set(resources)] };
}

function createSkillTemplate(skillName, resources, includeLogUsage) {
  const today = new Date().toISOString().split("T")[0];
  const resourceSections = [];

  if (resources.includes("references")) {
    resourceSections.push(`### references/

- **TODO**: See [references/TODO.md](references/TODO.md)`);
  }

  if (resources.includes("scripts")) {
    const scriptLines = [];
    if (includeLogUsage) {
      scriptLines.push("- `scripts/log_usage.js`: フィードバック記録");
    }
    scriptLines.push("- TODO: 必要なスクリプトを追加");
    resourceSections.push(`### scripts/

${scriptLines.join("\n")}`);
  }

  if (resources.includes("assets")) {
    resourceSections.push(`### assets/

- TODO: テンプレート/素材を配置`);
  }

  const resourceBlock =
    resourceSections.length > 0
      ? `## リソース参照

${resourceSections.join("\n\n")}
`
      : "";

  return `---
name: ${skillName}
description: |
  TODO: スキルの概要説明（2-3行）

  Anchors:
  • TODO: アンカー名 / 適用: 適用範囲 / 目的: 目的

  Trigger:
  TODO: 発動条件を日本語で記述。
tags:
  - TODO
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# ${skillName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")}

## 概要

TODO: 1-2文でスキルの目的を説明

## ワークフロー

### Phase 1: TODO

**目的**: TODO

**アクション**:
1. TODO

### Phase 2: TODO

**目的**: TODO

**アクション**:
1. TODO

## ベストプラクティス

### すべきこと

- TODO

### 避けるべきこと

- TODO

${resourceBlock}

## 変更履歴

| Version | Date       | Changes  |
|---------|------------|----------|
| 1.0.0   | ${today} | 初版作成 |
`;
}

function createLogUsageScript() {
  return `#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * 18-skills.md §7.3 に準拠したフィードバック記録を行います。
 */

import { appendFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ARGS_ERROR = 2;

function showHelp() {
  console.log(\`
Usage: node log_usage.js [options]

Options:
  --result <success|failure>  実行結果（必須）
  --phase <name>              実行したPhase名（任意）
  --agent <name>              実行したエージェント名（任意）
  --notes <text>              追加のフィードバックメモ（任意）
  -h, --help                  このヘルプを表示
  \`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const getArg = (name) => {
    const index = args.indexOf(name);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };

  const result = getArg("--result");
  const phase = getArg("--phase") || "unknown";
  const agent = getArg("--agent") || "unknown";
  const notes = getArg("--notes") || "";

  if (!result || !["success", "failure"].includes(result)) {
    console.error("Error: --result は success または failure を指定してください");
    process.exit(EXIT_ARGS_ERROR);
  }

  const timestamp = new Date().toISOString();
  const logEntry = \`
## [\${timestamp}]
- Agent: \${agent}
- Phase: \${phase}
- Result: \${result}
- Notes: \${notes || "なし"}
---
\`;

  const logsPath = join(SKILL_DIR, "LOGS.md");

  try {
    appendFileSync(logsPath, logEntry, "utf-8");
    console.log(\`✓ フィードバックを記録しました: \${result}\`);
  } catch (err) {
    // LOGS.md が存在しない場合は新規作成
    const header = \`# Skill Usage Logs

このファイルにはスキルの使用記録が追記されます。

---
\`;
    appendFileSync(logsPath, header + logEntry, "utf-8");
    console.log(\`✓ LOGS.md を作成し、フィードバックを記録しました\`);
  }

  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(\`Error: \${err.message}\`);
  process.exit(1);
});
`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  // 引数解析
  const skillName = args.find((arg) => !arg.startsWith("-"));
  const pathIndex = args.indexOf("--path");
  const basePath =
    pathIndex !== -1 && args[pathIndex + 1]
      ? args[pathIndex + 1]
      : ".claude/skills";
  const resourcesIndex = args.indexOf("--resources");
  const resourcesValue =
    resourcesIndex !== -1 ? args[resourcesIndex + 1] : null;

  // スキル名検証
  const validation = validateSkillName(skillName);
  if (!validation.valid) {
    console.error(`Error: ${validation.error}`);
    process.exit(EXIT_ARGS_ERROR);
  }

  if (
    resourcesIndex !== -1 &&
    (!resourcesValue || resourcesValue.startsWith("-"))
  ) {
    console.error("Error: --resources の値が指定されていません");
    process.exit(EXIT_ARGS_ERROR);
  }

  const resourcesResult = parseResources(resourcesValue);
  if (!resourcesResult.valid) {
    console.error(`Error: ${resourcesResult.error}`);
    process.exit(EXIT_ARGS_ERROR);
  }

  const resources = resourcesResult.resources;
  const includeLogUsage = resources.includes("scripts");

  // ベースパス存在確認
  if (!existsSync(basePath)) {
    console.error(`Error: ベースパスが存在しません: ${basePath}`);
    process.exit(EXIT_PATH_NOT_FOUND);
  }

  const skillDir = join(basePath, skillName);

  // 既存スキルの確認（冪等性: 既存の場合はスキップ）
  if (existsSync(skillDir)) {
    console.log(`ℹ スキルディレクトリは既に存在します: ${skillDir}`);
    console.log("  既存のファイルは上書きされません（冪等性）");
    process.exit(EXIT_SUCCESS);
  }

  // ディレクトリ作成
  const dirs = resources;

  try {
    mkdirSync(skillDir, { recursive: true });
    for (const dir of dirs) {
      mkdirSync(join(skillDir, dir), { recursive: true });
    }

    // SKILL.md 作成
    writeFileSync(
      join(skillDir, "SKILL.md"),
      createSkillTemplate(skillName, resources, includeLogUsage),
      "utf-8",
    );

    if (includeLogUsage) {
      // log_usage.js 作成
      writeFileSync(
        join(skillDir, "scripts", "log_usage.js"),
        createLogUsageScript(),
        "utf-8",
      );
    }

    const createdItems = [join(skillDir, "SKILL.md")];
    for (const dir of resources) {
      createdItems.push(`${join(skillDir, dir)}/`);
    }
    if (includeLogUsage) {
      createdItems.push(join(skillDir, "scripts", "log_usage.js"));
    }

    const nextSteps = ["SKILL.md の TODO を編集"];
    if (resources.includes("agents")) {
      nextSteps.push("必要に応じて agents/*.md を作成");
    }
    if (resources.includes("references")) {
      nextSteps.push("必要に応じて references/*.md を作成");
    }
    nextSteps.push("quick_validate.js で検証");

    console.log(`✓ スキルを初期化しました: ${skillDir}`);
    console.log(`
作成された内容:
${createdItems.map((item) => `  - ${item}`).join("\n")}

次のステップ:
${nextSteps.map((step, index) => `  ${index + 1}. ${step}`).join("\n")}
`);

    process.exit(EXIT_SUCCESS);
  } catch (err) {
    console.error(`Error: ディレクトリ作成に失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
