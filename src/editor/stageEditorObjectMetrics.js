/**
 * 責務: ステージエディタ上のオブジェクト寸法、画像キー、当たり判定矩形を解決する。
 * 更新ルール: 描画や選択状態は持たず、データ定義からEditor表示用メトリクスだけを導出する。
 */
import { ITEM_DEFS } from '../data/itemDefs.js';
import { RESIDENT_DEFS } from '../data/residentDefs.js';
import { GOAL_DEFAULT_VARIANT, resolveGoalDef } from '../data/goalDefs.js';

const SWITCH_TARGET_CHAIR_KEYS = Object.freeze({
  pink: 'switch_target_chair_pink',
  green: 'switch_target_chair_green',
  purple: 'switch_target_chair_purple',
  heart: 'switch_target_chair_heart',
  wing: 'switch_target_chair_wing',
});
const SWITCH_TARGET_TABLE_KEYS = Object.freeze({
  pink: 'switch_target_table_round_pink',
  green: 'switch_target_table_round_green',
  purple: 'switch_target_table_purple',
  long: 'switch_target_table_long',
  sidePink: 'switch_target_table_side_pink',
  sideGreen: 'switch_target_table_side_green',
  candle: 'switch_target_table_candle',
});
const GLASS_ROSE_KEYS = Object.freeze({
  red: 'switch_glass_rose_red',
  blue: 'switch_glass_rose_blue',
  yellow: 'switch_glass_rose_yellow',
  off: 'switch_glass_rose_off',
});

export function isFiniteEditorBounds(bounds) {
  return !!(
    bounds &&
    Number.isFinite(bounds.x) &&
    Number.isFinite(bounds.y) &&
    Number.isFinite(bounds.w) &&
    Number.isFinite(bounds.h)
  );
}

export function resolveEditorCheckpointBounds(stage, object = {}) {
  const w = Number.isFinite(object.w) ? object.w : 32;
  const h = Number.isFinite(object.h) ? object.h : 48;
  const x = Number.isFinite(object.x) ? object.x : (stage.playerStart?.x ?? 48) + 180;
  const y = Number.isFinite(object.y) ? object.y : (stage.playerStart?.y ?? 180) + 40;
  return { x: x - w / 2, y: y - h, w, h };
}

export function resolveEditorGoalBounds(object = {}) {
  const def = resolveGoalDef(object.variant || GOAL_DEFAULT_VARIANT);
  return {
    x: Number.isFinite(object.x) ? object.x : 0,
    y: Number.isFinite(object.y) ? object.y : 0,
    w: def.hitbox.w,
    h: def.hitbox.h,
  };
}

export function getEditorResidentMetrics(object = {}) {
  const def = RESIDENT_DEFS[object.type] || RESIDENT_DEFS.macaron;
  return {
    w: object.w ?? def.w ?? 28,
    h: object.h ?? def.h ?? 28,
    drawW: object.drawW ?? def.drawW ?? object.w ?? def.w ?? 28,
    drawH: object.drawH ?? def.drawH ?? object.h ?? def.h ?? 28,
    imageKey: object.imageKey || def.imageKey,
  };
}

export function getEditorItemMetrics(object = {}) {
  const def = ITEM_DEFS[object.kind] || ITEM_DEFS.coin;
  return {
    hitboxSize: object.hitboxSize ?? def.hitboxSize ?? 14,
    renderSize: object.renderSize ?? def.renderSize ?? 18,
    imageKey: object.imageKey || def.imageKey,
  };
}

export function getEditorSwitchTargetImageKey(target = {}) {
  if (target.imageKey) return target.imageKey;
  if (target.kind === 'teaChair') return SWITCH_TARGET_CHAIR_KEYS[target.variant] || SWITCH_TARGET_CHAIR_KEYS.pink;
  if (target.kind === 'teaTable') return SWITCH_TARGET_TABLE_KEYS[target.variant] || SWITCH_TARGET_TABLE_KEYS.pink;
  return null;
}

export function getEditorSwitchGimmickImageKey(gimmick = {}) {
  if (gimmick.imageKey) return gimmick.imageKey;
  if (gimmick.kind === 'teaBell') return 'switch_tea_bell_idle';
  if (gimmick.kind === 'glassRose') return GLASS_ROSE_KEYS[gimmick.color] || GLASS_ROSE_KEYS.off;
  if (gimmick.kind === 'rainbowBubble') return (gimmick.w || 40) <= 42 ? 'switch_rainbow_bubble_idle_small' : 'switch_rainbow_bubble_idle';
  if (gimmick.kind === 'magicCandelabra') return 'switch_magic_candelabra_off';
  if (gimmick.kind === 'ribbonSwitch') return 'gimmick_ribbon_switch';
  return null;
}

export function getEditorObjectImageKey(category, object = {}) {
  if (category === 'points' && object.key === 'goal') return resolveGoalDef(object.variant || GOAL_DEFAULT_VARIANT).imageKey;
  if (category === 'items') return getEditorItemMetrics(object).imageKey;
  if (category === 'residents') return getEditorResidentMetrics(object).imageKey;
  if (category === 'doors') return object.imageKey || 'door_bow';
  if (category === 'boss') return object.imageKey || null;
  if (category === 'switchTargets') return getEditorSwitchTargetImageKey(object);
  if (category === 'switchGimmicks') return getEditorSwitchGimmickImageKey(object);
  if (category === 'specialEvents' && object.kind === 'nanoRescue') return object.imageKey || 'event_nano_candy_dome_trapped';
  return object.imageKey || null;
}

export function getStageObjectBounds(stage, category, object) {
  if (!object) return null;
  if (category === 'points') return object.key === 'goal' ? resolveEditorGoalBounds(object) : { x: object.x - 8, y: object.y - 16, w: 16, h: 24 };
  if (category === 'areas') return { x: object.startX, y: 0, w: Math.max(1, object.endX - object.startX), h: stage.height };
  if (category === 'items') {
    const metrics = getEditorItemMetrics(object);
    const size = metrics.hitboxSize;
    return { x: object.x - size / 2, y: object.y - size / 2, w: size, h: size };
  }
  if (category === 'residents') {
    const metrics = getEditorResidentMetrics(object);
    return { x: object.x, y: object.y, w: metrics.w, h: metrics.h };
  }
  if (category === 'checkpoints') return resolveEditorCheckpointBounds(stage, object);
  if (category === 'boss') return object ? { x: object.x, y: object.y, w: object.w || 48, h: object.h || 48 } : null;
  if (category === 'balloonRides') return object.start ? { x: object.start.x, y: object.start.y, w: object.start.w || 38, h: object.start.h || 94 } : null;
  if (object.w != null && object.h != null) return { x: object.x, y: object.y, w: object.w, h: object.h };
  if (category === 'decorations') return { x: object.x - (object.r || 8), y: object.y - (object.r || 8), w: (object.r || 8) * 2, h: (object.r || 8) * 2 };
  return { x: object.x - 10, y: object.y - 10, w: 20, h: 20 };
}

