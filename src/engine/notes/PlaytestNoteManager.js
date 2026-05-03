window.__AI_RPG_NOTES_MODULE_LOADED__ = true;
import { formatJstDateTime, makeNoteId } from './PlaytestNoteTypes.js';
import { PlaytestNoteStorage } from './PlaytestNoteStorage.js';
import { ContextSnapshotBuilder } from './ContextSnapshotBuilder.js';
import { AiConsultationMarkdownExporter } from './AiConsultationMarkdownExporter.js';
import { PlaytestNotePanel } from '../ui/PlaytestNotePanel.js';
import { PlaytestNoteList } from '../ui/PlaytestNoteList.js';
import { PlaytestNoteErrorView } from '../ui/PlaytestNoteErrorView.js';

export class PlaytestNoteManager {
  constructor(game, options = {}) {
    this.game = game;
    this.storage = options.storage || new PlaytestNoteStorage(game.content?.packId, window.localStorage);
    this.contextBuilder = options.contextBuilder || new ContextSnapshotBuilder(game);
    this.markdownExporter = options.markdownExporter || new AiConsultationMarkdownExporter();
    this.notes = [];
    this.selectedNoteId = null;

    this.panel = new PlaytestNotePanel({
      onSave: () => this.saveCurrentNote(),
      onCopy: () => this.copySelectedNoteMarkdown(),
      onStatusChange: () => this.changeSelectedStatus(),
    });
    this.refs = this.panel.mount();
    this.errorView = new PlaytestNoteErrorView(this.refs.messageEl);
    this.noteList = new PlaytestNoteList(this.refs.listEl, this.refs.statusEl, noteId => this.selectNote(noteId));

    this.loadNotes();
    this.renderList();
    this.setMessage('気づきメモを入力できます。', 'info');
  }

  loadNotes() {
    const result = this.storage.load();
    this.notes = result.notes;
    if (!result.ok) this.setMessage(result.message, 'error');
    if (this.notes.length > 0) {
      this.selectedNoteId = this.notes[this.notes.length - 1].noteId;
      this.panel.setStatus(this.getSelectedNote()?.status || 'open');
    }
  }

  persistNotes() {
    const result = this.storage.save(this.notes);
    if (!result.ok) {
      this.setMessage(result.message, 'error');
      return false;
    }
    return true;
  }

  saveCurrentNote() {
    const values = this.panel.getInputValues();
    if (!values.userMemo) {
      this.setMessage('気づいたことを入力してください。', 'error');
      return { ok: false, message: '気づいたことを入力してください。' };
    }

    const context = this.contextBuilder.build();
    const note = {
      noteId: makeNoteId(this.notes.length),
      createdAt: formatJstDateTime(),
      category: values.category,
      priority: values.priority,
      userMemo: values.userMemo,
      currentContext: context,
      relatedData: this.contextBuilder.buildRelatedData(context),
      status: 'open',
    };

    this.notes.push(note);
    this.selectedNoteId = note.noteId;
    if (!this.persistNotes()) return { ok: false, message: 'メモ保存に失敗しました。' };

    this.panel.clearMemo();
    this.panel.setStatus(note.status);
    this.renderList();
    this.setMessage('メモを保存しました。', 'success');
    return { ok: true, note };
  }

  selectNote(noteId) {
    this.selectedNoteId = noteId;
    const note = this.getSelectedNote();
    if (note) this.panel.setStatus(note.status);
    this.renderList();
    this.setMessage('メモを選択しました。', 'info');
  }

  changeSelectedStatus() {
    const note = this.getSelectedNote();
    if (!note) {
      this.setMessage('状態を変更するメモがありません。', 'error');
      return { ok: false, message: '状態を変更するメモがありません。' };
    }

    note.status = this.panel.getInputValues().status;
    if (!this.persistNotes()) return { ok: false, message: 'メモ保存に失敗しました。' };

    this.renderList();
    this.setMessage('メモの状態を変更しました。', 'success');
    return { ok: true, note };
  }

  async copySelectedNoteMarkdown() {
    const note = this.getSelectedNote() || this.notes[this.notes.length - 1] || null;
    const result = this.markdownExporter.exportNote(note);
    if (!result.ok) {
      this.panel.setMarkdown('');
      this.setMessage(result.message, 'error');
      return result;
    }

    this.panel.setMarkdown(result.markdown);
    const done = () => this.setMessage(result.message, 'success');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(result.markdown);
      } catch (_) {
        // Clipboard copy is convenience only. Displaying the Markdown is enough for manual copy.
      }
    }
    done();

    note.status = 'prepared_for_ai';
    this.panel.setStatus(note.status);
    this.persistNotes();
    this.renderList();
    return result;
  }

  renderList() {
    this.noteList.render(this.notes, this.selectedNoteId);
  }

  getSelectedNote() {
    return this.notes.find(note => note.noteId === this.selectedNoteId) || null;
  }

  setMessage(message, type = 'info') {
    this.errorView.setMessage(message, type);
  }
}
