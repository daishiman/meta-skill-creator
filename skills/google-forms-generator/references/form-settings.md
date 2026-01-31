# フォーム設定リファレンス

Google Forms APIで設定可能なフォーム全体の設定オプション。

---

## 基本設定

### フォーム情報の更新

```json
{
  "updateFormInfo": {
    "info": {
      "title": "フォームタイトル",
      "description": "フォームの説明文"
    },
    "updateMask": "title,description"
  }
}
```

### updateMask

更新するフィールドを指定。カンマ区切りで複数指定可能。

| フィールド | 説明 |
|-----------|------|
| `title` | フォームタイトル |
| `description` | フォーム説明文 |

---

## クイズ設定

### クイズモードの有効化

```json
{
  "updateSettings": {
    "settings": {
      "quizSettings": {
        "isQuiz": true
      }
    },
    "updateMask": "quizSettings.isQuiz"
  }
}
```

### quizSettings パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `isQuiz` | boolean | クイズモードの有効/無効 |

---

## メール収集設定

### emailCollectionType

```json
{
  "updateSettings": {
    "settings": {
      "emailCollectionType": "VERIFIED"
    },
    "updateMask": "emailCollectionType"
  }
}
```

### 設定値

| 値 | 説明 | 回答者への影響 |
|----|------|---------------|
| `DO_NOT_COLLECT` | 収集しない | 匿名で回答可能 |
| `VERIFIED` | Googleアカウントから自動取得 | Googleログイン必須 |
| `RESPONDER_INPUT` | 回答者が入力 | メールアドレス入力フィールドが追加 |

---

## 公開設定

### setPublishSettings

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

### publishState パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `isPublished` | boolean | フォームの公開状態 |
| `isAcceptingResponses` | boolean | 回答受付状態 |

### 重要な変更（2026年3月31日以降）

- APIで作成されたフォームはデフォルト**非公開**
- 回答を受け付けるには`setPublishSettings`で明示的に公開設定が必要
- 既存のフォームには影響なし

---

## 設定の組み合わせ例

### 匿名アンケート

```json
{
  "updateSettings": {
    "settings": {
      "quizSettings": { "isQuiz": false },
      "emailCollectionType": "DO_NOT_COLLECT"
    },
    "updateMask": "quizSettings.isQuiz,emailCollectionType"
  }
}
```

### メールアドレス必須のクイズ

```json
{
  "updateSettings": {
    "settings": {
      "quizSettings": { "isQuiz": true },
      "emailCollectionType": "VERIFIED"
    },
    "updateMask": "quizSettings.isQuiz,emailCollectionType"
  }
}
```

### 回答者入力メール + 非クイズ

```json
{
  "updateSettings": {
    "settings": {
      "quizSettings": { "isQuiz": false },
      "emailCollectionType": "RESPONDER_INPUT"
    },
    "updateMask": "quizSettings.isQuiz,emailCollectionType"
  }
}
```

---

## API非対応の設定

以下の設定はREST APIでは変更できません。

| 設定 | 代替手段 |
|------|---------|
| 確認メッセージ | Apps Script または UI |
| 回答の検証（バリデーション） | Apps Script |
| 回答後の編集許可 | UI のみ |
| 1回のみ回答制限 | UI のみ（emailCollectionType=VERIFIEDと組み合わせ） |
| 進捗バーの表示 | UI のみ |
| 質問のシャッフル（フォーム全体） | UI のみ |
| 回答期限の設定 | UI のみ |

---

## 設定変更のベストプラクティス

### 1. 作成直後に設定を適用

```javascript
// フォーム作成
const form = await forms.forms.create({
  requestBody: { info: { title: "タイトル" } }
});

// 即座に設定を適用
await forms.forms.batchUpdate({
  formId: form.data.formId,
  requestBody: {
    requests: [
      {
        updateSettings: {
          settings: {
            quizSettings: { isQuiz: false },
            emailCollectionType: "DO_NOT_COLLECT"
          },
          updateMask: "quizSettings.isQuiz,emailCollectionType"
        }
      }
    ]
  }
});
```

### 2. 公開設定は最後に

```javascript
// 質問追加が完了してから公開
await forms.forms.setPublishSettings({
  formId,
  requestBody: {
    publishSettings: {
      publishState: {
        isPublished: true,
        isAcceptingResponses: true
      }
    }
  }
});
```

### 3. 設定の確認

```javascript
// 現在の設定を取得
const form = await forms.forms.get({ formId });
console.log('Settings:', form.data.settings);
console.log('Published:', form.data.publishSettings?.publishState?.isPublished);
```
