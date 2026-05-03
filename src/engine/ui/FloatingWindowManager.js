export class FloatingWindowManager {
  constructor(options = {}) {
    this.zIndexBase = options.zIndexBase || 50;
    this.topOffset = options.topOffset || 76;
    this.margin = options.margin || 12;
    this.windows = new Map();
    this.zIndex = this.zIndexBase;
  }

  register(id, element, options = {}) {
    if (!id || !element) return null;
    this.windows.set(id, { element, hasUnsavedChanges: options.hasUnsavedChanges || (() => false) });
    this.keepInsideViewport(element);
    this.bringToFront(id);
    return element;
  }

  open(id, element, options = {}) {
    const target = element || this.windows.get(id)?.element;
    if (!target) return false;
    this.register(id, target, options);
    target.hidden = false;
    this.keepInsideViewport(target);
    this.bringToFront(id);
    return true;
  }

  close(id, options = {}) {
    const entry = this.windows.get(id);
    if (!entry?.element) return true;
    if (!options.force && entry.hasUnsavedChanges?.()) {
      const ok = window.confirm('未保存の入力があります。閉じてもよろしいですか？');
      if (!ok) return false;
    }
    entry.element.hidden = true;
    return true;
  }

  bringToFront(id) {
    const entry = this.windows.get(id);
    if (!entry?.element) return;
    this.zIndex += 1;
    entry.element.style.zIndex = String(this.zIndex);
  }

  keepInsideViewport(element) {
    if (!element || typeof window === 'undefined') return;
    const rect = element.getBoundingClientRect();
    const maxLeft = Math.max(this.margin, window.innerWidth - rect.width - this.margin);
    const maxTop = Math.max(this.topOffset, window.innerHeight - rect.height - this.margin);
    const currentLeft = Number.parseFloat(element.style.left || '') || Math.min(24, maxLeft);
    const currentTop = Number.parseFloat(element.style.top || '') || this.topOffset;
    element.style.left = `${Math.min(Math.max(this.margin, currentLeft), maxLeft)}px`;
    element.style.top = `${Math.min(Math.max(this.topOffset, currentTop), maxTop)}px`;
  }
}
