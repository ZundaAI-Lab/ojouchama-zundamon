/**
 * 責務: タッチ操作設定専用画面の値変更・保存を担当する。
 * 更新ルール: キーコンフィグや音量設定は扱わず、タッチ操作の配置・サイズ・濃度だけに限定する。
 * 更新ルール: 左利き配置時は表示スロットから保存スロットへ変換し、保存値の並びは標準配置基準のまま保つ。
 */
import { BaseScene } from './BaseScene.js';
import { SCENES } from '../config/sceneIds.js';
import { MenuNavigator } from '../ui/MenuNavigator.js';
import { TouchControlView } from '../ui/views/TouchControlView.js';
import {
  DEFAULT_TOUCH_CONFIG,
  TOUCH_BUTTON_ACTIONS,
  getTouchButtonSlotSourceIndexForLayout,
  getTouchButtonSlotsForLayout,
  normalizeTouchConfig,
} from '../config/controlSettings.js';

const TOUCH_LAYOUT_ORDER = ['rightHanded', 'leftHanded'];
const TOUCH_BUTTON_ACTION_ORDER = ['', ...TOUCH_BUTTON_ACTIONS];
const TOUCH_STEP = {
  padSize: 2,
  deadZone: 1,
  buttonSize: 2,
  opacity: 0.05,
};

export class TouchControlScene extends BaseScene {
  async enter() {
    const save = this.app.save.load();
    this.draftTouchControls = normalizeTouchConfig(save.settings.touchControls || DEFAULT_TOUCH_CONFIG);
    this.renderUi();
  }

  renderUi() {
    this.view = new TouchControlView(this.app);
    this.wrapper = this.view.render(this.draftTouchControls);
    this.app.uiRoot.append(this.wrapper);

    this.touchEnabledInput = this.wrapper.querySelector('#touch-enabled');
    this.touchLayoutInput = this.wrapper.querySelector('#touch-layout');
    this.touchPadSizeInput = this.wrapper.querySelector('#touch-pad-size');
    this.touchDeadZoneInput = this.wrapper.querySelector('#touch-dead-zone');
    this.touchButtonSizeInput = this.wrapper.querySelector('#touch-button-size');
    this.touchOpacityInput = this.wrapper.querySelector('#touch-opacity');
    this.touchButtonSlotInputs = [...this.wrapper.querySelectorAll('.touch-button-slot-select')];

    this.touchEnabledInput.addEventListener('change', () => this.setTouchValue('enabled', this.touchEnabledInput.checked));
    this.touchLayoutInput.addEventListener('change', () => this.setTouchValue('layout', this.touchLayoutInput.value));
    this.touchPadSizeInput.addEventListener('input', () => this.setTouchValue('padSize', Number(this.touchPadSizeInput.value)));
    this.touchDeadZoneInput.addEventListener('input', () => this.setTouchValue('deadZone', Number(this.touchDeadZoneInput.value)));
    this.touchButtonSizeInput.addEventListener('input', () => this.setTouchValue('buttonSize', Number(this.touchButtonSizeInput.value)));
    this.touchOpacityInput.addEventListener('input', () => this.setTouchValue('opacity', Number(this.touchOpacityInput.value)));
    this.touchButtonSlotInputs.forEach(input => {
      input.addEventListener('change', () => this.setTouchButtonSlot(Number(input.dataset.touchButtonSlotSelect), input.value || null));
    });
    this.wrapper.querySelector('#default-btn').addEventListener('click', () => this.resetToDefault());
    this.wrapper.querySelector('#save-btn').addEventListener('click', () => this.saveAndReturn());
    this.wrapper.querySelector('#cancel-btn').addEventListener('click', () => this.cancelAndReturn());

    this.syncUi();
    this.menu = new MenuNavigator({
      app: this.app,
      root: this.wrapper,
      selector: '.option-item, .touch-button-slot-item, button',
      onLeft: item => this.adjustSelectedOption(item, -1),
      onRight: item => this.adjustSelectedOption(item, 1),
      onConfirm: item => this.confirmSelected(item),
      onCancel: () => this.cancelAndReturn(),
    });
  }

  setTouchValue(key, value) {
    this.draftTouchControls = normalizeTouchConfig({
      ...this.draftTouchControls,
      [key]: value,
    });
    this.syncUi();
  }

  setTouchButtonSlot(slotIndex, action) {
    const sourceIndex = this.getButtonSlotSourceIndex(slotIndex);
    if (sourceIndex < 0) return;
    const buttonSlots = [...this.draftTouchControls.buttonSlots];
    buttonSlots[sourceIndex] = action || null;
    this.draftTouchControls = normalizeTouchConfig({
      ...this.draftTouchControls,
      buttonSlots,
    });
    this.syncUi();
  }

  getButtonSlotSourceIndex(slotIndex) {
    return getTouchButtonSlotSourceIndexForLayout(this.draftTouchControls.layout, slotIndex);
  }

  getVisualButtonSlots() {
    return getTouchButtonSlotsForLayout(this.draftTouchControls.buttonSlots, this.draftTouchControls.layout);
  }

  syncUi() {
    if (!this.wrapper) return;
    this.touchEnabledInput.checked = this.draftTouchControls.enabled;
    this.touchLayoutInput.value = this.draftTouchControls.layout;
    this.touchPadSizeInput.value = String(this.draftTouchControls.padSize);
    this.touchDeadZoneInput.value = String(this.draftTouchControls.deadZone);
    this.touchButtonSizeInput.value = String(this.draftTouchControls.buttonSize);
    this.touchOpacityInput.value = String(this.draftTouchControls.opacity);
    const visualButtonSlots = this.getVisualButtonSlots();
    this.touchButtonSlotInputs.forEach((input, index) => {
      input.value = visualButtonSlots[index] || '';
    });

    this.wrapper.querySelector('[data-option-value="touchEnabled"]').textContent = this.draftTouchControls.enabled ? 'ON' : 'OFF';
    this.wrapper.querySelector('[data-option-value="touchLayout"]').textContent = this.draftTouchControls.layout === 'leftHanded' ? '左利き' : '標準';
    this.wrapper.querySelector('[data-option-value="touchPadSize"]').textContent = `${this.draftTouchControls.padSize}px`;
    this.wrapper.querySelector('[data-option-value="touchDeadZone"]').textContent = `${this.draftTouchControls.deadZone}px`;
    this.wrapper.querySelector('[data-option-value="touchButtonSize"]').textContent = `${this.draftTouchControls.buttonSize}px`;
    this.wrapper.querySelector('[data-option-value="touchOpacity"]').textContent = `${Math.round(this.draftTouchControls.opacity * 100)}%`;
    visualButtonSlots.forEach((action, index) => {
      const label = this.wrapper.querySelector(`[data-option-value="touchButtonSlot${index}"]`);
      if (label) label.textContent = this.getTouchButtonSlotLabel(action);
    });
  }

  getTouchButtonSlotLabel(action) {
    if (!action) return '未割り当て';
    const option = this.touchButtonSlotInputs?.[0]?.querySelector(`option[value="${action}"]`);
    return option ? option.textContent.split('：')[0] : action;
  }

  adjustSelectedOption(item, direction) {
    const option = item?.dataset?.option;
    if (!option) {
      this.menu?.move(direction);
      return;
    }
    if (option === 'touchButtonSlot') {
      this.adjustButtonSlot(item, direction);
      this.app.audio.playSfx('ui_decide');
      return;
    }
    if (option === 'touchEnabled') this.setTouchValue('enabled', !this.draftTouchControls.enabled);
    if (option === 'touchLayout') {
      const current = TOUCH_LAYOUT_ORDER.indexOf(this.draftTouchControls.layout);
      const next = (current + direction + TOUCH_LAYOUT_ORDER.length) % TOUCH_LAYOUT_ORDER.length;
      this.setTouchValue('layout', TOUCH_LAYOUT_ORDER[next]);
    }
    if (option === 'touchPadSize') this.setTouchValue('padSize', this.draftTouchControls.padSize + direction * TOUCH_STEP.padSize);
    if (option === 'touchDeadZone') this.setTouchValue('deadZone', this.draftTouchControls.deadZone + direction * TOUCH_STEP.deadZone);
    if (option === 'touchButtonSize') this.setTouchValue('buttonSize', this.draftTouchControls.buttonSize + direction * TOUCH_STEP.buttonSize);
    if (option === 'touchOpacity') this.setTouchValue('opacity', this.draftTouchControls.opacity + direction * TOUCH_STEP.opacity);
    this.app.audio.playSfx('ui_decide');
  }

  adjustButtonSlot(item, direction) {
    const slotIndex = Number(item?.dataset?.touchButtonSlot);
    if (!Number.isInteger(slotIndex)) return;
    const currentAction = this.getVisualButtonSlots()[slotIndex] || '';
    const current = TOUCH_BUTTON_ACTION_ORDER.indexOf(currentAction);
    const next = (Math.max(0, current) + direction + TOUCH_BUTTON_ACTION_ORDER.length) % TOUCH_BUTTON_ACTION_ORDER.length;
    this.setTouchButtonSlot(slotIndex, TOUCH_BUTTON_ACTION_ORDER[next] || null);
  }

  confirmSelected(item) {
    const option = item?.dataset?.option;
    if (!option) {
      item?.click?.();
      return;
    }
    this.adjustSelectedOption(item, 1);
  }

  resetToDefault() {
    this.draftTouchControls = normalizeTouchConfig(DEFAULT_TOUCH_CONFIG);
    this.syncUi();
    this.app.audio.playSfx('ui_decide');
  }

  cancelAndReturn() {
    this.app.sceneManager.change(SCENES.OPTION, this.params);
  }

  saveAndReturn() {
    this.app.save.updateSettings({ touchControls: this.draftTouchControls });
    this.app.audio.playSfx('ui_decide');
    this.app.sceneManager.change(SCENES.OPTION, this.params);
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
