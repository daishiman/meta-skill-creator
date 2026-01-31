# 質問タイプリファレンス

Google Forms APIで使用可能な全11種類の質問タイプの詳細仕様。

---

## 1. SHORT_TEXT（記述式・短文）

### 概要
1行の短いテキスト入力。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "お名前を入力してください",
      "description": "フルネームでお願いします",
      "questionItem": {
        "question": {
          "required": true,
          "textQuestion": {
            "paragraph": false
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `paragraph` | boolean | `false`で短文、`true`で長文 |

---

## 2. LONG_TEXT（段落・長文）

### 概要
複数行のテキスト入力。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "ご意見・ご感想をお聞かせください",
      "questionItem": {
        "question": {
          "required": false,
          "textQuestion": {
            "paragraph": true
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

---

## 3. RADIO（ラジオボタン・単一選択）

### 概要
複数の選択肢から1つを選択。条件分岐対応。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "参加経験はありますか？",
      "questionItem": {
        "question": {
          "required": true,
          "choiceQuestion": {
            "type": "RADIO",
            "options": [
              { "value": "はい" },
              { "value": "いいえ" },
              { "isOther": true }
            ],
            "shuffle": false
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `type` | enum | `RADIO` / `CHECKBOX` / `DROP_DOWN` |
| `options[].value` | string | 選択肢のテキスト |
| `options[].isOther` | boolean | 「その他」選択肢を追加 |
| `options[].goToAction` | enum | 条件分岐アクション |
| `options[].goToSectionId` | string | 遷移先セクションID |
| `shuffle` | boolean | 選択肢をランダム表示 |

### 条件分岐オプション

```json
{
  "options": [
    {
      "value": "はい",
      "goToAction": "NEXT_SECTION"
    },
    {
      "value": "いいえ",
      "goToAction": "SUBMIT_FORM"
    },
    {
      "value": "わからない",
      "goToSectionId": "section_abc123"
    }
  ]
}
```

---

## 4. CHECKBOX（チェックボックス・複数選択）

### 概要
複数の選択肢から0個以上を選択。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "興味のある分野を選択してください（複数選択可）",
      "questionItem": {
        "question": {
          "required": true,
          "choiceQuestion": {
            "type": "CHECKBOX",
            "options": [
              { "value": "AI/機械学習" },
              { "value": "Web開発" },
              { "value": "モバイル開発" },
              { "value": "クラウド" },
              { "isOther": true }
            ],
            "shuffle": true
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### 制限事項
- 条件分岐（goToAction/goToSectionId）は**使用不可**

---

## 5. DROP_DOWN（プルダウン・単一選択）

### 概要
ドロップダウンメニューから1つを選択。条件分岐対応。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "都道府県を選択してください",
      "questionItem": {
        "question": {
          "required": true,
          "choiceQuestion": {
            "type": "DROP_DOWN",
            "options": [
              { "value": "北海道" },
              { "value": "東京都" },
              { "value": "大阪府" },
              { "value": "福岡県" }
            ]
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### 制限事項
- `isOther`（その他オプション）は**使用不可**
- shuffleは設定可能だが推奨されない

---

## 6. SCALE（線形スケール）

### 概要
数値範囲から1つを選択（例: 1〜5段階評価）。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "このサービスの満足度を評価してください",
      "questionItem": {
        "question": {
          "required": true,
          "scaleQuestion": {
            "low": 1,
            "high": 5,
            "lowLabel": "不満",
            "highLabel": "満足"
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `low` | integer | 最小値（0または1） |
| `high` | integer | 最大値（2〜10） |
| `lowLabel` | string | 最小値のラベル |
| `highLabel` | string | 最大値のラベル |

---

## 7. GRID_RADIO（選択式グリッド）

### 概要
行×列のマトリックスで各行に1つずつ選択。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "各項目について評価してください",
      "questionGroupItem": {
        "questions": [
          { "rowQuestion": { "title": "対応の速さ" }, "required": true },
          { "rowQuestion": { "title": "説明の分かりやすさ" }, "required": true },
          { "rowQuestion": { "title": "全体的な満足度" }, "required": true }
        ],
        "grid": {
          "columns": {
            "type": "RADIO",
            "options": [
              { "value": "悪い" },
              { "value": "普通" },
              { "value": "良い" },
              { "value": "非常に良い" }
            ]
          },
          "shuffleQuestions": false
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `questions[].rowQuestion.title` | string | 行のタイトル |
| `questions[].required` | boolean | 各行の必須設定 |
| `grid.columns.type` | enum | `RADIO` または `CHECKBOX` |
| `grid.columns.options` | array | 列の選択肢 |
| `grid.shuffleQuestions` | boolean | 行をランダム表示 |

### 制限事項
- 条件分岐は**使用不可**

---

## 8. GRID_CHECKBOX（チェックボックスグリッド）

### 概要
行×列のマトリックスで各行に複数選択可能。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "参加可能な日時を選択してください",
      "questionGroupItem": {
        "questions": [
          { "rowQuestion": { "title": "1月15日" }, "required": false },
          { "rowQuestion": { "title": "1月16日" }, "required": false },
          { "rowQuestion": { "title": "1月17日" }, "required": false }
        ],
        "grid": {
          "columns": {
            "type": "CHECKBOX",
            "options": [
              { "value": "午前" },
              { "value": "午後" },
              { "value": "夜間" }
            ]
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

---

## 9. DATE（日付）

### 概要
日付ピッカーで日付を選択。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "希望日を選択してください",
      "questionItem": {
        "question": {
          "required": true,
          "dateQuestion": {
            "includeYear": true,
            "includeTime": false
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `includeYear` | boolean | 年を含める |
| `includeTime` | boolean | 時刻も入力可能にする |

---

## 10. TIME（時刻）

### 概要
時刻または経過時間を入力。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "希望時刻を入力してください",
      "questionItem": {
        "question": {
          "required": true,
          "timeQuestion": {
            "duration": false
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `duration` | boolean | `false`: 時刻入力、`true`: 経過時間入力 |

---

## 11. RATING（評価）

### 概要
星・ハート・サムズアップで評価。

### API構造

```json
{
  "createItem": {
    "item": {
      "title": "この記事を評価してください",
      "questionItem": {
        "question": {
          "required": true,
          "ratingQuestion": {
            "ratingScaleLevel": 5,
            "iconType": "STAR"
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `ratingScaleLevel` | integer | 評価段階（3〜10） |
| `iconType` | enum | `STAR` / `HEART` / `THUMB_UP` |

---

## 質問タイプ選択ガイド

| ユースケース | 推奨タイプ |
|-------------|-----------|
| 名前・メールアドレス | SHORT_TEXT |
| 自由記述・感想 | LONG_TEXT |
| Yes/No質問 | RADIO |
| 単一選択（多数の選択肢） | DROP_DOWN |
| 複数選択 | CHECKBOX |
| 満足度評価（数値） | SCALE |
| 満足度評価（視覚的） | RATING |
| 複数項目の評価 | GRID_RADIO |
| 日程調整 | GRID_CHECKBOX / DATE |
| 時間指定 | TIME |
