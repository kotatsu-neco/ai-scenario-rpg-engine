# AI Scenario RPG Engine Public Demo

このリポジトリは、AI相談型スマホWeb RPGエンジンの **公開デモ・開発スナップショット** です。

正式な販売版 Starter Kit とは内容が異なります。販売版には、追加グラフィック素材、サンプルゲーム、制作テンプレート、AI相談用プロンプト、解説ドキュメント、素材差し替え手順、トラブルシュートが含まれる予定です。

## 正式URL

```text
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html
```

## buildId

```text
20260503_local_starter_layout_fix_01
```

`?debug=1` を付けると、画面上のデバッグオーバーレイで buildId を確認できます。

## Public Demoの位置づけ

Public Demoは、エンジンの基本動作を確認するための最小構成です。

含まれるもの:

```text
最小エンジン
最小デモ
最小Content Pack
最小Validator例
GitHub Pagesデモ
販売版案内
基本的な概要説明
```

含めないもの:

```text
有料版専用グラフィック素材
本格サンプル村マップ
サンプルゲーム完成版
AI相談用プロンプト集
制作テンプレート集
詳細な改造手順
トラブルシュート全文
Starter Kit用チェックリスト
素材差し替えテンプレート
販売版利用規約本文
販売用zip
```

## Public Demoと販売版の違い

Public Demoは、エンジンの基本動作を確認するための最小構成です。

販売版 Starter Kit には、以下が含まれる予定です。

- すぐ使えるグラフィック素材
- サンプル村マップ
- 主人公・NPC・UI素材
- シナリオJSON例
- 会話テンプレート
- AI相談用プロンプト例
- GitHub Pages公開手順
- トラブルシュート
- 素材差し替え手順
- 利用規約

## ライセンス

現時点では、このリポジトリにオープンソースライセンスは設定していません。  
LICENSEファイルも未作成です。

このリポジトリの内容は、閲覧およびGitHub上の通常機能による参照を目的として公開しています。  
本リポジトリ内のコード・素材・文書を、制作キット、素材集、テンプレート集、または販売版と実質的に競合する商品として再配布・再販売することは許可していません。

利用条件は今後変更される可能性があります。販売版には、別途 LICENSE_OR_TERMS.md を同梱します。

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

## v0.2 Public Demo / GitHub Pages 修正内容

- 分割した `src/engine/notes/` と `src/engine/ui/` を GitHub Pages 配置物に含めます。
- `compiled/main.js` から `../src/engine/notes/PlaytestNoteManager.js` を import します。
- `index.html` 側に起動失敗表示を追加し、ES module読み込み失敗時に黒画面＋操作ボタンだけで止まらないようにしました。
- `?debug=1` で以下を表示します。

```text
buildId
main.js loaded
notes module loaded
ui module loaded
content pack loaded
Game.start called
```

## 実装済み

- v0.1最小ゲームプレイ
- Content Pack読み込み
- Validatorエラー画面
- Safari会話終了停止バグ修正
- v0.2 気づきメモ / AI相談メモ機能
- 気づきメモ機能の責務分離
- GitHub Pages 配置用の分割モジュール同梱
- 起動失敗表示

## 実行済み

このパッケージ作成時に実行した確認は以下です。

```text
node --check compiled/main.js
node --check src/engine/notes/*.js
node --check src/engine/ui/*.js
```

## 未確認

このパッケージ作成時点では、以下は未確認です。

- macOS Safari 実機確認
- iPhone Safari 実機確認
- PC幅ブラウザでの実操作確認
- GitHub Pages 配置後の実URL確認
- GitHub Pages上の分割モジュール直接URL確認
- Node版Playwright
- GitHub Actions / CI
- Chrome / Edge 実機確認
- git status 確認

## 後続課題

- private販売版 Starter Kit の作成
- 有料版専用素材の作成・管理
- 素材台帳の整備
- LICENSE_OR_TERMS.md 正式版の作成
- BOOTH等の販売ページ作成
- v0.3 Patch貼り付け・検証・反映・ロールバック
- Node版Playwright / CI 整備

## 販売準備草案の扱い

販売版利用規約、Starter Kit内容案、素材台帳、販売準備ロードマップは **private販売版または内部開発版で管理** します。

public版には以下の販売準備草案を含めません。

- `LICENSE_OR_TERMS_DRAFT.md`
- `STARTER_KIT_CONTENTS_DRAFT.md`
- `ASSET_INVENTORY_TEMPLATE.md`
- `SALES_PREPARATION_ROADMAP.md`

`.gitignore` では、これらの草案ファイル、販売版・有料素材・内部開発物・販売用zipを除外する指定を維持しています。

---

## Local Starter Kit UI build

Current buildId:

```text
20260503_local_starter_layout_fix_01
```

## URLモード方針

Public Demoの通常URLは、購入前ユーザーにも分かりやすいように **プレイ専用デモ** を表示します。PC幅でも、パラメータなしでは制作UIを表示しません。

```text
通常デモ:
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html

制作UIプレビュー:
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?mode=editor

プレイ専用:
https://kotatsu-neco.github.io/ai-scenario-rpg-engine/index.html?mode=play
```

互換パラメータ:

```text
?local=1  → ローカル制作UI
?play=1   → プレイ専用
```

スマホ幅では、`?mode=editor` または `?local=1` を付けてもプレイ専用表示へフォールバックします。

制作UIは販売版Starter Kitに向けた開発中の画面プレビューです。public版では一部機能が制限されます。

## 制作UIプレビューに含まれるもの

- AI受け渡し補助
- スマホ縦画面ライブプレビュー
- 編集領域
- 3主領域の配置プリセット
- 気づきメモのフローティングウィンドウ
- AI相談文コピー

## 今回の構造整理

- `LocalStarterApp.js` は初期化、各モジュール生成、Game Runtime接続、状態仲介、debug集約に限定する方向へ整理しました。
- レイアウト管理は `src/engine/layout/LayoutManager.js` / `LayoutStorage.js` へ分離しました。
- AI受け渡し補助は `src/engine/ai-handoff/AiHandoffPanel.js` / `AiHandoffPromptBuilder.js` へ分離しました。
- 気づきメモのフローティングUIは `src/engine/notes/PlaytestNoteFloatingWindow.js` へ分離しました。
- フローティングウィンドウ管理は `src/engine/ui/FloatingWindowManager.js` へ分離しました。
- 会話・イベント編集試作UIは `src/engine/editor/DialogueEditorPanel.js` / `EventEditorPanel.js` へ分離しました。
- CSS正本は `src/styles/` に統一しました。`src/` 直下の重複CSSは削除済みです。

## 制作UIプレビューに含めないもの

- 内蔵AI
- AI API連携
- APIキー保存
- Patch貼り付け
- Patch検証
- Patch反映
- Patchロールバック
- 本格的な書き出し
- ローカルHTTPサーバー起動スクリプト

## ライブプレビュー停止表示について

現時点では、ゲームループの完全なpause/resumeは未実装です。UI文言は誤解を避けるため、`プレビュー表示を一時停止（試作）` に変更しています。これは表示状態の切り替えであり、イベント進行、タイマー、音声の完全停止ではありません。
