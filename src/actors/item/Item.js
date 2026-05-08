/**
 * 責務: アイテムActorの種類、画像キー、表示/当たり判定サイズ、浮遊/飛び出しアニメ用状態を担当する。
 * 更新ルール: 取得効果やHUD更新はstage側に置き、アイテム個体の基本状態だけを扱う。
 * 更新ルール: ステージ定義のx/yは見た目の中心座標として扱い、当たり判定だけを中心基準の矩形として公開する。
 * 更新ルール: 取得効果は持たず、浄化報酬の飛び出し移動と取得猶予だけを個体状態として保持する。
 * 更新ルール: 報酬豆コインの地形衝突解決はstage側へ委譲し、個体は接地後の固定状態だけを保持する。
 * 更新ルール: 取得済み夢のしずくの再取得不可状態は個体状態として保持し、保存判定はstage側へ置く。
 */
import { Actor } from '../Actor.js';
import { getItemDef } from '../../data/itemDefs.js';

function normalizePositiveNumber(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeNonNegativeNumber(value, fallback = 0) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export class Item extends Actor {
  constructor({ x, y, kind = 'coin', value, imageKey, groupId = null, switchId = '', switchMode, switchDuration, clockDoorId = '', clockStep, acquired = false, collectDisabled = false, vx = 0, vy = 0, gravity = 0, pickupDelay = 0, rewardDrop = false }) {
    const def = getItemDef(kind);
    const hitboxSize = normalizePositiveNumber(def.hitboxSize, 14);
    const hitboxWidth = normalizePositiveNumber(def.hitboxWidth, hitboxSize);
    const hitboxHeight = normalizePositiveNumber(def.hitboxHeight, hitboxSize);
    super({ x, y, w: hitboxWidth, h: hitboxHeight });
    this.kind = kind;
    this.effect = def.effect;
    this.acquired = !!acquired;
    this.collectDisabled = !!collectDisabled || this.acquired;
    this.imageKey = imageKey || def.imageKey;
    this.groupId = groupId || null;
    this.switchId = typeof switchId === 'string' ? switchId : '';
    this.switchMode = typeof switchMode === 'string' && switchMode ? switchMode : (def.switchMode || '');
    this.switchDuration = normalizeNonNegativeNumber(switchDuration, def.switchDuration ?? 0);
    this.clockDoorId = typeof clockDoorId === 'string' ? clockDoorId : '';
    this.clockStep = Number.isFinite(clockStep) ? Math.trunc(clockStep) : Math.trunc(def.clockStep ?? 1);
    this.value = normalizePositiveNumber(value, def.value ?? 1);
    this.renderSize = normalizePositiveNumber(def.renderSize, 18);
    this.renderWidth = normalizePositiveNumber(def.renderWidth, this.renderSize);
    this.renderHeight = normalizePositiveNumber(def.renderHeight, this.renderSize);
    this.floatPhase = Math.random() * Math.PI * 2;
    this.gravity = normalizeNonNegativeNumber(gravity);
    this.pickupDelay = normalizeNonNegativeNumber(pickupDelay);
    this.rewardDrop = !!rewardDrop;
    this.dropActive = !!(rewardDrop || vx || vy || this.gravity);
    this.dropLanded = false;
    this.fixedOnGround = false;
    this.dropGroundPlatform = null;
    this.vx = Number.isFinite(vx) ? vx : 0;
    this.vy = Number.isFinite(vy) ? vy : 0;
  }

  update(dt, options = {}) {
    if (!this.fixedOnGround) this.floatPhase += dt * 2;
    this.pickupDelay = Math.max(0, this.pickupDelay - dt);
    if (options.skipDropMotion || !this.dropActive) return;

    this.prevX = this.x;
    this.prevY = this.y;
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  landDrop(platform = null) {
    this.vx = 0;
    this.vy = 0;
    this.dropActive = false;
    this.dropLanded = true;
    this.fixedOnGround = true;
    this.dropGroundPlatform = platform;
    this.onGround = true;
    this.groundPlatform = platform;
  }

  isCollectable() {
    return !this.collectDisabled && this.pickupDelay <= 0;
  }

  getBounds() {
    return {
      x: this.x - this.w / 2,
      y: this.y - this.h / 2,
      w: this.w,
      h: this.h,
    };
  }

  getCenter() {
    return { x: this.x, y: this.y };
  }
}
