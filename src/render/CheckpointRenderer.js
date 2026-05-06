/**
 * 責務: ステージ中継ポイントの見た目だけを描画する。
 * 更新ルール: 中継ポイントの接触判定や復帰地点登録はStageCheckpointServiceへ置き、ここでは状態に応じた表示に限定する。
 * 更新ルール: 中継ポイント本体は地面に固定して描画し、縦揺れなどの位置アニメーションを入れない。
 */
import { drawSprite } from './drawSprite.js';

const DEFAULT_DRAW_W = 36;
const DEFAULT_DRAW_H = 48;

export class CheckpointRenderer {
  constructor(app) {
    this.app = app;
  }

  render(ctx, checkpoints = [], elapsed = 0) {
    if (!Array.isArray(checkpoints) || checkpoints.length <= 0) return;

    for (const checkpoint of checkpoints) {
      const img = this.app.assets.getImage(checkpoint.imageKey || 'stage_checkpoint_flag');
      const drawW = checkpoint.drawW || DEFAULT_DRAW_W;
      const drawH = checkpoint.drawH || DEFAULT_DRAW_H;
      const active = !!checkpoint.activated;
      const x = checkpoint.x - drawW / 2;
      const y = checkpoint.y - drawH;

      ctx.save();
      ctx.globalAlpha = active ? 1 : 0.78;
      if (active) this.drawGlow(ctx, checkpoint.x, checkpoint.y - drawH * 0.72, elapsed);
      drawSprite(ctx, img, x, y, drawW, drawH);
      ctx.restore();
    }
  }

  drawGlow(ctx, x, y, elapsed) {
    const radius = 14 + Math.sin(elapsed * 4.8) * 2;
    const gradient = ctx.createRadialGradient(x, y, 3, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 245, 166, 0.42)');
    gradient.addColorStop(1, 'rgba(255, 245, 166, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
