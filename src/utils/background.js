/**
 * 責務: 背景画像をcanvasへcover描画する共通関数を担当する。
 * 更新ルール: 特定Scene専用の演出を追加せず、汎用描画補助に限定する。
 * 更新ルール: 背景スクロールはX/Yの描画補助だけを扱い、ステージ側のカメラやパララックス判断は呼び出し側に置く。
 * 更新ルール: cover対象サイズと実表示ビューポートを分け、360px高ステージ用の背景余白計算を呼び出し側で再利用できるようにする。
 * 更新ルール: 縦ループ背景はrepeatYオプションで扱い、通常のcover背景挙動には影響させない。
 */
import { GAME_VIEW } from '../config/view.js';

function resolvePositiveNumber(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function clampScroll(value, max) {
  return Math.max(0, Math.min(value, max));
}

export function getCoverBackgroundMetrics(img, options = {}) {
  if (!img) return null;

  const viewWidth = resolvePositiveNumber(options.viewWidth, GAME_VIEW.WIDTH);
  const viewHeight = resolvePositiveNumber(options.viewHeight, GAME_VIEW.HEIGHT);
  const coverWidth = resolvePositiveNumber(options.coverWidth, viewWidth);
  const coverHeight = resolvePositiveNumber(options.coverHeight, viewHeight);
  const scale = Math.max(coverWidth / img.width, coverHeight / img.height);
  const width = img.width * scale;
  const height = img.height * scale;

  return {
    viewWidth,
    viewHeight,
    coverWidth,
    coverHeight,
    scale,
    width,
    height,
    maxScrollX: Math.max(0, width - viewWidth),
    maxScrollY: Math.max(0, height - viewHeight),
  };
}

export function drawCoverBackground(ctx, img, options = {}) {
  const metrics = getCoverBackgroundMetrics(img, options);
  if (!metrics) return false;

  const scrollX = options.scrollX ?? 0;
  const scrollY = options.scrollY ?? 0;
  const repeatY = options.repeatY === true;
  const safeScrollX = clampScroll(scrollX, metrics.maxScrollX);
  const safeScrollY = clampScroll(scrollY, metrics.maxScrollY);
  const alignX = options.alignX || 'left';
  const alignY = options.alignY || 'center';
  const centeredX = (metrics.viewWidth - metrics.width) / 2;
  const centeredY = (metrics.viewHeight - metrics.height) / 2;

  if (repeatY) {
    const x = centeredX - safeScrollX;
    const offsetY = ((scrollY % metrics.height) + metrics.height) % metrics.height;
    let y = -offsetY;
    while (y > 0) y -= metrics.height;
    while (y < metrics.viewHeight) {
      ctx.drawImage(img, x, y, metrics.width, metrics.height);
      y += metrics.height;
    }
    return true;
  }

  const x = (alignX === 'center' ? centeredX : 0) - safeScrollX;
  const y = (alignY === 'top' ? 0 : centeredY) - safeScrollY;
  ctx.drawImage(img, x, y, metrics.width, metrics.height);
  return true;
}
