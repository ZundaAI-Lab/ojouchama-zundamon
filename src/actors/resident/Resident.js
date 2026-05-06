/**
 * 責務: 住民個体の共通状態、スタン、HP、行動ID選択を担当する。
 * 更新ルール: 住民ごとの具体的なAIは持たず、ResidentBehaviorRunnerへコマンド駆動で委譲する。
 * 更新ルール: 通常ステージ住民も風船ライド住民も同じActorとして生成し、rideId などの利用スコープだけを保持する。
 */
import { Actor } from '../Actor.js';
import { RESIDENT_DEFS } from '../../data/residentDefs.js';
import { createResidentBlackboard } from './behavior/ResidentBlackboard.js';
import { ResidentBehaviorRunner } from './behavior/ResidentBehaviorRunner.js';

let nextResidentId = 1;

export class Resident extends Actor {
  constructor(stageDef, speedScale = 1, hpBonus = 0) {
    const {
      x,
      y,
      type = 'macaron',
      minX = x - 40,
      maxX = x + 40,
      behaviorId = null,
      behaviorParams = null,
    } = stageDef;
    const def = RESIDENT_DEFS[type] || RESIDENT_DEFS.macaron;
    const w = stageDef.w ?? def.w;
    const h = stageDef.h ?? def.h;
    super({ x, y, w, h });
    this.id = nextResidentId++;
    this.type = type;
    this.rideId = stageDef.rideId || null;
    this.groupId = stageDef.groupId || null;
    this.imageKey = stageDef.imageKey || def.imageKey;
    this.actionImageKey = stageDef.actionImageKey || def.actionImageKey || null;
    this.drawW = stageDef.drawW ?? def.drawW;
    this.drawH = stageDef.drawH ?? def.drawH;
    this.speed = (stageDef.speed ?? def.speed) * speedScale;
    const hp = Math.max(1, (stageDef.hp ?? def.hp) + hpBonus);
    this.hp = hp;
    this.maxHp = hp;
    this.rewardCoins = stageDef.rewardCoins ?? def.rewardCoins ?? null;
    this.contactDamage = stageDef.contactDamage ?? def.contactDamage !== false;
    this.flying = !!(stageDef.flying ?? def.flying);
    this.facing = stageDef.facing || 1;
    this.minX = minX;
    this.maxX = maxX;
    this.spawnX = x;
    this.spawnY = y;
    this.baseX = stageDef.baseX ?? x;
    this.baseY = stageDef.baseY ?? y;
    this.stunTimer = 0;
    this.animOffset = Math.random() * 6;
    this.behaviorId = behaviorId || def.behaviorId || (this.flying ? 'float_patrol' : 'ground_patrol');
    this.behaviorParams = mergeBehaviorParams(def.behaviorParams || {}, behaviorParams || {});
    this.blackboard = createResidentBlackboard();
    this.applyStageRuntimeFields(stageDef, def);
    this.resetRideRuntimeFields();
  }

  applyStageRuntimeFields(stageDef, def) {
    const passthroughKeys = [
      'ampX',
      'ampY',
      'fireEvery',
      'fireDelay',
      'shotSpeed',
      'shotVy',
      'attackFlashTime',
      'fireGateW',
      'fireGateH',
      'idleRiseSpeed',
      'diveTriggerRangeX',
      'diveTriggerRangeY',
      'diveDuration',
      'zigzagDiveTime',
      'diveCooldown',
      'diveDrop',
      'diveHorizontalDrift',
      'divePatrolFrequencyX',
      'divePatrolFrequencyY',
      'diveMinY',
      'diveMaxY',
    ];
    for (const key of passthroughKeys) {
      if (stageDef[key] !== undefined) this[key] = stageDef[key];
      else if (def[key] !== undefined) this[key] = def[key];
    }
    this.zigzagPhase = stageDef.zigzagPhase ?? def.zigzagPhase ?? getDefaultPhaseOffset(stageDef);
  }

  resetRuntimeState() {
    this.alive = true;
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.prevX = this.spawnX;
    this.prevY = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHp;
    this.stunTimer = 0;
    this.onGround = false;
    this.blackboard = createResidentBlackboard();
    this.resetRideRuntimeFields();
  }

  resetRideRuntimeFields() {
    this.age = 0;
    this.attackFlash = 0;
    this.fireTimer = this.fireDelay ?? this.fireEvery ?? 0;
    if (this.blackboard?.cooldowns && this.fireDelay != null) this.blackboard.cooldowns.emit = this.fireDelay;
    this.balloonBirdDive = false;
    this.balloonBirdDiveTimer = 0;
    this.balloonBirdCooldownTimer = 0;
    this.balloonBirdDiveStart = null;
    this.balloonBirdDiveTarget = null;
    this.balloonBirdDiveFacing = null;
  }

  update(dt, ctx) {
    this.age = (this.age || 0) + dt;
    this.attackFlash = Math.max(0, (this.attackFlash || 0) - dt);

    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - dt);
      this.vx = 0;
      if (!this.flying && ctx?.physics && ctx?.collisionWorld) {
        this.vy = Math.min(this.vy + 760 * dt, 420);
        ctx.physics.moveActor(this, dt, ctx.collisionWorld.residentSolids, {
          useSlopeSurface: true,
          slopeSurfaces: ctx.collisionWorld.slopeSurfaces,
        });
      }
      return;
    }

    ResidentBehaviorRunner.update(this, dt, ctx);
  }

  handleProjectile(projectile, ctx) {
    return ResidentBehaviorRunner.handleProjectile(this, projectile, ctx);
  }

  stun() {
    this.stunTimer = Math.max(this.stunTimer, 1.35);
  }

  damage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) this.alive = false;
  }
}

function getDefaultPhaseOffset(def) {
  if (Number.isFinite(def?.x)) return (def.x % 173) / 173;
  return 0;
}

function mergeBehaviorParams(base, override) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = mergeBehaviorParams(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
