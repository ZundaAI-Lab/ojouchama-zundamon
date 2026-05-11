/**
 * 責務: なのちゃん本体の状態、追従・待機・飛行・呼び戻し・滑空補助・位置交換判定・低頻度の迷える住民狙い補助射撃を担当する。
 * 更新ルール: 入力の読み替えはNanoController、描画はNanoRendererに分離し、なのちゃん固有のゲームルールだけをここへ集約する。
 * 更新ルール: 飛行移動と位置交換の空間チェックはRuntimeの衝突ワールド用途別クエリを使い、その場で足場形状を再生成しない。
 * 更新ルール: 自動援護ショットはショップ強化の購入状態で解放・強化し、加入直後のなのちゃんはショットを出さない。
 * 更新ルール: 飛行中の画面端制限はなのちゃん固有の移動ルールとしてここで処理し、入力・描画・ステージ汎用境界へ持ち込まない。
 */
import { Actor } from '../Actor.js';
import { Projectile } from '../Projectile.js';
import { NanoController } from './NanoController.js';
import { NANO_CONFIG, NANO_STATES } from '../../config/nanoConfig.js';
import { INPUT_ACTIONS } from '../../config/inputActions.js';
import { GAME_VIEW } from '../../config/view.js';
import { intersects } from '../../utils/rect.js';

export class NanoCompanion extends Actor {
  constructor({ player, input }) {
    const start = NanoCompanion.getHeadPosition(player);
    super({ x: start.x, y: start.y, w: NANO_CONFIG.BODY_W, h: NANO_CONFIG.BODY_H });
    this.state = NANO_STATES.HEAD;
    this.controller = new NanoController(input);
    this.facing = player?.facing || 1;
    this.flyStartX = this.x;
    this.flyStartY = this.y;
    this.swapCooldown = 0;
    this.swapFxTimer = 0;
    this.swapFailFxTimer = 0;
    this.glideSparkTimer = 0;
    this.autoShotCooldown = NANO_CONFIG.AUTO_SHOT_INITIAL_DELAY;
  }

  static getHeadPosition(player) {
    return {
      x: player.x + player.w / 2 - NANO_CONFIG.BODY_W / 2 + NANO_CONFIG.HEAD_OFFSET_X,
      y: player.y + NANO_CONFIG.HEAD_OFFSET_Y,
    };
  }

  updateInput(dt, runtime) {
    this.controller.update(dt, this, runtime);
  }

  updateMotion(dt, runtime) {
    this.swapCooldown = Math.max(0, this.swapCooldown - dt);
    this.autoShotCooldown = Math.max(0, this.autoShotCooldown - dt);
    this.swapFxTimer = Math.max(0, this.swapFxTimer - dt);
    this.swapFailFxTimer = Math.max(0, this.swapFailFxTimer - dt);

    if (this.state === NANO_STATES.HEAD) {
      this.attachToPlayer(runtime.player);
      this.tryAutoShootResident(runtime);
      return;
    }

    this.updateDetachedFacing(runtime.player);
    this.startReturnIfOffscreen(runtime);

    if (this.state === NANO_STATES.FLY) {
      this.updateFly(dt, runtime);
      this.startReturnIfOffscreen(runtime);
    }

    if (this.state === NANO_STATES.RETURN) {
      this.updateReturn(dt, runtime.player);
    }

    this.tryAutoShootResident(runtime);
  }

  tryAutoShootResident(runtime) {
    const tuning = this.getAutoShotTuning(runtime);
    if (!tuning.unlocked || this.autoShotCooldown > 0 || !this.canAutoShoot()) return false;
    const target = this.findAutoShotTarget(runtime);
    if (!target) return false;

    this.fireAutoShot(runtime, target, tuning);
    this.autoShotCooldown = tuning.cooldown;
    return true;
  }

  getAutoShotTuning(runtime) {
    const upgrades = runtime?.saveData?.upgrades || {};
    const unlocked = (upgrades.nanoMagicRibbon || 0) > 0;
    const sugarLevel = upgrades.nanoSugar || 0;
    const powderLevel = upgrades.nanoPowder || 0;
    return {
      unlocked,
      damage: NANO_CONFIG.AUTO_SHOT_DAMAGE + sugarLevel,
      cooldown: Math.max(1.65, NANO_CONFIG.AUTO_SHOT_COOLDOWN - powderLevel * 0.75),
    };
  }

  canAutoShoot() {
    // 自動射撃は補助行動なので、帰還中だけは位置交換や復帰挙動を優先する。
    return this.state === NANO_STATES.HEAD || this.state === NANO_STATES.WAIT || this.state === NANO_STATES.FLY;
  }

  findAutoShotTarget(runtime) {
    const targets = [...(runtime?.residents || [])];
    const rideResidents = runtime?.balloonRideSystem?.getResidents?.() || [];
    targets.push(...rideResidents);
    if (runtime?.boss?.alive && runtime.canHitBoss?.()) targets.push(runtime.boss);

    const range = NANO_CONFIG.AUTO_SHOT_RANGE;
    const rangeSq = range * range;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    let best = null;
    let bestDistSq = Infinity;

    for (const target of targets) {
      if (!target?.alive) continue;
      const tx = target.x + target.w / 2;
      const ty = target.y + target.h / 2;
      const dx = tx - cx;
      const dy = ty - cy;
      const distSq = dx * dx + dy * dy;
      if (distSq > rangeSq || distSq >= bestDistSq) continue;
      best = target;
      bestDistSq = distSq;
    }

    return best;
  }

  fireAutoShot(runtime, target, tuning = this.getAutoShotTuning(runtime)) {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const tx = target.x + target.w / 2;
    const ty = target.y + target.h / 2;
    const dx = tx - cx;
    const dy = ty - cy;
    const len = Math.hypot(dx, dy) || 1;
    const dirX = dx / len;
    const dirY = dy / len;
    const projectileW = NANO_CONFIG.AUTO_SHOT_W;
    const projectileH = NANO_CONFIG.AUTO_SHOT_H;

    this.faceMovement(dx);
    runtime.projectiles.push(new Projectile({
      x: cx + dirX * 10 - projectileW / 2,
      y: cy + dirY * 10 - projectileH / 2,
      vx: dirX * NANO_CONFIG.AUTO_SHOT_SPEED,
      vy: dirY * NANO_CONFIG.AUTO_SHOT_SPEED,
      boosted: false,
      faction: 'player',
      damage: tuning.damage,
      color: NANO_CONFIG.AUTO_SHOT_COLOR,
      life: NANO_CONFIG.AUTO_SHOT_LIFE,
      source: 'nano',
      w: projectileW,
      h: projectileH,
    }));
    runtime.spawnSparkles(cx, cy, NANO_CONFIG.AUTO_SHOT_COLOR, 4);
  }

  attachToPlayer(player) {
    const head = NanoCompanion.getHeadPosition(player);
    this.x = head.x;
    this.y = head.y;
    this.vx = 0;
    this.vy = 0;
    this.facing = player?.facing || this.facing || 1;
  }

  updateDetachedFacing(player) {
    if (!player) return;

    if (this.state === NANO_STATES.WAIT) {
      this.facePlayer(player);
      return;
    }

    if (this.state === NANO_STATES.FLY) {
      this.faceMovement(this.vx);
      return;
    }

    if (this.state === NANO_STATES.RETURN) {
      const target = NanoCompanion.getHeadPosition(player);
      this.faceMovement(target.x - this.x);
    }
  }

  facePlayer(player) {
    const playerCenterX = player.x + player.w / 2;
    const nanoCenterX = this.x + this.w / 2;
    this.faceMovement(playerCenterX - nanoCenterX);
  }

  faceMovement(dx) {
    if (Math.abs(dx) <= NANO_CONFIG.FACE_PLAYER_DEADZONE) return;
    this.facing = dx >= 0 ? 1 : -1;
  }

  startReturnIfOffscreen(runtime) {
    if (!this.isOffscreen(runtime)) return;
    this.startReturn();
  }

  isOffscreen(runtime) {
    if (!runtime?.camera) return false;
    const margin = NANO_CONFIG.SCREEN_RETURN_MARGIN;
    const left = runtime.camera.x - margin;
    const top = runtime.camera.y - margin;
    const right = runtime.camera.x + GAME_VIEW.WIDTH + margin;
    const bottom = runtime.camera.y + GAME_VIEW.HEIGHT + margin;
    return this.x + this.w < left || this.x > right || this.y + this.h < top || this.y > bottom;
  }

  launchFromHead(runtime, dir) {
    if (this.state !== NANO_STATES.HEAD || Math.hypot(dir.x, dir.y) <= 0.15) return;
    this.state = NANO_STATES.FLY;
    this.flyStartX = this.x;
    this.flyStartY = this.y;
    this.vx = dir.x * NANO_CONFIG.FLY_SPEED;
    this.vy = dir.y * NANO_CONFIG.FLY_SPEED;
    runtime.spawnSparkles(this.x + this.w / 2, this.y + this.h / 2, '#dfffc5', 6);
    runtime.app.audio.playSfx('nano_launch');
  }

  waitFromHead() {
    if (this.state !== NANO_STATES.HEAD) return;
    this.state = NANO_STATES.WAIT;
    this.vx = 0;
    this.vy = 0;
  }

  canReturnByInput() {
    return this.state === NANO_STATES.WAIT || this.state === NANO_STATES.FLY;
  }

  canCollectItems() {
    return this.state === NANO_STATES.FLY || this.state === NANO_STATES.RETURN;
  }

  startReturn() {
    if (this.state === NANO_STATES.HEAD) return;
    this.state = NANO_STATES.RETURN;
  }

  updateFly(dt, runtime) {
    const distance = Math.hypot(this.vx * dt, this.vy * dt);
    const steps = Math.max(1, Math.min(10, Math.ceil(distance / 6)));
    const stepDt = dt / steps;

    for (let i = 0; i < steps; i += 1) {
      const prevX = this.x;
      const prevY = this.y;
      this.x += this.vx * stepDt;
      this.y += this.vy * stepDt;

      if (this.stopAtScreenTopEdge(runtime, prevX, prevY)) return;

      if (this.hitsSolid(runtime) || this.isOutOfStage(runtime.stage)) {
        this.x = prevX;
        this.y = prevY;
        this.stopAndWait(runtime);
        return;
      }

      const traveled = Math.hypot(this.x - this.flyStartX, this.y - this.flyStartY);
      if (traveled >= NANO_CONFIG.FLY_MAX_DISTANCE) {
        this.stopAndWait(runtime);
        return;
      }
    }
  }

  stopAtScreenTopEdge(runtime, prevX, prevY) {
    const minY = this.getScreenTopLimitY(runtime);
    if (minY === null || this.y >= minY) return false;

    const nextX = this.x;
    this.y = minY;
    if (this.hitsSolid(runtime) || this.isOutOfStage(runtime.stage)) {
      this.x = prevX;
      this.y = prevY;
    } else {
      this.x = nextX;
    }
    this.stopAndWait(runtime);
    return true;
  }

  getScreenTopLimitY(runtime) {
    if (!runtime?.camera || !Number.isFinite(runtime.camera.y)) return null;
    const screenTop = Math.max(0, runtime.camera.y);
    const visualInset = Math.max(0, (NANO_CONFIG.DRAW_H - this.h) / 2);
    return screenTop + visualInset + NANO_CONFIG.SCREEN_TOP_VISUAL_PADDING;
  }

  updateReturn(dt, player) {
    const target = NanoCompanion.getHeadPosition(player);
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= 8) {
      this.state = NANO_STATES.HEAD;
      this.attachToPlayer(player);
      return;
    }
    const step = Math.min(dist, NANO_CONFIG.RETURN_SPEED * dt);
    const len = dist || 1;
    this.x += dx / len * step;
    this.y += dy / len * step;
  }

  stopAndWait(runtime) {
    this.state = NANO_STATES.WAIT;
    this.vx = 0;
    this.vy = 0;
    runtime.spawnSparkles(this.x + this.w / 2, this.y + this.h / 2, '#f2ffd6', 5);
  }

  hitsSolid(runtime) {
    const bounds = this.getBounds();
    return runtime.getCollisionSolids('fitCheck').some(solid => solid.active !== false && intersects(bounds, solid));
  }

  isOutOfStage(stage) {
    return this.x < 0 || this.y < 0 || this.x + this.w > stage.width || this.y + this.h > stage.height;
  }

  applyGlide(runtime, dt) {
    const player = runtime.player;
    if (this.state !== NANO_STATES.HEAD || player.onGround || !runtime.app.input.isDown(INPUT_ACTIONS.JUMP) || player.vy <= 0) {
      this.glideSparkTimer = 0;
      return;
    }
    player.vy = Math.min(player.vy, NANO_CONFIG.GLIDE_MAX_FALL_SPEED);
    this.glideSparkTimer -= dt;
    if (this.glideSparkTimer <= 0) {
      this.glideSparkTimer = NANO_CONFIG.GLIDE_SPARK_INTERVAL;
      runtime.spawnSparkles(player.x + player.w / 2, player.y + 6, '#eaffcb', 3);
    }
  }

  tryHandleSwapProjectile(runtime, projectile) {
    if (!projectile.alive || projectile.faction !== 'player' || projectile.source === 'nano') return false;
    if (this.swapCooldown > 0) return false;
    if (this.state !== NANO_STATES.WAIT && this.state !== NANO_STATES.FLY) return false;
    if (!intersects(projectile.getBounds(), this.getBounds())) return false;

    projectile.alive = false;
    return this.trySwapWithPlayer(runtime);
  }

  trySwapWithPlayer(runtime) {
    const player = runtime.player;
    const destination = this.findValidPlayerDestination(runtime);
    if (!destination) {
      this.spawnSwapFail(runtime);
      return true;
    }

    const oldPlayer = { x: player.x, y: player.y };
    const oldNano = { x: this.x, y: this.y };
    this.spawnSwapStart(runtime, oldPlayer, oldNano);

    player.x = destination.x;
    player.y = destination.y;
    player.prevX = player.x;
    player.prevY = player.y;
    player.vx *= 0.35;
    player.vy = 0;
    player.onGround = false;
    this.x = oldPlayer.x + player.w / 2 - this.w / 2;
    this.y = oldPlayer.y + player.h / 2 - this.h / 2;
    this.vx = 0;
    this.vy = 0;
    this.state = NANO_STATES.WAIT;
    this.swapCooldown = NANO_CONFIG.SWAP_COOLDOWN;
    this.swapFxTimer = NANO_CONFIG.SWAP_FX_TIME;
    player.nanoSwapFxTimer = NANO_CONFIG.SWAP_FX_TIME;

    runtime.spawnSparkles(player.x + player.w / 2, player.y + player.h / 2, '#f2ffe0', 14);
    runtime.spawnSparkles(this.x + this.w / 2, this.y + this.h / 2, '#d8fff7', 12);
    runtime.camera.shake(1.5, 0.08);
    runtime.app.audio.playSfx('nano_swap_success');
    return true;
  }

  findValidPlayerDestination(runtime) {
    const player = runtime.player;
    const baseX = this.x + this.w / 2 - player.w / 2;
    const baseY = this.y + this.h / 2 - player.h / 2;
    for (const offset of NANO_CONFIG.SWAP_SAFE_OFFSETS) {
      const x = baseX + offset.x;
      const y = baseY + offset.y;
      if (this.canFitPlayerAt(runtime, x, y)) return { x, y };
    }
    return null;
  }

  canFitPlayerAt(runtime, x, y) {
    const player = runtime.player;
    const rect = { x, y, w: player.w, h: player.h };
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > runtime.stage.width || rect.y + rect.h > runtime.stage.height) return false;
    return !runtime.getCollisionSolids('fitCheck').some(solid => solid.active !== false && intersects(rect, solid));
  }

  spawnSwapStart(runtime, playerPos, nanoPos) {
    runtime.spawnSparkles(playerPos.x + runtime.player.w / 2, playerPos.y + runtime.player.h / 2, '#f8ffd8', 10);
    runtime.spawnSparkles(nanoPos.x + this.w / 2, nanoPos.y + this.h / 2, '#d8fff7', 10);
  }

  spawnSwapFail(runtime) {
    const player = runtime.player;
    this.swapFailFxTimer = NANO_CONFIG.SWAP_FAIL_FX_TIME;
    player.nanoSwapFailFxTimer = NANO_CONFIG.SWAP_FAIL_FX_TIME;
    runtime.spawnSparkles(this.x + this.w / 2, this.y + this.h / 2, '#ffd6df', 8);
    runtime.spawnSparkles(player.x + player.w / 2, player.y + player.h / 2, '#ffd6df', 5);
    runtime.app.audio.playSfx('nano_swap_fail');
  }
}
