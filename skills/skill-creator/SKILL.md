---
name: skill-creator
description: |
  スキルを作成・更新・プロンプト改善するためのメタスキル。
  **collaborative**モードでユーザーと対話しながら共創し、
  抽象的なアイデアから具体的な実装まで柔軟に対応する。
  **orchestrate**モードでタスクの実行エンジン（Claude Code / Codex / 連携）を選択。

  Anchors:
  • Continuous Delivery (Jez Humble) / 適用: 自動化パイプライン / 目的: 決定論的実行
  • The Lean Startup (Eric Ries) / 適用: Build-Measure-Learn / 目的: 反復改善
  • Domain-Driven Design (Eric Evans) / 適用: ユビキタス言語 / 目的: 一貫した語彙
  • Design Thinking (IDEO) / 適用: ユーザー中心設計 / 目的: 共感と共創
  • Microservices Patterns (Richardson) / 適用: サービス委譲 / 目的: 疎結合な連携

  Trigger:
  新規スキルの作成、既存スキルの更新、プロンプト改善を行う場合に使用。
  スキル作成, スキル更新, プロンプト改善, skill creation, skill update, improve prompt,
  Codexに任せて, assign codex, Codexで実行, GPTに依頼, 実行モード選択, どのAIを使う
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

# Skill Creator

## 概要

スキルを作成・更新・プロンプト改善するためのメタスキル。
**Collaborative First**でユーザーと対話しながら共創、**Script First**で決定論的処理を自動化、**Progressive Disclosure**で必要なリソースのみを読み込む。

## 設計原則

| 原則 | 説明 |
|------|------|
| **Collaborative First** | ユーザーとの対話を通じて要件を明確化 |
| Script First | 決定論的処理はスクリプトで実行（100%精度） |
| Progressive Disclosure | 必要な時に必要なリソースのみ読み込み |
| Custom Script Support | 24タイプに収まらない独自スクリプトも生成 |

## モード一覧

| モード | 用途 | 開始方法 |
|--------|------|----------|
| **collaborative** | ユーザー対話型スキル共創（推奨） | AskUserQuestionでインタビュー開始 |
| **orchestrate** | 実行エンジン選択（Claude/Codex/連携） | AskUserQuestionでヒアリング開始 |
| create | 要件が明確な場合の新規作成 | `detect_mode.js --request "新規スキル"` |
| update | 既存スキル更新 | `detect_mode.js --request "更新" --skill-path <path>` |
| improve-prompt | プロンプト改善 | `analyze_prompt.js --skill-path <path>` |

## 実行エンジン（orchestrateモード）

| エンジン | 説明 | 適用場面 |
|----------|------|----------|
| **claude** | Claude Code単独実行 | ファイル編集、Git操作、コードベース深い理解 |
| **codex** | Codex (GPT-5.2) 単独実行 | 独立したタスク、別視点での分析 |
| **claude-to-codex** | Claude → Codex連携 | コンテキスト共有が必要な複合タスク |

## 抽象度レベル

| レベル | 説明 | 例 |
|--------|------|-----|
| **L1: Concept** | アイデア・課題レベル | 「開発効率を上げたい」 |
| **L2: Capability** | 機能・能力レベル | 「PRを自動作成したい」 |
| **L3: Implementation** | 実装・詳細レベル | 「GitHub APIでPR作成」 |

**抽象度が高いほど、インタビューを通じて具体化する。**
📖 詳細: [references/abstraction-levels.md](references/abstraction-levels.md)

---

# Part 0: Collaborative モード（推奨）

ユーザーと対話しながらスキルを共創するモード。

## ワークフロー

```
Phase 0-1: 初期ヒアリング
  Q1: 何を実現したいですか？ → 抽象度レベル判定
  Q2: 対象は何ですか？ → コンテキスト特定
  Q3: 頻度・規模は？ → 複雑さ判定
      ↓
Phase 0-2: 機能ヒアリング
  Q4: 必要な機能は？
  Q5: 外部連携は？
  Q6: スクリプトは？
      ↓
Phase 0-3: 構成ヒアリング
  Q7: 構成タイプは？（シンプル/標準/フル）
  Q8: 優先事項は？
      ↓
Phase 0-4: 要件確認
  → ユーザー確認後、Phase 1へ
```

📖 詳細: [agents/interview-user.md](agents/interview-user.md)

---

# Part 0.5: Orchestrate モード（実行エンジン選択）

**スキル作成プロセス内**で、特定のサブタスクを最適な実行エンジンに委譲するモード。
Codex専用スキルを作成するのではなく、**Claude Code上でCodexを補助的に利用**する。

### 使用シナリオ

```
skill-creator実行中
    │
    ├─ Phase X: 特定タスクでCodexを使いたい
    │     ↓
    │  Claude Code → Codex（タスク実行）→ Claude Code
    │     ↓
    └─ 続きのPhaseを継続
```

**重要**: Codexは一部のタスクを委譲するための補助機能であり、独立したCodex専用スキルを作成するものではない。

## ワークフロー

```
Phase 1: タスクヒアリング（LLM - interview-execution-mode.md）
  Q1: 何を実行したいですか？ → タスク内容特定
  Q2: コードベースとの関連は？ → コンテキスト判定
      ↓
Phase 2: モード推奨・選択（LLM - interview-execution-mode.md）
  Q3: 実行エンジンは？
      → 推奨モードを提示、ユーザーが最終決定
      → execution-mode.json を生成
      ↓
Phase 3: 実行（モード別分岐）
  ┌─ claude: Claude Codeで直接実行
  │
  ├─ codex: （delegate-to-codex.md を読み込み）
  │    [check_prerequisites.js] → [assign_codex.js]
  │
  └─ claude-to-codex: （delegate-to-codex.md を読み込み）
       コンテキスト収集（LLM）→ [assign_codex.js] → 結果統合
      ↓
Phase 4: 結果確認（ユーザー確認）
  → Codex結果の検証・統合・フィードバック
```

## モード選択基準

```
[タスク分析]
     │
     ▼
ファイル編集が必要? ──Yes──► claude（推奨）
│
No
│
▼
Git操作が必要? ──Yes──► claude（推奨）
│
No
│
▼
コードベース理解が必要? ──Yes──► claude or claude-to-codex
│
No
│
▼
独立した分析/生成? ──Yes──► codex または claude
│
No
│
▼
└──► ユーザーに確認
```

**重要**: 推奨は提示するが、最終決定は常にユーザー。

## 関連リソース

| リソース | 読み込みタイミング |
|----------|-------------------|
| [agents/interview-execution-mode.md](agents/interview-execution-mode.md) | Phase 1-2: ヒアリング時 |
| [agents/delegate-to-codex.md](agents/delegate-to-codex.md) | Phase 3: Codex実行時 |
| [references/execution-mode-guide.md](references/execution-mode-guide.md) | モード判断に迷った時 |
| [references/codex-best-practices.md](references/codex-best-practices.md) | Codex利用時 |
| [schemas/execution-mode.json](schemas/execution-mode.json) | モード選択結果の検証 |
| [schemas/codex-task.json](schemas/codex-task.json) | Codexタスク定義の検証 |
| [schemas/codex-result.json](schemas/codex-result.json) | Codex結果の検証 |

---

# Part 1: スキル作成ワークフロー（createモード）

```
Phase 1: 分析（LLM）
  analyze-request → extract-purpose → define-boundary
      ↓
Phase 2: 設計（LLM + Script検証）
  select-anchors ─┐
                  ├→ design-workflow → [validate-workflow]
  define-trigger ─┘
      ↓
Phase 3: 構造計画（LLM + Script検証）
  plan-structure → [validate-plan]
      ↓
Phase 4: 生成（Script）
  [init-skill] → [generate-skill-md] → [generate-agents]
      ↓
Phase 5: 検証（Script）
  [validate-all] → [log-usage]
```

凡例: `[script]` = Script Task (100%精度)

---

# Part 2: スクリプト生成ワークフロー

## 24種類のスクリプトタイプ

| カテゴリ | タイプ |
|----------|--------|
| API関連 | api-client, webhook, scraper, notification |
| データ処理 | parser, transformer, aggregator, file-processor |
| ストレージ | database, cache, queue |
| 開発ツール | git-ops, test-runner, linter, formatter, builder |
| インフラ | deployer, docker, cloud, monitor |
| 統合 | ai-tool, mcp-bridge, shell |
| 汎用 | universal |

📖 詳細: [references/script-types-catalog.md](references/script-types-catalog.md)

## 生成ワークフロー

```
Phase 1: 要件分析（LLM）→ script-requirement.json
Phase 2: ランタイム判定（Script）→ runtime-config.json
Phase 3: 設計（LLM）→ script-design.json
Phase 4: 変数設計（LLM）→ variables.json
Phase 5: コード生成（LLM）→ script-template.{ext}
Phase 6: コード展開（Script）→ 実行可能スクリプト
Phase 7: 検証（Script）
```

📖 カスタムスクリプト: [agents/design-custom-script.md](agents/design-custom-script.md)

---

# Part 3: 自己改善ワークフロー

```
スキル使用 → [log_usage.js] → LOGS.mdに記録
     ↓
[collect_feedback.js] → 使用統計・エラーパターン分析
     ↓
analyze-feedback.md → 改善機会特定
     ↓
design-self-improvement.md → 改善計画設計
     ↓
[apply_self_improvement.js] → 改善適用
  --dry-run: 事前確認
  --backup: バックアップ作成
```

📖 詳細: [references/self-improvement-cycle.md](references/self-improvement-cycle.md)

---

# Part 4: Progressive Disclosure リソースマップ

リソースは**必要な時のみ**読み込む。

## agents/

| Agent | 読み込み条件 |
|-------|-------------|
| [interview-user.md](agents/interview-user.md) | collaborativeモード時 |
| [interview-execution-mode.md](agents/interview-execution-mode.md) | orchestrateモード時 |
| [delegate-to-codex.md](agents/delegate-to-codex.md) | Codex委譲時 |
| [analyze-request.md](agents/analyze-request.md) | createモード時 |
| [extract-purpose.md](agents/extract-purpose.md) | 要求分析後 |
| [define-boundary.md](agents/define-boundary.md) | 目的定義後 |
| [define-trigger.md](agents/define-trigger.md) | 目的定義後 |
| [select-anchors.md](agents/select-anchors.md) | 目的定義後 |
| [design-workflow.md](agents/design-workflow.md) | ワークフロー設計時 |
| [plan-structure.md](agents/plan-structure.md) | 構造計画時 |
| [design-update.md](agents/design-update.md) | updateモード時 |
| [improve-prompt.md](agents/improve-prompt.md) | improve-promptモード時 |
| [analyze-script-requirement.md](agents/analyze-script-requirement.md) | スクリプト要件分析時 |
| [design-script.md](agents/design-script.md) | スクリプト設計時 |
| [design-custom-script.md](agents/design-custom-script.md) | カスタムスクリプト時 |
| [generate-code.md](agents/generate-code.md) | コード生成時 |
| [design-variables.md](agents/design-variables.md) | 変数設計時 |
| [analyze-feedback.md](agents/analyze-feedback.md) | 改善分析時 |
| [design-self-improvement.md](agents/design-self-improvement.md) | 改善計画時 |

## references/

| Reference | 読み込み条件 |
|-----------|-------------|
| [interview-guide.md](references/interview-guide.md) | collaborativeモード時 |
| [execution-mode-guide.md](references/execution-mode-guide.md) | orchestrateモード時 |
| [codex-best-practices.md](references/codex-best-practices.md) | Codex利用時 |
| [abstraction-levels.md](references/abstraction-levels.md) | 抽象度判定時 |
| [script-types-catalog.md](references/script-types-catalog.md) | タイプ選択時 |
| [runtime-guide.md](references/runtime-guide.md) | ランタイム設定時 |
| [workflow-patterns.md](references/workflow-patterns.md) | ワークフロー設計時 |
| [skill-structure.md](references/skill-structure.md) | 構造計画時 |
| [self-improvement-cycle.md](references/self-improvement-cycle.md) | 自己改善時 |

## scripts/

| Script | 用途 |
|--------|------|
| `detect_mode.js` | モード判定（create/update/improve-prompt/orchestrate） |
| `detect_runtime.js` | ランタイム判定（node/python/bash） |
| `check_prerequisites.js` | Codex事前条件チェック（git, codex CLI） |
| `assign_codex.js` | Codexへのタスク委譲 |
| `init_skill.js` | ディレクトリ初期化 |
| `generate_skill_md.js` | SKILL.md生成 |
| `generate_agent.js` | agents/*.md生成 |
| `generate_script.js` | scripts/*.js生成 |
| `generate_dynamic_code.js` | テンプレート変数展開 |
| `validate_all.js` | 全体検証（構造・リンク・品質） |
| `validate_structure.js` | 構造検証 |
| `validate_links.js` | リンク検証 |
| `validate_schema.js` | スキーマ検証 |
| `validate_workflow.js` | ワークフロー検証 |
| `validate_plan.js` | 構造計画検証 |
| `quick_validate.js` | 簡易検証 |
| `analyze_prompt.js` | プロンプト分析 |
| `apply_updates.js` | 更新適用 |
| `update_skill_list.js` | skill_list.md更新 |
| `log_usage.js` | 使用記録 |
| `collect_feedback.js` | フィードバック収集 |
| `apply_self_improvement.js` | 改善適用 |

## assets/

**エージェントテンプレート**: agent-template.md（Task仕様書形式）

**ベーステンプレート**: base-node.js, base-python.py, base-bash.sh, base-typescript.ts

**タイプ別テンプレート**: type-{type}.md （24タイプ対応）

## schemas/

**エージェント定義**: agent-definition.json（agent-template.md用変数スキーマ）

**Codex関連**:
- execution-mode.json（実行モード選択結果）
- codex-task.json（Codexタスク定義）
- codex-result.json（Codex実行結果）

---

## ベストプラクティス

| すべきこと | 避けるべきこと |
|-----------|---------------|
| Script優先（決定論的処理） | 全リソースを一度に読み込む |
| LLMは判断・創造のみ | Script可能な処理をLLMに任せる |
| Progressive Disclosure | 具体例をテンプレートに書く |
| 中間出力は.tmp/に保存 | 中間ファイルを省略 |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| **5.2.1** | **2026-01-15** | **Codex連携の目的明確化: スキル作成内サブタスク委譲用、Claude Code⇄Codexラウンドトリップパターン** |
| 5.2.0 | 2026-01-15 | Orchestrateモード追加: Codex連携機能、実行エンジン選択（claude/codex/claude-to-codex） |
| 5.1.0 | 2026-01-15 | リファクタリング: SKILL.md簡素化、agents/フォーマット統一、workflow-patterns.md統合 |
| 5.0.0 | 2026-01-15 | Collaborative First追加、抽象度レベル対応、カスタムスクリプト対応 |
| 4.0.0 | 2026-01-13 | スクリプト生成ワークフロー追加、自己改善サイクル追加 |
| 3.0.0 | 2026-01-06 | 3モード対応（create/update/improve-prompt） |
