# Playwright検証報告: Validatorエラー確認（AIシナリオ駆動型スマホWeb RPGエンジン v0.1）

## 1. 実行環境

|項目|内容|
|---|---|
|OS|Ubuntu 系コンテナ環境|
|Node|`v22.16.0`|
|Python|`3.13.5`|
|Playwright (Python)|`1.58.0`|
|Browser|Chromium `144.0.7559.96`|
|起動URL|`http://localhost:<port>/index_compiled.html`（通常起動） / `?pack=sample_broken_missing_dialogue_pack`（壊れたContent Pack）|

※実際のポート番号はテスト時に動的に割り当てました。ブラウザは Playwright が同梱する Chromium を使用しています。

## 2. 検証概要

依頼文の指示に従い、AIシナリオ駆動型スマホWeb RPGエンジン v0.1 に **Validator機能** を実装し、意図的に壊れた Content Pack を用意して起動時にエラー検出が行われるかを確認しました。【507311837424586†L13-L37】。壊れた Content Pack は正常な `sample_minimal_pack` をコピーし、初回会話イベントの `show_dialogue` コマンドで存在しない `dialogue_missing_for_validator_test` を参照するように改変しました【507311837424586†L91-L113】。`dialogues.json` にはこの ID を追加していません【507311837424586†L115-L126】。ゲームエンジンは URL パラメータ `?pack=` で Content Pack を切り替えられるように変更し、Validator の結果に `error` があればゲーム開始を中止し、内容を日本語で表示する画面を描画します【507311837424586†L410-L427】。

Playwright テストでは以下を確認しました。

* 通常 Content Pack (`sample_minimal_pack`) ではゲームが正常に起動し、プレイヤーの移動や NPC との会話が可能であり、コンソール／ページ／ネットワークエラーは発生しない。
* 壊れた Content Pack (`sample_broken_missing_dialogue_pack`) を URL パラメータで読み込むと、ゲーム本編（Canvas、仮想十字キーなど）は表示されず、Validator エラー画面が表示されること。
* エラー画面には「検証エラー」「ゲームを開始できません」「dialogue_missing_for_validator_test」「events.json」など、依頼文で要求されている情報が含まれている【507311837424586†L439-L476】【507311837424586†L489-L497】。
* Validator エラーが検出された場合、`Game.start()` は呼び出されない【507311837424586†L410-L427】。

検証は 3 種類の viewport（375×667、390×844、1366×768）で実施し、各サイズでスクリーンショットを取得しました【507311837424586†L482-L488】。

## 3. エラー発生方法

|項目|内容|
|---|---|
|採用した方法|壊れた Content Pack 方式【507311837424586†L40-L70】|
|壊れた Content Pack の作成|`sample_minimal_pack` を複製し、`events.json` の `event_talk_chief_first` の `show_dialogue` を `dialogue_missing_for_validator_test` に書き換えた【507311837424586†L91-L113】。`pack.json` の `packId` と `title` を新しい名称に変更した【507311837424586†L53-L67】。|
|読み込み方法|URL パラメータ `?pack=sample_broken_missing_dialogue_pack` を指定して壊れた Content Pack を読み込んだ【507311837424586†L134-L165】。|

## 4. 壊した内容

壊れた Content Pack の `events.json` では、初回会話イベント `event_talk_chief_first` の 1 行目を以下のように変更しました。参照先 `dialogue_chief_first` を存在しない ID `dialogue_missing_for_validator_test` に書き換えています【507311837424586†L91-L113】。

```json
{
  "id": "event_talk_chief_first",
  "commands": [
    { "type": "show_dialogue", "dialogueId": "dialogue_missing_for_validator_test" },
    { "type": "set_flag", "flag": "chief_talked", "value": true },
    { "type": "start_quest", "questId": "quest_walk_village" },
    { "type": "save_checkpoint" }
  ]
}
```

`dialogues.json` に `dialogue_missing_for_validator_test` は追加しておらず、あえて存在しない状態にしました【507311837424586†L115-L126】。

## 5. Validator 検出結果

Validator は Content Pack 読み込み直後に全ファイルを検査します。壊れた Content Pack に対しては以下の結果を返しました。

|項目|内容|
|---|---|
|`errorCount`|1（warning は 0）|
|`ruleId`|`VAL_REF_001`|
|`message`|`イベント「event_talk_chief_first」が、存在しない会話ID「dialogue_missing_for_validator_test」を参照しています。`|
|対象ファイル|`events.json`|
|対象イベントID|`event_talk_chief_first`|
|問題ID|`dialogue_missing_for_validator_test`|

これらの情報は Validator エラー画面に表示されました【507311837424586†L439-L476】。

## 6. ゲーム開始停止結果

壊れた Content Pack を読み込んだ場合、Validator により `errorCount` が 1 と判定されたため、`Game.start()` は呼び出されませんでした【507311837424586†L410-L427】。画面にはゲーム本編の Canvas や仮想十字キーは表示されず、Validator エラー画面のみが表示されました。正常な Content Pack では通常通りゲームが開始し、移動や会話が可能でした。

## 7. スクリーンショット

以下のスクリーンショットを取得しました。いずれの画像にも「検証エラー」「ゲームを開始できません」「dialogue_missing_for_validator_test」「events.json」等が表示されています【507311837424586†L489-L497】。

|ファイル名|説明|
|---|---|
|`validator_error_375x667.png`|モバイル（375×667）で壊れた Content Pack を読み込んだ際のエラー画面。エラー詳細（イベントID、問題ID、対象ファイル）が日本語で表示され、Canvas や UI は表示されていません。|
|`validator_error_390x844.png`|モバイル（390×844）でのエラー画面。内容は 375×667 と同様です。|
|`validator_error_1366x768.png`|デスクトップ（1366×768）でのエラー画面。デバッグオーバーレイの代わりにエラーレポートが全面に表示されています。|

## 8. console / page / network error

Playwright のログによると、壊れた Content Pack を読み込んだ際に **console error**, **page error**, **network error** は発生しませんでした。通常の Content Pack に対しても、404/5xx レスポンスや JavaScript の例外は確認されていません。

## 9. 判定

依頼文で定められた合格条件【507311837424586†L531-L545】をすべて満たしているため、本バージョンは **合格** と判定します。具体的には以下を確認済みです。

* 存在しない `dialogue_missing_for_validator_test` を意図的に作成し、`dialogues.json` には追加していません。
* Validator が起動時にエラーを検出し、`errorCount` が 1 以上になっています。
* `Game.start()` は呼ばれておらず、ゲーム本編は開始していません。
* Validator エラー画面が表示され、問題 ID (`dialogue_missing_for_validator_test`) と対象イベント/ファイル (`event_talk_chief_first` / `events.json`) が明示されています。
* 375×667、390×844、1366×768 のスクリーンショットがあり、必要な文言が含まれています。

通常のゲームプレイについても、プレイヤーの移動・会話・フラグ更新が正常に機能することを確認しました。したがって、実機での検証へ進める準備が整ったと考えます。