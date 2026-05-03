export class AiConsultationMarkdownExporter {
  exportNote(note) {
    if (!note) {
      return { ok: false, message: 'AI相談用に出力するメモがありません。', markdown: '' };
    }

    const ctx = note.currentContext || {};
    const player = ctx.player || {};
    const related = note.relatedData || {};

    const markdown = `# AI相談メモ

## 相談内容

${note.userMemo}

## メモ情報

- noteId: ${note.noteId}
- createdAt: ${note.createdAt}
- category: ${note.category}
- priority: ${note.priority}
- status: ${note.status}

## 現在状況

- packId: ${ctx.packId ?? 'null'}
- packVersion: ${ctx.packVersion ?? 'null'}
- currentMapId: ${ctx.currentMapId ?? 'null'}
- currentGameState: ${ctx.currentGameState ?? 'null'}
- player: x=${player.x ?? 'null'}, y=${player.y ?? 'null'}, facing=${player.facing ?? 'null'}
- nearbyActorId: ${ctx.nearbyActorId ?? 'null'}
- nearbyInteractableId: ${ctx.nearbyInteractableId ?? 'null'}
- lastEventId: ${ctx.lastEventId ?? 'null'}
- lastDialogueId: ${ctx.lastDialogueId ?? 'null'}
- activeQuestIds: ${(ctx.activeQuestIds || []).join(', ') || 'なし'}
- validation.errorCount: ${ctx.validation?.errorCount ?? 0}
- validation.warningCount: ${ctx.validation?.warningCount ?? 0}

## 関連ID

- actors: ${(related.actors || []).join(', ') || 'なし'}
- events: ${(related.events || []).join(', ') || 'なし'}
- dialogues: ${(related.dialogues || []).join(', ') || 'なし'}
- quests: ${(related.quests || []).join(', ') || 'なし'}

## 依頼

既存IDは変えず、Content Pack Patchとして修正案を出してください。
コードは書かないでください。
`;

    return { ok: true, message: 'AI相談用Markdownを生成しました。必要に応じてコピーしてください。', markdown };
  }
}
