/**
 * 責務: ボス戦の画面ズーム演出とスクロール固定の適用だけを担当する。
 * 更新ルール: ボス会話・戦闘状態の遷移はBossEncounterControllerに置き、このControllerはCamera/StageScrollControllerへの反映に限定する。
 * 更新ルール: 戦闘中復帰やScene退出時もここを経由して、ズーム値とスクロール固定状態を一貫して復元する。
 */
import { GAME_VIEW } from '../config/view.js';
import { lerp } from '../utils/math.js';

export const BOSS_BATTLE_CAMERA_ZOOM = 0.85;
export const BOSS_BATTLE_CAMERA_DURATION = 1;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeInOutCubic(value) {
  const t = clamp01(value);
  return t < 0.5
    ? 4 * t * t * t
    : 1 - ((-2 * t + 2) ** 3) / 2;
}

function getCameraZoom(camera) {
  return Number.isFinite(camera?.zoom) ? camera.zoom : 1;
}

function getStageWidth(runtime) {
  return Number.isFinite(runtime?.stage?.width) ? runtime.stage.width : GAME_VIEW.WIDTH;
}

function getStageHeight(runtime) {
  return Number.isFinite(runtime?.stage?.height) ? runtime.stage.height : GAME_VIEW.HEIGHT;
}

export class BossCameraController {
  constructor({ scrollController = null } = {}) {
    this.scrollController = scrollController;
    this.active = false;
    this.phase = 'idle';
    this.timer = 0;
    this.duration = BOSS_BATTLE_CAMERA_DURATION;
    this.startZoom = 1;
    this.targetZoom = 1;
    this.scrollLocked = false;
  }

  startBattleIntro(runtime, { duration = BOSS_BATTLE_CAMERA_DURATION } = {}) {
    this.lockScroll(runtime);
    this.startTransition(runtime, 'battleIntro', BOSS_BATTLE_CAMERA_ZOOM, duration);
  }

  startRestore(runtime, { duration = BOSS_BATTLE_CAMERA_DURATION } = {}) {
    this.startTransition(runtime, 'restore', 1, duration);
  }

  applyBattleState(runtime) {
    this.active = false;
    this.phase = 'battle';
    this.timer = 0;
    this.duration = BOSS_BATTLE_CAMERA_DURATION;
    this.applyZoom(runtime?.camera, BOSS_BATTLE_CAMERA_ZOOM);
    this.lockScroll(runtime);
  }

  update(runtime, dt) {
    if (!this.active) return true;

    this.timer += Math.max(0, dt || 0);
    const progress = this.duration > 0 ? clamp01(this.timer / this.duration) : 1;
    const eased = easeInOutCubic(progress);
    this.applyZoom(runtime?.camera, lerp(this.startZoom, this.targetZoom, eased));

    if (progress < 1) return false;
    this.finishTransition(runtime);
    return true;
  }

  reset(runtime, { restoreFollow = false } = {}) {
    this.active = false;
    this.phase = 'idle';
    this.timer = 0;
    this.duration = BOSS_BATTLE_CAMERA_DURATION;
    this.applyZoom(runtime?.camera, 1);
    if (restoreFollow) this.unlockScroll(runtime, runtime?.player || null);
    else this.resetScroll();
  }

  isBattleCameraApplied() {
    return this.phase === 'battle' || this.phase === 'battleIntro';
  }

  startTransition(runtime, phase, targetZoom, duration) {
    this.active = true;
    this.phase = phase;
    this.timer = 0;
    this.duration = Math.max(0, Number.isFinite(duration) ? duration : BOSS_BATTLE_CAMERA_DURATION);
    this.startZoom = getCameraZoom(runtime?.camera);
    this.targetZoom = Number.isFinite(targetZoom) ? targetZoom : 1;

    if (this.duration === 0) {
      this.applyZoom(runtime?.camera, this.targetZoom);
      this.finishTransition(runtime);
    }
  }

  finishTransition(runtime) {
    this.applyZoom(runtime?.camera, this.targetZoom);
    const completedPhase = this.phase;
    this.active = false;
    this.phase = completedPhase === 'battleIntro' ? 'battle' : 'idle';
    if (completedPhase === 'restore') this.unlockScroll(runtime, runtime?.player || null);
  }

  lockScroll(runtime) {
    const camera = runtime?.camera;
    const controller = this.scrollController || runtime?.stageScrollController;
    if (!camera || !controller) return;

    controller.begin({
      camera,
      target: runtime?.player || null,
      startX: camera.x || 0,
      startY: camera.y || 0,
      speedX: 0,
      speedY: 0,
      worldWidth: getStageWidth(runtime),
      worldHeight: getStageHeight(runtime),
      viewWidth: GAME_VIEW.WIDTH,
      viewHeight: GAME_VIEW.HEIGHT,
    });
    this.scrollLocked = true;
  }

  unlockScroll(runtime, target = null) {
    const controller = this.scrollController || runtime?.stageScrollController;
    if (controller) controller.endFollow(target);
    else if (runtime?.camera && target) runtime.camera.follow?.(target);
    this.scrollLocked = false;
  }

  resetScroll() {
    this.scrollController?.reset?.();
    this.scrollLocked = false;
  }

  applyZoom(camera, zoom) {
    if (!camera) return;
    if (typeof camera.setZoom === 'function') camera.setZoom(zoom);
    else camera.zoom = zoom;
  }
}
