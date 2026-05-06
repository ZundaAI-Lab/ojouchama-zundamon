/**
 * 責務: 風船ライド定義の正規化、初期風船、既定値を提供する。
 * 更新ルール: 迷える住民データは通常ステージと同じ stage.residents に集約し、ここではライド区間そのものの設定だけを正規化する。
 * 更新ルール: スクロール方向はconfig.scrollModeで正規化し、横/上昇ライドの速度解釈はこのモジュールに集約する。
 */
export const DEFAULT_BALLOON_RIDE_CONFIG = Object.freeze({
  scrollMode: 'horizontal',
  scrollSpeed: 82,
  moveSpeedX: 146,
  moveSpeedY: 128,
  accel: 720,
  drag: 820,
  startDelay: 0.46,
  startLiftY: 18,
  startInvincible: 0.7,
  hitGrace: 0.82,
  hitVisualTime: 0.38,
  failTime: 0.92,
  clearTime: 0.85,
  rideBobSpeed: 4.2,
  rideBobAmount: 2.2,
  balloonLossDownDrift: 10,
  bounds: { minX: 72, maxX: 372, minY: 38, maxY: 218 },
});

const BALLOON_ORDER = Object.freeze(['orange', 'blue', 'yellow', 'pink']);
const ROYAL_BALLOON_ORDER = Object.freeze(['blue', 'yellow', 'pink']);
function cloneRect(rect, fallback = {}) {
  return { ...fallback, ...(rect || {}) };
}

export function normalizeBalloonRideConfig(config = {}) {
  return {
    ...DEFAULT_BALLOON_RIDE_CONFIG,
    ...config,
    bounds: { ...DEFAULT_BALLOON_RIDE_CONFIG.bounds, ...(config.bounds || {}) },
  };
}


export function getBalloonRideScrollVector(config = DEFAULT_BALLOON_RIDE_CONFIG) {
  const mode = config.scrollMode || DEFAULT_BALLOON_RIDE_CONFIG.scrollMode;
  if (mode === 'verticalUp') {
    return {
      x: Number.isFinite(config.scrollSpeedX) ? config.scrollSpeedX : 0,
      y: -Math.abs(Number.isFinite(config.scrollSpeedY) ? config.scrollSpeedY : (config.scrollSpeed ?? DEFAULT_BALLOON_RIDE_CONFIG.scrollSpeed)),
    };
  }
  return {
    x: Number.isFinite(config.scrollSpeedX) ? config.scrollSpeedX : (config.scrollSpeed ?? DEFAULT_BALLOON_RIDE_CONFIG.scrollSpeed),
    y: 0,
  };
}

export function isVerticalUpBalloonRide(config = DEFAULT_BALLOON_RIDE_CONFIG) {
  return (config.scrollMode || DEFAULT_BALLOON_RIDE_CONFIG.scrollMode) === 'verticalUp';
}

export function getInitialRideBalloons(runtime) {
  return [...(runtime.settings?.difficulty === 'royal' ? ROYAL_BALLOON_ORDER : BALLOON_ORDER)];
}

export function normalizeBalloonRideDefinition(ride) {
  return {
    ...ride,
    config: normalizeBalloonRideConfig(ride.config),
    start: cloneRect(ride.start, { w: 74, h: 92 }),
    goal: cloneRect(ride.goal, { w: 170, h: 34 }),
    hazards: (ride.hazards || []).map(hazard => ({ ...hazard, alive: true, age: 0 })),
  };
}
