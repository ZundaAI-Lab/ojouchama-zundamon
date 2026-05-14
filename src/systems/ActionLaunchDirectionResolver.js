/**
 * 責務: 魔法・なのちゃんなどの発射系アクションに使う方向入力解釈を共通化する。
 * 更新ルール: 弾生成やなのちゃんの状態遷移は扱わず、上下軸・左右軸の短時間履歴、アクション押下後の方向待ち、発射専用フリック方向の合成だけを担当する。
 */
import { INPUT_ACTIONS } from '../config/inputActions.js';

const DEFAULT_DIRECTION_BUFFER_TIME = 0.15;
const DEFAULT_PRESS_DIRECTION_GRACE_TIME = 0.12;
const DEFAULT_DIAGONAL_SETTLE_TIME = 0.04;
const DIRECTION_THRESHOLD = 0.15;

function signAxis(value) {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

function normalizeDirection(axes) {
  const x = signAxis(axes?.x || 0);
  const y = signAxis(axes?.y || 0);
  if (x === 0 && y === 0) return { x: 0, y: 0 };
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

function classifyAxes(axes) {
  const x = signAxis(axes.x);
  const y = signAxis(axes.y);
  if (x !== 0 && y !== 0) return 'diagonal';
  if (x !== 0 || y !== 0) return 'single';
  return 'none';
}

export class ActionLaunchDirectionResolver {
  constructor(input, action, options = {}) {
    this.input = input;
    this.action = action;
    this.directionBufferTime = options.directionBufferTime ?? DEFAULT_DIRECTION_BUFFER_TIME;
    this.pressDirectionGraceTime = options.pressDirectionGraceTime ?? DEFAULT_PRESS_DIRECTION_GRACE_TIME;
    this.diagonalSettleTime = options.diagonalSettleTime ?? DEFAULT_DIAGONAL_SETTLE_TIME;

    this.lastX = 0;
    this.lastY = 0;
    this.xBufferTimer = 0;
    this.yBufferTimer = 0;
    this.pendingPressTimer = 0;
    this.pendingSingleAxes = { x: 0, y: 0 };
    this.singleSettleTimer = 0;
    this.pendingExpired = false;
  }

  update(dt = 0) {
    const current = this.readCurrentAxes();
    if (current.x !== 0) {
      this.lastX = current.x;
      this.xBufferTimer = this.directionBufferTime;
    } else {
      this.xBufferTimer = Math.max(0, this.xBufferTimer - dt);
    }

    if (current.y !== 0) {
      this.lastY = current.y;
      this.yBufferTimer = this.directionBufferTime;
    } else {
      this.yBufferTimer = Math.max(0, this.yBufferTimer - dt);
    }

    if (this.pendingPressTimer > 0) {
      this.pendingPressTimer -= dt;
      if (this.pendingPressTimer <= 0) {
        this.pendingPressTimer = 0;
        this.pendingExpired = true;
      }
      this.singleSettleTimer = Math.max(0, this.singleSettleTimer - dt);
    }
  }

  press() {
    return this.resolveOrPend();
  }

  consumePending() {
    if (this.pendingPressTimer <= 0 && !this.pendingExpired) return undefined;

    const axes = this.composeLaunchAxes();
    const type = classifyAxes(axes);
    if (type === 'diagonal') return this.finishWithDirection(axes);
    if (type === 'single') return this.resolveSingleAxisOrWait(axes);

    if (this.pendingPressTimer <= 0) return this.finishWithNull();
    return undefined;
  }

  readDirection() {
    return normalizeDirection(this.composeLaunchAxes());
  }

  hasDirection(direction) {
    return Math.hypot(direction?.x || 0, direction?.y || 0) > DIRECTION_THRESHOLD;
  }

  resolveOrPend() {
    const axes = this.composeLaunchAxes();
    const type = classifyAxes(axes);
    if (type === 'diagonal') return normalizeDirection(axes);

    this.pendingPressTimer = this.pressDirectionGraceTime;
    this.pendingSingleAxes = { x: 0, y: 0 };
    this.singleSettleTimer = 0;
    this.pendingExpired = false;

    if (type === 'single') {
      this.pendingSingleAxes = { x: signAxis(axes.x), y: signAxis(axes.y) };
      this.singleSettleTimer = this.diagonalSettleTime;
    }
    return undefined;
  }

  resolveSingleAxisOrWait(axes) {
    const nextSingle = { x: signAxis(axes.x), y: signAxis(axes.y) };
    if (nextSingle.x !== this.pendingSingleAxes.x || nextSingle.y !== this.pendingSingleAxes.y) {
      this.pendingSingleAxes = nextSingle;
      this.singleSettleTimer = this.diagonalSettleTime;
    }

    if (this.singleSettleTimer > 0 && this.pendingPressTimer > 0) return undefined;
    return this.finishWithDirection(nextSingle);
  }

  finishWithDirection(axes) {
    this.clearPending();
    return normalizeDirection(axes);
  }

  finishWithNull() {
    this.clearPending();
    return null;
  }

  clearPending() {
    this.pendingPressTimer = 0;
    this.singleSettleTimer = 0;
    this.pendingSingleAxes = { x: 0, y: 0 };
    this.pendingExpired = false;
  }

  composeLaunchAxes() {
    const current = this.readCurrentAxes();
    const axes = {
      x: current.x || (this.xBufferTimer > 0 ? this.lastX : 0),
      y: current.y || (this.yBufferTimer > 0 ? this.lastY : 0),
    };

    const aim = this.input.getActionAim?.(this.action);
    if (aim) {
      const aimX = signAxis(aim.x || 0);
      const aimY = signAxis(aim.y || 0);
      if (aimX !== 0) axes.x = aimX;
      if (aimY !== 0) axes.y = aimY;
    }
    return axes;
  }

  readCurrentAxes() {
    return {
      x: signAxis((this.input.isDown(INPUT_ACTIONS.RIGHT) ? 1 : 0) - (this.input.isDown(INPUT_ACTIONS.LEFT) ? 1 : 0)),
      y: signAxis((this.input.isDown(INPUT_ACTIONS.DOWN) ? 1 : 0) - (this.input.isDown(INPUT_ACTIONS.UP) ? 1 : 0)),
    };
  }
}
