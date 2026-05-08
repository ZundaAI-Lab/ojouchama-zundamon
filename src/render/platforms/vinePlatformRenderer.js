/**
 * 責務: vinePlatform系の接続判定と蔓足場描画を管理する。
 * 更新ルール: 足場状態の更新や当たり判定は持たず、接続済みの見た目だけを追加する。
 */
import { clamp } from '../../utils/math.js';
import { roundedRect } from '../drawSprite.js';

const VINE_PLATFORM_KIND = 'vinePlatform';
const VINE_CONNECTION_EPSILON = 0.75;

export function isVinePlatform(platform) {
  return platform?.kind === VINE_PLATFORM_KIND && platform.active !== false;
}

export function getRangeOverlap(a0, a1, b0, b1) {
  const start = Math.max(a0, b0);
  const end = Math.min(a1, b1);
  return end > start ? { start, end, center: (start + end) / 2 } : null;
}

export function isTouchingEdge(a, b, side) {
  if (side === 'left') return Math.abs(a.x - (b.x + b.w)) <= VINE_CONNECTION_EPSILON;
  if (side === 'right') return Math.abs((a.x + a.w) - b.x) <= VINE_CONNECTION_EPSILON;
  if (side === 'up') return Math.abs(a.y - (b.y + b.h)) <= VINE_CONNECTION_EPSILON;
  return Math.abs((a.y + a.h) - b.y) <= VINE_CONNECTION_EPSILON;
}

export function getVinePlatformConnections(platform, platforms = []) {
  const connections = { left: [], right: [], up: [], down: [] };
  for (const other of platforms) {
    if (other === platform || !isVinePlatform(other)) continue;

    const verticalOverlap = getRangeOverlap(platform.y, platform.y + platform.h, other.y, other.y + other.h);
    if (verticalOverlap) {
      if (isTouchingEdge(platform, other, 'left')) connections.left.push(verticalOverlap.center);
      if (isTouchingEdge(platform, other, 'right')) connections.right.push(verticalOverlap.center);
    }

    const horizontalOverlap = getRangeOverlap(platform.x, platform.x + platform.w, other.x, other.x + other.w);
    if (horizontalOverlap) {
      if (isTouchingEdge(platform, other, 'up')) connections.up.push(horizontalOverlap.center);
      if (isTouchingEdge(platform, other, 'down')) connections.down.push(horizontalOverlap.center);
    }
  }
  return connections;
}

export function hasVineConnection(connections, side) {
  return connections[side]?.length > 0;
}

export function getVineThickness(p) {
  return clamp(Math.min(p.w, p.h) * 0.72, 7, 24);
}

const VINE_RENDER_STYLE_PRESETS = {
  current: {
    stemOutline: '#2f7534',
    stemMain: '#64b856',
    stemHighlight: 'rgba(206,255,168,0.82)',
    tipStart: '#4a9a3d',
    tipEnd: '#69bd56',
    leafFill: 'rgba(181,238,118,0.86)',
    leafStroke: 'rgba(71,140,55,0.62)',
    leafDensity: 1,
    leafShape: 'oval',
    flowerChance: 0,
    podChance: 0,
    thornChance: 0,
  },
  withered: {
    stemOutline: '#715433',
    stemMain: '#a88757',
    stemHighlight: 'rgba(216,195,150,0.6)',
    tipStart: '#86623b',
    tipEnd: '#b99361',
    leafFill: 'rgba(184,151,94,0.78)',
    leafStroke: 'rgba(109,80,45,0.68)',
    leafDensity: 0.58,
    leafShape: 'dry',
    flowerChance: 0,
    podChance: 0,
    thornChance: 0.08,
  },
  bean: {
    stemOutline: '#276f36',
    stemMain: '#70c85b',
    stemHighlight: 'rgba(230,255,185,0.88)',
    tipStart: '#4fa948',
    tipEnd: '#79d464',
    leafFill: 'rgba(168,232,96,0.94)',
    leafStroke: 'rgba(57,132,50,0.7)',
    leafDensity: 1.34,
    leafShape: 'beanstalk',
    flowerChance: 0,
    podChance: 0,
    thornChance: 0,
    tendrilChance: 0.42,
  },
  rose: {
    stemOutline: '#255f31',
    stemMain: '#4f9647',
    stemHighlight: 'rgba(190,236,170,0.72)',
    tipStart: '#468d3e',
    tipEnd: '#63ac50',
    leafFill: 'rgba(90,61,45,0.92)',
    leafStroke: 'rgba(55,38,31,0.82)',
    leafDensity: 1.16,
    leafShape: 'thorn',
    flowerChance: 0,
    podChance: 0,
    thornChance: 1,
  },
};

export function getVineRenderStyle(styleKey) {
  return VINE_RENDER_STYLE_PRESETS[styleKey] || VINE_RENDER_STYLE_PRESETS.current;
}

export function strokeVinePath(ctx, drawPath, thickness, elapsed = 0, style = VINE_RENDER_STYLE_PRESETS.current) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = style.stemOutline;
  ctx.lineWidth = thickness + 3;
  ctx.beginPath();
  drawPath(ctx, 0);
  ctx.stroke();
  ctx.strokeStyle = style.stemMain;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  drawPath(ctx, Math.sin(elapsed * 2.5) * 0.9);
  ctx.stroke();
  ctx.strokeStyle = style.stemHighlight;
  ctx.lineWidth = Math.max(2, thickness * 0.24);
  ctx.beginPath();
  drawPath(ctx, Math.cos(elapsed * 3.1) * 0.65);
  ctx.stroke();
  ctx.restore();
}

export function drawVineLeaf(ctx, thickness, style) {
  ctx.beginPath();
  if (style.leafShape === 'dry') {
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(thickness * 0.36, -thickness * 0.16, thickness * 0.58, 0);
    ctx.quadraticCurveTo(thickness * 0.4, thickness * 0.2, 0, 0);
  } else if (style.leafShape === 'beanstalk') {
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(thickness * 0.2, -thickness * 0.38, thickness * 0.78, -thickness * 0.4, thickness * 1.04, -thickness * 0.08);
    ctx.bezierCurveTo(thickness * 0.74, thickness * 0.34, thickness * 0.26, thickness * 0.32, 0, 0);
  } else if (style.leafShape === 'thorn') {
    ctx.moveTo(0, 0);
    ctx.lineTo(thickness * 0.56, -thickness * 0.18);
    ctx.lineTo(thickness * 0.14, thickness * 0.2);
    ctx.closePath();
  } else {
    ctx.ellipse(thickness * 0.42, 0, thickness * 0.42, thickness * 0.18, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
}

export function drawVineBeanPod(ctx, x, y, angle, thickness, style) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = 'rgba(142,214,104,0.92)';
  ctx.strokeStyle = style.stemOutline;
  ctx.lineWidth = 1;
  roundedRect(ctx, 0, -thickness * 0.11, thickness * 0.9, thickness * 0.22, thickness * 0.18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(206,247,157,0.82)';
  for (const offset of [thickness * 0.22, thickness * 0.45, thickness * 0.68]) {
    ctx.beginPath();
    ctx.ellipse(offset, 0, thickness * 0.09, thickness * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawBeanstalkTendril(ctx, x, y, angle, thickness, style, side) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + side * Math.PI / 2);
  ctx.strokeStyle = style.stemMain;
  ctx.lineWidth = Math.max(1.1, thickness * 0.11);
  ctx.lineCap = 'round';
  ctx.beginPath();
  const r = thickness * 0.24;
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(side * thickness * 0.36, -thickness * 0.18, side * thickness * 0.46, -thickness * 0.52);
  for (let i = 0; i < 10; i += 1) {
    const t = i / 9;
    const a = Math.PI * 2.1 * t;
    const rr = r * (1 - t * 0.58);
    ctx.lineTo(side * thickness * 0.46 + Math.cos(a) * rr, -thickness * 0.52 + Math.sin(a) * rr);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawVineThorn(ctx, x, y, angle, thickness, style, side = 1) {
  if (!style.thornChance) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(1, side);
  ctx.fillStyle = style.leafFill || style.stemOutline;
  ctx.strokeStyle = style.leafStroke || style.stemOutline;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(thickness * 0.62, -thickness * 0.22);
  ctx.lineTo(thickness * 0.16, thickness * 0.24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawVineDecoration(ctx, x, y, angle, thickness, elapsed, index, style) {
  const sway = Math.sin(elapsed * 4 + index * 1.7) * 0.28;
  const side = index % 2 === 0 ? 1 : -1;
  const branchAngle = angle + side * (Math.PI / 2 + 0.36 + sway);

  if (style.leafShape === 'thorn') {
    drawVineThorn(ctx, x, y, angle + side * 0.34, thickness * 0.9, style, side);
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(branchAngle);
  ctx.translate(thickness * 0.08, 0);
  ctx.fillStyle = style.leafFill;
  ctx.strokeStyle = style.leafStroke;
  ctx.lineWidth = 1;
  drawVineLeaf(ctx, thickness, style);
  ctx.restore();

  if (style.podChance && index % 3 === 1) {
    const podAngle = branchAngle + side * 0.18;
    drawVineBeanPod(ctx, x + Math.cos(branchAngle) * thickness * 0.28, y + Math.sin(branchAngle) * thickness * 0.28, podAngle, thickness * 0.88, style);
  }
  if (style.tendrilChance && index % 3 === 1) {
    drawBeanstalkTendril(ctx, x, y, angle, thickness, style, side);
  }
  if (style.thornChance && index % 2 === 0) {
    drawVineThorn(ctx, x, y, angle + side * 0.3, thickness * 0.72, style, side);
  }
}

export function drawSpiralVineTip(ctx, x, y, angle, thickness, style = VINE_RENDER_STYLE_PRESETS.current) {
  const size = clamp(thickness * 1.55, 10, 24);
  const centerX = size * 0.58;
  const turns = Math.PI * 2.45;
  const steps = 28;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < steps; i += 1) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const a0 = Math.PI + turns * t0;
    const a1 = Math.PI + turns * t1;
    const r0 = size * 0.58 * (1 - t0) + 1.2;
    const r1 = size * 0.58 * (1 - t1) + 1.2;
    ctx.strokeStyle = i < steps * 0.5 ? style.tipStart : style.tipEnd;
    ctx.lineWidth = Math.max(1.1, thickness * (0.64 - t0 * 0.48));
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(a0) * r0, Math.sin(a0) * r0);
    ctx.lineTo(centerX + Math.cos(a1) * r1, Math.sin(a1) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

export function isNearConnection(value, connections, margin) {
  return connections.some((point) => Math.abs(point - value) < margin);
}

export function drawHorizontalVinePlatform(ctx, p, connections, elapsed, style) {
  const thickness = getVineThickness(p);
  const centerY = p.y + p.h / 2;
  const leftConnected = hasVineConnection(connections, 'left');
  const rightConnected = hasVineConnection(connections, 'right');
  const tipInset = clamp(thickness * 1.05, 8, Math.max(8, p.w / 3));
  const startX = leftConnected ? p.x : p.x + tipInset;
  const endX = rightConnected ? p.x + p.w : p.x + p.w - tipInset;
  const wave = Math.min(5, p.h * 0.18);

  strokeVinePath(ctx, (path, wiggle) => {
    path.moveTo(startX, centerY + wiggle);
    const span = Math.max(1, endX - startX);
    path.bezierCurveTo(startX + span * 0.28, centerY - wave + wiggle, startX + span * 0.72, centerY + wave + wiggle, endX, centerY - wiggle);
  }, thickness, elapsed, style);

  if (!leftConnected) drawSpiralVineTip(ctx, startX, centerY, Math.PI, thickness, style);
  if (!rightConnected) drawSpiralVineTip(ctx, endX, centerY, 0, thickness, style);

  const step = clamp((thickness * 2.4) / Math.max(0.45, style.leafDensity || 1), 24, 54);
  const connectionMargin = clamp(thickness * 1.4, 12, 24);
  const blockedX = [...connections.up, ...connections.down];
  let leafIndex = 0;
  for (let x = p.x + step; x < p.x + p.w - step * 0.65; x += step) {
    if (isNearConnection(x, blockedX, connectionMargin)) continue;
    drawVineDecoration(ctx, x, centerY + Math.sin((x + elapsed * 30) * 0.04) * 2, 0, thickness * 0.92, elapsed, leafIndex, style);
    leafIndex += 1;
  }
}

export function drawVerticalVinePlatform(ctx, p, connections, elapsed, style) {
  const thickness = getVineThickness(p);
  const centerX = p.x + p.w / 2;
  const upConnected = hasVineConnection(connections, 'up');
  const downConnected = hasVineConnection(connections, 'down');
  const tipInset = clamp(thickness * 1.05, 8, Math.max(8, p.h / 3));
  const startY = upConnected ? p.y : p.y + tipInset;
  const endY = downConnected ? p.y + p.h : p.y + p.h - tipInset;
  const wave = Math.min(5, p.w * 0.18);

  strokeVinePath(ctx, (path, wiggle) => {
    path.moveTo(centerX + wiggle, startY);
    const span = Math.max(1, endY - startY);
    path.bezierCurveTo(centerX - wave + wiggle, startY + span * 0.28, centerX + wave + wiggle, startY + span * 0.72, centerX - wiggle, endY);
  }, thickness, elapsed, style);

  if (!upConnected) drawSpiralVineTip(ctx, centerX, startY, -Math.PI / 2, thickness, style);
  if (!downConnected) drawSpiralVineTip(ctx, centerX, endY, Math.PI / 2, thickness, style);

  const step = clamp((thickness * 2.4) / Math.max(0.45, style.leafDensity || 1), 24, 54);
  const connectionMargin = clamp(thickness * 1.4, 12, 24);
  const blockedY = [...connections.left, ...connections.right];
  let leafIndex = 0;
  for (let y = p.y + step; y < p.y + p.h - step * 0.65; y += step) {
    if (isNearConnection(y, blockedY, connectionMargin)) continue;
    drawVineDecoration(ctx, centerX + Math.sin((y + elapsed * 30) * 0.04) * 2, y, Math.PI / 2, thickness * 0.92, elapsed, leafIndex, style);
    leafIndex += 1;
  }
}

export function drawCircularVinePlatform(ctx, p, elapsed, style) {
  const size = Math.min(p.w, p.h);
  const thickness = clamp(size * 0.16, 5, 12);
  const inset = clamp(thickness * 1.05, 6, Math.max(6, size * 0.18));
  const left = p.x + inset;
  const top = p.y + inset;
  const right = p.x + p.w - inset;
  const bottom = p.y + p.h - inset;
  const radius = Math.max(4, Math.min((right - left), (bottom - top)) * 0.22);

  strokeVinePath(ctx, (path, wiggle) => {
    path.moveTo(left + radius * 0.7, top + wiggle * 0.2);
    path.lineTo(right - radius, top + wiggle * 0.2);
    path.quadraticCurveTo(right, top, right, top + radius);
    path.lineTo(right, bottom - radius);
    path.quadraticCurveTo(right, bottom, right - radius, bottom);
    path.lineTo(left + radius, bottom);
    path.quadraticCurveTo(left, bottom, left, bottom - radius);
    path.lineTo(left, top + radius * 1.15);
  }, thickness, elapsed, style);

  drawSpiralVineTip(ctx, left + radius * 0.7, top, Math.PI, thickness * 0.92, style);
  drawSpiralVineTip(ctx, left, top + radius * 1.15, -Math.PI / 2, thickness * 0.92, style);
  drawVineDecoration(ctx, right - radius * 0.35, top + radius * 0.6, -0.2, thickness * 0.84, elapsed, 0, style);
  drawVineDecoration(ctx, left + radius * 0.95, bottom - radius * 0.5, Math.PI * 0.75, thickness * 0.84, elapsed, 1, style);
}

export function drawConnectedVinePlatform(ctx, p, platforms, elapsed = 0, styleKey = 'current') {
  const connections = getVinePlatformConnections(p, platforms);
  const style = getVineRenderStyle(styleKey);
  if (Math.abs(p.w - p.h) <= VINE_CONNECTION_EPSILON) {
    drawCircularVinePlatform(ctx, p, elapsed, style);
    return;
  }
  if (p.w > p.h) {
    drawHorizontalVinePlatform(ctx, p, connections, elapsed, style);
    return;
  }
  drawVerticalVinePlatform(ctx, p, connections, elapsed, style);
}

