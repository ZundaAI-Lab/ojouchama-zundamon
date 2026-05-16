/**
 * 責務: キーコンフィグとタッチ操作設定の標準値・表示名・正規化を担当する。
 * 更新ルール: DOM操作や入力状態は持たず、設定データの定義と整形だけに限定する。
 * 更新ルール: 左利き配置時の機能ボタン左右反転は、保存値を壊さず表示・描画用スロット変換として扱う。
 * 更新ルール: タッチ操作の既定配置は6番スロットのポーズを含む。未割り当て扱いへ戻さない。
 */
import { INPUT_ACTIONS } from './inputActions.js';

export const KEY_BINDING_SLOT_COUNT = 2;

export const CONFIGURABLE_KEY_ACTIONS = [
  INPUT_ACTIONS.LEFT,
  INPUT_ACTIONS.RIGHT,
  INPUT_ACTIONS.UP,
  INPUT_ACTIONS.DOWN,
  INPUT_ACTIONS.JUMP,
  INPUT_ACTIONS.MAGIC,
  INPUT_ACTIONS.BOW,
  INPUT_ACTIONS.TEA,
  INPUT_ACTIONS.NANO,
  INPUT_ACTIONS.PAUSE,
];

export const INPUT_ACTION_LABELS = {
  [INPUT_ACTIONS.LEFT]: '左へ移動',
  [INPUT_ACTIONS.RIGHT]: '右へ移動',
  [INPUT_ACTIONS.UP]: '上方向',
  [INPUT_ACTIONS.DOWN]: '下方向',
  [INPUT_ACTIONS.JUMP]: 'ジャンプ',
  [INPUT_ACTIONS.MAGIC]: '豆の魔法',
  [INPUT_ACTIONS.BOW]: 'おじぎ',
  [INPUT_ACTIONS.TEA]: 'お茶',
  [INPUT_ACTIONS.NANO]: 'なのちゃん',
  [INPUT_ACTIONS.PAUSE]: 'ポーズ',
};

export const DEFAULT_KEY_BINDINGS = {
  [INPUT_ACTIONS.LEFT]: ['ArrowLeft', 'KeyA'],
  [INPUT_ACTIONS.RIGHT]: ['ArrowRight', 'KeyD'],
  [INPUT_ACTIONS.UP]: ['ArrowUp', 'KeyW'],
  [INPUT_ACTIONS.DOWN]: ['ArrowDown', 'KeyS'],
  [INPUT_ACTIONS.JUMP]: ['KeyX', 'Space'],
  [INPUT_ACTIONS.MAGIC]: ['KeyZ', 'KeyJ'],
  [INPUT_ACTIONS.BOW]: ['KeyC', 'KeyK'],
  [INPUT_ACTIONS.TEA]: ['KeyV', 'KeyL'],
  [INPUT_ACTIONS.NANO]: ['ShiftLeft', 'KeyH'],
  [INPUT_ACTIONS.PAUSE]: ['KeyP', null],
};

export const TOUCH_BUTTON_SLOT_COUNT = 10;
export const TOUCH_BUTTON_SLOT_COLUMNS = 5;
export const TOUCH_BUTTON_SLOT_MIRROR_INDEXES = [4, 3, 2, 1, 0, 9, 8, 7, 6, 5];

export const TOUCH_BUTTON_ACTIONS = [
  INPUT_ACTIONS.PAUSE,
  INPUT_ACTIONS.TEA,
  INPUT_ACTIONS.NANO,
  INPUT_ACTIONS.BOW,
  INPUT_ACTIONS.MAGIC,
  INPUT_ACTIONS.JUMP,
];

export const TOUCH_BUTTON_ACTION_LABELS = {
  [INPUT_ACTIONS.PAUSE]: 'Ⅱ',
  [INPUT_ACTIONS.TEA]: '茶',
  [INPUT_ACTIONS.NANO]: 'なの',
  [INPUT_ACTIONS.BOW]: '礼',
  [INPUT_ACTIONS.MAGIC]: '魔法',
  [INPUT_ACTIONS.JUMP]: '飛',
};

export const DEFAULT_TOUCH_BUTTON_SLOTS = [
  null,
  null,
  null,
  INPUT_ACTIONS.TEA,
  INPUT_ACTIONS.NANO,
  INPUT_ACTIONS.PAUSE,
  null,
  INPUT_ACTIONS.BOW,
  INPUT_ACTIONS.MAGIC,
  INPUT_ACTIONS.JUMP,
];

export const DEFAULT_TOUCH_CONFIG = {
  enabled: true,
  layout: 'rightHanded',
  padSize: 134,
  deadZone: 16,
  buttonSize: 68,
  opacity: 0.82,
  buttonSlots: DEFAULT_TOUCH_BUTTON_SLOTS,
};

export const KEY_DISPLAY_NAMES = {
  ArrowLeft: '←',
  ArrowRight: '→',
  ArrowUp: '↑',
  ArrowDown: '↓',
  Space: 'Space',
  Enter: 'Enter',
  Escape: 'Esc',
  Backspace: 'Backspace',
  Delete: 'Delete',
  MouseLeft: '左クリック',
  MouseRight: '右クリック',
  MouseMiddle: 'ホイールクリック',
  MouseWheel: 'ホイール',
  ShiftLeft: '左Shift',
  ShiftRight: '右Shift',
  ControlLeft: '左Ctrl',
  ControlRight: '右Ctrl',
  AltLeft: '左Alt',
  AltRight: '右Alt',
  Tab: 'Tab',
};

function cloneBindingList(list) {
  const source = Array.isArray(list) ? list : [];
  const result = [];
  const used = new Set();
  for (let i = 0; i < KEY_BINDING_SLOT_COUNT; i += 1) {
    const code = typeof source[i] === 'string' && source[i] ? source[i] : null;
    if (code && !used.has(code)) {
      result.push(code);
      used.add(code);
    } else {
      result.push(null);
    }
  }
  return result;
}

export function normalizeKeyBindings(bindings = {}) {
  const normalized = {};
  const used = new Set();
  for (const action of CONFIGURABLE_KEY_ACTIONS) {
    const fallback = DEFAULT_KEY_BINDINGS[action] || [];
    const source = Object.prototype.hasOwnProperty.call(bindings, action) ? bindings[action] : fallback;
    const slots = cloneBindingList(source);
    normalized[action] = slots.map(code => {
      if (!code) return null;
      if (used.has(code)) return null;
      used.add(code);
      return code;
    });
  }
  return normalized;
}


export function normalizeTouchButtonSlots(slots = DEFAULT_TOUCH_BUTTON_SLOTS) {
  const source = Array.isArray(slots) ? slots : DEFAULT_TOUCH_BUTTON_SLOTS;
  return Array.from({ length: TOUCH_BUTTON_SLOT_COUNT }, (_, index) => {
    const action = source[index];
    return TOUCH_BUTTON_ACTIONS.includes(action) ? action : null;
  });
}

export function getTouchButtonSlotSourceIndexForLayout(layout, visualSlotIndex) {
  const index = Number(visualSlotIndex);
  if (!Number.isInteger(index) || index < 0 || index >= TOUCH_BUTTON_SLOT_COUNT) return -1;
  return layout === 'leftHanded' ? TOUCH_BUTTON_SLOT_MIRROR_INDEXES[index] : index;
}

export function getTouchButtonSlotsForLayout(slots = DEFAULT_TOUCH_BUTTON_SLOTS, layout = 'rightHanded') {
  const source = normalizeTouchButtonSlots(slots);
  return source.map((_, index) => {
    const sourceIndex = getTouchButtonSlotSourceIndexForLayout(layout, index);
    return source[sourceIndex] || null;
  });
}

export function normalizeTouchConfig(config = {}) {
  const source = config || {};
  return {
    enabled: source.enabled !== undefined ? !!source.enabled : DEFAULT_TOUCH_CONFIG.enabled,
    layout: source.layout === 'leftHanded' ? 'leftHanded' : 'rightHanded',
    padSize: clampNumber(source.padSize, 96, 170, DEFAULT_TOUCH_CONFIG.padSize),
    deadZone: clampNumber(source.deadZone, 6, 40, DEFAULT_TOUCH_CONFIG.deadZone),
    buttonSize: clampNumber(source.buttonSize, 48, 88, DEFAULT_TOUCH_CONFIG.buttonSize),
    opacity: clampNumber(source.opacity, 0.35, 1, DEFAULT_TOUCH_CONFIG.opacity),
    buttonSlots: normalizeTouchButtonSlots(source.buttonSlots),
  };
}

export function getKeyDisplayName(code) {
  if (!code) return '未設定';
  if (KEY_DISPLAY_NAMES[code]) return KEY_DISPLAY_NAMES[code];
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit[0-9]$/.test(code)) return code.slice(5);
  if (/^Numpad[0-9]$/.test(code)) return `テンキー${code.slice(6)}`;
  if (/^F[0-9]{1,2}$/.test(code)) return code;
  return code;
}

export function formatActionBindings(bindings, action) {
  const slots = normalizeKeyBindings(bindings)[action] || [];
  const labels = slots.filter(Boolean).map(getKeyDisplayName);
  return labels.length ? labels.join(' / ') : '未設定';
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}
