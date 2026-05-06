/**
 * 責務: ステージイベントから住民Actorを生成し、Runtimeへ追加する。
 * 更新ルール: 発火条件やメッセージ進行は持たず、住民定義の座標解決と生成だけを扱う。
 */
import { Resident } from '../actors/resident/Resident.js';

const DEFAULT_PATROL_HALF_WIDTH = 96;

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function resolveNumber(value, fallback) {
  return isFiniteNumber(value) ? value : fallback;
}

function resolveSpawnX(def, anchor) {
  if (isFiniteNumber(def.x)) return def.x;
  return anchor.x + resolveNumber(def.offsetX, 0);
}

function resolveSpawnY(def, anchor) {
  if (isFiniteNumber(def.y)) return def.y;
  return anchor.y + resolveNumber(def.offsetY, -160);
}

function resolveRangeEdge(def, key, offsetKey, fallback) {
  if (isFiniteNumber(def[key])) return def[key];
  if (isFiniteNumber(def[offsetKey])) return fallback.anchorX + def[offsetKey];
  return fallback.value;
}

function createResidentDef(def = {}, anchor) {
  const x = resolveSpawnX(def, anchor);
  const y = resolveSpawnY(def, anchor);
  const patrolHalfWidth = Math.max(0, resolveNumber(def.patrolHalfWidth, DEFAULT_PATROL_HALF_WIDTH));
  return {
    ...def,
    x,
    y,
    minX: resolveRangeEdge(def, 'minX', 'minXOffset', { anchorX: anchor.x, value: x - patrolHalfWidth }),
    maxX: resolveRangeEdge(def, 'maxX', 'maxXOffset', { anchorX: anchor.x, value: x + patrolHalfWidth }),
  };
}

export class ResidentSpawnService {
  static spawn(runtime, residentDefs = [], anchor = runtime.player) {
    if (!runtime || !Array.isArray(residentDefs) || !residentDefs.length || !anchor) return [];
    const spawned = residentDefs.map(def => new Resident(
      createResidentDef(def, anchor),
      runtime.difficulty?.residentSpeed ?? 1,
      runtime.difficulty?.residentHpBonus ?? 0,
    ));
    runtime.residents.push(...spawned);
    return spawned;
  }
}
