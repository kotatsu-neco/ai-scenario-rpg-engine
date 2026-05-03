# v0.2 実機確認手順

この手順書は、AIシナリオ駆動型スマホ Web RPG エンジン v0.2 構造是正版の確認手順です。

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
buildId: 20260502_v0_2_notes_arch_fix_01
```

## iPhone Safari 通常プレイ回帰確認

1. iPhone Safari で正式URLを開きます。
2. マップ、プレイヤー、NPC、仮想十字キーが表示されることを確認します。
3. 仮想十字キーで移動できることを確認します。
4. 村長に近付き、会話できることを確認します。
5. 会話中にプレイヤーが移動しないことを確認します。
6. 会話終了後、フィールド操作へ戻ることを確認します。
7. 2回目に村長へ話しかけると会話内容が変化することを確認します。
8. スマホ幅では気づきメモ UI が通常プレイを邪魔しないことを確認します。

## macOS Safari 通常プレイ回帰確認

1. macOS Safari で次のURLを開きます。

   ```text
   https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?debug=1
   ```

2. buildId が `20260502_v0_2_notes_arch_fix_01` であることを確認します。
3. `currentState: field`、`inputLock: false` で開始していることを確認します。
4. 村長に話しかけます。
5. 会話を最後まで進めます。
6. 会話ウィンドウが閉じることを確認します。
7. `currentState: field`、`inputLock: false` に戻ることを確認します。
8. `chief_talked: true` になることを確認します。
9. 2回目に村長へ話しかけると会話内容が変化することを確認します。

## PC幅 気づきメモ正常系

PC幅のブラウザで次のURLを開きます。

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?debug=1
```

確認項目:

1. 右側またはPC幅用の位置に「気づきメモ」パネルが表示されること。
2. 「気づいたこと」欄に任意のメモを入力します。
3. カテゴリ、優先度を選びます。
4. 「メモを保存」を押します。
5. 「メモを保存しました。」と表示され、メモ一覧に追加されることを確認します。
6. 保存したメモを選択し、状態を変更できることを確認します。
7. 「AI相談用にコピー」を押します。
8. AI相談用Markdownが生成され、Markdown欄に表示されることを確認します。
9. ページを再読み込みし、保存したメモが復元されることを確認します。

## 異常系 1: 空メモ保存

手順:

1. 「気づいたこと」欄を空にします。
2. 「メモを保存」を押します。

期待結果:

```text
気づいたことを入力してください。
```

確認項目:

- 空メモは保存されない。
- 画面が固まらない。
- 既存メモ一覧が壊れない。

## 異常系 2: メモ0件でMarkdown出力

手順:

1. ブラウザの開発者ツールで localStorage の `ai_rpg_playtest_notes:<packId>` を削除します。
2. 画面を再読み込みします。
3. メモ一覧が0件であることを確認します。
4. 「AI相談用にコピー」を押します。

期待結果:

```text
AI相談用に出力するメモがありません。
```

確認項目:

- Markdown欄は空になる。
- 画面が固まらない。

## 異常系 3: localStorage保存失敗

可能な環境で、開発者ツールのコンソールから以下を実行して保存失敗を模擬します。

```js
const originalSetItem = window.localStorage.setItem;
window.localStorage.setItem = () => {
  throw new Error('localStorage test failure');
};
```

その後、メモを入力して「メモを保存」を押します。

期待結果:

```text
メモ保存に失敗しました。
ブラウザの保存領域またはプライベートブラウズ設定を確認してください。
```

確認後は以下で復元してください。

```js
window.localStorage.setItem = originalSetItem;
```

この検証が実ブラウザでできない場合は、未確認として記録してください。

## Validatorエラー確認

次のURLを開きます。

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?pack=sample_broken_missing_dialogue_pack
```

期待結果:

- ゲーム本編は開始しない。
- Canvasや仮想十字キーは表示されない。
- 「Content Pack検証エラー」が日本語で表示される。
- `event_talk_chief_first` と `dialogue_missing_for_validator_test` が画面に表示される。

## GitHub Pages サブパス確認

デバッグ表示で `packUrl` が次の形式になっていることを確認します。

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/content/sample_minimal_pack/pack.json
```

ドメインルート `/content/...` を指していないことを確認してください。

## 未確認として扱う項目

このパッケージ作成時点では、以下は実行していません。

- macOS Safari 実機確認
- iPhone Safari 実機確認
- Node版Playwright
- GitHub Actions / CI
- Chrome / Edge 実機確認
