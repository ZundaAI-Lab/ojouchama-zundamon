/**
 * 責務: ステージ中プレイヤーの表示上の左右画面端制限を担当する。
 * 更新ルール: 物理衝突・入力解釈・落下判定は扱わず、Runtimeから渡された現在カメラ範囲内へ横位置を補正する。
 */
import { GAME_VIEW } from '../config/view.js';

function getPlayerVisualHorizontalInsets(player) {
  const drawW = Number.isFinite(player?.drawW) ? player.drawW : player?.w;
  const actorW = Number.isFinite(player?.w) ? player.w : drawW;
  const overhang = Math.max(0, drawW - actorW) / 2;
  return {
    left: overhang,
    right: overhang,
  };
}

function getHorizontalScreenBounds(runtime) {
  const cameraX = Number.isFinite(runtime?.camera?.x) ? runtime.camera.x : 0;
  const stageWidth = Number.isFinite(runtime?.stage?.width) ? runtime.stage.width : Infinity;
  return {
    left: Math.max(0, cameraX),
    right: Math.min(cameraX + GAME_VIEW.WIDTH, stageWidth),
  };
}

export function clampPlayerToHorizontalScreen(runtime) {
  const player = runtime?.player;
  if (!player) return false;

  const insets = getPlayerVisualHorizontalInsets(player);
  const screen = getHorizontalScreenBounds(runtime);
  const minX = screen.left + insets.left;
  const maxX = Math.max(minX, screen.right - player.w - insets.right);
  const nextX = Math.max(minX, Math.min(maxX, player.x));

  if (nextX === player.x) return false;
  const clampedLeft = nextX <= minX && player.x < minX;
  const clampedRight = nextX >= maxX && player.x > maxX;
  player.x = nextX;
  if ((clampedLeft && player.vx < 0) || (clampedRight && player.vx > 0)) player.vx = 0;
  return true;
}

export function syncCameraToPlayer(runtime) {
  const player = runtime?.player;
  const camera = runtime?.camera;
  if (!player || !camera) return false;

  const maxX = Math.max(0, (runtime.stage?.width ?? camera.worldWidth ?? GAME_VIEW.WIDTH) - GAME_VIEW.WIDTH);
  const maxY = Math.max(0, (runtime.stage?.height ?? camera.worldHeight ?? GAME_VIEW.HEIGHT) - GAME_VIEW.HEIGHT);
  camera.x = Math.max(0, Math.min(maxX, player.x + player.w / 2 - GAME_VIEW.WIDTH / 2));
  camera.y = Math.max(0, Math.min(maxY, player.y + player.h / 2 - GAME_VIEW.HEIGHT / 2));
  camera.follow?.(player);
  return true;
}
