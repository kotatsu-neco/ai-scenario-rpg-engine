# v0.2 Public Demo / GitHub Pages 実機確認手順

この文書は、AIシナリオ駆動型スマホ Web RPG エンジン v0.2 Public Demo / Pages Fix の確認手順です。

## 正式URL

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html
```

## buildId確認

GitHub Pages に配置後、次の URL を開きます。

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?debug=1
```

画面上のデバッグオーバーレイに次が表示されることを確認してください。

```text
buildId: 20260503_local_starter_layout_fix_01
```

## GitHub Pages 分割モジュール直接URL確認

GitHub Pages上で以下のURLがすべて直接開けるか確認してください。1つでも404になる場合、配置物が不足しています。

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/src/engine/notes/PlaytestNoteManager.js
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/src/engine/notes/PlaytestNoteTypes.js
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/src/engine/notes/PlaytestNoteStorage.js
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/src/engine/notes/ContextSnapshotBuilder.js
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/src/engine/notes/AiConsultationMarkdownExporter.js
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/src/engine/ui/PlaytestNotePanel.js
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/src/engine/ui/PlaytestNoteList.js
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/src/engine/ui/PlaytestNoteErrorView.js
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/src/styles/playtest-notes.css
```

## 起動失敗表示の確認

分割モジュールの読み込みに失敗した場合、黒画面＋操作ボタンだけで止まらず、`index.html` 側の `#bootError` が表示される設計です。

通常環境では表示されないことを確認してください。表示される場合、`compiled/main.js` または `src/engine/...` の読み込みに失敗している可能性があります。

## macOS Safari 黒画面回帰確認

1. macOS Safariで正式URLを開きます。

   ```text
   https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?debug=1
   ```

2. buildIdが `20260503_local_starter_layout_fix_01` であることを確認します。
3. デバッグ表示で以下が true になっていることを確認します。

   ```text
   main.js loaded: true
   notes module loaded: true
   ui module loaded: true
   content pack loaded: true
   Game.start called: true
   ```

4. マップ、プレイヤー、NPCが表示されることを確認します。
5. 仮想十字キーまたはキーボードで移動できることを確認します。
6. 村長に話しかけ、会話が最後まで進むことを確認します。
7. 会話終了後にフィールド操作へ戻ることを確認します。
8. PC幅で気づきメモパネルが表示されることを確認します。
9. メモを保存し、一覧に表示されることを確認します。
10. AI相談用Markdownを生成できることを確認します。

## iPhone Safari 回帰確認

1. iPhone Safariで正式URLを開きます。
2. マップ、プレイヤー、NPC、仮想十字キーが表示されることを確認します。
3. 仮想十字キーで移動できることを確認します。
4. 村長と会話できることを確認します。
5. 会話中に移動しないことを確認します。
6. 2回目会話が変化することを確認します。
7. スマホ幅で気づきメモUIが通常プレイを邪魔しないことを確認します。

## 気づきメモ正常系確認

PC幅で確認します。

1. 「気づきメモ」パネルが表示されることを確認します。
2. 「気づいたこと」欄に任意のメモを入力します。
3. カテゴリ、優先度を選びます。
4. 「メモを保存」を押します。
5. 「メモを保存しました。」と表示され、一覧に追加されることを確認します。
6. 「AI相談用にコピー」を押します。
7. Markdown欄にAI相談用Markdownが表示されることを確認します。
8. ページ再読み込み後もメモが復元されることを確認します。

## 異常系: 空メモ保存

手順:

1. 「気づいたこと」欄を空にします。
2. 「メモを保存」を押します。

期待結果:

```text
気づいたことを入力してください。
```

## 異常系: メモ0件Markdown出力

手順:

1. localStorageの `ai_rpg_playtest_notes:<packId>` を削除します。
2. ページを再読み込みします。
3. 「AI相談用にコピー」を押します。

期待結果:

```text
AI相談用に出力するメモがありません。
```

## 異常系: localStorage保存失敗

可能な環境でブラウザコンソールから以下を実行します。

```js
const originalSetItem = window.localStorage.setItem;
window.localStorage.setItem = () => {
  throw new Error('localStorage test failure');
};
```

その後、メモを入力して「メモを保存」を押します。

期待結果:

```text
メモ保存に失敗しました。ブラウザの保存領域またはプライベートブラウズ設定を確認してください。
```

確認後は以下で復元します。

```js
window.localStorage.setItem = originalSetItem;
```

## Validatorエラー確認

次のURLを開きます。

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?pack=sample_broken_missing_dialogue_pack
```

期待結果:

- ゲーム本編は開始しない
- Canvasや仮想十字キーは表示されない
- Content Pack検証エラーが日本語で表示される
- `event_talk_chief_first` と `dialogue_missing_for_validator_test` が表示される

## 未確認として扱う項目

このパッケージ作成時点では、以下は未確認です。

- macOS Safari 実機確認
- iPhone Safari 実機確認
- GitHub Pages配置後の正式URL確認
- GitHub Pages上の分割モジュール直接URL確認
- Node版Playwright
- GitHub Actions / CI
- Chrome / Edge実機確認
- git status確認

---

# 追加確認: ローカル制作版 Starter Kit UI

対象buildId:

```text
20260503_local_starter_layout_fix_01
```

## macOS Safari

URL:

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?debug=1
```

確認:

```text
SCN-A: 起動と基本表示
SCN-B: ライブプレビューと会話
SCN-C: 3主領域の配置切り替え
SCN-D: 気づきメモ フローティングウィンドウ
SCN-E: AI相談文コピー
SCN-F: Validatorエラー
```

## iPhone Safari

URL:

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html
```

確認:

```text
SCN-G: 通常プレイ回帰
```

詳細手順は以下を参照してください。

```text
docs/Local_Starter_Kit_Verification_Request_v0_2.md
```

---

# 追加確認: local_starter_layout_fix_01

対象buildId:

```text
20260503_local_starter_layout_fix_01
```

## URLモード確認

GitHub Pages配置後、以下を確認してください。

```text
index.html
→ プレイ専用。制作UIが表示されない。

index.html?mode=play
→ プレイ専用。制作UIが表示されない。

index.html?play=1
→ プレイ専用。制作UIが表示されない。

index.html?mode=editor
→ PC幅ではローカル制作UI。スマホ幅ではプレイ専用へフォールバック。

index.html?local=1
→ PC幅ではローカル制作UI。スマホ幅ではプレイ専用へフォールバック。
```

## 通常デモURL

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html
```

期待結果:

```text
マップが表示される
プレイヤーが表示される
NPCが表示される
仮想十字キーで移動できる
NPCと会話できる
2回目会話が変化する
制作UIが出ない
```

## 制作UIプレビューURL

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?mode=editor
```

期待結果:

```text
3主領域が出る
ライブプレビューが出る
AI受け渡し補助が出る
編集領域が出る
配置プリセットが切り替わる
気づきメモがフローティングで開く
ライブプレビュー停止系ボタンが「プレビュー表示を一時停止（試作）」または同等文言になっている
ゲームループの完全停止は未実装である旨が補足されている
```

## Validatorエラー確認

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?mode=play&pack=sample_broken_missing_dialogue_pack
```

期待結果:

```text
Validatorエラー画面が表示される
ゲーム本編が始まらない
```

## 未確認として扱う項目

このパッケージ作成時点では、以下は未確認です。

```text
macOS Safari実機確認
iPhone Safari実機確認
GitHub Pages配置後の正式URL確認
GitHub Pages上の分割モジュール直接URL確認
実ブラウザ上でのURLモード別UI確認
Playwright確認
Chrome / Edge実機確認
GitHub Actions / CI
```
