export const LAYOUT_STORAGE_KEY = 'ai_rpg_local_layout_preset';

export class LayoutStorage {
  constructor(options = {}) {
    this.storageKey = options.storageKey || LAYOUT_STORAGE_KEY;
  }

  load(defaultValue) {
    try {
      const value = window.localStorage.getItem(this.storageKey);
      return { ok: true, value: value || defaultValue };
    } catch (error) {
      return { ok: false, value: defaultValue, error, message: 'レイアウト設定を読み込めませんでした。' };
    }
  }

  save(value) {
    try {
      window.localStorage.setItem(this.storageKey, value);
      return { ok: true, value, message: '配置設定を保存しました。' };
    } catch (error) {
      return { ok: false, value, error, message: 'レイアウト設定を保存できませんでした。' };
    }
  }

  remove() {
    try {
      window.localStorage.removeItem(this.storageKey);
      return { ok: true };
    } catch (error) {
      return { ok: false, error, message: 'レイアウト設定を削除できませんでした。' };
    }
  }
}
