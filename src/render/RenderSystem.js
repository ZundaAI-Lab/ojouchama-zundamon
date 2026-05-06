/**
 * 責務: ステージ描画の順序制御と各Rendererへの委譲を担当する。
 * 更新ルール: 個別対象の描画実装は render/*Renderer.js に置き、このファイルでは描画順と画面フラッシュだけを管理する。なのちゃんの頭乗り中は、プレイヤー描画後に前面アセットだけを重ねる。ライド演出中の単体非表示はNanoRideSupportを読む。救出イベントの専用表示はNanoRescueEventRendererへ委譲する。
 * 更新ルール: 中継ポイントの個別描画はCheckpointRendererへ委譲し、接触判定や復帰地点管理を描画層へ持ち込まない。
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
    const bg = this.app.assets.getImage(stage.backgroundKey);
    ctx.clearRect(0, 0, GAME_VIEW.WIDTH, GAME_VIEW.HEIGHT);
    this.backgroundRenderer.renderCanvasBackground(ctx, bg, camera, stage);

    camera.begin(ctx);
    this.backgroundRenderer.renderWorldDecorations(scene, ctx);
    this.switchTargetRenderer.render(scene, ctx);
    this.platformRenderer.render(scene, ctx);
    this.doorRenderer.render(ctx, stage.doors || []);
    this.switchGimmickRenderer.render(scene, ctx);
    this.checkpointRenderer.render(ctx, scene.checkpoints, scene.elapsed);
    this.balloonRideRenderer.renderWorld(scene, ctx);
    this.itemRenderer.render(ctx, items);
    this.nanoRescueEventRenderer.render(scene, ctx);
    this.goalRenderer.render(ctx, goal, scene.elapsed, boss);
    this.projectileRenderer.render(ctx, projectiles);
    this.residentRenderer.render(ctx, residents, scene.elapsed);
    this.bossRenderer.render(ctx, boss, scene.elapsed);
    this.playerRenderer.render(scene, ctx, player);
    this.nanoRescueEventRenderer.renderFront(scene, ctx);
    this.balloonRideRenderer.renderOverlay(scene, ctx);
    if (!this.shouldHideNanoForBalloonRide(scene)) {
      if (this.isMountedNano(nano)) this.nanoRenderer.renderMountedFront(scene, ctx, nano);
      else this.nanoRenderer.render(scene, ctx, nano);
    }
    this.particleRenderer.render(ctx, particles);
    this.debugHitboxRenderer.render(scene, ctx);
    camera.end(ctx);

    if (scene.shouldShowBossGauge?.()) this.bossHudRenderer.render(ctx, boss);

    if (scene.flashTimer > 0) {
      ctx.save();
      ctx.globalAlpha = scene.flashTimer / 0.18 * 0.35;
      ctx.fillStyle = '#fffef2';
      ctx.fillRect(0, 0, GAME_VIEW.WIDTH, GAME_VIEW.HEIGHT);
      ctx.restore();
    }
  }

  shouldHideNanoForBalloonRide(scene) {
    return !!scene.nanoRideSupport?.shouldHideNanoVisual?.();
  }

  isMountedNano(nano) {
    return !!nano && nano.state === NANO_STATES.HEAD;
  }
}
