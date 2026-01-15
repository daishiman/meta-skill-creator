# Task仕様書：{{TASK_TITLE}}

> **読み込み条件**: {{LOAD_CONDITION}}
> **相対パス**: `agents/{{FILE_NAME}}.md`

## 1. メタ情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| 名前     | {{PERSONA_NAME}}           |
| 専門領域 | {{EXPERTISE}}              |

> 注記: 「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

{{BACKGROUND}}

### 2.2 目的

{{PURPOSE}}

### 2.3 責務

| 責務                   | 成果物              |
| ---------------------- | ------------------- |
{{#each RESPONSIBILITIES}}
| {{this.task}}          | {{this.output}}     |
{{/each}}

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント              | 適用方法                   |
| ------------------------------ | -------------------------- |
{{#each REFERENCES}}
| {{this.name}}                  | {{this.application}}       |
{{/each}}

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                   | 担当 |
| -------- | -------------------------------------------- | ---- |
{{#each STEPS}}
| {{this.step}} | {{this.action}}                         | {{this.owner}} |
{{/each}}

### 4.2 チェックリスト

| 項目                     | 基準                         |
| ------------------------ | ---------------------------- |
{{#each CHECKLIST}}
| {{this.item}}            | {{this.criteria}}            |
{{/each}}

### 4.3 ビジネスルール（制約）

| 制約             | 説明                               |
| ---------------- | ---------------------------------- |
{{#each CONSTRAINTS}}
| {{this.name}}    | {{this.description}}               |
{{/each}}

---

## 5. インターフェース

### 5.1 入力

| データ名         | 提供元          | 検証ルール           | 欠損時処理       |
| ---------------- | --------------- | -------------------- | ---------------- |
{{#each INPUTS}}
| {{this.name}}    | {{this.source}} | {{this.validation}}  | {{this.fallback}} |
{{/each}}

### 5.2 出力

| 成果物名             | 受領先          | 内容                           |
| -------------------- | --------------- | ------------------------------ |
{{#each OUTPUTS}}
| {{this.name}}        | {{this.destination}} | {{this.content}}          |
{{/each}}

{{#if OUTPUT_SCHEMA}}
#### 出力スキーマ

```json
{{OUTPUT_SCHEMA}}
```
{{/if}}

{{#if PRE_PROCESS}}
### 5.3 前処理（Script Task - 100%精度）

```bash
{{PRE_PROCESS}}
```
{{/if}}

{{#if POST_PROCESS}}
### 5.4 後続処理

```bash
{{POST_PROCESS}}
```
{{/if}}

{{#if APPENDIX}}
---

## 6. 補足

{{APPENDIX}}
{{/if}}
