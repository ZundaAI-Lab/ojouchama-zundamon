/**
 * 責務: kind:'wind' 足場の windStyle 別描画を管理する。
 * 更新ルール: dream/ribbonは個別kindへ戻さず、windStyleの分岐だけをここへ追加する。
 */
import { roundedRect } from '../drawSprite.js';

export function drawDreamStyleWind(ctx, p) {
  roundedRect(ctx, p.x, p.y, p.w, p.h, 9);
  ctx.fillStyle = 'rgba(222,213,255,0.85)';
  ctx.fill();
  ctx.strokeStyle = '#a88ee7';
  ctx.lineWidth = 2;
  for (let x = p.x + 8; x < p.x + p.w - 8; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, p.y + p.h - 3);
    ctx.quadraticCurveTo(x + 16, p.y - 4, x + 31, p.y + 8);
    ctx.stroke();
  }
  ctx.fillStyle = '#ffd46e';
  for (let x = p.x + p.w - 20; x <= p.x + p.w - 10; x += 10) {
    ctx.beginPath();
    ctx.arc(x, p.y + 6, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawRibbonStyleWind(ctx, p) {
  roundedRect(ctx, p.x, p.y, p.w, p.h, 9);
  ctx.fillStyle = 'rgba(255,205,229,0.82)';
  ctx.fill();
  ctx.strokeStyle = '#e58ab0';
  ctx.lineWidth = 2;
  const dir = Math.sign(p.windDir || p.dir || 1) || 1;
  for (let x = p.x + 8; x < p.x + p.w - 8; x += 20) {
    ctx.beginPath();
    if (dir > 0) {
      ctx.moveTo(x, p.y + p.h - 4);
      ctx.bezierCurveTo(x + 10, p.y + 2, x + 20, p.y + p.h - 1, x + 32, p.y + 6);
    } else {
      ctx.moveTo(x + 32, p.y + p.h - 4);
      ctx.bezierCurveTo(x + 22, p.y + 2, x + 12, p.y + p.h - 1, x, p.y + 6);
    }
    ctx.stroke();
  }
  ctx.fillStyle = '#fff2a8';
  for (let x = p.x + 12; x < p.x + p.w - 8; x += 34) {
    ctx.beginPath();
    ctx.arc(x, p.y + 5, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}
