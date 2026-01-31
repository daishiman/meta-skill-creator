# OAuth 2.0 認証セットアップ詳細ガイド

このガイドでは、Google Forms/Drive/Sheets APIを使用するための認証情報取得手順を、画面ごとに詳細に説明します。

---

## 前提条件

- Googleアカウントを持っていること
- Webブラウザ（Chrome推奨）

---

## Phase 1: Google Cloud Console へのアクセスとプロジェクト作成

### Step 1.1: Google Cloud Console にアクセス

1. ブラウザで以下のURLを開く
   ```
   https://console.cloud.google.com/
   ```

2. Googleアカウントでログインしていない場合はログイン画面が表示される
   - メールアドレスを入力 → 「次へ」
   - パスワードを入力 → 「次へ」

3. 初めてアクセスする場合、利用規約の同意画面が表示される
   - 「利用規約に同意します」にチェック
   - 「同意して続行」をクリック

### Step 1.2: 新規プロジェクトの作成

1. 画面上部のプロジェクト選択ドロップダウンをクリック
   - 「Google Cloud」ロゴの右横にある現在のプロジェクト名（または「プロジェクトを選択」）

2. 「新しいプロジェクト」をクリック

3. プロジェクト情報を入力
   - **プロジェクト名**: `forms-generator`（任意の名前でOK）
   - **場所**: 「組織なし」のまま（個人利用の場合）
   - ⚠️ プロジェクト名は内部識別用なので「google」を含めても問題ないが、アプリ名には含めないこと

4. 「作成」をクリック

5. 作成完了の通知が表示されるまで待機（約10〜30秒）

6. 通知の「プロジェクトを選択」をクリック、または
   - 再度プロジェクト選択ドロップダウンをクリック
   - 作成したプロジェクトを選択

---

## Phase 2: 必要なAPIの有効化

### Step 2.1: Google Forms API の有効化

1. 左上のハンバーガーメニュー（≡）をクリック

2. 「APIとサービス」にマウスを合わせる

3. 「ライブラリ」をクリック

4. 検索ボックスに `Google Forms API` と入力

5. 「Google Forms API」（Google LLCの製品）をクリック

6. 「有効にする」をクリック
   - ボタンが「管理」に変わったら有効化完了

### Step 2.2: Google Drive API の有効化

1. 左上の「← APIとサービス」をクリックして戻る

2. 「ライブラリ」をクリック

3. 検索ボックスに `Google Drive API` と入力

4. 「Google Drive API」をクリック

5. 「有効にする」をクリック

### Step 2.3: Google Sheets API の有効化

1. 再度「ライブラリ」に戻る

2. 検索ボックスに `Google Sheets API` と入力

3. 「Google Sheets API」をクリック

4. 「有効にする」をクリック

### Step 2.4: 有効化の確認

1. 左メニューの「有効なAPIとサービス」をクリック

2. 以下の3つが表示されていることを確認：
   - Google Forms API
   - Google Drive API
   - Google Sheets API

---

## Phase 3: OAuth同意画面の設定

### Step 3.1: OAuth同意画面の設定開始

1. 左メニューの「OAuth同意画面」をクリック

2. **User Type（ユーザーの種類）を選択**
   - **「外部」を選択**（個人Googleアカウントの場合）
   - 「内部」はGoogle Workspaceの組織内ユーザー限定
   - 「作成」をクリック

### Step 3.2: アプリ情報の入力

**OAuth 同意画面 - ステップ1: アプリ情報**

1. **アプリ名**: `Forms Generator CLI`（任意、**「Google」は含めないこと**）
   - ⚠️ 「Google」を含む名前はエラーになります

2. **ユーザーサポートメール**: ドロップダウンから自分のメールアドレスを選択

3. **アプリのロゴ**: スキップ（空白のままでOK）

4. **アプリのドメイン**: すべてスキップ（空白のままでOK）
   - アプリケーションのホームページ: 空白
   - アプリケーションのプライバシーポリシーリンク: 空白
   - アプリケーションの利用規約リンク: 空白

5. **承認済みドメイン**: 「+ ドメインを追加」はクリックしない（空白のまま）

6. **デベロッパーの連絡先情報**
   - メールアドレスを入力（自分のメールアドレス）

7. 「保存して次へ」をクリック

### Step 3.3: スコープの設定

**OAuth 同意画面 - ステップ2: スコープ**

1. 「スコープを追加または削除」をクリック

2. フィルターボックスで検索して以下のスコープにチェック：

   ```
   検索: forms
   ☑ .../auth/forms.body
   ☑ .../auth/forms.responses.readonly
   ```

   ```
   検索: drive
   ☑ .../auth/drive （Google Drive全体へのアクセス）
   ```

   ```
   検索: spreadsheets
   ☑ .../auth/spreadsheets
   ```

3. 「更新」をクリック

4. 「保存して次へ」をクリック

### Step 3.4: テストユーザーの追加

**OAuth 同意画面 - ステップ3: テストユーザー**

1. 「+ ADD USERS」（または「+ ユーザーを追加」）をクリック

2. 自分のGmailアドレスを入力

3. 「追加」をクリック

4. 「保存して次へ」をクリック

### Step 3.5: 設定の確認

**OAuth 同意画面 - ステップ4: 概要**

1. 設定内容を確認

2. 「ダッシュボードに戻る」をクリック

---

## Phase 4: OAuth認証情報の作成

### Step 4.1: 認証情報の作成開始

1. 左メニューの「認証情報」をクリック

2. 画面上部の「+ 認証情報を作成」をクリック

3. 「OAuth クライアント ID」を選択

### Step 4.2: OAuthクライアントの設定

1. **アプリケーションの種類**: 「デスクトップ アプリ」を選択

2. **名前**: `Forms Generator CLI`（任意）

3. 「作成」をクリック

### Step 4.3: 認証情報の取得

「OAuth クライアントを作成しました」ダイアログが表示される

1. **クライアント ID** をコピーしてメモ帳などに保存
   - 例: `123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

2. **クライアント シークレット** をコピーしてメモ帳などに保存
   - 例: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx`

3. 「OK」をクリック

---

## Phase 5: 環境変数ファイルの作成

### Step 5.1: .envファイルの作成

1. **スキルディレクトリ**で`.env.example`をコピーして`.env`を作成
   ```bash
   cd .claude/skills/google-forms-generator
   cp .env.example .env
   ```

   ⚠️ 重要: `.env`ファイルは `.claude/skills/google-forms-generator/.env` に配置してください

2. `.env`ファイルを開き、取得した値を設定：

   ```env
   # Google OAuth 2.0 認証情報
   GOOGLE_CLIENT_ID=ここにクライアントIDを貼り付け
   GOOGLE_CLIENT_SECRET=ここにクライアントシークレットを貼り付け
   GOOGLE_REFRESH_TOKEN=

   # オプション: デフォルトの保存先フォルダID
   DEFAULT_FOLDER_ID=
   ```

   例：
   ```env
   GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx
   GOOGLE_REFRESH_TOKEN=
   DEFAULT_FOLDER_ID=17hMY8pES6ZzmeyjJbciQZnQFRo_15W2_
   ```

3. ファイルを保存

---

## Phase 6: 初回認証の実行

### Step 6.1: 必要なパッケージのインストール

ターミナルで以下を実行：

```bash
# プロジェクトディレクトリに移動
cd /path/to/your/project

# 依存パッケージをインストール
pnpm install googleapis dotenv open
```

### Step 6.2: 認証スクリプトの実行

```bash
node .claude/skills/google-forms-generator/scripts/auth/setup-oauth.js
```

### Step 6.3: ブラウザでの認証

1. ブラウザが自動で開く（開かない場合はターミナルに表示されるURLを手動で開く）

2. Googleアカウントを選択

3. 「Forms Generator CLI が Google アカウントへのアクセスをリクエストしています」画面
   - 「続行」をクリック

4. **「このアプリは Google で確認されていません」という警告が表示される場合**：
   - 左下の「詳細」をクリック
   - 「Forms Generator CLI（安全ではないページ）に移動」をクリック

5. 権限の確認画面
   - 要求されている権限を確認
   - 「許可」をクリック

6. 「認証が完了しました。このウィンドウを閉じてください。」と表示されたら成功

### Step 6.4: Refresh Token の保存

1. ターミナルに戻る

2. `GOOGLE_REFRESH_TOKEN=1//xxxxx...` という形式でトークンが表示される

3. この値をコピー

4. `.claude/skills/google-forms-generator/.env`ファイルを開き、`GOOGLE_REFRESH_TOKEN=`の後に貼り付け：

   ```env
   GOOGLE_REFRESH_TOKEN=1//0exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. ファイルを保存

---

## Phase 7: 動作確認

### Step 7.1: 認証テスト

```bash
# 簡単なテスト: フォームを作成してみる
node .claude/skills/google-forms-generator/scripts/forms/create-form.js --title "テストフォーム" --publish
```

成功すると以下のような出力が表示される：

```
フォームを作成中...
✅ フォーム作成完了: 1BxiMVs0XRA5...
フォームを公開中...
✅ フォームを公開しました

==================================================
フォーム作成完了！
==================================================
タイトル: テストフォーム
フォームID: 1BxiMVs0XRA5...
回答用URL: https://docs.google.com/forms/d/e/1FAIpQL.../viewform
編集用URL: https://docs.google.com/forms/d/1BxiMVs.../edit
==================================================
```

### Step 7.2: Google Formsで確認

1. 出力された「回答用URL」をブラウザで開く

2. フォームが正しく表示されることを確認

---

## トラブルシューティング

### 「Error: invalid_grant」が表示される場合

**原因**: Refresh Tokenが無効になった

**解決策**:
1. Step 6を再実行
2. 新しいRefresh Tokenを取得して`.env`を更新

### 「Error: access_denied」が表示される場合

**原因**: OAuth同意画面でテストユーザーとして追加されていない

**解決策**:
1. Google Cloud Console → OAuth同意画面 → テストユーザー
2. 使用するGoogleアカウントを追加

### 「Error: insufficient_scope」が表示される場合

**原因**: 必要なスコープが設定されていない

**解決策**:
1. Phase 3.3のスコープ設定を確認
2. 不足しているスコープを追加
3. Step 6を再実行

### ブラウザが自動で開かない場合

**解決策**:
1. ターミナルに表示されるURLをコピー
2. ブラウザに手動で貼り付けて開く

---

## セキュリティ注意事項

1. **`.env`ファイルは絶対にGitHubにアップロードしない**
   - `.claude/skills/google-forms-generator/.env` を秘密に保つ
   - `.gitignore`に`**/.env`パターンが含まれていることを確認

2. **クライアントシークレットは秘密に保つ**
   - 他人に共有しない
   - スクリーンショットに含めない

3. **テスト中のアプリは7日間でRefresh Tokenが失効する**
   - 本番利用する場合はOAuth同意画面を「公開」に変更
   - ただし、公開にはGoogleの審査が必要

---

## 補足: 本番環境への移行

テスト環境から本番環境に移行する場合：

1. Google Cloud Console → OAuth同意画面

2. 「公開ステータス」セクションの「アプリを公開」をクリック

3. Googleの審査を申請（個人利用の場合は不要な場合あり）

審査なしで公開する場合（機密性の低いスコープのみ）：
- forms.body, drive, spreadsheetsは「機密性の低い」スコープではないため、審査が必要
- 自分自身のみが使用する場合は、テストモードのまま7日ごとに再認証でも運用可能
