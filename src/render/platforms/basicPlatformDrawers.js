/**
 * 責務: 画像アセットを使わない基本足場と通常床スタイルの描画を管理する。
 * 更新ルール: 蔓接続、Wind派生、画像足場の描画はそれぞれ専用モジュールへ置く。
 */
import { clamp } from '../../utils/math.js';
import { roundedRect } from '../drawSprite.js';

export function drawJellyPlatform(ctx, p) {
  roundedRect(ctx, p.x, p.y, p.w, p.h, 9);
  ctx.fillStyle = '#f2b8d0';
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  roundedRect(ctx, p.x + 6, p.y + 3, p.w - 12, 5, 4);
  ctx.fill();
}

const CLASSIC_PLATFORM_STYLE_PRESETS = {
  normal: {
    bodyTop: '#d2b087', bodyMid: '#b48a62', bodyBottom: '#89654b',
    topTop: '#eef6df', topBottom: '#cfe3ba', outline: '#76543d',
    accent: '#f6e8cb', gem: '#fff6df', motif: 'classic', separator: 'rgba(88,56,35,0.18)', notch: 'rgba(88,56,35,0.2)',
  },
  candyForest: {
    bodyTop: '#e7a86c', bodyMid: '#c9824f', bodyBottom: '#945733',
    topTop: '#fff2c5', topBottom: '#f4c576', outline: '#8d5430',
    accent: '#fff0ba', gem: '#ff9fc6', motif: 'candy', separator: 'rgba(143,73,45,0.2)', notch: 'rgba(143,73,45,0.18)',
  },
  teacupCastle: {
    bodyTop: '#fff0d7', bodyMid: '#e7c692', bodyBottom: '#ad7f48',
    topTop: '#fff9f0', topBottom: '#dbeef4', outline: '#9a6d39',
    accent: '#f5bf58', gem: '#ffffff', motif: 'teacup', separator: 'rgba(94,135,157,0.22)', notch: 'rgba(154,109,57,0.2)',
  },
  ribbonGarden: {
    bodyTop: '#f2a8ca', bodyMid: '#d67aa9', bodyBottom: '#9e567d',
    topTop: '#ffe6f0', topBottom: '#f7b7d1', outline: '#954f79',
    accent: '#fff4ad', gem: '#ffeaf3', motif: 'ribbon', separator: 'rgba(143,67,112,0.2)', notch: 'rgba(143,67,112,0.18)',
  },
  plushCloud: {
    bodyTop: '#d7e8fb', bodyMid: '#a8c6e8', bodyBottom: '#7595bf',
    topTop: '#fbfdff', topBottom: '#dcecff', outline: '#6b86ad',
    accent: '#ffffff', gem: '#f4fbff', motif: 'plush', separator: 'rgba(94,125,162,0.2)', notch: 'rgba(94,125,162,0.16)',
  },
  picturebookLibrary: {
    bodyTop: '#c89563', bodyMid: '#9f6844', bodyBottom: '#65412e',
    topTop: '#fff0c8', topBottom: '#e3c68f', outline: '#60412e',
    accent: '#f6dc9f', gem: '#fff4cf', motif: 'book', separator: 'rgba(92,55,33,0.22)', notch: 'rgba(92,55,33,0.2)',
  },
  dreamTree: {
    bodyTop: '#91bf69', bodyMid: '#6f9b4d', bodyBottom: '#4f6f37',
    topTop: '#d8f0a5', topBottom: '#9ecb6f', outline: '#47693a',
    accent: '#dff7b2', gem: '#c8f09b', motif: 'tree', separator: 'rgba(65,94,50,0.22)', notch: 'rgba(65,94,50,0.18)',
  },
};

const CRUMBLE_PLATFORM_STYLE = {
  bodyTop: '#f0bf77', bodyMid: '#d99a55', bodyBottom: '#a86c35',
  topTop: '#f9ddb1', topBottom: '#efbf72', outline: '#835124',
  accent: '#fbe8c5', gem: '#fff2d3', motif: 'classic', separator: 'rgba(88,56,35,0.18)', notch: 'rgba(88,56,35,0.2)',
};


export function drawCandyDots(ctx, p) {
  const colors = ['#ff9fcb', '#ffe07a', '#8fe8ff', '#a9df7f'];
  for (let x = p.x + 18, i = 0; x < p.x + p.w - 10; x += 34, i += 1) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(x, p.y + p.h - 13, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawJamBlock(ctx, p, hardened = false) {
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

export function drawCloudBlock(ctx, p, sleepy = false) {
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

export function drawLeaf(ctx, p) {
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

export function drawEdamameSeed(ctx, p, elapsed = 0) {
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

export function drawVinePlatform(ctx, p, progress = 1, elapsed = 0) {
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

export function drawPage(ctx, p) {
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

export function drawTeacupPlatform(ctx, p) {
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

export function drawWithPlatformTilt(ctx, p, angle, draw) {
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

export function getAuthoredTiltMagnitude(p, fallback) {
  return Number.isFinite(p.tilt) ? Math.max(0, Math.abs(p.tilt)) : fallback;
}

export function getSpoonRenderTilt(p) {
  const dir = Math.sign(p.spoonSlopeDir || p.slopeDir || 1) || 1;
  return p.visualTilt ?? dir * getAuthoredTiltMagnitude(p, 0.14);
}

export function drawSpoonPlatform(ctx, p) {
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

export function getClassicPlatformStyle(styleKey) {
  return CLASSIC_PLATFORM_STYLE_PRESETS[styleKey] || CLASSIC_PLATFORM_STYLE_PRESETS.normal;
}

export function drawPlatformBow(ctx, x, y, size, color, stroke) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - size * 0.62, y - size * 0.38, x - size, y);
  ctx.quadraticCurveTo(x - size * 0.58, y + size * 0.42, x, y);
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + size * 0.62, y - size * 0.38, x + size, y);
  ctx.quadraticCurveTo(x + size * 0.58, y + size * 0.42, x, y);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.6, size * 0.18), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawClassicPlatformMotif(ctx, p, palette, topH, styleKey) {
  const bottomY = p.y + p.h - Math.max(5, p.h * 0.18);
  const motifStep = Math.max(18, Math.min(30, p.w / 4));
  const startX = p.x + motifStep * 0.55;

  if (palette.motif === 'candy') {
    const colors = ['#ff9fc6', '#f6e56e', '#8ee8ff', '#b6ef7e'];
    for (let x = p.x + 12, i = 0; x < p.x + p.w - 8; x += 18, i += 1) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, p.y + Math.min(topH * 0.66, 9), 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (palette.motif === 'teacup') {
    ctx.strokeStyle = '#76a9c3';
    ctx.lineWidth = 1.1;
    for (let x = p.x + 10; x < p.x + p.w - 8; x += 18) {
      ctx.beginPath();
      ctx.arc(x, p.y + topH - 2.5, 5, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#e4b44e';
    for (let x = p.x + 12; x < p.x + p.w - 8; x += 28) ctx.fillRect(x, p.y + 4, 9, 1.6);
  } else if (palette.motif === 'ribbon') {
    for (let x = p.x + 16; x < p.x + p.w - 10; x += 36) {
      drawPlatformBow(ctx, x, p.y + Math.min(topH * 0.62, 9), Math.min(7, Math.max(4, p.h * 0.18)), '#ffe7f0', '#be6996');
    }
  } else if (palette.motif === 'plush') {
    ctx.strokeStyle = 'rgba(96,128,166,0.45)';
    ctx.lineWidth = 1.1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(p.x + 7, p.y + Math.min(topH * 0.68, 9));
    ctx.lineTo(p.x + p.w - 7, p.y + Math.min(topH * 0.68, 9));
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (palette.motif === 'book') {
    ctx.strokeStyle = 'rgba(112,73,45,0.34)';
    ctx.lineWidth = 1;
    for (let y = p.y + 5; y < p.y + topH - 2; y += 4) {
      ctx.beginPath();
      ctx.moveTo(p.x + 8, y);
      ctx.quadraticCurveTo(p.x + p.w / 2, y - 1.2, p.x + p.w - 8, y);
      ctx.stroke();
    }
  } else if (palette.motif === 'tree') {
    ctx.strokeStyle = 'rgba(60,93,45,0.32)';
    ctx.lineWidth = 1;
    for (let x = p.x + 12; x < p.x + p.w - 10; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, p.y + topH + 2);
      ctx.quadraticCurveTo(x + 8, p.y + p.h * 0.62, x - 2, p.y + p.h - 7);
      ctx.stroke();
    }
    ctx.fillStyle = '#d9f5a8';
    for (let x = p.x + 15; x < p.x + p.w - 10; x += 34) {
      ctx.beginPath();
      ctx.ellipse(x, p.y + 6, 4.4, 2.4, -0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (styleKey === 'normal' || palette.motif === 'classic') {
    for (let x = startX; x < p.x + p.w - motifStep * 0.25; x += motifStep) {
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.moveTo(x, bottomY);
      ctx.lineTo(x + 4, bottomY - 2.2);
      ctx.lineTo(x + 8, bottomY);
      ctx.lineTo(x + 4, bottomY + 2.2);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    for (let x = p.x + 8; x < p.x + p.w - 6; x += 16) {
      ctx.fillStyle = palette.gem;
      ctx.fillRect(x, p.y + p.h - 5, 5, 2);
    }
  }
}

export function drawClassicPlatform(ctx, p, crumble = false, styleKey = 'normal') {
  const palette = crumble ? CRUMBLE_PLATFORM_STYLE : getClassicPlatformStyle(styleKey);

  const radius = Math.min(8, Math.max(4, Math.min(p.w, p.h) * 0.16));
  const topH = Math.min(Math.max(10, p.h * 0.3), Math.max(10, p.h - 6));
  const inset = Math.max(2, Math.min(5, p.h * 0.14));

  ctx.save();

  const bodyGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
  bodyGrad.addColorStop(0, palette.bodyTop);
  bodyGrad.addColorStop(0.55, palette.bodyMid);
  bodyGrad.addColorStop(1, palette.bodyBottom);
  roundedRect(ctx, p.x, p.y, p.w, p.h, radius);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.strokeStyle = palette.outline;
  ctx.lineWidth = 1.6;
  roundedRect(ctx, p.x + 0.8, p.y + 0.8, Math.max(1, p.w - 1.6), Math.max(1, p.h - 1.6), Math.max(2, radius - 0.8));
  ctx.stroke();

  const topGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + topH);
  topGrad.addColorStop(0, palette.topTop);
  topGrad.addColorStop(1, palette.topBottom);
  roundedRect(ctx, p.x + 1.5, p.y + 1.5, Math.max(2, p.w - 3), Math.max(4, topH), Math.max(3, radius - 1));
  ctx.fillStyle = topGrad;
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  roundedRect(ctx, p.x + inset + 1, p.y + 3, Math.max(8, p.w - (inset + 1) * 2), Math.max(2, topH * 0.22), Math.max(2, radius - 2));
  ctx.fill();

  const sideShade = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y);
  sideShade.addColorStop(0, 'rgba(255,255,255,0.14)');
  sideShade.addColorStop(0.16, 'rgba(255,255,255,0.05)');
  sideShade.addColorStop(0.84, 'rgba(0,0,0,0.04)');
  sideShade.addColorStop(1, 'rgba(0,0,0,0.16)');
  roundedRect(ctx, p.x + 1.5, p.y + topH - 1, Math.max(2, p.w - 3), Math.max(3, p.h - topH - 1.5), Math.max(2, radius - 1));
  ctx.fillStyle = sideShade;
  ctx.fill();

  ctx.strokeStyle = palette.separator;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x + 3, p.y + topH + 0.5);
  ctx.lineTo(p.x + p.w - 3, p.y + topH + 0.5);
  ctx.stroke();

  drawClassicPlatformMotif(ctx, p, palette, topH, crumble ? 'normal' : styleKey);

  const notchStep = Math.max(20, Math.min(34, p.w / 3));
  for (let x = p.x + notchStep * 0.6; x < p.x + p.w - notchStep * 0.4; x += notchStep) {
    ctx.strokeStyle = palette.notch;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, p.y + topH + 3);
    ctx.lineTo(x, p.y + p.h - 7);
    ctx.stroke();
  }

  if (styleKey === 'normal' || crumble) {
    for (let x = p.x + 8; x < p.x + p.w - 6; x += 16) {
      ctx.fillStyle = palette.gem;
      ctx.fillRect(x, p.y + p.h - 5, 5, 2);
    }
  }

  ctx.restore();
}

