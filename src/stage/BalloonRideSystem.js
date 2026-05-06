/**
 * 責務: 風船ライドの開始条件、状態遷移、各サブシステムの更新順序、失敗/クリア接続を統括する。
 * 更新ルール: プレイヤー移動はPlayerFloatingRideMotion、なのちゃん帰還/頭乗り維持はNanoRideSupport、強制スクロールはStageScrollControllerへ委譲する。
 * 更新ルール: 風船在庫・風船幾何・接触判定・結果フローは担当モジュールへ委譲し、住民行動と弾は通常住民/Projectile基盤で扱う。
 * 更新ルール: 迷える住民データは通常の stage.residents を rideId で抽出し、風船ライド定義へ重複保持しない。
 * 更新ルール: ライド中に生成された報酬豆コインの移動/取得猶予はRewardCoinDropServiceへ委譲し、取得反映はItemCollectionServiceへ委譲する。
 * 更新ルール: 特殊イベントでdisabledになったライド定義は開始候補・ゴール表示から除外する。
 * 更新ルール: 横スクロール/上昇スクロールの差分はBalloonRideConfigのスクロールベクトルへ集約し、開始・移動・弾範囲はカメラ矩形基準で扱う。
 * 更新ルール: 上昇スクロール中の魔法弾方向はプレイヤーの向きを使い、横スクロールの従来右撃ち挙動とは分けて扱う。
 */
import { PlayerFloatingRideMotion } from '../actors/player/PlayerFloatingRideMotion.js';
import { NanoRideSupport } from '../actors/nano/NanoRideSupport.js';
import { StageScrollController } from './StageScrollController.js';
import { ItemCollectionService } from './ItemCollectionService.js';
import { RewardCoinDropService } from './RewardCoinDropService.js';
import { clamp } from '../utils/math.js';
import { intersects } from '../utils/rect.js';
import { INPUT_ACTIONS } from '../config/inputActions.js';
import { GAME_VIEW } from '../config/view.js';
import { ResidentGroupSystem } from '../actors/resident/ResidentGroupSystem.js';
import { isResidentForRide } from '../actors/resident/ResidentScope.js';
import { createRideResidentContext } from './residents/createRideResidentContext.js';
import { ResidentProjectileHitService } from './residents/ResidentProjectileHitService.js';
import { ProjectileUpdateSystem } from './projectiles/ProjectileUpdateSystem.js';
import {
  DEFAULT_BALLOON_RIDE_CONFIG,
  getBalloonRideScrollVector,
  getInitialRideBalloons,
  isVerticalUpBalloonRide,
  normalizeBalloonRideDefinition,
} from './balloonRide/BalloonRideConfig.js';
import { BALLOON_RIDE_STATE, BalloonRideSession } from './balloonRide/BalloonRideSession.js';
import { BalloonStock } from './balloonRide/BalloonStock.js';
import { BalloonRideBalloonModel } from './balloonRide/BalloonRideBalloonModel.js';
import { BalloonRideContactResolver } from './balloonRide/BalloonRideContactResolver.js';
import { BalloonRideOutcomeFlow } from './balloonRide/BalloonRideOutcomeFlow.js';
import { BalloonRideEffectStore } from './balloonRide/BalloonRideEffectStore.js';
import { getStageFallOutY } from './StageFallBoundary.js';

const VERTICAL_RIDE_FAIL_MARGIN_Y = 80;

const RIDE_REWARD_COIN_DROP = {
  gravity: 52,
  pickupDelay: 0.22,
  motion: {
    baseVx: 0,
    spreadSpeedX: 0,
    alternatingBiasX: 0,
    baseVy: 18,
    vyPatternStep: 5,
    countVyOffset: 0,
    spawnSpacingX: 3,
  },
};

function createRideRewardCoinDrop(config = DEFAULT_BALLOON_RIDE_CONFIG) {
  const scrollSpeed = Math.max(0, config?.scrollSpeed ?? DEFAULT_BALLOON_RIDE_CONFIG.scrollSpeed);
  return {
    ...RIDE_REWARD_COIN_DROP,
    motion: {
      ...RIDE_REWARD_COIN_DROP.motion,
      // 風船ライド中の報酬豆コインは、追加の世界座標X速度を持たせず、画面上では自動スクロール速度ぶんだけ左へ流す。
      baseVx: -scrollSpeed + scrollSpeed,
    },
  };
}

export class BalloonRideSystem {
  constructor(runtime, services = {}) {
    this.runtime = runtime;
    this.rides = (runtime.stage.balloonRides || []).map(normalizeBalloonRideDefinition);
    this.session = new BalloonRideSession();
    this.balloonStock = new BalloonStock();
    this.balloonModel = new BalloonRideBalloonModel();
    this.playerRideMotion = new PlayerFloatingRideMotion();
    this.scrollController = services.scrollController || new StageScrollController();
    this.nanoRideSupport = services.nanoRideSupport || new NanoRideSupport();
    this.effectStore = new BalloonRideEffectStore();
    this.contactResolver = new BalloonRideContactResolver(runtime, this.balloonModel);
    this.outcomeFlow = new BalloonRideOutcomeFlow(runtime, {
      playerRideMotion: this.playerRideMotion,
      nanoRideSupport: this.nanoRideSupport,
      scrollController: this.scrollController,
      balloonModel: this.balloonModel,
      effectStore: this.effectStore,
      onReset: () => this.resetRuntimeState(),
    });
    this.rideResidentContext = null;
    this.scrollX = 0;
    this.scrollY = 0;
  }

  get clearFloat() {
    return this.outcomeFlow.clearFloat;
  }

  isActive() {
    return this.session.isActive();
  }

  isRideVisualActive() {
    return this.session.isRideVisualActive();
  }

  isVerticalUpActive() {
    return this.isRideVisualActive() && isVerticalUpBalloonRide(this.session.activeRide?.config);
  }

  getBalloonHitbox(elapsed = this.runtime.elapsed || 0) {
    return this.balloonModel.getHitbox(
      this.runtime.player,
      this.getVisibleBalloonCount(),
      this.session.activeRide?.config || DEFAULT_BALLOON_RIDE_CONFIG,
      elapsed
    );
  }

  getPlayerRideHitbox() {
    if (!this.runtime.player) return null;
    return this.balloonModel.getPlayerRideHitbox(this.runtime.player);
  }

  isHitVisualActive() {
    return this.session.isHitVisualActive();
  }

  isClearing() {
    return this.session.isClearing();
  }

  getRideBob(elapsed = 0) {
    return this.balloonModel.getRideBob(this.session.activeRide?.config || DEFAULT_BALLOON_RIDE_CONFIG, elapsed);
  }

  isAttachedBalloonVisible() {
    return this.isRideVisualActive() && !this.isClearing();
  }

  getVisibleBalloonCount() {
    return this.balloonStock.getVisibleCount(this.isAttachedBalloonVisible());
  }

  getBalloonVisualRect(elapsed = this.runtime.elapsed || 0) {
    return this.balloonModel.getVisualRect(
      this.runtime.player,
      this.getVisibleBalloonCount(),
      this.session.activeRide?.config || DEFAULT_BALLOON_RIDE_CONFIG,
      elapsed
    );
  }

  getHudState() {
    return {
      active: this.isRideVisualActive() || this.session.state === BALLOON_RIDE_STATE.FAILING,
      balloons: this.balloonStock.colors,
      hitFlash: this.session.hitVisualTimer > 0,
      locked: this.isActive(),
      waitingRideSupport: this.session.isPreparingRideSupport(),
    };
  }

  getStartObjects() {
    return this.rides
      .filter(ride => !ride.disabled && ride.active !== false)
      .filter(ride => !this.session.completedRideIds.has(ride.id))
      .filter(ride => !(this.session.activeRide?.id === ride.id && this.session.state !== BALLOON_RIDE_STATE.IDLE && this.session.state !== BALLOON_RIDE_STATE.PREPARING_RIDE_SUPPORT))
      .map(ride => ({ ...ride.start, rideId: ride.id, active: this.session.pendingRide?.id === ride.id }));
  }

  getGoalObjects() {
    return this.rides
      .filter(ride => !ride.disabled && ride.active !== false)
      .map(ride => ({ ...ride.goal, rideId: ride.id, active: this.session.activeRide?.id === ride.id }));
  }

  getHazards() {
    if (!this.session.activeRide) return [];
    return this.session.activeRide.hazards.filter(hazard => hazard.alive !== false);
  }

  getResidents() {
    if (!this.session.activeRide) return [];
    return this.getRideResidents(this.session.activeRide.id).filter(resident => resident.alive !== false);
  }

  getRideResidents(rideId) {
    return this.runtime.residents.filter(resident => isResidentForRide(resident, rideId));
  }

  resetRideResidents(rideId) {
    for (const resident of this.getRideResidents(rideId)) resident.resetRuntimeState?.();
  }

  getShots() {
    return this.runtime.projectiles.filter(projectile => projectile.alive !== false && this.isRideHazardProjectile(projectile));
  }

  getEffects() {
    return this.effectStore.list();
  }

  tryStartIfTouched() {
    if (this.isActive()) return false;
    const ride = this.rides.find(candidate => (
      !candidate.disabled &&
      candidate.active !== false &&
      !this.session.completedRideIds.has(candidate.id) &&
      intersects(this.runtime.player.getBounds(), candidate.start)
    ));
    if (!ride) return false;

    const anchor = this.createStartAnchor(ride);
    if (this.nanoRideSupport.needsPreparation(this.runtime)) {
      this.beginRideSupportPreparation(ride, anchor);
      return true;
    }

    this.start(ride, anchor);
    return true;
  }

  createStartAnchor(ride) {
    const runtime = this.runtime;
    return {
      playerX: runtime.player.x,
      playerY: runtime.player.y,
      cameraX: clamp((ride.start.cameraX ?? runtime.camera.x ?? 0), 0, Math.max(0, runtime.stage.width - GAME_VIEW.WIDTH)),
      cameraY: clamp((ride.start.cameraY ?? runtime.camera.y ?? 0), 0, Math.max(0, runtime.stage.height - GAME_VIEW.HEIGHT)),
    };
  }

  beginRideSupportPreparation(ride, anchor) {
    const runtime = this.runtime;
    this.session.beginRideSupportPreparation(ride, anchor);
    this.playerRideMotion.reset();
    this.scrollX = anchor.cameraX;
    this.scrollY = anchor.cameraY;
    this.scrollController.begin({
      camera: runtime.camera,
      target: runtime.player,
      startX: this.scrollX,
      startY: this.scrollY,
      speedX: 0,
      speedY: 0,
      worldWidth: runtime.stage.width,
      worldHeight: runtime.stage.height,
    });
    this.lockPlayerAtStartAnchor();
    this.nanoRideSupport.beginPreparation(runtime);
    runtime.app.input.clearGameplay();
    runtime.hud?.showBanner?.('なのちゃんを呼び戻してから風船に乗るの！');
  }

  start(ride, anchor = this.createStartAnchor(ride)) {
    const runtime = this.runtime;
    const activeRide = this.cloneRideRuntime(ride);
    this.resetRideResidents(activeRide.id);
    const config = activeRide.config;
    this.session.startRide(activeRide, anchor, config);
    this.balloonStock.start(getInitialRideBalloons(runtime));
    this.effectStore.reset();
    this.clearRideProjectiles();
    this.outcomeFlow.reset();
    this.scrollX = anchor.cameraX;
    this.scrollY = anchor.cameraY;
    const scrollVector = getBalloonRideScrollVector(config);
    this.scrollController.begin({
      camera: runtime.camera,
      target: runtime.player,
      startX: this.scrollX,
      startY: this.scrollY,
      speedX: scrollVector.x,
      speedY: scrollVector.y,
      worldWidth: runtime.stage.width,
      worldHeight: runtime.stage.height,
    });
    this.scrollX = this.scrollController.x;
    this.scrollY = this.scrollController.y;
    this.playerRideMotion.begin(runtime.player, {
      scrollX: this.scrollX,
      scrollY: this.scrollY,
      scrollSpeedX: scrollVector.x,
      scrollSpeedY: scrollVector.y,
      screenX: anchor.playerX - this.scrollX,
      screenY: clamp(anchor.playerY - config.startLiftY - this.scrollY, config.bounds.minY, config.bounds.maxY),
    });
    this.nanoRideSupport.setRideVisualHidden(true);
    this.nanoRideSupport.mountToPlayer(runtime, 0);
    runtime.respawnPoint = { ...(activeRide.start.respawn || activeRide.respawn || runtime.respawnPoint) };
    runtime.app.input.clearGameplay();
    runtime.hud?.showBanner?.('風船ライドなの！ 風船を守って進むの！');
    runtime.app.audio.playSfx('ride_start_jingle');
  }

  cloneRideRuntime(ride) {
    return normalizeBalloonRideDefinition(ride);
  }

  update(dt) {
    if (!this.isActive()) return;
    if (this.session.isPreparingRideSupport()) {
      this.updateRideSupportPreparation(dt);
      return;
    }
    const activeRide = this.session.activeRide;
    if (!activeRide) return;
    const runtime = this.runtime;
    const config = activeRide.config;
    this.updatePlayerActionTimers(dt);
    this.session.tickCommonTimers(dt);

    if (this.session.state === BALLOON_RIDE_STATE.STARTING) {
      this.session.startTimer -= dt;
      this.effectStore.update(dt);
      this.handleMagicInput();
      if (this.session.startTimer <= 0) this.session.state = BALLOON_RIDE_STATE.RIDING;
      const scrollVector = getBalloonRideScrollVector(config);
      this.playerRideMotion.applyPosition(runtime.player, {
        scrollX: this.scrollX,
        scrollY: this.scrollY,
        scrollSpeedX: scrollVector.x,
        scrollSpeedY: scrollVector.y,
      });
      this.nanoRideSupport.mountToPlayer(runtime, dt);
      return;
    }

    if (this.session.state === BALLOON_RIDE_STATE.FAILING) {
      this.outcomeFlow.updateFailing(dt, activeRide, this.session);
      return;
    }

    if (this.session.state === BALLOON_RIDE_STATE.CLEARING) {
      this.updateRideProjectiles(dt, this.getResidents());
      this.outcomeFlow.updateClearing(dt, activeRide, this.session);
      return;
    }

    this.updateScroll(dt);
    this.updateRideMove(dt, config);
    if (this.session.state === BALLOON_RIDE_STATE.FAILING) {
      this.effectStore.update(dt);
      return;
    }

    this.handleMagicInput();
    this.updateRideResidents(dt);
    this.nanoRideSupport.mountToPlayer(runtime, dt);
    this.updateRideProjectiles(dt, this.getResidents());
    this.updateRideItems(dt, config);
    this.resolveRideContacts(dt, config);

    if (this.session.state === BALLOON_RIDE_STATE.RIDING && this.outcomeFlow.hasReachedGoal(activeRide)) {
      this.startClearing();
      return;
    }

    this.effectStore.update(dt);
    this.session.resolveHitState(config);
  }

  handleMagicInput() {
    const input = this.runtime.app.input;
    if (!input.wasPressed(INPUT_ACTIONS.MAGIC)) return;
    const verticalUp = isVerticalUpBalloonRide(this.session.activeRide?.config);
    const facing = this.runtime.player?.facing >= 0 ? 1 : -1;
    this.runtime.player.magic.tryCast(this.runtime, verticalUp ? { x: facing, y: 0 } : { x: 1, y: 0 });
  }

  updateRideResidents(dt) {
    this.rideResidentContext = createRideResidentContext(this.runtime, this.session.activeRide?.config);
    ResidentGroupSystem.update(this.getResidents(), dt, this.rideResidentContext);
  }

  updateRideItems(dt, config = DEFAULT_BALLOON_RIDE_CONFIG) {
    RewardCoinDropService.updateItems(this.runtime.items, dt, null, null);
    const rideCollector = this.createRideItemCollector(config);
    ItemCollectionService.collectTouchedItems(this.runtime, [rideCollector]);
  }

  createRideItemCollector(config = DEFAULT_BALLOON_RIDE_CONFIG) {
    const runtime = this.runtime;
    return {
      getBounds: () => this.balloonModel.getPlayerRidePickupBounds(runtime.player, config, runtime.elapsed),
    };
  }

  updateRideProjectiles(dt, residents = this.getResidents()) {
    const runtime = this.runtime;
    ProjectileUpdateSystem.update(runtime.projectiles, dt, {
      bounds: {
        left: runtime.camera.x - 60,
        right: runtime.camera.x + 540,
        top: runtime.camera.y - 80,
        bottom: Math.max(runtime.camera.y + GAME_VIEW.HEIGHT + 80, getStageFallOutY(runtime.stage)),
      },
      onAfterStep: projectile => {
        if (projectile.faction !== 'player') return;
        ResidentProjectileHitService.resolvePlayerProjectile(runtime, projectile, residents, {
          behaviorContext: this.rideResidentContext || createRideResidentContext(runtime, this.session.activeRide?.config),
          hitSfx: 'magic_hit',
          reward: {
            sparkCount: 0,
            playSfx: true,
            sfx: 'resident_purify',
            drop: createRideRewardCoinDrop(this.session.activeRide?.config),
          },
          onHitResident: resident => {
            resident.attackFlash = 0.18;
            runtime.spawnSparkles(resident.x + resident.w / 2, resident.y + resident.h / 2, '#e8ffd1', 8);
          },
        });
      },
    });
  }

  isRideHazardProjectile(projectile) {
    return projectile?.faction === 'resident' && projectile.contactEffect?.targetTypes?.includes('rideBalloon');
  }

  clearRideProjectiles() {
    this.runtime.projectiles = this.runtime.projectiles.filter(projectile => !this.isRideHazardProjectile(projectile));
  }

  updatePlayerActionTimers(dt) {
    const player = this.runtime.player;
    player.magic.update(dt);
    player.bow.update(dt);
    player.tea.update(dt);
    player.invincibleTimer = Math.max(0, player.invincibleTimer - dt);
    player.damageFlash = Math.max(0, player.damageFlash - dt);
  }

  updateRideSupportPreparation(dt) {
    const runtime = this.runtime;
    this.lockPlayerAtStartAnchor();
    this.updatePlayerActionTimers(dt);
    this.effectStore.update(dt);

    if (!this.session.pendingRide) {
      this.resetRuntimeState();
      return;
    }

    if (this.nanoRideSupport.updatePreparation(runtime, dt)) {
      this.start(this.session.pendingRide, this.session.pendingStartAnchor || this.createStartAnchor(this.session.pendingRide));
    }
  }

  lockPlayerAtStartAnchor() {
    if (!this.session.pendingStartAnchor) return;
    const runtime = this.runtime;
    this.playerRideMotion.lockAtAnchor(runtime.player, this.session.pendingStartAnchor);
    this.scrollController.setPosition(this.session.pendingStartAnchor.cameraX, this.session.pendingStartAnchor.cameraY || 0);
    this.scrollX = this.scrollController.x;
    this.scrollY = this.scrollController.y;
  }

  updateScroll(dt) {
    this.scrollController.update(dt);
    this.scrollX = this.scrollController.x;
    this.scrollY = this.scrollController.y;
  }

  updateRideMove(dt, config) {
    const scrollVector = getBalloonRideScrollVector(config);
    const result = this.playerRideMotion.update(this.runtime.player, {
      dt,
      input: this.runtime.app.input,
      scrollX: this.scrollX,
      scrollY: this.scrollY,
      scrollSpeedX: scrollVector.x,
      scrollSpeedY: scrollVector.y,
      config,
      downDrift: this.balloonStock.getDownDrift(config),
    });
    if (isVerticalUpBalloonRide(config)) {
      if (result.screenY > (config.bounds?.maxY || GAME_VIEW.HEIGHT) + VERTICAL_RIDE_FAIL_MARGIN_Y) this.failRide('画面下まで流されたの… もう一度ですの');
      return;
    }
    if (this.runtime.player.y > getStageFallOutY(this.runtime.stage)) this.failRide('下まで流されたの… もう一度ですの');
  }

  failRide(message = '風船ライド失敗なの… もう一度ですの') {
    const activeRide = this.session.activeRide;
    if (!activeRide || this.session.state === BALLOON_RIDE_STATE.FAILING || this.session.state === BALLOON_RIDE_STATE.CLEARING) return;
    this.session.beginFailing(activeRide.config.failTime);
    this.playerRideMotion.setVelocity(0, 70);
    this.runtime.hud?.showBanner?.(message);
    this.runtime.app.audio.playSfx('ride_fail_jingle');
  }

  resolveRideContacts(dt, config) {
    this.contactResolver.resolve({
      active: this.session.state === BALLOON_RIDE_STATE.RIDING,
      hazards: this.getHazards(),
      residents: this.getResidents(),
      shots: this.getShots(),
      dt,
      hitGraceTimer: this.session.hitGraceTimer,
      balloonCount: this.getVisibleBalloonCount(),
      config,
      elapsed: this.runtime.elapsed,
      onPlayerHit: sourceRect => this.damagePlayerFromRideContact(sourceRect),
      onBalloonHit: reason => this.popBalloon(reason),
    });
  }

  damagePlayerFromRideContact(sourceRect) {
    const runtime = this.runtime;
    const sourceFacing = runtime.player.x < sourceRect.x ? -1 : 1;
    const damaged = runtime.player.hit(runtime, sourceFacing);
    if (!damaged) return false;
    runtime.damageCount += 1;
    this.session.markPlayerHit(this.session.activeRide.config);
    if (runtime.player.dead) {
      runtime.app.input.clearGameplay();
      runtime.hud?.showBanner?.('おやすみなさい… もういちど挑戦するの');
      runtime.restartTimer = 1.2;
    }
    return true;
  }

  popBalloon(reason = 'hazard') {
    const color = this.balloonStock.pop();
    if (!color) return;
    const runtime = this.runtime;
    const x = runtime.player.x + runtime.player.w / 2 + 30;
    const y = runtime.player.y - 52;
    this.effectStore.spawnBalloonPop(color, x, y);
    this.session.hitVisualTimer = this.session.activeRide.config.hitVisualTime;
    this.session.hitGraceTimer = this.session.activeRide.config.hitGrace;
    runtime.camera.shake(4, 0.18);
    runtime.flashTimer = 0.13;
    runtime.app.audio.playSfx('balloon_pop');

    if (this.balloonStock.isEmpty()) {
      this.failRide('風船がぜんぶ割れたの… もう一度ですの');
    } else {
      this.session.state = BALLOON_RIDE_STATE.HIT;
    }
  }

  startClearing() {
    this.outcomeFlow.startClearing(this.session.activeRide, this.session, this.balloonStock.count);
  }

  resetRuntimeState() {
    this.session.reset();
    this.balloonStock.reset();
    this.playerRideMotion.reset();
    this.effectStore.reset();
    this.clearRideProjectiles();
    this.outcomeFlow.reset();
    this.nanoRideSupport.reset();
    this.scrollController.reset();
    this.rideResidentContext = null;
    this.scrollX = 0;
    this.scrollY = 0;
  }
}
