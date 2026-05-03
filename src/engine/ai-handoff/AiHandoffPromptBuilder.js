export class AiHandoffPromptBuilder {
  constructor(options = {}) {
    this.buildId = options.buildId || 'unknown_build';
  }

  setBuildId(buildId) {
    this.buildId = buildId || this.buildId;
  }

  build(context = {}, extraMemo = '') {
    const memo = extraMemo || context.latestMemo || 'ゲーム画面を見ながら気づいた点について相談したい。';
    const validation = context.validation || { errorCount: 0, warningCount: 0 };
    return `# AI相談用メモ

## 相談したいこと
${memo}

## 現在状況
- buildId: ${this.buildId}
- packId: ${context.packId || 'unknown_pack'}
- packVersion: ${context.packVersion || '-'}
- currentMapId: ${context.currentMapId || '-'}
- playerPosition: ${context.playerPosition || '-'}
- selectedId: ${context.selectedId || '-'}
- selectedEventId: ${context.selectedEventId || '-'}
- selectedDialogueId: ${context.selectedDialogueId || '-'}
- lastEventId: ${context.lastEventId || '-'}
- lastDialogueId: ${context.lastDialogueId || '-'}
- validation.errorCount: ${validation.errorCount ?? 0}
- validation.warningCount: ${validation.warningCount ?? 0}

## 現在のセリフまたはイベント内容
編集領域の試作欄、またはContent Pack内の該当IDを参照してください。

## 求める出力
- 既存IDを変えないでください。
- コードは書かないでください。
- Content Pack Patchとして提案してください。
- 変更理由、影響範囲、確認項目を併記してください。
`;
  }
}
