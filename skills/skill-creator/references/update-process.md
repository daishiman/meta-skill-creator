# 更新プロセス（§6.8）

> 18-skills.md §6 更新部分の要約
> **相対パス**: `references/update-process.md`
> **原典**: `docs/00-requirements/18-skills.md` §6.8

---

## モード別ワークフロー

### Mode: create（新規作成）

```
Phase 1: 分析（LLM Task）
analyze-request → extract-purpose → define-boundary
                            ↓
Phase 2: 設計（LLM Task + Script Validation）
select-anchors ─┐
                ├→ design-workflow → [validate-workflow]
define-trigger ─┘
                            ↓
Phase 3: 構造計画（LLM Task + Script Validation）
plan-structure → [validate-plan]
                            ↓
Phase 4: 生成（Script Task）
[init-skill] → [generate-skill-md] → [generate-agents] → [generate-scripts]
                            ↓
Phase 5: 検証（Script Task）
[validate-all]
                            ↓
Phase 6: フィードバック（Script Task）
[log-usage]
```

### Mode: update（既存スキル更新）

```
Phase 1: 差分分析
[detect-mode] → design-update → [validate-schema]
                            ↓
Phase 2: 更新計画
更新対象ファイルの特定 → 依存関係分析 → 更新順序決定
                            ↓
Phase 3: 生成・適用（Script Task）
[apply-updates] → [validate-all]
                            ↓
Phase 4: フィードバック（Script Task）
[log-usage]
```

### Mode: improve-prompt（プロンプト改善）

```
Phase 1: 分析（Script Task）
[detect-mode] → [analyze-prompt]
                            ↓
Phase 2: 改善設計（LLM Task）
improve-prompt → [validate-schema]
                            ↓
Phase 3: 生成・適用（Script Task）
[apply-updates] → [validate-all]
                            ↓
Phase 4: フィードバック（Script Task）
[log-usage]
```

---

## 更新トリガー

| トリガー           | 説明                                        | 推奨モード        |
| ------------------ | ------------------------------------------- | ----------------- |
| フィードバック蓄積 | LOGS.md に改善点が蓄積                      | update            |
| 仕様変更           | 参照書籍の新版、API変更、ドメイン知識の更新 | update            |
| プロンプト最適化   | Task仕様書の明確化・効率化                  | improve-prompt    |
| パフォーマンス問題 | スキルの実行効率が低下                      | improve-prompt    |
| 使用パターン変化   | 想定外の使用方法が主流に                    | update            |
| 依存スキル更新     | 依存先スキルの変更による影響                | update            |

---

## 更新タイプ別リスク

### Type A: コンテンツ更新（低リスク）

| 対象                                   | 使用モード     | 使用スクリプト   |
| -------------------------------------- | -------------- | ---------------- |
| 誤字修正、説明文の改善、参照書籍の追加 | update         | apply_updates.js |

### Type B: 構造更新（中リスク）

| 対象                                             | 使用モード     | 使用スクリプト          |
| ------------------------------------------------ | -------------- | ----------------------- |
| セクション追加、ワークフロー変更、スクリプト追加 | update         | apply_updates.js --backup |

### Type C: プロンプト改善（中リスク）

| 対象                                   | 使用モード     | 使用スクリプト        |
| -------------------------------------- | -------------- | --------------------- |
| agents/*.mdの明確化、具体化、効率化    | improve-prompt | analyze_prompt.js    |

### Type D: 破壊的更新（高リスク）

| 対象                                                | 使用モード | 使用スクリプト            |
| --------------------------------------------------- | ---------- | ------------------------- |
| name変更、description大幅変更、ディレクトリ構造変更 | update     | apply_updates.js --backup |

---

## 使用スクリプト一覧

| スクリプト            | 用途                     | モード           |
| --------------------- | ------------------------ | ---------------- |
| `detect_mode.js`     | モード判定               | 全モード         |
| `analyze_prompt.js`  | プロンプト分析           | improve-prompt   |
| `apply_updates.js`   | 更新適用                 | update, improve  |
| `validate_all.js`    | 全体検証                 | 全モード         |
| `log_usage.js`       | フィードバック記録       | 全モード         |

---

## 実行コマンド例

### update モード

```bash
# 1. モード判定
node scripts/detect_mode.js --request "スキルを更新" --skill-path .claude/skills/my-skill

# 2. 更新適用（dry-run）
node scripts/apply_updates.js --plan .tmp/update-plan.json --dry-run

# 3. 更新適用（実行）
node scripts/apply_updates.js --plan .tmp/update-plan.json --backup

# 4. 検証
node scripts/validate_all.js .claude/skills/my-skill

# 5. フィードバック記録
node scripts/log_usage.js --result success --phase update
```

### improve-prompt モード

```bash
# 1. プロンプト分析
node scripts/analyze_prompt.js --skill-path .claude/skills/my-skill --verbose

# 2. 改善計画確認
cat .tmp/prompt-analysis.json

# 3. 更新適用（LLMが生成した改善をapply）
node scripts/apply_updates.js --plan .tmp/update-plan.json --backup

# 4. 検証
node scripts/validate_all.js .claude/skills/my-skill
```

---

## 関連リソース

- **新規作成プロセス**: See [creation-process.md](creation-process.md)
- **フィードバック**: See [feedback-loop.md](feedback-loop.md)
- **品質基準**: See [quality-standards.md](quality-standards.md)
