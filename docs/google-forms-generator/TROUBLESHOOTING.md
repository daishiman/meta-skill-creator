# トラブルシューティング - Google Forms Generator

Google Forms Generatorで発生する可能性のある問題と解決方法をまとめています。

---

## 目次

- [インストールの問題](#インストールの問題)
- [認証の問題](#認証の問題)
- [フォーム作成の問題](#フォーム作成の問題)
- [APIエラー](#apiエラー)
- [回答取得の問題](#回答取得の問題)
- [よくある質問](#よくある質問)

---

## インストールの問題

### プラグインが認識されない

**症状**: 「Googleフォームを作成」と言っても反応がない

**解決方法**:

1. プラグインの確認
   ```bash
   /plugin list
   ```
   `daishiman-google-forms-generator`が表示されることを確認

2. 再インストール
   ```bash
   /plugin uninstall daishiman-google-forms-generator
   /plugin install daishiman-google-forms-generator
   ```

3. Claude Codeを再起動

### 依存パッケージのエラー

**症状**: `Error: Cannot find module 'googleapis'`

**解決方法**:

```bash
cd skills/google-forms-generator
npm install
```

### Node.jsバージョンエラー

**症状**: スクリプト実行時に構文エラー

**解決方法**:

```bash
node --version  # v18以上であることを確認
nvm install 18
nvm use 18
```

---

## 認証の問題

### OAuth認証が失敗する

**症状**: `Error: invalid_client` または `Error: invalid_grant`

**解決方法**:

1. `.env`ファイルの確認
   ```
   GOOGLE_CLIENT_ID=正しいクライアントID
   GOOGLE_CLIENT_SECRET=正しいクライアントシークレット
   GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
   ```

2. Google Cloud Consoleで確認
   - OAuth同意画面が設定済みか
   - クライアントIDが有効か
   - リダイレクトURIが一致しているか

### リフレッシュトークンが期限切れ

**症状**: `Error: Token has been expired or revoked`

**解決方法**:

```bash
# トークンをリフレッシュ
node skills/google-forms-generator/scripts/auth/refresh-token.js

# それでも失敗する場合、再認証
node skills/google-forms-generator/scripts/auth/setup-oauth.js
```

### APIが有効化されていない

**症状**: `Error: Google Forms API has not been used in project`

**解決方法**:

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. **APIとサービス** → **ライブラリ**
3. 以下のAPIを検索して有効化：
   - Google Forms API
   - Google Drive API（フォルダ移動を使う場合）
   - Google Sheets API（回答取得を使う場合）

### .envファイルが見つからない

**症状**: `Error: GOOGLE_CLIENT_ID is not defined`

**解決方法**:

`.env`は`skills/google-forms-generator/`ディレクトリ内に配置する必要があります（プロジェクトルートではない）。

```bash
cd skills/google-forms-generator
cp .env.example .env
# .env ファイルに認証情報を設定
```

---

## フォーム作成の問題

### フォーム作成が途中で止まる

**症状**: Phase 3でAPI実行が停止する

**解決方法**:

1. ネットワーク接続を確認
2. APIクォータの確認（後述のレート制限を参照）
3. 質問数を減らして再試行
4. 「続けてください」と伝える

### 質問タイプが反映されない

**症状**: 指定した質問タイプと異なるタイプで作成される

**解決方法**:

Phase 2の構成確認Markdownで質問タイプを確認してください。
修正が必要な場合は承認前に指摘します。

```
「Q3の質問タイプをRADIOからCHECKBOXに変更してください」
```

### 条件分岐が設定されない

**症状**: 条件分岐を指定したが反映されていない

**解決方法**:

条件分岐はセクション構成が前提です。以下を確認：

1. セクションが正しく設定されているか
2. 分岐元の質問がRADIOまたはDROP_DOWNタイプか
3. 分岐先のセクションIDが正しいか

---

## APIエラー

### 400 Bad Request

**原因**: リクエストパラメータが不正

**解決方法**:

- 質問文が空でないか確認
- 選択肢が2つ以上あるか確認（RADIO/CHECKBOX/DROP_DOWN）
- スケールの範囲が正しいか確認（SCALE: 0-1 ～ 0-10）

### 401 Unauthorized

**原因**: 認証トークンが無効

**解決方法**:

```bash
node skills/google-forms-generator/scripts/auth/refresh-token.js
```

### 403 Forbidden

**原因**: APIの権限不足

**解決方法**:

1. Google Cloud ConsoleでForms APIが有効か確認
2. OAuth同意画面のスコープを確認
3. 必要なスコープ：
   - `https://www.googleapis.com/auth/forms.body`
   - `https://www.googleapis.com/auth/drive`（フォルダ移動時）

### 404 Not Found

**原因**: 指定したフォームIDが存在しない

**解決方法**:

- フォームIDが正しいか確認
- フォームが削除されていないか確認

### 429 Too Many Requests

**原因**: APIレート制限に到達

**解決方法**:

自動リトライ機能が組み込まれています。しばらく待って再試行してください。

Google Forms APIの制限：
- 1分あたり300リクエスト
- 1日あたり1,000,000リクエスト

---

## 回答取得の問題

### 回答が取得できない

**症状**: 回答データが空で返される

**解決方法**:

1. フォームに回答があるか確認
2. フォームIDが正しいか確認
3. Sheets APIが有効か確認（スプレッドシートエクスポート時）

### スプレッドシートエクスポートが失敗する

**症状**: エクスポート時にエラー

**解決方法**:

1. Google Sheets APIが有効か確認
2. スプレッドシートの書き込み権限があるか確認

---

## よくある質問

### Q: 認証情報はどこに保存されますか？

A: `skills/google-forms-generator/.env`ファイルに保存されます。このファイルは`.gitignore`に含まれているため、GitHubにはアップロードされません。

### Q: 一度作成したフォームを修正できますか？

A: はい。「フォームを修正したい」と伝え、フォームIDを指定してください。質問の追加・削除・変更が可能です。

### Q: テンプレートをカスタマイズできますか？

A: はい。`templates/form-patterns/` 内のJSONファイルを編集するか、`custom.json`をベースに新しいテンプレートを作成できます。

### Q: ファイルアップロード質問は作れますか？

A: Google Forms APIの制限により、ファイルアップロード質問はAPIから作成できません。Web UIで手動追加してください。

### Q: フォームの作成結果はどこに保存されますか？

A: `05_Project/GoogleFrom/{タイムスタンプ}_{タイトル}/` に設計情報と結果情報がMarkdownで保存されます。

### Q: 複数のGoogleアカウントを切り替えられますか？

A: `.env`の認証情報を切り替えることで対応可能です。プロジェクトごとに異なる`.env`を使用してください。

---

## サポート

上記で解決しない場合は、以下の情報を添えて[Issues](https://github.com/daishiman/daishiman-skills/issues)で報告してください：

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
