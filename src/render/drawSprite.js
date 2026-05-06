/**
 * 責務: canvas描画で共有するスプライト反転描画と角丸パス作成を提供する。
 * 更新ルール: 状態を持たない純粋な描画補助だけを置き、特定画面専用の描画は各Rendererへ移す。
 */
export function drawSprite(ctx, img, x, y, w, h, flipX = false, alpha = 1) {
  if (!img) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (flipX) {
    ctx.translate(x + w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(x + w / 2), 0);
  }
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

export function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
