function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[ch]));
}

export class AiHandoffPanel {
  constructor(options = {}) {
    this.promptBuilder = options.promptBuilder;
    this.refs = {};
  }

  render() {
    return `
      <section id="local-panel-ai" class="local-panel local-panel--ai" data-panel="ai">
        <div class="local-panel__header">
          <h2>AI受け渡し補助</h2>
          <span id="local-ai-position" class="local-chip">左</span>
        </div>
        <div class="local-panel__body">
          <dl class="local-context-list">
            <div><dt>選択中ID</dt><dd id="local-selected-id">未選択</dd></div>
            <div><dt>現在状態</dt><dd id="local-current-state">取得待ち</dd></div>
            <div><dt>最新メモ</dt><dd id="local-note-summary">まだありません</dd></div>
          </dl>
          <div class="local-button-row">
            <button id="local-note-new" type="button">新規メモ</button>
            <button id="local-note-open" type="button">気づきメモを開く</button>
          </div>
          <label class="local-field">AI相談文プレビュー
            <textarea id="local-ai-prompt" readonly rows="10"></textarea>
          </label>
          <div class="local-button-row">
            <button id="local-ai-copy" type="button">AI相談文をコピー</button>
          </div>
          <label class="local-field">返答メモに貼り付け
            <textarea id="local-ai-response" rows="5" placeholder="外部AIからの返答を一時的に貼り付けます。Patch反映は後続実装です。"></textarea>
          </label>
          <p id="local-ai-message" class="local-inline-message" aria-live="polite"></p>
        </div>
      </section>
    `;
  }

  bind(root, handlers = {}) {
    this.refs = {
      aiPosition: root.querySelector('#local-ai-position'),
      selectedId: root.querySelector('#local-selected-id'),
      currentState: root.querySelector('#local-current-state'),
      noteSummary: root.querySelector('#local-note-summary'),
      noteNew: root.querySelector('#local-note-new'),
      noteOpen: root.querySelector('#local-note-open'),
      aiPrompt: root.querySelector('#local-ai-prompt'),
      aiCopy: root.querySelector('#local-ai-copy'),
      aiMessage: root.querySelector('#local-ai-message'),
    };
    this.refs.noteNew?.addEventListener('click', () => handlers.onNewNote?.());
    this.refs.noteOpen?.addEventListener('click', () => handlers.onOpenNote?.());
    this.refs.aiCopy?.addEventListener('click', () => handlers.onCopyPrompt?.());
  }

  update(context = {}, latestNote = null, layoutState = {}) {
    if (this.refs.aiPosition) this.refs.aiPosition.textContent = layoutState.aiPosition || '-';
    if (this.refs.selectedId) this.refs.selectedId.textContent = context.selectedId || '未選択';
    if (this.refs.currentState) {
      this.refs.currentState.textContent = `${context.currentMapId || '-'} / ${context.gameState || '-'} / ${context.playerPosition || '-'}`;
    }
    if (this.refs.noteSummary) {
      if (!latestNote) {
        this.refs.noteSummary.textContent = 'まだありません';
      } else {
        const label = `${latestNote.categoryLabel || latestNote.category} / ${latestNote.priorityLabel || latestNote.priority}`;
        const memo = latestNote.userMemo || '';
        this.refs.noteSummary.textContent = `${label}: ${memo.slice(0, 48)}${memo.length > 48 ? '…' : ''}`;
      }
    }
    this.updatePrompt(context, latestNote?.userMemo || '');
  }

  updatePrompt(context = {}, extraMemo = '') {
    if (!this.refs.aiPrompt || !this.promptBuilder) return;
    this.refs.aiPrompt.value = this.promptBuilder.build(context, extraMemo);
  }

  getPromptText(context = {}) {
    return this.refs.aiPrompt?.value || this.promptBuilder?.build(context) || '';
  }

  showCopyResult(ok) {
    if (!this.refs.aiMessage) return;
    this.refs.aiMessage.textContent = ok ? 'AI相談文をコピーしました。' : 'コピーできない場合は、プレビュー欄から手動でコピーしてください。';
    this.refs.aiMessage.dataset.type = ok ? 'success' : 'warning';
  }
}
