/**
 * 責務: ステージ内タッチ操作設定ページのDOM制御を担当する。
 * 更新ルール: タッチ設定の正規化と保存はOptionDraftStoreへ委譲し、このControllerは表示値同期とメニュー操作だけを扱う。
 */
import { MenuNavigator } from '../../MenuNavigator.js';
import { TouchControlView } from '../../views/TouchControlView.js';

const TOUCH_LAYOUT_ORDER = ['rightHanded', 'leftHanded'];
const TOUCH_STEP = {
  padSize: 2,
  deadZone: 1,
  buttonSize: 2,
  opacity: 0.05,
};

export class TouchControlPageController {
  constructor(dialog) {
    this.dialog = dialog;
    this.app = dialog.app;
    this.menu = null;
  }

  open() {
    this.app.audio.applySettings();
    this.app.audio.playSfx('ui_decide');
    this.dialog.drafts.loadTouchControls();

    const view = new TouchControlView(this.app);
    this.dialog.setPageRoot(view.render(this.dialog.drafts.touchControls));

    this.touchEnabledInput = this.dialog.root.querySelector('#touch-enabled');
    this.touchLayoutInput = this.dialog.root.querySelector('#touch-layout');
    this.touchPadSizeInput = this.dialog.root.querySelector('#touch-pad-size');
    this.touchDeadZoneInput = this.dialog.root.querySelector('#touch-dead-zone');
    this.touchButtonSizeInput = this.dialog.root.querySelector('#touch-button-size');
    this.touchOpacityInput = this.dialog.root.querySelector('#touch-opacity');

    this.touchEnabledInput.addEventListener('change', () => this.setTouchValue('enabled', this.touchEnabledInput.checked));
    this.touchLayoutInput.addEventListener('change', () => this.setTouchValue('layout', this.touchLayoutInput.value));
    this.touchPadSizeInput.addEventListener('input', () => this.setTouchValue('padSize', Number(this.touchPadSizeInput.value)));
    this.touchDeadZoneInput.addEventListener('input', () => this.setTouchValue('deadZone', Number(this.touchDeadZoneInput.value)));
    this.touchButtonSizeInput.addEventListener('input', () => this.setTouchValue('buttonSize', Number(this.touchButtonSizeInput.value)));
    this.touchOpacityInput.addEventListener('input', () => this.setTouchValue('opacity', Number(this.touchOpacityInput.value)));
    this.dialog.root.querySelector('#default-btn').addEventListener('click', () => this.resetToDefault());
    this.dialog.root.querySelector('#save-btn').addEventListener('click', () => this.saveAndReturn());
    this.dialog.root.querySelector('#cancel-btn').addEventListener('click', () => this.cancelAndReturn());

    this.syncUi();
    this.menu = new MenuNavigator({
      app: this.app,
      root: this.dialog.root,
      selector: '.option-item, button',
      onLeft: item => this.adjustSelectedOption(item, -1),
      onRight: item => this.adjustSelectedOption(item, 1),
      onConfirm: item => this.confirmSelectedOption(item),
      onCancel: () => this.cancelAndReturn(),
    });
  }

  get draft() {
    return this.dialog.drafts.touchControls;
  }

  setTouchValue(key, value) {
    this.dialog.drafts.setTouchValue(key, value);
    this.syncUi();
  }

  syncUi() {
    if (!this.dialog.root) return;
    this.touchEnabledInput.checked = this.draft.enabled;
    this.touchLayoutInput.value = this.draft.layout;
    this.touchPadSizeInput.value = String(this.draft.padSize);
    this.touchDeadZoneInput.value = String(this.draft.deadZone);
    this.touchButtonSizeInput.value = String(this.draft.buttonSize);
    this.touchOpacityInput.value = String(this.draft.opacity);

    this.dialog.root.querySelector('[data-option-value="touchEnabled"]').textContent = this.draft.enabled ? 'ON' : 'OFF';
    this.dialog.root.querySelector('[data-option-value="touchLayout"]').textContent = this.draft.layout === 'leftHanded' ? '左利き' : '標準';
    this.dialog.root.querySelector('[data-option-value="touchPadSize"]').textContent = `${this.draft.padSize}px`;
    this.dialog.root.querySelector('[data-option-value="touchDeadZone"]').textContent = `${this.draft.deadZone}px`;
    this.dialog.root.querySelector('[data-option-value="touchButtonSize"]').textContent = `${this.draft.buttonSize}px`;
    this.dialog.root.querySelector('[data-option-value="touchOpacity"]').textContent = `${Math.round(this.draft.opacity * 100)}%`;
  }

  adjustSelectedOption(item, direction) {
    const option = item?.dataset?.option;
    if (!option) {
      this.menu?.move(direction);
      return;
    }
    if (option === 'touchEnabled') this.setTouchValue('enabled', !this.draft.enabled);
    if (option === 'touchLayout') {
      const current = TOUCH_LAYOUT_ORDER.indexOf(this.draft.layout);
      const next = (current + direction + TOUCH_LAYOUT_ORDER.length) % TOUCH_LAYOUT_ORDER.length;
      this.setTouchValue('layout', TOUCH_LAYOUT_ORDER[next]);
    }
    if (option === 'touchPadSize') this.setTouchValue('padSize', this.draft.padSize + direction * TOUCH_STEP.padSize);
    if (option === 'touchDeadZone') this.setTouchValue('deadZone', this.draft.deadZone + direction * TOUCH_STEP.deadZone);
    if (option === 'touchButtonSize') this.setTouchValue('buttonSize', this.draft.buttonSize + direction * TOUCH_STEP.buttonSize);
    if (option === 'touchOpacity') this.setTouchValue('opacity', this.draft.opacity + direction * TOUCH_STEP.opacity);
    this.app.audio.playSfx('ui_decide');
  }

  confirmSelectedOption(item) {
    const option = item?.dataset?.option;
    if (!option) {
      item?.click?.();
      return;
    }
    this.adjustSelectedOption(item, 1);
  }

  resetToDefault() {
    this.dialog.drafts.resetTouchControlsToDefault();
    this.syncUi();
    this.app.audio.playSfx('ui_decide');
  }

  cancelAndReturn() {
    this.dialog.showOptionPage();
  }

  saveAndReturn() {
    this.dialog.drafts.saveTouchControls();
    this.dialog.onTouchSettingsChanged?.();
    this.app.audio.playSfx('ui_decide');
    this.dialog.showOptionPage();
  }

  update() {
    this.menu?.update();
  }

  destroy() {
    this.menu?.destroy();
    this.menu = null;
  }
}
