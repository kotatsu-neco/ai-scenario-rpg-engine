export class ContextSnapshotBuilder {
  constructor(game) {
    this.game = game;
  }

  build() {
    const game = this.game;
    const npc = typeof game.getNpcInFront === 'function' ? game.getNpcInFront() : null;
    const activeQuestIds = this.getActiveQuestIds();
    const validation = game.validationSummary || { errorCount: 0, warningCount: 0 };

    return {
      packId: game.content?.packId ?? null,
      packVersion: game.content?.packVersion ?? null,
      currentMapId: game.map?.id ?? null,
      currentGameState: game.dialogueQueue ? 'dialogue' : 'field',
      player: {
        x: game.player?.x ?? null,
        y: game.player?.y ?? null,
        facing: game.player?.facing ?? null,
      },
      nearbyActorId: npc?.id ?? null,
      nearbyInteractableId: null,
      lastEventId: game.activeEventId ?? game.lastEventId ?? null,
      lastDialogueId: game.currentDialogueId ?? game.lastDialogueId ?? null,
      activeQuestIds,
      validation: {
        errorCount: validation.errorCount ?? 0,
        warningCount: validation.warningCount ?? 0,
      },
    };
  }

  getActiveQuestIds() {
    const game = this.game;
    if (game.activeQuestIds && typeof game.activeQuestIds[Symbol.iterator] === 'function') {
      return Array.from(game.activeQuestIds);
    }
    const ids = [];
    if (game.flags?.quest_walk_village === true) {
      ids.push('quest_walk_village');
    }
    return ids;
  }

  buildRelatedData(context) {
    return {
      actors: context.nearbyActorId ? [context.nearbyActorId] : [],
      events: context.lastEventId ? [context.lastEventId] : [],
      dialogues: context.lastDialogueId ? [context.lastDialogueId] : [],
      quests: Array.isArray(context.activeQuestIds) ? context.activeQuestIds : [],
    };
  }
}
