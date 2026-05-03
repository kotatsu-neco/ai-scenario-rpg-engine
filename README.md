# AIシナリオ駆動型スマホ Web RPG エンジン v0.2

## 概要

このリポジトリは、AIシナリオ駆動型スマホ Web RPG エンジンの v0.2 構造是正版です。v0.1 で確認済みの最小プロトタイプを基準に、v0.2 では **気づきメモ / AI相談メモ機能** を追加し、その責務を `src/engine/notes/` と `src/engine/ui/` に分離しました。

このエンジンは、単発のサンプルゲームではなく、AI が生成した Content Pack を読み込み、スマホ Web RPG として動作させる汎用ランタイムを目指します。

## 正式URL

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html
```

## buildId

```text
buildId: 20260502_v0_2_notes_arch_fix_01
```

`?debug=1` を付けると、画面上のデバッグオーバーレイで buildId を確認できます。

## v0.2で実装済みの内容

- PC幅での「気づきメモ」パネル表示
- メモ入力、カテゴリ、優先度の登録
- 空メモ保存時の日本語エラー
- メモ保存時の Context 自動添付
- メモ一覧表示
- メモ状態変更
- AI相談用 Markdown 生成
- メモ0件時の日本語メッセージ
- localStorage 保存
- 再読み込み後の復元処理
- packId ごとの保存キー分離
- スマホ幅では気づきメモ UI を非表示
- 気づきメモ関連処理の責務分離

## 構造是正の要点

気づきメモ機能は、compiled/main.js への直接追記ではなく、以下の責務別モジュールへ分離しました。

```text
src/engine/notes/
  PlaytestNoteTypes.js
  PlaytestNoteManager.js
  PlaytestNoteStorage.js
  ContextSnapshotBuilder.js
  AiConsultationMarkdownExporter.js

src/engine/ui/
  PlaytestNotePanel.js
  PlaytestNoteList.js
  PlaytestNoteErrorView.js

src/styles/
  playtest-notes.css
```

`compiled/main.js` は配布用エントリとして残し、`PlaytestNoteManager` を import して初期化する役割に寄せています。

## Content Pack構成

```text
content/sample_minimal_pack/
  通常確認用の最小Content Pack

content/sample_broken_missing_dialogue_pack/
  Validatorエラー確認用の壊れたContent Pack
```

## 通常確認URL

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html
```

## Validatorエラー確認URL

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?pack=sample_broken_missing_dialogue_pack
```

## 気づきメモ確認URL

PC幅で以下を開いて確認します。

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?debug=1
```

PC幅では右側に気づきメモパネルが表示されます。スマホ幅では通常プレイを妨げないよう、気づきメモ UI は非表示です。

## 確認済み

このパッケージ作成時に実行した確認は以下です。

- `node --check compiled/main.js`
- `node --check src/engine/notes/*.js`
- `node --check src/engine/ui/*.js`

結果は `docs/static_syntax_check_results_v0_2_arch_fix.json` に保存しています。

## 未確認

この環境では以下は未確認です。

- macOS Safari 実機確認
- iPhone Safari 実機確認
- PC幅ブラウザでの実操作確認
- GitHub Pages 配置後の実URL確認
- Node版Playwright
- GitHub Actions / CI
- localStorage保存失敗の実ブラウザ模擬確認

## 後続課題

- v0.3での Patch 貼り付け、Patch 検証、Patch 反映、ロールバック
- 気づきメモから複数メモまとめ出力への拡張
- 関連 Content Pack 抜粋を AI 相談用 Markdown に追加
- Node版Playwright導入
- GitHub Actions / CI 導入
- 戦闘機能、マップ拡張、新しいサンプルシナリオ追加

## ライセンス

現時点ではライセンス未設定です。LICENSE ファイルも未作成です。MIT などのライセンスは設定していません。
