export class EventEditorPanel {
  constructor() {
    this.refs = {};
  }

  render() {
    return `
      <div id="local-editor-event" class="local-editor-panel" hidden>
        <label class="local-field">イベントID<input id="local-event-id" type="text" readonly value="取得待ち"></label>
        <label class="local-field">トリガー<input id="local-event-trigger" type="text" value="talk / action / touch"></label>
        <label class="local-field">場所<input id="local-event-place" type="text" value="現在マップ"></label>
        <label class="local-field">関連会話<input id="local-event-dialogue" type="text" readonly value="-"></label>
        <label class="local-field">関連フラグ<textarea id="local-event-flags" rows="3">関連フラグ確認欄です。編集反映は後続実装です。</textarea></label>
        <label class="local-field">条件式<textarea id="local-event-condition" rows="4">条件式確認欄です。編集反映は後続実装です。</textarea></label>
        <label class="local-field">分岐設定<textarea id="local-event-branch" rows="5">分岐設定確認欄です。編集反映は後続実装です。</textarea></label>
        <div class="local-button-row"><button type="button" disabled>試作保存（後続実装）</button><button type="button" disabled>削除（後続実装）</button></div>
      </div>
    `;
  }

  bind(root) {
    this.refs = {
      panel: root.querySelector('#local-editor-event'),
      eventId: root.querySelector('#local-event-id'),
      eventDialogue: root.querySelector('#local-event-dialogue'),
    };
  }

  setHidden(hidden) {
    if (this.refs.panel) this.refs.panel.hidden = hidden;
  }

  update(context = {}) {
    if (this.refs.eventId) this.refs.eventId.value = context.selectedEventId || '-';
    if (this.refs.eventDialogue) this.refs.eventDialogue.value = context.selectedDialogueId || '-';
  }
}
