/**
 * 責務: 落下時の体力減少、最後に乗っていた通常床への復帰、復帰用安全地点の記録を担当する。
 * 更新ルール: 通常被弾や住民接触の処理はStageCollisionResolver/Playerに置き、ここでは落下復帰専用の状態だけを扱う。
 * 更新ルール: fallRespawn.safePointは通常足場更新かライド終点登録だけで変更し、その他の復帰地点管理と混ぜない。
 */
import { NANO_STATES } from '../config/nanoConfig.js';
import { getStageFallOutY } from './StageFallBoundary.js';
import { syncCameraToPlayer } from './StagePlayerScreenBoundary.js';
import { getPlatformOwner, isNormalRespawnPlatform } from './SafeRespawnPlatform.js';
const FALL_RESPAWN_INVINCIBLE = 1.05;
const FALL_DAMAGE_FLASH = 0.28;
const FALL_RESPAWN_Y_OFFSET = 0.5;
const SAFE_POINT_SOURCE = Object.freeze({
  INITIAL: 'initial',
  NORMAL_FLOOR: 'normalFloor',
  RIDE_GOAL: 'rideGoal',
});

function clamp(value, min, max) {
  if (max < min) return (min + max) / 2;
  return Math.max(min, Math.min(max, value));
}

function isFinitePoint(point) {
  return Number.isFinite(point?.x) && Number.isFinite(point?.y);
}

export class FallRespawnService {
  constructor(initialSpawn) {
    this.safePoint = {
      x: initialSpawn?.x ?? 0,
      y: initialSpawn?.y ?? 0,
      facing: 1,
      source: SAFE_POINT_SOURCE.INITIAL,
    };
  }

  updateSafePoint(runtime) {
    const platform = getPlatformOwner(runtime.player.groundPlatform);
    if (!this.isNormalFloor(runtime, platform)) return;
    this.recordNormalFloorSafePoint(runtime, platform, runtime.player.facing || 1);
  }

  registerRideGoalSafePoint(point) {
    if (!isFinitePoint(point)) return false;
    this.safePoint = {
      x: point.x,
      y: point.y,
      facing: point.facing || 1,
      source: SAFE_POINT_SOURCE.RIDE_GOAL,
    };
    return true;
  }

  recordNormalFloorSafePoint(runtime, platform, facing = 1) {
    const player = runtime.player;
    const bounds = player.getBounds?.() || player;
    const minX = platform.x;
    const maxX = platform.x + platform.w - bounds.w;
    const safeBoundsX = clamp(bounds.x, minX, maxX);
    const safeBoundsY = platform.y - bounds.h - FALL_RESPAWN_Y_OFFSET;
    const safePosition = player.getPositionFromBounds
      ? player.getPositionFromBounds(safeBoundsX, safeBoundsY)
      : { x: safeBoundsX, y: safeBoundsY };
    this.safePoint = {
      x: safePosition.x,
      y: safePosition.y,
      facing,
      source: SAFE_POINT_SOURCE.NORMAL_FLOOR,
      platformId: platform.id || null,
    };
  }

  isNormalFloor(runtime, platform) {
    return isNormalRespawnPlatform(platform) && (runtime.stage.platforms || []).includes(platform);
  }

  handleFall(runtime) {
    if (runtime.player.y <= getStageFallOutY(runtime.stage)) return false;

    const survived = this.applyFallDamage(runtime);
    if (!survived) {
      this.scheduleRestart(runtime);
      return true;
    }

    this.respawn(runtime);
    runtime.hud.showBanner('足元に気をつけるの！');
    return true;
  }

  applyFallDamage(runtime) {
    const player = runtime.player;
    const infiniteHp = !!runtime.app?.debug?.get('infiniteHp');

    runtime.damageCount += 1;
    if (!infiniteHp) player.hp -= 1;
    else player.hp = Math.max(1, player.hp);

    player.invincibleTimer = Math.max(player.invincibleTimer || 0, FALL_RESPAWN_INVINCIBLE);
    player.damageFlash = FALL_DAMAGE_FLASH;
    runtime.camera.shake(4, 0.18);
    runtime.flashTimer = 0.18;
    const damageBounds = player.getDamageBoundsAt
      ? player.getDamageBoundsAt(this.safePoint.x, this.safePoint.y)
      : { x: this.safePoint.x, y: this.safePoint.y, w: player.w, h: player.h };
    runtime.spawnSparkles(
      damageBounds.x + damageBounds.w / 2,
      damageBounds.y + damageBounds.h / 2,
      infiniteHp ? '#d7f8ff' : '#ffd1d1',
      12,
    );
    runtime.app.audio.playSfx('player_fall_respawn');

    if (!infiniteHp && player.hp <= 0) {
      player.dead = true;
      return false;
    }
    return true;
  }

  respawn(runtime) {
    const player = runtime.player;
    player.x = this.safePoint.x;
    player.y = this.safePoint.y;
    player.prevX = player.x;
    player.prevY = player.y;
    player.collisionPrevX = player.x;
    player.collisionPrevY = player.y;
    player.vx = 0;
    player.vy = 0;
    player.facing = this.safePoint.facing;
    player.onGround = false;
    player.groundPlatform = null;
    player.jumpBufferTimer = 0;
    player.coyoteTimer = 0;
    player.jellyBounceLock = 0;
    player.tea.activeTimer = 0;
    player.bow.activeTimer = 0;

    this.resetNano(runtime);
    syncCameraToPlayer(runtime);
    runtime.app.input.clearGameplay();
  }

  resetNano(runtime) {
    const nano = runtime.nano;
    if (!nano) return;
    nano.state = NANO_STATES.HEAD;
    nano.vx = 0;
    nano.vy = 0;
    nano.swapCooldown = 0;
    nano.attachToPlayer(runtime.player);
  }

  scheduleRestart(runtime) {
    runtime.app.input.clearGameplay();
    runtime.hud.showBanner('おやすみなさい… もういちど挑戦するの');
    runtime.restartTimer = 1.2;
  }
}
