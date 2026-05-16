/**
 * 責務: 住民キャラクター本体、スタン表示、行動コマンド由来の描画フラグを描画する。
 * 更新ルール: 住民AIやダメージ処理は actors/resident と stage/ 側に置き、描画副作用を持たせない。
 * 更新ルール: 魔法命中リアクションはResidentの実座標とフラッシュ状態を読むだけにし、描画側でノックバック座標補正を足さない。
 */
import { drawSprite } from './drawSprite.js';
import { isRideResident } from '../actors/resident/ResidentScope.js';

export class ResidentRenderer {
  constructor(app) {
    this.app = app;
  }

  render(ctx, residents, elapsed) {
    for (const resident of residents) {
      if (isRideResident(resident)) continue;
      const img = this.app.assets.getImage(resident.imageKey);
      const bounce = Math.sin(elapsed * 6 + resident.animOffset) * (resident.type === 'jelly' ? 2 : 1);
      const flags = resident.blackboard?.flags || {};
      const alpha = resident.stunTimer > 0 ? 0.72 : 1;
      const visualX = resident.x - (resident.drawW - resident.w) / 2;
      const visualY = resident.y - (resident.drawH - resident.h) + bounce;
      const auraFlag = flags.eyeGlow || flags.alertGlow;
      if (auraFlag) this.renderActionAura(ctx, resident, flags.eyeGlow ? '#fff6a8' : '#ffb7dc', elapsed, auraFlag, bounce);

      drawSprite(ctx, img, visualX, visualY, resident.drawW, resident.drawH, resident.facing > 0, alpha);
      if (resident.magicHitFlashTimer > 0) {
        this.renderMagicHitFlash(ctx, resident, img, visualX, visualY, alpha);
      }

      if (flags.reflectFlash) this.renderReflectFlash(ctx, resident, flags.reflectFlash);
      if (resident.stunTimer > 0) {
        ctx.fillStyle = '#fff8b7';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨', resident.x + resident.w / 2, resident.y - 8);
      }
    }
  }

  renderActionAura(ctx, resident, color, elapsed, value, bounce = 0) {
    const rate = typeof value === 'number' ? Math.max(0.35, Math.min(1, value / 0.45)) : 1;
    const visualX = resident.x - (resident.drawW - resident.w) / 2;
    const visualY = resident.y - (resident.drawH - resident.h) + bounce;
    const cx = visualX + resident.drawW / 2;
    const cy = visualY + resident.drawH / 2;
    const pulse = Math.sin(elapsed * 10 + resident.animOffset) * 0.08;
    const rx = Math.max(resident.drawW, resident.w) * (0.58 + pulse);
    const ry = Math.max(resident.drawH, resident.h) * (0.5 + pulse * 0.7);

    ctx.save();
    ctx.globalAlpha = (0.18 + rate * 0.12) * (1 + pulse);
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.38 + rate * 0.22;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.78, ry * 0.78, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  renderMagicHitFlash(ctx, resident, img, x, y, alpha = 1) {
    const duration = Math.max(0.001, resident.magicHitFlashDuration || 0.14);
    const rate = Math.max(0, Math.min(1, resident.magicHitFlashTimer / duration));
    const cx = x + resident.drawW / 2;
    const cy = y + resident.drawH / 2;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (0.08 + rate * 0.14) * alpha;
    drawSprite(ctx, img, x, y, resident.drawW, resident.drawH, resident.facing > 0);
    ctx.globalAlpha = (0.035 + rate * 0.055) * alpha;
    ctx.fillStyle = '#fffef2';
    ctx.shadowColor = '#fffef2';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, resident.drawW * 0.34, resident.drawH * 0.27, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderReflectFlash(ctx, resident, value) {
    const rate = typeof value === 'number' ? Math.max(0, Math.min(1, value / 0.18)) : 1;
    const cx = resident.x + resident.w / 2;
    const cy = resident.y + resident.h / 2;
    ctx.save();
    ctx.globalAlpha = 0.3 + rate * 0.45;
    ctx.strokeStyle = '#dff5ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#dff5ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(cx, cy - resident.h * 0.72);
    ctx.lineTo(cx + resident.w * 0.7, cy);
    ctx.lineTo(cx, cy + resident.h * 0.72);
    ctx.lineTo(cx - resident.w * 0.7, cy);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

