# Google Forms API エンドポイント一覧

Google Forms API v1で使用可能な全14メソッドの詳細仕様。

---

## Forms メソッド

### forms.create

フォームを新規作成。タイトルのみで作成し、質問はbatchUpdateで追加。

```
POST https://forms.googleapis.com/v1/forms
```

#### リクエスト

```json
{
  "info": {
    "title": "フォームタイトル"
  }
}
```

#### レスポンス

```json
{
  "formId": "1BxiMVs0XRA5nFMdLXJChVS2xGhPp4V2pI_6kPXW2E",
  "info": {
    "title": "フォームタイトル",
    "documentTitle": "フォームタイトル"
  },
  "responderUri": "https://docs.google.com/forms/d/e/1FAIpQL.../viewform",
  "revisionId": "00000001"
}
```

---

### forms.get

フォームの詳細情報を取得。

```
GET https://forms.googleapis.com/v1/forms/{formId}
```

#### レスポンス

```json
{
  "formId": "...",
  "info": {
    "title": "...",
    "description": "...",
    "documentTitle": "..."
  },
  "settings": {
    "quizSettings": { "isQuiz": false }
  },
  "items": [...],
  "responderUri": "...",
  "revisionId": "...",
  "linkedSheetId": "..."
}
```

---

### forms.batchUpdate

フォームの一括更新（質問追加、設定変更など）。

```
POST https://forms.googleapis.com/v1/forms/{formId}:batchUpdate
```

#### リクエスト

```json
{
  "includeFormInResponse": true,
  "requests": [
    { "updateFormInfo": {...} },
    { "updateSettings": {...} },
    { "createItem": {...} },
    { "updateItem": {...} },
    { "deleteItem": {...} },
    { "moveItem": {...} }
  ]
}
```

#### 使用可能なリクエストタイプ

| タイプ | 説明 |
|--------|------|
| `updateFormInfo` | フォーム情報（タイトル、説明）を更新 |
| `updateSettings` | 設定（クイズ、メール収集）を更新 |
| `createItem` | 質問・アイテムを追加 |
| `updateItem` | 既存アイテムを更新 |
| `deleteItem` | アイテムを削除 |
| `moveItem` | アイテムの位置を移動 |

---

### forms.setPublishSettings

フォームの公開設定を変更。**2026年3月31日以降必須**。

```
POST https://forms.googleapis.com/v1/forms/{formId}:setPublishSettings
```

#### リクエスト

```json
{
  "publishSettings": {
    "publishState": {
      "isPublished": true,
      "isAcceptingResponses": true
    }
  }
}
```

#### 注意事項
- 2026年3月31日以降、APIで作成されたフォームはデフォルト非公開
- 回答を受け付けるには明示的な公開設定が必要

---

## Responses メソッド

### responses.list

フォームの回答一覧を取得。

```
GET https://forms.googleapis.com/v1/forms/{formId}/responses
```

#### クエリパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `pageSize` | integer | 1ページあたりの件数（最大5000） |
| `pageToken` | string | 次ページのトークン |
| `filter` | string | フィルター条件 |

#### フィルター例

```
# 特定日時以降の回答
filter=timestamp >= 2024-01-01T00:00:00Z

# 特定日時以前の回答
filter=timestamp < 2024-12-31T23:59:59Z
```

#### レスポンス

```json
{
  "responses": [
    {
      "responseId": "...",
      "createTime": "2024-01-15T10:30:00Z",
      "lastSubmittedTime": "2024-01-15T10:35:00Z",
      "respondentEmail": "user@example.com",
      "answers": {
        "questionId1": {
          "questionId": "questionId1",
          "textAnswers": {
            "answers": [{ "value": "回答テキスト" }]
          }
        }
      },
      "totalScore": 80
    }
  ],
  "nextPageToken": "..."
}
```

---

### responses.get

特定の回答を取得。

```
GET https://forms.googleapis.com/v1/forms/{formId}/responses/{responseId}
```

---

## Watches メソッド

### watches.create

フォーム変更の通知を設定（Pub/Sub連携）。

```
POST https://forms.googleapis.com/v1/forms/{formId}/watches
```

#### リクエスト

```json
{
  "watch": {
    "target": {
      "topic": {
        "topicName": "projects/{project}/topics/{topic}"
      }
    },
    "eventType": "RESPONSES"
  }
}
```

#### eventType

| 値 | 説明 |
|----|------|
| `RESPONSES` | 新しい回答が送信されたとき |
| `SCHEMA` | フォーム構造が変更されたとき |

---

### watches.list

設定済みウォッチの一覧を取得。

```
GET https://forms.googleapis.com/v1/forms/{formId}/watches
```

---

### watches.delete

ウォッチを削除。

```
DELETE https://forms.googleapis.com/v1/forms/{formId}/watches/{watchId}
```

---

### watches.renew

ウォッチの有効期限を更新。

```
POST https://forms.googleapis.com/v1/forms/{formId}/watches/{watchId}:renew
```

#### 注意事項
- ウォッチは最大7日間有効
- 定期的な更新が必要

---

## レート制限

### プロジェクト単位

| 種別 | 制限 |
|------|------|
| 書き込みリクエスト | 375回/分 |
| 読み取りリクエスト | 300回/分/ユーザー |

### ユーザー単位

| 種別 | 制限 |
|------|------|
| 書き込みリクエスト | 150回/分 |
| 読み取りリクエスト | 300回/分 |

### ウォッチ制限

| 種別 | 制限 |
|------|------|
| フォームあたり | 20件 |
| プロジェクトあたり | 2,500件 |

---

## 認証スコープ

| スコープ | 説明 |
|---------|------|
| `https://www.googleapis.com/auth/forms.body` | フォームの読み書き |
| `https://www.googleapis.com/auth/forms.body.readonly` | フォームの読み取りのみ |
| `https://www.googleapis.com/auth/forms.responses.readonly` | 回答の読み取りのみ |
| `https://www.googleapis.com/auth/drive` | Drive連携（フォルダ移動） |

---

## エラーコード

| コード | 説明 | 対処法 |
|--------|------|--------|
| 400 | バリデーションエラー | リクエスト内容を確認 |
| 401 | 認証エラー | トークンを再取得 |
| 403 | 権限不足 | スコープを確認 |
| 404 | リソース不存在 | フォームIDを確認 |
| 429 | レート制限 | 指数バックオフで待機 |
| 500 | サーバーエラー | しばらく待機して再実行 |
