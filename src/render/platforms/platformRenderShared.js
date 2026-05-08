/**
 * 責務: 足場描画で共有する発光・きらめき装飾を提供する。
 * 更新ルール: 種別固有の形状描画は各足場レンダラーへ置く。
 */

export function drawPlatformGlow(ctx, cx, cy, rx, ry, elapsed, alpha = 0.42) {
  ctx.save();
  ctx.globalAlpha = alpha + Math.sin(elapsed * 5.2) * 0.06;
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  glow.addColorStop(0, 'rgba(255,247,170,0.66)');
  glow.addColorStop(0.58, 'rgba(138,226,255,0.22)');
  glow.addColorStop(1, 'rgba(138,226,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPlatformSparkles(ctx, x, y, w, elapsed, alpha = 0.52) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = 'rgba(255,252,205,0.95)';
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 6; i += 1) {
    const t = elapsed * 2.8 + i * 1.4;
    const px = x + w * (0.18 + i * 0.13);
    const py = y + 6 + Math.sin(t) * 9;
    const s = 2.2 + Math.sin(t * 1.7) * 0.6;
    ctx.beginPath();
    ctx.moveTo(px - s, py);
    ctx.lineTo(px + s, py);
    ctx.moveTo(px, py - s);
    ctx.lineTo(px, py + s);
    ctx.stroke();
  }
  ctx.restore();
}
