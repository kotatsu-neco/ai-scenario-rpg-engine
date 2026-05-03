export const PANEL_LABELS = {
  ai: 'AI受け渡し補助',
  preview: 'ライブプレビュー',
  edit: '編集領域',
};

export const LAYOUT_PRESETS = {
  'ai-preview-edit': ['ai', 'preview', 'edit'],
  'preview-ai-edit': ['preview', 'ai', 'edit'],
  'edit-preview-ai': ['edit', 'preview', 'ai'],
  'ai-edit-preview': ['ai', 'edit', 'preview'],
  'preview-edit-ai': ['preview', 'edit', 'ai'],
  'edit-ai-preview': ['edit', 'ai', 'preview'],
};

const DEFAULT_PRESET = 'ai-preview-edit';

export class LayoutManager {
  constructor(options = {}) {
    this.storage = options.storage || null;
    this.workspace = null;
    this.layoutSelect = null;
    this.messageEl = null;
    this.onChange = options.onChange || null;
    this.currentPreset = DEFAULT_PRESET;
    this.lastSaveResult = { ok: true, message: '' };
  }

  getDefaultPreset() {
    return DEFAULT_PRESET;
  }

  getPresetOptionsHtml(escapeHtml) {
    return Object.entries(LAYOUT_PRESETS)
      .map(([key, order]) => `<option value="${escapeHtml(key)}">${order.map(name => PANEL_LABELS[name]).join(' | ')}</option>`)
      .join('');
  }

  bind({ workspace, layoutSelect, messageEl } = {}) {
    this.workspace = workspace || null;
    this.layoutSelect = layoutSelect || null;
    this.messageEl = messageEl || null;
    if (this.layoutSelect) {
      this.layoutSelect.addEventListener('change', () => {
        this.applyPreset(this.layoutSelect.value, { save: true });
      });
    }
  }

  loadPreset() {
    const result = this.storage?.load(DEFAULT_PRESET) || { ok: true, value: DEFAULT_PRESET };
    const preset = LAYOUT_PRESETS[result.value] ? result.value : DEFAULT_PRESET;
    this.currentPreset = preset;
    this.lastSaveResult = result.ok ? this.lastSaveResult : result;
    return preset;
  }

  applyPreset(presetKey, options = {}) {
    const shouldSave = options.save !== false;
    const preset = LAYOUT_PRESETS[presetKey] ? presetKey : DEFAULT_PRESET;
    this.currentPreset = preset;
    if (this.layoutSelect) this.layoutSelect.value = preset;
    const order = LAYOUT_PRESETS[preset];
    order.forEach((panelName, index) => {
      const panel = this.workspace?.querySelector(`[data-panel="${panelName}"]`) || document.querySelector(`[data-panel="${panelName}"]`);
      if (panel) panel.style.order = String(index + 1);
    });
    if (shouldSave) {
      this.lastSaveResult = this.storage?.save(preset) || { ok: true, message: '' };
      this.showMessage(this.lastSaveResult.message, this.lastSaveResult.ok ? 'success' : 'error');
    }
    if (this.onChange) this.onChange(this.getState());
    return this.getState();
  }

  getPanelOrder() {
    return LAYOUT_PRESETS[this.currentPreset] || LAYOUT_PRESETS[DEFAULT_PRESET];
  }

  getPanelPosition(panelName) {
    const index = this.getPanelOrder().indexOf(panelName);
    return ['左', '中央', '右'][index] || '-';
  }

  getState() {
    return {
      layoutPreset: this.currentPreset,
      panelOrder: this.getPanelOrder(),
      aiPosition: this.getPanelPosition('ai'),
      lastSaveOk: this.lastSaveResult.ok !== false,
      lastSaveMessage: this.lastSaveResult.message || '',
    };
  }

  showMessage(message, type = 'success') {
    if (!this.messageEl) return;
    this.messageEl.textContent = message || '';
    this.messageEl.dataset.type = type;
  }
}
