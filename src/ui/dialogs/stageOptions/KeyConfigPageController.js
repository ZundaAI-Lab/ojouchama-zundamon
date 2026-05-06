/**
 * 責務: ステージ内キー設定ページのDOM制御と入力キャプチャ結果の反映を担当する。
 * 更新ルール: 低レベル入力イベントはInputCaptureService、保存・重複解除はOptionDraftStoreへ委譲する。
 */
import { MenuNavigator } from '../../MenuNavigator.js';
import { KeyConfigView } from '../../views/KeyConfigView.js';
import {
  CONFIGURABLE_KEY_ACTIONS,
  getKeyDisplayName,
} from '../../../config/controlSettings.js';
import { InputCaptureService } from './InputCaptureService.js';

export class KeyConfigPageController {
  constructor(dialog) {
    this.dialog = dialog;
    this.app = dialog.app;
    this.menu = null;
    this.capture = new InputCaptureService({
      getRoot: () => this.dialog.root,
      onCaptured: ({ action, slot, code }) => this.dialog.drafts.setKeyBinding(action, slot, code),
      onFinished: () => this.finishCapture(),
    });
  }

  open() {
    this.app.audio.applySettings();
    this.app.audio.playSfx('ui_decide');
    this.dialog.drafts.loadKeyBindings();

    const view = new KeyConfigView(this.app);
    this.dialog.setPageRoot(view.render(this.dialog.drafts.keyBindings));

    this.dialog.root.querySelectorAll('[data-key-bind-action]').forEach(button => {
      button.addEventListener('click', () => this.startCapture(button.dataset.keyBindAction, Number(button.dataset.keyBindSlot), button));
    });
    this.dialog.root.querySelectorAll('[data-key-default-action]').forEach(button => {
      button.addEventListener('click', () => this.resetActionToDefault(button.dataset.keyDefaultAction));
    });
    this.dialog.root.querySelector('#save-btn').addEventListener('click', () => this.saveAndReturn());
    this.dialog.root.querySelector('#cancel-btn').addEventListener('click', () => this.cancelAndReturn());

    this.syncUi();
    this.menu = new MenuNavigator({
      app: this.app,
      root: this.dialog.root,
      selector: 'button',
      onConfirm: item => item?.click?.(),
      onCancel: () => this.cancelAndReturn(),
    });
  }

  startCapture(action, slot, button) {
    if (!CONFIGURABLE_KEY_ACTIONS.includes(action)) return;
    this.capture.start({ action, slot, button });
  }

  finishCapture() {
    this.syncUi();
    this.app.audio.playSfx('ui_decide');
  }

  resetActionToDefault(action) {
    if (!CONFIGURABLE_KEY_ACTIONS.includes(action)) return;
    this.dialog.drafts.resetKeyActionToDefault(action);
    this.syncUi();
    this.app.audio.playSfx('ui_decide');
  }

  syncUi() {
    if (!this.dialog.root) return;
    this.dialog.root.querySelectorAll('[data-key-bind-action]').forEach(button => {
      const { keyBindAction: action, keyBindSlot: slot } = button.dataset;
      if (this.capture.activeButton === button) return;
      const code = this.dialog.drafts.keyBindings[action]?.[Number(slot)] || null;
      button.textContent = getKeyDisplayName(code);
    });
  }

  cancelAndReturn() {
    this.capture.stop();
    this.dialog.drafts.restoreSavedKeyBindingsToInput();
    this.dialog.showOptionPage();
  }

  saveAndReturn() {
    this.capture.stop();
    const savedSettings = this.dialog.drafts.saveKeyBindings();
    this.app.input.setKeyBindings(savedSettings.keyBindings);
    this.app.audio.playSfx('ui_decide');
    this.dialog.showOptionPage();
  }

  update() {
    if (this.capture.isCapturing) return;
    this.menu?.update();
  }

  destroy() {
    this.capture.stop();
    this.menu?.destroy();
    this.menu = null;
  }
}
