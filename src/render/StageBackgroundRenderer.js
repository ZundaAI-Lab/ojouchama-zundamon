/**
 * 責務: ステージ背景とワールド奥側の装飾描画を担当する。
 * 更新ルール: 背景スクロールや装飾描画だけを扱い、ActorやHUDの描画順には触れない。
 * 更新ルール: 通常ステージ背景はステージ高に合わせたcover対象へ描画し、カメラY進行率と背景の縦余白を同期させる。
 * 更新ルール: 背景の縦同期はワールド描画と同じ丸め済みcameraYを使い、着地時の小数揺れを背景へ伝えない。
 * 更新ルール: 縦ループ背景は専用背景として扱い、通常ステージの360px高cover同期とは分離する。
 */
import { GAME_VIEW } from '../config/view.js';
import { drawCoverBackground, getCoverBackgroundMetrics } from '../utils/background.js';

const STAGE_BACKGROUND_SCROLL_RATE = 0.06;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function getStageHeight(stage) {
  return Number.isFinite(stage?.height) ? stage.height : GAME_VIEW.HEIGHT;
}

function getRenderCameraY(camera) {
  return Math.round(camera?.y || 0);
}

function getVerticalCameraProgress(cameraY, stage) {
  const maxCameraY = Math.max(0, getStageHeight(stage) - GAME_VIEW.HEIGHT);
  if (maxCameraY <= 0) return 0;
  return clamp01(cameraY / maxCameraY);
}

function getSyncedBackgroundScrollY(img, cameraY, stage, coverHeight) {
  const metrics = getCoverBackgroundMetrics(img, {
    coverWidth: GAME_VIEW.WIDTH,
    coverHeight,
  });
  if (!metrics) return 0;
  return metrics.maxScrollY * getVerticalCameraProgress(cameraY, stage);
}

export class StageBackgroundRenderer {
  constructor(app) {
    this.app = app;
  }

  renderCanvasBackground(ctx, img, camera, stage = null) {
    if (!img) {
      ctx.fillStyle = '#ffe9f2';
      ctx.fillRect(0, 0, GAME_VIEW.WIDTH, GAME_VIEW.HEIGHT);
      return;
    }

    const verticalLoop = stage?.backgroundKey === 'bg_dream_tree_h';
    const scrollX = camera.x * STAGE_BACKGROUND_SCROLL_RATE;
    const cameraY = getRenderCameraY(camera);

    if (verticalLoop) {
      drawCoverBackground(ctx, img, { scrollX, scrollY: cameraY, repeatY: true });
    } else {
      const coverHeight = Math.max(GAME_VIEW.HEIGHT, getStageHeight(stage));
      const scrollY = getSyncedBackgroundScrollY(img, cameraY, stage, coverHeight);
      drawCoverBackground(ctx, img, {
        scrollX,
        scrollY,
        coverWidth: GAME_VIEW.WIDTH,
        coverHeight,
        alignY: 'top',
      });
    }

    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(0, 0, GAME_VIEW.WIDTH, GAME_VIEW.HEIGHT);
  }

  renderWorldDecorations(scene, ctx) {
    const { stage } = scene;
    ctx.save();
    for (let i = 0; i < (stage.decorations || []).length; i += 1) {
      const d = stage.decorations[i];
      const bob = Math.sin(scene.elapsed * 0.8 + i) * 2;
      ctx.beginPath();
      ctx.arc(d.x, d.y + bob, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.fill();
    }
    ctx.restore();
  }
}
