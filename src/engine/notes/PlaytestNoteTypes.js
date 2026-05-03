export const PLAYTEST_NOTE_CATEGORIES = [
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

export const PLAYTEST_NOTE_PRIORITIES = [
  ['low', '低'],
  ['medium', '中'],
  ['high', '高'],
  ['pending', '保留'],
];

export const PLAYTEST_NOTE_STATUSES = [
  ['open', '未対応'],
  ['prepared_for_ai', 'AI相談用に整理済み'],
  ['patch_created', 'Patch作成済み'],
  ['closed', '対応済み'],
];

export function formatJstDateTime(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const sec = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}:${sec}`;
}

export function makeNoteId(existingCount, date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const sec = String(date.getSeconds()).padStart(2, '0');
  const suffix = String(existingCount + 1).padStart(3, '0');
  return `note_${y}${m}${day}_${h}${min}${sec}_${suffix}`;
}

export function optionHtml(options, selected) {
  return options.map(([value, label]) => `<option value="${value}"${value === selected ? ' selected' : ''}>${label}</option>`).join('');
}

export function labelFor(options, value) {
  return (options.find(([v]) => v === value) || [value, value])[1];
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
}

/**
 * PlaytestNote data shape:
 * {
 *   noteId: string,
 *   createdAt: string,
 *   category: string,
 *   priority: string,
 *   userMemo: string,
 *   currentContext: {
 *     packId: string|null,
 *     packVersion: string|null,
 *     currentMapId: string|null,
 *     currentGameState: string|null,
 *     player: { x: number|null, y: number|null, facing: string|null },
 *     nearbyActorId: string|null,
 *     nearbyInteractableId: string|null,
 *     lastEventId: string|null,
 *     lastDialogueId: string|null,
 *     activeQuestIds: string[],
 *     validation: { errorCount: number, warningCount: number }
 *   },
 *   relatedData: { actors: string[], events: string[], dialogues: string[], quests: string[] },
 *   status: string
 * }
 */
