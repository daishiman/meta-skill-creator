# インストールガイド

Meta Skill Creatorをインストールして使い始めるための詳細ガイドです。

---

## 動作要件

| 要件 | バージョン |
|------|------------|
| Claude Code | 1.0.0以上 |
| Node.js | 18.0.0以上 |

---

## インストール方法

### 方法1: GitHubマーケットプレイス経由（推奨）

```bash
# Step 1: マーケットプレイスを追加
/plugin marketplace add daishiman/meta-skill-creator

# Step 2: プラグインをインストール
/plugin install daishi-skill-creator@meta-skill-creator

# Step 3: Claude Code を再起動
```

### 方法2: ローカル開発用

開発者向けのローカルインストール方法：

```bash
# リポジトリをクローン
git clone https://github.com/daishiman/meta-skill-creator.git
cd meta-skill-creator

# シンボリックリンクを作成
ln -sf $(pwd) ~/.claude/plugins/marketplaces/meta-skill-creator

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

Meta Skill Creatorが応答すれば成功です。

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
├── assets/            # テンプレート・素材
├── references/        # 参照ドキュメント
├── schemas/           # JSONスキーマ
└── scripts/           # 自動化スクリプト
```

- `SKILL.md` - 唯一の必須ファイル。YAMLフロントマターとMarkdown指示で構成
- `agents/` - サブタスク用のエージェント定義
- `scripts/` - 決定論的処理を行う自動化スクリプト
- `references/` - Progressive Disclosureで必要時に読み込む参照情報

---

## アップデート

```bash
/plugin update daishi-skill-creator@meta-skill-creator
```

---

## アンインストール

```bash
/plugin uninstall daishi-skill-creator@meta-skill-creator
```

---

## トラブルシューティング

問題が発生した場合は、[TROUBLESHOOTING.md](TROUBLESHOOTING.md)を参照してください。
