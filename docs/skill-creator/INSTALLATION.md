# インストールガイド

Skill Creatorをインストールして使い始めるための詳細ガイドです。

---

## 重要: Claude Codeが必要です

> **このプラグインはClaude Code上で動作します。**
> ターミナルで直接実行するものではありません。

### Claude Codeとは？

Claude CodeはAnthropicが提供するAIアシスタントアプリケーションです。
プラグインをインストールして機能を拡張できます。

**ダウンロード**: https://claude.ai/download

---

## 動作要件

| 要件 | バージョン | 備考 |
|------|------------|------|
| Claude Code | 1.0.0以上 | **必須** - アプリケーションをインストール |
| Node.js | 18.0.0以上 | スクリプト実行に必要 |

---

## インストール方法

### 方法1: GitHubマーケットプレイス経由（推奨）

**前提**: Claude Codeを起動した状態で実行してください。

```bash
# Step 1: マーケットプレイスを追加
/plugin marketplace add daishiman/daishiman-skills

# Step 2: プラグインをインストール
/plugin install daishiman-skill-creator

# Step 3: Claude Code を再起動
```

### 方法2: ローカル開発用

開発者向けのローカルインストール方法：

```bash
# リポジトリをクローン
git clone https://github.com/daishiman/daishiman-skills.git
cd daishiman-skills

# シンボリックリンクを作成
ln -sf $(pwd) ~/.claude/plugins/marketplaces/daishiman-skills

# known_marketplaces.json に追加（手動）
# ~/.claude/plugins/known_marketplaces.json を編集

# settings.json で有効化（手動）
# ~/.claude/settings.json の enabledPlugins に追加
```

---

## 動作確認

インストール後、Claude Codeで以下を実行：

```
「スキル作成」
```

問題発見フェーズが開始されれば成功です。

```
Claude: まず、解決したい問題を特定させてください。
        なぜこのスキルが必要ですか？
        1. 日常タスクの自動化
        2. 開発ワークフローの改善
        ...
```

---

## プラグイン構造について

### なぜ `skills/` がルート直下にあるのか

Claude Codeでは、スキルの配置場所が用途によって異なります：

| 用途 | 配置場所 | 説明 |
|------|----------|------|
| プロジェクト固有 | `.claude/skills/` | そのプロジェクト内でのみ使用 |
| **プラグイン配布** | `skills/` | 他のユーザーに配布する場合 |

本プラグインは配布用のため、`skills/` をルート直下に配置しています。

### スキル内部構造

```
skills/skill-creator/
├── SKILL.md           # スキル定義（必須）
├── agents/            # サブエージェント定義
│   ├── discover-problem.md          # 問題発見（Phase 0-0）
│   ├── model-domain.md              # ドメインモデリング（Phase 0.5）
│   ├── interview-user.md            # インタビュー（Phase 0-1〜0-8）
│   ├── select-resources.md          # リソース自動選択
│   ├── resolve-skill-dependencies.md  # クロススキル依存解決（Phase 2.5）
│   ├── delegate-to-external-cli.md    # 外部CLIエージェント委譲（Phase 4.5）
│   ├── design-multi-skill.md          # マルチスキル同時設計（Phase 0.9）
│   └── ...
├── references/        # 参照ドキュメント
│   ├── resource-map.md                    # リソース一覧
│   ├── core-principles.md                 # コア原則
│   ├── problem-discovery-framework.md     # 問題発見フレームワーク
│   ├── domain-modeling-guide.md           # ドメインモデリングガイド
│   ├── clean-architecture-for-skills.md   # Clean Architecture
│   ├── cross-skill-reference-patterns.md  # クロススキル参照パターン
│   ├── external-cli-agents-guide.md       # 外部CLIエージェントガイド
│   ├── integration-patterns.md            # 統合パターン（索引）
│   └── ...
├── scripts/           # 自動化スクリプト
│   ├── validate_all.js
│   ├── quick_validate.js
│   └── ...
├── schemas/           # JSONスキーマ
│   ├── problem-definition.json     # 問題定義
│   ├── domain-model.json           # ドメインモデル
│   ├── interview-result.json       # インタビュー結果
│   ├── skill-dependency-graph.json # クロススキル依存グラフ
│   ├── multi-skill-graph.json      # マルチスキル設計グラフ
│   ├── external-cli-result.json    # 外部CLI実行結果
│   └── ...
└── assets/            # テンプレート・素材
    └── ...
```

- `SKILL.md` - 唯一の必須ファイル。YAMLフロントマターとMarkdown指示で構成
- `agents/` - 問題発見、ドメインモデリング、インタビュー、依存解決、マルチスキル設計などのサブタスク用エージェント
- `scripts/` - バリデーション、生成などの決定論的処理（`utils.js`で共通ユーティリティを統一）
- `schemas/` - problem-definition、domain-model、interview-result、skill-dependency-graph等の構造化データ定義
- `references/` - Progressive Disclosureで必要時に読み込む参照情報

---

## アップデート

```bash
/plugin update daishiman-skill-creator
```

---

## アンインストール

```bash
/plugin uninstall daishiman-skill-creator
```

---

## インストール後の使い方

インストールが完了したら、以下のように使用できます：

### 基本的な流れ

1. **スキル作成を依頼** - Claude Codeに話しかけるだけ
2. **問題発見** - 5 Whysで根本原因を分析（Phase 0-0）
3. **ドメインモデリング** - DDD戦略設計でスキル構造を設計（Phase 0.5）
4. **インタビューに回答** - 8段階の質問に答える（選択肢から選ぶだけ）
5. **スキル生成** - 回答に基づいて最適なスキルが自動生成される

### 使用例

```
「新しいスキルを作成したい」
「GitHubのPRを自動でSlackに通知するスキルを作って」
「毎日のレポート作成を自動化したい」
```

詳細な使い方は[USAGE.md](USAGE.md)を参照してください。

---

## トラブルシューティング

問題が発生した場合は、[TROUBLESHOOTING.md](TROUBLESHOOTING.md)を参照してください。

### よくある問題

**Q: プラグインが認識されない**

```bash
# プラグイン一覧を確認
/plugin list

# 再インストール
/plugin uninstall daishiman-skill-creator
/plugin install daishiman-skill-creator
```

**Q: Node.jsバージョンが古い**

```bash
# バージョン確認
node --version

# v18以上にアップデート
nvm install 18
nvm use 18
```
