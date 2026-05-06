/**
 * 責務: jelly/crumble/vineなど足場ギミックの状態更新、効果適用、足場由来のジャンプ補正を担当する。
 * 更新ルール: 足場の見た目はPlatformRendererに任せる。沈み・傾きなど描画/判定に使う実行時状態はここで更新する。
 * 更新ルール: 物理判定に影響する状態更新はupdateBeforePhysicsへ集約し、PhysicsSystemの坂面解決より先に反映する。
 * 更新ルール: 足場移動でプレイヤー座標を直接書き換えない。沈み・復帰後の接地・押し上げはPhysicsSystemの衝突解決へ任せる。
 * 更新ルール: うさぎのリボン庭園固有ギミックも、見た目はRenderer、当たり判定形状はCollisionWorldBuilderに分離し、ここでは状態変化だけを扱う。
 * 更新ルール: 魔法反応足場の命中判定とデバッグ表示範囲は同じ矩形生成関数を使い、表示と実判定をずらさない。
 * 更新ルール: page/wishLeaf/ribbonBridgeの有効時間は足場データのactiveDurationを正本にし、0秒は無制限として扱う。
 */
import { PLAYER_CONFIG } from '../config/playerConfig.js';
import { approach, clamp } from '../utils/math.js';
import { intersects } from '../utils/rect.js';

const JELLY_BOUNCE_SPEED = -392;
const JAM_SOFT_JUMP_SPEED = -205;
const CLOUD_JUMP_SPEED = Math.round(PLAYER_CONFIG.JUMP_SPEED * 1.12);
const VINE_GROW_DURATION = 0.56;
const WISH_LEAF_LIFE_SECONDS = 4.0;
const PAGE_CYCLE_SECONDS = Math.PI * 2 / 2.4;
const PAGE_ACTIVE_SECONDS = 1.6;
const MAGIC_PLATFORM_PADDING_X = 8;
const MAGIC_PLATFORM_PADDING_TOP = 12;
const MAGIC_PLATFORM_PADDING_BOTTOM = 10;

const CLOUD_SINK_MAX = 5;
const CLOUD_SINK_SPEED = 34;
const CLOUD_RETURN_SPEED = 44;

const SLEEP_CLOUD_SINK_SPEED = 34;
const SLEEP_CLOUD_RETURN_SPEED = 30;

const CRUMBLE_BREAK_SECONDS = 0.9;
const CRUMBLE_RESPAWN_SECONDS = 1.25;

const SPOON_SLIDE_ACCEL = 300;
const SPOON_SLIDE_MAX_SPEED = 170;
const SPOON_TILT = 0.14;

const TEACUP_SPIN_TILT_MAX = 0.18;
const TEACUP_SPIN_TILT_DEADZONE = 0.16;
const TEACUP_SPIN_TILT_SPEED = 3.6;

const DREAM_WIND_CARRY_SECONDS = 0.58;
const DREAM_WIND_LIFT_SPEED = -168;
const DREAM_WIND_PUSH_ACCEL = 1520;
const DREAM_WIND_PUSH_MAX_SPEED = 245;

const RIBBON_BRIDGE_LIFE_SECONDS = 5.2;
const RIBBON_BRIDGE_GROW_SECONDS = 0.38;
const WAIT_FLOWER_BLOOM_SECONDS = 0.45;
const WAIT_FLOWER_LAUNCH_SPEED = -338;

function getPlayerGround(runtime, platform) {
  const player = runtime.player;
  return player?.onGround && player.groundPlatform === platform;
}

function ensureBaseY(platform) {
  if (!Number.isFinite(platform.baseY)) platform.baseY = platform.y;
}

function setPlatformSinkOffset(platform, nextOffset) {
  ensureBaseY(platform);
  const previousY = platform.y;
  platform.sinkOffset = nextOffset;
  platform.y = platform.baseY + platform.sinkOffset;
  platform.motionDeltaY = platform.y - previousY;
}

function updateSinkPlatform(runtime, platform, dt, { max, sinkSpeed, returnSpeed }) {
  ensureBaseY(platform);
  const standing = getPlayerGround(runtime, platform);
  const current = platform.sinkOffset ?? Math.max(0, platform.y - platform.baseY);
  const target = standing ? max : 0;
  const speed = standing ? sinkSpeed : returnSpeed;
  const next = approach(current, target, speed * dt);
  setPlatformSinkOffset(platform, next);
}

function updateSleepCloud(runtime, platform, dt) {
  ensureBaseY(platform);
  const standing = getPlayerGround(runtime, platform);
  const current = platform.sinkOffset ?? Math.max(0, platform.y - platform.baseY);
  const next = standing
    ? current + SLEEP_CLOUD_SINK_SPEED * dt
    : approach(current, 0, SLEEP_CLOUD_RETURN_SPEED * dt);
  setPlatformSinkOffset(platform, next);
}

function getAuthoredTiltMagnitude(platform, fallback) {
  return Number.isFinite(platform.tilt) ? Math.max(0, Math.abs(platform.tilt)) : fallback;
}

function getSpoonTargetTilt(platform) {
  const dir = Math.sign(platform.slopeDir || platform.spoonSlopeDir || 1) || 1;
  return dir * getAuthoredTiltMagnitude(platform, SPOON_TILT);
}

function getTeacupSpinTiltMax(platform) {
  return getAuthoredTiltMagnitude(platform, TEACUP_SPIN_TILT_MAX);
}

function getAuthoredActiveDuration(platform, fallback) {
  const duration = Number.isFinite(platform.activeDuration) ? platform.activeDuration : fallback;
  return Math.max(0, duration);
}

function isUnlimitedActiveDuration(duration) {
  return duration === 0;
}

function resetLifetimeTimer(platform, timerKey, lifeKey, fallback) {
  const duration = getAuthoredActiveDuration(platform, fallback);
  platform[lifeKey] = duration;
  if (isUnlimitedActiveDuration(duration)) {
    delete platform[timerKey];
    return duration;
  }
  platform[timerKey] = duration;
  return duration;
}

function getPageActiveState(platform, elapsed) {
  const duration = getAuthoredActiveDuration(platform, PAGE_ACTIVE_SECONDS);
  if (isUnlimitedActiveDuration(duration) || duration >= PAGE_CYCLE_SECONDS) return true;
  const phase = Number.isFinite(platform.phase) ? platform.phase : 0;
  const phaseSeconds = phase / (Math.PI * 2) * PAGE_CYCLE_SECONDS;
  const cycleTime = ((elapsed + phaseSeconds) % PAGE_CYCLE_SECONDS + PAGE_CYCLE_SECONDS) % PAGE_CYCLE_SECONDS;
  return cycleTime < duration;
}

function getSpoonDirection(platform) {
  const angle = Number.isFinite(platform.spoonSlopeAngle)
    ? platform.spoonSlopeAngle
    : (Number.isFinite(platform.visualTilt) ? platform.visualTilt : null);
  if (angle !== null) return Math.sign(angle) || 0;
  return Math.sign(platform.slopeDir || platform.spoonSlopeDir || 1) || 1;
}

function refreshDreamWindCarry(runtime, platform) {
  const player = runtime.player;
  const dir = Math.sign(platform.windDir || platform.dir || player.facing || 1) || 1;
  player.dreamWindCarryTimer = DREAM_WIND_CARRY_SECONDS;
  player.dreamWindCarryDuration = DREAM_WIND_CARRY_SECONDS;
  player.dreamWindCarryDir = dir;
}

function applyDreamWindCarry(runtime, dt) {
  const player = runtime.player;
  const timer = player.dreamWindCarryTimer ?? 0;
  if (timer <= 0) return;

  const duration = player.dreamWindCarryDuration || DREAM_WIND_CARRY_SECONDS;
  const strength = clamp(timer / duration, 0, 1);
  const eased = 0.35 + strength * 0.65;
  const dir = Math.sign(player.dreamWindCarryDir || player.facing || 1) || 1;

  player.vy = Math.min(player.vy, DREAM_WIND_LIFT_SPEED * eased);
  player.vx = clamp(
    player.vx + dir * DREAM_WIND_PUSH_ACCEL * eased * dt,
    -DREAM_WIND_PUSH_MAX_SPEED,
    DREAM_WIND_PUSH_MAX_SPEED,
  );
  player.dreamWindCarryTimer = Math.max(0, timer - dt);
}

function deactivatePlatformUnderPlayer(runtime, platform) {
  if (runtime.player.groundPlatform !== platform) return;
  runtime.player.groundPlatform = null;
  runtime.player.onGround = false;
}

export function activateRibbonBridge(platform, fallbackDuration = RIBBON_BRIDGE_LIFE_SECONDS) {
  platform.active = true;
  resetLifetimeTimer(platform, 'ribbonBridgeTimer', 'ribbonBridgeLife', fallbackDuration);
  platform.growTimer = RIBBON_BRIDGE_GROW_SECONDS;
  platform.growDuration = RIBBON_BRIDGE_GROW_SECONDS;
}

function isRibbonBridgeRunning(platform) {
  if (platform.active === false) return false;
  const duration = getAuthoredActiveDuration(platform, RIBBON_BRIDGE_LIFE_SECONDS);
  return isUnlimitedActiveDuration(duration) || (platform.ribbonBridgeTimer ?? 0) > 0;
}

function canReactToMagic(platform) {
  return (
    platform.kind === 'wishLeaf' ||
    (platform.kind === 'vine' && platform.active === false) ||
    platform.kind === 'jam'
  );
}

function getMagicReactionBounds(platform) {
  return {
    x: platform.x - MAGIC_PLATFORM_PADDING_X,
    y: platform.y - MAGIC_PLATFORM_PADDING_TOP,
    w: platform.w + MAGIC_PLATFORM_PADDING_X * 2,
    h: platform.h + MAGIC_PLATFORM_PADDING_TOP + MAGIC_PLATFORM_PADDING_BOTTOM,
  };
}

export function activateRibbonBridgeGroup(runtime, group) {
  let activated = 0;
  for (const platform of runtime.stage.platforms) {
    if (platform.kind !== 'ribbonBridge') continue;
    if ((platform.group || 'default') !== group) continue;
    // 起動中のリボン橋は再起動せず、残り時間をリセットしない。
    if (isRibbonBridgeRunning(platform)) continue;
    activateRibbonBridge(platform);
    activated += 1;
  }
  return activated;
}

export class PlatformGimmickSystem {
  static updateBeforePhysics(runtime, dt) {
    for (const p of runtime.stage.platforms) {
      if (p.kind === 'jamHard') {
        p.hardenTimer = (p.hardenTimer ?? 0) - dt;
        if (p.hardenTimer <= 0) {
          p.kind = 'jam';
          p.hardenTimer = 0;
        }
      }

      if (p.kind === 'vine' && p.active !== false && p.growTimer > 0) {
        p.growTimer = Math.max(0, p.growTimer - dt);
      }

      if (p.kind === 'wishLeaf' && p.active !== false) {
        const duration = getAuthoredActiveDuration(p, WISH_LEAF_LIFE_SECONDS);
        p.wishLeafLife = duration;
        if (!isUnlimitedActiveDuration(duration)) {
          if (!Number.isFinite(p.wishLeafTimer)) p.wishLeafTimer = duration;
          p.wishLeafTimer = Math.max(0, p.wishLeafTimer - dt);
          if (p.wishLeafTimer <= 0) {
            p.active = false;
            p.wishLeafTimer = 0;
            deactivatePlatformUnderPlayer(runtime, p);
            runtime.spawnSparkles(p.x + p.w / 2, p.y + p.h / 2, '#d9ff96', 8);
          }
        }
      }

      if (p.kind === 'ribbonBridge' && p.active !== false) {
        if (p.growTimer > 0) p.growTimer = Math.max(0, p.growTimer - dt);
        const duration = getAuthoredActiveDuration(p, RIBBON_BRIDGE_LIFE_SECONDS);
        p.ribbonBridgeLife = duration;
        if (!isUnlimitedActiveDuration(duration)) {
          p.ribbonBridgeTimer = (Number.isFinite(p.ribbonBridgeTimer) ? p.ribbonBridgeTimer : duration) - dt;
          if (p.ribbonBridgeTimer <= 0) {
            p.active = false;
            p.ribbonBridgeTimer = 0;
            deactivatePlatformUnderPlayer(runtime, p);
            runtime.spawnSparkles(p.x + p.w / 2, p.y + 4, '#ffd1e8', 10);
          }
        }
      }

      if (p.kind === 'waitFlower' && !getPlayerGround(runtime, p)) {
        p.waitFlowerTimer = 0;
      }

      if (p.kind === 'cloud') {
        updateSinkPlatform(runtime, p, dt, {
          max: CLOUD_SINK_MAX,
          sinkSpeed: CLOUD_SINK_SPEED,
          returnSpeed: CLOUD_RETURN_SPEED,
        });
      }

      if (p.kind === 'sleepCloud') {
        p.active = true;
        updateSleepCloud(runtime, p, dt);
      }

      if (p.kind === 'crumble' && p.active === false) {
        p.crumbleRespawnTimer = (p.crumbleRespawnTimer ?? CRUMBLE_RESPAWN_SECONDS) - dt;
        if (p.crumbleRespawnTimer <= 0) {
          p.active = true;
          p.crumbleTimer = 1;
          p.crumbleRespawnTimer = CRUMBLE_RESPAWN_SECONDS;
          runtime.spawnSparkles(p.x + p.w / 2, p.y + 4, '#f6dc9a', 10);
        }
      }

      if (p.kind === 'teacupSpin') {
        const standing = getPlayerGround(runtime, p);
        const playerCenterX = runtime.player.x + runtime.player.w / 2;
        const half = Math.max(1, p.w / 2);
        const side = standing ? clamp((playerCenterX - (p.x + p.w / 2)) / half, -1, 1) : 0;
        const amount = Math.max(0, Math.abs(side) - TEACUP_SPIN_TILT_DEADZONE) / (1 - TEACUP_SPIN_TILT_DEADZONE);
        const targetTilt = Math.sign(side) * amount * getTeacupSpinTiltMax(p);
        p.visualTilt = approach(p.visualTilt ?? 0, targetTilt, TEACUP_SPIN_TILT_SPEED * dt);
      }

      if (p.kind === 'spoon') {
        p.spoonSlopeDir = Math.sign(p.slopeDir || p.spoonSlopeDir || 1) || 1;
        p.spoonSlopeAngle = getSpoonTargetTilt(p);
        p.visualTilt = approach(p.visualTilt ?? p.spoonSlopeAngle, p.spoonSlopeAngle, TEACUP_SPIN_TILT_SPEED * dt);
      }

      if (p.kind === 'page') {
        p.active = getPageActiveState(p, runtime.elapsed);
      }
    }
  }
  static getPlayerJumpSpeed(player) {
    if (player.groundPlatform?.kind === 'jam') return JAM_SOFT_JUMP_SPEED;
    if (player.groundPlatform?.kind === 'cloud') return CLOUD_JUMP_SPEED;
    return null;
  }

  static resolvePlayerGround(runtime, dt = 1 / 60) {
    const player = runtime.player;
    const p = player.groundPlatform;
    if (p?.kind === 'dreamWind' || p?.kind === 'ribbonWind') refreshDreamWindCarry(runtime, p);
    applyDreamWindCarry(runtime, dt);

    if (!p) return;
    if (p.kind === 'jelly' && player.jellyBounceLock <= 0 && player.prevY + player.h <= p.y + 8) {
      player.vy = JELLY_BOUNCE_SPEED;
      player.onGround = false;
      player.groundPlatform = null;
      player.jellyBounceLock = 0.28;
      runtime.spawnSparkles(player.x + player.w / 2, p.y, '#ffd0ef', 8);
      runtime.app.audio.playSfx('jelly_bounce');
    }
    if (p.kind === 'jam') {
      player.vx *= 0.58;
      if (!p.stickyFxCooldown || p.stickyFxCooldown <= runtime.elapsed) {
        p.stickyFxCooldown = runtime.elapsed + 0.35;
        runtime.spawnSparkles(player.x + player.w / 2, p.y + 2, '#ff9fbd', 3);
      }
    }
    if (p.kind === 'spoon') {
      const dir = getSpoonDirection(p);
      if (dir) {
        player.vx = clamp(
          player.vx + dir * SPOON_SLIDE_ACCEL * dt,
          -SPOON_SLIDE_MAX_SPEED,
          SPOON_SLIDE_MAX_SPEED,
        );
        if (!p.slideFxCooldown || p.slideFxCooldown <= runtime.elapsed) {
          p.slideFxCooldown = runtime.elapsed + 0.2;
          runtime.spawnSparkles(player.x + player.w / 2, p.y + p.h, '#ffe6a7', 2);
        }
      }
    }
    if (p.kind === 'dreamWind' || p.kind === 'ribbonWind') {
      if (!p.windFxCooldown || p.windFxCooldown <= runtime.elapsed) {
        p.windFxCooldown = runtime.elapsed + 0.15;
        runtime.spawnSparkles(player.x + player.w / 2, player.y + 10, p.kind === 'ribbonWind' ? '#ffd1e8' : '#d7c7ff', 5);
      }
    }
    if (p.kind === 'waitFlower') {
      p.waitFlowerTimer = (p.waitFlowerTimer ?? 0) + dt;
      if (p.waitFlowerTimer >= WAIT_FLOWER_BLOOM_SECONDS) {
        p.waitFlowerTimer = -0.28;
        player.vy = WAIT_FLOWER_LAUNCH_SPEED;
        player.onGround = false;
        player.groundPlatform = null;
        runtime.spawnSparkles(player.x + player.w / 2, p.y, '#ffd1e8', 12);
        runtime.app.audio.playSfx('wait_flower_launch');
      }
    }
    if (p.kind === 'crumble') {
      p.crumbleTimer = Math.max(0, (p.crumbleTimer ?? 1.0) - dt / CRUMBLE_BREAK_SECONDS);
      if (p.crumbleTimer <= 0) {
        p.active = false;
        p.crumbleRespawnTimer = CRUMBLE_RESPAWN_SECONDS;
        player.groundPlatform = null;
        player.onGround = false;
        runtime.spawnSparkles(p.x + p.w / 2, p.y + 4, '#f3c174', 16);
        runtime.app.audio.playSfx('crumble_break');
      }
    }
  }

  static getMagicHitboxes(runtime) {
    const platforms = runtime?.stage?.platforms || [];
    return platforms
      .filter(canReactToMagic)
      .map(p => ({
        kind: p.kind,
        rect: getMagicReactionBounds(p),
      }));
  }

  static hitPlatformWithMagic(runtime, projectile) {
    if (!projectile?.alive || projectile.faction !== 'player') return false;
    const projectileBounds = projectile.getBounds();
    for (const p of runtime.stage.platforms) {
      if (!canReactToMagic(p)) continue;
      if (!intersects(projectileBounds, getMagicReactionBounds(p))) continue;

      if (p.kind === 'wishLeaf') {
        p.active = true;
        resetLifetimeTimer(p, 'wishLeafTimer', 'wishLeafLife', WISH_LEAF_LIFE_SECONDS);
        runtime.spawnSparkles(p.x + p.w / 2, p.y, '#d9ff96', 18);
        runtime.app.audio.playSfx('gimmick_complete');
        runtime.hud.showBanner('願いの葉が少しの間だけ開いたの！');
        return true;
      }
      if (p.kind === 'vine') {
        p.active = true;
        p.growTimer = VINE_GROW_DURATION;
        p.growDuration = VINE_GROW_DURATION;
        runtime.spawnSparkles(p.x + p.w / 2, p.y, '#aaf079', 18);
        runtime.app.audio.playSfx('vine_grow');
        runtime.hud.showBanner('豆の芽がぐんぐん伸びたの！');
        return true;
      }
      if (p.kind === 'jam') {
        p.kind = 'jamHard';
        p.hardenTimer = 3.8;
        runtime.spawnSparkles(p.x + p.w / 2, p.y, '#ffbfd6', 16);
        runtime.app.audio.playSfx('gimmick_complete');
        runtime.hud.showBanner('ジャムがきらきら固まったの！');
        return true;
      }
    }
    return false;
  }
}
