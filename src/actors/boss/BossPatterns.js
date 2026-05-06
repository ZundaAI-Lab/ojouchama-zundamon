/**
 * 責務: ボスの移動パターン・攻撃パターン・フェーズ切替を接続する。
 * 更新ルール: ボス種別名に依存した処理本体は持たず、ボスIDから汎用パターンIDとパラメータを選ぶだけにする。
 */
import { updateBossMovementPattern } from './BossMovementPatterns.js';
import { updateBossAttackPattern } from './BossAttackPatterns.js';

const DEFAULT_BOSS_PATTERN = {
  phaseChangeHpRatio: 0.5,
  phase1: {
    movement: { id: 'sine_hover', params: { rangeX: 42, rangeY: 10 } },
    attack: { id: 'formal_tea', params: { interval: 1.25 } },
  },
  phase2: {
    movement: { id: 'sine_hover', params: { rangeX: 54, rangeY: 14, speedX: 1.28, speedY: 1.95 } },
    attack: { id: 'formal_tea_pressure', params: { interval: 0.95 } },
  },
};

const BOSS_PATTERN_PRESETS = {
  cupcake: {
    phaseChangeHpRatio: 0.5,
    phase1: {
      movement: { id: 'bounce_hover', params: { rangeX: 38, hopY: 10, hopSpeed: 2.35 } },
      attack: { id: 'sweet_basic', params: { interval: 1.42, aimSpeed: 98 } },
    },
    phase2: {
      movement: { id: 'bounce_hover', params: { rangeX: 48, hopY: 18, hopSpeed: 3.1 } },
      attack: { id: 'sweet_pressure', params: { interval: 1.18, aimSpeed: 108, sprinkleSpeed: 112 } },
    },
  },

  teapot: {
    phaseChangeHpRatio: 0.5,
    phase1: {
      movement: { id: 'waltz_hover', params: { hold: 1.08, approachSpeed: 155, bobY: 4 } },
      attack: { id: 'formal_tea', params: { interval: 1.28, aimSpeed: 112 } },
    },
    phase2: {
      movement: { id: 'waltz_hover', params: { hold: 0.82, approachSpeed: 190, bobY: 5 } },
      attack: { id: 'formal_tea_pressure', params: { interval: 1.03 } },
    },
  },

  moon_seamstress: {
    phaseChangeHpRatio: 0.5,
    phase1: {
      movement: { id: 'step_hover_positions', params: { hold: 1.34, approachSpeed: 142, positions: [{ x: -72, y: -5 }, { x: 0, y: -15 }, { x: 72, y: -5 }] } },
      attack: { id: 'ribbon_binding', params: { interval: 1.46 } },
    },
    phase2: {
      movement: { id: 'step_hover_positions', params: { hold: 1.0, approachSpeed: 170, positions: [{ x: -82, y: -6 }, { x: 0, y: -28 }, { x: 82, y: -6 }, { x: 0, y: 4 }] } },
      attack: { id: 'ribbon_binding_pressure', params: { interval: 1.18 } },
    },
  },

  dragon: {
    phaseChangeHpRatio: 0.5,
    phase1: {
      movement: { id: 'sleepy_drift', params: { rangeX: 52, rangeY: 10, napInterval: 3.4, napHold: 0.62 } },
      attack: { id: 'dream_cloud', params: { interval: 1.54 } },
    },
    phase2: {
      movement: { id: 'sleepy_drift', params: { rangeX: 72, rangeY: 14, napInterval: 2.25, napHold: 0.44, napDropY: 13 } },
      attack: { id: 'dream_cloud_pressure', params: { interval: 1.2 } },
    },
  },

  count: {
    phaseChangeHpRatio: 0.5,
    phase1: {
      movement: { id: 'page_warp', params: { warpInterval: 2.65, sparkleColor: '#cfc0ff' } },
      attack: { id: 'storybook_night', params: { interval: 1.34, pageSpeed: 92 } },
    },
    phase2: {
      movement: { id: 'page_warp', params: { warpInterval: 1.95, sparkleColor: '#d7b4ff', positions: [{ x: -92, y: -22 }, { x: 92, y: -22 }, { x: 0, y: -34 }, { x: -42, y: 8 }, { x: 42, y: 8 }] } },
      attack: { id: 'storybook_night_pressure', params: { interval: 1.08, pageSpeed: 106 } },
    },
  },

  final: {
    phaseChangeHpRatio: 0.5,
    phase1: {
      movement: { id: 'ritual_hover_positions', params: { hold: 0.95, approachSpeed: 205, bobY: 5 } },
      attack: { id: 'final_memory', params: { interval: 1.0 } },
    },
    phase2: {
      movement: { id: 'ritual_hover_positions', params: { hold: 0.72, approachSpeed: 242, bobY: 7, positions: [{ x: -92, y: -26 }, { x: 92, y: -26 }, { x: 0, y: -44 }, { x: -46, y: 2 }, { x: 46, y: 2 }] } },
      attack: { id: 'final_memory_pressure', params: { interval: 0.78 } },
    },
  },
};

function clonePattern(pattern) {
  return JSON.parse(JSON.stringify(pattern));
}

function deepMerge(base, override) {
  if (!override) return clonePattern(base);
  const result = clonePattern(base);
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function getBossPatternConfig(def) {
  const preset = BOSS_PATTERN_PRESETS[def?.id] ?? DEFAULT_BOSS_PATTERN;
  return deepMerge(preset, def?.patterns);
}

export function getBossPhaseIndex(boss) {
  const threshold = boss.patternConfig?.phaseChangeHpRatio ?? 0.5;
  return boss.hp / boss.maxHp <= threshold ? 2 : 1;
}

export function getCurrentBossPhaseConfig(boss) {
  return boss.phaseIndex === 2 ? boss.patternConfig.phase2 : boss.patternConfig.phase1;
}

export function resetBossPatternQueues(boss) {
  boss.patternState.attack.queue = [];
  boss.patternState.attack.timer = Math.min(boss.patternState.attack.timer ?? 0.8, 0.72);
}

export function updateBossPatterns(boss, dt, scene) {
  const phase = getCurrentBossPhaseConfig(boss);
  updateBossMovementPattern(phase.movement.id, boss, dt, scene, phase.movement.params);
  updateBossAttackPattern(phase.attack.id, boss, dt, scene, phase.attack.params);
}

export function getBossShotInterval(boss) {
  const phase = getCurrentBossPhaseConfig(boss);
  return phase.attack.params?.interval ?? (boss.final ? 0.78 : 1.25);
}
