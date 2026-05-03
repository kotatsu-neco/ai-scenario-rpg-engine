const NOTE_DRAFT_STORAGE_KEY = 'ai_rpg_local_note_draft';

const NOTE_CATEGORIES = [
  ['dialogue', '会話'],
  ['event', 'イベント'],
  ['map', 'マップ'],
  ['controls', '操作感'],
  ['battle', '戦闘'],
  ['direction', '演出'],
  ['audio', '音楽・効果音'],
  ['bug', 'バグ'],
  ['asset', '素材'],
  ['other', 'その他'],
];

const NOTE_PRIORITIES = [
  ['low', '低'],
  ['medium', '中'],
  ['high', '高'],
  ['pending', '保留'],
];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[ch]));
}

function optionHtml(options, selected) {
  return options.map(([value, label]) => `<option value="${escapeHtml(value)}"${value === selected ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
}

function safeLocalStorageGet(key) {
  try {
    return { ok: true, value: window.localStorage.getItem(key) };
  } catch (error) {
    return { ok: false, value: null, error };
  }
}

function safeLocalStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

function safeLocalStorageRemove(key) {
  try {
    window.localStorage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

function makeLocalNoteId(existingCount, date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  const suffix = String(existingCount + 1).padStart(3, '0');
  return `local_note_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}_${suffix}`;
}

function formatTimestamp(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export class PlaytestNoteFloatingWindow {
  constructor(options = {}) {
    this.promptBuilder = options.promptBuilder;
    this.floatingWindowManager = options.floatingWindowManager;
    this.onSave = options.onSave || null;
    this.onPreviewChange = options.onPreviewChange || null;
    this.onCopyPrompt = options.onCopyPrompt || null;
    this.contextProvider = options.contextProvider || (() => ({}));
    this.existingCountProvider = options.existingCountProvider || (() => 0);
    this.noteDraft = this.loadDraft();
    this.windowId = 'local-note-window';
    this.element = null;
  }

  open(options = {}) {
    this.ensureElement();
    this.floatingWindowManager?.open(this.windowId, this.element, {
      hasUnsavedChanges: () => this.hasUnsavedChanges(),
    });
    this.element.hidden = false;
    if (options.reset) this.clearDraftFields();
    this.updateContext();
    this.updatePreview();
    window.setTimeout(() => this.element?.querySelector('#local-note-memo')?.focus(), 0);
  }

  close(options = {}) {
    if (this.hasUnsavedChanges()) this.persistDraft();
    const closed = this.floatingWindowManager?.close(this.windowId, options) ?? true;
    if (closed && this.element) this.element.hidden = true;
    return closed;
  }

  isOpen() {
    return Boolean(this.element && !this.element.hidden);
  }

  ensureElement() {
    if (this.element) return this.element;
    const win = document.createElement('aside');
    win.id = this.windowId;
    win.className = 'local-note-window';
    win.innerHTML = `
      <div class="local-note-window__header">
        <h2>気づきメモ</h2>
        <button id="local-note-close" type="button" aria-label="気づきメモを閉じる">×</button>
      </div>
      <dl class="local-context-list local-context-list--compact">
        <div><dt>対象ID</dt><dd id="local-note-target">-</dd></div>
        <div><dt>現在状況</dt><dd id="local-note-context">-</dd></div>
      </dl>
      <div class="local-note-grid">
        <label class="local-field">カテゴリ<select id="local-note-category">${optionHtml(NOTE_CATEGORIES, 'dialogue')}</select></label>
        <label class="local-field">優先度<select id="local-note-priority">${optionHtml(NOTE_PRIORITIES, 'medium')}</select></label>
      </div>
      <label class="local-field">本文<textarea id="local-note-memo" rows="8" placeholder="例: 村長の2回目の会話が少し淡白。"></textarea></label>
      <label class="local-field">AI相談用プレビュー<textarea id="local-note-ai-preview" readonly rows="7"></textarea></label>
      <p id="local-note-message" class="local-inline-message" aria-live="polite"></p>
      <div class="local-button-row local-button-row--end">
        <button id="local-note-save" type="button">保存</button>
        <button id="local-note-copy" type="button">AI相談文をコピー</button>
        <button id="local-note-cancel" type="button">キャンセル</button>
      </div>
    `;
    document.body.appendChild(win);
    this.element = win;
    win.querySelector('#local-note-close')?.addEventListener('click', () => this.close());
    win.querySelector('#local-note-cancel')?.addEventListener('click', () => this.close());
    win.querySelector('#local-note-save')?.addEventListener('click', () => this.save());
    win.querySelector('#local-note-copy')?.addEventListener('click', () => this.copyPrompt());
    win.querySelector('#local-note-memo')?.addEventListener('input', () => this.updatePreview());
    win.querySelector('#local-note-category')?.addEventListener('change', () => this.persistDraft());
    win.querySelector('#local-note-priority')?.addEventListener('change', () => this.persistDraft());
    this.floatingWindowManager?.register(this.windowId, win, {
      hasUnsavedChanges: () => this.hasUnsavedChanges(),
    });
    return win;
  }

  loadDraft() {
    const result = safeLocalStorageGet(NOTE_DRAFT_STORAGE_KEY);
    if (!result.ok || !result.value) return null;
    try {
      return JSON.parse(result.value);
    } catch (_) {
      return null;
    }
  }

  applyDraftToWindow() {
    const draft = this.noteDraft;
    if (!draft || !this.element) return;
    this.element.querySelector('#local-note-memo').value = draft.userMemo || '';
    this.element.querySelector('#local-note-category').value = draft.category || 'dialogue';
    this.element.querySelector('#local-note-priority').value = draft.priority || 'medium';
    this.noteDraft = null;
  }

  persistDraft() {
    if (!this.element) return;
    safeLocalStorageSet(NOTE_DRAFT_STORAGE_KEY, JSON.stringify(this.getValues()));
  }

  clearDraftFields() {
    if (!this.element) return;
    this.element.querySelector('#local-note-memo').value = '';
    this.element.querySelector('#local-note-category').value = 'dialogue';
    this.element.querySelector('#local-note-priority').value = 'medium';
    const message = this.element.querySelector('#local-note-message');
    if (message) message.textContent = '';
    safeLocalStorageRemove(NOTE_DRAFT_STORAGE_KEY);
  }

  getValues() {
    return {
      userMemo: (this.element?.querySelector('#local-note-memo')?.value || '').trim(),
      category: this.element?.querySelector('#local-note-category')?.value || 'dialogue',
      priority: this.element?.querySelector('#local-note-priority')?.value || 'medium',
    };
  }

  hasUnsavedChanges() {
    return Boolean(this.getValues().userMemo);
  }

  updateContext() {
    this.ensureElement();
    this.applyDraftToWindow();
    const ctx = this.contextProvider();
    this.element.querySelector('#local-note-target').textContent = ctx.selectedId || '-';
    this.element.querySelector('#local-note-context').textContent = `${ctx.currentMapId || '-'} / ${ctx.gameState || '-'} / ${ctx.playerPosition || '-'}`;
  }

  updatePreview() {
    this.ensureElement();
    const values = this.getValues();
    const ctx = this.contextProvider();
    const preview = this.element.querySelector('#local-note-ai-preview');
    const text = this.promptBuilder?.build(ctx, values.userMemo) || '';
    if (preview) preview.value = text;
    this.persistDraft();
    this.onPreviewChange?.(text, values.userMemo);
  }

  save() {
    this.ensureElement();
    const messageEl = this.element.querySelector('#local-note-message');
    const values = this.getValues();
    if (!values.userMemo) {
      if (messageEl) {
        messageEl.textContent = '気づいたことを入力してください。';
        messageEl.dataset.type = 'error';
      }
      return { ok: false, message: '気づいたことを入力してください。' };
    }
    const categoryLabel = NOTE_CATEGORIES.find(([value]) => value === values.category)?.[1] || values.category;
    const priorityLabel = NOTE_PRIORITIES.find(([value]) => value === values.priority)?.[1] || values.priority;
    const note = {
      noteId: makeLocalNoteId(this.existingCountProvider()),
      createdAt: formatTimestamp(),
      category: values.category,
      categoryLabel,
      priority: values.priority,
      priorityLabel,
      userMemo: values.userMemo,
      context: this.contextProvider(),
    };
    const result = this.onSave?.(note) || { ok: true };
    if (!result.ok) {
      if (messageEl) {
        messageEl.textContent = result.message || 'メモ保存に失敗しました。ブラウザの保存領域または設定を確認してください。';
        messageEl.dataset.type = 'error';
      }
      return result;
    }
    safeLocalStorageRemove(NOTE_DRAFT_STORAGE_KEY);
    if (messageEl) {
      messageEl.textContent = 'メモを保存しました。';
      messageEl.dataset.type = 'success';
    }
    this.clearDraftFields();
    return { ok: true, note };
  }

  async copyPrompt() {
    const text = this.element?.querySelector('#local-note-ai-preview')?.value || this.promptBuilder?.build(this.contextProvider()) || '';
    const copied = await this.onCopyPrompt?.(text);
    const messageEl = this.element?.querySelector('#local-note-message');
    if (messageEl) {
      messageEl.textContent = copied ? 'AI相談文をコピーしました。' : 'コピーできない場合は、プレビュー欄から手動でコピーしてください。';
      messageEl.dataset.type = copied ? 'success' : 'warning';
    }
    return copied;
  }
}
