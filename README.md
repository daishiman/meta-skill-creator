# Meta Skill Creator

スキルを作成・更新・プロンプト改善するためのメタスキル。
ユーザーと対話しながら共創し、抽象的なアイデアから具体的な実装まで柔軟に対応します。

[![Version](https://img.shields.io/badge/version-5.2.1-blue.svg)](./docs/CHANGELOG.md)
[![Language](https://img.shields.io/badge/language-日本語-green.svg)]()
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-purple.svg)]()

---

## インストール

### Step 1: マーケットプレイスを追加

```bash
/plugin marketplace add daishiman/meta-skill-creator
```

### Step 2: プラグインをインストール

```bash
/plugin install skill-creator
```

インストール後、Claude Code に話しかけるだけ：

```
「新しいスキルを作成したい」
```

---

## 特徴

- **Collaborative Mode** - インタビュー形式でユーザーと対話しながらスキルを共創
- **Orchestrate Mode** - Claude Code / Codex を使い分けて最適な実行エンジンを選択
- **24種類のスクリプトタイプ** - API、データ処理、開発ツールなど幅広く対応
- **Progressive Disclosure** - 必要な時に必要なリソースのみ読み込み
- **Self-Improvement** - 使用ログを分析して自動的にスキルを改善

---

## 使い方

### スキル作成

```
「〇〇を自動化するスキルを作って」
「毎日のレポート作成を自動化したい」
```

### スキル更新

```
「〇〇スキルを更新して」
```

### プロンプト改善

```
「このスキルのプロンプトを改善して」
```

---

## 抽象度レベル

要件の抽象度に応じて、適切にヒアリングを行います：

| レベル | 説明 | 例 |
|--------|------|-----|
| **L1: Concept** | アイデア・課題レベル | 「開発効率を上げたい」 |
| **L2: Capability** | 機能・能力レベル | 「PRを自動作成したい」 |
| **L3: Implementation** | 実装・詳細レベル | 「GitHub APIでPR作成」 |

---

## モード

### Collaborative（推奨）

ユーザーと対話しながらスキルを共創：

1. 初期ヒアリング → 抽象度レベル判定
2. 機能ヒアリング → 必要な機能特定
3. 構成ヒアリング → 構成タイプ選択
4. 要件確認 → スキル生成

### Orchestrate

実行エンジンを選択：

| エンジン | 用途 |
|----------|------|
| **claude** | ファイル編集、Git操作 |
| **codex** | 独立タスク、別視点分析 |
| **claude-to-codex** | コンテキスト共有が必要な複合タスク |

---

## プラグイン構造

```
meta-skill-creator/
├── .claude-plugin/
│   ├── marketplace.json     # マーケットプレイス定義（配布用）
│   └── plugin.json          # プラグインメタデータ（詳細設定）
├── skills/
│   └── skill-creator/       # メインスキル
│       ├── SKILL.md         # スキル定義（必須）
│       ├── agents/          # サブエージェント定義
│       ├── assets/          # テンプレート・素材
│       ├── references/      # 参照ドキュメント
│       ├── schemas/         # JSONスキーマ
│       └── scripts/         # 自動化スクリプト
├── docs/
│   ├── CHANGELOG.md         # 変更履歴
│   ├── INSTALLATION.md      # インストール詳細
│   └── TROUBLESHOOTING.md   # トラブルシューティング
├── .gitignore
├── README.md
└── CLAUDE.md
```

### なぜ `skills/` がルート直下にあるのか

Claude Code プラグインの仕様：

| 用途 | スキルの配置場所 |
|------|-----------------|
| プロジェクト固有 | `.claude/skills/` |
| **プラグイン配布** | `skills/` （ルート直下） ✅ |

プラグインとして配布する場合、`skills/` はルート直下に配置する必要があります。

### marketplace.json と plugin.json

プラグイン配布には両方のファイルが必要です：

| ファイル | 役割 | 必須項目 |
|----------|------|----------|
| **marketplace.json** | 配布用レジストリ定義 | `name`, `description`, `owner`, `plugins[]` |
| **plugin.json** | プラグインマニフェスト | `name`, `version`, `description`, `author`, `components` |

**marketplace.json** - `/plugin marketplace add` で使用：
```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "meta-skill-creator",
  "description": "マーケットプレイスの説明",
  "owner": { "name": "daishiman" },
  "plugins": [
    { "name": "skill-creator", "source": "./" }
  ]
}
```

**plugin.json** - プラグインの基本設定とコンポーネントパスを定義：
```json
{
  "name": "skill-creator",
  "version": "5.2.1",
  "description": "...",
  "author": { "name": "daishiman" },
  "components": {
    "skills": ["skills/skill-creator/"]
  }
}
```

> **注意**: plugin.json には `name`, `version`, `description`, `author`, `repository`, `keywords`, `license`, `components` のみ使用可能。その他のフィールド（activation, modes等）は無効です。

---

## スクリプトタイプ（24種類）

| カテゴリ | タイプ |
|----------|--------|
| API関連 | api-client, webhook, scraper, notification |
| データ処理 | parser, transformer, aggregator, file-processor |
| ストレージ | database, cache, queue |
| 開発ツール | git-ops, test-runner, linter, formatter, builder |
| インフラ | deployer, docker, cloud, monitor |
| 統合 | ai-tool, mcp-bridge, shell |
| 汎用 | universal |

---

## 設計原則

| 原則 | 説明 |
|------|------|
| **Collaborative First** | ユーザーとの対話を通じて要件を明確化 |
| **Script First** | 決定論的処理はスクリプトで実行（100%精度） |
| **Progressive Disclosure** | 必要な時に必要なリソースのみ読み込み |

---

## ドキュメント

- [インストール詳細](./docs/INSTALLATION.md)
- [変更履歴](./docs/CHANGELOG.md)
- [トラブルシューティング](./docs/TROUBLESHOOTING.md)

---

## 動作要件

- Claude Code 1.0.0以上
- Node.js 18.0.0以上

---

## ライセンス

MIT License

---

## サポート

[Issues](https://github.com/daishiman/meta-skill-creator/issues)
