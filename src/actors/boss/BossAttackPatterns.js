/**
 * 責務: ボス攻撃パターンを、ボス種別に依存しない汎用処理として担当する。
 * 更新ルール: 移動処理は持たず、攻撃ID・フェーズ・パラメータに基づく弾/短時間ハザード生成だけを行う。
 */
import { Projectile } from '../Projectile.js';
import { BOSS_PROJECTILE_COLORS } from '../../data/bossDefs.js';
import { clamp } from '../../utils/math.js';

function centerOf(actor) {
  return {
    x: actor.x + actor.w / 2,
    y: actor.y + actor.h / 2,
  };
}

function playerCenter(scene) {
  return centerOf(scene.player);
}

function bossCenter(boss) {
  return centerOf(boss);
}

function aimVector(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  return { x: dx / len, y: dy / len };
}

function pushProjectile(scene, config) {
  const projectile = new Projectile({
    source: 'boss',
    faction: 'resident',
    damage: 1,
    life: 3.2,
    color: BOSS_PROJECTILE_COLORS.default,
    ...config,
  });
  scene.projectiles.push(projectile);
  return projectile;
}

function pushMarker(scene, config) {
  return pushProjectile(scene, {
    faction: 'neutral',
    damage: 0,
    vx: 0,
    vy: 0,
    life: 0.42,
    color: config.color ?? '#ffffff',
    collision: { disappearOnTerrain: false },
    ...config,
  });
}

function queue(state, delay, action) {
  state.queue.push({ delay, action });
}

function fireAimedOrb(boss, scene, params = {}) {
  const from = bossCenter(boss);
  const to = playerCenter(scene);
  const dir = aimVector(from, to);
  const speed = params.speed ?? 116;
  pushProjectile(scene, {
    x: from.x - 5,
    y: from.y - 4,
    w: params.w ?? 12,
    h: params.h ?? 10,
    vx: dir.x * speed,
    vy: dir.y * speed,
    life: params.life ?? 3.8,
    color: params.color ?? BOSS_PROJECTILE_COLORS.default,
    kind: params.kind ?? 'bossOrb',
    render: params.render,
  });
}

function fireDirectedOrb(boss, scene, dir, params = {}) {
  const from = bossCenter(boss);
  const len = Math.max(1, Math.hypot(dir.x, dir.y));
  const speed = params.speed ?? 112;
  pushProjectile(scene, {
    x: from.x - 5,
    y: from.y - 4,
    w: params.w ?? 12,
    h: params.h ?? 10,
    vx: dir.x / len * speed,
    vy: dir.y / len * speed,
    life: params.life ?? 3.4,
    color: params.color ?? BOSS_PROJECTILE_COLORS.default,
    kind: params.kind ?? 'bossOrb',
    motion: params.motion,
    render: params.render,
    collision: params.collision,
    contactEffect: params.contactEffect,
    faction: params.faction ?? 'resident',
    damage: params.damage ?? 1,
  });
}

function fireFallingMarker(scene, x, params = {}) {
  const markerX = x - (params.markerW ?? 18) / 2;
  pushMarker(scene, {
    x: markerX,
    y: params.markerY ?? 26,
    w: params.markerW ?? 18,
    h: params.markerH ?? 170,
    life: params.warnTime ?? 0.42,
    color: params.color ?? '#ff8db5',
    render: { type: 'markerRect', color: params.color ?? '#ff8db5' },
    collision: { disappearOnTerrain: false },
  });
  return markerX;
}

function fireFallingProjectile(scene, x, params = {}) {
  pushProjectile(scene, {
    x: x - (params.w ?? 15) / 2,
    y: params.y ?? 24,
    w: params.w ?? 15,
    h: params.h ?? 15,
    vx: params.vx ?? 0,
    vy: params.vy ?? 150,
    life: params.life ?? 2.0,
    color: params.color ?? '#ff8db5',
    kind: params.kind ?? 'fallingCandy',
  });
}

function fireHorizontalWave(boss, scene, dir, params = {}) {
  const c = bossCenter(boss);
  pushProjectile(scene, {
    x: c.x + dir * 12,
    y: boss.y + boss.h - (params.offsetY ?? 10),
    w: params.w ?? 26,
    h: params.h ?? 10,
    vx: dir * (params.speed ?? 128),
    vy: 0,
    life: params.life ?? 1.15,
    color: params.color ?? '#fff2c7',
    kind: params.kind ?? 'bossWave',
    render: { type: 'wave', color: params.color ?? '#fff2c7' },
    collision: { disappearOnTerrain: false },
  });
}

function fireVerticalHazard(scene, x, params = {}) {
  pushMarker(scene, {
    x: x - (params.w ?? 20) / 2,
    y: params.y ?? 38,
    w: params.w ?? 20,
    h: params.h ?? 198,
    life: params.warnTime ?? 0.38,
    color: params.color ?? '#d6f0ff',
    render: { type: 'markerRect', color: params.color ?? '#d6f0ff' },
    collision: { disappearOnTerrain: false },
  });
  return () => pushProjectile(scene, {
    x: x - (params.w ?? 20) / 2,
    y: params.y ?? 38,
    w: params.w ?? 20,
    h: params.h ?? 198,
    vx: 0,
    vy: 0,
    life: params.life ?? 0.75,
    color: params.color ?? '#d6f0ff',
    kind: params.kind ?? 'verticalHazard',
    render: { type: params.renderType ?? 'steamWall', color: params.color ?? '#d6f0ff' },
    collision: { disappearOnTerrain: false },
  });
}

function fireRibbonLine(scene, x, y, params = {}) {
  const w = params.w ?? 170;
  const h = params.h ?? 12;
  pushMarker(scene, {
    x: x - w / 2,
    y: y - h / 2,
    w,
    h,
    life: params.warnTime ?? 0.46,
    color: params.color ?? '#ff9bc6',
    render: { type: 'markerRect', color: params.color ?? '#ff9bc6', angle: params.angle ?? 0 },
    collision: { disappearOnTerrain: false },
  });
  return () => pushProjectile(scene, {
    x: x - w / 2,
    y: y - h / 2,
    w,
    h,
    vx: 0,
    vy: 0,
    life: params.life ?? 0.55,
    color: params.color ?? '#ff9bc6',
    kind: 'ribbonLine',
    render: { type: 'ribbonLine', color: params.color ?? '#ff9bc6', angle: params.angle ?? 0 },
    collision: { disappearOnTerrain: false },
  });
}

function getRibbonBridgeAttackDuration(platform, fallback) {
  const duration = Number.isFinite(platform.activeDuration) ? platform.activeDuration : fallback;
  return Math.max(0, duration);
}

function activateRibbonBridges(scene, duration = 3.2) {
  let count = 0;
  for (const p of scene.stage.platforms || []) {
    if (p.kind !== 'ribbonBridge') continue;
    const bridgeDuration = getRibbonBridgeAttackDuration(p, duration);
    p.active = true;
    p.ribbonBridgeLife = bridgeDuration;
    if (bridgeDuration === 0) delete p.ribbonBridgeTimer;
    else p.ribbonBridgeTimer = Math.max(p.ribbonBridgeTimer ?? 0, bridgeDuration);
    p.growTimer = 0.24;
    p.growDuration = 0.24;
    count += 1;
    scene.spawnSparkles(p.x + p.w / 2, p.y + 3, '#ffd1e8', 8);
  }
  if (count > 0) scene.hud?.showBanner?.('リボンの橋が結び直されたの！');
}

const ATTACK_PATTERNS = {
  sweet_basic(boss, scene, state, params = {}) {
    const pc = playerCenter(scene);
    fireAimedOrb(boss, scene, { speed: params.aimSpeed ?? 104, color: BOSS_PROJECTILE_COLORS.sugar });
    const markerX = clamp(pc.x + (Math.sin(boss.timer * 2.7) * 34), scene.camera.x + 28, scene.camera.x + 452);
    fireFallingMarker(scene, markerX, { color: BOSS_PROJECTILE_COLORS.candy, warnTime: 0.48 });
    queue(state, 0.5, () => fireFallingProjectile(scene, markerX, { color: BOSS_PROJECTILE_COLORS.candy }));
  },

  sweet_pressure(boss, scene, state, params = {}) {
    this.sweet_basic(boss, scene, state, params);
    const sprinkleDirs = [-0.95, -0.48, 0, 0.48, 0.95];
    for (const dx of sprinkleDirs) {
      fireDirectedOrb(boss, scene, { x: dx, y: -1 }, {
        speed: params.sprinkleSpeed ?? 118,
        color: BOSS_PROJECTILE_COLORS.sugar,
        w: 9,
        h: 9,
        life: 2.3,
        motion: { type: 'gravity_arc', gravity: 210 },
      });
    }
    queue(state, 0.18, () => {
      fireHorizontalWave(boss, scene, -1, { color: '#fff2c7' });
      fireHorizontalWave(boss, scene, 1, { color: '#fff2c7' });
    });
  },

  formal_tea(boss, scene, state, params = {}) {
    fireAimedOrb(boss, scene, { speed: params.aimSpeed ?? 116, color: BOSS_PROJECTILE_COLORS.tea });
    queue(state, 0.22, () => {
      fireDirectedOrb(boss, scene, { x: -1, y: 0.18 }, { speed: 104, color: BOSS_PROJECTILE_COLORS.tea, life: 2.6 });
      fireDirectedOrb(boss, scene, { x: 1, y: 0.18 }, { speed: 104, color: BOSS_PROJECTILE_COLORS.tea, life: 2.6 });
    });
  },

  formal_tea_pressure(boss, scene, state, params = {}) {
    const pc = playerCenter(scene);
    const dirX = pc.x >= bossCenter(boss).x ? 1 : -1;
    queue(state, 0, () => fireDirectedOrb(boss, scene, { x: dirX, y: 0 }, { speed: 124, color: BOSS_PROJECTILE_COLORS.tea }));
    queue(state, 0.16, () => fireDirectedOrb(boss, scene, { x: dirX, y: -0.55 }, { speed: 124, color: BOSS_PROJECTILE_COLORS.tea }));
    queue(state, 0.16, () => fireDirectedOrb(boss, scene, { x: dirX, y: 0.55 }, { speed: 124, color: BOSS_PROJECTILE_COLORS.tea }));
    const x = clamp(pc.x, scene.camera.x + 40, scene.camera.x + 440);
    const spawnSteam = fireVerticalHazard(scene, x, { color: '#d6f0ff', renderType: 'steamWall', warnTime: 0.42, life: 0.68, w: 26 });
    queue(state, 0.44, spawnSteam);
  },

  ribbon_binding(boss, scene, state, params = {}) {
    const pc = playerCenter(scene);
    const y = clamp(pc.y + Math.sin(boss.timer * 1.9) * 14, 78, 214);
    const x = clamp(pc.x, scene.camera.x + 90, scene.camera.x + 390);
    const fire = fireRibbonLine(scene, x, y, { color: BOSS_PROJECTILE_COLORS.ribbon, w: 182, warnTime: 0.5, life: 0.58 });
    queue(state, 0.52, fire);
    queue(state, 0.18, () => {
      fireDirectedOrb(boss, scene, { x: -0.55, y: 0.12 }, { speed: 88, color: BOSS_PROJECTILE_COLORS.ribbon, life: 2.2, w: 10, h: 10 });
      fireDirectedOrb(boss, scene, { x: 0.55, y: 0.12 }, { speed: 88, color: BOSS_PROJECTILE_COLORS.ribbon, life: 2.2, w: 10, h: 10 });
    });
  },

  ribbon_binding_pressure(boss, scene, state, params = {}) {
    const pc = playerCenter(scene);
    const y1 = clamp(pc.y - 28, 70, 205);
    const y2 = clamp(pc.y + 30, 88, 224);
    const x = clamp(pc.x, scene.camera.x + 96, scene.camera.x + 384);
    const fire1 = fireRibbonLine(scene, x, y1, { color: BOSS_PROJECTILE_COLORS.ribbon, w: 168, warnTime: 0.42, life: 0.56 });
    const fire2 = fireRibbonLine(scene, x + Math.sin(boss.timer) * 38, y2, { color: '#ffc4df', w: 142, warnTime: 0.56, life: 0.48 });
    queue(state, 0.44, fire1);
    queue(state, 0.18, fire2);
    queue(state, 0.12, () => activateRibbonBridges(scene, 3.1));
  },

  dream_cloud(boss, scene, state, params = {}) {
    fireDirectedOrb(boss, scene, { x: -0.9, y: 0.08 }, {
      speed: 56,
      color: BOSS_PROJECTILE_COLORS.cloud,
      w: 20,
      h: 17,
      life: 3.4,
      render: { type: 'bubble' },
      faction: 'neutral',
      damage: 0,
      contactEffect: { type: 'lift', targetTypes: ['player'], liftVy: -34, followStrengthX: 0.025 },
      collision: { disappearOnTerrain: false },
    });
    fireDirectedOrb(boss, scene, { x: 0.92, y: 0.08 }, {
      speed: 56,
      color: BOSS_PROJECTILE_COLORS.cloud,
      w: 20,
      h: 17,
      life: 3.4,
      render: { type: 'bubble' },
      faction: 'neutral',
      damage: 0,
      contactEffect: { type: 'lift', targetTypes: ['player'], liftVy: -34, followStrengthX: 0.025 },
      collision: { disappearOnTerrain: false },
    });
    queue(state, 0.35, () => fireAimedOrb(boss, scene, { speed: 86, color: '#e9f2ff', w: 16, h: 14 }));
  },

  dream_cloud_pressure(boss, scene, state, params = {}) {
    this.dream_cloud(boss, scene, state, params);
    queue(state, 0.24, () => {
      fireAimedOrb(boss, scene, { speed: 112, color: BOSS_PROJECTILE_COLORS.nightCloud, w: 18, h: 15, render: { type: 'bubble' } });
      fireHorizontalWave(boss, scene, -1, { color: BOSS_PROJECTILE_COLORS.cloud, speed: 108, life: 1.25 });
      fireHorizontalWave(boss, scene, 1, { color: BOSS_PROJECTILE_COLORS.cloud, speed: 108, life: 1.25 });
    });
  },

  storybook_night(boss, scene, state, params = {}) {
    const c = bossCenter(boss);
    const pc = playerCenter(scene);
    const dirX = pc.x >= c.x ? 1 : -1;
    pushProjectile(scene, {
      x: c.x + dirX * 12,
      y: c.y - 10,
      w: 34,
      h: 22,
      vx: dirX * (params.pageSpeed ?? 92),
      vy: Math.sin(boss.timer * 2) * 14,
      life: 3.2,
      color: BOSS_PROJECTILE_COLORS.page,
      kind: 'bossPage',
      render: { type: 'page', color: BOSS_PROJECTILE_COLORS.page },
    });
    const x = clamp(pc.x + Math.sin(boss.timer * 2.1) * 42, scene.camera.x + 34, scene.camera.x + 446);
    fireFallingMarker(scene, x, { color: BOSS_PROJECTILE_COLORS.ink, warnTime: 0.48, markerW: 16 });
    queue(state, 0.5, () => fireFallingProjectile(scene, x, { color: BOSS_PROJECTILE_COLORS.ink, vy: 138, w: 16, h: 16 }));
  },

  storybook_night_pressure(boss, scene, state, params = {}) {
    this.storybook_night(boss, scene, state, params);
    queue(state, 0.28, () => {
      const cam = scene.camera.x;
      pushProjectile(scene, {
        x: cam + 4,
        y: 86,
        w: 28,
        h: 96,
        vx: 72,
        vy: 0,
        life: 2.2,
        color: BOSS_PROJECTILE_COLORS.page,
        kind: 'bookWall',
        render: { type: 'page', color: BOSS_PROJECTILE_COLORS.page },
        collision: { disappearOnTerrain: false },
      });
      pushProjectile(scene, {
        x: cam + 448,
        y: 86,
        w: 28,
        h: 96,
        vx: -72,
        vy: 0,
        life: 2.2,
        color: BOSS_PROJECTILE_COLORS.page,
        kind: 'bookWall',
        render: { type: 'page', color: BOSS_PROJECTILE_COLORS.page },
        collision: { disappearOnTerrain: false },
      });
    });
  },

  final_memory(boss, scene, state, params = {}) {
    state.memoryIndex = (state.memoryIndex ?? 0) + 1;
    const index = state.memoryIndex % 3;
    if (index === 0) {
      this.sweet_pressure(boss, scene, state, { sprinkleSpeed: 112 });
      queue(state, 0.28, () => this.ribbon_binding(boss, scene, state, {}));
      return;
    }
    if (index === 1) {
      this.formal_tea(boss, scene, state, { aimSpeed: 122 });
      const pc = playerCenter(scene);
      const spawnPillar = fireVerticalHazard(scene, pc.x, { color: BOSS_PROJECTILE_COLORS.final, renderType: 'lightPillar', warnTime: 0.36, life: 0.62, w: 24 });
      queue(state, 0.38, spawnPillar);
      return;
    }
    this.storybook_night(boss, scene, state, { pageSpeed: 104 });
    queue(state, 0.22, () => this.dream_cloud(boss, scene, state, {}));
  },

  final_memory_pressure(boss, scene, state, params = {}) {
    this.final_memory(boss, scene, state, params);
    queue(state, 0.3, () => {
      const c = bossCenter(boss);
      for (const dir of [-0.85, -0.42, 0, 0.42, 0.85]) {
        pushProjectile(scene, {
          x: c.x - 5,
          y: 34,
          w: 10,
          h: 16,
          vx: dir * 52,
          vy: 68,
          life: 3.1,
          color: BOSS_PROJECTILE_COLORS.final,
          kind: 'dreamFeather',
          render: { type: 'feather', color: BOSS_PROJECTILE_COLORS.final },
          collision: { disappearOnTerrain: false },
        });
      }
    });
  },
};

function processQueue(boss, dt, scene) {
  const state = boss.patternState.attack;
  if (!state.queue || state.queue.length <= 0) return false;
  const current = state.queue[0];
  current.delay -= dt;
  if (current.delay <= 0) {
    state.queue.shift();
    current.action(scene);
  }
  return true;
}

export function updateBossAttackPattern(patternId, boss, dt, scene, params = {}) {
  const state = boss.patternState.attack;
  state.queue ??= [];
  state.timer ??= params.initialDelay ?? 0.9;

  if (processQueue(boss, dt, scene)) return;

  state.timer -= dt;
  if (state.timer > 0) return;

  const pattern = ATTACK_PATTERNS[patternId] ?? ATTACK_PATTERNS.formal_tea;
  pattern.call(ATTACK_PATTERNS, boss, scene, state, params);
  state.timer = params.interval ?? 1.25;
  scene.app.audio.playSfx('boss_attack');
}
