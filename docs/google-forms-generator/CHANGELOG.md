# 変更履歴 - Google Forms Generator

このファイルには、Google Forms Generatorの全ての注目すべき変更が記録されています。

フォーマットは[Keep a Changelog](https://keepachangelog.com/ja/1.0.0/)に基づいています。

---

## [1.3.0] - 2026-01-20

### Added
- **マルチエージェント拡張**: 6つの補助エージェント追加
  - `05-template-selector.md`: テンプレートからの素早い作成
  - `06-validator.md`: API実行前の構成検証
  - `07-error-handler.md`: APIエラーからのリカバリ
  - `08-response-manager.md`: 回答データの取得・エクスポート
  - `09-form-modifier.md`: 既存フォームの修正
  - `10-auth-helper.md`: OAuth認証のセットアップ・トラブルシュート
- 代替フロー追加（テンプレート開始/フォーム修正/回答取得/エラー復旧/認証設定）

### Changed
- ワークフロー図を拡張

---

## [1.2.2] - 2026-01-20

### Changed
- skill-design-spec.md準拠で3テンプレート追加
  - `feedback.json`
  - `text-question.json`
  - `rating-question.json`

---

## [1.2.1] - 2026-01-20

### Fixed
- SKILL.md内テンプレートファイル名を実ファイル名と一致するよう修正
  - customer-survey → survey
  - quiz-template → quiz
  - rating-question → scale-rating
- `choice-question.json`、`contact.json` を追加

---

## [1.2.0] - 2026-01-20

### Added
- **仕様準拠完了**: 8ファイル追加
  - `scripts/auth/refresh-token.js`
  - `scripts/forms/update-settings.js`
  - `scripts/drive/set-permissions.js`
  - `scripts/sheets/export-to-sheet.js`
  - `scripts/utils/validate-config.js`
  - `templates/form-patterns/custom.json`
  - `templates/question-builders/date-time-question.json`
  - `.env.example`

---

## [1.1.0] - 2026-01-20

### Added
- **結果保存機能**: `05_Project/GoogleFrom/` にdesign/result Markdownを自動保存
- `scripts/output/save-form-result.js`

---

## [1.0.0] - 2026-01-20

### Added
- 初版リリース
- Google Forms APIを使用したフォーム自動生成
- 4つのコアエージェント（interviewer, designer, executor, reporter）
- 11種類の質問タイプ対応
- クイズモード、メール収集、条件分岐
- Google Drive連携（フォルダ移動）
- 6種類のフォームテンプレート
- 6種類の質問ビルダーテンプレート
- OAuth 2.0認証スクリプト
