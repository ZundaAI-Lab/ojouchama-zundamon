/**
 * 責務: 足場種別ごとの見た目を描き分ける。
 * 更新ルール: 足場の状態変更や当たり判定は stage/ 側に置き、ここでは描画だけを行う。
 */
import { clamp } from '../utils/math.js';
import { drawSprite, roundedRect } from './drawSprite.js';

function drawPlatformGlow(ctx, cx, cy, rx, ry, elapsed, alpha = 0.42) {
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

function drawPlatformSparkles(ctx, x, y, w, elapsed, alpha = 0.52) {
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


function drawCandyDots(ctx, p) {
  const colors = ['#ff9fcb', '#ffe07a', '#8fe8ff', '#a9df7f'];
  for (let x = p.x + 18, i = 0; x < p.x + p.w - 10; x += 34, i += 1) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(x, p.y + p.h - 13, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawJamBlock(ctx, p, hardened = false) {
  roundedRect(ctx, p.x, p.y + 7, p.w, p.h - 5, 7);
  ctx.fillStyle = '#d6a66f';
  ctx.fill();
  drawCandyDots(ctx, p);
  roundedRect(ctx, p.x, p.y, p.w, Math.min(15, p.h), 8);
  ctx.fillStyle = hardened ? '#ff9bb8' : '#ef5b73';
  ctx.fill();
  ctx.fillStyle = hardened ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.45)';
  roundedRect(ctx, p.x + 8, p.y + 3, p.w - 16, 4, 3);
  ctx.fill();
  if (hardened) {
    ctx.strokeStyle = 'rgba(255,255,255,0.68)';
    ctx.lineWidth = 1;
    for (let x = p.x + 16; x < p.x + p.w - 8; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, p.y + 2);
      ctx.lineTo(x + 10, p.y + 13);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#cf365b';
    for (let x = p.x + 14; x < p.x + p.w - 8; x += 28) {
      ctx.beginPath();
      ctx.arc(x, p.y + 14, 5, 0, Math.PI);
      ctx.fill();
    }
  }
}

function drawCloudBlock(ctx, p, sleepy = false) {
  ctx.fillStyle = sleepy ? '#f8f1ff' : '#f4fbff';
  for (let x = p.x; x < p.x + p.w; x += 18) {
    ctx.beginPath();
    ctx.arc(x + 10, p.y + 10, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  roundedRect(ctx, p.x, p.y + 8, p.w, p.h, 10);
  ctx.fillStyle = sleepy ? '#e9ddff' : '#e2f1ff';
  ctx.fill();
  if (sleepy) {
    ctx.strokeStyle = '#8269b3';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2 - 9, p.y + 11, 3, 0, Math.PI);
    ctx.arc(p.x + p.w / 2 + 9, p.y + 11, 3, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,146,180,0.55)';
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2 - 22, p.y + 15, 3, 0, Math.PI * 2);
    ctx.arc(p.x + p.w / 2 + 22, p.y + 15, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLeaf(ctx, p) {
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.scale(p.w / 120, p.h / 22);
  ctx.fillStyle = '#7fcf69';
  ctx.beginPath();
  ctx.moveTo(-60, 0);
  ctx.bezierCurveTo(-30, -20, 38, -18, 60, 0);
  ctx.bezierCurveTo(24, 17, -32, 18, -60, 0);
  ctx.fill();
  ctx.strokeStyle = '#4f9d45';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-48, 0);
  ctx.lineTo(48, 0);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1;
  for (let x = -34; x < 38; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + 8, -8, x + 18, -9);
    ctx.stroke();
  }
  ctx.restore();
}


function drawEdamameSeed(ctx, p, elapsed = 0) {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h * 0.68;
  const bob = Math.sin(elapsed * 5.6 + cx * 0.03) * 0.8;
  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(-0.16);
  ctx.fillStyle = 'rgba(121,207,89,0.72)';
  ctx.strokeStyle = 'rgba(63,154,63,0.62)';
  ctx.lineWidth = 1.2;
  roundedRect(ctx, -10, -4, 20, 8, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(169,238,116,0.78)';
  for (const x of [-5, 0, 5]) {
    ctx.beginPath();
    ctx.ellipse(x, 0, 3.2, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(88,170,66,0.64)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(7, -2);
  ctx.quadraticCurveTo(12, -11, 19, -8);
  ctx.stroke();
  ctx.fillStyle = 'rgba(212,255,170,0.68)';
  ctx.beginPath();
  ctx.ellipse(19, -8, 4.2, 2.5, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawVinePlatform(ctx, p, progress = 1, elapsed = 0) {
  const grow = clamp(progress, 0.08, 1);
  const eased = 1 - Math.pow(1 - grow, 3);
  const w = p.w * eased;
  const h = p.h * (0.72 + eased * 0.28);
  const x = p.x + (p.w - w) / 2;
  const y = p.y + p.h - h;
  roundedRect(ctx, x, y, w, h, 9);
  ctx.fillStyle = '#8dd16f';
  ctx.fill();
  ctx.strokeStyle = '#4c9b3e';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = '#4c9b3e';
  ctx.lineWidth = 2;
  const wiggle = Math.sin(elapsed * 9) * 1.5;
  for (let ix = x + 8; ix < x + w - 2; ix += 18) {
    ctx.beginPath();
    ctx.arc(ix, y + 8 + wiggle, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(221,255,178,0.72)';
  for (let ix = x + 10; ix < x + w - 4; ix += 30) {
    ctx.beginPath();
    ctx.ellipse(ix, y + h * 0.5, 7, 4, -0.45, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPage(ctx, p) {
  roundedRect(ctx, p.x, p.y, p.w, p.h, 5);
  ctx.fillStyle = '#f8e7c6';
  ctx.fill();
  ctx.strokeStyle = '#bf8f61';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(167,108,69,0.45)';
  ctx.lineWidth = 1;
  for (let y = p.y + 5; y < p.y + p.h - 3; y += 5) {
    ctx.beginPath();
    ctx.moveTo(p.x + 8, y);
    ctx.quadraticCurveTo(p.x + p.w / 2, y - 2, p.x + p.w - 8, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#ff9fc6';
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawTeacupPlatform(ctx, p) {
  roundedRect(ctx, p.x, p.y + 4, p.w, p.h - 2, 10);
  ctx.fillStyle = '#fff1df';
  ctx.fill();
  ctx.strokeStyle = '#d09a55';
  ctx.lineWidth = 2;
  ctx.stroke();
  roundedRect(ctx, p.x + 4, p.y + 2, p.w - 8, 6, 4);
  ctx.fillStyle = '#f7a7c4';
  ctx.fill();
  ctx.fillStyle = '#ff7faf';
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2, p.y + p.h / 2 + 2, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawDreamWind(ctx, p) {
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

function drawWithPlatformTilt(ctx, p, angle, draw) {
  if (!angle) {
    draw();
    return;
  }
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.rotate(angle);
  ctx.translate(-(p.x + p.w / 2), -(p.y + p.h / 2));
  draw();
  ctx.restore();
}

function getAuthoredTiltMagnitude(p, fallback) {
  return Number.isFinite(p.tilt) ? Math.max(0, Math.abs(p.tilt)) : fallback;
}

function getSpoonRenderTilt(p) {
  const dir = Math.sign(p.spoonSlopeDir || p.slopeDir || 1) || 1;
  return p.visualTilt ?? dir * getAuthoredTiltMagnitude(p, 0.14);
}

function drawSpoonPlatform(ctx, p) {
  const dir = Math.sign(p.spoonSlopeDir || p.slopeDir || 1) || 1;
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (dir < 0) ctx.scale(-1, 1);

  const handleLeft = -p.w / 2 + 7;
  const handleRight = p.w / 2 - 34;
  const bowlX = p.w / 2 - 20;
  const metal = ctx.createLinearGradient(-p.w / 2, -p.h / 2, p.w / 2, p.h / 2);
  metal.addColorStop(0, '#fff3bd');
  metal.addColorStop(0.45, '#d8ad63');
  metal.addColorStop(1, '#fff0b0');

  ctx.fillStyle = metal;
  ctx.strokeStyle = '#9e7032';
  ctx.lineWidth = 2;
  roundedRect(ctx, handleLeft, -3.4, handleRight - handleLeft + 6, 6.8, 4);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(bowlX, 0, 22, Math.max(8, p.h * 0.72), -0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(bowlX - 5, -3.5, 13, 3.2, -0.18, 0, Math.PI * 2);
  ctx.fill();
  roundedRect(ctx, handleLeft + 8, -4.7, Math.max(12, handleRight - handleLeft - 12), 2.4, 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(116,78,34,0.32)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(bowlX + 1, 1.5, 15, Math.max(5, p.h * 0.44), -0.03, 0.15, Math.PI * 1.85);
  ctx.stroke();

  ctx.restore();
}

function drawImagePlatform(ctx, img, x, y, w, h, fallback) {
  if (img) {
    drawSprite(ctx, img, x, y, w, h);
    return;
  }
  fallback();
}

function drawRibbonBridge(ctx, p, img) {
  const growDuration = p.growDuration || 0.38;
  const progress = p.active === false ? 0.92 : (p.growTimer > 0 ? 1 - p.growTimer / growDuration : 1);
  const eased = clamp(progress, 0.12, 1);
  const visualW = p.w * eased + 22;
  const visualH = img ? visualW * (img.height / img.width) : Math.max(38, p.h * 2.6);
  const x = p.x + p.w / 2 - visualW / 2;
  const y = p.y - visualH * 0.33;
  drawImagePlatform(ctx, img, x, y, visualW, visualH, () => {
    roundedRect(ctx, p.x, p.y, p.w, p.h, 9);
    ctx.fillStyle = '#f5a8bf';
    ctx.fill();
    ctx.strokeStyle = '#d56f96';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function drawWaitFlower(ctx, p, img) {
  const pulse = Math.max(0, p.waitFlowerTimer || 0) * 0.08;
  const visualW = p.w + 26 + pulse * p.w;
  const visualH = img ? visualW * (img.height / img.width) : p.h + 64;
  const x = p.x + p.w / 2 - visualW / 2;
  const y = p.y - visualH * 0.36;
  drawImagePlatform(ctx, img, x, y, visualW, visualH, () => {
    ctx.fillStyle = '#ffc4d8';
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, p.h, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}


function drawBalloonGoalCloud(ctx, p, img, glow = false, elapsed = 0) {
  const visualW = Math.max(p.w + 28, 156);
  const visualH = img ? visualW * (img.height / img.width) : 82;
  const x = p.x + p.w / 2 - visualW / 2;
  const y = p.y + p.h - visualH + 8;
  if (glow) {
    drawPlatformGlow(ctx, p.x + p.w / 2, p.y + p.h * 0.32, visualW * 0.62, visualH * 0.42, elapsed, 0.44);
    drawPlatformSparkles(ctx, x, y + visualH * 0.18, visualW, elapsed, 0.5);
  }
  drawImagePlatform(ctx, img, x, y, visualW, visualH, () => {
    drawCloudBlock(ctx, { ...p, x: p.x - 20, y: p.y - 16, w: p.w + 40, h: p.h + 16 }, false);
  });
}

function drawRibbonWind(ctx, p) {
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

export class PlatformRenderer {
  constructor(app) {
    this.app = app;
  }

  render(scene, ctx) {
    for (const p of scene.stage.platforms) {
      const canGhost = p.kind === 'vine' || p.kind === 'wishLeaf' || p.kind === 'page' || p.kind === 'ribbonBridge';
      if (p.active === false && !canGhost) continue;
      const crumbleAlpha = Number.isFinite(p.crumbleTimer) ? clamp(p.crumbleTimer, 0.35, 1) : 1;
      const activeAlpha = p.kind === 'crumble' ? crumbleAlpha : 1;
      const ghostAlpha = p.kind === 'vine' || p.kind === 'ribbonBridge' ? 0.36 : 0.22;
      ctx.save();
      ctx.globalAlpha = p.active === false ? ghostAlpha : activeAlpha;

      if (p.kind === 'jelly') {
        roundedRect(ctx, p.x, p.y, p.w, p.h, 9);
        ctx.fillStyle = '#f2b8d0';
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        roundedRect(ctx, p.x + 6, p.y + 3, p.w - 12, 5, 4);
        ctx.fill();
      } else if (p.kind === 'cloud') {
        drawCloudBlock(ctx, p, false);
      } else if (p.kind === 'sleepCloud') {
        drawCloudBlock(ctx, p, true);
      } else if (p.kind === 'vine' || p.kind === 'wishLeaf') {
        if (p.kind === 'wishLeaf') {
          if (p.active !== false && Number.isFinite(p.wishLeafTimer) && p.wishLeafTimer <= 1.0) {
            ctx.globalAlpha *= Math.sin(scene.elapsed * 30) > 0 ? 0.42 : 1;
          }
          drawLeaf(ctx, p);
        } else if (p.active === false) {
          drawEdamameSeed(ctx, p, scene.elapsed);
        } else {
          const growDuration = p.growDuration || 0.56;
          const growProgress = p.growTimer > 0 ? 1 - p.growTimer / growDuration : 1;
          drawVinePlatform(ctx, p, growProgress, scene.elapsed);
        }
      } else if (p.kind === 'jam' || p.kind === 'jamHard') {
        drawJamBlock(ctx, p, p.kind === 'jamHard');
      } else if (p.kind === 'page') {
        drawPage(ctx, p);
      } else if (p.kind === 'spoon') {
        drawWithPlatformTilt(ctx, p, getSpoonRenderTilt(p), () => drawSpoonPlatform(ctx, p));
      } else if (p.kind === 'teacupSpin') {
        drawWithPlatformTilt(ctx, p, p.visualTilt ?? 0, () => drawTeacupPlatform(ctx, p));
      } else if (p.kind === 'ribbonBridge') {
        drawRibbonBridge(ctx, p, this.app.assets.getImage('platform_ribbon_bridge'));
      } else if (p.kind === 'waitFlower') {
        drawWaitFlower(ctx, p, this.app.assets.getImage('platform_wait_flower'));
      } else if (p.kind === 'ribbonWind') {
        drawRibbonWind(ctx, p);
      } else if (p.kind === 'dreamWind') {
        drawDreamWind(ctx, p);
      } else if (p.kind === 'balloonGoalCloud') {
        const glow = scene.balloonRideSystem?.isActive?.() || scene.balloonRideSystem?.isClearing?.();
        drawBalloonGoalCloud(ctx, p, this.app.assets.getImage('balloon_goal_cloud_pad'), glow, scene.elapsed);
      } else {
        roundedRect(ctx, p.x, p.y, p.w, p.h, 6);
        ctx.fillStyle = p.kind === 'crumble' ? '#d39a55' : '#b48a62';
        ctx.fill();
        roundedRect(ctx, p.x, p.y, p.w, Math.min(12, p.h), 6);
        ctx.fillStyle = p.kind === 'crumble' ? '#f1d091' : '#dcf0c9';
        ctx.fill();
        ctx.fillStyle = '#f6e3bf';
        for (let x = p.x + 8; x < p.x + p.w - 6; x += 16) ctx.fillRect(x, p.y + p.h - 5, 5, 2);
      }
      ctx.restore();
    }
  }
}
