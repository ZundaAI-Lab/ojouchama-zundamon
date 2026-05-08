/**
 * 責務: ステージプレイ中の状態保持、外部公開API、描画委譲を統括する。
 * 更新ルール: 初期化・更新分岐・HUD整形・ポーズUI・弾更新・特殊アクションはstage/runtime配下へ委譲し、Runtime本体へ個別機能を戻さない。
 * 更新ルール: 物理ステップごとにCollisionWorldBuilderで衝突ワールドを1回だけ作り、プレイヤー/住民/弾/空間チェックへ用途別に共有する。
 * 更新ルール: 物理処理中に足場状態が変わっても、そのステップの判定ワールドは作り直さない。変更は次ステップのスナップショットへ反映する。
 * 更新ルール: 落下時の体力減少と通常床復帰はFallRespawnServiceへ集約し、Runtimeは呼び出し順序だけを担当する。
 * 更新ルール: 風船ライド中の専用入力・接触・復帰処理はBalloonRideSystemへ委譲し、Runtimeは通常更新との分岐だけを担当する。
 * 更新ルール: なのちゃん救出イベントはNanoRescueEventSystemへ委譲し、Runtimeは生成・update順・弾命中接続だけを担当する。
 * 更新ルール: ティーカップ所持数の増減と保存同期はStageTeacupInventoryへ委譲し、Runtime本体は公開APIの窓口に留める。
 * 更新ルール: ステージ中チュートリアルのDOM制御はStagePauseFlowへ委譲し、Runtime本体は公開APIと救出後予約だけを担当する。
 * 更新ルール: ステージBGMのイベント中断・イベント曲・再開はRuntimeの公開APIで状態だけ管理し、実際のフェード/再生はAudioSystemへ委譲する。
 * 更新ルール: エリア進行で既定復帰地点へ切り替わる時は、表示中の中継ポイント状態をStageCheckpointServiceで解除する。
 * 更新ルール: Scene退出時はステージ固有のカメラ演出・強制スクロールを明示解除し、次Sceneへ表示状態を持ち越さない。
 */
import { StageFactory } from './StageFactory.js';
import { PlatformGimmickSystem } from './PlatformGimmickSystem.js';
import { CollisionWorldBuilder } from './CollisionWorldBuilder.js';
import { BossEncounterController } from './BossEncounterController.js';
import { StageCollisionResolver } from './StageCollisionResolver.js';
import { StageClearService } from './StageClearService.js';
import { StageCheckpointService } from './StageCheckpointService.js';
import { StageResultCalculator } from './StageResultCalculator.js';
import { consumeStageTeacup } from './StageTeacupInventory.js';
import { enterStageRuntime } from './runtime/StageRuntimeBootstrap.js';
import {
  closeStagePauseOptions,
  closeStageTutorial,
  destroyStageTutorial,
  hideStagePause,
  openStagePauseOptions,
  openStageTutorial,
  showStagePause,
} from './runtime/StagePauseFlow.js';
import { retryFromStageRespawn } from './runtime/StageRetryFlow.js';
import { triggerStageBowAction } from './runtime/StagePlayerActionFlow.js';
import { updateStageProjectiles } from './runtime/StageProjectileFlow.js';
import { updateStageHud } from './runtime/StageHudPresenter.js';
import {
  updateStageNanoRescueEvent,
  updateStageRuntimeFlow,
} from './runtime/StageUpdateFlow.js';

export class StageRuntime {
  constructor(app, params = {}) {
    this.app = app;
    this.params = params;
  }

  async enter() {
    return enterStageRuntime(this);
  }

  exit() {
    this.clearStageEventBgmTimer?.();
    this.bossCameraController?.reset?.(this);
    this.stageScrollController?.reset?.();
    this.optionDialog?.destroy();
    destroyStageTutorial(this);
    this.pauseView?.destroy();
    this.touchControls?.destroy();
  }

  get currentAreaIndex() { return this.areaManager.currentAreaIndex; }
  set currentAreaIndex(value) { this.areaManager.currentAreaIndex = value; }
  get highestAreaIndexReached() { return this.areaManager.highestAreaIndexReached; }
  set highestAreaIndexReached(value) { this.areaManager.highestAreaIndexReached = value; }
  get respawnPoint() { return this.areaManager.respawnPoint; }
  set respawnPoint(value) { this.areaManager.respawnPoint = value; }

  rebuildCollisionWorld() {
    this.collisionWorld = CollisionWorldBuilder.build(this);
    return this.collisionWorld;
  }

  getCollisionWorld() {
    if (!this.collisionWorld) {
      throw new Error('CollisionWorld is not ready. Build it once at the start of the physics step.');
    }
    return this.collisionWorld;
  }

  getCollisionSolids(purpose = 'player') {
    const world = this.getCollisionWorld();
    const key = purpose + 'Solids';
    const solids = world[key];
    if (!solids) throw new Error('Unknown collision purpose: ' + purpose);
    return solids;
  }

  setDialogueMode(active) {
    this.hud?.setDialogueMode(active);
    this.touchControls?.setDialogueMode(active);
    if (active) this.app.input.clearGameplay();
  }

  getAreaIndexAt(x) {
    return this.areaManager.getIndexAt(x);
  }

  getCurrentArea() {
    return this.areaManager.getCurrentArea();
  }

  isBossArea() {
    return this.areaManager.isBossArea();
  }

  shouldShowBossGauge() {
    return BossEncounterController.shouldShowGauge(this);
  }

  isBossBattleActive() {
    return BossEncounterController.isBattleActive(this);
  }

  canHitBoss() {
    return BossEncounterController.canHitBoss(this);
  }

  tryStartBossEncounter() {
    return BossEncounterController.tryStart(this);
  }

  updateBossEncounterEvent(dt) {
    return BossEncounterController.updateEventSequence(this, dt);
  }

  getPlayerJumpSpeed(player = this.player) {
    return PlatformGimmickSystem.getPlayerJumpSpeed(player);
  }

  updateAreaProgress() {
    this.areaManager.updateByPlayer(
      this.player,
      area => {
        StageCheckpointService.clearActiveCheckpoint(this);
        this.hud.showBanner(`${area.name} に到着したの！`);
        this.app.audio.playSfx('area_enter');
      },
      () => this.updateHud(),
    );
  }

  retryFromRespawn() {
    return retryFromStageRespawn(this);
  }

  showPause() {
    return showStagePause(this);
  }

  openPauseOptions() {
    return openStagePauseOptions(this);
  }

  closePauseOptions() {
    return closeStagePauseOptions(this);
  }

  openTutorial(topic = 'player', options = {}) {
    return openStageTutorial(this, topic, options);
  }

  closeTutorial(options = {}) {
    return closeStageTutorial(this, options);
  }

  scheduleNanoRescueTutorial() {
    this.pendingNanoRescueTutorial = true;
  }

  clearStageEventBgmTimer() {
    if (!this.stageEventBgmTimer) return;
    globalThis.clearTimeout(this.stageEventBgmTimer);
    this.stageEventBgmTimer = 0;
  }

  startEventBgm(trackId, fadeSeconds = 0.65, startDelaySeconds = fadeSeconds * 0.9) {
    this.clearStageEventBgmTimer();
    if (!this.stageBgmPausedForEvent) {
      this.stageBgmPausedForEvent = true;
      this.app.audio.fadeOutBgm(fadeSeconds);
    }
    this.stageEventBgmId = trackId || null;
    if (!trackId) return;
    this.stageEventBgmTimer = globalThis.setTimeout(() => {
      this.stageEventBgmTimer = 0;
      if (!this.stageBgmPausedForEvent || this.stageEventBgmId !== trackId) return;
      this.app.audio.playBgm(trackId);
    }, Math.max(0, startDelaySeconds) * 1000);
  }

  fadeOutStageBgmForEvent(fadeSeconds = 0.65) {
    this.startEventBgm(null, fadeSeconds, 0);
  }

  resumeStageBgmAfterEvent() {
    if (!this.stageBgmPausedForEvent) return;
    this.clearStageEventBgmTimer();
    this.stageBgmPausedForEvent = false;
    this.stageEventBgmId = null;
    if (this.stageBgmId) this.app.audio.playBgm(this.stageBgmId);
  }

  fadeOutStageBgmForBossIntro(fadeSeconds = 0.65) {
    this.clearStageEventBgmTimer();
    this.stageBgmPausedForEvent = false;
    this.stageEventBgmId = null;
    this.app.audio.fadeOutBgm(fadeSeconds);
  }

  hidePause() {
    return hideStagePause(this);
  }

  triggerBowAction() {
    return triggerStageBowAction(this);
  }

  tryConsumeTeacupForAction() {
    return consumeStageTeacup(this);
  }

  spawnSparkles(x, y, color, count = 8) {
    this.particleSystem.spawnSparkles(x, y, color, count);
    this.particles = this.particleSystem.particles;
  }

  update(dt) {
    return updateStageRuntimeFlow(this, dt);
  }

  updateProjectiles(dt, collisionWorld) {
    return updateStageProjectiles(this, dt, collisionWorld);
  }

  updateHud() {
    return updateStageHud(this);
  }

  resolvePlatformEffects(dt) {
    PlatformGimmickSystem.resolvePlayerGround(this, dt);
  }

  hitPlatformWithMagic(projectile) {
    return PlatformGimmickSystem.hitPlatformWithMagic(this, projectile);
  }

  hitNanoRescueWithMagic(projectile) {
    return !!this.nanoRescueEvent?.hitWithMagic?.(projectile);
  }

  updateNanoRescueEvent(dt) {
    return updateStageNanoRescueEvent(this, dt);
  }

  completeNanoRescueEvent() {
    this.saveData = this.app.save.setStoryFlag('nanoJoined', true);
    if (!this.nano) this.nano = StageFactory.createNanoCompanion(this.app, this.player);
    this.nano.attachToPlayer?.(this.player);
    this.spawnSparkles(this.player.x + this.player.w / 2, this.player.y - 14, '#d9fff2', 18);
    this.hud.showBanner('なのちゃんが仲間になったの！');
    this.app.audio.playSfx('nano_join_jingle');
  }

  hitSwitchWithMagic(projectile) {
    if (!this.switchGimmickSystem?.hitWithMagic(this, projectile)) return false;
    projectile.alive = false;
    return true;
  }

  handleCollisions() {
    StageCollisionResolver.handle(this);
  }

  calculateRank() {
    return StageResultCalculator.calculateRank(this);
  }

  handleBossDefeated() {
    return BossEncounterController.handleDefeated(this);
  }

  clearStage() {
    StageClearService.clear(this);
  }

  render(ctx) {
    this.renderer.render(this, ctx);
  }
}
