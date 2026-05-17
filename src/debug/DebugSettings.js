/**
 * 責務: URLで有効化されるデバッグ設定の保持と永続化を担当する。
 * 更新ルール: 通常プレイへ影響しないよう、?debug=1 がない場合は全デバッグ効果を無効として返す。
 */
const DEBUG_QUERY_KEY = 'debug';
const DEBUG_QUERY_VALUE = '1';
const DEBUG_STORAGE_KEY = 'ojouchama_zundamon_debug_settings_v1';

const DEFAULT_DEBUG_FLAGS = Object.freeze({
  bossDirectMode: false,
  infiniteHp: false,
  showHitboxes: false,
  showPerformance: false,
  capturePerformanceReport: false,
});

function hasDebugQuery() {
  try {
    return new URLSearchParams(window.location.search).get(DEBUG_QUERY_KEY) === DEBUG_QUERY_VALUE;
  } catch (_) {
    return false;
  }
}

function loadStoredFlags() {
  try {
    const raw = window.localStorage?.getItem(DEBUG_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

function saveStoredFlags(flags) {
  try {
    window.localStorage?.setItem(DEBUG_STORAGE_KEY, JSON.stringify(flags));
  } catch (_) {
    // デバッグ補助なので保存失敗は無視する。
  }
}

export class DebugSettings {
  constructor() {
    this.enabled = hasDebugQuery();
    this.flags = {
      ...DEFAULT_DEBUG_FLAGS,
      ...loadStoredFlags(),
    };
  }

  isEnabled() {
    return this.enabled;
  }

  get(key) {
    if (!this.enabled) return false;
    return !!this.flags[key];
  }

  set(key, value) {
    if (!(key in DEFAULT_DEBUG_FLAGS)) return;
    this.flags[key] = !!value;
    saveStoredFlags(this.flags);
  }

  toggle(key) {
    this.set(key, !this.get(key));
  }

  snapshot() {
    return { ...this.flags };
  }
}
