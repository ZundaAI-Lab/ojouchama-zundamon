/**
 * 責務: プレイヤー弾・住民弾・中立ギミック弾の発光表現を描画する。
 * 更新ルール: 弾の移動・命中・寿命処理は Projectile と stage/ 側に置く。
 */
import { clamp } from '../utils/math.js';
import { drawSprite } from './drawSprite.js';

export class ProjectileRenderer {
  constructor(app) {
    this.app = app;
  }

  render(ctx, projectiles) {
    for (const p of projectiles) {
      if (p.render?.type === 'bubble') {
        this.renderBubble(ctx, p);
        continue;
      }
      if (p.render?.type === 'slash') {
        this.renderSlash(ctx, p);
        continue;
      }
      if (p.render?.type === 'markerRect') {
        this.renderMarkerRect(ctx, p);
        continue;
      }
      if (p.render?.type === 'ribbonLine') {
        this.renderRibbonLine(ctx, p);
        continue;
      }
      if (p.render?.type === 'steamWall') {
        this.renderSteamWall(ctx, p);
        continue;
      }
      if (p.render?.type === 'lightPillar') {
        this.renderLightPillar(ctx, p);
        continue;
      }
      if (p.render?.type === 'page') {
        this.renderPage(ctx, p);
        continue;
      }
      if (p.render?.type === 'wave') {
        this.renderWave(ctx, p);
        continue;
      }
      if (p.render?.type === 'feather') {
        this.renderFeather(ctx, p);
        continue;
      }
      if (p.render?.type === 'wind_gust') {
        this.renderWindGust(ctx, p);
        continue;
      }
      if (p.render?.type === 'ribbon_wisp') {
        this.renderRibbonWisp(ctx, p);
        continue;
      }
      if (p.render?.type === 'lightning_bolt') {
        this.renderLightningBolt(ctx, p);
        continue;
      }
      this.renderOrb(ctx, p);
    }
  }

  renderBubble(ctx, p) {
    const alpha = clamp(p.life / p.maxLife, 0.18, 0.78);
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const wobble = Math.sin((p.age || 0) * 8) * 0.8;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = p.color || '#c9f8ff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(210, 250, 255, 0.36)';
    ctx.strokeStyle = 'rgba(244, 255, 255, 0.92)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, p.w / 2 + 2 + wobble, p.h / 2 + 1 - wobble * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = Math.min(1, alpha + 0.18);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(cx - p.w * 0.18, cy - p.h * 0.18, 2.8, 2, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderSlash(ctx, p) {
    const alpha = clamp(p.life / p.maxLife, 0.22, 1);
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const angle = Math.atan2(p.vy, p.vx || 1);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = p.color || '#f8f2ff';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = p.color || '#f8f2ff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, 14, -0.72, 0.72);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(86, 58, 120, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 16, -0.6, 0.6);
    ctx.stroke();
    ctx.restore();
  }

  renderMarkerRect(ctx, p) {
    const alpha = clamp(p.life / p.maxLife, 0.12, 0.42);
    const color = p.render?.color || p.color || '#ffffff';
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(p.render?.angle || 0);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }

  renderRibbonLine(ctx, p) {
    const alpha = clamp(p.life / p.maxLife, 0.18, 0.94);
    const color = p.render?.color || p.color || '#ff9bc6';
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(p.render?.angle || 0);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, Math.max(4, p.h / 2));
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = Math.min(1, alpha + 0.18);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-p.w / 2 + 6, 0);
    ctx.lineTo(p.w / 2 - 6, 0);
    ctx.stroke();
    ctx.restore();
  }

  renderSteamWall(ctx, p) {
    const alpha = clamp(p.life / p.maxLife, 0.14, 0.74);
    const color = p.render?.color || p.color || '#d6f0ff';
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, Math.max(8, p.w / 2));
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = alpha * 0.74;
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.fillRect(p.x + p.w * 0.35, p.y + 5, Math.max(2, p.w * 0.25), p.h - 10);
    ctx.restore();
  }

  renderLightPillar(ctx, p) {
    const alpha = clamp(p.life / p.maxLife, 0.16, 0.84);
    const color = p.render?.color || p.color || '#d9c2ff';
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = 22;
    ctx.fillStyle = color;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.globalAlpha = Math.min(1, alpha + 0.1);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(p.x + p.w * 0.38, p.y, Math.max(3, p.w * 0.24), p.h);
    ctx.restore();
  }

  renderPage(ctx, p) {
    const alpha = clamp(p.life / p.maxLife, 0.22, 1);
    const color = p.render?.color || p.color || '#cdb6ff';
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const angle = Math.atan2(p.vy, p.vx || 1) * 0.18 + Math.sin((p.age || 0) * 9) * 0.12;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255, 250, 230, 0.95)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 4);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(120, 82, 160, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-p.w * 0.24, -p.h * 0.14);
    ctx.lineTo(p.w * 0.28, -p.h * 0.14);
    ctx.moveTo(-p.w * 0.24, p.h * 0.12);
    ctx.lineTo(p.w * 0.22, p.h * 0.12);
    ctx.stroke();
    ctx.restore();
  }

  renderWave(ctx, p) {
    const alpha = clamp(p.life / p.maxLife, 0.22, 0.92);
    const color = p.render?.color || p.color || '#fff2c7';
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const angle = Math.atan2(p.vy, p.vx || 1);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-p.w * 0.45, 0);
    ctx.quadraticCurveTo(0, -p.h, p.w * 0.45, 0);
    ctx.stroke();
    ctx.restore();
  }

  renderFeather(ctx, p) {
    const alpha = clamp(p.life / p.maxLife, 0.22, 1);
    const color = p.render?.color || p.color || '#d8bcff';
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const angle = Math.atan2(p.vy, p.vx || 1) + Math.PI / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w * 0.38, p.h * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -p.h * 0.42);
    ctx.lineTo(0, p.h * 0.42);
    ctx.stroke();
    ctx.restore();
  }

  renderWindGust(ctx, p) {
    const img = this.app.assets.getImage('balloon_fx_wind_shot');
    const w = 22 + Math.sin((p.age || 0) * 10 + p.x * 0.05) * 1.0;
    const h = img ? w * (img.height / img.width) : 22;
    // 風弾素材は左向き基準（風のふくらみ側が進行方向）なので、右へ進む弾だけ反転する。
    const flipX = (p.vx || 0) > 0;
    drawSprite(ctx, img, p.x + p.w / 2 - w / 2, p.y + p.h / 2 - h / 2, w, h, flipX);
  }

  renderRibbonWisp(ctx, p) {
    const alpha = clamp(p.life / p.maxLife, 0.22, 1);
    const color = p.render?.color || p.color || '#ff9bc6';
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const baseVx = Number.isFinite(p.vx) ? p.vx : 1;
    const baseVy = Number.isFinite(p.vy) ? p.vy : 0;
    const angle = Math.atan2(baseVy, baseVx) + Math.sin((p.age || 0) * 6.2) * 0.08;
    const halfW = p.w / 2;
    const halfH = p.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = 11;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(116, 40, 92, 0.72)';
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.moveTo(-1.5, 0);
    ctx.bezierCurveTo(-halfW * 0.34, -halfH * 0.9, -halfW * 0.92, -halfH * 0.62, -halfW * 0.86, 0);
    ctx.bezierCurveTo(-halfW * 0.92, halfH * 0.62, -halfW * 0.34, halfH * 0.9, -1.5, 0);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1.5, 0);
    ctx.bezierCurveTo(halfW * 0.34, -halfH * 0.9, halfW * 0.92, -halfH * 0.62, halfW * 0.86, 0);
    ctx.bezierCurveTo(halfW * 0.92, halfH * 0.62, halfW * 0.34, halfH * 0.9, 1.5, 0);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(-4, -4, 8, 8, 3);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = Math.min(1, alpha + 0.12);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-halfW * 0.72, -halfH * 0.08);
    ctx.quadraticCurveTo(-halfW * 0.38, -halfH * 0.42, -5, -1);
    ctx.moveTo(halfW * 0.72, -halfH * 0.08);
    ctx.quadraticCurveTo(halfW * 0.38, -halfH * 0.42, 5, -1);
    ctx.stroke();
    ctx.restore();
  }

  renderLightningBolt(ctx, p) {
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const angle = Math.atan2(p.vy || 0, p.vx || -1);
    const flicker = 0.85 + Math.sin((p.age || 0) * 41) * 0.15;
    const points = [
      [-13, 0],
      [-6, -5],
      [-2, 2],
      [4, -4],
      [12, 0],
    ];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255, 238, 90, 0.95)';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = `rgba(255, 242, 92, ${flicker})`;
    ctx.lineWidth = 5;
    this.strokeLightningPath(ctx, points);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 244, 0.98)';
    ctx.lineWidth = 2;
    this.strokeLightningPath(ctx, points);
    ctx.restore();
  }

  strokeLightningPath(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
  }

  renderOrb(ctx, p) {
    ctx.save();
    const isResidentShot = p.faction === 'resident';
    const alpha = clamp(p.life / p.maxLife, 0.25, 1);
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const rx = isResidentShot ? Math.max(p.w / 2 + 3, 8) : p.w / 2;
    const ry = isResidentShot ? Math.max(p.h / 2 + 3, 7) : p.h / 2;
    const color = p.color || (p.boosted ? '#ffe67f' : '#90df79');

    ctx.globalAlpha = alpha;
    if (isResidentShot) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx + 3, ry + 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(73, 30, 87, 0.92)';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.globalAlpha = Math.min(1, alpha + 0.15);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.beginPath();
      ctx.ellipse(cx - 2, cy - 2, Math.max(2.5, rx * 0.32), Math.max(2, ry * 0.32), 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const speed = Math.hypot(p.vx, p.vy) || 1;
      const nx = p.vx / speed;
      const ny = p.vy / speed;
      const trailLength = Math.max(10, Math.min(22, speed * 0.055));
      const tailX = cx - nx * trailLength;
      const tailY = cy - ny * trailLength;
      const coreRx = Math.max(rx * 0.72, 5);
      const coreRy = Math.max(ry * 0.72, 4);

      ctx.shadowColor = color;
      ctx.shadowBlur = p.boosted ? 18 : 14;
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha * 0.34;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx + 7, ry + 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = alpha * 0.55;
      ctx.beginPath();
      ctx.ellipse(tailX, tailY, Math.max(5, rx * 0.74), Math.max(3.5, ry * 0.54), Math.atan2(ny, nx), 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx + 2, ry + 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.ellipse(cx + nx * 1.4, cy + ny * 1.4, coreRx, coreRy, Math.atan2(ny, nx), 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.beginPath();
      ctx.ellipse(cx - nx * 2 - ny * 1.5, cy - ny * 2 + nx * 1.5, Math.max(2.5, rx * 0.24), Math.max(2, ry * 0.24), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
