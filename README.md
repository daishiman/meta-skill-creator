# Meta Skill Creator

スキルを作成・更新・プロンプト改善するためのメタスキル。
ユーザーと対話しながら共創し、抽象的なアイデアから具体的な実装まで柔軟に対応します。

[![Version](https://img.shields.io/badge/version-5.2.1-blue.svg)](./docs/CHANGELOG.md)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-purple.svg)]()

---

## インストール

```bash
# マーケットプレイスを追加
/plugin marketplace add daishiman/meta-skill-creator

# プラグインをインストール
/plugin install daishi-skill-creator@meta-skill-creator
```

Claude Code を再起動して完了。

---

## 使い方

Claude Code に話しかけるだけ：

```
「新しいスキルを作成したい」
「〇〇を自動化するスキルを作って」
「毎日のレポート作成を自動化したい」
「このスキルのプロンプトを改善して」
```

または `/skill-creator` コマンドでスキルを呼び出し：

```
/skill-creator
```

---

## 特徴

| 特徴 | 説明 |
|------|------|
| **Collaborative Mode** | インタビュー形式でユーザーと対話しながらスキルを共創 |
| **Orchestrate Mode** | Claude Code / Codex を使い分けて最適な実行エンジンを選択 |
| **24種類のスクリプトタイプ** | API、データ処理、開発ツールなど幅広く対応 |
| **Progressive Disclosure** | 必要な時に必要なリソースのみ読み込み |
| **Self-Contained Skills** | 各スキルが独自の依存関係を管理（PNPM対応） |

### 高度な機能

| 機能 | 説明 |
|------|------|
| **オーケストレーション** | 複数スキルを組み合わせて複雑なワークフローを実現 |
| **イベントトリガー** | ファイル変更、時刻、外部イベントでスキルを自動実行 |
| **並列実行** | 複数のタスクを同時実行して処理を高速化 |
| **スキルチェーン** | スキルを連鎖させて段階的な処理フローを構築 |
| **スケジューラ** | Cron形式で定期実行タスクを設定 |
| **条件分岐フロー** | 実行結果に応じて処理を分岐 |
| **API ドキュメント生成** | スキルのAPI仕様書を自動生成 |
| **セットアップガイド** | インストールから使用開始までのガイドを自動生成 |
| **公式ドキュメント取得** | 外部ライブラリの最新ドキュメントを自動取得 |
| **統合推奨** | スキルに適したツール・ライブラリを提案 |

---

## 動作要件

| 要件 | バージョン |
|------|------------|
| Claude Code | 1.0.0以上 |
| Node.js | 18.0.0以上 |

---

## ドキュメント

- [インストールガイド](./docs/INSTALLATION.md)
- [詳細な使い方](./docs/USAGE.md)
- [トラブルシューティング](./docs/TROUBLESHOOTING.md)

---

## ライセンス

MIT License

---

## サポート

[Issues](https://github.com/daishiman/meta-skill-creator/issues)
