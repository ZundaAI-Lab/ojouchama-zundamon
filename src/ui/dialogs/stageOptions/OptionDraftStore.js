/**
 * 責務: ステージ内オプションで編集する一時設定と保存処理を管理する。
 * 更新ルール: 各ページControllerはDOM操作だけを持ち、BGM/SE音量を含む設定値の正規化・保存規則はここへ集約する。
 */
import {
  CONFIGURABLE_KEY_ACTIONS,
  DEFAULT_KEY_BINDINGS,
  DEFAULT_TOUCH_CONFIG,
  normalizeKeyBindings,
  normalizeTouchConfig,
} from '../../../config/controlSettings.js';

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function cloneBindings(bindings) {
  return Object.fromEntries(Object.entries(bindings).map(([action, slots]) => [action, [...slots]]));
}

export class OptionDraftStore {
  constructor(app) {
    this.app = app;
    this.optionSettings = null;
    this.keyBindings = null;
    this.touchControls = null;
  }

  loadOptionSettings() {
    const settings = this.app.save.load().settings;
    this.optionSettings = {
      bgmVolume: settings.bgmVolume,
      sfxVolume: settings.sfxVolume,
      muted: settings.muted,
      difficulty: settings.difficulty,
    };
    return this.optionSettings;
  }

  ensureOptionSettings() {
    return this.optionSettings || this.loadOptionSettings();
  }

  setOptionVolume(key, value) {
    const draft = this.ensureOptionSettings();
    draft[key] = clamp01(value);
    return draft;
  }

  setOptionMuted(value) {
    const draft = this.ensureOptionSettings();
    draft.muted = !!value;
    return draft;
  }

  setOptionDifficulty(value, allowedValues) {
    const draft = this.ensureOptionSettings();
    draft.difficulty = allowedValues.includes(value) ? value : 'normal';
    return draft;
  }

  previewAudioSettings() {
    this.app.audio.applySettings({
      ...this.app.save.load().settings,
      ...this.ensureOptionSettings(),
    });
  }

  saveOptionSettings() {
    const draft = this.ensureOptionSettings();
    return this.app.save.updateSettings({
      bgmVolume: draft.bgmVolume,
      sfxVolume: draft.sfxVolume,
      muted: draft.muted,
      difficulty: draft.difficulty,
    });
  }

  loadKeyBindings() {
    const save = this.app.save.load();
    this.keyBindings = normalizeKeyBindings(save.settings.keyBindings || DEFAULT_KEY_BINDINGS);
    return this.keyBindings;
  }

  setKeyBinding(action, slot, code) {
    const next = cloneBindings(this.keyBindings || this.loadKeyBindings());
    if (!next[action]) next[action] = [null, null];
    if (code) this.removeCodeFromAllActions(next, code);
    next[action][slot] = code;
    this.keyBindings = normalizeKeyBindings(next);
    return this.keyBindings;
  }

  removeCodeFromAllActions(bindings, code) {
    for (const targetAction of CONFIGURABLE_KEY_ACTIONS) {
      bindings[targetAction] = (bindings[targetAction] || [null, null]).map(current => current === code ? null : current);
    }
  }

  resetKeyActionToDefault(action) {
    const next = cloneBindings(this.keyBindings || this.loadKeyBindings());
    const defaults = DEFAULT_KEY_BINDINGS[action] || [null, null];
    for (const code of defaults) {
      if (code) this.removeCodeFromAllActions(next, code);
    }
    next[action] = [...defaults];
    this.keyBindings = normalizeKeyBindings(next);
    return this.keyBindings;
  }

  saveKeyBindings() {
    return this.app.save.updateSettings({ keyBindings: this.keyBindings || this.loadKeyBindings() });
  }

  restoreSavedKeyBindingsToInput() {
    this.app.input.setKeyBindings(this.app.save.load().settings.keyBindings);
  }

  loadTouchControls() {
    const save = this.app.save.load();
    this.touchControls = normalizeTouchConfig(save.settings.touchControls || DEFAULT_TOUCH_CONFIG);
    return this.touchControls;
  }

  setTouchValue(key, value) {
    this.touchControls = normalizeTouchConfig({
      ...(this.touchControls || this.loadTouchControls()),
      [key]: value,
    });
    return this.touchControls;
  }

  setTouchButtonSlot(slotIndex, action) {
    const current = this.touchControls || this.loadTouchControls();
    const buttonSlots = [...current.buttonSlots];
    buttonSlots[slotIndex] = action || null;
    this.touchControls = normalizeTouchConfig({
      ...current,
      buttonSlots,
    });
    return this.touchControls;
  }

  resetTouchControlsToDefault() {
    this.touchControls = normalizeTouchConfig(DEFAULT_TOUCH_CONFIG);
    return this.touchControls;
  }

  saveTouchControls() {
    return this.app.save.updateSettings({ touchControls: this.touchControls || this.loadTouchControls() });
  }
}
