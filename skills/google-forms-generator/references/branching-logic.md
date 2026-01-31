# 条件分岐・ナビゲーションリファレンス

Google Formsの条件分岐（回答に基づくセクション移動）の詳細仕様。

---

## 条件分岐の概要

回答者の選択に応じて、次に表示するセクションを制御する機能。

### 対応する質問タイプ

| タイプ | 条件分岐 | 備考 |
|--------|---------|------|
| RADIO | ○ | 全機能対応 |
| DROP_DOWN | ○ | isOther使用不可 |
| CHECKBOX | × | 非対応 |
| グリッド系 | × | 非対応 |
| その他 | × | 非対応 |

---

## セクション（ページ区切り）

### pageBreakItem の作成

```json
{
  "createItem": {
    "item": {
      "title": "セクション2: 詳細情報",
      "description": "より詳しい情報を入力してください",
      "pageBreakItem": {}
    },
    "location": { "index": 3 }
  }
}
```

### セクション構造

```
セクション1（暗黙的に存在）
├── 質問1 (index: 0)
├── 質問2 (index: 1)
└── 質問3 (index: 2)

pageBreakItem (index: 3) ← セクション2の開始
├── 質問4 (index: 4)
└── 質問5 (index: 5)

pageBreakItem (index: 6) ← セクション3の開始
└── 質問6 (index: 7)
```

---

## 分岐アクション

### goToAction

| 値 | 説明 |
|----|------|
| `NEXT_SECTION` | 次のセクションへ進む |
| `RESTART_FORM` | フォームの先頭へ戻る |
| `SUBMIT_FORM` | 即座にフォームを送信 |

### goToSectionId

特定のセクションIDを指定してジャンプ。

---

## 基本的な条件分岐

### RADIO での分岐

```json
{
  "createItem": {
    "item": {
      "title": "続けて詳細を入力しますか？",
      "questionItem": {
        "question": {
          "required": true,
          "choiceQuestion": {
            "type": "RADIO",
            "options": [
              {
                "value": "はい",
                "goToAction": "NEXT_SECTION"
              },
              {
                "value": "いいえ",
                "goToAction": "SUBMIT_FORM"
              }
            ]
          }
        }
      }
    },
    "location": { "index": 0 }
  }
}
```

### DROP_DOWN での分岐

```json
{
  "createItem": {
    "item": {
      "title": "部門を選択してください",
      "questionItem": {
        "question": {
          "required": true,
          "choiceQuestion": {
            "type": "DROP_DOWN",
            "options": [
              {
                "value": "営業部",
                "goToSectionId": "section_sales"
              },
              {
                "value": "技術部",
                "goToSectionId": "section_tech"
              },
              {
                "value": "管理部",
                "goToSectionId": "section_admin"
              }
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

## セクションIDの取得

### フォーム取得時のレスポンス

```json
{
  "items": [
    {
      "itemId": "item_abc123",
      "title": "質問1",
      "questionItem": { ... }
    },
    {
      "itemId": "section_xyz789",
      "title": "セクション2",
      "pageBreakItem": {}
    }
  ]
}
```

`pageBreakItem`の`itemId`が`goToSectionId`で使用するID。

---

## 完全な分岐フロー例

### シナリオ

```
開始
├── Q1: 参加経験がありますか？
│   ├── はい → セクション2（経験者向け）
│   └── いいえ → セクション3（初心者向け）
│
├── セクション2: 経験者向け
│   └── Q2: 何回参加しましたか？
│       → セクション4（共通）
│
├── セクション3: 初心者向け
│   └── Q3: どこで知りましたか？
│       → セクション4（共通）
│
└── セクション4: 共通質問
    └── Q4: その他コメント
        → 送信
```

### 実装

```json
{
  "requests": [
    {
      "createItem": {
        "item": {
          "title": "参加経験がありますか？",
          "questionItem": {
            "question": {
              "required": true,
              "choiceQuestion": {
                "type": "RADIO",
                "options": [
                  { "value": "はい" },
                  { "value": "いいえ" }
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
          "title": "セクション2: 経験者向け",
          "pageBreakItem": {}
        },
        "location": { "index": 1 }
      }
    },
    {
      "createItem": {
        "item": {
          "title": "何回参加しましたか？",
          "questionItem": {
            "question": {
              "required": true,
              "choiceQuestion": {
                "type": "RADIO",
                "options": [
                  { "value": "1回" },
                  { "value": "2-3回" },
                  { "value": "4回以上" }
                ]
              }
            }
          }
        },
        "location": { "index": 2 }
      }
    },
    {
      "createItem": {
        "item": {
          "title": "セクション3: 初心者向け",
          "pageBreakItem": {}
        },
        "location": { "index": 3 }
      }
    },
    {
      "createItem": {
        "item": {
          "title": "どこで知りましたか？",
          "questionItem": {
            "question": {
              "required": true,
              "choiceQuestion": {
                "type": "CHECKBOX",
                "options": [
                  { "value": "SNS" },
                  { "value": "友人紹介" },
                  { "value": "検索" },
                  { "value": "その他", "isOther": true }
                ]
              }
            }
          }
        },
        "location": { "index": 4 }
      }
    },
    {
      "createItem": {
        "item": {
          "title": "セクション4: 共通質問",
          "pageBreakItem": {}
        },
        "location": { "index": 5 }
      }
    },
    {
      "createItem": {
        "item": {
          "title": "その他コメント",
          "questionItem": {
            "question": {
              "required": false,
              "textQuestion": { "paragraph": true }
            }
          }
        },
        "location": { "index": 6 }
      }
    }
  ]
}
```

### 分岐設定（updateItem）

フォーム作成後、セクションIDを取得して分岐を設定：

```javascript
// 1. フォームを取得してセクションIDを確認
const form = await forms.forms.get({ formId });
const items = form.data.items;

// セクションIDをマッピング
const sectionIds = {};
items.forEach(item => {
  if (item.pageBreakItem) {
    sectionIds[item.title] = item.itemId;
  }
});

// 2. 分岐を設定
await forms.forms.batchUpdate({
  formId,
  requestBody: {
    requests: [
      {
        updateItem: {
          item: {
            itemId: items[0].itemId,  // Q1のitemId
            title: "参加経験がありますか？",
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: "RADIO",
                  options: [
                    {
                      "value": "はい",
                      "goToSectionId": sectionIds["セクション2: 経験者向け"]
                    },
                    {
                      "value": "いいえ",
                      "goToSectionId": sectionIds["セクション3: 初心者向け"]
                    }
                  ]
                }
              }
            }
          },
          location: { index: 0 },
          updateMask: "questionItem.question.choiceQuestion.options"
        }
      }
    ]
  }
});
```

---

## 制限事項

### 1. 最終ページでは分岐効果なし

最後のセクションでは`goToAction`/`goToSectionId`を設定しても効果がない。

### 2. DROP_DOWN で isOther 使用不可

```json
// ❌ 無効
{
  "choiceQuestion": {
    "type": "DROP_DOWN",
    "options": [
      { "value": "選択肢1" },
      { "isOther": true }  // DROP_DOWNでは使用不可
    ]
  }
}
```

### 3. CHECKBOX は分岐非対応

複数選択の場合、どの組み合わせで分岐するか判定できないため非対応。

### 4. 分岐設定は作成後

`createItem`時に`goToSectionId`を指定してもセクションIDが未確定のため、
フォーム作成後に`updateItem`で設定する必要がある場合が多い。

---

## ベストプラクティス

### 1. セクションは先に作成

```javascript
// 良い例：セクションを先に全て作成
const requests = [
  { createItem: { item: { title: "質問1", ... }, location: { index: 0 } } },
  { createItem: { item: { title: "セクション2", pageBreakItem: {} }, location: { index: 1 } } },
  { createItem: { item: { title: "質問2", ... }, location: { index: 2 } } },
  // ...
];
```

### 2. 分岐ロジックは2段階で

```javascript
// Step 1: フォーム構造を作成
await forms.forms.batchUpdate({ formId, requestBody: { requests: structureRequests } });

// Step 2: セクションIDを取得して分岐を設定
const form = await forms.forms.get({ formId });
await forms.forms.batchUpdate({ formId, requestBody: { requests: branchingRequests } });
```

### 3. フローチャートで設計

条件分岐が複雑な場合は、実装前にフローチャートで設計することを推奨。
