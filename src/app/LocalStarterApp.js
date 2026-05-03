import { LayoutManager, LAYOUT_PRESETS } from '../engine/layout/LayoutManager.js';
import { LayoutStorage } from '../engine/layout/LayoutStorage.js';
import { AiHandoffPanel } from '../engine/ai-handoff/AiHandoffPanel.js';
import { AiHandoffPromptBuilder } from '../engine/ai-handoff/AiHandoffPromptBuilder.js';
import { PlaytestNoteFloatingWindow } from '../engine/notes/PlaytestNoteFloatingWindow.js';
import { FloatingWindowManager } from '../engine/ui/FloatingWindowManager.js';
import { DialogueEditorPanel } from '../engine/editor/DialogueEditorPanel.js';
import { EventEditorPanel } from '../engine/editor/EventEditorPanel.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[ch]));
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

export class LocalStarterApp {
  constructor(options = {}) {
    this.buildId = options.buildId || 'unknown_build';
    this.desktopQuery = options.desktopQuery || '(min-width: 900px)';
    this.enabled = false;
    this.content = null;
    this.game = null;
    this.validationSummary = { errorCount: 0, warningCount: 0 };
    this.livePreviewStatus = 'running';
    this.notes = [];
    this.selectedNoteId = null;
    this.currentScreen = 'ローカル制作版 Starter Kit';
    this.refs = {};
    this.updateTimer = null;

    this.promptBuilder = new AiHandoffPromptBuilder({ buildId: this.buildId });
    this.layoutStorage = new LayoutStorage();
    this.layoutManager = new LayoutManager({
      storage: this.layoutStorage,
      onChange: () => this.updateAll(),
    });
    this.aiHandoffPanel = new AiHandoffPanel({ promptBuilder: this.promptBuilder });
    this.floatingWindowManager = new FloatingWindowManager();
    this.dialogueEditorPanel = new DialogueEditorPanel();
    this.eventEditorPanel = new EventEditorPanel();
    this.noteWindow = new PlaytestNoteFloatingWindow({
      promptBuilder: this.promptBuilder,
      floatingWindowManager: this.floatingWindowManager,
      contextProvider: () => this.buildContext(),
      existingCountProvider: () => this.notes.length,
      onPreviewChange: (_text, memo) => this.aiHandoffPanel.updatePrompt(this.buildContext(), memo),
      onCopyPrompt: text => this.copyTextToClipboard(text),
      onSave: note => this.handleNoteSave(note),
    });
  }

  shouldEnable() {
    try {
      const params = new URLSearchParams(window.location.search);
      const mode = (params.get('mode') || '').toLowerCase();
      if (mode === 'play' || params.get('play') === '1') return false;
      if (params.get('local') === '0') return false;
      const requestedEditor = mode === 'editor' || params.get('local') === '1';
      if (!requestedEditor) return false;
      return Boolean(window.matchMedia && window.matchMedia(this.desktopQuery).matches);
    } catch (_) {
      return false;
    }
  }

  setup(content, validationSummary = { errorCount: 0, warningCount: 0 }) {
    this.content = content || null;
    this.validationSummary = validationSummary;
    this.enabled = this.shouldEnable();
    window.aiRpgLocalStarter = this;
    if (!this.enabled) return this;

    document.body.classList.add('local-starter-enabled');
    this.layoutManager.loadPreset();
    this.notes = this.loadNotes();
    this.selectedNoteId = this.notes[this.notes.length - 1]?.noteId || null;
    this.mountShell();
    this.layoutManager.applyPreset(this.layoutManager.currentPreset, { save: false });
    this.updateAll();
    return this;
  }

  attachGame(game) {
    this.game = game || null;
    if (!this.enabled) return;
    this.updateAll();
    if (this.updateTimer) window.clearInterval(this.updateTimer);
    this.updateTimer = window.setInterval(() => this.updateAll(), 500);
  }

  mountShell() {
    if (document.getElementById('local-starter-shell')) return;
    const originalApp = document.getElementById('app');
    if (!originalApp || !document.body) return;

    const shell = document.createElement('div');
    shell.id = 'local-starter-shell';
    shell.className = 'local-starter-shell';
    shell.innerHTML = this.renderShellHtml();

    document.body.insertBefore(shell, originalApp);
    const previewMount = shell.querySelector('#local-preview-mount');
    previewMount?.appendChild(originalApp);

    this.refs = {
      shell,
      workspace: shell.querySelector('#local-workspace'),
      projectName: shell.querySelector('#local-project-name'),
      currentScreen: shell.querySelector('#local-current-screen'),
      previewToggle: shell.querySelector('#local-preview-toggle'),
      previewStatus: shell.querySelector('#local-preview-status'),
      previewPaused: shell.querySelector('#local-preview-paused'),
      mapLabel: shell.querySelector('#local-map-label'),
      eventLabel: shell.querySelector('#local-event-label'),
      statusMap: shell.querySelector('#local-status-map'),
      statusSelected: shell.querySelector('#local-status-selected'),
      debugPanel: shell.querySelector('#local-debug-panel'),
    };

    this.layoutManager.bind({
      workspace: this.refs.workspace,
      layoutSelect: shell.querySelector('#local-layout-select'),
      messageEl: shell.querySelector('#local-layout-message'),
    });
    this.aiHandoffPanel.bind(shell, {
      onNewNote: () => this.openFloatingNote({ reset: true }),
      onOpenNote: () => this.openFloatingNote({ reset: false }),
      onCopyPrompt: () => this.copyAiPrompt(),
    });
    this.dialogueEditorPanel.bind(shell);
    this.eventEditorPanel.bind(shell);
    this.refs.previewToggle?.addEventListener('click', () => this.togglePreviewStatus());
    shell.querySelectorAll('[data-editor-tab]').forEach(button => {
      button.addEventListener('click', () => this.switchEditorTab(button.getAttribute('data-editor-tab')));
    });
  }

  renderShellHtml() {
    return `
      <header class="local-topbar">
        <div class="local-topbar__brand">
          <span class="local-topbar__app-name">AI RPG Starter Kit</span>
          <span class="local-topbar__mode">制作UIプレビュー</span>
        </div>
        <div class="local-topbar__meta">
          <span>プロジェクト: <strong id="local-project-name">${escapeHtml(this.getProjectName())}</strong></span>
          <span>画面: <strong id="local-current-screen">${escapeHtml(this.currentScreen)}</strong></span>
        </div>
        <div class="local-topbar__actions">
          <button id="local-preview-toggle" type="button" title="現在は表示状態の切り替えのみです。ゲームループの完全な一時停止は後続実装です。">プレビュー表示を一時停止（試作）</button>
          <button type="button" disabled title="後続実装">書き出し</button>
          <button type="button" disabled title="後続実装">設定</button>
        </div>
      </header>
      <div class="local-layout-bar">
        <label>配置プリセット
          <select id="local-layout-select">
            ${this.layoutManager.getPresetOptionsHtml(escapeHtml)}
          </select>
        </label>
        <span id="local-layout-message" class="local-layout-message" aria-live="polite"></span>
      </div>
      <main id="local-workspace" class="local-workspace" aria-label="ローカル制作版ワークスペース">
        ${this.aiHandoffPanel.render()}
        ${this.renderPreviewPanel()}
        ${this.renderEditorPanel()}
      </main>
      <footer class="local-statusbar">
        <span>保存状態: localStorage</span>
        <span id="local-status-map">現在マップ: -</span>
        <span id="local-status-selected">現在選択ID: -</span>
        <span>ローカル制作UI</span>
      </footer>
      <aside id="local-debug-panel" class="local-debug-panel" hidden></aside>
    `;
  }

  renderPreviewPanel() {
    return `
      <section id="local-panel-preview" class="local-panel local-panel--preview" data-panel="preview">
        <div class="local-panel__header">
          <h2>スマホ縦画面ライブプレビュー</h2>
          <span id="local-preview-status" class="local-chip">実行中</span>
        </div>
        <div class="local-phone-shell" aria-label="スマホ縦画面プレビュー">
          <div class="local-phone-statusbar">
            <span id="local-map-label">map: -</span>
            <span id="local-event-label">event: -</span>
          </div>
          <div id="local-preview-mount" class="local-phone-screen"></div>
          <div id="local-preview-paused" class="local-preview-paused" hidden>
            プレビュー表示を一時停止中（試作）<br>
            <small>現在は表示状態の切り替えのみです。ゲームループの完全な一時停止は後続実装です。</small>
          </div>
        </div>
      </section>
    `;
  }

  renderEditorPanel() {
    return `
      <section id="local-panel-edit" class="local-panel local-panel--edit" data-panel="edit">
        <div class="local-panel__header">
          <h2>編集領域</h2>
          <span class="local-chip">試作</span>
        </div>
        <div class="local-editor-tabs" role="tablist" aria-label="編集対象">
          <button class="is-active" type="button" data-editor-tab="dialogue">会話</button>
          <button type="button" data-editor-tab="event">イベント</button>
        </div>
        ${this.dialogueEditorPanel.render()}
        ${this.eventEditorPanel.render()}
      </section>
    `;
  }

  togglePreviewStatus() {
    this.livePreviewStatus = this.livePreviewStatus === 'running' ? 'display-paused' : 'running';
    const paused = this.livePreviewStatus !== 'running';
    if (this.refs.previewPaused) this.refs.previewPaused.hidden = !paused;
    if (this.refs.previewStatus) this.refs.previewStatus.textContent = paused ? '表示停止（試作）' : '実行中';
    if (this.refs.previewToggle) this.refs.previewToggle.textContent = paused ? 'プレビュー表示を再開' : 'プレビュー表示を一時停止（試作）';
    this.updateDebugPanel();
  }

  switchEditorTab(tabName) {
    this.dialogueEditorPanel.setHidden(tabName !== 'dialogue');
    this.eventEditorPanel.setHidden(tabName !== 'event');
    document.querySelectorAll('[data-editor-tab]').forEach(button => {
      button.classList.toggle('is-active', button.getAttribute('data-editor-tab') === tabName);
    });
  }

  getProjectName() {
    return this.content?.packId || 'sample_minimal_pack';
  }

  buildContext() {
    const game = this.game;
    const player = game?.player || {};
    const mapId = game?.map?.id || this.content?.gameConfig?.startingMapId || '-';
    const currentDialogueId = game?.currentDialogueId || game?.lastDialogueId || '-';
    const currentEventId = game?.activeEventId || game?.lastEventId || '-';
    const selectedId = currentDialogueId !== '-' ? `dialogue:${currentDialogueId}` : currentEventId !== '-' ? `event:${currentEventId}` : `map:${mapId}`;
    return {
      packId: this.content?.packId || 'unknown_pack',
      packVersion: this.content?.packVersion || '-',
      currentMapId: mapId,
      playerPosition: `x=${player.x ?? '-'}, y=${player.y ?? '-'}, facing=${player.facing ?? '-'}`,
      selectedId,
      selectedEventId: currentEventId,
      selectedDialogueId: currentDialogueId,
      lastEventId: game?.lastEventId || '-',
      lastDialogueId: game?.lastDialogueId || '-',
      gameState: game?.dialogueQueue ? 'dialogue' : 'field',
      livePreviewStatus: this.livePreviewStatus,
      validation: this.validationSummary || game?.validationSummary || { errorCount: 0, warningCount: 0 },
    };
  }

  updateAll() {
    if (!this.enabled) return;
    const ctx = this.buildContext();
    const layoutState = this.layoutManager.getState();
    const latestNote = this.notes[this.notes.length - 1] || null;
    if (this.refs.projectName) this.refs.projectName.textContent = this.getProjectName();
    if (this.refs.currentScreen) this.refs.currentScreen.textContent = this.currentScreen;
    if (this.refs.mapLabel) this.refs.mapLabel.textContent = `map: ${ctx.currentMapId}`;
    if (this.refs.eventLabel) this.refs.eventLabel.textContent = `event: ${ctx.selectedEventId}`;
    if (this.refs.statusMap) this.refs.statusMap.textContent = `現在マップ: ${ctx.currentMapId}`;
    if (this.refs.statusSelected) this.refs.statusSelected.textContent = `現在選択ID: ${ctx.selectedId}`;
    this.aiHandoffPanel.update(ctx, latestNote, layoutState);
    this.dialogueEditorPanel.update(ctx);
    this.eventEditorPanel.update(ctx);
    if (this.noteWindow.isOpen()) {
      this.noteWindow.updateContext();
      this.noteWindow.updatePreview();
    }
    this.updateDebugPanel();
  }

  getNotesKey() {
    return `ai_rpg_local_notes:${this.getProjectName()}`;
  }

  loadNotes() {
    const result = safeLocalStorageGet(this.getNotesKey());
    if (!result.ok || !result.value) return [];
    try {
      const parsed = JSON.parse(result.value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  saveNotes() {
    return safeLocalStorageSet(this.getNotesKey(), JSON.stringify(this.notes));
  }

  handleNoteSave(note) {
    this.notes.push(note);
    this.selectedNoteId = note.noteId;
    const result = this.saveNotes();
    if (!result.ok) {
      return { ok: false, message: 'メモ保存に失敗しました。ブラウザの保存領域または設定を確認してください。' };
    }
    this.aiHandoffPanel.update(this.buildContext(), note, this.layoutManager.getState());
    this.aiHandoffPanel.updatePrompt(this.buildContext(), note.userMemo);
    this.updateDebugPanel();
    return { ok: true, note };
  }

  openFloatingNote(options = { reset: false }) {
    this.noteWindow.open(options);
    this.updateDebugPanel();
  }

  async copyTextToClipboard(text) {
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (_) {
        copied = false;
      }
    }
    return copied;
  }

  async copyAiPrompt(promptText = null) {
    const text = promptText || this.aiHandoffPanel.getPromptText(this.buildContext());
    const copied = await this.copyTextToClipboard(text);
    this.aiHandoffPanel.showCopyResult(copied);
    return copied;
  }

  updateDebugPanel() {
    if (!this.refs.debugPanel) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') !== '1') {
      this.refs.debugPanel.hidden = true;
      return;
    }
    const ctx = this.buildContext();
    const order = this.layoutManager.getPanelOrder ? this.layoutManager.getPanelOrder() : LAYOUT_PRESETS[this.layoutManager.currentPreset] || [];
    const aiPosition = ['left', 'center', 'right'][order.indexOf('ai')] || '-';
    const lines = [
      `buildId: ${this.buildId}`,
      `urlMode: ${new URLSearchParams(window.location.search).get('mode') || '-'}`,
      `localStarterEnabled: ${this.enabled}`,
      `layoutPreset: ${this.layoutManager.currentPreset}`,
      `currentScreen: ${this.currentScreen}`,
      `selectedPanelOrder: ${order.join(' | ')}`,
      `currentMapId: ${ctx.currentMapId}`,
      `playerPosition: ${ctx.playerPosition}`,
      `selectedEventId: ${ctx.selectedEventId}`,
      `selectedDialogueId: ${ctx.selectedDialogueId}`,
      `lastEventId: ${ctx.lastEventId}`,
      `lastDialogueId: ${ctx.lastDialogueId}`,
      `livePreviewStatus: ${ctx.livePreviewStatus}`,
      `aiHandoffPanelPosition: ${aiPosition}`,
      `floatingNoteOpen: ${this.noteWindow.isOpen()}`,
      `layoutSaveOk: ${this.layoutManager.getState().lastSaveOk}`,
    ];
    this.refs.debugPanel.hidden = false;
    this.refs.debugPanel.textContent = lines.join('\n');
  }
}
