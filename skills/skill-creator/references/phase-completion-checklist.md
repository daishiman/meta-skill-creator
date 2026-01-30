# Phase完了チェックリスト

> **相対パス**: `references/phase-completion-checklist.md`
> **用途**: タスク仕様書のPhase 1-13完了条件の共通テンプレート

---

## 概要

タスク仕様書（TASK-7B等）のPhase実行時に使用する完了条件チェックリスト。
各Phaseの必須成果物、検証方法、artifacts.json更新手順を定義。

---

## Phase共通完了条件

すべてのPhaseに共通する完了条件。

### 必須チェック項目

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

### 検証コマンド（共通）

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <task-dir> --phase <N>

# 例: TASK-7BのPhase 1検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7B-skill-import-dialog --phase 1
```

---

## Phase別チェックリスト

<details>
<summary><strong>Phase 1: 要件定義</strong></summary>

### 目的

機能要件・非機能要件を明文化し、受け入れ基準を定義する。

### 完了条件

- [ ] 全要件が抽出されている（FR/NFRリスト完成）
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類・優先度設定されている
- [ ] 接続要件（Zustand/型連携等）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている

### 必須成果物

| 成果物       | パス                                         |
| ------------ | -------------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        |

### サブタスク管理

1. 参照資料の確認
2. 要件抽出の実施
3. 受け入れ基準作成の実施
4. FR/NFR分類の実施
5. 成果物の作成・配置
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 2: 設計</strong></summary>

### 目的

コンポーネント設計・UI設計を行い、実装の青写真を作成する。

### 完了条件

- [ ] コンポーネント設計が完成している
- [ ] Props/State/Hooksの設計が明記されている
- [ ] UI設計（レイアウト・インタラクション）が定義されている
- [ ] 依存関係（Store/API/型）が整理されている
- [ ] アクセシビリティ要件が考慮されている

### 必須成果物

| 成果物             | パス                                  |
| ------------------ | ------------------------------------- |
| コンポーネント設計 | `outputs/phase-2/component-design.md` |
| UI設計             | `outputs/phase-2/ui-design.md`        |

### サブタスク管理

1. 参照資料の確認
2. コンポーネント構造の設計
3. Props/State/Hooksの定義
4. UI/UX設計の実施
5. 成果物の作成・配置
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 3: 設計レビューゲート</strong></summary>

### 目的

設計の妥当性を検証し、実装前に問題を発見する。

### 完了条件

- [ ] 設計レビューチェックリストが完了している
- [ ] 既存アーキテクチャとの整合性が確認されている
- [ ] SOLID原則への準拠が確認されている
- [ ] セキュリティ・パフォーマンス考慮が検証されている
- [ ] 指摘事項があれば修正が完了している

### 必須成果物

| 成果物           | パス                                      |
| ---------------- | ----------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` |

### サブタスク管理

1. 設計書の読み込み
2. レビューチェックリストの実行
3. 指摘事項の整理
4. 修正対応（必要時）
5. 最終承認
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 4: テスト作成（TDD: Red）</strong></summary>

### 目的

実装前にテストを作成し、Red状態を確立する。

### 完了条件

- [ ] テスト仕様書が作成されている
- [ ] テストファイルが作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストケースがFR/NFRをカバーしている
- [ ] モック/スタブの設計が完了している

### 必須成果物

| 成果物       | パス                                    |
| ------------ | --------------------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` |
| テストケース | `outputs/phase-4/test-cases.md`         |

### 検証コマンド

```bash
# テスト実行（Red確認）
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

### サブタスク管理

1. 参照資料の確認
2. テスト仕様書の作成
3. テストファイルの作成
4. モック/スタブの設計
5. Red状態の確認
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 5: 実装（TDD: Green）</strong></summary>

### 目的

テストを通すための最小限の実装を行う（Green状態）。

### 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] メインコンポーネントが実装されている
- [ ] 内部コンポーネントが実装されている
- [ ] Store連携が動作する
- [ ] index.tsにエクスポートが追加されている

### 必須成果物

| 成果物           | パス                      |
| ---------------- | ------------------------- |
| 実装ファイル     | `src/.../<Component>.tsx` |
| 更新済みindex.ts | `src/.../index.ts`        |

### 検証コマンド

```bash
# テスト実行（Green確認）
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

### サブタスク管理

1. 参照資料の確認
2. メインコンポーネントの実装
3. 内部コンポーネントの実装
4. Store連携の実装
5. index.tsの更新
6. テスト実行とGreen確認
7. 完了条件の検証

</details>

<details>
<summary><strong>Phase 6: テスト拡充</strong></summary>

### 目的

エッジケース・統合テストを追加し、カバレッジを向上させる。

### 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 統合テストが追加されている（必要な場合）
- [ ] エラーハンドリングテストが追加されている
- [ ] すべてのテストが成功している
- [ ] カバレッジレポートが作成されている

### 必須成果物

| 成果物             | パス                                 |
| ------------------ | ------------------------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md` |

### 検証コマンド

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test:coverage
```

### サブタスク管理

1. 参照資料の確認
2. エッジケースの洗い出し
3. エッジケーステスト追加
4. 統合テスト追加（必要時）
5. カバレッジレポート作成
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 7: カバレッジ確認</strong></summary>

### 目的

テストカバレッジが品質基準を満たしているか確認する。

### 完了条件

- [ ] Line Coverage: 80%以上
- [ ] Branch Coverage: 60%以上
- [ ] Function Coverage: 80%以上
- [ ] 未カバー箇所の理由が明記されている
- [ ] 改善計画が立てられている（基準未達の場合）

### 必須成果物

| 成果物             | パス                                 |
| ------------------ | ------------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` |

### 検証コマンド

```bash
# カバレッジ測定
pnpm --filter @repo/desktop test:coverage

# カバレッジ基準
# Line:     80%+
# Branch:   60%+
# Function: 80%+
```

### サブタスク管理

1. カバレッジ測定の実行
2. 結果の分析
3. 未カバー箇所の特定
4. 追加テストの作成（必要時）
5. 最終カバレッジの確認
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 8: リファクタリング（TDD: Refactor）</strong></summary>

### 目的

テストを維持しながらコード品質を改善する。

### 完了条件

- [ ] コードの重複が削減されている
- [ ] 関数/コンポーネントの責務が単一になっている
- [ ] 命名が明確で一貫している
- [ ] すべてのテストが引き続き成功している
- [ ] リファクタリングレポートが作成されている

### 必須成果物

| 成果物                   | パス                                    |
| ------------------------ | --------------------------------------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` |

### 検証コマンド

```bash
# テスト実行（リファクタリング後）
pnpm --filter @repo/desktop test

# Lint実行
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck
```

### サブタスク管理

1. コードレビューの実施
2. 改善ポイントの特定
3. リファクタリングの実施
4. テスト実行による確認
5. リファクタリングレポート作成
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 9: 品質保証</strong></summary>

### 目的

品質ゲートをクリアし、本番品質を確保する。

### 完了条件

- [ ] ESLintエラーなし
- [ ] TypeScript型エラーなし
- [ ] すべてのテストが成功
- [ ] カバレッジ基準達成
- [ ] パフォーマンス基準達成（該当する場合）
- [ ] 品質レポートが作成されている

### 必須成果物

| 成果物       | パス                                |
| ------------ | ----------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` |

### 検証コマンド

```bash
# 品質チェック一括実行
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test:coverage
```

### サブタスク管理

1. Lint実行と修正
2. TypeCheck実行と修正
3. テスト実行と確認
4. カバレッジ確認
5. 品質レポート作成
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 10: 最終レビューゲート</strong></summary>

### 目的

全体的な品質・整合性を検証し、リリース準備を確認する。

### 完了条件

- [ ] 全Phaseの成果物が揃っている
- [ ] 機能要件がすべて満たされている
- [ ] 非機能要件がすべて満たされている
- [ ] ドキュメントが整備されている
- [ ] 最終レビュー結果が記録されている

### 必須成果物

| 成果物           | パス                                      |
| ---------------- | ----------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` |

### サブタスク管理

1. 全Phase成果物の確認
2. 機能要件チェック
3. 非機能要件チェック
4. ドキュメント整備確認
5. 最終レビュー結果作成
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 11: 手動テスト</strong></summary>

### 目的

実際の操作による動作確認を行う。

### 完了条件

- [ ] 手動テストシナリオが実行されている
- [ ] 全シナリオがPASSしている
- [ ] 発見された問題が修正されている
- [ ] 手動テスト結果が記録されている

### 必須成果物

| 成果物         | パス                                     |
| -------------- | ---------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` |

### サブタスク管理

1. テストシナリオの準備
2. 開発サーバーの起動
3. シナリオ実行と結果記録
4. 問題修正（必要時）
5. 最終確認
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 12: ドキュメント更新</strong></summary>

### 目的

実装ガイド・仕様書を更新し、未タスクを検出する。

### 完了条件

- [ ] 実装ガイドが更新されている
- [ ] 仕様書が更新されている
- [ ] 未タスクが検出・記録されている
- [ ] Changelogが更新されている

### 必須成果物

| 成果物       | パス                                            |
| ------------ | ----------------------------------------------- |
| 実装ガイド   | `outputs/phase-12/implementation-guide.md`      |
| 未タスク検出 | `outputs/phase-12/unassigned-task-detection.md` |
| Changelog    | `outputs/phase-12/documentation-changelog.md`   |

### サブタスク管理

1. 実装ガイドの更新
2. 仕様書の更新
3. 未タスクの検出
4. Changelogの更新
5. 成果物の作成・配置
6. 完了条件の検証

</details>

<details>
<summary><strong>Phase 13: PR作成</strong></summary>

### 目的

変更をコミットし、Pull Requestを作成し、CIを確認する。

### 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリがcompleted-tasksに移動されている

### 必須成果物

| 成果物 | パス                          |
| ------ | ----------------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` |

### タスク完了処理

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/<TASK-ID>/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep <TASK-ID>

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): <TASK-ID>をcompleted-tasksに移動"
git push
```

### サブタスク管理

1. ユーザーへのローカル動作確認依頼
2. 変更サマリーの提示と許可確認
3. PR作成の実行
4. CI通過確認
5. タスクディレクトリのcompleted-tasks移動
6. 完了条件の検証

</details>

---

## artifacts.json更新チェックリスト

### 更新タイミング

各Phase完了時にartifacts.jsonを更新する。

### 更新項目

```json
{
  "taskId": "<TASK-ID>",
  "taskName": "<タスク名>",
  "createdAt": "<作成日時>",
  "completedAt": "<完了日時（Phase 13完了時）>",
  "phases": {
    "phase-N": {
      "name": "<Phase名>",
      "status": "completed|in-progress|pending",
      "artifacts": [
        {
          "file": "outputs/phase-N/<filename>.md",
          "description": "<成果物の説明>"
        }
      ]
    }
  },
  "outputs": {
    "implementation": ["<実装ファイルパス>"],
    "tests": ["<テストファイルパス>"],
    "documentation": ["<ドキュメントパス>"]
  },
  "dependencies": {
    "dependsOn": ["<依存タスクID>"],
    "blocks": ["<ブロック先タスクID>"]
  },
  "qualityMetrics": {
    "testCount": <テスト数>,
    "coverage": {
      "line": <Line%>,
      "branch": <Branch%>,
      "function": <Function%>
    },
    "linting": "pass|fail",
    "typecheck": "pass|fail"
  },
  "metadata": {
    "tier": <1-3>,
    "priority": "high|medium|low",
    "tags": ["<タグ>"]
  }
}
```

### 更新チェック項目

- [ ] phases.phase-N.status が "completed" に更新されている
- [ ] phases.phase-N.artifacts に成果物が追加されている
- [ ] outputs セクションが最新の実装を反映している
- [ ] qualityMetrics が最新のテスト結果を反映している
- [ ] completedAt が Phase 13 完了時に設定されている

---

## 検証スクリプト呼び出し方法

### Phase出力検証

```bash
# 基本形式
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <task-dir> --phase <N>

# オプション
--verbose    # 詳細出力
--fix        # 自動修正を試みる
--json       # JSON形式で出力
```

### 品質チェック

```bash
# Lint
pnpm --filter @repo/desktop lint

# TypeCheck
pnpm --filter @repo/desktop typecheck

# テスト
pnpm --filter @repo/desktop test

# カバレッジ
pnpm --filter @repo/desktop test:coverage
```

### スキル検証（skill-creator向け）

```bash
# スキル構造検証
node scripts/quick_validate.js .claude/skills/<skill-name>

# 詳細検証
node scripts/quick_validate.js .claude/skills/<skill-name> --verbose
```

---

## 実例: TASK-7B

### Phase構成

| Phase | 名称               | 主な成果物                        |
| ----- | ------------------ | --------------------------------- |
| 1     | 要件定義           | requirements-definition.md        |
| 2     | 設計               | component-design.md, ui-design.md |
| 3     | 設計レビューゲート | design-review-result.md           |
| 4     | テスト作成         | test-specification.md             |
| 5     | 実装               | SkillImportDialog.tsx             |
| 6     | テスト拡充         | coverage-report.md                |
| 7     | カバレッジ確認     | coverage-report.md                |
| 8     | リファクタリング   | refactoring-report.md             |
| 9     | 品質保証           | quality-report.md                 |
| 10    | 最終レビューゲート | final-review-result.md            |
| 11    | 手動テスト         | manual-test-result.md             |
| 12    | ドキュメント更新   | implementation-guide.md           |
| 13    | PR作成             | pr-info.md                        |

### ディレクトリ構造

```
docs/30-workflows/TASK-7B-skill-import-dialog/
├── index.md                    # タスク概要
├── phase-1.md                  # Phase 1仕様
├── phase-2.md                  # Phase 2仕様
├── ...
├── phase-13.md                 # Phase 13仕様
├── artifacts.json              # 成果物追跡
└── outputs/
    ├── phase-1/
    │   ├── requirements-definition.md
    │   ├── acceptance-criteria.md
    │   └── scope-definition.md
    ├── phase-2/
    │   ├── component-design.md
    │   └── ui-design.md
    └── ...
```

---

## 関連リソース

- **作成プロセス**: See [creation-process.md](creation-process.md)
- **品質基準**: See [quality-standards.md](quality-standards.md)
- **スキル構造**: See [skill-structure.md](skill-structure.md)
- **ワークフローパターン**: See [workflow-patterns.md](workflow-patterns.md)
