# トラブルシューティング

Meta Skill Creatorで発生する可能性のある問題と解決方法をまとめています。

---

## 目次

- [インストールの問題](#インストールの問題)
- [実行時の問題](#実行時の問題)
- [スキル作成の問題](#スキル作成の問題)
- [Codex連携の問題](#codex連携の問題)
- [バリデーションエラー](#バリデーションエラー)

---

## インストールの問題

### プラグインが認識されない

**症状**: 「スキル作成」と言っても反応がない

**解決方法**:

1. プラグインの確認
   ```bash
   /plugin list
   ```
   `meta-skill-creator`が表示されることを確認

2. 再インストール
   ```bash
   /plugin uninstall meta-skill-creator
   /plugin install daishiman/meta-skill-creator
   ```

3. Claude Codeを再起動

### Node.jsバージョンエラー

**症状**: スクリプト実行時に構文エラー

**解決方法**:

```bash
# バージョン確認
node --version

# v18以上にアップデート
nvm install 18
nvm use 18
```

---

## 実行時の問題

### スクリプト実行エラー

**症状**: `Error: Cannot find module`

**解決方法**:

1. プラグインディレクトリの確認
   ```bash
   /plugin info meta-skill-creator
   ```

2. 依存関係の確認

### メモリ不足エラー

**症状**: JavaScript heap out of memory

**解決方法**:

```bash
# メモリ制限を増やす
NODE_OPTIONS="--max-old-space-size=4096" node scripts/validate_all.js
```

---

## スキル作成の問題

### インタビューが始まらない

**症状**: Collaborativeモードでインタビューが開始されない

**解決方法**:

1. 明示的にモードを指定
   ```
   「Collaborativeモードでスキルを作成したい」
   ```

2. プラグインの再インストール

### スキル生成が失敗する

**症状**: Phase 4で停止する

**解決方法**:

1. エラーメッセージを確認
2. 一時ファイルをクリア
3. より具体的な要件を指定して再試行

---

## Codex連携の問題

### Codexに接続できない

**症状**: `Error: Codex CLI not found`

**解決方法**:

1. Codex CLIの確認
   ```bash
   which codex
   codex --version
   ```

2. PATHの確認
   ```bash
   echo $PATH
   ```

### Codexタスクがタイムアウト

**症状**: Codex実行が時間切れ

**解決方法**:

1. タスクを小さく分割
2. ネットワーク接続を確認

---

## バリデーションエラー

### 構造検証エラー

**症状**: `Structure validation failed`

**解決方法**:

1. 必須ファイルの確認（SKILL.mdが必須）
2. ディレクトリ構造の確認

### リンク検証エラー

**症状**: `Broken link detected`

**解決方法**:

1. 壊れたリンクの特定
2. リンク先の修正または削除

---

## よくある質問

### Q: インストール場所はどこですか？

A: プラグインは `~/.claude/plugins/` にインストールされます。

### Q: 作成したスキルはどこに保存されますか？

A: 作成したスキルはカレントプロジェクトの `skills/` ディレクトリに生成されます。

### Q: 他の人と共有するには？

A: 作成したスキルを含むディレクトリをGitHubにプッシュし、プラグインとして配布できます。

---

## サポート

上記で解決しない場合は、以下の情報を添えて[Issues](https://github.com/daishiman/meta-skill-creator/issues)で報告してください：

1. エラーメッセージ（全文）
2. 実行したコマンド
3. 環境情報
   - OS: `uname -a`
   - Node.js: `node --version`
   - Claude Code: `claude --version`
4. 再現手順
