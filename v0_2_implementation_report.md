# v0.2 気づきメモ構造是正 実装完了報告

## 1. 構造是正の概要

v0.2で追加された気づきメモ / AI相談メモ機能について、compiled/main.js へ処理が集中していた状態を改め、責務別のモジュールへ分離しました。目的は、今後 v0.3 で予定されている Patch 貼り付け・Patch 検証・Patch 反映・ロールバックに接続できる構造を作ることです。

今回の作業は構造是正であり、内蔵AIチャット、AI API連携、Patch機能、戦闘、マップ拡張、Node版Playwright、GitHub Actions は実装していません。

## 2. 変更ファイル一覧

```text
compiled/main.js
index.html
README.md
CHANGELOG_v0_2.md
manual_verification_instructions_v0_2.md

src/engine/notes/PlaytestNoteTypes.js
src/engine/notes/PlaytestNoteManager.js
src/engine/notes/PlaytestNoteStorage.js
src/engine/notes/ContextSnapshotBuilder.js
src/engine/notes/AiConsultationMarkdownExporter.js

src/engine/ui/PlaytestNotePanel.js
src/engine/ui/PlaytestNoteList.js
src/engine/ui/PlaytestNoteErrorView.js

src/styles/global.css
src/styles/mobile-ui.css
src/styles/playtest-notes.css

docs/static_syntax_check_results_v0_2_arch_fix.json
```

## 3. compiled/main.jsに残した処理

`compiled/main.js` には、ゲーム本体の既存ランタイム処理、Content Pack読み込み、Validator、Gameクラス、buildId表示、そして配布用エントリとしての `PlaytestNoteManager` 初期化のみを残しました。

具体的には以下です。

```js
import { PlaytestNoteManager } from '../src/engine/notes/PlaytestNoteManager.js';
...
window.aiRpgPlaytestNotes = new PlaytestNoteManager(game);
```

気づきメモの保存、Context取得、Markdown生成、UI描画、エラー表示は compiled/main.js から分離しています。

## 4. src側へ分離した処理

以下の責務を src 側へ分離しました。

- メモデータ型と選択肢定義
- noteId / 日時生成
- localStorage 保存・読み込み・削除
- Context Snapshot 生成
- 関連ID抽出
- AI相談用 Markdown 生成
- メモパネル UI 生成
- メモ一覧 UI 生成
- メッセージ / エラー表示
- メモ保存、状態変更、Markdown出力の統括

## 5. PlaytestNoteTypesの内容

`PlaytestNoteTypes.js` では、メモデータの必須構造と選択肢定義を管理しています。

必須フィールド:

```text
noteId
createdAt
category
priority
userMemo
currentContext
relatedData
status
```

currentContext 必須フィールド:

```text
packId
packVersion
currentMapId
currentGameState
player.x
player.y
player.facing
nearbyActorId
nearbyInteractableId
lastEventId
lastDialogueId
activeQuestIds
validation.errorCount
validation.warningCount
```

取得できない値は `null` または空配列で保持します。キー自体は省略しません。

## 6. PlaytestNoteManagerの責務

`PlaytestNoteManager` は、気づきメモ機能の統括を担当します。

- UIイベントを受け取る
- メモ本文の空チェックを行う
- ContextSnapshotBuilderから現在状態を取得する
- PlaytestNoteStorageへ保存を依頼する
- AiConsultationMarkdownExporterへMarkdown生成を依頼する
- PlaytestNotePanel / PlaytestNoteList / PlaytestNoteErrorViewへUI更新を依頼する

ManagerはUIロジック、保存処理、Markdown生成処理を直接抱え込まず、責務別モジュールへ委譲します。

## 7. PlaytestNoteStorageの責務

`PlaytestNoteStorage` は localStorage アクセスのみを担当します。

保存キー:

```text
ai_rpg_playtest_notes:<packId>
```

例:

```text
ai_rpg_playtest_notes:sample_minimal_pack
```

保存・読み込み・削除の結果は `{ ok, message, notes }` 形式で返し、UI側で日本語メッセージを表示できるようにしています。

## 8. ContextSnapshotBuilderの責務

`ContextSnapshotBuilder` は、ゲームランタイムから現在状態を収集します。UIから状態収集ロジックを分離し、将来のPatch機能やValidator連携でも再利用できる形にしています。

主に以下を取得します。

- packId / packVersion
- currentMapId
- currentGameState
- player座標 / 向き
- nearbyActorId
- lastEventId
- lastDialogueId
- activeQuestIds
- validation error / warning count

## 9. AiConsultationMarkdownExporterの責務

`AiConsultationMarkdownExporter` は AI相談用Markdown生成だけを担当します。

UIから分離した理由は、v0.3以降で以下へ拡張しやすくするためです。

- 複数メモまとめ出力
- 関連Content Pack抜粋の追加
- Patch作成依頼文への接続

## 10. UI側の責務

UIは以下に分割しました。

```text
PlaytestNotePanel
  パネルDOM生成、入力値取得、ボタンイベントの接続

PlaytestNoteList
  メモ一覧の描画、選択状態表示、メモ選択イベント

PlaytestNoteErrorView
  日本語メッセージ / エラー表示
```

スマホ幅ではCSSにより気づきメモUIを非表示にし、通常プレイを邪魔しないようにしています。

## 11. localStorage保存キー

```text
ai_rpg_playtest_notes:<packId>
```

packIdごとに保存キーを分けることで、別シナリオや別Content Packのメモが混ざらないようにしています。

## 12. AI相談用Markdownの出力例

```markdown
# AI相談メモ

## 相談内容

村長の2回目の会話が少し淡白。

## メモ情報

- noteId: note_20260502_120000_001
- createdAt: 2026-05-02 12:00:00
- category: dialogue
- priority: medium
- status: open

## 現在状況

- packId: sample_minimal_pack
- packVersion: null
- currentMapId: map1
- currentGameState: field
- player: x=4, y=5, facing=right
- nearbyActorId: chief
- nearbyInteractableId: null
- lastEventId: event_talk_chief_first
- lastDialogueId: dialogue_chief_first
- activeQuestIds: quest_walk_village
- validation.errorCount: 0
- validation.warningCount: 0

## 関連ID

- actors: chief
- events: event_talk_chief_first
- dialogues: dialogue_chief_first
- quests: quest_walk_village

## 依頼

既存IDは変えず、Content Pack Patchとして修正案を出してください。
コードは書かないでください。
```

## 13. 空メモ保存エラー検証結果

実装済みです。`PlaytestNoteManager.saveCurrentNote()` で `userMemo` が空の場合は保存せず、以下の日本語メッセージを表示します。

```text
気づいたことを入力してください。
```

この環境ではブラウザ実操作は未確認です。構文確認のみ実行済みです。

## 14. メモ0件Markdown出力検証結果

実装済みです。メモが0件の場合、`AiConsultationMarkdownExporter` が以下を返し、UIに表示します。

```text
AI相談用に出力するメモがありません。
```

この環境ではブラウザ実操作は未確認です。構文確認のみ実行済みです。

## 15. localStorage保存失敗検証結果

実装済みです。`PlaytestNoteStorage.save()` が例外を捕捉し、以下の日本語メッセージを返します。

```text
メモ保存に失敗しました。ブラウザの保存領域またはプライベートブラウズ設定を確認してください。
```

実ブラウザでの保存失敗模擬は未確認です。手順は `manual_verification_instructions_v0_2.md` に記載しています。

## 16. v0.1回帰確認のための手順

`manual_verification_instructions_v0_2.md` に以下を記載しました。

- iPhone Safari 通常プレイ回帰確認
- macOS Safari 通常プレイ回帰確認
- Validator エラー確認
- GitHub Pages サブパス確認
- buildId 確認
- PC幅 気づきメモ正常系
- 空メモ、メモ0件、localStorage保存失敗の異常系

## 17. 実行済み

以下の静的構文確認を実行済みです。

```text
node --check compiled/main.js
node --check src/engine/notes/*.js
node --check src/engine/ui/*.js
```

結果は `docs/static_syntax_check_results_v0_2_arch_fix.json` に保存しています。

## 18. 未確認事項

以下は未確認です。

- macOS Safari 実機確認
- iPhone Safari 実機確認
- PC幅ブラウザでの実操作確認
- GitHub Pages 配置後の実URL確認
- Node版Playwright
- GitHub Actions / CI
- Chrome / Edge 実機確認
- localStorage保存失敗の実ブラウザ模擬確認

## 19. 後続課題

- v0.3 Patch貼り付け
- Patch検証
- Patch反映
- Patchロールバック
- 複数メモまとめ出力
- 関連Content Pack抜粋のMarkdown追加
- Node版Playwright導入
- GitHub Actions / CI導入
- 戦闘機能追加
- マップ拡張
- 新しいサンプルシナリオ追加

## 20. ライセンス

ライセンスは未設定です。LICENSEファイルも未作成です。MITライセンス等は設定していません。
