/**
 * 責務: おじぎゲートの開閉状態に応じた描画を担当する。
 * 更新ルール: ゲート開閉判定は StageRuntime/StageCollision 側に置き、ここでは見た目だけを扱う。
 */
import { drawSprite, roundedRect } from './drawSprite.js';

export class GateRenderer {
  constructor(app) {
    this.app = app;
  }

  render(ctx, gate) {
    if (!gate) return;
    const doorImg = this.app.assets.getImage(gate.imageKey || 'gate_bow_door');
    ctx.save();
    ctx.globalAlpha = gate.open ? 0.35 : 1;

    if (doorImg) {
      const visualH = gate.h + 18;
      const visualW = visualH * (doorImg.width / doorImg.height);
      const x = gate.x + gate.w / 2 - visualW / 2;
      const y = gate.y + gate.h - visualH;
      drawSprite(ctx, doorImg, x, y, visualW, visualH);
    } else {
      roundedRect(ctx, gate.x, gate.y, gate.w, gate.h, 12);
      ctx.fillStyle = gate.open ? '#d2f2d7' : '#f7d6e4';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = gate.open ? '#8bc89d' : '#dd95b2';
      ctx.stroke();
    }

    ctx.restore();
  }
}
