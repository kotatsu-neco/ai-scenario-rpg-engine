# CHANGELOG v0.2 Public Demo / Pages Fix

## buildId

```text
20260503_local_starter_layout_fix_01
```

## 実装済み

### GitHub Pages / macOS Safari 黒画面停止対策

- `src/engine/notes/*.js` をGitHub Pages配置物に含める構成を維持
- `src/engine/ui/*.js` をGitHub Pages配置物に含める構成を維持
- `src/styles/playtest-notes.css` をGitHub Pages配置物に含める構成を維持
- `compiled/main.js` からの import パス `../src/engine/notes/PlaytestNoteManager.js` を前提に、必要な src モジュールを同梱
- `index.html` に起動失敗表示 `#bootError` を追加
- module import 失敗時に黒画面＋操作ボタンのみで止まらないよう、index.html 側で 3 秒後に日本語エラーを表示
- `?debug=1` に以下を追加表示
  - main.js loaded
  - notes module loaded
  - ui module loaded
  - content pack loaded
  - Game.start called

### public版 / 販売版分離準備

- READMEをPublic Demo向けに整理
- public版が「公開デモ・開発スナップショット」であることを明記
- 販売版 Starter Kit とは内容が異なることを明記
- ライセンス未設定、LICENSE未作成を明記
- public版に残すもの / 販売版に閉じるべきものを整理
- `.gitignore` を追加
- 販売版準備用草案を作成
  - `LICENSE_OR_TERMS_DRAFT.md`
  - `STARTER_KIT_CONTENTS_DRAFT.md`
  - `ASSET_INVENTORY_TEMPLATE.md`
  - `SALES_PREPARATION_ROADMAP.md`

### v0.2気づきメモ構造

- `src/engine/notes/` へ責務分離済み
- `src/engine/ui/` へUI責務分離済み
- `compiled/main.js` は配布用エントリに寄せ、`PlaytestNoteManager` の初期化のみを残す構成

## 実行済み

静的構文確認のみ実行済みです。

```text
node --check compiled/main.js
node --check src/engine/notes/*.js
node --check src/engine/ui/*.js
```


## レビュー修正: 販売準備草案のpublic除外

- public版ZIPから以下を除外しました。
  - `LICENSE_OR_TERMS_DRAFT.md`
  - `STARTER_KIT_CONTENTS_DRAFT.md`
  - `ASSET_INVENTORY_TEMPLATE.md`
  - `SALES_PREPARATION_ROADMAP.md`
- READMEの販売準備草案欄を、private販売版または内部開発版で管理する方針へ修正しました。
- `.gitignore`では販売準備草案を除外する方針を維持し、`ASSET_INVENTORY_TEMPLATE.md` も明示的に除外対象へ追加しました。
- 販売準備草案4ファイルは、別途 private販売準備用パッケージとして分離しました。

## 未確認

- macOS Safari 実機確認
- iPhone Safari 実機確認
- GitHub Pages配置後の正式URL確認
- GitHub Pages上の分割モジュール直接URL確認
- PC幅ブラウザでの実操作確認
- Node版Playwright
- GitHub Actions / CI
- Chrome / Edge実機確認
- git status 確認
- 既にGit管理下に入っている販売系ファイルの有無

## 後続課題

- GitHub Pagesへ配置後、直接URLが404にならないことを確認
- macOS Safariで黒画面停止しないことを実機確認
- iPhone Safariで通常プレイUIが壊れていないことを実機確認
- private販売版 Starter Kit の作成
- 販売版素材の素材台帳整備
- 利用規約正式版の作成
- v0.3 Patch機能への接続

## ライセンス

ライセンスは未設定です。LICENSEファイルも未作成です。

---

## 2026-05-03 local_starter_layout_01

### Added

- PC横画面向けローカル制作版UIを追加。
- スマホ縦画面ライブプレビュー、AI受け渡し補助、編集領域の3主領域を追加。
- 3主領域の配置プリセット切り替えを追加。
- 配置プリセットを `localStorage` に保存する処理を追加。
- 気づきメモのフローティングウィンドウを追加。
- AI相談文プレビューとコピー導線を追加。
- `?debug=1` 用のローカル制作UI debug panelを追加。

### Changed

- buildIdを `20260503_local_starter_layout_fix_01` に更新。
- デスクトップ幅では既存ゲーム本体をスマホ縦画面プレビューへ収容する構成に変更。
- スマホ幅ではローカル制作UIを表示せず、通常プレイUIを優先。
- 通常URLで既存debug overlayが表示されうる挙動を修正。

### Fixed

- `compiled/main.js` 内で `renderContentLoadError()` の閉じ括弧が欠け、`Game` クラスが関数内に入っていた構造を修正。

### Not verified

- Playwright確認は、実行環境のChromiumが `net::ERR_BLOCKED_BY_ADMINISTRATOR` でページを開けなかったため未実施。
- macOS Safari実機確認は未実施。
- iPhone Safari実機確認は未実施。

---

## 2026-05-03 local_starter_layout_fix_01

### Changed

- buildIdを `20260503_local_starter_layout_fix_01` に更新。
- 通常URL `index.html` はプレイ専用デモ表示へ変更。
- `index.html?mode=editor` または `index.html?local=1` の場合のみ、PC幅でローカル制作UIを表示する仕様へ変更。
- `index.html?mode=play` または `index.html?play=1` はプレイ専用表示として扱う仕様を明確化。
- スマホ幅では、制作UI指定があってもプレイ専用表示へフォールバックする仕様を維持。
- ライブプレビュー停止ボタンの文言を `プレビュー表示を一時停止（試作）` へ変更。
- 補足文として、現在は表示状態の切り替えのみで、ゲームループの完全な一時停止は後続実装であることをUI上に明記。

### Refactored

- `src/app/LocalStarterApp.js` から以下の責務を分離。
  - レイアウト管理: `src/engine/layout/LayoutManager.js`
  - レイアウト保存: `src/engine/layout/LayoutStorage.js`
  - AI受け渡し補助パネル: `src/engine/ai-handoff/AiHandoffPanel.js`
  - AI相談文生成: `src/engine/ai-handoff/AiHandoffPromptBuilder.js`
  - 気づきメモ フローティングUI: `src/engine/notes/PlaytestNoteFloatingWindow.js`
  - フローティングウィンドウ管理: `src/engine/ui/FloatingWindowManager.js`
  - 会話編集試作UI: `src/engine/editor/DialogueEditorPanel.js`
  - イベント編集試作UI: `src/engine/editor/EventEditorPanel.js`
- `LocalStarterApp.js` は初期化、各モジュール生成、Game Runtime接続、現在状態の受け渡し、全体イベント仲介、debug panel集約を主責務とする構造へ整理。

### CSS

- CSS正本を `src/styles/` に統一。
- `src/global.css`、`src/mobile-ui.css`、`src/playtest-notes.css` は重複のため削除。
- `index.html` のCSS参照は以下に統一。
  - `./src/styles/global.css`
  - `./src/styles/mobile-ui.css`
  - `./src/styles/playtest-notes.css`
  - `./src/styles/local-starter-layout.css`

### Not verified

- macOS Safari実機確認は未実施。
- iPhone Safari実機確認は未実施。
- GitHub Pages配置後の正式URL確認は未実施。
- 実ブラウザ上でのURLモード別UI確認は未実施。
- Playwright確認は未実施。
