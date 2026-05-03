# ローカル制作版 Starter Kit UI 検証依頼 v0.2 修正版

## 対象成果物

```text
ai_rpg_v0_2_local_starter_layout_fix_01.zip
```

## buildId

```text
20260503_local_starter_layout_fix_01
```

## 重要な確認区分

```text
静的検査成功 = JavaScript構文や参照ファイル確認が通った状態
Playwright確認成功 = ブラウザ相当環境でDOM・画面・操作を確認した状態
実機確認成功 = macOS Safari / iPhone Safariで人間が確認した状態
GitHub Pages確認成功 = 公開URL上でパス解決を含めて確認した状態
```

このパッケージ作成時点では、Playwright確認、macOS Safari実機確認、iPhone Safari実機確認、GitHub Pages確認は未実施です。

---

## 1. 静的確認

### 1.1 構文確認

```bash
find compiled src -name "*.js" -print0 | xargs -0 -n1 node --check
```

合格条件:

```text
すべてエラーなし
```

### 1.2 主要ファイル存在確認

確認対象:

```text
index.html
compiled/main.js
src/app/LocalStarterApp.js
src/engine/layout/LayoutManager.js
src/engine/layout/LayoutStorage.js
src/engine/ai-handoff/AiHandoffPanel.js
src/engine/ai-handoff/AiHandoffPromptBuilder.js
src/engine/notes/PlaytestNoteFloatingWindow.js
src/engine/ui/FloatingWindowManager.js
src/engine/editor/DialogueEditorPanel.js
src/engine/editor/EventEditorPanel.js
src/styles/global.css
src/styles/mobile-ui.css
src/styles/playtest-notes.css
src/styles/local-starter-layout.css
content/sample_minimal_pack/pack.json
content/sample_broken_missing_dialogue_pack/pack.json
```

合格条件:

```text
すべて存在する
src/global.css、src/mobile-ui.css、src/playtest-notes.css が存在しない
```

---

## 2. URLモード確認

### 2.1 通常URL

```text
http://127.0.0.1:任意ポート/index.html
```

期待結果:

```text
プレイ専用デモが表示される
制作UIが表示されない
```

### 2.2 プレイ専用明示

```text
http://127.0.0.1:任意ポート/index.html?mode=play
http://127.0.0.1:任意ポート/index.html?play=1
```

期待結果:

```text
プレイ専用デモが表示される
制作UIが表示されない
```

### 2.3 制作UIプレビュー

```text
http://127.0.0.1:任意ポート/index.html?mode=editor&debug=1
http://127.0.0.1:任意ポート/index.html?local=1&debug=1
```

期待結果:

```text
PC幅ではローカル制作UIが表示される
3主領域が出る
ライブプレビューが出る
AI受け渡し補助が出る
編集領域が出る
buildId: 20260503_local_starter_layout_fix_01 が確認できる
```

### 2.4 スマホ幅

```text
index.html?mode=editor
```

期待結果:

```text
スマホ幅では制作UIを表示せず、プレイ専用へフォールバックする
```

---

## 3. プレイ専用確認

対象URL:

```text
index.html
index.html?mode=play
```

確認項目:

```text
マップが表示される
プレイヤーが表示される
NPCが表示される
仮想十字キーで移動できる
NPCと会話できる
2回目会話が変化する
制作UIが出ない
```

---

## 4. 制作UI確認

対象URL:

```text
index.html?mode=editor&debug=1
```

確認項目:

```text
3主領域が出る
ライブプレビューが出る
AI受け渡し補助が出る
編集領域が出る
配置プリセットが切り替わる
配置プリセットが再読み込み後も残る
気づきメモがフローティングで開く
AI相談文をコピーできる
```

### ライブプレビュー停止文言

確認:

```text
ボタン名が「プレビュー表示を一時停止（試作）」または同等文言になっている
停止中表示が「プレビュー表示を一時停止中（試作）」または同等文言になっている
ゲームループの完全な一時停止は後続実装である旨が補足されている
```

---

## 5. Validator確認

対象URL:

```text
index.html?mode=play&pack=sample_broken_missing_dialogue_pack
```

または:

```text
index.html?pack=sample_broken_missing_dialogue_pack
```

期待結果:

```text
Validatorエラー画面が表示される
ゲーム本編が始まらない
```

---

## 6. GitHub Pages確認URL

通常デモ:

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html
```

制作UIプレビュー:

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?mode=editor
```

プレイ専用:

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?mode=play
```

Validator:

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?mode=play&pack=sample_broken_missing_dialogue_pack
```

---

## 7. 報告テンプレート

```text
ローカル制作版UI 確認結果

静的検査:
- node --check: OK / NG
- 主要ファイル存在: OK / NG
- src直下CSS重複なし: OK / NG

URLモード:
- index.html: OK / NG / 未実施
- index.html?mode=play: OK / NG / 未実施
- index.html?play=1: OK / NG / 未実施
- index.html?mode=editor: OK / NG / 未実施
- index.html?local=1: OK / NG / 未実施

制作UI:
- 3主領域: OK / NG / 未実施
- 配置プリセット: OK / NG / 未実施
- 気づきメモ: OK / NG / 未実施
- AI相談文コピー: OK / NG / 未実施
- 停止文言: OK / NG / 未実施

macOS Safari:
- 通常デモ: OK / NG / 未実施
- 制作UIプレビュー: OK / NG / 未実施
- Validator: OK / NG / 未実施

iPhone Safari:
- 通常プレイ: OK / NG / 未実施
- mode=editor時のプレイ専用フォールバック: OK / NG / 未実施

NG詳細:
-

気になったこと:
-
```
