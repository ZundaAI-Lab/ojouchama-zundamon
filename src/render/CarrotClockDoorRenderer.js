/**
 * 責務: にんじん時計扉の画像、時計針、正解時刻マーカー、時刻一致時の発光を描画する。
 * 更新ルール: 時刻状態や入力判定はCarrotClockDoorSystemへ置き、ここではdoor.clockTime/clockHandDisplayなどの描画用状態だけを読む。
 * 更新ルール: 長針は時計扉の時刻状態に追従して回転し、短針はdoor.hourHandTimeで指定された固定位置を描画する。
 */
import { drawSprite, roundedRect } from './drawSprite.js';
import { normalizeClockModulo } from '../stage/CarrotClockDoorSystem.js';

function getVisualRect(img, door) {
  const visualH = door.visualH || door.h + 42;
  const visualW = door.visualW || (img ? visualH * (img.width / img.height) : door.w + 48);
  return {
    x: door.x + door.w / 2 - visualW / 2,
    y: door.y + door.h - visualH,
    w: visualW,
    h: visualH,
  };
}

function getClockFace(door, visualRect) {
  const cx = visualRect.x + visualRect.w * (door.clockCenterXRatio ?? 0.5);
  const cy = visualRect.y + visualRect.h * (door.clockCenterYRatio ?? 0.235) + (door.clockCenterYOffset ?? 6);
  const r = visualRect.w * (door.clockRadiusRatio ?? 0.105);
  return { cx, cy, r };
}

function normalizeDisplayTime(value, modulo) {
  const number = Number.isFinite(value) ? value : 0;
  return ((number % modulo) + modulo) % modulo;
}

function angleForTime(value, modulo) {
  return normalizeDisplayTime(value, modulo) / modulo * Math.PI * 2 - Math.PI / 2;
}

function drawClockHand(ctx, cx, cy, angle, length, width, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  ctx.stroke();
  ctx.restore();
}

function drawTargetMarker(ctx, face, door, modulo) {
  const angle = angleForTime(door.clockTargetTime ?? door.targetTime ?? 0, modulo);
  const x = face.cx + Math.cos(angle) * face.r * 0.82;
  const y = face.cy + Math.sin(angle) * face.r * 0.82;
  ctx.save();
  ctx.fillStyle = '#ffe27a';
  ctx.strokeStyle = '#a86f35';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(2.5, face.r * 0.13), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function getHourHandTime(door) {
  if (Number.isFinite(door.hourHandTime)) return door.hourHandTime;
  if (Number.isFinite(door.shortHandTime)) return door.shortHandTime;
  if (Number.isFinite(door.initialTime)) return door.initialTime;
  return 0;
}

function drawClockOverlay(ctx, door, visualRect) {
  const modulo = normalizeClockModulo(door);
  const face = getClockFace(door, visualRect);
  const display = Number.isFinite(door.clockHandDisplay) ? door.clockHandDisplay : (door.clockTime || 0);
  const minuteAngle = angleForTime(display, modulo);
  const hourAngle = angleForTime(getHourHandTime(door), 12);

  drawTargetMarker(ctx, face, door, modulo);

  if (door.clockMatched) {
    ctx.save();
    ctx.globalAlpha = 0.36;
    ctx.fillStyle = '#fff2a8';
    ctx.beginPath();
    ctx.arc(face.cx, face.cy, face.r * 1.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawClockHand(ctx, face.cx, face.cy, hourAngle, face.r * 0.45, Math.max(2.4, face.r * 0.11), '#a36a45');
  drawClockHand(ctx, face.cx, face.cy, minuteAngle, face.r * 0.72, Math.max(2.0, face.r * 0.09), '#db6489');

  ctx.save();
  ctx.fillStyle = '#e7839f';
  ctx.strokeStyle = '#9f6842';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(face.cx, face.cy, Math.max(2.5, face.r * 0.12), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFallbackDoor(ctx, door) {
  roundedRect(ctx, door.x, door.y, door.w, door.h, 12);
  ctx.fillStyle = door.open ? '#d2f2d7' : '#f7d6e4';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = door.open ? '#8bc89d' : '#dd95b2';
  ctx.stroke();
}

export function renderCarrotClockDoor(renderer, ctx, door) {
  const img = renderer.app.assets.getImage(door.imageKey || 'gimmick_carrot_clock_gate');
  const visualRect = getVisualRect(img, door);
  ctx.save();
  ctx.globalAlpha = door.open ? 0.38 : 1;
  if (img) drawSprite(ctx, img, visualRect.x, visualRect.y, visualRect.w, visualRect.h);
  else drawFallbackDoor(ctx, door);
  ctx.restore();

  drawClockOverlay(ctx, door, visualRect);

  if (door.blockedByActor) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    roundedRect(ctx, door.x + 8, door.y + 8, door.w - 16, 8, 4);
    ctx.fill();
    ctx.restore();
  }
}
