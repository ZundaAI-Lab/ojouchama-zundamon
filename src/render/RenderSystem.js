/**
 * 責務: ステージ描画の順序制御と各Rendererへの委譲を担当する。
 * 更新ルール: 個別対象の描画実装は render/*Renderer.js に置き、このファイルでは描画順と画面フラッシュだけを管理する。なのちゃんの頭乗り中は、プレイヤー描画後に前面アセットだけを重ねる。ライド演出中の単体非表示はNanoRideSupportを読む。救出イベントの専用表示はNanoRescueEventRendererへ委譲する。
 * 更新ルール: 中継ポイントの個別描画はCheckpointRendererへ委譲し、接触判定や復帰地点管理を描画層へ持ち込まない。
 * 更新ルール: 詳細負荷レポートON時だけ描画フェーズを計測し、Renderer個別実装へ計測責務を分散しない。
 */
import { GAME_VIEW } from '../config/view.js';
import { NANO_STATES } from '../config/nanoConfig.js';
import { StageBackgroundRenderer } from './StageBackgroundRenderer.js';
import { PlatformRenderer } from './PlatformRenderer.js';
import { DoorRenderer } from './DoorRenderer.js';
import { CheckpointRenderer } from './CheckpointRenderer.js';
import { SwitchGimmickRenderer } from './SwitchGimmickRenderer.js';
import { SwitchTargetRenderer } from './SwitchTargetRenderer.js';
import { ItemRenderer } from './ItemRenderer.js';
import { GoalRenderer } from './GoalRenderer.js';
import { ProjectileRenderer } from './ProjectileRenderer.js';
import { ResidentRenderer } from './ResidentRenderer.js';
import { BossRenderer } from './BossRenderer.js';
import { PlayerRenderer } from './PlayerRenderer.js';
import { NanoRenderer } from './NanoRenderer.js';
import { ParticleRenderer } from './ParticleRenderer.js';
import { BossHudRenderer } from './BossHudRenderer.js';
import { DebugHitboxRenderer } from './DebugHitboxRenderer.js';
import { BalloonRideRenderer } from './BalloonRideRenderer.js';
import { NanoRescueEventRenderer } from './NanoRescueEventRenderer.js';

export class RenderSystem {
  constructor(app) {
    this.app = app;
    this.backgroundRenderer = new StageBackgroundRenderer(app);
    this.platformRenderer = new PlatformRenderer(app);
    this.doorRenderer = new DoorRenderer(app);
    this.checkpointRenderer = new CheckpointRenderer(app);
    this.switchTargetRenderer = new SwitchTargetRenderer(app);
    this.switchGimmickRenderer = new SwitchGimmickRenderer(app);
    this.itemRenderer = new ItemRenderer(app);
    this.goalRenderer = new GoalRenderer(app);
    this.projectileRenderer = new ProjectileRenderer(app);
    this.residentRenderer = new ResidentRenderer(app);
    this.bossRenderer = new BossRenderer(app);
    this.playerRenderer = new PlayerRenderer(app);
    this.nanoRenderer = new NanoRenderer(app);
    this.particleRenderer = new ParticleRenderer(app);
    this.bossHudRenderer = new BossHudRenderer(app);
    this.debugHitboxRenderer = new DebugHitboxRenderer(app);
    this.balloonRideRenderer = new BalloonRideRenderer(app);
    this.nanoRescueEventRenderer = new NanoRescueEventRenderer(app);
  }

  render(scene, ctx) {
    const { camera, stage, player, nano, residents, items, projectiles, goal, particles, boss } = scene;
    const perf = this.app.performanceReporter;
    let phaseStart = 0;
    const bg = this.app.assets.getImage(stage.backgroundKey);

    if (perf) phaseStart = performance.now();
    ctx.clearRect(0, 0, GAME_VIEW.WIDTH, GAME_VIEW.HEIGHT);
    this.backgroundRenderer.renderCanvasBackground(ctx, bg, camera, stage);
    if (perf) perf.recordPhase('render.background', performance.now() - phaseStart);

    camera.begin(ctx);
    if (perf) phaseStart = performance.now();
    this.backgroundRenderer.renderWorldDecorations(scene, ctx);
    if (perf) perf.recordPhase('render.decorations', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.switchTargetRenderer.render(scene, ctx);
    if (perf) perf.recordPhase('render.switchTargets', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.platformRenderer.render(scene, ctx);
    if (perf) perf.recordPhase('render.platforms', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.doorRenderer.render(ctx, stage.doors || []);
    if (perf) perf.recordPhase('render.doors', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.switchGimmickRenderer.render(scene, ctx);
    if (perf) perf.recordPhase('render.switchGimmicks', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.checkpointRenderer.render(ctx, scene.checkpoints, scene.elapsed);
    if (perf) perf.recordPhase('render.checkpoints', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.balloonRideRenderer.renderWorld(scene, ctx);
    if (perf) perf.recordPhase('render.balloonWorld', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.itemRenderer.render(ctx, items);
    if (perf) perf.recordPhase('render.items', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.nanoRescueEventRenderer.render(scene, ctx);
    if (perf) perf.recordPhase('render.nanoRescue', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.goalRenderer.render(ctx, goal, scene.elapsed, boss);
    if (perf) perf.recordPhase('render.goal', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.projectileRenderer.render(ctx, projectiles);
    if (perf) perf.recordPhase('render.projectiles', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.residentRenderer.render(ctx, residents, scene.elapsed);
    if (perf) perf.recordPhase('render.residents', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.bossRenderer.render(ctx, boss, scene.elapsed);
    if (perf) perf.recordPhase('render.boss', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.playerRenderer.render(scene, ctx, player);
    if (perf) perf.recordPhase('render.player', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.nanoRescueEventRenderer.renderFront(scene, ctx);
    this.balloonRideRenderer.renderOverlay(scene, ctx);
    if (!this.shouldHideNanoForBalloonRide(scene)) {
      if (this.isMountedNano(nano)) this.nanoRenderer.renderMountedFront(scene, ctx, nano);
      else this.nanoRenderer.render(scene, ctx, nano);
    }
    if (perf) perf.recordPhase('render.nano', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.particleRenderer.render(ctx, particles);
    if (perf) perf.recordPhase('render.particles', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    this.debugHitboxRenderer.render(scene, ctx);
    if (perf) perf.recordPhase('render.debugHitboxes', performance.now() - phaseStart);
    camera.end(ctx);

    if (perf) phaseStart = performance.now();
    if (scene.shouldShowBossGauge?.()) this.bossHudRenderer.render(ctx, boss);
    if (perf) perf.recordPhase('render.bossHud', performance.now() - phaseStart);

    if (perf) phaseStart = performance.now();
    if (scene.flashTimer > 0) {
      ctx.save();
      ctx.globalAlpha = scene.flashTimer / 0.18 * 0.35;
      ctx.fillStyle = '#fffef2';
      ctx.fillRect(0, 0, GAME_VIEW.WIDTH, GAME_VIEW.HEIGHT);
      ctx.restore();
    }
    if (perf) perf.recordPhase('render.flash', performance.now() - phaseStart);
  }


  shouldHideNanoForBalloonRide(scene) {
    return !!scene.nanoRideSupport?.shouldHideNanoVisual?.();
  }

  isMountedNano(nano) {
    return !!nano && nano.state === NANO_STATES.HEAD;
  }
}
