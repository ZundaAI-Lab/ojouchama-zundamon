/**
 * 責務: キー設定ページでのキーボード・マウス・ホイール入力キャプチャを担当する。
 * 更新ルール: 入力キャプチャのイベント登録/解除はこのServiceに閉じ、ページControllerは取得結果の反映だけを担当する。
 */
const MOUSE_BUTTON_CODES = new Map([
  [0, 'MouseLeft'],
  [1, 'MouseMiddle'],
  [2, 'MouseRight'],
]);

const MOUSE_WHEEL_CODE = 'MouseWheel';

function stopInputEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

export class InputCaptureService {
  constructor({ getRoot, onCaptured, onFinished }) {
    this.getRoot = getRoot;
    this.onCaptured = onCaptured;
    this.onFinished = onFinished;
    this.capture = null;
    this.keepBlockingClick = false;

    this.handleKeyCapture = this.handleKeyCapture.bind(this);
    this.handleMouseCapture = this.handleMouseCapture.bind(this);
    this.handleWheelCapture = this.handleWheelCapture.bind(this);
    this.blockCaptureClick = this.blockCaptureClick.bind(this);
  }

  get isCapturing() {
    return !!this.capture;
  }

  get activeButton() {
    return this.capture?.button || null;
  }

  start({ action, slot, button }) {
    this.stop();
    this.capture = { action, slot, button };
    this.getRoot()?.classList.add('is-capturing-input');
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
    if (!this.capture) return;
    stopInputEvent(event);
    const { action, slot } = this.capture;
    const code = event.code;
    this.onCaptured({ action, slot, code: code === 'Backspace' || code === 'Delete' ? null : code });
    this.finish();
  }

  handleMouseCapture(event) {
    if (!this.capture) return;
    stopInputEvent(event);
    const code = MOUSE_BUTTON_CODES.get(event.button);
    if (!code) return;
    const { action, slot } = this.capture;
    this.onCaptured({ action, slot, code });
    this.finish({ keepClickBlock: true });
  }

  handleWheelCapture(event) {
    if (!this.capture) return;
    stopInputEvent(event);
    const { action, slot } = this.capture;
    this.onCaptured({ action, slot, code: MOUSE_WHEEL_CODE });
    this.finish();
  }

  blockCaptureClick(event) {
    if (!this.capture && !this.keepBlockingClick) return;
    stopInputEvent(event);
  }

  finish({ keepClickBlock = false } = {}) {
    this.stop({ keepClickBlock });
    this.onFinished?.();
  }

  stop({ keepClickBlock = false } = {}) {
    if (this.capture?.button) this.capture.button.classList.remove('is-capturing');
    this.capture = null;
    this.getRoot()?.classList.remove('is-capturing-input');
    window.removeEventListener('keydown', this.handleKeyCapture, { capture: true });
    window.removeEventListener('mousedown', this.handleMouseCapture, { capture: true });
    window.removeEventListener('wheel', this.handleWheelCapture, { capture: true });
    if (keepClickBlock) {
      this.keepBlockingClick = true;
      window.setTimeout(() => {
        this.keepBlockingClick = false;
        this.removeClickBlockers();
      }, 0);
    } else {
      this.keepBlockingClick = false;
      this.removeClickBlockers();
    }
  }

  removeClickBlockers() {
    window.removeEventListener('click', this.blockCaptureClick, { capture: true });
    window.removeEventListener('auxclick', this.blockCaptureClick, { capture: true });
    window.removeEventListener('contextmenu', this.blockCaptureClick, { capture: true });
  }
}
