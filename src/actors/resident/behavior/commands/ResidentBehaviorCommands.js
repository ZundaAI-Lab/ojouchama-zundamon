/**
 * 責務: 住民行動を構成する汎用コマンド群を実行する。
 * 更新ルール: 住民名を条件分岐に使わず、behaviorParams と projectile catalog の組み合わせで差異を出す。
 * 更新ルール: 風船ライド中の画面内位置に応じた向き・狙いも、behaviorParamsのaim/emit設定として扱う。
 * 更新ルール: 風船鳥の通常時左右巡回・下方向主体の急降下は上昇スクロール専用。横スクロール時は88時点の上昇待機＋狙い急降下を維持する。
 */
import { createProjectileFromCatalog } from '../../../projectile/ProjectileFactory.js';
import { clamp } from '../../../../utils/math.js';
import { chooseTarget, actorCenter, getParam, getTargetByName, normalizeAim, resolveFromPath } from './ResidentCommandUtils.js';

export const COMMAND_RESULT = {
  NONE: { handled: false },
  HANDLED: { handled: true },
  HANDLED_KEEP_PROJECTILE: { handled: true, keepProjectile: true },
};

export const RESIDENT_COMMANDS = {
  groundPatrol(resident, dt, ctx) {
    updatePatrolFacing(resident);
    const move = resident.behaviorParams?.move || {};
    resident.vx = getMoveSpeed(resident, move) * resident.facing;
    moveGround(resident, dt, ctx);
    return COMMAND_RESULT.NONE;
  },

  groundStand(resident, dt, ctx) {
    resident.vx = 0;
    moveGround(resident, dt, ctx);
    return COMMAND_RESULT.NONE;
  },

  groundHopPatrol(resident, dt, ctx) {
    updatePatrolFacing(resident);
    const move = resident.behaviorParams?.move || {};
    const hop = resident.behaviorParams?.hop || {};
    resident.vx = getMoveSpeed(resident, move) * resident.facing;

    const key = 'hop';
    if (resident.blackboard.timers[key] === undefined) {
      resident.blackboard.timers[key] = hop.interval ?? 1.25;
    }
    if (resident.onGround && resident.blackboard.timers[key] <= 0) {
      const target = chooseTarget(resident, ctx, resident.behaviorParams?.detect || {});
      if (target && hop.towardTarget) {
        const dx = actorCenter(target).x - actorCenter(resident).x;
        if (Math.abs(dx) > 4) resident.facing = dx >= 0 ? 1 : -1;
      }
      resident.vy = -(hop.power ?? 170);
      resident.onGround = false;
      resident.blackboard.timers[key] = hop.interval ?? 1.25;
    }

    moveGround(resident, dt, ctx);
    return COMMAND_RESULT.NONE;
  },

  floatPatrol(resident, dt, ctx) {
    updatePatrolFacing(resident);
    const move = resident.behaviorParams?.move || {};
    const speed = getMoveSpeed(resident, move);
    const amplitudeY = move.amplitudeY ?? 8;
    const frequencyY = move.frequencyY ?? 1.6;
    if (resident.blackboard.floatBaseY == null) resident.blackboard.floatBaseY = resident.spawnY;
    resident.vx = speed * resident.facing;
    resident.x += resident.vx * dt;
    resident.y = resident.blackboard.floatBaseY + Math.sin(ctx.elapsed * frequencyY + resident.animOffset) * amplitudeY;
    return COMMAND_RESULT.NONE;
  },

  detectTarget(resident, _dt, ctx, commandDef) {
    const target = chooseTarget(resident, ctx, resident.behaviorParams?.detect || {});
    resident.blackboard[commandDef.saveAs || 'target'] = target;
    if ((commandDef.saveAs || 'target') !== 'target') resident.blackboard.target = target;
    return target ? COMMAND_RESULT.HANDLED : COMMAND_RESULT.NONE;
  },

  faceTarget(resident, _dt, ctx, commandDef) {
    const target = getTargetByName(resident, ctx, commandDef.target || 'target');
    if (!target) return COMMAND_RESULT.NONE;
    const dx = actorCenter(target).x - actorCenter(resident).x;
    if (Math.abs(dx) > 2) resident.facing = dx >= 0 ? 1 : -1;
    return COMMAND_RESULT.HANDLED;
  },

  lockAim(resident, _dt, ctx, commandDef) {
    const target = getTargetByName(resident, ctx, commandDef.target || 'target');
    resident.blackboard.lockedAim = resolveAim(resident, target, resident.behaviorParams?.aim || {}, ctx);
    return COMMAND_RESULT.HANDLED;
  },

  emitProjectile(resident, _dt, ctx, commandDef) {
    const emit = resident.behaviorParams?.emit || {};
    const kind = emit.projectileKind;
    if (!kind) return COMMAND_RESULT.NONE;

    let aim = null;
    if (commandDef.aim === 'lockedAim') {
      aim = resident.blackboard.lockedAim;
    } else {
      const target = getTargetByName(resident, ctx, commandDef.target || 'target');
      aim = resolveAim(resident, target, resident.behaviorParams?.aim || emit.aim || {}, ctx);
    }
    aim = normalizeAim(aim, resident.facing);
    if (emit.faceAim && Math.abs(aim.x) > 0.05) resident.facing = aim.x >= 0 ? 1 : -1;

    const offsetX = emit.spawnOffsetX ?? (resident.facing * (resident.w / 2 + 4));
    const offsetY = emit.spawnOffsetY ?? (resident.h / 2);
    const overrides = buildProjectileOverrides(resident, emit);
    const projectile = createProjectileFromCatalog(kind, {
      x: resident.x + resident.w / 2 + offsetX * Math.sign(aim.x || resident.facing),
      y: resident.y + offsetY,
      aim,
      source: 'resident',
      overrides,
    });
    if (emit.vyResidentKey && Number.isFinite(resident[emit.vyResidentKey])) projectile.vy = resident[emit.vyResidentKey];
    ctx.addProjectile(projectile);
    ctx.spawnSparkles?.(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2, emit.sparkColor || projectile.color || '#e6f8ff', emit.sparkCount ?? 4);
    if (emit.sfx) ctx.playSfx?.(emit.sfx);
    return COMMAND_RESULT.HANDLED;
  },

  reflectProjectile(resident, _dt, ctx, _commandDef, io) {
    const projectile = io.projectile;
    const reflect = resident.behaviorParams?.reflect || {};
    if (!projectile?.alive) return COMMAND_RESULT.NONE;

    const currentSpeed = Math.max(60, Math.hypot(projectile.vx, projectile.vy));
    const speed = currentSpeed * (reflect.speedScale ?? 0.92);
    const one = speed / Math.SQRT2;
    projectile.vx = resident.facing * one;
    projectile.vy = -one;
    projectile.ignoreResidentId = resident.id;
    projectile.ignoreResidentTimer = reflect.ignoreSameResidentTime ?? 0.08;
    projectile.reflected = true;
    projectile.life = Math.max(projectile.life, reflect.minLifeAfterReflect ?? 0.45);
    projectile.maxLife = Math.max(projectile.maxLife || projectile.life, projectile.life);

    resident.blackboard.flags.reflectFlash = reflect.flashTime ?? 0.18;
    ctx.spawnSparkles?.(resident.x + resident.w / 2, resident.y + resident.h / 2, reflect.sparkColor || '#dff5ff', reflect.sparkCount ?? 8);
    if (reflect.sfx) ctx.playSfx?.(reflect.sfx);
    return COMMAND_RESULT.HANDLED_KEEP_PROJECTILE;
  },

  rideFloatAroundBase(resident, _dt) {
    const move = resident.behaviorParams?.move || {};
    const ampX = resident.ampX ?? move.amplitudeX ?? 18;
    const ampY = resident.ampY ?? move.amplitudeY ?? 14;
    const frequencyX = move.frequencyX ?? 1.7;
    const frequencyY = move.frequencyY ?? 3.1;
    const phaseX = move.phaseX ?? 0;
    const phaseY = move.phaseY ?? (resident.baseX * 0.02);
    resident.x = resident.baseX + Math.sin(resident.age * frequencyX + phaseX) * ampX;
    resident.y = resident.baseY + Math.sin(resident.age * frequencyY + phaseY) * ampY;
    return COMMAND_RESULT.NONE;
  },

  rideBirdDive(resident, dt, ctx) {
    const player = ctx.player;
    if (!player) return COMMAND_RESULT.NONE;

    if (!isVerticalUpRideContext(ctx)) {
      return updateHorizontalRideBirdDive(resident, dt, ctx, player);
    }

    return updateVerticalRideBirdDive(resident, dt, ctx, player);
  },

  setAttackFlash(resident, _dt, _ctx, commandDef) {
    resident.attackFlash = resolveResidentOrBehaviorValue(resident, commandDef.from, commandDef.value ?? resident.attackFlashTime ?? 0.22);
    return COMMAND_RESULT.HANDLED;
  },

  setFlag(resident, _dt, _ctx, commandDef) {
    resident.blackboard.flags[commandDef.key] = commandDef.time ?? true;
    return COMMAND_RESULT.HANDLED;
  },

  clearFlag(resident, _dt, _ctx, commandDef) {
    delete resident.blackboard.flags[commandDef.key];
    return COMMAND_RESULT.HANDLED;
  },

  startTimer(resident, _dt, _ctx, commandDef) {
    resident.blackboard.timers[commandDef.key] = resolveFromPath(resident, commandDef.from, commandDef.value ?? 0);
    return COMMAND_RESULT.HANDLED;
  },

  startCooldown(resident, _dt, _ctx, commandDef) {
    resident.blackboard.cooldowns[commandDef.key || 'attack'] = resolveResidentOrBehaviorValue(resident, commandDef.from, commandDef.value ?? 0, commandDef.residentKey);
    return COMMAND_RESULT.HANDLED;
  },

  changeState(resident, _dt, _ctx, commandDef) {
    resident.blackboard.nextState = commandDef.to;
    return COMMAND_RESULT.HANDLED;
  },

  startCharge(resident) {
    const charge = resident.behaviorParams?.charge || {};
    resident.blackboard.chargeSpeed = (charge.speed ?? resident.speed * 2.8) * resident.facing;
    return COMMAND_RESULT.HANDLED;
  },

  groundChargeMove(resident, dt, ctx) {
    resident.vx = resident.blackboard.chargeSpeed || resident.speed * resident.facing;
    moveGround(resident, dt, ctx);
    return COMMAND_RESULT.NONE;
  },
};


function isVerticalUpRideContext(ctx) {
  return ctx?.rideScrollMode === 'verticalUp' || ctx?.rideConfig?.scrollMode === 'verticalUp';
}

function updateHorizontalRideBirdDive(resident, dt, ctx, player) {
  const params = resident.behaviorParams?.dive || {};
  const ampX = resident.ampX ?? params.amplitudeX ?? 18;
  const ampY = resident.ampY ?? params.amplitudeY ?? 18;
  const idleRiseSpeed = resident.idleRiseSpeed ?? params.idleRiseSpeed ?? 14;
  const triggerRangeX = resident.diveTriggerRangeX ?? params.triggerRangeX ?? 128;
  const triggerRangeY = resident.diveTriggerRangeY ?? params.triggerRangeY ?? 96;
  const diveDuration = Math.max(0.08, resident.zigzagDiveTime ?? resident.diveDuration ?? params.duration ?? 0.28);
  const cooldown = resident.diveCooldown ?? params.cooldown ?? 1.05;
  const diveDrop = resident.diveDrop ?? params.drop ?? Math.max(42, ampY * 3.2);
  const minY = params.minY ?? resident.diveMinY ?? Math.max(8, resident.baseY - ampY * 1.3);
  const maxY = params.maxY ?? resident.diveMaxY ?? 224;

  resident.balloonBirdCooldownTimer = Math.max(0, (resident.balloonBirdCooldownTimer || 0) - dt);

  if (resident.balloonBirdDive) {
    resident.balloonBirdDiveTimer = Math.max(0, (resident.balloonBirdDiveTimer || 0) - dt);
    const p = easeInCubic(1 - resident.balloonBirdDiveTimer / diveDuration);
    const from = resident.balloonBirdDiveStart || { x: resident.x, y: resident.y };
    const to = resident.balloonBirdDiveTarget || { x: resident.x, y: resident.y + diveDrop };
    resident.x = from.x + (to.x - from.x) * p;
    resident.y = from.y + (to.y - from.y) * p;
    if (resident.balloonBirdDiveTimer <= 0) {
      resident.balloonBirdDive = false;
      resident.balloonBirdCooldownTimer = cooldown;
      resident.balloonBirdDiveStart = null;
      resident.balloonBirdDiveTarget = null;
      resident.balloonBirdDiveFacing = null;
    }
    return COMMAND_RESULT.HANDLED;
  }

  const idleWave = Math.sin(resident.age * 2.2 + resident.zigzagPhase * Math.PI * 2);
  resident.x = resident.baseX + idleWave * ampX;
  resident.y = Math.max(minY, resident.y - idleRiseSpeed * dt);

  const residentCenter = actorCenter(resident);
  const playerCenter = actorCenter(player);
  const nearPlayer = Math.abs(playerCenter.x - residentCenter.x) <= triggerRangeX && Math.abs(playerCenter.y - residentCenter.y) <= triggerRangeY;
  if (!nearPlayer || resident.balloonBirdCooldownTimer > 0) return COMMAND_RESULT.NONE;

  resident.balloonBirdDive = true;
  resident.balloonBirdDiveTimer = diveDuration;
  resident.balloonBirdDiveStart = { x: resident.x, y: resident.y };
  const targetX = clamp(playerCenter.x - resident.w / 2, resident.baseX - ampX * 2.2, resident.baseX + ampX * 2.2);
  resident.balloonBirdDiveTarget = {
    x: targetX,
    y: clamp(resident.y + diveDrop, minY, maxY),
  };
  return COMMAND_RESULT.HANDLED;
}

function updateVerticalRideBirdDive(resident, dt, ctx, player) {
  const params = resident.behaviorParams?.dive || {};
  const ampX = resident.ampX ?? params.amplitudeX ?? 18;
  const ampY = resident.ampY ?? params.amplitudeY ?? 18;
  const frequencyX = params.frequencyX ?? resident.divePatrolFrequencyX ?? 1.35;
  const frequencyY = params.frequencyY ?? resident.divePatrolFrequencyY ?? 2.1;
  const triggerRangeX = resident.diveTriggerRangeX ?? params.triggerRangeX ?? 128;
  const triggerRangeY = resident.diveTriggerRangeY ?? params.triggerRangeY ?? 96;
  const diveDuration = Math.max(0.08, resident.zigzagDiveTime ?? resident.diveDuration ?? params.duration ?? 0.28);
  const cooldown = resident.diveCooldown ?? params.cooldown ?? 1.05;
  const diveDrop = Math.max(1, resident.diveDrop ?? params.drop ?? Math.max(54, ampY * 3.2));
  const diveHorizontalDrift = params.horizontalDrift ?? resident.diveHorizontalDrift ?? Math.min(26, Math.max(10, ampX * 0.25));
  const minY = params.minY ?? resident.diveMinY ?? -Infinity;
  const maxY = params.maxY ?? resident.diveMaxY ?? getViewportBottomY(ctx, 16);

  resident.balloonBirdCooldownTimer = Math.max(0, (resident.balloonBirdCooldownTimer || 0) - dt);

  if (resident.balloonBirdDive) {
    resident.balloonBirdDiveTimer = Math.max(0, (resident.balloonBirdDiveTimer || 0) - dt);
    const p = easeInCubic(1 - resident.balloonBirdDiveTimer / diveDuration);
    const from = resident.balloonBirdDiveStart || { x: resident.x, y: resident.y };
    const to = resident.balloonBirdDiveTarget || { x: resident.x, y: resident.y + diveDrop };
    resident.x = from.x + (to.x - from.x) * p;
    resident.y = from.y + (to.y - from.y) * p;
    if (Number.isFinite(resident.balloonBirdDiveFacing) && resident.balloonBirdDiveFacing !== 0) {
      resident.facing = resident.balloonBirdDiveFacing;
    }
    if (resident.balloonBirdDiveTimer <= 0) {
      resident.balloonBirdDive = false;
      resident.balloonBirdCooldownTimer = cooldown;
      resident.balloonBirdDiveStart = null;
      resident.balloonBirdDiveTarget = null;
      resident.balloonBirdDiveFacing = null;
      resident.baseX = resident.x;
      resident.baseY = resident.y;
    }
    return COMMAND_RESULT.HANDLED;
  }

  const previousX = resident.x;
  const phase = resident.zigzagPhase * Math.PI * 2;
  resident.x = resident.baseX + Math.sin(resident.age * frequencyX + phase) * ampX;
  resident.y = resident.baseY + Math.sin(resident.age * frequencyY + phase * 0.7) * ampY;
  const idleDx = resident.x - previousX;
  if (Math.abs(idleDx) > 0.05) resident.facing = idleDx > 0 ? 1 : -1;

  const residentCenter = actorCenter(resident);
  const playerCenter = actorCenter(player);
  const nearPlayer = Math.abs(playerCenter.x - residentCenter.x) <= triggerRangeX && Math.abs(playerCenter.y - residentCenter.y) <= triggerRangeY;
  if (!nearPlayer || resident.balloonBirdCooldownTimer > 0) return COMMAND_RESULT.NONE;

  const diveFacing = resident.facing || (playerCenter.x >= residentCenter.x ? 1 : -1);
  resident.balloonBirdDive = true;
  resident.balloonBirdDiveTimer = diveDuration;
  resident.balloonBirdDiveFacing = diveFacing;
  resident.balloonBirdDiveStart = { x: resident.x, y: resident.y };
  const targetY = Math.max(resident.y + 1, clamp(resident.y + diveDrop, minY, maxY));
  resident.balloonBirdDiveTarget = {
    x: resident.x + diveFacing * diveHorizontalDrift,
    y: targetY,
  };
  return COMMAND_RESULT.HANDLED;
}

function easeInCubic(t) {
  const v = clamp(t, 0, 1);
  return v * v * v;
}

function getViewportBottomY(ctx, margin = 0) {
  const cameraY = Number.isFinite(ctx?.camera?.y) ? ctx.camera.y : 0;
  const viewHeight = Number.isFinite(ctx?.view?.height) ? ctx.view.height : 270;
  return cameraY + viewHeight + margin;
}


function resolveResidentOrBehaviorValue(resident, path, fallback = 0, residentKey = null) {
  if (residentKey && resident[residentKey] !== undefined) return resident[residentKey];
  if (typeof path === 'string') return resolveFromPath(resident, path, fallback);
  return path ?? fallback;
}

function buildProjectileOverrides(resident, emit = {}) {
  const overrides = {};
  if (emit.speedResidentKey && Number.isFinite(resident[emit.speedResidentKey])) {
    overrides.motion = { speed: Math.abs(resident[emit.speedResidentKey]) };
  }
  if (emit.contactEffect) overrides.contactEffect = emit.contactEffect;
  if (emit.render) overrides.render = emit.render;
  return overrides;
}

function updatePatrolFacing(resident) {
  if (resident.x <= resident.minX) resident.facing = 1;
  if (resident.x + resident.w >= resident.maxX) resident.facing = -1;
}

function getMoveSpeed(resident, move = {}) {
  return (move.speed ?? resident.speed) * (move.speedScale ?? 1);
}

function moveGround(resident, dt, ctx) {
  const gravity = resident.behaviorParams?.move?.gravity ?? 760;
  const maxFall = resident.behaviorParams?.move?.maxFall ?? 420;
  const intendedVx = resident.vx;
  const intendedFacing = resident.facing || Math.sign(intendedVx) || 1;
  resident.vy = Math.min(resident.vy + gravity * dt, maxFall);
  ctx.physics.moveActor(resident, dt, ctx.collisionWorld.residentSolids, {
    useSlopeSurface: true,
    slopeSurfaces: ctx.collisionWorld.slopeSurfaces,
  });
  reverseFacingWhenBlocked(resident, intendedVx, intendedFacing);
}

function reverseFacingWhenBlocked(resident, intendedVx, intendedFacing) {
  const move = resident.behaviorParams?.move || {};
  if (move.reverseOnObstacle === false) return;
  if (Math.abs(intendedVx) <= 0.001) return;
  if (Math.abs(resident.vx) > 0.001) return;

  const blockedDirection = Math.sign(intendedVx) || intendedFacing;
  resident.facing = -blockedDirection;
  // 更新ルール: 障害物反転は地上移動コマンドの責務。突進など速度を一時保存する行動は、反転後の向きと保存速度を同期する。
  if (Number.isFinite(resident.blackboard?.chargeSpeed)) {
    resident.blackboard.chargeSpeed = Math.abs(resident.blackboard.chargeSpeed) * resident.facing;
  }
}

function resolveAim(resident, target, aim = {}, ctx = null) {
  const mode = aim.mode || 'towardTargetX';
  const residentCenter = actorCenter(resident);
  const targetCenter = target ? actorCenter(target) : { x: residentCenter.x + resident.facing, y: residentCenter.y };
  const dx = targetCenter.x - residentCenter.x;
  const dy = targetCenter.y - residentCenter.y;
  const dirX = Math.abs(dx) > 2 ? Math.sign(dx) : resident.facing;

  if (mode === 'towardViewportCenterX') {
    const cameraX = Number.isFinite(ctx?.camera?.x) ? ctx.camera.x : 0;
    const viewWidth = Number.isFinite(ctx?.view?.width) ? ctx.view.width : 480;
    const screenCenterX = cameraX + viewWidth / 2;
    const towardCenterX = residentCenter.x < screenCenterX ? 1 : -1;
    return { x: towardCenterX, y: aim.y ?? 0 };
  }

  if (mode === 'horizontal_or_45_by_target_y') {
    const threshold = aim.yThreshold ?? 18;
    if (dy < -threshold) return { x: dirX, y: -1 };
    if (dy > threshold) return { x: dirX, y: 1 };
    return { x: dirX, y: 0 };
  }

  if (mode === 'towardTarget') {
    return { x: dx, y: dy };
  }

  if (mode === 'towardTargetUpArc' || mode === 'towardTargetXUp') {
    return { x: dirX, y: -(aim.upY ?? 0.68) };
  }

  if (mode === 'towardTargetX') {
    return { x: dirX, y: aim.y ?? 0 };
  }

  if (mode === 'fixed') {
    return { x: aim.x ?? resident.facing, y: aim.y ?? 0 };
  }

  return { x: dirX, y: 0 };
}
