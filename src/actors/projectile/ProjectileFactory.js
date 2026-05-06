/**
 * 責務: ProjectileCatalog を元に弾Actorを生成する。
 * 更新ルール: 住民行動側へ弾の速度計算・効果定義を漏らさない。
 */
import { Projectile } from '../Projectile.js';
import { PROJECTILE_CATALOG } from './ProjectileCatalog.js';

export function createProjectileFromCatalog(kind, { x, y, aim = { x: 1, y: 0 }, source = null, overrides = {} } = {}) {
  const def = PROJECTILE_CATALOG[kind];
  if (!def) throw new Error(`Unknown projectile kind: ${kind}`);
  const normalizedAim = normalizeAim(aim);
  const motion = { ...(def.motion || {}), ...(overrides.motion || {}) };
  const velocity = resolveVelocity(motion, normalizedAim);

  const w = overrides.w ?? def.w;
  const h = overrides.h ?? def.h;

  return new Projectile({
    x: x - (w ?? 0) / 2,
    y: y - (h ?? 0) / 2,
    vx: velocity.vx,
    vy: velocity.vy,
    boosted: false,
    faction: overrides.faction ?? def.faction,
    damage: overrides.damage ?? def.damage ?? 1,
    color: overrides.color ?? def.color,
    life: overrides.life ?? def.life ?? 1,
    source,
    w,
    h,
    kind,
    motion,
    contactEffect: mergePlain(def.contactEffect, overrides.contactEffect),
    collision: mergePlain(def.collision, overrides.collision),
    render: mergePlain(def.render, overrides.render),
  });
}

function resolveVelocity(motion, aim) {
  if (motion.type === 'rise_arc') {
    const speed = motion.speed ?? 24;
    return {
      vx: aim.x * speed,
      vy: motion.vy ?? -18,
    };
  }

  if (motion.type === 'gravity_arc') {
    const speed = motion.speed ?? 100;
    return {
      vx: aim.x * speed,
      vy: aim.y * speed,
    };
  }

  const speed = motion.speed ?? 120;
  return {
    vx: aim.x * speed,
    vy: aim.y * speed,
  };
}

function normalizeAim(aim) {
  const x = Number.isFinite(aim?.x) ? aim.x : 1;
  const y = Number.isFinite(aim?.y) ? aim.y : 0;
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

function mergePlain(base = null, override = null) {
  if (!base && !override) return null;
  return { ...(base || {}), ...(override || {}) };
}
