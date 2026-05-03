window.__AI_RPG_UI_MODULE_LOADED__ = true;
import { optionHtml, PLAYTEST_NOTE_CATEGORIES, PLAYTEST_NOTE_PRIORITIES, PLAYTEST_NOTE_STATUSES } from '../notes/PlaytestNoteTypes.js';

export class PlaytestNotePanel {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.refs = {};
    this.panelVisible = true;
  }

  mount() {
    const existing = document.getElementById('playtest-note-panel');
    if (existing) return this.collectRefs(existing);

    const panel = document.createElement('aside');
    panel.id = 'playtest-note-panel';
    panel.className = 'playtest-note-panel';
    panel.innerHTML = `
      <div class="playtest-note-panel__header">
        <h2>気づきメモ</h2>
        <p>プレイ中の違和感や改善案を外部AIへ相談しやすい形で残します。</p>
      </div>
      <label class="playtest-note-field">気づいたこと
        <textarea id="playtest-note-memo" rows="4" placeholder="例: 村長の2回目の会話が少し淡白。"></textarea>
      </label>
      <div class="playtest-note-grid">
        <label class="playtest-note-field">カテゴリ
          <select id="playtest-note-category">${optionHtml(PLAYTEST_NOTE_CATEGORIES, 'dialogue')}</select>
        </label>
        <label class="playtest-note-field">優先度
          <select id="playtest-note-priority">${optionHtml(PLAYTEST_NOTE_PRIORITIES, 'medium')}</select>
        </label>
      </div>
      <div class="playtest-note-actions">
        <button id="playtest-note-save" type="button">メモを保存</button>
        <button id="playtest-note-copy" type="button">AI相談用にコピー</button>
        <button id="playtest-note-list-toggle" type="button">メモ一覧</button>
      </div>
      <div class="playtest-note-status-row">
        <select id="playtest-note-status">${optionHtml(PLAYTEST_NOTE_STATUSES, 'open')}</select>
        <button id="playtest-note-status-button" type="button">状態を変更</button>
      </div>
      <div id="playtest-note-message" class="playtest-note-message" aria-live="polite"></div>
      <div id="playtest-note-list" class="playtest-note-list" aria-label="メモ一覧"></div>
      <textarea id="playtest-note-markdown" class="playtest-note-markdown" readonly placeholder="AI相談用Markdownがここに表示されます。"></textarea>
    `;
    document.body.appendChild(panel);
    return this.collectRefs(panel);
  }

  collectRefs(panel) {
    this.refs = {
      panel,
      memoEl: panel.querySelector('#playtest-note-memo'),
      categoryEl: panel.querySelector('#playtest-note-category'),
      priorityEl: panel.querySelector('#playtest-note-priority'),
      statusEl: panel.querySelector('#playtest-note-status'),
      messageEl: panel.querySelector('#playtest-note-message'),
      listEl: panel.querySelector('#playtest-note-list'),
      markdownEl: panel.querySelector('#playtest-note-markdown'),
    };

    panel.querySelector('#playtest-note-save')?.addEventListener('click', () => this.callbacks.onSave?.());
    panel.querySelector('#playtest-note-copy')?.addEventListener('click', () => this.callbacks.onCopy?.());
    panel.querySelector('#playtest-note-list-toggle')?.addEventListener('click', () => this.toggleList());
    panel.querySelector('#playtest-note-status-button')?.addEventListener('click', () => this.callbacks.onStatusChange?.());

    return this.refs;
  }

  getInputValues() {
    return {
      userMemo: (this.refs.memoEl?.value || '').trim(),
      category: this.refs.categoryEl?.value || 'dialogue',
      priority: this.refs.priorityEl?.value || 'medium',
      status: this.refs.statusEl?.value || 'open',
    };
  }

  clearMemo() {
    if (this.refs.memoEl) this.refs.memoEl.value = '';
  }

  setStatus(status) {
    if (this.refs.statusEl) this.refs.statusEl.value = status;
  }

  setMarkdown(markdown) {
    if (this.refs.markdownEl) this.refs.markdownEl.value = markdown || '';
  }

  toggleList() {
    this.panelVisible = !this.panelVisible;
    if (this.refs.listEl) this.refs.listEl.style.display = this.panelVisible ? 'block' : 'none';
  }
}
