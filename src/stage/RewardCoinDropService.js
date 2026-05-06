/**
 * 責務: 浄化報酬の豆コインをアイテムActorとして散布生成し、地形に触れるまでの落下移動を担当する。
 * 更新ルール: 報酬の枚数決定は呼び出し側に残し、ここでは自動加算せず取得可能な豆コイン生成だけを扱う。
 * 更新ルール: 報酬豆コインは仮の停止Y座標では止めず、移動中は足場判定で壁・地面に反応し、接地後はその場で固定する。
 * 更新ルール: 通常/風船ライドなどの移動差分は呼び出し側のmotion指定で受け取り、報酬生成の責務はここに集約する。
 */
import { Item } from '../actors/item/Item.js';
import { WORLD_CONFIG } from '../config/worldConfig.js';

const DROP_GRAVITY = 760;
const PICKUP_DELAY = 0.38;
const BASE_POP_SPEED_Y = -178;
const SPREAD_SPEED_X = 58;
const MAX_DROP_COUNT = 30;
const DROP_DESPAWN_MARGIN_Y = 48;

function toRewardCount(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(MAX_DROP_COUNT, Math.floor(value)));
}

function getSourceCenter(source) {
  if (source?.getCenter) return source.getCenter();
  const bounds = source?.getBounds?.() || source || {};
  const x = Number.isFinite(bounds.x) ? bounds.x : 0;
  const y = Number.isFinite(bounds.y) ? bounds.y : 0;
  const w = Number.isFinite(bounds.w) ? bounds.w : 0;
  const h = Number.isFinite(bounds.h) ? bounds.h : 0;
  return { x: x + w / 2, y: y + h / 2 };
}

function createDropMotion(index, count, motionOptions = {}) {
  const centerOffset = index - (count - 1) / 2;
  const spreadFactor = count <= 1 ? 0 : centerOffset;
  const alternatingMagnitude = motionOptions.alternatingBiasX ?? 10;
  const alternatingBias = index % 2 === 0 ? -alternatingMagnitude : alternatingMagnitude;
  const baseVx = motionOptions.baseVx ?? 0;
  const spreadSpeedX = motionOptions.spreadSpeedX ?? SPREAD_SPEED_X;
  const baseVy = motionOptions.baseVy ?? BASE_POP_SPEED_Y;
  const vyPatternStep = motionOptions.vyPatternStep ?? -18;
  const countVyOffset = motionOptions.countVyOffset ?? -Math.min(36, count * 4);
  const spawnSpacingX = motionOptions.spawnSpacingX ?? 2;
  return {
    vx: baseVx + spreadFactor * spreadSpeedX + alternatingBias,
    vy: baseVy + (index % 3) * vyPatternStep + countVyOffset,
    spawnOffsetX: spreadFactor * spawnSpacingX,
  };
}

function createItemPhysicsBody(item) {
  const halfW = item.w / 2;
  const halfH = item.h / 2;
  return {
    x: item.x - halfW,
    y: item.y - halfH,
    w: item.w,
    h: item.h,
    vx: item.vx,
    vy: item.vy,
    prevX: item.prevX - halfW,
    prevY: item.prevY - halfH,
    onGround: false,
    groundPlatform: null,
    getBounds() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    },
  };
}

function syncItemFromPhysicsBody(item, body) {
  item.x = body.x + body.w / 2;
  item.y = body.y + body.h / 2;
  item.vx = body.vx;
  item.vy = body.vy;
  item.onGround = body.onGround;
  item.groundPlatform = body.groundPlatform;
}

function getItemSolids(collisionWorld) {
  return collisionWorld?.itemSolids || collisionWorld?.residentSolids || collisionWorld?.playerSolids || [];
}

function isDropOutOfBounds(item) {
  return item.y - item.h / 2 > WORLD_CONFIG.FLOOR_KILL_Y + DROP_DESPAWN_MARGIN_Y;
}

export class RewardCoinDropService {
  static spawn(runtime, source, amount, options = {}) {
    const count = toRewardCount(amount);
    if (count <= 0) return [];
    if (!Array.isArray(runtime.items)) runtime.items = [];

    const origin = options.origin || getSourceCenter(source);
    const drops = [];

    for (let i = 0; i < count; i += 1) {
      const motion = createDropMotion(i, count, options.motion || {});
      const item = new Item({
        x: origin.x + motion.spawnOffsetX,
        y: origin.y,
        kind: 'coin',
        value: 1,
        vx: motion.vx,
        vy: motion.vy,
        gravity: options.gravity ?? DROP_GRAVITY,
        pickupDelay: options.pickupDelay ?? PICKUP_DELAY,
        rewardDrop: true,
      });
      runtime.items.push(item);
      drops.push(item);
    }

    return drops;
  }

  static updateItems(items, dt, collisionWorld, physics) {
    for (const item of items) {
      if (!item?.alive) continue;
      if (!item.rewardDrop || !item.dropActive) {
        item.update(dt);
        continue;
      }
      this.updateDropItem(item, dt, collisionWorld, physics);
    }
  }

  static updateDropItem(item, dt, collisionWorld, physics) {
    item.update(dt, { skipDropMotion: true });
    if (!item.dropActive) return;

    item.prevX = item.x;
    item.prevY = item.y;
    item.vy += item.gravity * dt;

    if (!physics) {
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      if (isDropOutOfBounds(item)) item.alive = false;
      return;
    }

    const body = createItemPhysicsBody(item);
    physics.moveActor(body, dt, getItemSolids(collisionWorld), {
      useSlopeSurface: true,
      slopeSurfaces: collisionWorld?.slopeSurfaces || [],
    });
    syncItemFromPhysicsBody(item, body);

    if (body.onGround) {
      item.landDrop(body.groundPlatform);
      return;
    }

    if (isDropOutOfBounds(item)) item.alive = false;
  }
}
