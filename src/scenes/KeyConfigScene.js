/**
 * 責務: キーコンフィグ専用画面の入力待ち受け・割り当て保存を担当する。
 * 更新ルール: オプション本体やタッチ操作設定は扱わず、キー/マウス割り当て編集だけに限定する。
 * 更新ルール: 入力待ち中はメニュー移動と他ボタンのクリックを遮断し、待ち受け中の枠だけが制御を持つ。
 */
import { BaseScene } from './BaseScene.js';
import { SCENES } from '../config/sceneIds.js';
import { MenuNavigator } from '../ui/MenuNavigator.js';
import { KeyConfigView } from '../ui/views/KeyConfigView.js';
import {
  CONFIGURABLE_KEY_ACTIONS,
  DEFAULT_KEY_BINDINGS,
  getKeyDisplayName,
  normalizeKeyBindings,
} from '../config/controlSettings.js';

const MOUSE_BUTTON_CODES = new Map([
  [0, 'MouseLeft'],
  [1, 'MouseMiddle'],
  [2, 'MouseRight'],
]);

const MOUSE_WHEEL_CODE = 'MouseWheel';

function cloneBindings(bindings) {
  return Object.fromEntries(Object.entries(bindings).map(([action, slots]) => [action, [...slots]]));
}

function stopInputEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

export class KeyConfigScene extends BaseScene {
  async enter() {
    const save = this.app.save.load();
    this.draftBindings = normalizeKeyBindings(save.settings.keyBindings || DEFAULT_KEY_BINDINGS);
    this.keyCapture = null;
    this.handleKeyCapture = this.handleKeyCapture.bind(this);
    this.handleMouseCapture = this.handleMouseCapture.bind(this);
    this.handleWheelCapture = this.handleWheelCapture.bind(this);
    this.blockCaptureClick = this.blockCaptureClick.bind(this);
    this.renderUi();
  }

  renderUi() {
    this.view = new KeyConfigView(this.app);
    this.wrapper = this.view.render(this.draftBindings);
    this.app.uiRoot.append(this.wrapper);

    this.wrapper.querySelectorAll('[data-key-bind-action]').forEach(button => {
      button.addEventListener('click', () => this.startKeyCapture(button.dataset.keyBindAction, Number(button.dataset.keyBindSlot), button));
    });
    this.wrapper.querySelectorAll('[data-key-default-action]').forEach(button => {
      button.addEventListener('click', () => this.resetActionToDefault(button.dataset.keyDefaultAction));
    });
    this.wrapper.querySelector('#save-btn').addEventListener('click', () => this.saveAndReturn());
    this.wrapper.querySelector('#cancel-btn').addEventListener('click', () => this.cancelAndReturn());

    this.syncUi();
    this.menu = new MenuNavigator({
      app: this.app,
      root: this.wrapper,
      selector: 'button',
      onConfirm: item => item?.click?.(),
      onCancel: () => this.cancelAndReturn(),
    });
  }

  startKeyCapture(action, slot, button) {
    if (!CONFIGURABLE_KEY_ACTIONS.includes(action)) return;
    this.stopKeyCapture();
    this.keyCapture = { action, slot, button };
    this.wrapper?.classList.add('is-capturing-input');
    button.textContent = '入力待ち...';
    button.classList.add('is-capturing');
    button.focus?.({ preventScroll: true });
    window.addEventListener('keydown', this.handleKeyCapture, { capture: true });
    window.addEventListener('mousedown', this.handleMouseCapture, { capture: true });
    window.addEventListener('wheel', this.handleWheelCapture, { capture: true, passive: false });
    window.addEventListener('click', this.blockCaptureClick, { capture: true });
    window.addEventListener('auxclick', this.blockCaptureClick, { capture: true });
    window.addEventListener('contextmenu', this.blockCaptureClick, { capture: true });
  }

  handleKeyCapture(event) {
    if (!this.keyCapture) return;
    stopInputEvent(event);
    const { action, slot } = this.keyCapture;
    const code = event.code;
    if (code === 'Backspace' || code === 'Delete') this.setKeyBinding(action, slot, null);
    else this.setKeyBinding(action, slot, code);
    this.finishCapture();
  }

  handleMouseCapture(event) {
    if (!this.keyCapture) return;
    stopInputEvent(event);
    const code = MOUSE_BUTTON_CODES.get(event.button);
    if (!code) return;
    const { action, slot } = this.keyCapture;
    this.setKeyBinding(action, slot, code);
    this.finishCapture({ keepClickBlock: true });
  }

  handleWheelCapture(event) {
    if (!this.keyCapture) return;
    stopInputEvent(event);
    const { action, slot } = this.keyCapture;
    this.setKeyBinding(action, slot, MOUSE_WHEEL_CODE);
    this.finishCapture();
  }

  blockCaptureClick(event) {
    if (!this.keyCapture && !this.keepBlockingClick) return;
    stopInputEvent(event);
  }

  finishCapture({ keepClickBlock = false } = {}) {
    this.stopKeyCapture({ keepClickBlock });
    this.syncUi();
    this.app.audio.playSfx('ui_decide');
  }

  stopKeyCapture({ keepClickBlock = false } = {}) {
    if (this.keyCapture?.button) this.keyCapture.button.classList.remove('is-capturing');
    this.keyCapture = null;
    this.wrapper?.classList.remove('is-capturing-input');
    window.removeEventListener('keydown', this.handleKeyCapture, { capture: true });
    window.removeEventListener('mousedown', this.handleMouseCapture, { capture: true });
    window.removeEventListener('wheel', this.handleWheelCapture, { capture: true });
    if (keepClickBlock) {
      this.keepBlockingClick = true;
      window.setTimeout(() => {
        this.keepBlockingClick = false;
        window.removeEventListener('click', this.blockCaptureClick, { capture: true });
        window.removeEventListener('auxclick', this.blockCaptureClick, { capture: true });
        window.removeEventListener('contextmenu', this.blockCaptureClick, { capture: true });
      }, 0);
    } else {
      this.keepBlockingClick = false;
      window.removeEventListener('click', this.blockCaptureClick, { capture: true });
      window.removeEventListener('auxclick', this.blockCaptureClick, { capture: true });
      window.removeEventListener('contextmenu', this.blockCaptureClick, { capture: true });
    }
  }

  setKeyBinding(action, slot, code) {
    const next = cloneBindings(this.draftBindings);
    if (!next[action]) next[action] = [null, null];
    if (code) this.removeCodeFromAllActions(next, code);
    next[action][slot] = code;
    this.draftBindings = normalizeKeyBindings(next);
  }

  removeCodeFromAllActions(bindings, code) {
    for (const targetAction of CONFIGURABLE_KEY_ACTIONS) {
      bindings[targetAction] = (bindings[targetAction] || [null, null]).map(current => current === code ? null : current);
    }
  }

  resetActionToDefault(action) {
    if (!CONFIGURABLE_KEY_ACTIONS.includes(action)) return;
    const next = cloneBindings(this.draftBindings);
    const defaults = DEFAULT_KEY_BINDINGS[action] || [null, null];
    for (const code of defaults) {
      if (code) this.removeCodeFromAllActions(next, code);
    }
    next[action] = [...defaults];
    this.draftBindings = normalizeKeyBindings(next);
    this.syncUi();
    this.app.audio.playSfx('ui_decide');
  }

  syncUi() {
    if (!this.wrapper) return;
    this.wrapper.querySelectorAll('[data-key-bind-action]').forEach(button => {
      const { keyBindAction: action, keyBindSlot: slot } = button.dataset;
      if (this.keyCapture?.button === button) return;
      const code = this.draftBindings[action]?.[Number(slot)] || null;
      button.textContent = getKeyDisplayName(code);
    });
  }

  cancelAndReturn() {
    this.stopKeyCapture();
    this.app.input.setKeyBindings(this.app.save.load().settings.keyBindings);
    this.app.sceneManager.change(SCENES.OPTION, this.params);
  }

  saveAndReturn() {
    this.stopKeyCapture();
    const savedSettings = this.app.save.updateSettings({ keyBindings: this.draftBindings });
    this.app.input.setKeyBindings(savedSettings.keyBindings);
    this.app.audio.playSfx('ui_decide');
    this.app.sceneManager.change(SCENES.OPTION, this.params);
  }

  exit() {
    this.stopKeyCapture();
    this.menu?.destroy();
  }

  update() {
    if (this.keyCapture) return;
    this.menu?.update();
  }

  render(ctx) {
    const bg = this.app.assets.getImage('bg_kingdom_opening');
    if (bg) ctx.drawImage(bg, 0, 0, 480, 270);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(0, 0, 480, 270);
  }
}
