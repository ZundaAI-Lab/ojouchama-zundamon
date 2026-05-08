/**
 * 責務: 画像アセットを主表示に使う足場の描画とfallback表示を管理する。
 * 更新ルール: 画像取得は呼び出し側で行い、ここでは描画済みImageかfallbackだけを扱う。
 */
import { clamp } from '../../utils/math.js';
import { drawSprite, roundedRect } from '../drawSprite.js';
import { drawCloudBlock } from './basicPlatformDrawers.js';
import { drawPlatformGlow, drawPlatformSparkles } from './platformRenderShared.js';

export function drawImagePlatform(ctx, img, x, y, w, h, fallback) {
  if (img) {
    drawSprite(ctx, img, x, y, w, h);
    return;
  }
  fallback();
}

export function drawRibbonBridge(ctx, p, img) {
  const growDuration = p.growDuration || 0.38;
  const progress = p.active === false ? 0.92 : (p.growTimer > 0 ? 1 - p.growTimer / growDuration : 1);
  const eased = clamp(progress, 0.12, 1);
  const visualW = p.w * eased + 22;
  const visualH = img ? visualW * (img.height / img.width) : Math.max(38, p.h * 2.6);
  const x = p.x + p.w / 2 - visualW / 2;
  const y = p.y - visualH * 0.33;
  drawImagePlatform(ctx, img, x, y, visualW, visualH, () => {
    roundedRect(ctx, p.x, p.y, p.w, p.h, 9);
    ctx.fillStyle = '#f5a8bf';
    ctx.fill();
    ctx.strokeStyle = '#d56f96';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

export function drawWaitFlower(ctx, p, img) {
  const pulse = Math.max(0, p.waitFlowerTimer || 0) * 0.08;
  const visualW = p.w + 26 + pulse * p.w;
  const visualH = img ? visualW * (img.height / img.width) : p.h + 64;
  const x = p.x + p.w / 2 - visualW / 2;
  const y = p.y - visualH * 0.36;
  drawImagePlatform(ctx, img, x, y, visualW, visualH, () => {
    ctx.fillStyle = '#ffc4d8';
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, p.h, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawBalloonGoalCloud(ctx, p, img, glow = false, elapsed = 0) {
  const visualW = Math.max(p.w + 28, 156);
  const visualH = img ? visualW * (img.height / img.width) : 82;
  const x = p.x + p.w / 2 - visualW / 2;
  const y = p.y + p.h - visualH + 8;
  if (glow) {
    drawPlatformGlow(ctx, p.x + p.w / 2, p.y + p.h * 0.32, visualW * 0.62, visualH * 0.42, elapsed, 0.44);
    drawPlatformSparkles(ctx, x, y + visualH * 0.18, visualW, elapsed, 0.5);
  }
  drawImagePlatform(ctx, img, x, y, visualW, visualH, () => {
    drawCloudBlock(ctx, { ...p, x: p.x - 20, y: p.y - 16, w: p.w + 40, h: p.h + 16 }, false);
  });
}
