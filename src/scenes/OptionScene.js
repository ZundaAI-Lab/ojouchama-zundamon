/**
 * 責務: オプション設定の入力反映・プレビュー・保存/キャンセル遷移を制御する。
 * 更新ルール: DOM生成は OptionView に任せ、BGM/SE音量を含む設定値の変更規則と保存処理をここで管理する。
 * 更新ルール: 操作設定の編集は KeyConfigScene / TouchControlScene に分離し、この画面は入口ボタンだけを持つ。
 * 更新ルール: 呼び出し元は params.returnSceneId / returnParams で受け取り、SceneクラスではなくScene IDだけで復帰先を扱う。
 * 更新ルール: HUD外観設定はセーブ値へ保存し、プレビュー反映はCSS変数の更新だけで行う。
 */
import { BaseScene } from './BaseScene.js';
import { DIFFICULTY_DEFS } from '../config/difficultyDefs.js';
import { SCENES } from '../config/sceneIds.js';
import { MenuNavigator } from '../ui/MenuNavigator.js';
import { OptionView } from '../ui/views/OptionView.js';
import {
  getAdjacentHudPanelColor,
  getHudPanelColorLabel,
  normalizeHudPanelColor,
  normalizeHudPanelOpacity,
} from '../config/hudSettings.js';
import { applyHudPanelStyle } from '../ui/hudPanelStyle.js';

const DIFFICULTY_ORDER = ['fluffy', 'normal', 'royal'];

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export class OptionScene extends BaseScene {
  async enter() {
    const save = this.app.save.load();
    this.draftSettings = { ...save.settings };
    this.renderUi();
  }

  renderUi() {
    this.view = new OptionView(this.app);
    this.wrapper = this.view.render(this.draftSettings);
    this.app.uiRoot.append(this.wrapper);

    this.bgmInput = this.wrapper.querySelector('#bgm');
    this.sfxInput = this.wrapper.querySelector('#sfx');
    this.mutedInput = this.wrapper.querySelector('#muted');
    this.difficultyInput = this.wrapper.querySelector('#difficulty');
    this.hudPanelColorInput = this.wrapper.querySelector('#hud-panel-color');
    this.hudPanelOpacityInput = this.wrapper.querySelector('#hud-panel-opacity');

    this.bgmInput.addEventListener('input', () => this.setVolume('bgmVolume', Number(this.bgmInput.value)));
    this.sfxInput.addEventListener('input', () => this.setVolume('sfxVolume', Number(this.sfxInput.value)));
    this.mutedInput.addEventListener('change', () => this.setMuted(this.mutedInput.checked));
    this.difficultyInput.addEventListener('change', () => this.setDifficulty(this.difficultyInput.value));
    this.hudPanelColorInput.addEventListener('input', () => this.setHudPanelColor(this.hudPanelColorInput.value));
    this.hudPanelOpacityInput.addEventListener('input', () => this.setHudPanelOpacity(Number(this.hudPanelOpacityInput.value)));

    this.wrapper.querySelector('#key-config-btn').addEventListener('click', () => this.openControlScene(SCENES.KEY_CONFIG));
    this.wrapper.querySelector('#touch-control-btn').addEventListener('click', () => this.openControlScene(SCENES.TOUCH_CONTROL));
    this.wrapper.querySelector('#save-btn').addEventListener('click', () => this.saveAndReturn());
    this.wrapper.querySelector('#cancel-btn').addEventListener('click', () => this.cancelAndReturn());

    this.syncOptionUi();
    this.menu = new MenuNavigator({
      app: this.app,
      root: this.wrapper,
      selector: '.option-item, button',
      onLeft: item => this.adjustSelectedOption(item, -1),
      onRight: item => this.adjustSelectedOption(item, 1),
      onConfirm: item => this.confirmSelected(item),
      onCancel: () => this.cancelAndReturn(),
    });
  }

  setVolume(key, value) {
    this.draftSettings[key] = clamp01(value);
    this.syncOptionUi();
    this.previewAudioSettings();
  }

  setMuted(value) {
    this.draftSettings.muted = !!value;
    this.syncOptionUi();
    this.previewAudioSettings();
  }

  setDifficulty(value) {
    this.draftSettings.difficulty = DIFFICULTY_ORDER.includes(value) ? value : 'normal';
    this.syncOptionUi();
  }

  setHudPanelColor(value) {
    this.draftSettings.hudPanelColor = normalizeHudPanelColor(value);
    this.syncOptionUi();
    this.previewHudSettings();
  }

  setHudPanelOpacity(value) {
    this.draftSettings.hudPanelOpacity = normalizeHudPanelOpacity(value);
    this.syncOptionUi();
    this.previewHudSettings();
  }

  syncOptionUi() {
    if (!this.wrapper) return;
    this.bgmInput.value = String(this.draftSettings.bgmVolume);
    this.sfxInput.value = String(this.draftSettings.sfxVolume);
    this.mutedInput.checked = this.draftSettings.muted;
    this.difficultyInput.value = this.draftSettings.difficulty;
    this.hudPanelColorInput.value = this.draftSettings.hudPanelColor;
    this.hudPanelOpacityInput.value = String(this.draftSettings.hudPanelOpacity);
    this.wrapper.querySelector('[data-option-value="bgm"]').textContent = `${Math.round(this.draftSettings.bgmVolume * 100)}%`;
    this.wrapper.querySelector('[data-option-value="sfx"]').textContent = `${Math.round(this.draftSettings.sfxVolume * 100)}%`;
    this.wrapper.querySelector('[data-option-value="muted"]').textContent = this.draftSettings.muted ? 'ON' : 'OFF';
    this.wrapper.querySelector('[data-option-value="difficulty"]').textContent = DIFFICULTY_DEFS[this.draftSettings.difficulty]?.label || 'おでかけ';
    this.wrapper.querySelector('[data-option-value="hudPanelColor"]').textContent = getHudPanelColorLabel(this.draftSettings.hudPanelColor);
    this.wrapper.querySelector('[data-option-value="hudPanelOpacity"]').textContent = `${Math.round(this.draftSettings.hudPanelOpacity * 100)}%`;
  }

  adjustSelectedOption(item, direction) {
    const option = item?.dataset?.option;
    if (!option) {
      this.menu?.move(direction);
      return;
    }
    if (option === 'bgm') this.setVolume('bgmVolume', this.draftSettings.bgmVolume + direction * 0.05);
    if (option === 'sfx') this.setVolume('sfxVolume', this.draftSettings.sfxVolume + direction * 0.05);
    if (option === 'muted') this.setMuted(!this.draftSettings.muted);
    if (option === 'difficulty') {
      const current = DIFFICULTY_ORDER.indexOf(this.draftSettings.difficulty);
      const next = (current + direction + DIFFICULTY_ORDER.length) % DIFFICULTY_ORDER.length;
      this.setDifficulty(DIFFICULTY_ORDER[next]);
    }
    if (option === 'hudPanelColor') this.setHudPanelColor(getAdjacentHudPanelColor(this.draftSettings.hudPanelColor, direction));
    if (option === 'hudPanelOpacity') this.setHudPanelOpacity(this.draftSettings.hudPanelOpacity + direction * 0.05);
    this.app.audio.playSfx('ui_decide');
  }

  confirmSelected(item) {
    const option = item?.dataset?.option;
    if (!option) {
      item?.click?.();
      return;
    }
    if (option === 'muted') this.setMuted(!this.draftSettings.muted);
    else this.adjustSelectedOption(item, 1);
    this.app.audio.playSfx('ui_decide');
  }

  previewAudioSettings() {
    this.app.audio.applySettings({ ...this.draftSettings });
  }

  previewHudSettings() {
    applyHudPanelStyle(this.app.hudRoot, this.draftSettings);
  }

  openControlScene(sceneId) {
    this.app.audio.applySettings();
    this.app.audio.playSfx('ui_decide');
    this.app.sceneManager.change(sceneId, this.params);
  }

  returnToCaller() {
    const returnSceneId = this.params.returnSceneId || SCENES.GARDEN;
    this.app.sceneManager.change(returnSceneId, this.params.returnParams || {});
  }

  cancelAndReturn() {
    this.app.audio.applySettings();
    applyHudPanelStyle(this.app.hudRoot, this.app.save.load().settings);
    this.returnToCaller();
  }

  saveAndReturn() {
    this.app.save.updateSettings({ ...this.draftSettings });
    applyHudPanelStyle(this.app.hudRoot, this.draftSettings);
    this.app.audio.applySettings();
    this.app.audio.playSfx('ui_decide');
    this.returnToCaller();
  }

  exit() {
    this.menu?.destroy();
  }

  update() {
    this.menu?.update();
  }

  render(ctx) {
    const bg = this.app.assets.getImage('bg_kingdom_opening');
    if (bg) ctx.drawImage(bg, 0, 0, 480, 270);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(0, 0, 480, 270);
  }
}
