/**
 * 責務: ボス名とHPゲージの画面固定HUDを描画する。
 * 更新ルール: 表示条件は呼び出し側で判断し、このファイルではゲージの見た目だけを扱う。
 */
import { roundedRect } from './drawSprite.js';

export class BossHudRenderer {
  constructor(app) {
    this.app = app;
  }

  render(ctx, boss) {
    ctx.save();
    const x = 116, y = 52, w = 248, h = 10;
    roundedRect(ctx, x - 4, y - 16, w + 8, 28, 9);
    ctx.fillStyle = 'rgba(255,255,255,0.86)';
    ctx.fill();
    ctx.fillStyle = '#7b6272';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(boss.name, x + w / 2, y - 4);
    roundedRect(ctx, x, y, w, h, 5);
    ctx.fillStyle = '#edd4de';
    ctx.fill();
    roundedRect(ctx, x, y, w * (boss.hp / boss.maxHp), h, 5);
    ctx.fillStyle = boss.final ? '#b58ef2' : '#ef8fb1';
    ctx.fill();
    ctx.restore();
  }
}
