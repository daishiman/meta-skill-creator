# 使い方ガイド

Meta Skill Creatorの詳細な使い方を説明します。

---

## 概要

Meta Skill Creatorは**対話形式のインタビュー**でスキルを作成します。

```
スキル作成を依頼
    ↓
8段階のインタビュー（選択肢から選ぶだけ）
    ↓
要件の構造化（interview-result.json）
    ↓
最適なリソースを自動選択
    ↓
スキル生成・検証
```

---

## 基本的な使い方

### 方法1: 自然言語で話しかける

Claude Codeに直接話しかけるだけでインタビューが開始されます：

```
「新しいスキルを作成したい」
「〇〇を自動化するスキルを作って」
「毎日のレポート作成を自動化したい」
「このスキルのプロンプトを改善して」
```

### 方法2: コマンドで呼び出す

```
/skill-creator
```

---

## インタビューの詳細（8段階）

スキル作成時、以下の8段階で質問されます。各段階で**選択肢が提示**されるので、番号を選ぶだけで回答できます。

### Phase 0-1: ゴール特定

**目的**: 何を達成したいかを明確にする

```
Claude: 何を達成したいですか？
        1. 日常タスクの自動化
        2. 開発ワークフローの改善
        3. データ処理・分析
        4. 外部サービスとの連携
        5. その他（自由記述）
```

**収集する情報**:
- ゴール（達成したいこと）
- ドメイン（対象領域）
- 使用頻度（daily/weekly/monthly/on-demand）
- スケール（personal/team/organization）

### Phase 0-2: 機能ヒアリング

**目的**: 必要な機能をリスト化する

```
Claude: どのような機能が必要ですか？（複数選択可）
        1. データの取得・収集
        2. データの変換・加工
        3. 外部サービスへの送信
        4. ファイルの読み書き
        5. 通知・レポート生成
        6. その他（自由記述）
```

**収集する情報**:
- 機能名
- 機能の説明
- 優先度（must/should/could）

### Phase 0-3: 外部連携ヒアリング

**目的**: 連携するサービスを特定する

```
Claude: 外部サービスとの連携は必要ですか？
        1. はい（サービス名を教えてください）
        2. いいえ

（「はい」の場合、自動でAPI推薦）
Claude: 目的に適したAPIを推薦します：
        1. GitHub API - リポジトリ・Issue・PR操作
        2. Slack API - メッセージ送信・チャンネル管理
        3. Google Sheets API - スプレッドシート操作
```

**収集する情報**:
- サービス名
- 連携目的
- 認証方式（API Key/OAuth/Basic）

### Phase 0-4: スクリプトヒアリング

**目的**: 必要な処理タイプを特定する

```
Claude: どのような処理が必要ですか？
        1. API呼び出し（REST/GraphQL）
        2. データ変換（JSON/CSV/XML）
        3. ファイル操作（読み書き・監視）
        4. 通知送信（Slack/Email/Webhook）
        5. カスタム処理（独自ロジック）
```

**対応スクリプトタイプ（24種類）**:

| カテゴリ | タイプ |
|----------|--------|
| API/通信 | api-client, webhook, websocket, graphql |
| データ処理 | data-transformer, parser, validator, aggregator |
| データベース | db-query, cache-manager, migration |
| 開発ツール | code-generator, linter, formatter, test-runner |
| インフラ | deploy, docker, kubernetes |
| AI/自動化 | llm-caller, mcp-tool, automation |
| ユーティリティ | notification, scheduler, file-watcher, logger |

### Phase 0-5: オーケストレーションヒアリング

**目的**: 処理の流れを決定する

```
Claude: 複数の処理をどのように実行しますか？
        1. 順次実行（chain）- A→B→C の順で実行
        2. 並列実行（parallel）- A,B,C を同時実行
        3. 条件分岐（conditional）- 結果に応じて分岐
        4. 単一処理（single）- 1つの処理のみ
```

**設定例**:

```yaml
# chain（順次実行）
orchestration:
  pattern: chain
  chainOrder:
    - fetch-data
    - transform-data
    - save-to-db

# parallel（並列実行）
orchestration:
  pattern: parallel
  parallelTasks:
    - fetch-users
    - fetch-orders
    - fetch-products

# conditional（条件分岐）
orchestration:
  pattern: conditional
  conditions:
    - if: "result.status === 'success'"
      then: log-success
      else: notify-error
```

### Phase 0-6: スケジュール・トリガーヒアリング

**目的**: 実行タイミングを決定する

```
Claude: いつ実行しますか？
        1. 手動実行（manual）
        2. 定期実行（cron）
        3. イベント駆動（event-driven）
        4. 手動＋定期の両方

（「定期実行」の場合）
Claude: 実行スケジュールを教えてください。
        1. 毎日9:00
        2. 毎週月曜9:00
        3. 毎月1日0:00
        4. カスタム（cron式で指定）
```

**トリガータイプ**:

| タイプ | 説明 | 例 |
|--------|------|-----|
| manual | 手動実行 | コマンドで実行 |
| cron | 時刻ベース | `0 9 * * *`（毎日9:00） |
| webhook | HTTP受信 | GitHub webhook |
| file-watch | ファイル変更 | `*.md`の変更を監視 |
| git | Git操作 | push/commit時 |

### Phase 0-7: ドキュメントヒアリング

**目的**: 生成するドキュメントを決定する

```
Claude: ドキュメントは必要ですか？
        1. APIガイド（エンドポイント・パラメータ説明）
        2. 環境構築ガイド（セットアップ手順）
        3. 両方
        4. 不要
```

**生成されるドキュメント**:
- APIドキュメント: エンドポイント、パラメータ、レスポンス、使用例
- セットアップガイド: 環境変数、依存関係、インストール手順

### Phase 0-8: 構成・優先事項ヒアリング

**目的**: スキルの構成と優先事項を決定する

```
Claude: スキルの構成はどうしますか？
        1. シンプル（simple）- SKILL.mdのみ
        2. 標準（standard）- agents/ + scripts/
        3. フル（full）- 全ディレクトリ構成
        4. カスタム（custom）- 必要なものだけ選択

Claude: 何を優先しますか？（複数選択可）
        1. 実行速度（speed）
        2. 保守性（maintainability）
        3. 拡張性（extensibility）
        4. シンプルさ（simplicity）
```

---

## インタビュー完了後

インタビューが完了すると、以下の流れで処理が進みます：

1. **要件の構造化**: `interview-result.json`に保存
2. **リソース選択**: 要件に基づき最適なリソースを自動選定
3. **分析・設計**: 要件を分析し、スキル構造を設計
4. **生成**: SKILL.md、スクリプト、エージェントを生成
5. **検証**: バリデーションを実行

```
✓ スキル生成完了
  出力先: skills/your-skill-name/
  ファイル:
    - SKILL.md
    - agents/
    - scripts/
    - schemas/
```

---

## モード

### Collaborativeモード（推奨）

インタビュー形式でユーザーと対話しながらスキルを共創するモードです。

**特徴**:
- 段階的な質問でスキルの要件を明確化
- ユーザーの意図を正確に理解
- 抽象的なアイデアから具体的な実装へ

**使用例**:
```
「新しいスキルを作成したい」
→ インタビューが開始され、目的・入力・出力・制約などを質問されます
```

### Orchestrateモード

Claude Code / Codex を使い分けて最適な実行エンジンを選択するモードです。

**実行エンジン**:

| エンジン | 用途 |
|----------|------|
| claude | Claude Code単独実行（推奨） |
| codex | Codex単独実行 |
| claude-to-codex | Claude→Codex連携 |

**使用例**:
```
「このタスクをCodexで実行して」
「Claude CodeとCodexを連携させて」
```

---

## スキル更新

既存のスキルを更新する場合：

```
「このスキルを更新したい」
「〇〇の機能を追加して」
```

スキルのパスを指定する場合：

```
「skills/my-skill を更新して」
```

---

## プロンプト改善

既存スキルのプロンプトを改善する場合：

```
「このスキルのプロンプトを改善して」
「もっと効率的なプロンプトにして」
```

---

## ベストプラクティス

### 1. 明確な目的を伝える

```
❌ 「便利なスキルを作って」
✅ 「GitHubのIssueを自動でSlackに通知するスキルを作って」
```

### 2. 具体的な入出力を伝える

```
❌ 「データを処理するスキル」
✅ 「CSVファイルを読み込んでJSON形式に変換するスキル」
```

### 3. 制約を事前に伝える

```
✅ 「外部APIは使わずにローカルで完結させたい」
✅ 「Node.js 18以上で動作させたい」
✅ 「1分以内に処理が完了する必要がある」
```

### 4. インタビューでは選択肢を活用

インタビューでは選択肢が提示されます。迷ったら「その他」を選んで自由記述で補足できます。

---

## 作成されるスキルの構造

```
skills/your-skill-name/
├── SKILL.md           # スキル定義（必須）
├── agents/            # サブエージェント定義
│   ├── analyze.md
│   └── execute.md
├── scripts/           # 自動化スクリプト
│   ├── main.js
│   └── utils.js
├── schemas/           # JSONスキーマ
│   └── input.json
├── references/        # 参照ドキュメント
│   └── guide.md
└── assets/            # テンプレート・素材
    └── template.md
```

---

## トラブルシューティング

問題が発生した場合は、[TROUBLESHOOTING.md](TROUBLESHOOTING.md)を参照してください。

---

## 関連ドキュメント

- [インストールガイド](INSTALLATION.md)
- [トラブルシューティング](TROUBLESHOOTING.md)
- [変更履歴](CHANGELOG.md)
