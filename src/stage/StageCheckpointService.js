/**
 * 責務: 明示配置された中継ポイントの生成・接触登録と、ライド到達地点の復帰登録を担当する。
 * 更新ルール: 目に見える中継ポイントの描画はCheckpointRendererへ置き、ここでは復帰地点と接触状態だけを管理する。
 * 更新ルール: ゲームオーバー復帰地点と落下復帰用safePointは用途が違うため、ライド到達登録以外では同期しない。
 * 更新ルール: 中継ポイントはstage.checkpointsに明示された定義だけを有効にし、サービス側での自動配置は行わない。
 */
import { PLATFORM_KINDS } from '../data/platformDefs.js';
import { intersects } from '../utils/rect.js';

const CHECKPOINT_IMAGE_KEY = 'stage_checkpoint_flag';
const CHECKPOINT_W = 34;
const CHECKPOINT_H = 46;
const CHECKPOINT_RESPAWN_Y_OFFSET = 0.5;
const CHECKPOINT_OK_PLATFORM_KINDS = new Set([
  PLATFORM_KINDS.NORMAL,
  PLATFORM_KINDS.CLOUD,
  PLATFORM_KINDS.JAM,
  PLATFORM_KINDS.JAM_HARD,
]);

function clonePoint(point) {
  return { x: point.x, y: point.y };
}

function isUsableCheckpointPlatform(platform) {
  return !!(
    platform &&
    platform.active !== false &&
    !platform.surfaceOnly &&
    CHECKPOINT_OK_PLATFORM_KINDS.has(platform.kind) &&
    Number.isFinite(platform.x) &&
    Number.isFinite(platform.y) &&
    Number.isFinite(platform.w) &&
    platform.w >= CHECKPOINT_W + 30
  );
}

function platformTargetScore(platform, targetX) {
  const kindPenalty = platform.kind === PLATFORM_KINDS.NORMAL ? 0 : 90;
  return Math.abs((platform.x + platform.w / 2) - targetX) + kindPenalty;
}

function resolvePlatformForTarget(platforms, targetX) {
  const usable = platforms.filter(isUsableCheckpointPlatform);
  const containing = usable
    .filter(platform => targetX >= platform.x + 20 && targetX <= platform.x + platform.w - 20)
    .sort((a, b) => platformTargetScore(a, targetX) - platformTargetScore(b, targetX));
  if (containing[0]) return containing[0];

  return usable
    .slice()
    .sort((a, b) => platformTargetScore(a, targetX) - platformTargetScore(b, targetX))[0] || null;
}

function normalizeCheckpoint(def, index, stage) {
  const fallbackX = Number.isFinite(def.x) ? def.x : stage.playerStart.x + 180;
  const platform = Number.isFinite(def.y) ? null : resolvePlatformForTarget(stage.platforms || [], fallbackX);
  const x = Number.isFinite(def.x)
    ? def.x
    : platform
      ? platform.x + platform.w / 2
      : stage.playerStart.x + 180;
  const y = Number.isFinite(def.y)
    ? def.y
    : platform
      ? platform.y
      : stage.playerStart.y + 40;

  return {
    id: def.id || `${stage.id || 'stage'}_checkpoint_${index + 1}`,
    x,
    y,
    w: def.w || CHECKPOINT_W,
    h: def.h || CHECKPOINT_H,
    drawW: def.drawW || 36,
    drawH: def.drawH || 48,
    imageKey: def.imageKey || CHECKPOINT_IMAGE_KEY,
    respawn: def.respawn ? clonePoint(def.respawn) : null,
    activated: false,
  };
}

export class StageCheckpointService {
  static createStageCheckpoints(stage) {
    const source = Array.isArray(stage.checkpoints) ? stage.checkpoints : [];
    return source.map((def, index) => normalizeCheckpoint(def, index, stage));
  }

  static restoreFromRespawn(runtime) {
    const checkpoint = this.findRestoreCheckpoint(runtime);
    if (!checkpoint) return;
    this.setActiveCheckpoint(runtime, checkpoint, { silent: true, syncRespawn: true });
  }

  static updateTouchedCheckpoints(runtime) {
    if (!Array.isArray(runtime.checkpoints) || runtime.checkpoints.length <= 0) return;
    if (!runtime.player || runtime.player.dead) return;

    const playerBounds = runtime.player.getBounds();
    for (const checkpoint of runtime.checkpoints) {
      if (!intersects(playerBounds, this.getTouchBounds(checkpoint))) continue;
      if (!this.isCheckpointInCurrentArea(runtime, checkpoint)) continue;
      if (runtime.activeCheckpointId === checkpoint.id) return;
      this.setActiveCheckpoint(runtime, checkpoint, { silent: false, syncRespawn: true });
      return;
    }
  }

  static clearActiveCheckpoint(runtime) {
    runtime.activeCheckpointId = null;
    for (const checkpoint of runtime.checkpoints || []) checkpoint.activated = false;
  }

  static registerRideGoalSafePoint(runtime, safePoint) {
    const point = {
      x: safePoint.x,
      y: safePoint.y,
      facing: safePoint.facing || 1,
    };
    runtime.activeCheckpointId = null;
    for (const checkpoint of runtime.checkpoints || []) checkpoint.activated = false;
    runtime.respawnPoint = { x: point.x, y: point.y };
    runtime.fallRespawn?.registerRideGoalSafePoint?.(point);
  }

  static setActiveCheckpoint(runtime, checkpoint, options = {}) {
    const { silent = false, syncRespawn = true } = options;
    for (const candidate of runtime.checkpoints || []) {
      candidate.activated = candidate.id === checkpoint.id;
    }
    runtime.activeCheckpointId = checkpoint.id;

    const respawnPoint = this.getRespawnPoint(runtime, checkpoint);
    if (syncRespawn) runtime.respawnPoint = respawnPoint;

    if (!silent) {
      runtime.spawnSparkles(checkpoint.x, checkpoint.y - checkpoint.h * 0.72, '#fff0a8', 14);
      runtime.hud?.showBanner?.('中継ポイントに到着したの！');
      runtime.app.audio.playSfx('checkpoint');
    }
  }

  static getRespawnPoint(runtime, checkpoint) {
    if (checkpoint.respawn) return clonePoint(checkpoint.respawn);
    const player = runtime.player;
    const playerBounds = player?.getBounds?.() || { w: player?.w ?? 28, h: player?.h ?? 40 };
    const boundsX = checkpoint.x - playerBounds.w / 2;
    const boundsY = checkpoint.y - playerBounds.h - CHECKPOINT_RESPAWN_Y_OFFSET;
    return player?.getPositionFromBounds
      ? player.getPositionFromBounds(boundsX, boundsY)
      : { x: boundsX, y: boundsY };
  }

  static getTouchBounds(checkpoint) {
    return {
      x: checkpoint.x - checkpoint.w / 2,
      y: checkpoint.y - checkpoint.h,
      w: checkpoint.w,
      h: checkpoint.h,
    };
  }

  static isCheckpointInCurrentArea(runtime, checkpoint) {
    if (typeof runtime.getAreaIndexAt !== 'function') return true;
    return runtime.getAreaIndexAt(checkpoint.x) === runtime.currentAreaIndex;
  }

  static findRestoreCheckpoint(runtime) {
    const checkpoints = runtime.checkpoints || [];

    if (runtime.params.respawnPoint) {
      const byRespawn = checkpoints.find(checkpoint => {
        const respawn = this.getRespawnPoint(runtime, checkpoint);
        return Math.abs(respawn.x - runtime.params.respawnPoint.x) <= 2 && Math.abs(respawn.y - runtime.params.respawnPoint.y) <= 2;
      });
      return byRespawn || null;
    }

    if (runtime.params.activeCheckpointId) {
      return checkpoints.find(checkpoint => checkpoint.id === runtime.params.activeCheckpointId) || null;
    }

    return null;
  }
}
