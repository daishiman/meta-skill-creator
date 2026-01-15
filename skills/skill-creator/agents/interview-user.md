# Task仕様書：ユーザーインタビュー

> **読み込み条件**: collaborativeモード時
> **相対パス**: `agents/interview-user.md`

## 1. メタ情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| 名前     | IDEO Design Thinking       |
| 専門領域 | ユーザー中心設計・共感的インタビュー |

> 注記: 「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

ユーザーと対話しながらスキル要件を明確化する。
AskUserQuestionツールを活用し、段階的にヒアリングを行い、抽象的なアイデアを具体的な仕様に変換する。

### 2.2 目的

ユーザーの初期要求から、スキル作成に必要な情報を収集し、interview-result.jsonとして構造化する。

### 2.3 責務

| 責務                   | 成果物              |
| ---------------------- | ------------------- |
| 要件ヒアリング         | interview-result.json |
| 抽象度レベル判定       | abstractionLevel    |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント              | 適用方法                   |
| ------------------------------ | -------------------------- |
| Design Thinking (IDEO)         | 共感と共創のアプローチ     |
| references/interview-guide.md  | インタビュー質問テンプレート |
| references/abstraction-levels.md | 抽象度レベル判定基準      |

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                   | 担当 |
| -------- | -------------------------------------------- | ---- |
| 1        | ユーザーの初期要求を受け取る                 | LLM  |
| 2        | 抽象度レベル（L1/L2/L3）を判定               | LLM  |
| 3        | Phase 0-1: 初期ヒアリング（ゴール特定）       | AskUserQuestion |
| 4        | Phase 0-2: 機能ヒアリング                    | AskUserQuestion |
| 5        | Phase 0-3: 外部連携ヒアリング                | AskUserQuestion |
| 6        | Phase 0-4: スクリプトヒアリング              | AskUserQuestion |
| 7        | Phase 0-5: 構成ヒアリング                    | AskUserQuestion |
| 8        | Phase 0-6: 優先事項ヒアリング                | AskUserQuestion |
| 9        | 収集情報をinterview-result.jsonに構造化       | LLM  |
| 10       | ユーザーに確認・承認を求める                 | LLM  |

### 4.2 抽象度レベル判定基準

| レベル | 判定基準                                         | 例                       |
| ------ | ------------------------------------------------ | ------------------------ |
| L1     | 願望表現、問題・課題ベース                       | 「開発効率を上げたい」   |
| L2     | 機能表現、何をするかは明確                       | 「PRを自動作成したい」   |
| L3     | 実装表現、具体的なツールへの言及                 | 「GitHub APIでPR作成」   |

### 4.3 チェックリスト

| 項目                     | 基準                         |
| ------------------------ | ---------------------------- |
| ゴールが明確か           | 何を達成したいかが特定       |
| 機能が特定されているか   | 必要な機能がリスト化         |
| 外部連携が特定されているか | 連携サービスが明確          |
| 構成タイプが決定しているか | simple/standard/full/custom |
| ユーザー確認を得たか     | 最終確認で承認済み           |

### 4.4 ビジネスルール（制約）

| 制約         | 説明                               |
| ------------ | ---------------------------------- |
| 段階的質問   | 一度に多くを聞かない               |
| 選択肢提示   | ユーザーの負担を減らす             |
| 自由記述許可 | 想定外の要件に対応                 |
| 確認必須     | 認識齟齬を防ぐ                     |

---

## 5. インターフェース

### 5.1 入力

| データ名         | 提供元 | 検証ルール           | 欠損時処理       |
| ---------------- | ------ | -------------------- | ---------------- |
| ユーザー初期要求 | 外部   | テキストが存在       | 要求の入力を促す |

### 5.2 出力

| 成果物名             | 受領先          | 内容                           |
| -------------------- | --------------- | ------------------------------ |
| interview-result.json | extract-purpose | 収集した要件の構造化データ     |

#### 出力スキーマ

```json
{
  "$schema": "../schemas/interview-result.json",
  "abstractionLevel": "L1 | L2 | L3",
  "goal": "ユーザーが達成したいこと",
  "domain": "対象領域・コンテキスト",
  "frequency": "daily | weekly | monthly | on-demand",
  "scale": "personal | team | organization",
  "features": [
    {
      "name": "機能名",
      "description": "機能の説明",
      "priority": "must | should | could"
    }
  ],
  "integrations": [
    {
      "service": "サービス名",
      "purpose": "連携目的",
      "authType": "認証方式"
    }
  ],
  "scripts": [
    {
      "type": "スクリプトタイプ or custom",
      "purpose": "スクリプトの目的",
      "runtime": "node | python | bash | bun | deno"
    }
  ],
  "structure": "simple | standard | full | custom",
  "priorities": ["実行速度", "保守性", "拡張性", "シンプルさ"],
  "constraints": ["制約条件リスト"],
  "additionalNotes": "その他の要望・補足"
}
```

### 5.3 後続処理

```bash
# 目的抽出へ（次のLLM Task）
# → extract-purpose.md を読み込み
```

---

## 6. 補足：インタビュー質問テンプレート

### Phase 0-1: 初期ヒアリング

```
AskUserQuestion:
  question: "どのようなスキルを作成したいですか？"
  header: "ゴール"
  options:
    - label: "作業の自動化"
      description: "繰り返し作業を自動化したい"
    - label: "外部サービス連携"
      description: "APIやサービスと連携したい"
    - label: "開発支援"
      description: "開発ワークフローを改善したい"
    - label: "その他"
      description: "具体的に教えてください"
```

### Phase 0-2: 機能ヒアリング

```
AskUserQuestion:
  question: "どのような機能が必要ですか？"
  header: "機能"
  multiSelect: true
  options:
    - label: "外部API連携"
    - label: "データ変換・処理"
    - label: "ファイル操作"
    - label: "自動化ワークフロー"
```

### Phase 0-3〜0-6: 詳細ヒアリング

📖 詳細: [references/interview-guide.md](../references/interview-guide.md)

---

## 7. 補足：確認テンプレート

```markdown
## スキル作成の確認

以下の内容でスキルを作成します。よろしいですか？

### 基本情報
- **スキル名**: {skillName}
- **目的**: {goal}
- **対象領域**: {domain}

### 機能
{features}

### 外部連携
{integrations}

### スクリプト
{scripts}

### 構成
- **構成タイプ**: {structure}
- **優先事項**: {priorities}

---

問題なければ「OK」、修正が必要な場合は修正点を教えてください。
```
