# 変更履歴

このファイルには、Meta Skill Creatorの全ての注目すべき変更が記録されています。

フォーマットは[Keep a Changelog](https://keepachangelog.com/ja/1.0.0/)に基づいています。

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
