/**
 * 責務: メニュー項目の選択移動、決定、キャンセル入力を担当する。
 * 更新ルール: 各画面固有の遷移先はScene側からコールバックで渡す。
 */
import { INPUT_ACTIONS } from '../config/inputActions.js';

const DEFAULT_SELECTOR = 'button, [data-menu-item="true"]';

function canSelect(el) {
  if (!el) return false;
  if (el.hidden || el.disabled) return false;
  if (el.getAttribute('aria-disabled') === 'true') return false;
  if (el.dataset.menuDisabled === 'true') return false;
  return true;
}

export class MenuNavigator {
  constructor({
    app,
    root,
    selector = DEFAULT_SELECTOR,
    initialIndex = 0,
    loop = true,
    onConfirm = null,
    onCancel = null,
    onMove = null,
    onLeft = null,
    onRight = null,
  }) {
    this.app = app;
    this.root = root;
    this.selector = selector;
    this.loop = loop;
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;
    this.onMove = onMove;
    this.onLeft = onLeft;
    this.onRight = onRight;
    this.selectedIndex = initialIndex;
    this.items = [];
    this.refresh(initialIndex);
  }

  refresh(preferredIndex = this.selectedIndex) {
    this.items.forEach(el => {
      el.classList.remove('is-selected');
      el.removeAttribute('aria-selected');
    });
    this.items = Array.from(this.root.querySelectorAll(this.selector));
    const fallback = this.findSelectableIndex(preferredIndex, 1);
    this.selectedIndex = fallback;
    this.applySelection();
  }

  destroy() {
    this.items.forEach(el => {
      el.classList.remove('is-selected');
      el.removeAttribute('aria-selected');
    });
    this.items = [];
  }

  findSelectableIndex(startIndex, direction) {
    if (!this.items.length) return -1;
    const count = this.items.length;
    let index = Math.max(0, Math.min(count - 1, startIndex));
    for (let i = 0; i < count; i += 1) {
      const candidate = this.items[index];
      if (canSelect(candidate)) return index;
      index += direction >= 0 ? 1 : -1;
      if (this.loop) {
        index = (index + count) % count;
      } else {
        index = Math.max(0, Math.min(count - 1, index));
      }
    }
    return -1;
  }

  move(delta) {
    if (!this.items.length) return;
    const count = this.items.length;
    let index = this.selectedIndex;
    for (let i = 0; i < count; i += 1) {
      index += delta;
      if (this.loop) {
        index = (index + count) % count;
      } else if (index < 0 || index >= count) {
        return;
      }
      if (canSelect(this.items[index])) {
        this.selectedIndex = index;
        this.applySelection();
        this.app.audio?.playSfx?.('ui_move');
        return;
      }
    }
  }

  applySelection() {
    this.items.forEach((el, index) => {
      const selected = index === this.selectedIndex;
      el.classList.toggle('is-selected', selected);
      if (selected) {
        el.setAttribute('aria-selected', 'true');
        el.focus?.({ preventScroll: true });
        el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      } else {
        el.removeAttribute('aria-selected');
      }
    });
    if (this.selectedIndex >= 0) {
      this.onMove?.(this.items[this.selectedIndex], this.selectedIndex, this);
    }
  }

  selectedItem() {
    if (this.selectedIndex < 0) return null;
    return this.items[this.selectedIndex] || null;
  }

  confirm() {
    const item = this.selectedItem();
    if (!canSelect(item)) return;
    if (this.onConfirm) {
      this.onConfirm(item, this.selectedIndex, this);
      return;
    }
    item.click?.();
  }

  update() {
    const input = this.app.input;
    if (!input) return;
    if (input.wasPressed(INPUT_ACTIONS.UI_UP)) this.move(-1);
    if (input.wasPressed(INPUT_ACTIONS.UI_DOWN)) this.move(1);
    if (input.wasPressed(INPUT_ACTIONS.UI_LEFT)) {
      if (this.onLeft) this.onLeft(this.selectedItem(), this.selectedIndex, this);
      else this.move(-1);
    }
    if (input.wasPressed(INPUT_ACTIONS.UI_RIGHT)) {
      if (this.onRight) this.onRight(this.selectedItem(), this.selectedIndex, this);
      else this.move(1);
    }
    if (input.wasPressed(INPUT_ACTIONS.UI_CONFIRM)) this.confirm();
    if (input.wasPressed(INPUT_ACTIONS.UI_CANCEL)) this.onCancel?.(this.selectedItem(), this.selectedIndex, this);
  }
}
