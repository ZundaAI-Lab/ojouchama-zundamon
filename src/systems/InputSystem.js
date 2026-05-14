/**
 * 責務: キーボード・マウス・仮想ボタンの入力状態・押下検出を担当する。
 * 更新ルール: プレイヤー固有の行動解釈はPlayerControllerへ任せ、なのちゃん操作のような新規入力はINPUT_ACTIONS経由で追加する。
 * 更新ルール: 固定物理ステップでは押下入力を最初の1ステップだけに消費し、複数ステップ更新でジャンプ/決定が多重発火しないようにする。
 * 更新ルール: キーコンフィグはアクション名から最大2入力へ割り当て、UI操作用の最低限キーは固定マップとして残す。
 * 更新ルール: マウス左/右/ホイールクリックは押下入力、ホイールスクロールは短いパルス入力として扱う。
 * 更新ルール: 魔法・なのちゃんをマウスへ割り当てた場合、押下中のマウス移動を発射専用フリック方向として扱い、通常の移動方向入力とは混ぜない。
 */
import { INPUT_ACTIONS } from '../config/inputActions.js';
import { DEFAULT_KEY_BINDINGS, normalizeKeyBindings } from '../config/controlSettings.js';

const UI_KEY_MAP = new Map([
  ['ArrowLeft', [INPUT_ACTIONS.UI_LEFT]],
  ['KeyA', [INPUT_ACTIONS.UI_LEFT]],
  ['ArrowRight', [INPUT_ACTIONS.UI_RIGHT]],
  ['KeyD', [INPUT_ACTIONS.UI_RIGHT]],
  ['ArrowUp', [INPUT_ACTIONS.UI_UP]],
  ['KeyW', [INPUT_ACTIONS.UI_UP]],
  ['ArrowDown', [INPUT_ACTIONS.UI_DOWN]],
  ['KeyS', [INPUT_ACTIONS.UI_DOWN]],
  ['Space', [INPUT_ACTIONS.UI_CONFIRM]],
  ['KeyZ', [INPUT_ACTIONS.UI_CONFIRM]],
  ['Enter', [INPUT_ACTIONS.CONFIRM, INPUT_ACTIONS.UI_CONFIRM]],
  ['Escape', [INPUT_ACTIONS.CANCEL, INPUT_ACTIONS.UI_CANCEL]],
]);

const MOUSE_BUTTON_CODES = new Map([
  [0, 'MouseLeft'],
  [1, 'MouseMiddle'],
  [2, 'MouseRight'],
]);

const MOUSE_WHEEL_CODE = 'MouseWheel';
const WHEEL_PULSE_MS = 48;
const ACTION_AIM_BUFFER_MS = 140;
const ACTION_MOUSE_PULSE_MS = 50;
const MOUSE_FLICK_MIN_DISTANCE = 18;
const FLICK_AXIS_RATIO = 0.55;
const FLICK_ACTIONS = new Set([INPUT_ACTIONS.MAGIC, INPUT_ACTIONS.NANO]);

const GAMEPLAY_ACTIONS = [
  INPUT_ACTIONS.LEFT,
  INPUT_ACTIONS.RIGHT,
  INPUT_ACTIONS.UP,
  INPUT_ACTIONS.DOWN,
  INPUT_ACTIONS.JUMP,
  INPUT_ACTIONS.MAGIC,
  INPUT_ACTIONS.BOW,
  INPUT_ACTIONS.TEA,
  INPUT_ACTIONS.NANO,
  INPUT_ACTIONS.PAUSE,
];

function cloneBindings(bindings) {
  return Object.fromEntries(Object.entries(bindings).map(([action, slots]) => [action, [...slots]]));
}

function shouldIgnoreMouseTarget(target) {
  if (!(target instanceof Element)) return false;
  return !!target.closest('#ui-root, .touch-controls, button, a, input, select, textarea, [contenteditable="true"]');
}

function nowMs() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();
}

function signAxis(value) {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

function getFlickDirection(dx, dy) {
  if (Math.hypot(dx, dy) < MOUSE_FLICK_MIN_DISTANCE) return null;
  const direction = { x: 0, y: 0 };
  if (Math.abs(dx) >= MOUSE_FLICK_MIN_DISTANCE * FLICK_AXIS_RATIO) direction.x = signAxis(dx);
  if (Math.abs(dy) >= MOUSE_FLICK_MIN_DISTANCE * FLICK_AXIS_RATIO) direction.y = signAxis(dy);
  return direction.x !== 0 || direction.y !== 0 ? direction : null;
}

export class InputSystem {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.virtualRefCounts = new Map();
    this.physicalRefCounts = new Map();
    this.activePhysicalSources = new Map();
    this.actionAims = new Map();
    this.activeMouseGestures = new Map();
    this.wheelPulseId = 0;
    this.mousePulseId = 0;
    this.keyBindings = normalizeKeyBindings(DEFAULT_KEY_BINDINGS);
    this.keyActionMap = new Map();
    this.rebuildKeyActionMap();
    this.handleKey = this.handleKey.bind(this);
    this.handleMouse = this.handleMouse.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    window.addEventListener('keydown', this.handleKey);
    window.addEventListener('keyup', this.handleKey);
    window.addEventListener('mousedown', this.handleMouse);
    window.addEventListener('mouseup', this.handleMouse);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('wheel', this.handleWheel, { passive: false });
    window.addEventListener('contextmenu', this.handleContextMenu);
  }

  setKeyBindings(bindings) {
    this.keyBindings = normalizeKeyBindings(bindings);
    this.rebuildKeyActionMap();
    this.clearKeyboardDrivenGameplay();
  }

  getKeyBindings() {
    return cloneBindings(this.keyBindings);
  }

  rebuildKeyActionMap() {
    this.keyActionMap = new Map();
    for (const [action, slots] of Object.entries(this.keyBindings)) {
      for (const code of slots) {
        if (!code) continue;
        if (!this.keyActionMap.has(code)) this.keyActionMap.set(code, []);
        this.keyActionMap.get(code).push(action);
      }
    }
  }

  handleKey(event) {
    const gameplayActions = this.keyActionMap.get(event.code) || [];
    const uiActions = UI_KEY_MAP.get(event.code) || [];
    const actions = [...new Set([...gameplayActions, ...uiActions])];
    if (!actions.length) return;
    event.preventDefault();
    this.setPhysicalActions(`key:${event.code}`, actions, event.type === 'keydown');
  }

  handleMouse(event) {
    const code = MOUSE_BUTTON_CODES.get(event.button);
    if (!code) return;

    if (event.type === 'mouseup') {
      const handled = this.finishMouseButton(code, event);
      if (handled) event.preventDefault();
      return;
    }

    if (shouldIgnoreMouseTarget(event.target)) return;
    const actions = this.keyActionMap.get(code) || [];
    if (!actions.length) return;
    event.preventDefault();

    const flickActions = actions.filter(action => FLICK_ACTIONS.has(action));
    const normalActions = actions.filter(action => !FLICK_ACTIONS.has(action));
    if (normalActions.length) this.setPhysicalActions(this.getMouseNormalSourceId(code), normalActions, true);
    if (flickActions.length) this.startMouseGesture(code, flickActions, event);
  }

  handleMouseMove(event) {
    if (this.activeMouseGestures.size <= 0) return;
    for (const gesture of this.activeMouseGestures.values()) {
      gesture.currentX = event.clientX;
      gesture.currentY = event.clientY;
    }
  }

  finishMouseButton(code, event) {
    let handled = false;
    const normalSourceId = this.getMouseNormalSourceId(code);
    if (this.activePhysicalSources.has(normalSourceId)) {
      this.setPhysicalActions(normalSourceId, [], false);
      handled = true;
    }

    const gesture = this.activeMouseGestures.get(code);
    if (gesture) {
      gesture.currentX = event.clientX;
      gesture.currentY = event.clientY;
      const aim = getFlickDirection(gesture.currentX - gesture.startX, gesture.currentY - gesture.startY);
      for (const action of gesture.actions) {
        if (aim) this.setActionAim(action, aim);
        this.pulsePhysicalAction(action);
      }
      this.activeMouseGestures.delete(code);
      handled = true;
    }
    return handled;
  }

  getMouseNormalSourceId(code) {
    return `mouse:${code}:normal`;
  }

  startMouseGesture(code, actions, event) {
    this.activeMouseGestures.set(code, {
      actions: [...new Set(actions)],
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
    });
  }

  handleWheel(event) {
    if (shouldIgnoreMouseTarget(event.target)) return;
    const actions = this.keyActionMap.get(MOUSE_WHEEL_CODE) || [];
    if (!actions.length) return;
    event.preventDefault();
    const sourceId = `wheel:${this.wheelPulseId += 1}`;
    this.setPhysicalActions(sourceId, actions, true);
    actions.forEach(action => this.pressed.add(action));
    window.setTimeout(() => this.setPhysicalActions(sourceId, actions, false), WHEEL_PULSE_MS);
  }

  handleContextMenu(event) {
    if (shouldIgnoreMouseTarget(event.target)) return;
    if ((this.keyActionMap.get('MouseRight') || []).length <= 0) return;
    event.preventDefault();
  }

  setActionAim(action, direction, durationMs = ACTION_AIM_BUFFER_MS) {
    if (!FLICK_ACTIONS.has(action)) return;
    const x = signAxis(direction?.x || 0);
    const y = signAxis(direction?.y || 0);
    if (x === 0 && y === 0) return;
    this.actionAims.set(action, {
      x,
      y,
      expiresAt: nowMs() + durationMs,
    });
  }

  getActionAim(action) {
    const aim = this.actionAims.get(action);
    if (!aim) return null;
    if (aim.expiresAt <= nowMs()) {
      this.actionAims.delete(action);
      return null;
    }
    return { x: aim.x, y: aim.y };
  }

  pulsePhysicalAction(action) {
    const sourceId = `mouse-pulse:${this.mousePulseId += 1}:${action}`;
    this.setPhysicalActions(sourceId, [action], true);
    window.setTimeout(() => this.setPhysicalActions(sourceId, [action], false), ACTION_MOUSE_PULSE_MS);
  }

  setPhysicalActions(sourceId, actions, isDown) {
    const normalized = [...new Set(actions || [])];
    const previous = this.activePhysicalSources.get(sourceId) || [];
    if (isDown) {
      if (previous.length > 0) return;
      this.activePhysicalSources.set(sourceId, normalized);
      normalized.forEach(action => this.addPhysicalRef(action));
    } else {
      if (!previous.length) return;
      this.activePhysicalSources.delete(sourceId);
      previous.forEach(action => this.removePhysicalRef(action));
    }
  }

  addPhysicalRef(action) {
    const wasDown = this.isActionActive(action);
    this.physicalRefCounts.set(action, (this.physicalRefCounts.get(action) || 0) + 1);
    this.applyActionState(action, wasDown);
  }

  removePhysicalRef(action) {
    const wasDown = this.isActionActive(action);
    const next = Math.max(0, (this.physicalRefCounts.get(action) || 0) - 1);
    if (next > 0) this.physicalRefCounts.set(action, next);
    else this.physicalRefCounts.delete(action);
    this.applyActionState(action, wasDown);
  }

  setVirtual(action, isDown) {
    const wasDown = this.isActionActive(action);
    const current = this.virtualRefCounts.get(action) || 0;
    const next = isDown ? current + 1 : Math.max(0, current - 1);
    if (next > 0) this.virtualRefCounts.set(action, next);
    else this.virtualRefCounts.delete(action);
    this.applyActionState(action, wasDown);
  }

  isActionActive(action) {
    return (this.physicalRefCounts.get(action) || 0) > 0 || (this.virtualRefCounts.get(action) || 0) > 0;
  }

  applyActionState(action, wasDown) {
    const isDown = this.isActionActive(action);
    if (isDown) {
      if (!wasDown) this.pressed.add(action);
      this.down.add(action);
    } else {
      this.down.delete(action);
    }
  }

  clearKeyboardDrivenGameplay() {
    const gameplaySet = new Set(GAMEPLAY_ACTIONS);
    this.activeMouseGestures.clear();
    for (const [sourceId, actions] of [...this.activePhysicalSources.entries()]) {
      const gameplayActions = actions.filter(action => gameplaySet.has(action));
      if (!gameplayActions.length) continue;
      const remainingActions = actions.filter(action => !gameplaySet.has(action));
      if (remainingActions.length) this.activePhysicalSources.set(sourceId, remainingActions);
      else this.activePhysicalSources.delete(sourceId);
      gameplayActions.forEach(action => this.removePhysicalRef(action));
    }
  }

  clearGameplay() {
    const gameplaySet = new Set(GAMEPLAY_ACTIONS);
    this.activeMouseGestures.clear();
    for (const [sourceId, actions] of [...this.activePhysicalSources.entries()]) {
      const gameplayActions = actions.filter(action => gameplaySet.has(action));
      if (!gameplayActions.length) continue;
      const remainingActions = actions.filter(action => !gameplaySet.has(action));
      if (remainingActions.length) this.activePhysicalSources.set(sourceId, remainingActions);
      else this.activePhysicalSources.delete(sourceId);
      gameplayActions.forEach(action => this.removePhysicalRef(action));
    }
    for (const action of GAMEPLAY_ACTIONS) {
      this.virtualRefCounts.delete(action);
      this.actionAims.delete(action);
      this.applyActionState(action, this.down.has(action));
    }
  }

  isDown(action) { return this.down.has(action); }
  wasPressed(action) { return this.pressed.has(action); }

  consumePressedForSimulationStep() {
    this.pressed.clear();
  }

  endFrame() {
    this.pressed.clear();
  }
}
