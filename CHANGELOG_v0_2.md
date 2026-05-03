# CHANGELOG v0.2

## v0.2 notes architecture fix

buildId:

```text
20260502_v0_2_notes_arch_fix_01
```

## 実装済み

### 気づきメモ / AI相談メモ

- PC幅で気づきメモパネルを表示
- メモ本文、カテゴリ、優先度の入力
- 現在状態 Context の自動添付
- メモ一覧表示
- メモ状態変更
- AI相談用 Markdown 生成
- localStorage 保存と復元
- packId ごとの保存キー分離
- 空メモ保存時の日本語エラー
- メモ0件 Markdown 出力時の日本語エラー
- localStorage 保存失敗時の日本語エラー

### 構造是正

気づきメモ機能を以下へ分離しました。

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
```

`compiled/main.js` には、配布用エントリとして `PlaytestNoteManager` の初期化だけを残しています。

## v0.1から維持する機能

- GitHub Pages サブパス対応
- Validator エラー画面
- Safari 会話終了停止バグ修正
- Content Pack 読み込み
- NPC 会話
- 2回目会話の変化
- 仮想十字キー操作

## 実行済み

- `node --check compiled/main.js`
- `node --check src/engine/notes/*.js`
- `node --check src/engine/ui/*.js`

静的構文確認のみ実行済みです。

## 未確認

- macOS Safari 実機確認
- iPhone Safari 実機確認
- PC幅ブラウザ実操作確認
- GitHub Pages 実URL確認
- Node版Playwright
- GitHub Actions / CI
- localStorage 保存失敗の実ブラウザ模擬確認

## 後続課題

- v0.3 Patch機能
- 複数メモまとめ出力
- 関連 Content Pack 抜粋の Markdown 追加
- Node版Playwright / CI 整備
- 戦闘機能、マップ拡張、新規サンプルシナリオ

## ライセンス

ライセンスは未設定です。LICENSE ファイルも未作成です。
