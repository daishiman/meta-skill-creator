# 変更履歴

このファイルには、Meta Skill Creatorの全ての注目すべき変更が記録されています。

フォーマットは[Keep a Changelog](https://keepachangelog.com/ja/1.0.0/)に基づいています。

---

## [8.1.0] - 2026-01-30

### Changed
- **構造リファクタリング**: schemas追加（`problem-definition.json`, `domain-model.json`）
- **integration-patterns.md分割**: 1,171→70行（索引）+ 4サブファイル（REST/GraphQL/Webhook/IPC）
- **resource-map.md更新**: 新規リソースの反映、成果物明確化セクション追加
- `.tmp`ファイルクリーンアップ

---

## [8.0.0] - 2026-01-30

### Added
- **Problem First + DDD/Clean Architecture統合**:
  - Phase 0-0: 問題発見フェーズ追加（`discover-problem.md`）
  - Phase 0.5: ドメインモデリングフェーズ追加（`model-domain.md`）
- 新規エージェント:
  - `agents/discover-problem.md`: 5 Whys根本原因分析
  - `agents/model-domain.md`: DDD戦略設計 + Clean Architecture
- 新規リファレンス:
  - `references/problem-discovery-framework.md`: 問題発見フレームワーク
  - `references/domain-modeling-guide.md`: ドメインモデリングガイド
  - `references/clean-architecture-for-skills.md`: Clean Architectureスキル適用
- 新規スキーマ:
  - `schemas/problem-definition.json`: 問題定義の構造化データ
  - `schemas/domain-model.json`: ドメインモデルの構造化データ

### Changed
- **Anchors更新**: Clean Architecture (Robert C. Martin) 追加、DDD拡張（戦略的設計・Bounded Context）
- **core-principles.md拡張**: Problem First（§2.5）、DDD（§2.6）、Clean Architecture（§2.7）追加
- **interview-user.md更新**: problem-definition.json / domain-model.json を入力コンテキストとして参照
- **SKILL.md**: ワークフロー概要にPhase 0-0 / 0.5を追加、機能別ガイドにProblem First/DDD/Clean Architecture参照追加
- **設計原則テーブル**: Problem First、DDD、Clean Architectureを追加

---

## [7.2.0] - 2026-01-28

### Added
- **統合パターン集**: `references/integration-patterns.md`（REST/GraphQL/Webhook/IPC）
- **Phase完了チェックリスト**: `references/phase-completion-checklist.md`

### Changed
- **interview-guide.md**: Phase 0-1〜0-8の8段階に整合
- **README.md**: Claude Codeの起動が必要であることを明記
- **INSTALLATION.md**: Claude Codeの説明とダウンロードリンクを追加
- **USAGE.md**: インタビューフローの詳細説明を追加
- **TROUBLESHOOTING.md**: インタビュー関連の問題と解決方法を追加
- **resource-map.md更新**: 成果物明確化セクション追加、統合契約パターンリンク

---

## [7.1.2] - 2026-01-28

### Changed
- SKILL.mdからハードコード数値を削除（動的に変わるリソース数等）
- READMEからバージョンバッジを削除（手動管理が難しいため）
- インストールコマンドを修正（daishi → daishiman）

---

## [7.1.1] - 2026-01-28

### Changed
- `script-llm-patterns.md`リファクタリング: 責務分離を明確化
- 関連リソースの整理

---

## [7.1.0] - 2026-01-28

### Added
- `script-llm-patterns.md`: スクリプト/LLM責務分離パターンガイド

---

## [7.0.1] - 2026-01-24

### Fixed
- `custom-script-design.json`スキーマ追加
- 壊れた参照リンクの修正

---

## [7.0.0] - 2026-01-24

### Changed
- **大規模リファクタリング**: SKILL.md 481→130行（73%削減）
- 詳細な説明をreferencesディレクトリに委譲
- Progressive Disclosureの徹底

---

## [6.2.0] - 2026-01-24

### Added
- API推薦機能: `recommend-integrations.md`
- API マッピングガイド: `goal-to-api-mapping.md`

---

## [6.1.0] - 2026-01-24

### Added
- 自動リソース選択機能: `select-resources.md`

---

## [6.0.0] - 2026-01-24

### Added
- **オーケストレーション機能**: 複数スキルの連携実行
- **ドキュメント生成機能**: API仕様書・セットアップガイドの自動生成
- `orchestration-guide.md`: オーケストレーションガイド
- `api-docs-standards.md`: APIドキュメント規約

---

## [5.7.0] - 2026-01-21

### Changed
- Part 5（リソース一覧）を`resource-map.md`に分離
- SKILL.mdのさらなる簡素化

---

## [5.6.0] - 2026-01-21

### Added
- **Self-Contained Skills**: 各スキルが独自の依存関係を管理
- PNPM対応: `pnpm-workspace.yaml`サポート
- `install_deps.js`: 依存関係自動インストールスクリプト

---

## [5.2.1] - 2026-01-15

### Changed
- Codex連携の目的を明確化: スキル作成内サブタスク委譲用
- Claude Code⇄Codexラウンドトリップパターンの文書化

---

## [5.2.0] - 2026-01-15

### Added
- **Orchestrateモード**: 実行エンジン選択機能
  - `claude`: Claude Code単独実行
  - `codex`: Codex単独実行
  - `claude-to-codex`: Claude → Codex連携
- `interview-execution-mode.md`: 実行モードヒアリング用エージェント
- `delegate-to-codex.md`: Codex委譲用エージェント
- `execution-mode-guide.md`: モード選択ガイド
- `codex-best-practices.md`: Codex利用のベストプラクティス
- 新規スキーマ:
  - `execution-mode.json`
  - `codex-task.json`
  - `codex-result.json`
- 新規スクリプト:
  - `check_prerequisites.js`
  - `assign_codex.js`

---

## [5.1.0] - 2026-01-15

### Changed
- SKILL.md簡素化: 不要なセクションを削除
- agents/フォーマット統一: 全エージェントでTask仕様書形式を採用
- `workflow-patterns.md`に複数のパターンを統合

### Fixed
- リンク切れの修正
- スキーマの一貫性向上

---

## [5.0.0] - 2026-01-15

### Added
- **Collaborative Firstモード**: ユーザー対話型スキル共創（推奨）
- **抽象度レベル対応**:
  - L1: Concept（アイデア・課題レベル）
  - L2: Capability（機能・能力レベル）
  - L3: Implementation（実装・詳細レベル）
- **カスタムスクリプト対応**: 24タイプに収まらない独自スクリプト生成
- `interview-user.md`: ユーザーインタビュー用エージェント
- `abstraction-levels.md`: 抽象度レベルガイド
- `design-custom-script.md`: カスタムスクリプト設計エージェント

### Changed
- デフォルトモードをcreateからcollaborativeに変更
- Progressive Disclosureの強化

---

## [4.0.0] - 2026-01-13

### Added
- **スクリプト生成ワークフロー**:
  - 24種類のスクリプトタイプ対応
  - ランタイム自動判定（node/python/bash）
  - 変数テンプレートシステム
- **自己改善サイクル**:
  - `log_usage.js`: 使用ログ記録
  - `collect_feedback.js`: フィードバック収集
  - `apply_self_improvement.js`: 改善適用
- `analyze-script-requirement.md`: スクリプト要件分析エージェント
- `design-script.md`: スクリプト設計エージェント
- `design-variables.md`: 変数設計エージェント
- `generate-code.md`: コード生成エージェント
- タイプ別テンプレート（`type-*.md`）

---

## [3.0.0] - 2026-01-06

### Added
- **3モード対応**:
  - `create`: 新規作成
  - `update`: 更新
  - `improve-prompt`: プロンプト改善
- `detect_mode.js`: モード自動判定スクリプト
- `analyze_prompt.js`: プロンプト分析スクリプト
- `apply_updates.js`: 更新適用スクリプト

### Changed
- ワークフローの体系化
- バリデーション機能の強化

---

## [2.0.0] - 2026-01-01

### Added
- Progressive Disclosureシステム
- バンドルリソース構造:
  - `agents/`: エージェント定義
  - `references/`: 参照ドキュメント
  - `assets/`: テンプレート・素材
  - `schemas/`: JSONスキーマ
  - `scripts/`: 自動化スクリプト
- 知識圧縮アンカーシステム

### Changed
- SKILL.mdフォーマットの標準化
- フロントマター仕様の確定

---

## [1.0.0] - 2025-12-15

### Added
- 初回リリース
- 基本的なスキル作成機能
- SKILL.md生成
- シンプルなバリデーション
