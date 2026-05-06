/**
 * 責務: ボス本体の通常描画・出現/浄化中の見た目補間・防御/解除フラッシュ描画を担当する。
 * 更新ルール: ボス行動・攻撃・HP変化は actors/boss と stage/ 側に置く。
 */
import { drawSprite } from './drawSprite.js';

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export class BossRenderer {
  constructor(app) {
    this.app = app;
  }

  render(ctx, boss, elapsed) {
    if (!boss || !boss.visible) return;
    if (!boss.alive && !boss.purifying) return;

    const img = this.app.assets.getImage(boss.imageKey);
    const appear = clamp01(boss.appearProgress ?? 1);
    const purify = clamp01(boss.purifyProgress ?? 0);
    const bob = Math.sin(elapsed * 2.1) * 2;
    const appearScale = 0.48 + appear * 0.52;
    const purifyScale = boss.purifying ? 1 + purify * 0.18 : 1;
    const scale = appearScale * purifyScale;
    const alpha = boss.purifying ? Math.max(0, 1 - purify * 0.82) : appear;
    const drawW = boss.drawW * scale;
    const drawH = boss.drawH * scale;
    const x = boss.x + boss.w / 2 - drawW / 2;
    const y = boss.y + boss.h - drawH + bob - (1 - appear) * 18 - purify * 10;

    drawSprite(ctx, img, x, y, drawW, drawH, false, alpha);

    if (boss.reflectFlash > 0) this.renderReflectFlash(ctx, boss);
    if (boss.bowShieldReleaseFlash > 0) this.renderBowShieldReleaseEffect(ctx, boss);

    if (appear < 1 || boss.purifying) {
      ctx.save();
      ctx.globalAlpha = boss.purifying ? Math.max(0, 0.45 - purify * 0.28) : 0.32 * (1 - appear);
      ctx.fillStyle = '#fff4a3';
      ctx.beginPath();
      ctx.ellipse(boss.x + boss.w / 2, boss.y + boss.h - 4, boss.w * (0.7 + appear * 0.5), 8 + appear * 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }


  renderBowShieldReleaseEffect(ctx, boss) {
    const duration = 0.9;
    const remaining = Math.max(0, Math.min(duration, boss.bowShieldReleaseFlash));
    const progress = 1 - remaining / duration;
    const ease = 1 - (1 - progress) ** 3;
    const cx = boss.x + boss.w / 2;
    const cy = boss.y + boss.h / 2;
    const baseRx = Math.max(boss.drawW || boss.w, boss.w) * 0.54;
    const baseRy = Math.max(boss.drawH || boss.h, boss.h) * 0.5;
    const alpha = Math.max(0, 1 - progress);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    ctx.globalAlpha = 0.42 * alpha;
    ctx.fillStyle = '#fff6b3';
    ctx.shadowColor = '#fff6b3';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseRx * (0.65 + ease * 0.55), baseRy * (0.52 + ease * 0.45), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.75 * alpha;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.6;
    ctx.shadowColor = '#dff5ff';
    ctx.shadowBlur = 18;
    for (let i = 0; i < 2; i += 1) {
      const ringProgress = Math.min(1, ease + i * 0.18);
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        baseRx * (0.72 + ringProgress * 0.5),
        baseRy * (0.62 + ringProgress * 0.42),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    ctx.globalAlpha = 0.85 * alpha;
    ctx.strokeStyle = '#fff6b3';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8 + progress * 0.8;
      const start = baseRx * (0.58 + ease * 0.22);
      const end = baseRx * (0.78 + ease * 0.62);
      const sx = cx + Math.cos(angle) * start;
      const sy = cy + Math.sin(angle) * start * 0.72;
      const ex = cx + Math.cos(angle) * end;
      const ey = cy + Math.sin(angle) * end * 0.72;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderReflectFlash(ctx, boss) {
    const rate = Math.max(0, Math.min(1, boss.reflectFlash / 0.18));
    const cx = boss.x + boss.w / 2;
    const cy = boss.y + boss.h / 2;
    const rx = Math.max(boss.drawW || boss.w, boss.w) * 0.5;
    const ry = Math.max(boss.drawH || boss.h, boss.h) * 0.46;

    ctx.save();
    ctx.globalAlpha = 0.3 + rate * 0.45;
    ctx.strokeStyle = '#dff5ff';
    ctx.lineWidth = 2.4;
    ctx.shadowColor = '#dff5ff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry);
    ctx.lineTo(cx + rx, cy);
    ctx.lineTo(cx, cy + ry);
    ctx.lineTo(cx - rx, cy);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}
