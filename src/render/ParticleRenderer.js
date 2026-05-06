/**
 * 責務: ステージ内の短命パーティクルを描画する。
 * 更新ルール: 生成・寿命更新は ParticleSystem 側に置き、ここでは現在値を描画するだけにする。
 */
export class ParticleRenderer {
  constructor(app) {
    this.app = app;
  }

  render(ctx, particles) {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      if (p.kind === 'gust') {
        ctx.lineWidth = Math.max(1.2, p.size * 0.16);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(p.x + p.size * 0.45, p.y - p.size * 0.18, p.x + p.size, p.y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
