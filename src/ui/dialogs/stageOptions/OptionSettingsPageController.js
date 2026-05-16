/**
 * 責務: ステージ内オプションのBGM/SE音量・ミュート・難易度ページを制御する。
 * 更新ルール: ページDOMとMenuNavigator接続だけを担当し、保存規則はOptionDraftStoreへ委譲する。
 * 更新ルール: HUD外観の一時反映はOptionDraftStoreへ委譲し、このControllerは入力同期だけを扱う。
 */
import { DIFFICULTY_DEFS } from '../../../config/difficultyDefs.js';
import { getAdjacentHudPanelColor, getHudPanelColorLabel } from '../../../config/hudSettings.js';
import { MenuNavigator } from '../../MenuNavigator.js';
import { OptionView } from '../../views/OptionView.js';

const DIFFICULTY_ORDER = ['fluffy', 'normal', 'royal'];

export class OptionSettingsPageController {
  constructor(dialog) {
    this.dialog = dialog;
    this.app = dialog.app;
    this.menu = null;
  }

  open({ reloadFromSave = false } = {}) {
    if (!this.dialog.drafts.optionSettings || reloadFromSave) this.dialog.drafts.loadOptionSettings();

    const view = new OptionView(this.app);
    this.dialog.setPageRoot(view.render(this.dialog.drafts.optionSettings));

    this.bgmInput = this.dialog.root.querySelector('#bgm');
    this.sfxInput = this.dialog.root.querySelector('#sfx');
    this.mutedInput = this.dialog.root.querySelector('#muted');
    this.difficultyInput = this.dialog.root.querySelector('#difficulty');
    this.hudPanelColorInput = this.dialog.root.querySelector('#hud-panel-color');
    this.hudPanelOpacityInput = this.dialog.root.querySelector('#hud-panel-opacity');

    this.bgmInput.addEventListener('input', () => this.setVolume('bgmVolume', Number(this.bgmInput.value)));
    this.sfxInput.addEventListener('input', () => this.setVolume('sfxVolume', Number(this.sfxInput.value)));
    this.mutedInput.addEventListener('change', () => this.setMuted(this.mutedInput.checked));
    this.difficultyInput.addEventListener('change', () => this.setDifficulty(this.difficultyInput.value));
    this.hudPanelColorInput.addEventListener('input', () => this.setHudPanelColor(this.hudPanelColorInput.value));
    this.hudPanelOpacityInput.addEventListener('input', () => this.setHudPanelOpacity(Number(this.hudPanelOpacityInput.value)));

    this.dialog.root.querySelector('#key-config-btn').addEventListener('click', () => this.dialog.openKeyConfigPage());
    this.dialog.root.querySelector('#touch-control-btn').addEventListener('click', () => this.dialog.openTouchControlPage());
    this.dialog.root.querySelector('#save-btn').addEventListener('click', () => this.saveAndClose());
    this.dialog.root.querySelector('#cancel-btn').addEventListener('click', () => this.cancelAndClose());

    this.syncUi();
    this.menu = new MenuNavigator({
      app: this.app,
      root: this.dialog.root,
      selector: '.option-item, button',
      onLeft: item => this.adjustSelectedOption(item, -1),
      onRight: item => this.adjustSelectedOption(item, 1),
      onConfirm: item => this.confirmSelectedOption(item),
      onCancel: () => this.cancelAndClose(),
    });
  }

  get draft() {
    return this.dialog.drafts.optionSettings;
  }

  setVolume(key, value) {
    this.dialog.drafts.setOptionVolume(key, value);
    this.syncUi();
    this.dialog.drafts.previewAudioSettings();
  }

  setMuted(value) {
    this.dialog.drafts.setOptionMuted(value);
    this.syncUi();
    this.dialog.drafts.previewAudioSettings();
  }

  setDifficulty(value) {
    this.dialog.drafts.setOptionDifficulty(value, DIFFICULTY_ORDER);
    this.syncUi();
  }

  setHudPanelColor(value) {
    this.dialog.drafts.setOptionHudPanelColor(value);
    this.syncUi();
    this.dialog.drafts.previewHudSettings();
  }

  setHudPanelOpacity(value) {
    this.dialog.drafts.setOptionHudPanelOpacity(value);
    this.syncUi();
    this.dialog.drafts.previewHudSettings();
  }

  syncUi() {
    if (!this.dialog.root) return;
    this.bgmInput.value = String(this.draft.bgmVolume);
    this.sfxInput.value = String(this.draft.sfxVolume);
    this.mutedInput.checked = this.draft.muted;
    this.difficultyInput.value = this.draft.difficulty;
    this.hudPanelColorInput.value = this.draft.hudPanelColor;
    this.hudPanelOpacityInput.value = String(this.draft.hudPanelOpacity);
    this.dialog.root.querySelector('[data-option-value="bgm"]').textContent = `${Math.round(this.draft.bgmVolume * 100)}%`;
    this.dialog.root.querySelector('[data-option-value="sfx"]').textContent = `${Math.round(this.draft.sfxVolume * 100)}%`;
    this.dialog.root.querySelector('[data-option-value="muted"]').textContent = this.draft.muted ? 'ON' : 'OFF';
    this.dialog.root.querySelector('[data-option-value="difficulty"]').textContent = DIFFICULTY_DEFS[this.draft.difficulty]?.label || 'おでかけ';
    this.dialog.root.querySelector('[data-option-value="hudPanelColor"]').textContent = getHudPanelColorLabel(this.draft.hudPanelColor);
    this.dialog.root.querySelector('[data-option-value="hudPanelOpacity"]').textContent = `${Math.round(this.draft.hudPanelOpacity * 100)}%`;
  }

  adjustSelectedOption(item, direction) {
    const option = item?.dataset?.option;
    if (!option) {
      this.menu?.move(direction);
      return;
    }
    if (option === 'bgm') this.setVolume('bgmVolume', this.draft.bgmVolume + direction * 0.05);
    if (option === 'sfx') this.setVolume('sfxVolume', this.draft.sfxVolume + direction * 0.05);
    if (option === 'muted') this.setMuted(!this.draft.muted);
    if (option === 'difficulty') {
      const current = DIFFICULTY_ORDER.indexOf(this.draft.difficulty);
      const next = (current + direction + DIFFICULTY_ORDER.length) % DIFFICULTY_ORDER.length;
      this.setDifficulty(DIFFICULTY_ORDER[next]);
    }
    if (option === 'hudPanelColor') this.setHudPanelColor(getAdjacentHudPanelColor(this.draft.hudPanelColor, direction));
    if (option === 'hudPanelOpacity') this.setHudPanelOpacity(this.draft.hudPanelOpacity + direction * 0.05);
    this.app.audio.playSfx('ui_decide');
  }

  confirmSelectedOption(item) {
    const option = item?.dataset?.option;
    if (!option) {
      item?.click?.();
      return;
    }
    if (option === 'muted') this.setMuted(!this.draft.muted);
    else this.adjustSelectedOption(item, 1);
    this.app.audio.playSfx('ui_decide');
  }

  cancelAndClose() {
    this.app.audio.applySettings();
    this.dialog.drafts.restoreSavedHudSettings();
    this.dialog.close({ restoreAudio: false });
  }

  saveAndClose() {
    this.dialog.drafts.saveOptionSettings();
    this.dialog.drafts.previewHudSettings();
    this.app.audio.applySettings();
    this.app.audio.playSfx('ui_decide');
    this.dialog.close({ restoreAudio: false });
  }

  update() {
    this.menu?.update();
  }

  destroy() {
    this.menu?.destroy();
    this.menu = null;
  }
}
