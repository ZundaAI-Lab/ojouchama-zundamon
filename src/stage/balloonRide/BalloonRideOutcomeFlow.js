/**
 * 責務: 風船ライドのゴール判定、クリア開始、失敗中移動、クリア中の分離風船、復帰処理を担当する。
 * 更新ルール: 通常ステージの更新順序は持たず、完了/失敗時に必要な座標・カメラ・チェックポイント処理だけを受け持つ。
 * 更新ルール: ゴール雲での復帰地点登録はStageCheckpointServiceのライド終点専用APIへ委譲し、風船ライド内に通常復帰処理を再実装しない。
 */
import { intersects } from '../../utils/rect.js';
import { StageCheckpointService } from '../StageCheckpointService.js';
import { syncCameraToPlayer } from '../StagePlayerScreenBoundary.js';

export class BalloonRideOutcomeFlow {
  constructor(runtime, services) {
    this.runtime = runtime;
    this.playerRideMotion = services.playerRideMotion;
    this.nanoRideSupport = services.nanoRideSupport;
    this.scrollController = services.scrollController;
    this.balloonModel = services.balloonModel;
    this.effectStore = services.effectStore;
    this.onReset = services.onReset;
    this.clearFloat = null;
  }

  reset() {
    this.clearFloat = null;
  }

  hasReachedGoal(activeRide) {
    if (!activeRide) return false;
    const goal = activeRide.goal;
    const player = this.runtime.player;
    const playerFeet = { x: player.x + 3, y: player.y + player.h - 6, w: player.w - 6, h: 10 };
    return intersects(playerFeet, goal);
  }

  startClearing(activeRide, session, balloonCount) {
    const runtime = this.runtime;
    const goal = activeRide.goal;
    this.clearFloat = this.balloonModel.createDetachedFloatSeed(runtime.player, balloonCount, activeRide.config, runtime.elapsed);
    session.beginClearing(activeRide.config.clearTime);
    this.playerRideMotion.place(runtime.player, {
      x: goal.x + goal.w * 0.5 - runtime.player.w * 0.5,
      y: goal.y - runtime.player.h + 2,
      vx: 0,
      vy: 0,
      onGround: true,
    });
    this.nanoRideSupport.setRideVisualHidden(false);
    this.nanoRideSupport.mountToPlayer(runtime, 0);
    StageCheckpointService.registerRideGoalSafePoint(runtime, {
      x: runtime.player.x,
      y: runtime.player.y,
      facing: runtime.player.facing || 1,
    });
    runtime.hud?.showBanner?.('雲の着地台に到着なの！');
    runtime.app.audio.playSfx('ride_goal_jingle');
  }

  updateFailing(dt, activeRide, session) {
    const runtime = this.runtime;
    this.playerRideMotion.driftFailure(runtime.player, {
      dt,
      elapsed: activeRide.config.failTime - session.failTimer,
    });
    this.nanoRideSupport.mountToPlayer(runtime, dt);
    session.failTimer -= dt;
    this.effectStore.update(dt);
    if (session.failTimer > 0) return;

    const respawn = activeRide.start.respawn || activeRide.respawn || runtime.respawnPoint || runtime.stage.playerStart;
    this.playerRideMotion.place(runtime.player, {
      x: respawn.x,
      y: respawn.y,
      vx: 0,
      vy: 0,
      onGround: false,
    });
    this.nanoRideSupport.mountToPlayer(runtime, 0);
    this.scrollController.endFollow(runtime.player);
    syncCameraToPlayer(runtime);
    runtime.projectiles = runtime.projectiles.filter(projectile => projectile.faction !== 'player');
    runtime.app.input.clearGameplay();
    this.onReset();
  }

  updateClearing(dt, activeRide, session) {
    session.clearTimer -= dt;
    this.effectStore.update(dt);
    if (this.clearFloat) {
      this.clearFloat.age += dt;
      this.clearFloat.y -= 72 * dt;
      this.clearFloat.x += Math.sin(this.clearFloat.age * 4.2) * 0.45;
    }
    if (session.clearTimer > 0) return;
    session.completeActiveRide();
    this.scrollController.endFollow(this.runtime.player);
    this.runtime.app.input.clearGameplay();
    this.onReset();
  }
}
