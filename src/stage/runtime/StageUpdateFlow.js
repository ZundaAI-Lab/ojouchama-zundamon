/**
 * 責務: ステージ1フレームの更新分岐と通常プレイ中の処理順を担当する。
 * 更新ルール: 新しいブロッキング演出・専用ライド・通常更新手順はこのファイルに追加し、StageRuntime本体は公開APIの窓口に留める。
 * 更新ルール: 通常ステージ中の中継ポイント接触確認は物理移動後にStageCheckpointServiceへ委譲する。
 * 更新ルール: 救出後チュートリアル予約は会話UIが閉じた後のフレームで処理し、イベント処理中にDOMを重ねて開かない。
 * 更新ルール: クリアタイム用の経過時間は、会話・チュートリアル・ポーズなどの操作不能状態では加算しない。
 * 更新ルール: 報酬豆コインの地形落下はRewardCoinDropServiceへ委譲し、通常ステージ更新では衝突ワールドを共有する。
 * 更新ルール: 汎用ステージイベントは物理接地とエリア進行が確定した後にStageEventSystemへ委譲する。
 * 更新ルール: プレイヤー表示状態は物理移動と足場効果でonGround/vyが確定した後に更新する。
 */
import { createResidentBehaviorContext } from '../../actors/resident/behavior/ResidentBehaviorContext.js';
import { ResidentGroupSystem } from '../../actors/resident/ResidentGroupSystem.js';
import { INPUT_ACTIONS } from '../../config/inputActions.js';
import { PLAYER_CONFIG } from '../../config/playerConfig.js';
import { BossEncounterController } from '../BossEncounterController.js';
import { isNormalResident, keepResidentAfterFrame } from '../../actors/resident/ResidentScope.js';
import { PlatformGimmickSystem } from '../PlatformGimmickSystem.js';
import { StageCheckpointService } from '../StageCheckpointService.js';
import { RewardCoinDropService } from '../RewardCoinDropService.js';
import { clampPlayerToHorizontalScreen } from '../StagePlayerScreenBoundary.js';

export function updateStageRuntimeFlow(runtime, dt) {
  runtime.lastDt = dt;
  runtime.flashTimer = Math.max(0, runtime.flashTimer - dt);

  if (runtime.dialogue.active) {
    // 会話送りはUI入力だけで判定する。方向キー/ジャンプなどのゲームプレイ入力では進めない。
    if (
      runtime.app.input.wasPressed(INPUT_ACTIONS.UI_CONFIRM) ||
      runtime.app.input.wasPressed(INPUT_ACTIONS.UI_CANCEL)
    ) {
      runtime.dialogue.next();
    }
    runtime.camera.update(dt);
    runtime.updateHud();
    return;
  }

  if (runtime.pendingNanoRescueTutorial && !runtime.tutorialDialog) {
    runtime.openTutorial('nano', { origin: 'nanoRescueAuto' });
    runtime.camera.update(dt);
    runtime.updateHud();
    return;
  }

  if (runtime.tutorialDialog) {
    runtime.tutorialDialog.update();
    runtime.camera.update(dt);
    runtime.updateHud();
    return;
  }

  if (runtime.updateBossEncounterEvent(dt)) {
    runtime.camera.update(dt);
    runtime.updateHud();
    return;
  }

  if (runtime.tryStartBossEncounter()) {
    runtime.camera.update(dt);
    runtime.updateHud();
    return;
  }

  const pausePressed = runtime.app.input.wasPressed(INPUT_ACTIONS.PAUSE) || runtime.app.input.wasPressed(INPUT_ACTIONS.CANCEL);
  if (runtime.paused) {
    if (runtime.tutorialDialog) runtime.tutorialDialog.update();
    else if (runtime.optionDialog) runtime.optionDialog.update();
    else if (pausePressed) runtime.hidePause();
    else runtime.pauseView?.update();
    runtime.updateHud();
    return;
  }

  if (pausePressed) {
    runtime.showPause();
    runtime.updateHud();
    return;
  }

  if (runtime.restartTimer > 0) {
    runtime.restartTimer -= dt;
    if (runtime.restartTimer <= 0) runtime.retryFromRespawn();
    return;
  }

  if (runtime.nanoRescueEvent?.isBlockingGameplay?.()) {
    updateStageNanoRescueEvent(runtime, dt);
    return;
  }

  if (runtime.balloonRideSystem?.isActive()) {
    advancePlayableTime(runtime, dt);
    updateBalloonRideFrame(runtime, dt);
    return;
  }

  advancePlayableTime(runtime, dt);
  updateNormalStageFrame(runtime, dt);
}

function advancePlayableTime(runtime, dt) {
  runtime.elapsed += dt;
}

function updateBalloonRideFrame(runtime, dt) {
  runtime.player.jellyBounceLock = Math.max(0, (runtime.player.jellyBounceLock || 0) - dt);
  runtime.balloonRideSystem.update(dt);
  runtime.particleSystem.update(dt);
  runtime.particles = runtime.particleSystem.particles;
  runtime.projectiles = runtime.projectiles.filter(p => p.alive);
  runtime.items = runtime.items.filter(i => i.alive);
  runtime.camera.update(dt);
  runtime.updateHud();
}

function updateNormalStageFrame(runtime, dt) {
  runtime.player.jellyBounceLock = Math.max(0, (runtime.player.jellyBounceLock || 0) - dt);

  runtime.nano?.updateInput(dt, runtime);
  runtime.player.update(dt, runtime);
  runtime.nano?.applyGlide(runtime, dt);

  runtime.switchTargetSystem.apply(runtime);
  PlatformGimmickSystem.updateBeforePhysics(runtime, dt);
  runtime.rebuildCollisionWorld();

  const collisionWorld = runtime.getCollisionWorld();
  runtime.physics.moveActor(runtime.player, dt, collisionWorld.playerSolids, {
    useSlopeSurface: true,
    slopeSurfaces: collisionWorld.slopeSurfaces,
    stepUpHeight: PLAYER_CONFIG.STEP_UP_HEIGHT,
  });
  clampPlayerToHorizontalScreen(runtime);
  runtime.fallRespawn.updateSafePoint(runtime);
  runtime.nano?.updateMotion(dt, runtime);
  runtime.resolvePlatformEffects(dt);
  runtime.player.updateVisualState();
  runtime.updateAreaProgress();
  StageCheckpointService.updateTouchedCheckpoints(runtime);
  if (runtime.stageEventSystem?.update(dt)) {
    runtime.camera.update(dt);
    runtime.updateHud();
    return;
  }
  if (runtime.tryStartBossEncounter()) {
    runtime.camera.update(dt);
    runtime.updateHud();
    return;
  }

  runtime.residentBehaviorContext = createResidentBehaviorContext(runtime, collisionWorld);
  ResidentGroupSystem.update(runtime.residents.filter(isNormalResident), dt, runtime.residentBehaviorContext);
  RewardCoinDropService.updateItems(runtime.items, dt, collisionWorld, runtime.physics);
  if (BossEncounterController.shouldUpdateBoss(runtime)) runtime.boss?.update(dt, runtime);

  runtime.switchGimmickSystem.beginFrame(dt);
  runtime.updateProjectiles(dt, collisionWorld);
  runtime.switchGimmickSystem.updateContactTriggers(runtime);
  runtime.switchTargetSystem.apply(runtime);

  runtime.particleSystem.update(dt);
  runtime.particles = runtime.particleSystem.particles;

  runtime.handleCollisions();

  if (runtime.balloonRideSystem?.tryStartIfTouched()) {
    runtime.projectiles = runtime.projectiles.filter(p => p.alive);
    runtime.residents = runtime.residents.filter(keepResidentAfterFrame);
    runtime.items = runtime.items.filter(i => i.alive);
    runtime.camera.update(dt);
    runtime.updateHud();
    return;
  }

  runtime.projectiles = runtime.projectiles.filter(p => p.alive);
  runtime.residents = runtime.residents.filter(keepResidentAfterFrame);
  runtime.items = runtime.items.filter(i => i.alive);

  if (runtime.fallRespawn.handleFall(runtime)) {
    runtime.camera.update(dt);
    runtime.updateHud();
    return;
  }

  if (runtime.player.dead) {
    runtime.app.input.clearGameplay();
    runtime.hud.showBanner('おやすみなさい… もういちど挑戦するの');
    runtime.restartTimer = 1.2;
  }

  runtime.camera.update(dt);
  runtime.updateHud();
}

export function updateStageNanoRescueEvent(runtime, dt) {
  runtime.player.settleForEvent(dt);
  runtime.rebuildCollisionWorld();
  const collisionWorld = runtime.getCollisionWorld();
  runtime.physics.moveActor(runtime.player, dt, collisionWorld.playerSolids, {
    useSlopeSurface: true,
    slopeSurfaces: collisionWorld.slopeSurfaces,
    stepUpHeight: PLAYER_CONFIG.STEP_UP_HEIGHT,
  });
  clampPlayerToHorizontalScreen(runtime);
  runtime.fallRespawn.updateSafePoint(runtime);
  runtime.player.updateVisualState();
  runtime.nanoRescueEvent.update(dt);
  runtime.particleSystem.update(dt);
  runtime.particles = runtime.particleSystem.particles;
  runtime.projectiles = runtime.projectiles.filter(p => p.alive);
  runtime.camera.update(dt);
  runtime.updateHud();
}
