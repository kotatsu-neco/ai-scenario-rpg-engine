export class PlaytestNoteStorage {
  constructor(packId, storage = window.localStorage) {
    this.packId = packId || 'unknown_pack';
    this.storage = storage;
    this.storageKey = `ai_rpg_playtest_notes:${this.packId}`;
  }

  load() {
    try {
      const raw = this.storage.getItem(this.storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return { ok: true, notes: Array.isArray(parsed) ? parsed : [] };
    } catch (error) {
      return {
        ok: false,
        notes: [],
        message: 'メモの復元に失敗しました。保存データの形式を確認してください。',
        error,
      };
    }
  }

  save(notes) {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(notes));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: 'メモ保存に失敗しました。ブラウザの保存領域またはプライベートブラウズ設定を確認してください。',
        error,
      };
    }
  }

  clear() {
    try {
      this.storage.removeItem(this.storageKey);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: 'メモの削除に失敗しました。ブラウザの保存領域またはプライベートブラウズ設定を確認してください。',
        error,
      };
    }
  }
}
