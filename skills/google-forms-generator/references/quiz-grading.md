# クイズ・採点機能リファレンス

Google Formsのクイズモードと採点機能の詳細仕様。

---

## クイズモードの有効化

### 設定方法

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

---

## 採点設定（Grading）

### 基本構造

```json
{
  "createItem": {
    "item": {
      "title": "日本の首都はどこですか？",
      "questionItem": {
        "question": {
          "required": true,
          "grading": {
            "pointValue": 10,
            "correctAnswers": {
              "answers": [
                { "value": "東京" }
              ]
            },
            "whenRight": {
              "text": "正解です！"
            },
            "whenWrong": {
              "text": "不正解です。正解は東京です。"
            }
          },
          "choiceQuestion": {
            "type": "RADIO",
            "options": [
              { "value": "東京" },
              { "value": "大阪" },
              { "value": "京都" },
              { "value": "名古屋" }
            ]
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### grading パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `pointValue` | integer | 配点（0以上） |
| `correctAnswers` | object | 正解の設定 |
| `whenRight` | Feedback | 正解時のフィードバック |
| `whenWrong` | Feedback | 不正解時のフィードバック |
| `generalFeedback` | Feedback | 回答に関係なく表示 |

---

## 正解の設定

### 単一正解（RADIO, DROP_DOWN）

```json
{
  "correctAnswers": {
    "answers": [
      { "value": "正解の選択肢テキスト" }
    ]
  }
}
```

### 複数正解（CHECKBOX）

```json
{
  "correctAnswers": {
    "answers": [
      { "value": "正解1" },
      { "value": "正解2" }
    ]
  }
}
```

### 短文回答の正解

```json
{
  "correctAnswers": {
    "answers": [
      { "value": "正解1" },
      { "value": "正解2" },
      { "value": "正解3" }
    ]
  }
}
```

- 複数の正解を設定可能
- 完全一致で判定（大文字/小文字は区別しない場合あり）

---

## フィードバック（Feedback）

### テキストのみ

```json
{
  "whenRight": {
    "text": "正解です！素晴らしい！"
  },
  "whenWrong": {
    "text": "残念、不正解です。"
  }
}
```

### リンク付きフィードバック

```json
{
  "whenWrong": {
    "text": "不正解です。以下の資料で復習してください。",
    "material": [
      {
        "link": {
          "uri": "https://example.com/study-guide",
          "displayText": "学習ガイド"
        }
      }
    ]
  }
}
```

### 動画付きフィードバック

```json
{
  "whenRight": {
    "text": "正解です！",
    "material": [
      {
        "video": {
          "youtubeUri": "https://www.youtube.com/watch?v=xxxxx",
          "displayText": "解説動画"
        }
      }
    ]
  }
}
```

### material の種類

| タイプ | 説明 |
|--------|------|
| `link` | 外部リンク |
| `video` | YouTube動画 |

---

## 採点対応の質問タイプ

| タイプ | 自動採点 | 備考 |
|--------|---------|------|
| SHORT_TEXT | ○ | 完全一致で判定 |
| LONG_TEXT | × | 手動採点のみ |
| RADIO | ○ | 単一正解 |
| CHECKBOX | ○ | 全て一致で正解 |
| DROP_DOWN | ○ | 単一正解 |
| SCALE | × | 採点非対応 |
| GRID_RADIO | × | 採点非対応 |
| GRID_CHECKBOX | × | 採点非対応 |
| DATE | × | 採点非対応 |
| TIME | × | 採点非対応 |
| RATING | × | 採点非対応 |

---

## 完全な例: クイズフォーム

```json
{
  "requests": [
    {
      "updateSettings": {
        "settings": {
          "quizSettings": { "isQuiz": true },
          "emailCollectionType": "VERIFIED"
        },
        "updateMask": "quizSettings.isQuiz,emailCollectionType"
      }
    },
    {
      "createItem": {
        "item": {
          "title": "問題1: 1 + 1 = ?",
          "questionItem": {
            "question": {
              "required": true,
              "grading": {
                "pointValue": 10,
                "correctAnswers": {
                  "answers": [{ "value": "2" }]
                },
                "whenRight": { "text": "正解！" },
                "whenWrong": { "text": "不正解。答えは2です。" }
              },
              "choiceQuestion": {
                "type": "RADIO",
                "options": [
                  { "value": "1" },
                  { "value": "2" },
                  { "value": "3" },
                  { "value": "4" }
                ]
              }
            }
          }
        },
        "location": { "index": 0 }
      }
    },
    {
      "createItem": {
        "item": {
          "title": "問題2: 日本の首都を入力してください",
          "questionItem": {
            "question": {
              "required": true,
              "grading": {
                "pointValue": 20,
                "correctAnswers": {
                  "answers": [
                    { "value": "東京" },
                    { "value": "とうきょう" },
                    { "value": "Tokyo" }
                  ]
                },
                "whenRight": { "text": "正解！首都は東京です。" },
                "whenWrong": {
                  "text": "不正解です。",
                  "material": [
                    {
                      "link": {
                        "uri": "https://ja.wikipedia.org/wiki/東京",
                        "displayText": "東京について学ぶ"
                      }
                    }
                  ]
                }
              },
              "textQuestion": { "paragraph": false }
            }
          }
        },
        "location": { "index": 1 }
      }
    }
  ]
}
```

---

## 回答結果の取得

### レスポンス構造

```json
{
  "responses": [
    {
      "responseId": "...",
      "respondentEmail": "user@example.com",
      "totalScore": 30,
      "answers": {
        "questionId1": {
          "questionId": "questionId1",
          "grade": {
            "score": 10,
            "correct": true,
            "feedback": {
              "text": "正解！"
            }
          },
          "textAnswers": {
            "answers": [{ "value": "2" }]
          }
        }
      }
    }
  ]
}
```

### grade オブジェクト

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `score` | number | 獲得点数 |
| `correct` | boolean | 正解かどうか |
| `feedback` | Feedback | 表示されたフィードバック |

---

## ベストプラクティス

### 1. 配点のバランス

```javascript
// 総得点を計算しやすい配点
const questions = [
  { title: "問題1", pointValue: 10 },  // 簡単
  { title: "問題2", pointValue: 20 },  // 普通
  { title: "問題3", pointValue: 30 },  // 難しい
];
// 合計: 60点
```

### 2. フィードバックの活用

- **正解時**: 簡潔な称賛 + 追加情報
- **不正解時**: 正解の説明 + 学習リソース

### 3. 複数正解の活用（SHORT_TEXT）

```javascript
// 表記ゆれに対応
correctAnswers: {
  answers: [
    { value: "東京" },
    { value: "とうきょう" },
    { value: "トウキョウ" },
    { value: "Tokyo" },
    { value: "tokyo" }
  ]
}
```
