import { PLAYTEST_NOTE_CATEGORIES, PLAYTEST_NOTE_PRIORITIES, PLAYTEST_NOTE_STATUSES, escapeHtml, labelFor } from '../notes/PlaytestNoteTypes.js';

export class PlaytestNoteList {
  constructor(listEl, statusEl, onSelect) {
    this.listEl = listEl;
    this.statusEl = statusEl;
    this.onSelect = onSelect;
  }

  render(notes, selectedNoteId) {
    if (!this.listEl) return;
    if (notes.length === 0) {
      this.listEl.innerHTML = '<p class="playtest-note-empty">メモはまだありません。</p>';
      return;
    }

    this.listEl.innerHTML = notes.slice().reverse().map(note => {
      const categoryLabel = labelFor(PLAYTEST_NOTE_CATEGORIES, note.category);
      const priorityLabel = labelFor(PLAYTEST_NOTE_PRIORITIES, note.priority);
      const statusLabel = labelFor(PLAYTEST_NOTE_STATUSES, note.status);
      const active = note.noteId === selectedNoteId ? ' is-selected' : '';
      return `<button class="playtest-note-list-item${active}" type="button" data-note-id="${note.noteId}">
        <strong>${escapeHtml(note.userMemo.slice(0, 48))}${note.userMemo.length > 48 ? '…' : ''}</strong>
        <span>${categoryLabel} / ${priorityLabel} / ${statusLabel}</span>
        <small>${note.createdAt}</small>
      </button>`;
    }).join('');

    this.listEl.querySelectorAll('[data-note-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const noteId = btn.getAttribute('data-note-id');
        if (typeof this.onSelect === 'function') this.onSelect(noteId);
      });
    });
  }
}
