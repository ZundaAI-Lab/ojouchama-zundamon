/**
 * 責務: ブラウザ標準confirmの代替として、ゲーム画面内へ確認ダイアログを重ねて表示する。
 * 更新ルール: 呼び出し側の業務処理は持たず、表示・入力制御・Promise解決だけを担当する。
 */
const DEFAULT_CONFIRM_LABEL = 'はい';
const DEFAULT_CANCEL_LABEL = 'いいえ';
const HANDLED_KEY_CODES = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Enter',
  'Space',
  'KeyZ',
  'Escape',
]);

function normalizeMessage(message) {
  if (Array.isArray(message)) return message.map(line => `${line}`);
  return `${message || ''}`.split('\n');
}

export class ConfirmDialogController {
  constructor(app) {
    this.app = app;
    this.root = null;
    this.buttons = [];
    this.selectedIndex = 1;
    this.resolve = null;
    this.previousFocus = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  confirm({ title = '確認', message = '', confirmLabel = DEFAULT_CONFIRM_LABEL, cancelLabel = DEFAULT_CANCEL_LABEL, danger = false } = {}) {
    this.close(false, { silent: true });
    this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    this.root = document.createElement('div');
    this.root.className = 'confirm-dialog-screen';
    this.root.innerHTML = `
      <div class="confirm-dialog-card panel" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message">
        <div class="confirm-dialog-mark" aria-hidden="true">?</div>
        <h1 class="confirm-dialog-title" id="confirm-dialog-title">${title}</h1>
        <div class="confirm-dialog-message" id="confirm-dialog-message"></div>
        <div class="confirm-dialog-actions">
          <button class="secondary-btn confirm-dialog-button" data-confirm-result="cancel" type="button">${cancelLabel}</button>
          <button class="primary-btn confirm-dialog-button${danger ? ' confirm-dialog-danger-btn' : ''}" data-confirm-result="ok" type="button">${confirmLabel}</button>
        </div>
      </div>
    `;

    const messageNode = this.root.querySelector('.confirm-dialog-message');
    for (const line of normalizeMessage(message)) {
      const paragraph = document.createElement('p');
      paragraph.textContent = line;
      messageNode.append(paragraph);
    }

    this.buttons = Array.from(this.root.querySelectorAll('.confirm-dialog-button'));
    this.buttons.forEach((button, index) => {
      button.addEventListener('click', () => this.close(button.dataset.confirmResult === 'ok'));
      button.addEventListener('pointerenter', () => this.setSelectedIndex(index));
      button.addEventListener('focus', () => this.setSelectedIndex(index, { focus: false }));
    });

    this.app.uiRoot.append(this.root);
    window.addEventListener('keydown', this.handleKeyDown, true);
    this.setSelectedIndex(1);

    return new Promise(resolve => {
      this.resolve = resolve;
      requestAnimationFrame(() => this.buttons[this.selectedIndex]?.focus({ preventScroll: true }));
    });
  }

  setSelectedIndex(index, { focus = true } = {}) {
    if (!this.buttons.length) return;
    this.selectedIndex = (index + this.buttons.length) % this.buttons.length;
    this.buttons.forEach((button, buttonIndex) => {
      button.classList.toggle('is-selected', buttonIndex === this.selectedIndex);
      if (buttonIndex === this.selectedIndex) button.setAttribute('aria-selected', 'true');
      else button.removeAttribute('aria-selected');
    });
    if (focus) this.buttons[this.selectedIndex]?.focus({ preventScroll: true });
  }

  move(delta) {
    this.setSelectedIndex(this.selectedIndex + delta);
    this.app.audio?.playSfx?.('ui_move');
  }

  handleKeyDown(event) {
    if (!HANDLED_KEY_CODES.has(event.code)) return;
    event.preventDefault();
    event.stopPropagation();

    if (event.code === 'Escape') {
      this.close(false);
      return;
    }

    if (event.code === 'Enter' || event.code === 'Space' || event.code === 'KeyZ') {
      const selectedButton = this.buttons[this.selectedIndex];
      this.close(selectedButton?.dataset.confirmResult === 'ok');
      return;
    }

    if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') this.move(-1);
    if (event.code === 'ArrowRight' || event.code === 'ArrowDown') this.move(1);
  }

  close(result, { silent = false } = {}) {
    if (!this.root) return;

    const resolve = this.resolve;
    const previousFocus = this.previousFocus;
    this.root.remove();
    this.root = null;
    this.buttons = [];
    this.resolve = null;
    this.previousFocus = null;
    window.removeEventListener('keydown', this.handleKeyDown, true);

    if (!silent) this.app.audio?.playSfx?.(result ? 'ui_decide' : 'ui_cancel');
    previousFocus?.focus?.({ preventScroll: true });
    resolve?.(!!result);
  }
}
