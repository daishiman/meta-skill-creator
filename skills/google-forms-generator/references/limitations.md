# API制限事項リファレンス

Google Forms APIで実現できない機能と代替手段。

---

## 概要

Google Forms REST APIは強力だが、UIで利用可能な全機能をサポートしていない。
このドキュメントでは制限事項と代替アプローチを整理する。

---

## 質問タイプの制限

### ファイルアップロード質問 ❌

**状況**: APIで作成不可

**UIでの機能**: 回答者がファイルをアップロード

**代替手段**:
1. フォームをAPI作成後、UIで手動追加
2. 別途ファイルアップロードシステムを構築

```markdown
## 手動追加手順

1. [編集画面を開く](https://docs.google.com/forms/d/{formId}/edit)
2. 「質問を追加」→「ファイルのアップロード」を選択
3. 許可するファイル形式とサイズを設定
```

---

## フォーム設定の制限

### 確認メッセージのカスタマイズ ❌

**状況**: REST APIで設定不可

**UIでの機能**: 送信後に表示されるメッセージをカスタマイズ

**代替手段**:
1. Google Apps Scriptで設定
2. UIで手動設定

```javascript
// Apps Script での設定例
function setConfirmationMessage() {
  const form = FormApp.openById('FORM_ID');
  form.setConfirmationMessage('ご回答ありがとうございました！');
}
```

### 回答の検証（バリデーション）❌

**状況**: REST APIで設定不可

**UIでの機能**:
- 正規表現による入力検証
- 数値範囲の制限
- 文字数制限

**代替手段**:
```javascript
// Apps Script での設定例
function addValidation() {
  const form = FormApp.openById('FORM_ID');
  const items = form.getItems(FormApp.ItemType.TEXT);

  items[0].asTextItem().setValidation(
    FormApp.createTextValidation()
      .requireTextMatchesPattern('^[0-9]{3}-[0-9]{4}$')
      .setHelpText('郵便番号形式（例: 123-4567）で入力してください')
      .build()
  );
}
```

### 回答後の編集許可 ❌

**状況**: REST APIで設定不可

**UIでの機能**: 送信後に回答を編集可能にする

**代替手段**: UIのみ
```markdown
設定 → 回答 → 「送信後に回答を編集」をオン
```

### 1回のみ回答制限 ❌

**状況**: REST APIで直接設定不可

**UIでの機能**: 1人1回のみ回答可能

**部分的な代替**:
```javascript
// emailCollectionType=VERIFIEDと組み合わせ
// Googleログインを必須にして重複防止
{
  "updateSettings": {
    "settings": {
      "emailCollectionType": "VERIFIED"
    }
  }
}
```
UIで「回答を1回に制限」を有効にする必要あり

### 進捗バーの表示 ❌

**状況**: REST APIで設定不可

**UIでの機能**: 複数セクションフォームで進捗を表示

**代替手段**: UIのみ
```markdown
設定 → プレゼンテーション → 「進行状況バーを表示」をオン
```

### 質問のシャッフル（フォーム全体）❌

**状況**: REST APIで設定不可（質問レベルはchoiceQuestion.shuffleで可能）

**UIでの機能**: フォーム全体の質問順序をランダム化

**代替手段**: UIのみ
```markdown
設定 → プレゼンテーション → 「質問の順序をシャッフル」をオン
```

### 回答期限の設定 ❌

**状況**: REST APIで設定不可

**UIでの機能**: 特定日時以降は回答不可

**代替手段**:
1. UIで手動設定
2. 定期的にisAcceptingResponsesをfalseに更新するスクリプト

```javascript
// 指定時刻に自動クローズ
async function closeFormAt(formId, closeTime) {
  const now = new Date();
  const delay = closeTime - now;

  if (delay > 0) {
    setTimeout(async () => {
      await forms.forms.setPublishSettings({
        formId,
        requestBody: {
          publishSettings: {
            publishState: {
              isPublished: true,
              isAcceptingResponses: false
            }
          }
        }
      });
    }, delay);
  }
}
```

---

## スプレッドシート連携の制限

### linkedSheetId は読み取り専用 ❌

**状況**: APIで設定不可

**UIでの機能**: フォーム回答をスプレッドシートに自動連携

**代替手段**:
1. UIでリンク設定を案内
2. responses.list + Sheets APIで独自実装

```markdown
## UI でのリンク設定

1. [編集画面を開く](https://docs.google.com/forms/d/{formId}/edit)
2. 「回答」タブをクリック
3. スプレッドシートアイコンをクリック
4. 新規作成または既存を選択
```

---

## 条件分岐の制限

### CHECKBOX での条件分岐 ❌

**状況**: 複数選択の組み合わせで分岐を判定できないため非対応

**対応するタイプ**:
- RADIO ○
- DROP_DOWN ○

**代替手段**:
- 設計段階でRADIOに変更
- 複数のYes/No質問に分割

### グリッド系での条件分岐 ❌

**状況**: GRID_RADIO, GRID_CHECKBOXは条件分岐非対応

**代替手段**:
- グリッドを個別のRADIO質問に分割
- 条件分岐が必要な項目のみ別質問に

### 最終ページでの分岐効果 ❌

**状況**: 最後のセクションでは分岐設定が無効

**代替手段**:
- 分岐が必要な質問は最終セクション以外に配置

---

## DROP_DOWN の制限

### isOther（その他）オプション ❌

**状況**: DROP_DOWNではisOther使用不可

**対応するタイプ**:
- RADIO ○
- CHECKBOX ○

**代替手段**:
```javascript
// 「その他」を通常の選択肢として追加
{
  "choiceQuestion": {
    "type": "DROP_DOWN",
    "options": [
      { "value": "選択肢1" },
      { "value": "選択肢2" },
      { "value": "その他（別途入力）" }  // 手動で追加
    ]
  }
}

// 続けて自由入力欄を追加
{
  "createItem": {
    "item": {
      "title": "「その他」を選んだ方は詳細を入力してください",
      "questionItem": {
        "question": {
          "required": false,
          "textQuestion": { "paragraph": false }
        }
      }
    }
  }
}
```

---

## レート制限

### 書き込みリクエスト

| 種別 | 制限 |
|------|------|
| プロジェクト単位 | 375回/分 |
| ユーザー単位 | 150回/分 |

### 読み取りリクエスト

| 種別 | 制限 |
|------|------|
| ユーザー単位 | 300回/分 |

### Watch制限

| 種別 | 制限 |
|------|------|
| フォームあたり | 20件 |
| プロジェクトあたり | 2,500件 |
| 有効期限 | 最大7日間 |

### 対処法: 指数バックオフ

```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code !== 429 || attempt === maxRetries) {
        throw error;
      }

      // wait_time = min((2^n + random_ms), 64秒)
      const delay = Math.min(
        Math.pow(2, attempt) * baseDelay + Math.random() * 1000,
        64000
      );

      console.log(`リトライ ${attempt + 1}/${maxRetries}: ${Math.round(delay)}ms 待機`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## 機能別サマリー

| 機能 | API | UI | Apps Script |
|------|-----|-----|-------------|
| フォーム作成 | ○ | ○ | ○ |
| 質問追加（11種類） | ○ | ○ | ○ |
| ファイルアップロード質問 | × | ○ | ○ |
| クイズ・採点 | ○ | ○ | ○ |
| 条件分岐 | ○ | ○ | ○ |
| 確認メッセージ | × | ○ | ○ |
| 回答バリデーション | × | ○ | ○ |
| 回答編集許可 | × | ○ | × |
| 1回制限 | △ | ○ | × |
| 進捗バー | × | ○ | × |
| 質問シャッフル（全体） | × | ○ | ○ |
| 回答期限 | × | ○ | △ |
| スプレッドシートリンク | × | ○ | ○ |

---

## 推奨ワークフロー

### API + UI の組み合わせ

```
1. API でフォーム構造を作成
   - タイトル、説明
   - 質問（11種類）
   - セクション、条件分岐
   - クイズ設定

2. UI で追加設定
   - ファイルアップロード質問
   - 確認メッセージ
   - バリデーション
   - スプレッドシート連携

3. API で公開設定
   - setPublishSettings
```

### 完全自動化が必要な場合

```
1. API で可能な範囲を実装
2. 制限事項はユーザーに案内
3. 必要に応じてApps Scriptで補完
```
