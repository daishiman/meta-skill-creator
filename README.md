# daishiman-skills

Claude Code用スキルコレクション。様々な用途のスキルをプラグインとして提供します。

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-purple.svg)]()

---

## 収録スキル

| スキル | 説明 | バージョン |
|--------|------|------------|
| **[skill-creator](docs/skill-creator/README.md)** | スキル作成・更新・プロンプト改善のためのメタスキル。Problem First + DDD/Clean Architectureで高品質なスキルを自動生成 | v10.5.0 |
| **[google-forms-generator](docs/google-forms-generator/README.md)** | Google Forms APIを使用したフォーム自動生成。対話形式で要件をヒアリングし、11種類の質問タイプに対応 | v1.3.0 |

---

## 前提条件

| 要件 | バージョン | 備考 |
|------|------------|------|
| Claude Code | 1.0.0以上 | **必須** - https://claude.ai/download |
| Node.js | 18.0.0以上 | スクリプト実行に必要 |

> **重要**: このプラグインは**Claude Code**上で動作します。ターミナルで直接実行するものではありません。

---

## インストール

### Step 1: マーケットプレイスを追加

Claude Codeを起動した状態で以下を実行：

```bash
/plugin marketplace add daishiman/daishiman-skills
```

### Step 2: スキルをインストール

必要なスキルを個別にインストールします：

#### Skill Creator（スキル作成メタツール）

```bash
/plugin install daishiman-skill-creator
```

#### Google Forms Generator（フォーム自動生成）

```bash
/plugin install daishiman-google-forms-generator
```

### Step 3: Claude Codeを再起動

インストール完了後、Claude Codeを再起動してください。

---

## アップグレード

各スキルを最新バージョンに更新するには：

```bash
# Skill Creatorをアップグレード
/plugin update daishiman-skill-creator

# Google Forms Generatorをアップグレード
/plugin update daishiman-google-forms-generator
```

---

## アンインストール

```bash
# Skill Creatorをアンインストール
/plugin uninstall daishiman-skill-creator

# Google Forms Generatorをアンインストール
/plugin uninstall daishiman-google-forms-generator
```

---

## ローカル開発用インストール

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

## 各スキルの概要

### Skill Creator

Claude Codeでスキルを作成・更新・プロンプト改善するためのメタスキル。

**主な機能：**

- **Problem First** - 5 Whysで問題の根本原因を特定してから設計
- **DDD / Clean Architecture** - ドメイン構造と層分離でスキルを設計
- **対話型インタビュー** - 8段階の質問で要件を明確化（quick/standard/detailedの3段階深度対応）
- **Collaborative / Orchestrate** - 2つのモードで柔軟に対応（Gemini CLIにも対応）
- **マルチスキル設計** - 複数スキルを一度に設計し依存関係グラフで管理
- **クロススキル依存解決** - 他スキルの公開インターフェースを自動特定
- **24種類のスクリプト** - API連携、データ処理、開発ツールなど

**使い方：**

Claude Codeに話しかけるだけでワークフローが開始されます：

```
「新しいスキルを作成したい」
「〇〇を自動化するスキルを作って」
```

詳細 → [Skill Creator ドキュメント](docs/skill-creator/README.md)

---

### Google Forms Generator

Google Forms APIを使用してフォームを自動生成するスキル。

**主な機能：**

- **11種類の質問タイプ** - 短文/長文/ラジオ/チェック/プルダウン/スケール/選択式グリッド/チェックボックスグリッド/日付/時刻/評価
- **フォーム設定** - クイズモード、メール収集、公開設定
- **高度な機能** - 条件分岐、セクション、画像/動画埋め込み
- **連携** - Google Drive（フォルダ移動）、Google Sheets（回答取得）
- **テンプレート** - 6種類のフォームパターンから素早く作成

**使い方：**

Claude Codeに話しかけるだけでワークフローが開始されます：

```
「Googleフォームを作成したい」
「アンケートフォームを作って」
```

詳細 → [Google Forms Generator ドキュメント](docs/google-forms-generator/README.md)

---

## ドキュメント

### Skill Creator

| ドキュメント | 内容 |
|-------------|------|
| [概要・詳細](docs/skill-creator/README.md) | 機能説明、設計原則、ワークフロー |
| [インストールガイド](docs/skill-creator/INSTALLATION.md) | インストール手順、プラグイン構造 |
| [使い方ガイド](docs/skill-creator/USAGE.md) | 各フェーズの詳細、ベストプラクティス |
| [トラブルシューティング](docs/skill-creator/TROUBLESHOOTING.md) | 問題解決、FAQ |
| [変更履歴](docs/skill-creator/CHANGELOG.md) | バージョン履歴 |

### Google Forms Generator

| ドキュメント | 内容 |
|-------------|------|
| [概要・詳細](docs/google-forms-generator/README.md) | 機能説明、対応質問タイプ、ワークフロー |
| [インストールガイド](docs/google-forms-generator/INSTALLATION.md) | OAuth認証設定、環境構築 |
| [使い方ガイド](docs/google-forms-generator/USAGE.md) | フォーム作成手順、テンプレート活用 |
| [トラブルシューティング](docs/google-forms-generator/TROUBLESHOOTING.md) | API エラー、認証問題の解決 |
| [変更履歴](docs/google-forms-generator/CHANGELOG.md) | バージョン履歴 |

---

## ライセンス

MIT License

---

## サポート

[Issues](https://github.com/daishiman/daishiman-skills/issues)
