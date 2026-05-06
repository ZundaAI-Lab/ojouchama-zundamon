/**
 * 責務: ボスの移動パターンを、ボス種別に依存しない汎用処理として担当する。
 * 更新ルール: 攻撃弾生成やHP変化は扱わず、移動IDとパラメータに基づく座標更新だけを行う。
 */
import { clamp } from '../../utils/math.js';

function approach(current, target, amount) {
  if (current < target) return Math.min(target, current + amount);
  if (current > target) return Math.max(target, current - amount);
  return target;
}

function getState(boss, key) {
  boss.patternState.movement[key] ??= {};
  return boss.patternState.movement[key];
}

function setHoverPosition(boss, x, y, params = {}, dt = 1 / 60) {
  const speed = params.approachSpeed ?? 220;
  boss.x = approach(boss.x, x, speed * dt);
  boss.y = approach(boss.y, y, speed * dt);
}

function clampArenaX(boss, x, params = {}) {
  const minX = boss.baseX + (params.minOffsetX ?? -95);
  const maxX = boss.baseX + (params.maxOffsetX ?? 95);
  return clamp(x, minX, maxX);
}

const MOVEMENT_PATTERNS = {
  sine_hover(boss, dt, scene, params = {}) {
    const rangeX = params.rangeX ?? 42;
    const rangeY = params.rangeY ?? 10;
    const speedX = params.speedX ?? 1.1;
    const speedY = params.speedY ?? 1.7;
    boss.x = boss.baseX + Math.sin(boss.timer * speedX) * rangeX;
    boss.y = boss.baseY + Math.sin(boss.timer * speedY) * rangeY;
  },

  bounce_hover(boss, dt, scene, params = {}) {
    const rangeX = params.rangeX ?? 46;
    const bobY = params.bobY ?? 5;
    const hopY = params.hopY ?? 16;
    const hop = Math.max(0, Math.sin(boss.timer * (params.hopSpeed ?? 2.8)));
    boss.x = boss.baseX + Math.sin(boss.timer * (params.speedX ?? 1.05)) * rangeX;
    boss.y = boss.baseY + Math.sin(boss.timer * 1.8) * bobY - hop * hopY;
  },

  waltz_hover(boss, dt, scene, params = {}) {
    const state = getState(boss, 'waltz_hover');
    const positions = params.positions ?? [
      { x: -58, y: -8 },
      { x: 0, y: -18 },
      { x: 58, y: -8 },
      { x: 0, y: 4 },
    ];
    state.timer = (state.timer ?? 0) - dt;
    if (state.timer <= 0) {
      state.index = ((state.index ?? -1) + 1) % positions.length;
      state.timer = params.hold ?? 1.15;
    }
    const p = positions[state.index ?? 0];
    setHoverPosition(
      boss,
      clampArenaX(boss, boss.baseX + p.x, params),
      boss.baseY + p.y + Math.sin(boss.timer * 2.2) * (params.bobY ?? 4),
      params,
      dt,
    );
  },

  step_hover_positions(boss, dt, scene, params = {}) {
    const state = getState(boss, 'step_hover_positions');
    const positions = params.positions ?? [
      { x: -74, y: -8 },
      { x: 0, y: -16 },
      { x: 74, y: -8 },
      { x: 0, y: 2 },
    ];
    state.timer = (state.timer ?? 0) - dt;
    if (state.timer <= 0) {
      state.index = ((state.index ?? -1) + 1) % positions.length;
      state.timer = params.hold ?? 1.35;
    }
    const p = positions[state.index ?? 0];
    setHoverPosition(
      boss,
      clampArenaX(boss, boss.baseX + p.x, params),
      boss.baseY + p.y + Math.sin(boss.timer * 1.6) * (params.bobY ?? 3),
      params,
      dt,
    );
  },

  sleepy_drift(boss, dt, scene, params = {}) {
    const state = getState(boss, 'sleepy_drift');
    state.napTimer = (state.napTimer ?? (params.napInterval ?? 3.2)) - dt;
    if (state.napTimer <= 0) {
      state.napTimer = params.napInterval ?? 3.2;
      state.napHold = params.napHold ?? 0.56;
    }
    state.napHold = Math.max(0, (state.napHold ?? 0) - dt);
    const napDrop = state.napHold > 0 ? Math.sin((state.napHold / (params.napHold ?? 0.56)) * Math.PI) * (params.napDropY ?? 8) : 0;
    boss.x = boss.baseX + Math.sin(boss.timer * (params.speedX ?? 0.72)) * (params.rangeX ?? 58);
    boss.y = boss.baseY + Math.sin(boss.timer * (params.speedY ?? 1.05)) * (params.rangeY ?? 12) + napDrop;
  },

  page_warp(boss, dt, scene, params = {}) {
    const state = getState(boss, 'page_warp');
    const positions = params.positions ?? [
      { x: -78, y: -18 },
      { x: 0, y: 4 },
      { x: 78, y: -18 },
      { x: 0, y: -30 },
    ];
    state.timer = (state.timer ?? (params.warpInterval ?? 2.55)) - dt;
    if (state.timer <= 0) {
      state.index = ((state.index ?? -1) + 1) % positions.length;
      state.timer = params.warpInterval ?? 2.55;
      scene.spawnSparkles(boss.x + boss.w / 2, boss.y + boss.h / 2, params.sparkleColor ?? '#cfc0ff', 10);
      const p = positions[state.index];
      boss.x = clampArenaX(boss, boss.baseX + p.x, params);
      boss.y = boss.baseY + p.y;
      scene.spawnSparkles(boss.x + boss.w / 2, boss.y + boss.h / 2, params.sparkleColor ?? '#cfc0ff', 10);
      return;
    }
    boss.x += Math.sin(boss.timer * 2.1) * (params.floatX ?? 0.18);
    boss.y = boss.y + Math.sin(boss.timer * 2.4) * (params.floatY ?? 0.12);
  },

  ritual_hover_positions(boss, dt, scene, params = {}) {
    const state = getState(boss, 'ritual_hover_positions');
    const positions = params.positions ?? [
      { x: 0, y: -34 },
      { x: -88, y: -16 },
      { x: 88, y: -16 },
      { x: 0, y: 4 },
    ];
    state.timer = (state.timer ?? 0) - dt;
    if (state.timer <= 0) {
      state.index = ((state.index ?? -1) + 1) % positions.length;
      state.timer = params.hold ?? 1.0;
    }
    const p = positions[state.index ?? 0];
    setHoverPosition(
      boss,
      clampArenaX(boss, boss.baseX + p.x, params),
      boss.baseY + p.y + Math.sin(boss.timer * 2.9) * (params.bobY ?? 5),
      params,
      dt,
    );
  },
};

export function updateBossMovementPattern(patternId, boss, dt, scene, params = {}) {
  const pattern = MOVEMENT_PATTERNS[patternId] ?? MOVEMENT_PATTERNS.sine_hover;
  pattern(boss, dt, scene, params);
}
