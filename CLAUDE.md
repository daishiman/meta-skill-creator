# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Meta Skill Creator** - スキルを作成・更新・プロンプト改善するためのメタスキル。

## プラグイン構造

```
meta-skill-creator/
├── .claude-plugin/
│   └── plugin.json          # プラグインメタデータ（必須）
├── skills/                  # スキル配置ディレクトリ
│   └── skill-creator/       # メインスキル
│       ├── SKILL.md         # スキル定義（必須）
│       ├── agents/          # サブエージェント定義
│       ├── assets/          # テンプレート・素材
│       ├── references/      # 参照ドキュメント（Progressive Disclosure）
│       ├── schemas/         # JSONスキーマ
│       └── scripts/         # 自動化スクリプト（決定論的処理）
├── docs/                    # ユーザー向けドキュメント
├── .gitignore
├── README.md
└── CLAUDE.md
```

### ディレクトリ配置について

| 用途 | パス | 説明 |
|------|------|------|
| プロジェクト固有スキル | `.claude/skills/` | プロジェクト内でのみ使用 |
| **プラグイン配布** | `skills/` | ルート直下に配置（本プラグイン） |

## コマンド

### バリデーション

```bash
node skills/skill-creator/scripts/validate_all.js skills/skill-creator
node skills/skill-creator/scripts/quick_validate.js skills/skill-creator
```

### スキル生成

```bash
node skills/skill-creator/scripts/init_skill.js <skill-name> --path skills
node skills/skill-creator/scripts/detect_mode.js --request "新規スキル"
```

## 設計原則

| 原則 | 説明 |
|------|------|
| **Collaborative First** | ユーザーとの対話を通じて要件を明確化 |
| **Script First** | 決定論的処理はスクリプトで実行 |
| **Progressive Disclosure** | 必要な時に必要なリソースのみ読み込み |

## モード

| モード | 用途 |
|--------|------|
| **collaborative** | ユーザー対話型スキル共創（推奨） |
| **orchestrate** | 実行エンジン選択（Claude/Codex） |
| create | 新規スキル作成 |
| update | 既存スキル更新 |
| improve-prompt | プロンプト改善 |

## インストール

```bash
/plugin install daishiman/meta-skill-creator
```
