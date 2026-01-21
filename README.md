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
