# ローカル制作版 Starter Kit UI v0.2 実装報告
## 実機確認前の必須構造・文言・配布方針修正

## 1. 修正概要

実機確認前の必須修正として、以下4点を修正しました。

```text
1. LocalStarterApp.js の責務分離
2. CSS重複の整理
3. 「ライブプレビュー停止」文言の修正
4. public demoの通常URLをプレイ専用にし、制作UIは mode=editor で表示する方針へ変更
```

今回の修正後 buildId:

```text
20260503_local_starter_layout_fix_01
```

## 2. 変更ファイル一覧

### 更新

```text
index.html
compiled/main.js
README.md
CHANGELOG_v0_2.md
manual_verification_instructions_v0_2.md
src/app/LocalStarterApp.js
docs/Local_Starter_Kit_Verification_Request_v0_2.md
```

### 新設

```text
src/engine/layout/LayoutManager.js
src/engine/layout/LayoutStorage.js
src/engine/ai-handoff/AiHandoffPanel.js
src/engine/ai-handoff/AiHandoffPromptBuilder.js
src/engine/notes/PlaytestNoteFloatingWindow.js
src/engine/ui/FloatingWindowManager.js
src/engine/editor/DialogueEditorPanel.js
src/engine/editor/EventEditorPanel.js
docs/Local_Starter_Kit_Implementation_Report_v0_2_fix_01.md
```

### 削除

```text
src/global.css
src/mobile-ui.css
src/playtest-notes.css
```

## 3. LocalStarterApp.jsから分離した責務

`LocalStarterApp.js` から以下を分離しました。

```text
レイアウトプリセット定義
配置プリセット適用
レイアウト設定保存・読み込み
AI受け渡し補助パネルDOM生成
AI相談文生成
気づきメモのフローティング編集UI
フローティングウィンドウ開閉管理
会話編集試作UI
イベント編集試作UI
```

`LocalStarterApp.js` に残した責務は以下です。

```text
初期化
各モジュールの生成
Game Runtimeとの接続
現在状態の受け渡し
全体イベントの仲介
debug panelへの集約
```

## 4. 新設・更新したモジュール

### LayoutManager

```text
src/engine/layout/LayoutManager.js
```

責務:

```text
3主領域の並び順管理
配置プリセットの適用
現在のlayoutPreset取得
AI受け渡し補助パネルの位置表示
```

### LayoutStorage

```text
src/engine/layout/LayoutStorage.js
```

責務:

```text
レイアウト設定の保存
レイアウト設定の読み込み
保存失敗時のエラー返却
localStorageキー ai_rpg_local_layout_preset の一元管理
```

### AiHandoffPanel

```text
src/engine/ai-handoff/AiHandoffPanel.js
```

責務:

```text
AI受け渡し補助パネルのDOM生成
選択中ID表示
現在状態表示
気づきメモ要約表示
AI相談文プレビュー表示
コピー操作のUI接続
```

### AiHandoffPromptBuilder

```text
src/engine/ai-handoff/AiHandoffPromptBuilder.js
```

責務:

```text
AI相談文の生成
既存IDを変えない指示の付与
コードを書かない指示の付与
Content Pack Patchとして提案する指示の付与
```

### PlaytestNoteFloatingWindow

```text
src/engine/notes/PlaytestNoteFloatingWindow.js
```

責務:

```text
気づきメモのフローティング編集UI
対象ID表示
現在状況表示
本文入力
カテゴリ・優先度選択
保存・キャンセル
AI相談文コピー
```

### FloatingWindowManager

```text
src/engine/ui/FloatingWindowManager.js
```

責務:

```text
フローティングウィンドウの開閉
画面外にはみ出さない制御
重なり順管理
未保存時の閉じる確認
```

### DialogueEditorPanel

```text
src/engine/editor/DialogueEditorPanel.js
```

責務:

```text
会話編集領域のDOM生成
会話ID
話者名
本文
条件
分岐
保存・削除UI
```

### EventEditorPanel

```text
src/engine/editor/EventEditorPanel.js
```

責務:

```text
イベント編集領域のDOM生成
イベントID
トリガー
場所
関連会話
関連フラグ
保存・削除UI
```

## 5. CSS重複の整理内容

CSS正本を以下へ統一しました。

```text
src/styles/global.css
src/styles/mobile-ui.css
src/styles/playtest-notes.css
src/styles/local-starter-layout.css
```

`index.html` のCSS参照は以下です。

```html
<link rel="stylesheet" href="./src/styles/global.css" />
<link rel="stylesheet" href="./src/styles/mobile-ui.css" />
<link rel="stylesheet" href="./src/styles/playtest-notes.css?v=20260503_local_starter_layout_fix_01" />
<link rel="stylesheet" href="./src/styles/local-starter-layout.css?v=20260503_local_starter_layout_fix_01" />
```

以下の重複CSSは削除しました。

```text
src/global.css
src/mobile-ui.css
src/playtest-notes.css
```

## 6. ライブプレビュー停止文言の修正内容

変更前:

```text
ライブプレビュー停止
ライブプレビュー停止中
```

変更後:

```text
プレビュー表示を一時停止（試作）
プレビュー表示を一時停止中（試作）
```

補足として、UI上に以下の意味を示す文言を追加しました。

```text
現在は表示状態の切り替えのみです。ゲームループの完全な一時停止は後続実装です。
```

今回、ゲームループpause/resume、イベント進行停止、音声停止、タイマー停止は実装していません。

## 7. URLモード判定仕様

採用仕様:

```text
index.html
→ プレイ専用

index.html?mode=play
→ プレイ専用

index.html?play=1
→ プレイ専用

index.html?mode=editor
→ PC幅ではローカル制作UI / スマホ幅ではプレイ専用へフォールバック

index.html?local=1
→ PC幅ではローカル制作UI / スマホ幅ではプレイ専用へフォールバック

index.html?local=0
→ プレイ専用
```

変更点:

```text
PC幅なら自動で制作UIを表示する仕様は廃止しました。
制作UIは mode=editor または local=1 のときだけ表示します。
```

## 8. README更新内容

READMEに以下を明記しました。

```text
通常デモ:
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html

制作UIプレビュー:
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?mode=editor

プレイ専用:
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?mode=play
```

また、制作UIについて以下を明記しました。

```text
制作UIは販売版Starter Kitに向けた開発中の画面プレビューです。
public版では一部機能が制限されます。
```

## 9. buildId

```text
20260503_local_starter_layout_fix_01
```

## 10. 静的構文確認結果

実行済み:

```bash
find compiled src -name "*.js" -print0 | xargs -0 -n1 node --check
```

結果:

```text
成功
```

追加で、Node上の静的URLモード判定確認を実行しました。

```text
パラメータなし / desktop → 制作UI無効
mode=play / desktop → 制作UI無効
play=1 / desktop → 制作UI無効
mode=editor / desktop → 制作UI有効
local=1 / desktop → 制作UI有効
mode=editor / mobile幅 → 制作UI無効
local=1 / mobile幅 → 制作UI無効
local=0 / desktop → 制作UI無効
```

結果:

```text
成功
```

ローカルHTTPサーバー経由の主要ファイル取得確認も実行しました。

```text
index.html: 200
compiled/main.js: 200
src/app/LocalStarterApp.js: 200
src/engine/layout/LayoutManager.js: 200
src/engine/ai-handoff/AiHandoffPanel.js: 200
src/engine/notes/PlaytestNoteFloatingWindow.js: 200
src/engine/ui/FloatingWindowManager.js: 200
src/engine/editor/DialogueEditorPanel.js: 200
src/styles/local-starter-layout.css: 200
content/sample_minimal_pack/pack.json: 200
content/sample_broken_missing_dialogue_pack/pack.json: 200
```

## 11. URL別確認結果

この環境では実ブラウザ確認は未実施です。URLモード判定は `LocalStarterApp.shouldEnable()` の実装として反映済みです。

静的に確認した判定仕様:

```text
mode=play または play=1 → 制作UI無効
mode=editor または local=1 → PC幅のみ制作UI有効
local=0 → 制作UI無効
パラメータなし → 制作UI無効
```

## 12. 未確認事項

```text
Playwright確認
macOS Safari実機確認
iPhone Safari実機確認
GitHub Pages配置後の正式URL確認
GitHub Pages上の分割モジュール直接URL確認
実ブラウザ上でのURLモード別UI確認
実ブラウザ上での配置保存・気づきメモ保存・コピー操作
Validatorエラー画面の実ブラウザ表示
Chrome / Edge実機確認
GitHub Actions / CI
```

## 13. 後続課題

```text
Patch貼り付け
Patch検証
Patch反映
Patchロールバック
本格的な書き出し
ローカルHTTPサーバー起動スクリプト
内蔵AIブラウザ
AI API連携
新規サンプルシナリオ追加
ゲームループpause/resumeの正式実装
制作UIの販売版向け詳細化
```

## 14. 備考

今回の修正は、GitHub Pages配置・macOS Safari / iPhone Safari実機確認へ進む前の構造整理です。実機確認成功とは扱わないでください。
