/**
 * 責務: 住民行動コマンドから共通利用する値解決・対象選択を担当する。
 * 更新ルール: 住民固有名を含めず、パラメータパスと汎用Actor情報だけを扱う。
 */
import { NANO_STATES } from '../../../../config/nanoConfig.js';

export function getParam(params, path, fallback = undefined) {
  if (!path) return fallback;
  const keys = path.split('.');
  let current = params;
  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) return fallback;
    current = current[key];
  }
  return current;
}

export function resolveFromPath(resident, path, fallback = 0) {
  if (typeof path !== 'string') return path ?? fallback;
  return getParam(resident.behaviorParams || {}, path, fallback);
}

export function actorCenter(actor) {
  return {
    x: actor.x + actor.w / 2,
    y: actor.y + actor.h / 2,
  };
}

export function chooseTarget(resident, ctx, detect = {}) {
  const targetTypes = detect.targetTypes || ['player'];
  const candidates = [];
  if (targetTypes.includes('player') && ctx.player?.alive !== false) candidates.push(ctx.player);
  if (
    targetTypes.includes('nano') &&
    ctx.nano &&
    ctx.nano.state !== NANO_STATES.HEAD &&
    ctx.nano.alive !== false
  ) {
    candidates.push(ctx.nano);
  }

  const residentCenter = actorCenter(resident);
  const rangeX = detect.rangeX ?? 9999;
  const rangeY = detect.rangeY ?? 9999;
  let best = null;
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const center = actorCenter(candidate);
    const dx = center.x - residentCenter.x;
    const dy = center.y - residentCenter.y;
    if (Math.abs(dx) > rangeX || Math.abs(dy) > rangeY) continue;
    const score = Math.abs(dx) + Math.abs(dy) * 0.65;
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

export function getTargetByName(resident, ctx, name = 'target') {
  if (name === 'player') return ctx.player;
  if (name === 'nano') return ctx.nano;
  return resident.blackboard[name] || resident.blackboard.target || ctx.player;
}

export function normalizeAim(aim, fallbackFacing = 1) {
  const x = Number.isFinite(aim?.x) ? aim.x : fallbackFacing;
  const y = Number.isFinite(aim?.y) ? aim.y : 0;
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}
