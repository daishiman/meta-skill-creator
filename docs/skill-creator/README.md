# Skill Creator

スキルを作成・更新・プロンプト改善するためのメタスキル。
**問題の本質を特定**し、**対話形式のインタビュー**でユーザーの要件を引き出し、最適なスキルを自動生成します。

---

## 機能

| 機能 | 説明 |
|------|------|
| **Problem First** | 5 Whysで根本原因を分析し、本質的な問題を特定 |
| **DDD / Clean Architecture** | ドメイン構造を明確化し、層分離設計で変更に強いスキルを生成 |
| **対話型インタビュー** | 問題発見→ドメインモデリング→8段階の質問で要件を明確化 |
| **interviewDepth** | quick/standard/detailedの3段階で質問量を調整 |
| **Collaborativeモード** | ユーザーと対話しながらスキルを共創（推奨） |
| **Orchestrateモード** | Claude Code / Codex / Gemini を使い分けて最適な実行エンジンを選択 |
| **マルチスキル設計** | 複数スキルを一度に設計し、依存関係グラフで管理 |
| **クロススキル依存解決** | 他スキルの公開インターフェースを特定して依存関係を自動解決 |
| **外部CLIエージェント** | Gemini CLI等の外部CLIツールをサブタスク実行に活用 |
| **24種類のスクリプトタイプ** | API連携、データ処理、開発ツールなど幅広く対応 |
| **Progressive Disclosure** | 必要な時に必要なリソースのみ読み込み |

---

## クイックスタート

Claude Codeに話しかけるだけでワークフローが開始されます：

```
「新しいスキルを作成したい」
「〇〇を自動化するスキルを作って」
「毎日のレポート作成を自動化したい」
```

または `/skill-creator` コマンドで直接呼び出し：

```
/skill-creator
```

---

## ワークフロー概要

```
Phase 0-0: 問題発見 → problem-definition.json
      ↓
Phase 0.5: ドメインモデリング → domain-model.json
      ↓
Phase 0-1〜0-8: インタビュー → interview-result.json
      ↓
[分岐] multiSkillPlan がある場合:
  Phase 0.9: マルチスキル設計 → multi-skill-graph.json
  → 各サブスキルに対して以下を繰り返し
      ↓
リソース選択 → resource-selection.json
      ↓
Phase 1: 要求分析 → Phase 2: 設計
      ↓
[条件] skillDependencies がある場合:
  Phase 2.5: 依存関係解決 → skill-dependency-graph.json
      ↓
Phase 3: 構造計画 → Phase 4: 生成
      ↓
[条件] externalCliAgents がある場合:
  Phase 4.5: 外部CLIエージェント委譲 → external-cli-result.json
      ↓
Phase 5: レビュー → Phase 6: 検証
```

---

## 設計原則

| 原則 | 説明 |
|------|------|
| **Problem First** | 機能の前に本質的な問題を特定する |
| **Collaborative First** | ユーザーとの対話を通じて要件を明確化 |
| Domain-Driven Design | ドメイン構造を明確化し高精度な設計を導く |
| Clean Architecture | 層分離と依存関係ルールで変更に強い構造 |
| Script First | 決定論的処理はスクリプトで実行 |
| Progressive Disclosure | 必要な時に必要なリソースのみ読み込み |

---

## モード

| モード | 用途 |
|--------|------|
| **collaborative** | ユーザー対話型スキル共創（推奨） |
| **orchestrate** | 実行エンジン選択（Claude/Codex） |
| create | 新規スキル作成 |
| update | 既存スキル更新 |
| improve-prompt | プロンプト改善 |

---

## 高度な機能

### オーケストレーション

複数のスキルを組み合わせて複雑なワークフローを実現：

| パターン | 説明 | 使用例 |
|----------|------|--------|
| chain | 順次実行 | データ取得→変換→保存 |
| parallel | 並列実行 | 複数APIから同時取得 |
| conditional | 条件分岐 | 成功→ログ、失敗→通知 |

### マルチスキル設計

複数のスキルを一度に設計し、依存関係グラフで管理：

- **依存関係グラフ**: スキル間の依存関係をDAGで可視化
- **creationOrder**: 依存関係に基づく最適な作成順序を自動決定
- **失敗リカバリ**: 一部のスキル生成が失敗しても残りを継続

### クロススキル依存解決

他のスキルのSKILL.mdを読み込み、公開インターフェースを特定：

- **相対パス参照**: `../other-skill/scripts/utils.js` のように相対パスで参照
- **インターフェース特定**: 他スキルのエントリポイントを自動検出

### 外部CLIエージェント

Gemini CLI等の外部CLIツールをサブタスク実行に活用：

- **Gemini CLI**: Google Geminiを実行エンジンとして利用
- **任意のCLI**: コマンドラインインターフェースを持つ任意のツールと連携

### イベントトリガー

| タイプ | 説明 | 例 |
|--------|------|-----|
| file | ファイル変更を監視 | `*.md`ファイルの変更 |
| cron | 時刻ベース | 毎日9:00 |
| webhook | 外部イベント | GitHub webhook |

### ドキュメント自動生成

- **APIドキュメント**: エンドポイント、パラメータ、使用例を自動生成
- **セットアップガイド**: インストールから使用開始までの手順を自動生成

---

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [インストールガイド](INSTALLATION.md) | インストール手順、プラグイン構造 |
| [使い方ガイド](USAGE.md) | 各フェーズの詳細、ベストプラクティス |
| [トラブルシューティング](TROUBLESHOOTING.md) | 問題解決、FAQ |
| [変更履歴](CHANGELOG.md) | バージョン履歴 |

---

## 動作要件

| 要件 | バージョン |
|------|------------|
| Claude Code | 1.0.0以上 |
| Node.js | 18.0.0以上 |

---

[← daishiman-skills トップへ戻る](../../README.md)
