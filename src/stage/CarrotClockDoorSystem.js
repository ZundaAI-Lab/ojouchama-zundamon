/**
 * 責務: にんじん時計扉の時刻状態、複数switchId入力の立ち上がり検出、針アニメーション、開閉判定を担当する。
 * 更新ルール: スイッチ側のON/OFF生成はSwitchGimmickSystem/SwitchStateSystemへ任せ、ここでは扉側がON入力や収集アイテム通知を時刻増減として解釈する。
 * 更新ルール: 扉の衝突反映はSwitchTargetSystemへ返すdesiredOpenに限定し、物理形状の生成や描画は持たない。
 */
export const CARROT_CLOCK_DOOR_KIND = 'carrotClockDoor';

const DEFAULT_CLOCK_MODULO = 12;
const DEFAULT_HAND_ANIM_DURATION = 0.34;

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

export function isCarrotClockDoor(door) {
  return door?.kind === CARROT_CLOCK_DOOR_KIND;
}

export function normalizeClockModulo(door) {
  return Math.max(2, Math.floor(isFiniteNumber(door.clockModulo) ? door.clockModulo : DEFAULT_CLOCK_MODULO));
}

export function normalizeClockTime(value, modulo = DEFAULT_CLOCK_MODULO) {
  const number = isFiniteNumber(value) ? Math.floor(value) : 0;
  return ((number % modulo) + modulo) % modulo;
}

function getInitialTime(door, modulo) {
  return normalizeClockTime(door.initialTime ?? door.clockTime ?? 0, modulo);
}

function getTargetTime(door, modulo) {
  return normalizeClockTime(door.targetTime ?? 0, modulo);
}

function getClockInputs(door) {
  return Array.isArray(door.clockInputs) ? door.clockInputs : [];
}

function getInputSwitchId(input) {
  return input?.switchId || input?.id || '';
}

function getInputStep(input) {
  return isFiniteNumber(input?.step) ? Math.floor(input.step) : 1;
}

function getHandAnimDuration(door) {
  return Math.max(0, isFiniteNumber(door.handAnimDuration) ? door.handAnimDuration : DEFAULT_HAND_ANIM_DURATION);
}

function initializeDoor(door) {
  const modulo = normalizeClockModulo(door);
  if (door._clockRuntimeInitialized) {
    door.clockModulo = modulo;
    return;
  }
  const initialTime = getInitialTime(door, modulo);
  door.clockModulo = modulo;
  door.clockTime = initialTime;
  door.clockHandDisplay = initialTime;
  door.clockHandFrom = initialTime;
  door.clockHandTo = initialTime;
  door.clockHandTimer = 0;
  door.clockInputWasOn = {};
  door._clockRuntimeInitialized = true;
}

function easeOutCubic(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - ((1 - clamped) ** 3);
}

function advanceHandAnimation(door, dt) {
  if (!isFiniteNumber(dt) || dt <= 0) return;
  const duration = getHandAnimDuration(door);
  if (duration <= 0 || (door.clockHandTimer || 0) <= 0) {
    door.clockHandTimer = 0;
    door.clockHandDisplay = door.clockHandTo ?? door.clockTime ?? 0;
    return;
  }
  door.clockHandTimer = Math.max(0, door.clockHandTimer - dt);
  const progress = easeOutCubic(1 - (door.clockHandTimer / duration));
  const from = door.clockHandFrom ?? door.clockTime ?? 0;
  const to = door.clockHandTo ?? door.clockTime ?? 0;
  door.clockHandDisplay = from + (to - from) * progress;
  if (door.clockHandTimer <= 0) door.clockHandDisplay = to;
}

function startHandAnimation(door, deltaStep, modulo) {
  const duration = getHandAnimDuration(door);
  const from = isFiniteNumber(door.clockHandDisplay) ? door.clockHandDisplay : (door.clockTime || 0);
  const to = from + deltaStep;
  door.clockHandFrom = from;
  door.clockHandTo = to;
  door.clockHandTimer = duration;
  door.clockHandDisplay = duration > 0 ? from : to;
  door.clockTime = normalizeClockTime(door.clockTime + deltaStep, modulo);
}

function consumeRisingInputs(door, switchState) {
  const inputs = getClockInputs(door);
  if (!door.clockInputWasOn || typeof door.clockInputWasOn !== 'object') door.clockInputWasOn = {};
  let delta = 0;
  for (const input of inputs) {
    const switchId = getInputSwitchId(input);
    if (!switchId) continue;
    const on = !!switchState?.isOn?.(switchId);
    const wasOn = !!door.clockInputWasOn[switchId];
    if (on && !wasOn) delta += getInputStep(input);
    door.clockInputWasOn[switchId] = on;
  }
  return delta;
}

function isMatched(door, modulo) {
  return normalizeClockTime(door.clockTime, modulo) === getTargetTime(door, modulo);
}

export class CarrotClockDoorSystem {
  constructor(stage, switchState) {
    this.stage = stage;
    this.switchState = switchState;
    this.pendingDoorSteps = new Map();
  }

  requestAdvanceByDoorId(doorId, delta = 1) {
    if (!doorId || !isFiniteNumber(delta)) return;
    const normalizedDelta = Math.trunc(delta);
    if (normalizedDelta === 0) return;
    this.pendingDoorSteps.set(doorId, (this.pendingDoorSteps.get(doorId) || 0) + normalizedDelta);
  }

  consumePendingDoorDelta(door) {
    const doorId = door?.id;
    if (!doorId || !this.pendingDoorSteps.has(doorId)) return 0;
    const delta = this.pendingDoorSteps.get(doorId) || 0;
    this.pendingDoorSteps.delete(doorId);
    return delta;
  }

  shouldAdvanceAnimation(runtime, door) {
    const elapsed = runtime?.elapsed;
    if (!isFiniteNumber(elapsed)) return true;
    if (door._clockLastAnimationElapsed === elapsed) return false;
    door._clockLastAnimationElapsed = elapsed;
    return true;
  }

  updateDoor(runtime, door) {
    initializeDoor(door);
    const modulo = normalizeClockModulo(door);
    const shouldAnimate = this.shouldAdvanceAnimation(runtime, door);
    if (shouldAnimate) advanceHandAnimation(door, runtime?.lastDt || 0);

    const delta = consumeRisingInputs(door, this.switchState) + this.consumePendingDoorDelta(door);
    if (delta !== 0) {
      startHandAnimation(door, delta, modulo);
      if (door.feedback !== false) runtime?.app?.audio?.playSfx?.('gimmick_switch');
    }

    door.clockTargetTime = getTargetTime(door, modulo);
    door.clockMatched = isMatched(door, modulo);
    return door.openWhenMatched !== false ? door.clockMatched : !door.clockMatched;
  }
}
