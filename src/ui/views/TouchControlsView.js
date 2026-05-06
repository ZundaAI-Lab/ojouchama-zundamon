/**
 * 責務: ステージ中のタッチ操作DOM生成と破棄を担当する。
 * 更新ルール: 入力状態の解釈はInputSystem側に置き、DOM操作に限定する。左側の円形方向パッドは中央からの位置を仮想方向入力へ変換し、ジャンプは飛ボタンだけで扱う。
 * 更新ルール: なのボタンだけはタッチ固有のフリックを仮想方向入力＋なのボタン押下パルスへ変換する。
 * 更新ルール: タッチ操作の配置・サイズ・濃度はセーブ設定から読み込み、キーコンフィグとは別設定として扱う。
 * 更新ルール: 画面遷移などでpointerupを受け取れない場合に備え、このViewが押下した仮想入力はdestroy時に必ず解除する。
 */
import { INPUT_ACTIONS } from '../../config/inputActions.js';
import { DEFAULT_TOUCH_CONFIG, normalizeTouchConfig } from '../../config/controlSettings.js';

const DIRECTION_PAD_MAX_OFFSET_RATIO = 0.26;
const NANO_FLICK_MIN_DISTANCE = 18;
const NANO_PULSE_MS = 50;

export class TouchControlsView {
  constructor(app) {
    this.app = app;
    this.root = null;
    this.settings = normalizeTouchConfig(DEFAULT_TOUCH_CONFIG);
    this.activeVirtualActions = new Map();
  }

  mount() {
    if (this.root) return this.root;
    this.settings = this.loadSettings();
    this.root = document.createElement('div');
    this.root.className = 'touch-controls';
    this.applyRootSettings();

    const left = document.createElement('div');
    left.className = 'touch-left';
    left.append(this.makeDirectionPad());

    const right = document.createElement('div');
    right.className = 'touch-right';
    right.append(
      this.makeBtn('茶', INPUT_ACTIONS.TEA, true),
      this.makeBtn('礼', INPUT_ACTIONS.BOW, true),
      this.makeNanoBtn('なの'),
      this.makeBtn('魔法', INPUT_ACTIONS.MAGIC, true),
      this.makeBtn('飛', INPUT_ACTIONS.JUMP, true, 'jump'),
    );
    this.root.append(left, right);
    this.app.uiRoot.append(this.root);
    return this.root;
  }

  loadSettings() {
    return normalizeTouchConfig(this.app.save?.load?.().settings?.touchControls || DEFAULT_TOUCH_CONFIG);
  }

  applyRootSettings() {
    if (!this.root) return;
    this.root.classList.toggle('touch-disabled', !this.settings.enabled);
    this.root.classList.toggle('touch-left-handed', this.settings.layout === 'leftHanded');
    this.root.style.setProperty('--touch-pad-size', `${this.settings.padSize}px`);
    this.root.style.setProperty('--touch-button-size', `${this.settings.buttonSize}px`);
    this.root.style.setProperty('--touch-opacity', String(this.settings.opacity));
  }

  reloadSettings() {
    this.settings = this.loadSettings();
    this.applyRootSettings();
  }

  setTouchVirtual(action, isDown) {
    const current = this.activeVirtualActions.get(action) || 0;
    if (isDown) {
      this.activeVirtualActions.set(action, current + 1);
      this.app.input.setVirtual(action, true);
      return;
    }
    if (current <= 0) return;
    const next = current - 1;
    if (next > 0) this.activeVirtualActions.set(action, next);
    else this.activeVirtualActions.delete(action);
    this.app.input.setVirtual(action, false);
  }

  clearTouchVirtualActions() {
    for (const [action, count] of [...this.activeVirtualActions.entries()]) {
      for (let i = 0; i < count; i += 1) {
        this.app.input.setVirtual(action, false);
      }
    }
    this.activeVirtualActions.clear();
  }

  makeDirectionPad() {
    const pad = document.createElement('button');
    pad.className = 'touch-direction-pad';
    pad.tabIndex = -1;
    pad.setAttribute('aria-hidden', 'true');

    const base = document.createElement('span');
    base.className = 'touch-direction-pad-base';
    const knob = document.createElement('span');
    knob.className = 'touch-direction-pad-knob';
    const label = document.createElement('span');
    label.className = 'touch-direction-pad-label';
    label.textContent = '移動';
    pad.append(base, knob, label);

    let pointerId = null;
    let activeActions = new Set();

    const clearActions = () => {
      for (const action of activeActions) {
        this.setTouchVirtual(action, false);
      }
      activeActions = new Set();
      knob.style.transform = '';
    };

    const applyActions = nextActions => {
      const nextSet = new Set(nextActions);
      for (const action of activeActions) {
        if (!nextSet.has(action)) this.setTouchVirtual(action, false);
      }
      for (const action of nextSet) {
        if (!activeActions.has(action)) this.setTouchVirtual(action, true);
      }
      activeActions = nextSet;
    };

    const updateFromPointer = e => {
      const rect = pad.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.hypot(dx, dy);

      if (distance < this.settings.deadZone) {
        applyActions([]);
        knob.style.transform = '';
        return;
      }

      const actions = [];
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;
      if (Math.abs(normalizedX) >= 0.36) {
        actions.push(normalizedX > 0 ? INPUT_ACTIONS.RIGHT : INPUT_ACTIONS.LEFT);
      }
      if (Math.abs(normalizedY) >= 0.36) {
        actions.push(normalizedY > 0 ? INPUT_ACTIONS.DOWN : INPUT_ACTIONS.UP);
      }
      applyActions(actions);

      const maxOffset = Math.max(18, rect.width * DIRECTION_PAD_MAX_OFFSET_RATIO);
      const knobDistance = Math.min(distance, maxOffset);
      knob.style.transform = `translate(${normalizedX * knobDistance}px, ${normalizedY * knobDistance}px)`;
    };

    pad.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (pointerId !== null) return;
      pointerId = e.pointerId;
      pad.setPointerCapture?.(e.pointerId);
      updateFromPointer(e);
    });

    pad.addEventListener('pointermove', e => {
      if (pointerId !== e.pointerId) return;
      e.preventDefault();
      updateFromPointer(e);
    });

    const release = e => {
      e.preventDefault();
      if (pointerId !== e.pointerId) return;
      clearActions();
      pad.releasePointerCapture?.(e.pointerId);
      pointerId = null;
    };

    pad.addEventListener('pointerup', release);
    pad.addEventListener('pointercancel', release);
    pad.addEventListener('lostpointercapture', e => {
      if (pointerId !== e.pointerId) return;
      clearActions();
      pointerId = null;
    });
    return pad;
  }

  makeBtn(text, actions, small = false, variant = '') {
    const btn = document.createElement('button');
    btn.className = ['touch-btn', small ? 'small' : '', variant ? `touch-btn-${variant}` : ''].filter(Boolean).join(' ');
    btn.textContent = text;
    btn.tabIndex = -1;
    btn.setAttribute('aria-hidden', 'true');
    const actionList = Array.isArray(actions) ? actions : [actions];
    let active = false;
    const down = e => {
      e.preventDefault();
      if (active) return;
      active = true;
      btn.setPointerCapture?.(e.pointerId);
      actionList.forEach(action => this.setTouchVirtual(action, true));
    };
    const up = e => {
      e.preventDefault();
      if (!active) return;
      active = false;
      actionList.forEach(action => this.setTouchVirtual(action, false));
      btn.releasePointerCapture?.(e.pointerId);
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('lostpointercapture', up);
    return btn;
  }

  makeNanoBtn(text) {
    const btn = document.createElement('button');
    btn.className = 'touch-btn small';
    btn.textContent = text;
    btn.tabIndex = -1;
    btn.setAttribute('aria-hidden', 'true');
    let pointerId = null;
    let startX = 0;
    let startY = 0;

    const clearCapture = e => {
      if (pointerId === null) return;
      btn.releasePointerCapture?.(e.pointerId);
      pointerId = null;
    };

    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (pointerId !== null) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      btn.setPointerCapture?.(e.pointerId);
    });

    btn.addEventListener('pointerup', e => {
      e.preventDefault();
      if (pointerId !== e.pointerId) return;
      const actions = this.getNanoFlickActions(e.clientX - startX, e.clientY - startY);
      this.pulseNano(actions);
      clearCapture(e);
    });

    const cancel = e => {
      e.preventDefault();
      clearCapture(e);
    };
    btn.addEventListener('pointercancel', cancel);
    btn.addEventListener('lostpointercapture', cancel);
    return btn;
  }

  getNanoFlickActions(dx, dy) {
    if (Math.hypot(dx, dy) < NANO_FLICK_MIN_DISTANCE) return [];
    const actions = [];
    if (Math.abs(dx) >= NANO_FLICK_MIN_DISTANCE * 0.55) {
      actions.push(dx > 0 ? INPUT_ACTIONS.RIGHT : INPUT_ACTIONS.LEFT);
    }
    if (Math.abs(dy) >= NANO_FLICK_MIN_DISTANCE * 0.55) {
      actions.push(dy > 0 ? INPUT_ACTIONS.DOWN : INPUT_ACTIONS.UP);
    }
    return actions;
  }

  pulseNano(directionActions) {
    const actions = [...directionActions, INPUT_ACTIONS.NANO];
    actions.forEach(action => this.setTouchVirtual(action, true));
    window.setTimeout(() => {
      actions.forEach(action => this.setTouchVirtual(action, false));
    }, NANO_PULSE_MS);
  }

  setDialogueMode(active) {
    this.root?.classList.toggle('dialogue-hidden', active);
  }

  destroy() {
    this.clearTouchVirtualActions();
    this.root?.remove();
    this.root = null;
  }
}
