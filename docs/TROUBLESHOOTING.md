# トラブルシューティング

Meta Skill Creatorで発生する可能性のある問題と解決方法をまとめています。

---

## 目次

- [インストールの問題](#インストールの問題)
- [インタビューの問題](#インタビューの問題)
- [スキル生成の問題](#スキル生成の問題)
- [実行時の問題](#実行時の問題)
- [Codex連携の問題](#codex連携の問題)
- [バリデーションエラー](#バリデーションエラー)
- [よくある質問](#よくある質問)

---

## インストールの問題

### プラグインが認識されない

**症状**: 「スキル作成」と言っても反応がない

**解決方法**:

1. プラグインの確認
   ```bash
   /plugin list
   ```
   `daishiman-skill-creator`が表示されることを確認

2. 再インストール
   ```bash
   /plugin uninstall daishiman-skill-creator
   /plugin install daishiman-skill-creator
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

## インタビューの問題

### インタビューが始まらない

**症状**: スキル作成を依頼してもインタビューが開始されない

**解決方法**:

1. 明示的にモードを指定
   ```
   「Collaborativeモードでスキルを作成したい」
   ```

2. より具体的な依頼をする
   ```
   「新しいスキルを作成したい。インタビューを開始してください」
   ```

3. プラグインの再インストール

### インタビューが途中で止まる

**症状**: 質問の途中で進行が止まる

**解決方法**:

1. 「続けてください」と伝える
2. 前の回答をもう一度伝える
3. セッションを新しく開始する

### 選択肢以外の回答をしたい

**症状**: 提示された選択肢に該当するものがない

**解決方法**:

- 「その他」を選択して自由記述
- 選択肢を選んだ後に補足説明を追加

```
「5（その他）を選択します。具体的には〇〇がしたいです」
```

---

## スキル生成の問題

### スキル生成が失敗する

**症状**: Phase 4（生成フェーズ）で停止する

**解決方法**:

1. エラーメッセージを確認
2. より具体的な要件を指定して再試行
3. シンプルな構成から始める
   ```
   「シンプル構成（SKILL.mdのみ）で作成して」
   ```

### 生成されたスキルが期待と違う

**症状**: 生成されたスキルが要件と異なる

**解決方法**:

1. インタビューで要件を明確に伝える
2. 生成後に修正を依頼
   ```
   「〇〇の部分を修正して」
   ```
3. プロンプト改善機能を使用
   ```
   「このスキルのプロンプトを改善して」
   ```

### 依存関係エラー

**症状**: 生成されたスクリプトが依存関係エラーで動かない

**解決方法**:

```bash
# 依存関係をインストール
cd skills/your-skill-name
npm install
# または
pnpm install
```

---

## 実行時の問題

### スクリプト実行エラー

**症状**: `Error: Cannot find module`

**解決方法**:

1. プラグインディレクトリの確認
   ```bash
   /plugin info daishiman-skill-creator
   ```

2. 依存関係の確認とインストール

### メモリ不足エラー

**症状**: JavaScript heap out of memory

**解決方法**:

```bash
# メモリ制限を増やす
NODE_OPTIONS="--max-old-space-size=4096" node scripts/validate_all.js
```

### パーミッションエラー

**症状**: EACCES: permission denied

**解決方法**:

```bash
# ファイルの権限を確認
ls -la skills/your-skill-name/scripts/

# 実行権限を付与
chmod +x skills/your-skill-name/scripts/*.js
```

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

3. Codex CLIをインストール

### Codexタスクがタイムアウト

**症状**: Codex実行が時間切れ

**解決方法**:

1. タスクを小さく分割
2. ネットワーク接続を確認
3. Claude Code単独モードで実行
   ```
   「Claude Codeのみで実行して」
   ```

---

## バリデーションエラー

### 構造検証エラー

**症状**: `Structure validation failed`

**解決方法**:

1. 必須ファイルの確認（SKILL.mdが必須）
   ```bash
   ls skills/your-skill-name/SKILL.md
   ```

2. ディレクトリ構造の確認
   ```bash
   tree skills/your-skill-name/
   ```

### リンク検証エラー

**症状**: `Broken link detected`

**解決方法**:

1. 壊れたリンクの特定
   ```bash
   node skills/skill-creator/scripts/validate_links.js skills/your-skill-name
   ```

2. リンク先の修正または削除

### スキーマ検証エラー

**症状**: `Schema validation failed`

**解決方法**:

1. JSONファイルの構文確認
   ```bash
   node -e "require('./skills/your-skill-name/schemas/input.json')"
   ```

2. スキーマに準拠した形式に修正

---

## よくある質問

### Q: インストール場所はどこですか？

A: プラグインは `~/.claude/plugins/` にインストールされます。

### Q: 作成したスキルはどこに保存されますか？

A: カレントプロジェクトの `skills/` ディレクトリに生成されます。

### Q: 他の人と共有するには？

A: 作成したスキルを含むディレクトリをGitHubにプッシュし、プラグインとして配布できます。

### Q: インタビューをスキップできますか？

A: 要件が明確な場合は、最初に詳細を伝えることでインタビューを短縮できます：

```
「GitHubのPRをSlackに通知するスキルを作成して。
- 機能: PR作成時に通知
- 外部連携: GitHub API, Slack API
- 認証: 環境変数
- スケジュール: イベント駆動（webhook）
- 構成: 標準」
```

### Q: 一度作成したスキルを更新するには？

A: 以下の方法で更新できます：

```
「skills/my-skill を更新して。〇〇の機能を追加したい」
```

### Q: バリデーションを手動で実行するには？

A: 以下のコマンドで実行できます：

```bash
# クイックバリデーション
node skills/skill-creator/scripts/quick_validate.js skills/your-skill-name

# 包括的バリデーション
node skills/skill-creator/scripts/validate_all.js skills/your-skill-name
```

### Q: 生成されたスキルのログを確認するには？

A: `LOGS.md`ファイルに実行ログが記録されます：

```bash
cat skills/your-skill-name/LOGS.md
```

---

## サポート

上記で解決しない場合は、以下の情報を添えて[Issues](https://github.com/daishiman/meta-skill-creator/issues)で報告してください：

1. **エラーメッセージ**（全文）
2. **実行したコマンドまたは操作**
3. **環境情報**
   ```bash
   uname -a          # OS
   node --version    # Node.js
   claude --version  # Claude Code
   ```
4. **再現手順**
5. **期待した動作と実際の動作**
