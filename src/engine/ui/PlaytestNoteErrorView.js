export class PlaytestNoteErrorView {
  constructor(messageEl) {
    this.messageEl = messageEl;
  }

  setMessage(message, type = 'info') {
    if (!this.messageEl) return;
    this.messageEl.textContent = message;
    this.messageEl.dataset.type = type;
  }
}
