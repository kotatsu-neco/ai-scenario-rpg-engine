export class DialogueEditorPanel {
  constructor() {
    this.refs = {};
  }

  render() {
    return `
      <div id="local-editor-dialogue" class="local-editor-panel">
        <label class="local-field">会話ID<input id="local-dialogue-id" type="text" readonly value="取得待ち"></label>
        <label class="local-field">話者名<input id="local-dialogue-speaker" type="text" value="村長"></label>
        <label class="local-field">メッセージ本文<textarea id="local-dialogue-message" rows="7">現在選択中の会話を確認するための試作欄です。保存は後続実装です。</textarea></label>
        <label class="local-field">条件<textarea id="local-dialogue-condition" rows="3">条件確認欄です。編集反映は後続実装です。</textarea></label>
        <label class="local-field">分岐<textarea id="local-dialogue-branch" rows="3">分岐確認欄です。編集反映は後続実装です。</textarea></label>
        <div class="local-editor-meta"><span id="local-dialogue-count">0文字</span><span>関連イベントID: <strong id="local-related-event-id">-</strong></span></div>
        <div class="local-button-row"><button type="button" disabled>試作保存（後続実装）</button><button type="button" disabled>削除（後続実装）</button></div>
      </div>
    `;
  }

  bind(root) {
    this.refs = {
      panel: root.querySelector('#local-editor-dialogue'),
      dialogueId: root.querySelector('#local-dialogue-id'),
      dialogueSpeaker: root.querySelector('#local-dialogue-speaker'),
      dialogueMessage: root.querySelector('#local-dialogue-message'),
      dialogueCount: root.querySelector('#local-dialogue-count'),
      relatedEventId: root.querySelector('#local-related-event-id'),
    };
    this.refs.dialogueMessage?.addEventListener('input', () => this.updateTextCount());
    this.updateTextCount();
  }

  setHidden(hidden) {
    if (this.refs.panel) this.refs.panel.hidden = hidden;
  }

  update(context = {}) {
    if (this.refs.dialogueId) this.refs.dialogueId.value = context.selectedDialogueId || '-';
    if (this.refs.relatedEventId) this.refs.relatedEventId.textContent = context.selectedEventId || '-';
    this.updateTextCount();
  }

  updateTextCount() {
    if (!this.refs.dialogueMessage || !this.refs.dialogueCount) return;
    const count = this.refs.dialogueMessage.value.length;
    this.refs.dialogueCount.textContent = `${count}文字${count > 80 ? ' / 長めです' : ''}`;
    this.refs.dialogueCount.dataset.warning = count > 80 ? 'true' : 'false';
  }
}
