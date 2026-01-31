# インストールガイド - Google Forms Generator

Google Forms Generatorをインストールして使い始めるための詳細ガイドです。

---

## 重要: Claude Codeが必要です

> **このプラグインはClaude Code上で動作します。**
> ターミナルで直接実行するものではありません。

**ダウンロード**: https://claude.ai/download

---

## 動作要件

| 要件 | バージョン/条件 | 備考 |
|------|----------------|------|
| Claude Code | 1.0.0以上 | **必須** |
| Node.js | 18.0.0以上 | スクリプト実行に必要 |
| Google Cloud Project | OAuth 2.0クライアントID | Forms API有効化が必要 |

---

## インストール手順

### Step 1: マーケットプレイスを追加

Claude Codeを起動した状態で実行：

```bash
/plugin marketplace add daishiman/daishiman-skills
```

### Step 2: プラグインをインストール

```bash
/plugin install daishiman-google-forms-generator
```

### Step 3: 依存パッケージをインストール

```bash
cd skills/google-forms-generator
npm install
```

以下のパッケージがインストールされます：

| パッケージ | 用途 |
|-----------|------|
| `googleapis` | Google APIs クライアントライブラリ |
| `dotenv` | 環境変数の読み込み |

### Step 4: Google OAuth認証を設定（次セクション参照）

### Step 5: Claude Codeを再起動

---

## Google OAuth認証の設定

Google Forms APIを使用するためにOAuth 2.0認証の設定が必要です。以下の手順を順番に実行してください。

### 1. Google Cloud Projectの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 画面上部のプロジェクト選択ドロップダウンをクリック
3. **「新しいプロジェクト」** をクリック
4. プロジェクト名を入力（例: `google-forms-generator`）
5. **「作成」** をクリック
6. 作成完了後、そのプロジェクトを選択

### 2. APIの有効化

1. 左サイドメニュー → **「APIとサービス」** → **「ライブラリ」**
2. 以下のAPIを検索して、それぞれ **「有効にする」** をクリック：

| API | 用途 | 必須 |
|-----|------|------|
| **Google Forms API** | フォーム作成・編集 | **必須** |
| **Google Drive API** | フォルダ移動・共有設定 | フォルダ指定時に必要 |
| **Google Sheets API** | 回答データ取得・エクスポート | 回答取得時に必要 |

### 3. OAuth同意画面の設定

1. 左サイドメニュー → **「APIとサービス」** → **「OAuth同意画面」**
2. User Type: **「外部」** を選択 → **「作成」**
3. 以下を入力：
   - **アプリ名**: 任意（例: `Google Forms Generator`）
   - **ユーザーサポートメール**: 自分のメールアドレス
   - **デベロッパーの連絡先メール**: 自分のメールアドレス
4. **「保存して続行」** をクリック
5. **スコープ**の画面で **「スコープを追加または削除」** をクリック
6. 以下のスコープを追加：
   - `https://www.googleapis.com/auth/forms.body`
   - `https://www.googleapis.com/auth/forms.responses.readonly`
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/spreadsheets`
7. **「保存して続行」**
8. **テストユーザー**の画面で **「ユーザーを追加」** → 自分のGoogleアカウントのメールアドレスを追加
9. **「保存して続行」** → **「ダッシュボードに戻る」**

### 4. OAuthクライアントIDの作成

1. 左サイドメニュー → **「APIとサービス」** → **「認証情報」**
2. 上部の **「+ 認証情報を作成」** → **「OAuthクライアントID」**
3. アプリケーションの種類: **「デスクトップアプリ」** を選択
4. 名前: 任意（例: `Forms Generator CLI`）
5. **「作成」** をクリック
6. 表示されるダイアログから以下をメモ：
   - **クライアントID** （例: `123456789012-xxxx.apps.googleusercontent.com`）
   - **クライアントシークレット** （例: `GOCSPX-xxxxxxxxxx`）

### 5. 環境変数ファイルの作成

`.env`ファイルは **`skills/google-forms-generator/`ディレクトリ内** に配置します。
（スクリプトはこのディレクトリの`.env`を読み込むように設計されています）

```bash
# .env.example をコピー
cd skills/google-forms-generator
cp .env.example .env
```

`.env`を編集して、Step 4で取得した値を設定：

```
# 必須: Step 4で取得した値を設定
GOOGLE_CLIENT_ID=123456789012-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxx

# この時点では空のまま（Step 6で自動取得）
GOOGLE_REFRESH_TOKEN=

# オプション: フォームのデフォルト保存先フォルダID
DEFAULT_FOLDER_ID=

# 通常は変更不要
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

### 6. リフレッシュトークンの取得

OAuth認証フローを実行してリフレッシュトークンを取得します：

```bash
# プロジェクトルートから実行
node skills/google-forms-generator/scripts/auth/setup-oauth.js
```

実行すると：

1. ブラウザが自動的に開き、Googleのログイン画面が表示されます
2. Step 3でテストユーザーに追加したGoogleアカウントでログイン
3. **「続行」** をクリックして権限を許可
4. 「認証に成功しました」と表示され、ターミナルにリフレッシュトークンが出力されます

出力されたリフレッシュトークンを`.env`の`GOOGLE_REFRESH_TOKEN`に設定：

```
GOOGLE_REFRESH_TOKEN=1//0exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **注意**: ブラウザが自動で開かない場合は、ターミナルに表示されるURLを手動でブラウザにコピー＆ペーストしてください。

### 7. 動作確認

トークンが正しく設定されたか確認：

```bash
node skills/google-forms-generator/scripts/auth/refresh-token.js
```

「トークンは有効です」と表示されれば設定完了です。

---

## 設定完了後の動作確認

Claude Codeで以下を実行：

```
「Googleフォームを作成したい」
```

ヒアリングが開始されれば成功です。

---

## アップグレード

```bash
/plugin update daishiman-google-forms-generator
```

アップグレード後、依存パッケージも更新してください：

```bash
cd skills/google-forms-generator
npm install
```

---

## アンインストール

```bash
/plugin uninstall daishiman-google-forms-generator
```

---

## スキル内部構造

```
skills/google-forms-generator/
├── SKILL.md               # スキル定義（必須）
├── .env.example           # 環境変数テンプレート
├── .env                   # 環境変数（自分で作成、Git管理外）
├── package.json           # 依存パッケージ定義
├── agents/                # エージェント定義
│   ├── 01-interviewer.md      # ヒアリング
│   ├── 02-designer.md         # 構成設計
│   ├── 03-executor.md         # API実行
│   ├── 04-reporter.md         # 結果報告
│   ├── 05-template-selector.md # テンプレート選択
│   ├── 06-validator.md        # 検証
│   ├── 07-error-handler.md    # エラー処理
│   ├── 08-response-manager.md # 回答管理
│   ├── 09-form-modifier.md    # フォーム修正
│   └── 10-auth-helper.md      # 認証ヘルパー
├── references/            # 参照ドキュメント
├── scripts/               # 自動化スクリプト
│   ├── auth/              # 認証関連
│   │   ├── setup-oauth.js     # 初回認証セットアップ
│   │   ├── get-auth-client.js # 認証クライアント取得
│   │   └── refresh-token.js   # トークンリフレッシュ
│   ├── forms/             # フォーム操作
│   ├── drive/             # Drive連携
│   ├── sheets/            # Sheets連携
│   ├── output/            # 結果保存
│   └── utils/             # ユーティリティ
└── templates/             # フォームテンプレート
    ├── form-patterns/     # フォームパターン（6種類）
    └── question-builders/ # 質問ビルダー（6種類）
```

---

## トラブルシューティング

問題が発生した場合は、[TROUBLESHOOTING.md](TROUBLESHOOTING.md) を参照してください。

---

## 関連ドキュメント

- [使い方ガイド](USAGE.md)
- [トラブルシューティング](TROUBLESHOOTING.md)
- [変更履歴](CHANGELOG.md)
- [← daishiman-skills トップへ戻る](../../README.md)
