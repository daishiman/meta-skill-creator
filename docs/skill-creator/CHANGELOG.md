# 変更履歴

このファイルには、Skill Creatorの全ての注目すべき変更が記録されています。

フォーマットは[Keep a Changelog](https://keepachangelog.com/ja/1.0.0/)に基づいています。

---

## [10.5.0] - 2026-02-13

### Changed
- **ラウンド3リファクタリング（修正）**:
  - `script-types-catalog.md` 全24テンプレート参照修正（存在しないパス→実在パスに修正）
  - `interview-user.md` にPhaseラベル追加（Phase 0-1〜0-8）
  - `resource-map.md` のinterview-user.mdエントリにPhase情報追加
  - `phase-completion-checklist.md` のPhase 5/6に「担当スクリプト」セクション追加
  - scripts/ DRY違反修正（19スクリプト: `getArg/resolvePath/EXIT_*`定数を`utils.js`からのimportに統一）
  - `generate_script.js` テンプレート本体の`EXIT_*`→`EXIT_CODES.*`統一
  - `validate_all.js` の`normalizeLink()`ローカル重複定義を`utils.js`からのimportに統一
  - `delegate-to-codex.md` §5.5残留参照修正

---

## [10.4.0] - 2026-02-13

### Changed
- **ラウンド2リファクタリング（27件修正）**:
  - `phase-completion-checklist.md` 完全書き換え（skill-creator用Phase 0-0〜6対応）
  - `creation-process.md` にCollaborativeモード追加
  - SKILL.md重複バージョン統合
  - 全エージェントへのPhaseラベル追加（16ファイル）
  - データフロー修正（`resolve-skill-dependencies.md`, `delegate-to-codex.md`, `design-multi-skill.md`）

---

## [10.3.0] - 2026-02-13

### Changed
- **ラウンド1リファクタリング（20件修正）**:
  - `design-multi-skill.md` 後続処理フロー修正
  - `delegate-to-external-cli.md` インライン例修正
  - `interview-user.md` 入出力インターフェース拡充・チェックリスト補完
  - `analyze-request.md` にPhase 1ラベル・上流入力・受領先追加
  - `resolve-skill-dependencies.md` / `delegate-to-external-cli.md` にPhase番号追加
  - `select-resources.md` Phase 2.5記述修正・`type-aggregator.md`追加
  - `interview-result.json` MoSCoW記述修正
  - `multi-skill-graph.json` failedSkills required追加

---

## [10.2.0] - 2026-02-13

### Added
- **interviewDepth機能追加**: インタビュー開始時にquick/standard/detailedの3段階深度選択
  - quickモード: 3-4問の最小限質問＋自動推定
  - standardモード: 通常の8段階インタビュー
  - detailedモード: 10-15問の網羅的ヒアリング
- `interview-user.md` にPhase実行マトリクス・デフォルト値テーブル・深度別スキップ条件追加
- `interview-result.json` スキーマに`interviewDepth`フィールド追加

---

## [10.1.0] - 2026-02-13

### Fixed
- 4レビューエージェントの全指摘事項を修正
- スキーマ新規作成: `external-cli-result.json`, `multi-skill-graph.json`
- ワークフロー図更新、相対パス修正、失敗リカバリ追加

---

## [10.0.1] - 2026-02-13

### Fixed
- **v10.0.0レビュー修正18件**:
  - 緊急3件: `select-resources.md`ステップ追加、シェルインジェクション修正、`multi-skill-graph.json`スキーマ作成
  - 高5件: 責務境界明確化、静的/ランタイム分離、enum不一致修正、スキップ条件追加、Script First原則適用
  - 中6件: 正規化マッピング、creationOrder優先順位、ユーザー承認ステップ、examples拡充
  - 低3件: 自己参照ノート、MCP検討、パターン記録

---

## [10.0.0] - 2026-02-13

### Added
- **クロススキル依存関係解決**: 他スキルのSKILL.mdを読み込み、公開インターフェースを特定して依存関係を解決
- **外部CLIエージェント統合**: Gemini CLI等の外部CLIツールをサブタスク実行に活用
- **マルチスキル同時設計**: 複数スキルを一度に設計し、依存関係グラフで管理
- 新規エージェント3件:
  - `agents/resolve-skill-dependencies.md`: クロススキル依存関係解決
  - `agents/delegate-to-external-cli.md`: 外部CLIエージェント委譲
  - `agents/design-multi-skill.md`: マルチスキル同時設計
- 新規リファレンス2件:
  - `references/cross-skill-reference-patterns.md`: クロススキル参照パターン
  - `references/external-cli-agents-guide.md`: 外部CLIエージェントガイド
- 新規スキーマ: `skill-dependency-graph.json`
- `interview-result.json`スキーマ拡張: `skillDependencies`, `externalCliAgents`, `multiSkillPlan`フィールド追加
- `interview-user.md` にPhase 0-3.5（クロススキル参照）・Phase 0-5.5（外部CLI）追加
- Orchestrateモードに`gemini`実行エンジン追加

---

## [9.4.0] - 2026-02-13

### Changed
- セキュリティ教訓反映: TDDセキュリティテスト分類体系、YAGNI共通化判断記録のパターン追加
- Phase 12未タスク2段階判定（raw→精査）を成功パターンとして追加

---

## [9.3.0] - 2026-02-12

### Changed
- SDK統合ドメイン新設: TypeScriptモジュール解決による型安全統合パターン追加
- `phase-completion-checklist.md` のPhase 12完了条件に`verify-unassigned-links.js`実行を追加
- Phase 12成果物名を`documentation-changelog.md`に統一

---

## [9.2.0] - 2026-02-12

### Changed
- IPC機能開発ワークフロー6段階パターン追加（チャンネル定数→ハンドラー→Preload→統合→型定義→登録）

---

## [9.1.0] - 2026-02-12

### Changed
- SkillCreatorService IPC通信基盤の構築完了記録
- Store Hook `renderHook`テストパターン追加
- テストカテゴリ分類(CAT-01〜CAT-05)追加

---

## [9.0.0] - 2026-02-11

### Changed
- Setter Injection（遅延初期化DI）パターン追加
- 型変換パターン（Skill→SkillMetadata）追加
- DIテストモック大規模修正パターン追加

---

## [8.10.0] - 2026-02-10

### Changed
- 統合テストでの依存サービスモック漏れ防止パターン追加
- 入力バリデーション統一パターン追加（whitespace対策）

---

## [8.9.0] - 2026-02-09

### Changed
- `mockReturnValue` vs `mockReturnValueOnce`テスト間リーク防止パターン追加

---

## [8.8.0] - 2026-02-06

### Added
- Supabase OAuth flowType設定、PKCE内部管理委任、ローカルHTTPサーバーコールバック受信の3成功パターン追加
- OAuth関連失敗パターン5件追加

---

## [8.7.0] - 2026-02-06

### Changed
- パターン間のクロスリファレンス追加

---

## [8.6.1] - 2026-02-06

### Changed
- IPC Bridge API統一時のテストモック設計パターン追加
- セッション間仕様書編集永続化検証パターン追加
- Phase 1依存仕様書マトリクスパターン追加

---

## [8.6.0] - 2026-02-06

### Added
- Supabase SDK競合防止パターン追加
- `setTimeout` vs `setInterval`選択パターン追加
- `vi.useFakeTimers`+`flushPromises`テストパターン追加
- Callback DIテスタブル設計パターン追加

---

## [8.5.0] - 2026-02-05

### Added
- OAuthコールバックエラーパラメータ抽出パターン追加
- Zustandリスナー二重登録防止パターン追加
- IPC経由エラー情報伝達設計パターン追加

---

## [8.4.0] - 2026-02-05

### Added
- IPCチャンネル統合パターン追加（ハードコード文字列発見、重複定義整理、ホワイトリスト更新漏れ検証）

---

## [8.3.0] - 2026-02-04

### Added
- 既実装済み修正の発見パターン追加
- テスト環境問題切り分けパターン追加
- React Portal z-index解決パターン追加
- Supabase認証状態変更後即時UI更新パターン追加

---

## [8.2.0] - 2026-02-02

### Added
- E2Eテストパターン追加: ARIA属性ベースセレクタ、ヘルパー関数分離、安定性対策3層パターン

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
