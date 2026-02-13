# 実行パターン集

> **読み込み条件**: スキル実行時、改善検討時
> **更新タイミング**: パターンを発見したら追記

---

## クイックナビゲーション

| ドメイン               | 成功パターン                                                                                                                                                                       | 失敗パターン                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 🔐 認証・セッション    | Supabase SDK競合防止, setTimeout方式選択, Callback DI, Zustandリスナー二重登録防止, IPC経由エラー伝達, OAuthコールバックエラー抽出, React Portal z-index, Supabase認証状態即時更新 | -                                                      |
| ⏱️ テスト              | vi.useFakeTimers+flushPromises, ARIA属性ベースセレクタ, E2Eヘルパー関数分離, E2E安定性対策3層, mockReturnValueOnceテスト間リーク防止, 統合テスト依存サービスモック漏れ防止, DIテストモック大規模修正, Store Hook renderHookパターン, **テスト環境別イベント発火選択**, **モノレポテスト実行ディレクトリ**, **SDKテスト有効化モック2段階リセット** | テスト環境問題の実装問題誤認, モジュールモック下タイマーテスト失敗 |
| 📋 Phase 12            | 成果物名厳密化, サブタスク完了チェックリスト, Step 1完了チェックリスト, Phase 12 Task 2クイックリファレンス, 横断的問題追加検証, 未タスク2段階判定（raw→精査）                               | 成果物名暗黙解釈, サブタスク暗黙省略, Step 1-A更新漏れ, 未タスクraw検出の誤読 |
| 🔌 IPC・アーキテクチャ | IPCチャンネル統合, コンポーネント同階層ユーティリティ配置, 順次フィルタパイプライン, 横断的セキュリティバイパス検出, 入力バリデーション統一(whitespace対策), IPC/サービス層型変換, **IPC機能開発ワークフロー6段階**, **IPC L3セキュリティハードニング** | ハードコード文字列発見                                 |
| 🏗️ DI・設計            | Setter Injection遅延初期化                                                                                                                                                         | -                                                      |
| 🛡️ セキュリティ         | TDDセキュリティテスト分類体系, YAGNI共通化判断記録                                                                                  | 正規表現パターンPrettier干渉                          |
| 📦 スキル設計          | Collaborative First, Script Firstメトリクス, 詳細情報分離, 大規模DRYリファクタリング, **クロススキル・マルチスキル・外部CLI 3軸同時設計** | -                                                      |
| 🔗 SDK統合             | TypeScriptモジュール解決による型安全統合, **SDKテストTODO一括有効化**                                                                                                              | カスタムdeclare moduleとSDK実型共存, 未タスク配置ディレクトリ混同 |
| 🔧 ビルド・環境        | -                                                                                                                                                                                  | ネイティブモジュールNODE_MODULE_VERSION不一致          |

## 成功パターン

成功した実行から学んだベストプラクティス。

### [Skill] Collaborative First による要件明確化

- **状況**: ユーザーの要求が抽象的（L1/L2レベル）
- **アプローチ**: AskUserQuestion でインタビューを実施し、段階的に具体化
- **結果**: 要件の認識齟齬を防ぎ、手戻りを削減
- **適用条件**: 抽象度が高い要求、複数の解釈が可能な場合
- **発見日**: 2026-01-15

### [Skill] Script First によるメトリクス収集

- **状況**: フィードバック分析でデータ収集が必要
- **アプローチ**: collect_feedback.js でメトリクスを収集し、LLMは解釈のみ担当
- **結果**: 100%正確なデータに基づく改善提案が可能
- **適用条件**: 定量的なデータが必要な処理
- **発見日**: 2026-01-13

### [Skill] 詳細情報の分離によるSKILL.md最適化

- **状況**: SKILL.mdが500行制限を超過（521行）
- **アプローチ**:
  - Part 0.5: 詳細フローチャートをexecution-mode-guide.mdへ移動（86行→30行）
  - scripts/: 5テーブルを1テーブル+参照リンクへ統合（54行→14行）
- **結果**: 521行→420行に削減（101行削減、19.4%減）
- **適用条件**: Progressive Disclosure対象の詳細情報が肥大化した場合
- **発見日**: 2026-01-20

### [Skill] 大規模DRYリファクタリング

- **状況**: SKILL.md 481行、interview-user.md 398行と肥大化
- **アプローチ**:
  - SKILL.md: 詳細ワークフローをreferencesに委譲、エントリポイントと参照のみに
  - orchestration-guide.md: 実行モデル重複をworkflow-patterns.mdへの参照に
  - interview-user.md: 質問テンプレートをinterview-guide.mdへの参照に
- **結果**: SKILL.md 69%削減（481→149行）、interview-user.md 52%削減（398→191行）
- **適用条件**: 300行超のファイルで詳細とサマリーが混在している場合
- **発見日**: 2026-01-24

### [Skill] クロススキル・マルチスキル・外部CLI拡張の3軸同時設計

- **状況**: skill-creator v10.0.0で3つの大機能（クロススキル依存関係、外部CLIエージェント、マルチスキル同時設計）を同時追加
- **アプローチ**:
  - 各機能を独立したエージェント（resolve-skill-dependencies / delegate-to-external-cli / design-multi-skill）に分離
  - 共通のインターフェースをinterview-result.jsonスキーマの拡張フィールドとして定義
  - select-resources.mdの選択マトリクス（4.1.7 / 4.1.8）を追加して既存パイプラインに統合
  - 静的依存グラフ（skill-dependency-graph.json）とランタイム設定（externalCliAgents）を明確に分離
  - Meshパターンは単方向DAGとして表現（参照タイプ分離で双方向に見える関係を実現）
- **結果**: 既存のPhaseパイプラインを壊さず3つの大機能を統合。エージェント間の責務が明確で相互干渉なし
- **適用条件**: 既存スキルに複数の独立した大機能を同時追加する場合
- **教訓**:
  - スキーマを先に定義してからエージェントを実装すると整合性が高い
  - 新機能のインタビューPhaseにはスキップ条件を付けてユーザー負担を軽減する
  - セキュリティ面では `execFileSync` + 引数配列（シェルインジェクション防止）が必須
  - 4エージェント並列レビュー（16思考法）で設計矛盾を早期発見できた
- **発見日**: 2026-02-13
- **関連バージョン**: v10.0.0

### [Phase12] Phase仕様書の成果物名厳密化

- **状況**: Phase 12実行時に仕様書と異なるファイル名で成果物を生成
- **アプローチ**:
  - Phase仕様書の成果物セクションにファイル名パターンを明記
  - 実行前に成果物一覧を確認するチェックリストを追加
- **結果**: 仕様書どおりの成果物が生成され、検証が容易に
- **適用条件**: Phase実行時、特に複数成果物を持つPhase
- **発見日**: 2026-01-22
- **関連タスク**: SHARED-TYPE-EXPORT-01

### [Phase12] スキル間ドキュメント整合性の定期確認

- **状況**: task-specification-creatorのSKILL.mdとreferences/artifact-naming-conventions.mdでPhase 12成果物リストが不整合
- **アプローチ**:
  - SKILL.mdの成果物定義を正とし、references/を同期
  - 改善作業時に関連ドキュメントの整合性を確認
- **結果**: artifact-naming-conventions.mdにPhase 12の3成果物（implementation-guide.md, documentation-changelog.md, unassigned-task-report.md）を追加
- **適用条件**: スキル改善時、バージョンアップ時
- **発見日**: 2026-01-22
- **関連タスク**: SHARED-TYPE-EXPORT-01

### [Phase12] 完了済み未タスク指示書の配置整合（残置防止）

- **状況**: 機能実装完了後も、対応済みの未タスク指示書が `docs/30-workflows/unassigned-task/` に残り、運用上「未完了」と誤認される
- **アプローチ**:
  - Phase 12完了時に、完了済みの未タスク指示書を `docs/30-workflows/completed-tasks/unassigned-task/` へ移管
  - `task-workflow.md` / 関連interfaces仕様書 / workflow index の参照パスを同時更新
  - `artifacts.json` と phase-12成果物（監査レポート含む）を最終整合チェック
- **結果**: 未タスク台帳の状態と実ファイル配置が一致し、完了/未完了の判定ミスを抑制
- **適用条件**: 未タスクを起票した機能タスクが完了し、Phase 12の文書化を実施するタイミング
- **発見日**: 2026-02-12
- **関連タスク**: UT-9B-H-003

### [Architecture] 既存アダプターパターンの活用（新規API統合時）

- **状況**: システムプロンプトのLLM API統合時、仕様書ではVercel AI SDK使用を提案
- **アプローチ**:
  - 既存のLLMAdapterFactoryパターンを調査・活用
  - 新規SDKを追加せず、既存アダプター経由で4プロバイダー（OpenAI, Anthropic, Google, xAI）に対応
  - buildMessages()でシステムプロンプトをLLMMessage[]に変換
- **結果**: 既存アーキテクチャとの一貫性を維持、依存関係を最小化、54テスト全PASS
- **適用条件**: LLM機能追加時、外部API統合時
- **発見日**: 2026-01-23
- **関連タスク**: TASK-CHAT-SYSPROMPT-LLM-001

### [Phase12] システム仕様書への完了タスク記録

- **状況**: Phase 12 Task 2でシステム仕様書更新が必要
- **アプローチ**:
  - 該当するinterfaces-\*.mdに「完了タスク」セクションを追加
  - タスクID、概要、実装日、主要成果を記録
  - 「関連ドキュメント」に実装ガイドリンクを追加
- **結果**: タスク完了の追跡可能性が向上、後続開発者が実装履歴を把握可能
- **適用条件**: Phase 12実行時、機能追加完了時
- **発見日**: 2026-01-23
- **関連タスク**: TASK-CHAT-SYSPROMPT-LLM-001

### [Phase12] Phase 12 Task 2の見落とし防止

- **状況**: Phase 12 Task 2（システム仕様書更新）が実行されずにPhase 12完了とマークされた
- **アプローチ**:
  - phase-templates.mdのPhase 12完了条件に明示的チェックリスト追加
  - 【Phase 12-2 Step 1】等のプレフィックス付与で視認性向上
  - spec-update-workflow.mdへの参照リンクをテンプレート内に埋め込み
  - フォールバック手順セクションを追加
- **結果**: 2ステップ（タスク完了記録＋システム仕様更新）の実行漏れを防止
- **適用条件**: Phase 12実行時、特に複数サブタスクを持つPhase
- **発見日**: 2026-01-22
- **関連タスク**: UT-007 ChatHistoryProvider App Integration

### [Phase12] 未タスク参照リンクの実在チェック

- **状況**: `task-workflow.md` に未タスクを登録したが、`docs/30-workflows/unassigned-task/` に実体ファイルがなく参照切れになる
- **アプローチ**:
  - 未タスク登録後に `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行
  - `missing > 0` の場合は Phase 12 を完了扱いにしない
  - 完了タスクへ移動した場合は `task-workflow.md` の参照先を `completed-tasks/` 側に更新
- **結果**: 未タスク探索時のリンク切れを事前に排除し、後続タスクの追跡性を維持
- **適用条件**: Phase 12で未タスクを新規作成・更新した場合、または完了移動を行った場合
- **発見日**: 2026-02-12
- **関連タスク**: UT-FIX-AGENTVIEW-INFINITE-LOOP-001

### [Phase12] Phase 12 Step 1 検証スクリプトによる自動化

- **状況**: Phase 12 Step 1（必須タスク完了記録）が正しく実行されたか手動確認が困難
- **アプローチ**:
  - `validate-phase12-step1.js` スクリプトを作成し、必須要件を自動検証
  - 検証項目: 完了タスクセクション、実装ガイドリンク、変更履歴エントリ
  - SKILL.mdに検証コマンドを追加し、Phase 12完了前に実行を促す
- **結果**: 必須要件の漏れを自動検出、Phase 12完了前に問題を発見可能
- **適用条件**: Phase 12 Task 12-2 実行時、システム仕様書更新後の検証
- **発見日**: 2026-01-23
- **関連タスク**: SHARED-TYPE-EXPORT-03
- **検証コマンド**: `node .claude/skills/task-specification-creator/scripts/validate-phase12-step1.js --workflow <dir> --spec <file>`

### [Phase12] 複数システム仕様書への横断的更新

- **状況**: 単一タスクが複数の仕様書に関連する場合の更新漏れ
- **アプローチ**:
  - 関連仕様書を事前にリストアップ（例: interfaces-rag-community-detection.md + architecture-monorepo.md）
  - 各仕様書に対して Phase 12 Step 1 検証スクリプトを実行
  - spec-update-record.md に全更新対象を明記
- **結果**: 関連する全仕様書に一貫した完了タスク記録と実装ガイドリンクを追加
- **適用条件**: アーキテクチャ横断的な実装タスク、型エクスポート/インポートパターン変更時
- **発見日**: 2026-01-23
- **関連タスク**: SHARED-TYPE-EXPORT-03

### [Testing] E2EテストでのARIA属性ベースセレクタ優先

- **状況**: Playwrightでドロップダウンコンポーネントをテストする際のセレクタ選定
- **アプローチ**:
  - CSSクラスやdata-testid属性の代わりにARIA属性（`role="combobox"`, `role="listbox"`, `role="option"`）を優先使用
  - `page.getByRole()` APIで要素を取得
  - アクセシビリティ検証とE2Eテストを同時に実現
- **結果**: アクセシビリティ準拠の確認とテスト安定性の両立（CSSクラス変更に強い）
- **適用条件**: UI E2Eテスト、特にフォームコントロールやナビゲーション要素
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

### [Testing] E2Eヘルパー関数による操作シーケンスの分離

- **状況**: 複数のE2Eテストで同じ操作シーケンス（スキル選択、ドロップダウン開閉など）が重複
- **アプローチ**:
  - 共通操作をヘルパー関数として抽出（`openSkillDropdown()`, `selectSkillByName()`等）
  - テストファイル先頭またはユーティリティファイルに配置
  - 各テストケースはヘルパー関数を呼び出して操作を実行
- **結果**: DRY原則の適用、保守性向上、テスト可読性向上
- **適用条件**: E2Eテストで3回以上繰り返される操作シーケンス
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

### [Testing] E2E安定性対策3層アプローチ

- **状況**: E2Eテストでフレーキー（不安定）なテスト結果が発生
- **アプローチ**:
  - 層1: 明示的待機（`waitForSelector`, `waitForFunction`）
  - 層2: UI安定化待機（アニメーション完了、ローディング状態解消）
  - 層3: DOMロード待機（`networkidle`, `domcontentloaded`）
- **結果**: テスト成功率100%、CI環境での安定動作
- **適用条件**: アニメーション、非同期データ取得、動的コンテンツを含むE2Eテスト
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

### [Auth] 既実装済み修正の発見パターン（AUTH-UI-001）

- **状況**: バグ修正タスクで、調査中に既に修正が実装済みであることを発見
- **アプローチ**:
  - Step 1: 問題の再現を試みる前に、まず関連コードを詳細に調査
  - Step 2: 修正コードの存在確認（z-index、フォールバック処理、状態更新フロー）
  - Step 3: 既存実装の動作検証で問題解決を確認
- **結果**: 不要な実装作業を回避、Phase 12の文書化と知識共有に注力
- **適用条件**: バグ修正タスク、Issue報告から時間が経過している場合
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001

### [Testing] テスト環境問題と実装コード切り分けパターン（AUTH-UI-001）

- **状況**: 33件のテストが失敗しているが、実装コード自体は正常動作
- **アプローチ**:
  - Step 1: テスト失敗のエラーメッセージを分析（`handler not registered`等）
  - Step 2: 本番環境での動作確認で実装の正常性を検証
  - Step 3: テスト環境問題として切り分け、未タスク（UT-AUTH-001）として登録
- **結果**: 実装の品質担保とテスト環境問題の適切な分離
- **適用条件**: テスト失敗がモック環境に起因する場合、本番動作が正常な場合
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001, UT-AUTH-001

### [UI] React Portalによるz-index問題解決パターン（AUTH-UI-001）

- **状況**: ドロップダウンメニューが他の要素の下に隠れる（z-indexだけでは解決不可）
- **アプローチ**:
  - 問題: CSSのスタッキングコンテキストにより、子要素のz-indexが親の範囲内に制限される
  - 解決: React Portalで`document.body`直下にレンダリングし、DOM階層から切り離す
  - 実装: `createPortal(<DropdownContent className="z-[9999]" />, document.body)`
- **結果**: z-[9999]がグローバルに機能し、確実に最前面表示
- **適用条件**: モーダル、ドロップダウン、ツールチップ等のオーバーレイUI
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001

### [Auth] Supabase認証状態変更後の即時UI更新パターン（AUTH-UI-001）

- **状況**: 認証状態変更（リンク/解除）後にUIが即座に更新されない
- **アプローチ**:
  - 問題: `onAuthStateChange`イベント後にプロバイダー情報を再取得していない
  - 解決: 認証状態変更時に`fetchLinkedProviders()`を明示的に呼び出す
  - 実装場所: `authSlice.ts`の認証イベントハンドラ内（行342-345付近）
- **結果**: OAuth連携操作後に即座にUI状態が反映
- **適用条件**: Supabase Auth + Zustand状態管理の組み合わせ
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001

### [Auth] OAuthコールバックエラーパラメータ抽出パターン（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: OAuthコールバックURL内のエラーパラメータを検出してUIに反映したい
- **アプローチ**:
  - 問題: OAuth implicit flowではエラー情報がURLフラグメント(`#error=...`)に含まれる
  - 解決: `url.substring(url.indexOf('#') + 1)`でフラグメント抽出後、URLSearchParamsでパース
  - 実装: `parseOAuthError()`関数を作成し、`handleAuthCallback`内で呼び出す
- **結果**: ユーザーがOAuthをキャンセルした場合のエラーを検出し、適切なエラーメッセージを表示
- **適用条件**: OAuth implicit flow、カスタムプロトコルコールバック処理
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

### [Auth] Zustandリスナー二重登録防止パターン（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: initializeAuthが複数回呼ばれるとリスナーが重複登録される
- **アプローチ**:
  - 問題: React Strict ModeやHot Reloadで初期化関数が複数回実行される
  - 解決: モジュールスコープの`authListenerRegistered`フラグで登録状態を追跡
  - テスト対応: `resetAuthListenerFlag()`エクスポート関数で各テスト前にリセット
- **結果**: リスナーの二重登録を防止し、認証状態変更の重複処理を回避
- **適用条件**: Electron IPC + Zustandでの認証状態管理
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

### [IPC] IPC経由のエラー情報伝達設計パターン（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: Main ProcessのエラーをRenderer側のUIに伝える必要がある
- **アプローチ**:
  - 問題: 既存のIPCイベントペイロードにエラー情報フィールドがない
  - 解決: ペイロード型に`error`, `errorCode`フィールドを追加し、既存のイベントで送信
  - 型拡張: `AuthState`インターフェースに`errorCode?: AuthErrorCode`を追加
- **結果**: 新規チャネル追加なしで、既存の`AUTH_STATE_CHANGED`イベントでエラー伝達
- **適用条件**: Electron IPC設計、エラーハンドリング拡張
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

### IPC Bridge API統一時のテストモック設計パターン（TASK-FIX-5-1）

- **状況**: `window.skillAPI` と `window.electronAPI.skill` の二重定義を統一する際、テストモックの再設計が必要（623行→1092行に膨張）
- **アプローチ**:
  - `vi.hoisted()` でモック定義をファイルスコープの巻き上げ位置に配置
  - フィクスチャファクトリ関数でテストごとにリセット可能なモックを生成
  - パスエイリアス（`@/`）と相対パスの両方に対応するモック配布パターン
- **結果**: テストの保守性向上、モック二重定義の解消、210テスト全PASS
- **適用条件**: Electron Preload APIの変更、IPC Bridge層のリファクタリング
- **発見日**: 2026-02-06
- **関連タスク**: TASK-FIX-5-1-SKILL-API-UNIFICATION
- **関連仕様書**: [architecture-implementation-patterns.md S2](.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)

### セッション間での仕様書編集永続化検証パターン（TASK-FIX-5-1）

- **状況**: 前セッションで10件の仕様書修正を完了と報告したが、8件がディスクに永続化されていなかった
- **アプローチ**:
  - 大量編集後は `git diff --stat` で変更ファイル数と期待値の一致を検証
  - PostToolUseフック（Prettier/ESLint）によるファイル変更で Edit の `old_string` 不一致が発生する可能性を認識
  - 重要な編集は直後に `git diff <file>` で実際の差分を確認
- **結果**: 全8件の未永続化を発見し再適用、仕様書と実装の完全な整合性を達成
- **適用条件**: 複数セッションにまたがる仕様書更新、Linterフックが有効な環境
- **発見日**: 2026-02-06
- **関連タスク**: TASK-FIX-5-1-SKILL-API-UNIFICATION
- **関連ルール**: [06-known-pitfalls.md P11](.claude/rules/06-known-pitfalls.md)

### Phase 1仕様書作成時の依存仕様書マトリクスパターン（TASK-FIX-5-1）

- **状況**: Phase 1作成時にaiworkflow-requirementsの関連仕様書参照が不足し、後から2コミットで19件修正が必要
- **アプローチ**:
  - Phase 1作成時に「仕様書依存マトリクス」を明示的に作成
  - task-specification-creatorとaiworkflow-requirementsの両方のreferences/を検索し、関連する全仕様書を特定
  - 各Phase仕様書に必要な参照リンクを漏れなく追加
- **結果**: 後付け修正のコスト（2コミット、19件修正）を事前に防止可能
- **適用条件**: 複数の仕様書体系を持つプロジェクトでのタスク仕様書作成時
- **発見日**: 2026-02-06
- **関連タスク**: TASK-FIX-5-1-SKILL-API-UNIFICATION

### [Auth] Supabase SDK自動リフレッシュ競合防止パターン（TASK-AUTH-SESSION-REFRESH-001）

- **状況**: Supabase SDKの`autoRefreshToken: true`（デフォルト）とカスタムスケジューラーが同時にリフレッシュを試みる
- **アプローチ**:
  - 問題: 2つのリフレッシュ処理が同時実行されると、一方が無効なトークンで実行されエラーになる
  - 解決: `supabaseClient.ts`で`autoRefreshToken: false`を設定し、カスタムスケジューラーに完全に委譲
  - 排他制御: `_isRefreshing`フラグでスケジューラー内の二重実行も防止
- **結果**: リフレッシュ処理の衝突を完全に排除、リトライ戦略を自由にカスタマイズ可能に
- **適用条件**: 外部SDK（Supabase, Firebase等）のデフォルト自動処理をカスタム実装で置き換える場合
- **発見日**: 2026-02-06
- **関連タスク**: TASK-AUTH-SESSION-REFRESH-001

### [Auth] setTimeout方式 vs setInterval方式の選択パターン（TASK-AUTH-SESSION-REFRESH-001）

- **状況**: セッションリフレッシュのスケジューリング方式選定
- **アプローチ**:
  - setIntervalの問題: 固定間隔実行のため、リフレッシュ成功で新しいexpiresAtが変わっても間隔が変わらない
  - setTimeout選択理由: リフレッシュ成功時に`reset(newExpiresAt)`で新しいタイマーを設定でき、動的な間隔調整が可能
  - 追加利点: `stop()`で確実にタイマークリア可能、メモリリーク防止
- **結果**: 毎回新しいexpiresAtに基づいた正確なスケジューリングを実現
- **適用条件**: スケジュール間隔が動的に変わる定期処理
- **発見日**: 2026-02-06
- **関連タスク**: TASK-AUTH-SESSION-REFRESH-001

### [Testing] vi.useFakeTimers + flushPromisesテストパターン（TASK-AUTH-SESSION-REFRESH-001）

- **状況**: setTimeout + async/await が組み合わさったコードのテストが困難
- **アプローチ**:
  - 問題: `vi.runAllTimersAsync()`はリフレッシュ成功→新タイマー設定→再発火の無限ループを引き起こす
  - 解決: `vi.advanceTimersByTime(ms)` + `flushPromises()`を組み合わせて段階的に制御
  - `flushPromises()`: `for (let i = 0; i < 10; i++) await Promise.resolve()`でmicrotaskキューを消化
  - テスト手順: タイマー進行→Promise解決→アサーション を1ステップずつ実行
- **結果**: 26テスト全PASS、96.15%カバレッジ達成。タイマーと非同期処理の両方を正確にテスト可能
- **適用条件**: setTimeout/setInterval + Promise/async-awaitが混在するコードのユニットテスト
- **発見日**: 2026-02-06
- **関連タスク**: TASK-AUTH-SESSION-REFRESH-001

### [Auth] Callback DIによるテスタブル設計パターン（TASK-AUTH-SESSION-REFRESH-001）

- **状況**: TokenRefreshSchedulerからSupabase, SecureStorage, BrowserWindowへの依存を分離したい
- **アプローチ**:
  - 問題: クラス内で直接`supabase.auth.refreshSession()`を呼ぶとモックが困難
  - 解決: `TokenRefreshCallbacks`インターフェースで`onRefresh`, `onFailure`, `onSuccess`をDI
  - スケジューラーは「いつ実行するか」のみに責務を限定、「何を実行するか」は呼び出し側が決定
  - authHandlers.tsのstartTokenRefreshScheduler()でコールバック実装を注入
- **結果**: スケジューラーのテストにSupabaseモック不要、テスト対象が明確に分離
- **適用条件**: 外部サービス呼び出しを含むスケジューラー/タイマー系処理
- **発見日**: 2026-02-06
- **関連タスク**: TASK-AUTH-SESSION-REFRESH-001

### [Testing] mockReturnValue vs mockReturnValueOnce のテスト間リーク防止パターン（TASK-FIX-17-1）

- **状況**: IPCハンドラーのセキュリティテストで特殊な戻り値を設定する必要があった
- **アプローチ**:
  - 問題: `mockReturnValue` で設定したモック戻り値が後続テストに漏れ、テスト間で状態が共有される
  - 解決: `mockReturnValueOnce` で1回限りのモック設定にする
  - 再初期化: `beforeEach` でモック関数をデフォルト状態にリセット
- **結果**: テスト間の状態分離が実現し、独立したテスト実行が可能に
- **適用条件**: 同一モック関数に対して複数の異なる戻り値パターンをテストする場合
- **発見日**: 2026-02-09
- **関連タスク**: TASK-FIX-17-1-SKILL-SCAN-HANDLER
- **クロスリファレンス**: [06-known-pitfalls.md#P23](../../.claude/rules/06-known-pitfalls.md)

### [IPC/Electron] 横断的セキュリティバイパス検出パターン（UT-FIX-5-3）

- **状況**: IPC APIでセキュリティ検証をバイパスする直接呼び出しが存在（preloadでの`ipcRenderer.send/on`直接使用）
- **アプローチ**:
  - Step 1: `grep -rn "ipcRenderer.send\|ipcRenderer.on" <preload-dir>/` で直接呼び出しを検出
  - Step 2: 検出したチャネル名がホワイトリストに登録されているか確認
  - Step 3: `safeInvoke()` 経由でない呼び出しを未タスクとして登録
  - Step 4: 検出された問題ごとに修正方針（AbortController統合、型定義追加等）を記録
- **結果**: セキュリティ検証バイパスを早期発見、未タスク化で追跡可能に
- **適用条件**: Electron IPC設計、Phase 10アーキテクチャレビュー時、Preloadスクリプト変更時
- **発見日**: 2026-02-09
- **関連タスク**: UT-FIX-5-3-PRELOAD-AGENT-ABORT
- **クロスリファレンス**: [04-electron-security.md](../../.claude/rules/04-electron-security.md), [06-known-pitfalls.md](../../.claude/rules/06-known-pitfalls.md)

### [DI/Architecture] Setter Injectionパターン（遅延初期化DI）（TASK-FIX-7-1）

- **状況**: BrowserWindow等の外部リソースを必要とする依存オブジェクトは、Constructor Injectionで対応できない
- **アプローチ**:
  - 問題: Facadeサービス（SkillService）生成時点で、依存先（SkillExecutor）がまだ初期化できない（mainWindow未生成）
  - 解決: `setXxx(dependency)` Setterメソッドで、外部リソース準備後に依存オブジェクトを注入
  - 検証: 実行メソッド（`executeSkill`）呼び出し時に、依存オブジェクトの存在を検証（未設定時はエラー）
  - 実装例: `SkillService.setSkillExecutor(executor)` で、mainWindow生成後にSkillExecutorを注入
- **結果**: 初期化タイミングが異なる依存オブジェクトを安全に注入可能。Facadeパターンとの併用でレイヤー分離を維持
- **適用条件**: 依存オブジェクトの生成に外部リソース（BrowserWindow、IPC接続等）が必要な場合
- **発見日**: 2026-02-11
- **関連タスク**: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION
- **クロスリファレンス**: [architecture-implementation-patterns.md](../../aiworkflow-requirements/references/architecture-implementation-patterns.md#setter-injection-パターンtask-fix-7-1-2026-02-11実装)

### [IPC/Type] IPC層とサービス層の型変換パターン（TASK-FIX-7-1）

- **状況**: IPC層（Preload/Handler）とサービス層で異なる型定義を使用しており、型変換が必要
- **アプローチ**:
  - 問題: IPC層では`Skill`型（UI向け汎用型）、サービス層では`SkillMetadata`型（実行エンジン向け詳細型）を使用
  - 解決: IPCハンドラー内で明示的な型変換ロジックを実装し、型安全性を確保
  - 変換例: `Skill` → `SkillMetadata` への変換時、必須フィールドの存在確認とデフォルト値設定を行う
  - 型定義の配置: 共通型は`@repo/shared`に配置し、レイヤー固有の型は各層で定義
- **結果**: レイヤー間の型の責務が明確になり、型安全な通信が実現
- **適用条件**: IPC通信でRenderer/Main間でデータ構造が異なる場合、Store型とPreload型が異なる場合
- **発見日**: 2026-02-11
- **関連タスク**: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION
- **クロスリファレンス**: [interfaces-agent-sdk-executor.md](../../aiworkflow-requirements/references/interfaces-agent-sdk-executor.md)

### [Testing/DI] DIテストモック大規模修正パターン（TASK-FIX-7-1）

- **状況**: 新しい依存オブジェクトをDIで追加すると、既存の全テストファイルにモック追加が必要になる
- **アプローチ**:
  - Step 1: `grep -rn "new TargetClass\|TargetClass(" src/` で影響範囲を事前調査
  - Step 2: 各テストファイルに対象モックを定義（`mockDependency = { method: vi.fn() }`）
  - Step 3: `beforeEach`で`mockDependency.method.mockResolvedValue()`をリセット
  - Step 4: 標準モック構成をテストユーティリティとしてドキュメント化
  - 例: SkillExecutorにSkillServiceを追加した際、5つのテストファイルにmockSkillServiceを追加
- **結果**: 既存テストの網羅的な更新が完了し、モック構成が統一される
- **適用条件**: Constructorに新しい依存オブジェクトを追加する場合、Setter Injectionで新しい依存を追加する場合
- **発見日**: 2026-02-11
- **関連タスク**: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION
- **クロスリファレンス**: [06-known-pitfalls.md#P21](../../.claude/rules/06-known-pitfalls.md)

### [Phase12] 横断的問題の追加検証パターン（UT-FIX-5-3）

- **状況**: Phase 10レビューで検出した問題が、他ファイルにも同様に存在する可能性がある
- **アプローチ**:
  - Step 1: Phase 10で検出した問題パターンを正規表現で表現
  - Step 2: `grep -rn "<pattern>" <project-root>/` でプロジェクト全体を検索
  - Step 3: 同様のパターンが見つかった場合、関連タスクとして追加検出
  - Step 4: 追加検出された問題はPhase 12の未タスク検出に含める
- **結果**: 単一ファイル修正に留まらず、横断的な品質改善を実現
- **適用条件**: Phase 10で設計パターン違反を検出した場合、Phase 12の未タスク検出時
- **発見日**: 2026-02-09
- **関連タスク**: UT-FIX-5-3-PRELOAD-AGENT-ABORT
- **クロスリファレンス**: [05-task-execution.md#Task 4](../../.claude/rules/05-task-execution.md), [06-known-pitfalls.md#P24](../../.claude/rules/06-known-pitfalls.md)

### [Testing] 統合テストでの依存サービスモック漏れ防止パターン（TASK-FIX-15-1）

- **状況**: IPCハンドラーの実行パスがSkillServiceからSkillExecutorに変更され、既存の統合テストが失敗
- **アプローチ**:
  - 問題: ハンドラーが呼び出す依存サービスが変更されても、テストのモック設定が古いまま
  - 解決: 実装変更時に統合テストのモック対象も同時に更新する
  - 実装パターン: `vi.mock("../../services/skill/SkillExecutor")` で新しい依存をモック
  - 検証: モックメソッド（`mockExecuteMethod`, `mockAbortMethod`等）を事前定義し、テストで呼び出し確認
- **結果**: 実装の実行パス変更に追従し、テストが正常動作
- **適用条件**: ハンドラーやサービスの内部依存を変更する際、関連する統合テスト全てを更新
- **発見日**: 2026-02-10
- **関連タスク**: TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING
- **クロスリファレンス**: [06-known-pitfalls.md#P25](../../.claude/rules/06-known-pitfalls.md)

### [IPC] 入力バリデーション統一パターン - whitespace対策（TASK-FIX-15-1）

- **状況**: ユーザー入力（prompt等）に空白のみの文字列が渡されるとサービスエラーになる
- **アプローチ**:
  - 問題: `prompt === ""` のみのチェックでは空白のみ（`"   "`）を検出できない
  - 解決: `prompt.trim() === ""` でホワイトスペースのみの入力を拒否
  - 正規化: リクエスト構築時に `prompt.trim()` で前後の空白を削除
  - エラーメッセージ: `"prompt must be a non-empty string"` で明確なバリデーションエラーを返す
- **結果**: 空白のみ入力がバリデーション段階で拒否され、サービス層に到達しない
- **適用条件**: IPCハンドラーでユーザー入力文字列を受け取る場合
- **発見日**: 2026-02-10
- **関連タスク**: TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING
- **クロスリファレンス**: [06-known-pitfalls.md#P26](../../.claude/rules/06-known-pitfalls.md)

### [IPC] IPC機能開発ワークフローパターン（TASK-9B-H）

- **状況**: Electron IPC チャンネルの新規追加（サービス層のメソッドをRenderer側に公開する）
- **アプローチ**:
  1. **チャンネル定数定義**: `channels.ts` に `IPC_CHANNELS` 定数を追加し、同ファイルのホワイトリスト配列にも登録
  2. **Main側ハンドラー作成**: `validateIpcSender` でsender検証 + 引数バリデーション + サービス層呼び出し + エラーサニタイズの4段構成
  3. **Preload API作成**: `safeInvoke`/`safeOn` を使用し、チャンネル名は必ず `IPC_CHANNELS` 定数を参照。インターフェース定義を型安全に設計
  4. **preload/index.ts統合**: 4箇所を同時更新（import文、electronAPIオブジェクト、exposeInMainWorld、fallback定義）
  5. **types.ts型定義追加**: `ElectronAPI` インターフェースと `Window` グローバル宣言の両方に型を追加
  6. **ipc/index.ts登録**: `registerAllIpcHandlers` に新規ハンドラーの register/dispose を追加
- **セキュリティチェック**:
  - 全ハンドラーで `validateIpcSender` によるsender検証
  - チャンネル名のホワイトリスト管理（`channels.ts` の配列に登録されていないチャンネルは `safeInvoke` で拒否）
  - エラーサニタイズ（内部スタックトレースをRenderer側に漏洩しない）
- **テスト設計**:
  - ハンドラー登録/解除テスト（`ipcMain.handle`/`removeHandler` の呼び出し確認）
  - 正常系テスト（サービス層への引数の受け渡し、戻り値のフォーマット）
  - 異常系テスト（バリデーションエラー、サービス層エラー、sender検証失敗）
  - 統合テスト（ハンドラー登録→実行→解除の一連のフロー）
- **結果**: 6段階のチェックリストにより、IPC チャンネル追加時の漏れを防止。セキュリティ3層モデル（ホワイトリスト + sender検証 + エラーサニタイズ）を標準化
- **適用条件**: Electron IPC チャンネルの新規追加、既存サービスのRenderer公開
- **発見日**: 2026-02-12
- **関連タスク**: TASK-9B-H-SKILL-CREATOR-IPC
- **クロスリファレンス**: [04-electron-security.md](../../.claude/rules/04-electron-security.md), [architecture-implementation-patterns.md](../../aiworkflow-requirements/references/architecture-implementation-patterns.md)
- **関連仕様書**:
  - [architecture-implementation-patterns.md](../../aiworkflow-requirements/references/architecture-implementation-patterns.md) - IPC実装パターン（Setter Injection、型変換、テストモック等）
  - [security-electron-ipc.md](../../aiworkflow-requirements/references/security-electron-ipc.md) - Electron IPCセキュリティ仕様（ホワイトリスト管理、sender検証、エラーサニタイズ）
  - [api-ipc-agent.md](../../aiworkflow-requirements/references/api-ipc-agent.md) - IPC API仕様（チャンネル定義、ハンドラー登録、Preload Bridge設計）

### [Security] TDDセキュリティテスト分類体系（UT-9B-H-003）

- **状況**: IPCハンドラーのセキュリティ強化でテストを先行設計する必要がある
- **アプローチ**:
  - 攻撃カテゴリ別にテストIDを割り当て（SEC-01〜SEC-07g）
  - 受入基準（AC-01〜AC-10）にテストIDをマッピング
  - カテゴリ: パストラバーサル(SEC-01〜03)、ホワイトリスト(SEC-04〜05)、回帰(SEC-06)、境界値(SEC-07)
  - `it.each` で攻撃パターンを網羅（`../`, `..\`, `\x00`, `\\\\`）
  - テスト間独立性: `beforeEach` で `handlerMap.clear()` + `vi.clearAllMocks()`
- **結果**: 45セキュリティテスト + 71統合テスト = 116テスト全PASS。ブランチカバレッジ100%
- **適用条件**: セキュリティ関連のTDD実装時。特にIPC L3検証の追加時
- **発見日**: 2026-02-12
- **関連タスク**: UT-9B-H-003
- **クロスリファレンス**: [lessons-learned.md#UT-9B-H-003](../../aiworkflow-requirements/references/lessons-learned.md), [security-electron-ipc.md](../../aiworkflow-requirements/references/security-electron-ipc.md)

### [Security] YAGNI原則に基づく共通化判断の記録パターン（UT-9B-H-003）

- **状況**: Phase 8リファクタリングで、セキュリティ関数（validatePath, sanitizeErrorMessage）を共通パッケージに移動すべきか判断が必要
- **アプローチ**:
  - 3つの評価軸で判断: (1) 現在の使用箇所数、(2) 変更頻度の予測、(3) ドメインの独立性
  - 共通化しない判断も**未タスク候補として明示的に記録**（unassigned-task-report.md）
  - 既存の未タスク（UT-9B-H-001, UT-9B-H-002）との重複チェックを実施
  - 重複と判定された候補は新規作成せず、既存タスクのスコープ内で対応と記録
- **結果**: 3件の共通化候補を検討し、全て「現状維持」と判断。将来の判断材料として未タスクレポートに記録
- **適用条件**: Phase 8リファクタリングで共通化を検討する場合。特にセキュリティ関数のように複数のIPC Handlerで使用される可能性がある場合
- **発見日**: 2026-02-12
- **関連タスク**: UT-9B-H-003
- **クロスリファレンス**: [architecture-implementation-patterns.md](../../aiworkflow-requirements/references/architecture-implementation-patterns.md)

- **Phase 12での苦戦箇所と解決策**:

| 苦戦箇所 | 原因 | 解決策 |
|----------|------|--------|
| CLI環境でのPhase 11手動テスト不可 | Claude Code環境ではElectronアプリ起動・DevTools操作ができない | 自動テスト（116テスト）で代替検証を実施。DevToolsコマンドをドキュメントに記載し、開発者向けリファレンスとして提供 |
| コンテキスト分割によるPhase 12整合性管理 | コンテキスト制限でセッション分割。前セッションの成果物状態追跡が困難 | セッション開始時に `Glob` でoutputs/配下の成果物一覧を確認。`TaskOutput` でバックグラウンドエージェント完了を待ってから整合性チェック |
| Markdownコードブロック内のPrettier干渉 | PostToolUseフックのPrettierがMarkdown内のTypeScript型表記を自動変形 | バックグラウンドエージェント内で修正ステップを追加。ドキュメント作成時はPrettier影響の検証を後処理に組み込む |

### [Testing] Store Hook テスト実装パターン（renderHook方式）（UT-STORE-HOOKS-TEST-REFACTOR-001）

- **状況**: Zustand個別セレクタHookのテストで `getState()` 直接呼び出しを使用しており、Reactサブスクリプション経由の動作検証ができていない
- **アプローチ**:
  - 旧パターンの問題: `store.getState().field` はReactの再レンダリングサイクルを経由しないため、コンポーネントでの実際の使用経路と異なる
  - 新パターン: `renderHook(() => useField())` でReactサブスクリプション経由のテストを実現
  - 状態変更: `act(() => useAppStore.setState({...}))` でReactの状態更新サイクルを正しく経由
  - 非同期アクション: `await act(async () => { ... })` でPromise解決を待機
  - テスト間リセット: `resetStore()` → `cleanup()` → `vi.restoreAllMocks()` の3段階で完全リセット

- **パターン対応表**:

| 対象 | 旧パターン（非推奨） | 新パターン（推奨） |
|---|---|---|
| 状態取得 | `store.getState().field` | `renderHook(() => useField())` |
| 状態変更 | `store.setState({...})` | `act(() => useAppStore.setState({...}))` |
| アクション実行 | `store.getState().action()` | `renderHook` + `act()` |
| 非同期アクション | `await action()` | `await act(async () => { ... })` |

- **テストカテゴリ分類**（代表的な5カテゴリ）:

| カテゴリ | 検証内容 | 対応するCAT |
|----------|----------|------------|
| 初期値検証 | セレクタが正しいデフォルト値を返すか | CAT-01 |
| 状態変更検証 | act() + setState 後にセレクタが正しく更新されるか | CAT-02, CAT-04, CAT-08 |
| 参照安定性 | rerender() 後もアクション関数の参照が ===  で同一か | CAT-05, CAT-10 |
| 無限ループ防止 | useEffect依存配列にアクションを含めてもrenderCount < 10か | CAT-07, CAT-16 |
| 再レンダー最適化 | 無関係なフィールド変更でセレクタが再レンダーされないか | CAT-06, CAT-11 |

- **結果**: getState()パターン48件 → renderHookパターン114件（+export検証23件）に移行。Reactサブスクリプション経路の検証、参照安定性テスト、無限ループ検出が可能に
- **適用条件**: Zustand Store で個別セレクタHookを使用し、React コンポーネントから利用するテストを書く場合。特に useEffect 依存配列にアクション関数を含める場合は無限ループ防止テスト（CAT-07/16）が必須。
- **発見日**: 2026-02-12
- **関連タスク**: UT-STORE-HOOKS-TEST-REFACTOR-001
- **クロスリファレンス**: [development-guidelines.md#Zustand Hook テスト戦略](../../aiworkflow-requirements/references/development-guidelines.md), [lessons-learned.md#UT-STORE-HOOKS-TEST-REFACTOR-001](../../aiworkflow-requirements/references/lessons-learned.md)
  - [arch-state-management.md#Store Hooks テスト実装ガイド](../../aiworkflow-requirements/references/arch-state-management.md) - テストパターン6種の一覧表
  - [testing-component-patterns.md#9. Zustand Store Hooks テストパターン](../../aiworkflow-requirements/references/testing-component-patterns.md) - コピペ可能な実装コード例

- **Phase 12での苦戦箇所と解決策**:

| 苦戦箇所 | 原因 | 解決策 |
|----------|------|--------|
| Step 2を「該当なし」と誤判定 | テストリファクタリングはインターフェース変更を伴わないため、Step 2不要と判断しがち | テストのみの変更でも、テスト戦略やテストパターンの変更は仕様書（development-guidelines.md等）に記録すべき。Step 2の判断基準に「テスト戦略変更」を含める |
| 実装ガイドのテストカテゴリテーブル不整合 | Phase 4でテストカテゴリ（CAT-01〜CAT-05）を定義し、Phase 6で拡充したが、実装ガイドのテーブルがPhase 4時点のまま | Phase 6（テスト拡充）完了後に、implementation-guide.md Part 2のテストカテゴリテーブルを必ず再確認・更新する。テスト数やカテゴリ構成が変わった場合は即座に反映 |

### [Test] SDKテスト有効化モック2段階リセット

- **状況**: SDK統合テスト17箇所のTODOコメントを有効化する際、テスト間でモック状態が漏洩してテスト実行順序依存が発生
- **アプローチ**: `beforeEach` で (1) `vi.clearAllMocks()` + (2) `mockResolvedValue()` による2段階リセットを実施。エラーテストでは `mockRejectedValueOnce` のみ使用
- **結果**: 134テスト全PASS、テスト実行順序に非依存
- **適用条件**: `vi.mock()` でモジュール全体をモック化し、正常系・異常系テストが混在する場合
- **発見日**: 2026-02-13
- **関連タスク**: TASK-FIX-11-1-SDK-TEST-ENABLEMENT

### [SDK] TypeScript モジュール解決による型安全統合（TASK-9B-I）

- **状況**: 外部 SDK (`@anthropic-ai/claude-agent-sdk@0.2.30`) の `as any` を除去し型安全な統合を実現
- **アプローチ**:
  - SDK の型定義ファイル (`dist/index.d.ts`) を直接参照して正確なパラメータ構造を把握
  - `SDKQueryOptions` 内部型を定義し、SDK `Options` 型への変換を型安全に実装
  - `@ts-expect-error` を使った compile-time テストで不正な型の検証
- **結果**: `as any` 完全除去、13テスト追加、278既存テスト全PASS
- **適用条件**: 外部 SDK の型安全な統合、`as any` 除去タスク
- **発見日**: 2026-02-12
- **関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION
- **クロスリファレンス**: [02-code-quality.md#TypeScript型安全](../../.claude/rules/02-code-quality.md)

### [Testing] テスト環境別イベント発火パターン選択（UT-FIX-AGENTVIEW-INFINITE-LOOP-001）

- **状況**: Vitest + happy-dom環境でユーザーインタラクションテストを作成する際、`@testing-library/user-event`のSymbol操作がhappy-domで非互換
- **アプローチ**:
  - 問題発見: 53テスト中49テストがSymbolエラーで一斉失敗。`userEvent.setup()`がhappy-dom未サポートのDOM操作を実行
  - 試行1: `// @vitest-environment jsdom` ディレクティブ追加 → `toBeInTheDocument`動作不良、DOM要素重複で断念
  - 試行2: `userEvent`を`fireEvent`に全面置換 → 53テスト全PASS
  - 非同期対応: `await act(async () => { fireEvent.click(el) })`でPromise microtask flushを保証
- **パターン選択基準**:

| テスト環境 | イベントAPI | 理由 |
|---|---|---|
| happy-dom（デフォルト） | `fireEvent` | Symbol操作不要、軽量・高速 |
| jsdom（ディレクティブ指定） | `userEvent` | 完全なDOM API、アクセシビリティ検証向き |

- **結果**: 環境固有の制約を理解し、適切なAPIを選択することでテスト安定性を確保
- **適用条件**: Vitest + happy-dom環境でのコンポーネントテスト。特にクリック/入力等のユーザーインタラクションテスト
- **発見日**: 2026-02-12
- **関連タスク**: UT-FIX-AGENTVIEW-INFINITE-LOOP-001
- **クロスリファレンス**: [architecture-implementation-patterns.md](../../aiworkflow-requirements/references/architecture-implementation-patterns.md#fireevent-vs-userevent-使い分けパターン), [06-known-pitfalls.md#P39](../../.claude/rules/06-known-pitfalls.md)

### [Testing] モノレポ テスト実行ディレクトリ依存パターン（UT-FIX-AGENTVIEW-INFINITE-LOOP-001）

- **状況**: モノレポ環境でプロジェクトルートからVitest実行すると、サブパッケージの`vitest.config.ts`が読み込まれない
- **アプローチ**:
  - 問題: `pnpm vitest run apps/desktop/src/...`（ルートから実行）→ `document is not defined`エラー
  - 原因: Vitestはカレントディレクトリの設定ファイルを優先。ルートの設定にはhappy-dom/setupFilesが未定義
  - 解決: `cd apps/desktop && pnpm vitest run src/...` または `pnpm --filter @repo/desktop exec vitest run src/...`
- **結果**: テスト実行を対象パッケージディレクトリから行うルールを確立
- **適用条件**: pnpm monorepo + Vitest環境で、パッケージ固有のテスト環境設定がある場合
- **発見日**: 2026-02-12
- **関連タスク**: UT-FIX-AGENTVIEW-INFINITE-LOOP-001
- **クロスリファレンス**: [06-known-pitfalls.md#P40](../../.claude/rules/06-known-pitfalls.md)

### [SDK] SDKテストTODO一括有効化ワークフロー

- **状況**: agent-client.test.ts / skill-executor.test.ts / sdk-integration.test.ts の3ファイルに TODO コメントで無効化された17箇所のテストが存在
- **アプローチ**: Phase 2設計で17箇所のモック戦略を事前にマッピング → Phase 5でファイルごとに有効化（既存モックパターン `vi.mock`/`vi.hoisted` を活用、NFR-007準拠）→ Phase 9で全134テスト一括検証
- **結果**: 新規モック戦略導入なしで17箇所全て有効化。既存テスト117件の挙動に影響なし
- **適用条件**: 段階的にテストを有効化し、回帰テストの安全性を保つ必要がある場合
- **発見日**: 2026-02-13
- **関連タスク**: TASK-FIX-11-1-SDK-TEST-ENABLEMENT

### [Phase12] 未タスク検出の2段階判定（raw→実タスク候補）

- **状況**: `detect-unassigned-tasks.js` が仕様書本文の説明用 TODO まで大量検出し、未タスク件数を過大評価しやすい
- **アプローチ**:
  - 1段階目: 実装ディレクトリ（例: `apps/.../__tests__`）を優先スキャン
  - 2段階目: ドキュメント全体の raw 検出結果を手動精査し、説明文TODOと実装漏れを分離
  - 出力は「raw検出件数」と「確定未タスク件数」を別々に記録
- **結果**: 誤検知由来の不要な未タスク作成を防止し、`docs/30-workflows/unassigned-task/` への配置要否を正確化
- **適用条件**: Phase 12 Task 4（未タスク検出）実行時
- **発見日**: 2026-02-13
- **関連タスク**: TASK-FIX-11-1-SDK-TEST-ENABLEMENT
- **クロスリファレンス**: [unassigned-task-guidelines.md](../../task-specification-creator/references/unassigned-task-guidelines.md)
---

## 失敗パターン（避けるべきこと）

失敗から学んだアンチパターン。

### [Phase12] 成果物名の暗黙的解釈

- **状況**: Phase 12で`implementation-guide.md`を`documentation.md`として生成
- **問題**: 仕様書との不整合、後続処理でのファイル参照エラー
- **原因**: 仕様書の成果物名を正確に確認せず暗黙的に命名
- **教訓**: Phase仕様書の「成果物」セクションを必ず確認し、ファイル名を厳密に一致させる
- **発見日**: 2026-01-22

### [Phase12] Phase 12サブタスクの暗黙的省略

- **状況**: Phase 12完了時に「実装ガイド作成」のみ実行し、「システム仕様書更新」を省略
- **問題**: システム仕様書に完了記録が残らず、成果が追跡できない
- **原因**: Phase 12が複数サブタスク（12-1, 12-2, 12-3）を持つことの認識不足
- **教訓**: Phase 12実行時は必ずサブタスク一覧を確認し、全タスクの実行を確認する
- **発見日**: 2026-01-22
- **対策済み**: phase-templates.md v7.6.0で完了条件チェックリストを強化

### [Skill] 全リソース一括読み込み

- **状況**: スキル実行開始時に全ファイルを読み込んだ
- **問題**: コンテキストウィンドウを圧迫し、精度低下
- **原因**: Progressive Disclosure 原則の未適用
- **教訓**: 必要な時に必要なリソースのみ読み込む
- **発見日**: 2026-01-10

### [Skill] LLMでのメトリクス計算

- **状況**: 成功率や実行回数をLLMに計算させた
- **問題**: 計算ミスが発生、信頼性低下
- **原因**: Script First 原則の未適用
- **教訓**: 決定論的処理は必ずスクリプトで実行
- **発見日**: 2026-01-08

### [Build] スクリプトでのデータ形式前提の誤り

- **状況**: generate-documentation-changelog.jsがartifacts.jsonを解析してエラー発生
- **問題**: `TypeError: The "path" argument must be of type string. Received undefined`
- **原因**: スクリプトは`{path, description}`オブジェクト形式を想定したが、実際は文字列配列形式だった
- **教訓**: スクリプト作成時は実際のデータ形式を確認し、複数形式に対応するか明確に文書化する
- **対策**: `typeof artifact === "string" ? artifact : artifact.path` で両形式に対応
- **発見日**: 2026-01-22
- **関連タスク**: skill-import-store-persistence (SKILL-STORE-001)

### [Phase12] 「検証タスク」でのPhase 12 Step 1省略

- **状況**: SHARED-TYPE-EXPORT-03（検証タスク）でPhase 12 Step 1を「検証タスクなので更新不要」と判断し省略
- **問題**: spec-update-record.mdに「更新不要」と記載したが、Step 1は必須要件だった
- **原因**: Step 1（タスク完了記録：必須）とStep 2（インターフェース仕様更新：条件付き）の区別を誤認
- **教訓**: Phase 12 Step 1（完了タスクセクション追加、実装ガイドリンク追加、変更履歴追記）は**検証タスクでも必須**
- **対策**:
  - task-specification-creator SKILL.mdに「【検証タスクでも必須】」警告を追加
  - validate-phase12-step1.js検証スクリプトで自動チェック
- **発見日**: 2026-01-23
- **関連タスク**: SHARED-TYPE-EXPORT-03

### [Phase 12] 正規表現パターンのPrettier干渉

- **状況**: Phase 12 Task 1で実装ガイド・IPCドキュメント作成時、TypeScript型表記を含むMarkdownファイルを生成
- **問題**: PostToolUseフック（auto-format.sh）のPrettierが、Markdownコードブロック内のTypeScript型表記（`readonly ["task-spec", "skill-spec", "mode"]`）を `readonly[("task-spec", "skill-spec", "mode")]` のように変形
- **原因**: PrettierのMarkdownフォーマッターがコードブロック内のTypeScript構文を解釈し、独自のフォーマットルールを適用
- **教訓**: ドキュメント生成タスクでは、PostToolUseフックの自動フォーマット後にコードブロック内の表記を検証する後処理ステップが必要。特に `as const` アサーション付きの型表記は変形されやすい
- **発見日**: 2026-02-12
- **対策**: バックグラウンドエージェント内でWrite後にReadで検証し、変形があればEditで修正するステップを組み込む

### [Build] ES Module互換性の確認漏れ

- **状況**: 新規スクリプト（validate-phase12-step1.js）作成時にCommonJS構文（require）を使用
- **問題**: プロジェクトがES Module（"type": "module"）設定のため実行時エラー
- **原因**: package.jsonの"type"フィールドを確認せずスクリプト作成
- **教訓**: 新規スクリプト作成時は必ずプロジェクトのモジュール形式を確認し、ES Module形式（import/export）を使用
- **対策**: スクリプト作成前に `package.json` の `"type"` フィールドをチェック
- **発見日**: 2026-01-23
- **関連タスク**: SHARED-TYPE-EXPORT-03

### [SDK] カスタム declare module と SDK 実型の共存（TASK-9B-I）

- **状況**: SDK 未インストール時にカスタム `declare module` を作成し、SDK インストール後もファイルが残留
- **問題**: TypeScript は `node_modules` の実型を優先し、カスタム `.d.ts` は無視されるが、仕様書にカスタム型の値が残って型不整合が発生
- **原因**: SDK インストール前後で型定義ファイルの優先順位が変わることの認識不足
- **教訓**: SDK インストール後はカスタム `.d.ts` を削除する。TypeScript のモジュール解決優先順位（`node_modules` > カスタム `.d.ts`）を文書化しておく
- **対策**: SDK バージョンアップ時にカスタム型定義ファイルの棚卸しを実施
- **発見日**: 2026-02-12
- **関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION, UT-9B-I-001

### [Phase12] 未タスク配置ディレクトリの混同（TASK-9B-I）

- **状況**: 未タスク (UT-9B-I-001) の指示書を親タスクの `tasks/` ディレクトリに誤配置
- **問題**: `docs/30-workflows/unassigned-task/` ではなく `docs/30-workflows/skill-import-agent-system/tasks/` に配置してしまった
- **原因**: 未タスク指示書の配置先ルールの確認不足。親タスクディレクトリと未タスクディレクトリの混同
- **教訓**: 未タスクは必ず `docs/30-workflows/unassigned-task/` に配置する。配置後に `ls` で物理ファイルの存在を検証する
- **対策**: 未タスク作成時に配置ディレクトリを明示的に確認するチェックリスト項目を追加
- **発見日**: 2026-02-12
- **関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION

### [Phase12] 未タスクraw検出の誤読（TASK-FIX-11-1）

- **状況**: raw検出 51件をそのまま未タスク件数と見なしかけた
- **問題**: 仕様書本文の説明用 TODO まで未対応課題として誤認し、バックログを汚染する
- **原因**: `detect-unassigned-tasks.js` の出力が「候補」である前提を明記せずに解釈
- **教訓**: 未タスクは「検出候補」と「実装上の確定課題」を分離して扱う
- **対策**: `unassigned-task-detection.md` に raw件数と精査後件数を分離して記録し、配置先 `docs/30-workflows/unassigned-task/` の要否を明示する
- **発見日**: 2026-02-13
- **関連タスク**: TASK-FIX-11-1-SDK-TEST-ENABLEMENT

### [Test] モジュールモック下でのタイマーテスト失敗

- **状況**: `vi.mock("../agent-client")` でモジュール全体をモック化した状態で、`vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync(30000)` によるタイムアウトテストを実行
- **症状**: タイマーを進めてもタイムアウトが発生しない。テストがハングまたはタイムアウト条件が不成立
- **原因**: `vi.mock()` はモジュール内の全エクスポートをモック関数に置換するため、元の実装内部の `setTimeout` + `AbortController` ロジックが消失する
- **解決策**: モジュール内部のタイマーを再現するのではなく、`mockRejectedValueOnce(new Error("Request timeout"))` で直接エラーを注入。タイマーテストが必要な場合はモック関数の `mockImplementation` 内に `setTimeout` を含める
- **発見日**: 2026-02-13
- **関連タスク**: TASK-FIX-11-1-SDK-TEST-ENABLEMENT

---

## ガイドライン

実行時の判断基準。

### 抽象度レベル判定

- **状況**: ユーザー要求の具体性を判断する時
- **指針**: L1（概念）→ 詳細インタビュー、L2（機能）→ 軽いヒアリング、L3（実装）→ 直接実行
- **根拠**: 抽象度に応じて必要な対話量が変わる
- **発見日**: 2026-01-15

### モード選択

- **状況**: create/update/improve-prompt の選択時
- **指針**: 既存スキルパスの有無、更新対象の特定で判断
- **根拠**: detect_mode.js の判定ロジックに準拠
- **発見日**: 2026-01-06
