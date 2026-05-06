/**
 * 責務: スイッチ系ギミック本体と専用エフェクトを描画する。
 * 更新ルール: 入力判定・ON/OFF状態変更・対象操作はstage側へ置き、ここでは見た目だけを扱う。
 * 更新ルール: 生成済みPNGアセットを優先して描画し、読み込み失敗時だけ簡易図形へフォールバックする。
 */
import { drawSprite, roundedRect } from './drawSprite.js';

const ROSE_ASSET_KEYS = {
  off: 'switch_glass_rose_off',
  red: 'switch_glass_rose_red',
  blue: 'switch_glass_rose_blue',
  yellow: 'switch_glass_rose_yellow',
};

const NOTE_ASSET_KEYS = [
  'switch_note_pink_large',
  'switch_note_yellow_large',
  'switch_note_green_large',
  'switch_note_cyan_large',
  'switch_note_purple_large',
  'switch_note_orange_large',
];

const FLAME_COLORS = {
  orange: '#ffb74c',
  blue: '#79d9ff',
  pink: '#ff91d1',
  green: '#95ed71',
};

function getBounds(gimmick) {
  return {
    x: gimmick.x,
    y: gimmick.y,
    w: gimmick.w || 40,
    h: gimmick.h || 40,
  };
}

function drawCenteredAsset(ctx, img, rect, options = {}) {
  if (!img) return false;
  const scale = options.scale ?? 1;
  const alpha = options.alpha ?? 1;
  const anchorY = options.anchorY ?? 1;
  const visualH = (options.h ?? rect.h) * scale;
  const visualW = options.w ? options.w * scale : visualH * (img.width / img.height);
  const x = rect.x + rect.w / 2 - visualW / 2 + (options.offsetX || 0);
  const y = rect.y + rect.h * anchorY - visualH + (options.offsetY || 0);
  drawSprite(ctx, img, x, y, visualW, visualH, false, alpha);
  return true;
}

function drawFallbackLabel(ctx, rect, color) {
  ctx.save();
  roundedRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#9f7b48';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawTeaBellFallback(ctx, g, elapsed) {
  const rect = getBounds(g);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const swing = (g.ringTimer || 0) > 0 ? Math.sin(elapsed * 30) * 0.18 : 0;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(swing);
  ctx.fillStyle = '#fff1a6';
  ctx.strokeStyle = '#b58034';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-rect.w * 0.36, rect.h * 0.22);
  ctx.quadraticCurveTo(0, -rect.h * 0.58, rect.w * 0.36, rect.h * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff9ec7';
  ctx.beginPath();
  ctx.arc(0, -rect.h * 0.16, rect.w * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getBellNoteCount(gimmick) {
  const remaining = Math.max(0, gimmick.bellActiveTimer || 0);
  if (remaining <= 0) return 0;
  if (remaining <= 1) return 1;
  if (remaining <= 2) return 2;
  return 3;
}

function drawBellNotes(renderer, ctx, g, scene) {
  const remaining = Math.max(0, g.bellActiveTimer || 0);
  const count = getBellNoteCount(g);
  if (count <= 0) return;

  const rect = getBounds(g);
  const cx = rect.x + rect.w / 2;
  const baseY = rect.y - 10;
  const elapsed = scene.elapsed || 0;
  const noteSpecs = [
    { size: 28, offsetX: -20, offsetY: -24, phase: 0.2, color: '#ff87bc' },
    { size: 22, offsetX: 2, offsetY: -10, phase: 1.0, color: '#ffd56a' },
    { size: 16, offsetX: 22, offsetY: 0, phase: 1.8, color: '#8be36d' },
  ].slice(3 - count);

  noteSpecs.forEach((spec, index) => {
    const key = NOTE_ASSET_KEYS[(Math.floor(elapsed * 8) + index) % NOTE_ASSET_KEYS.length];
    const img = renderer.app.assets.getImage(key);
    const floatY = (scene.elapsed || 0) * (22 + index * 4);
    const sway = Math.sin(elapsed * 4 + spec.phase) * (3 + index);
    const pulse = 1 + Math.sin(elapsed * 6 + spec.phase) * 0.04;
    const x = cx + spec.offsetX + sway;
    const y = baseY + spec.offsetY - (floatY % 18);
    const size = spec.size * pulse;
    if (img) {
      drawSprite(ctx, img, x - size / 2, y - size / 2, size, size);
    } else {
      ctx.fillStyle = spec.color;
      ctx.font = `${size}px sans-serif`;
      ctx.fillText('♪', x - size / 2, y);
    }
  });
}

function drawTeaBell(renderer, ctx, g, scene) {
  const rect = getBounds(g);
  const ring = Math.max(0, g.ringTimer || 0);
  const elapsed = scene.elapsed || 0;
  const arch = renderer.app.assets.getImage('switch_tea_bell_arch');
  const idle = renderer.app.assets.getImage('switch_tea_bell_idle');
  const frameIndex = ring > 0 ? (Math.floor(elapsed * 18) % 4) + 1 : 0;
  const bell = frameIndex > 0
    ? renderer.app.assets.getImage(`switch_tea_bell_swing_${frameIndex}`) || idle
    : idle;

  if (arch && g.showArch !== false) {
    drawCenteredAsset(ctx, arch, rect, { scale: g.archScale || 1.72, offsetY: 8 });
  }

  if (bell) {
    drawCenteredAsset(ctx, bell, rect, { scale: g.bellScale || 1.28, offsetY: 4 });
  } else {
    drawTeaBellFallback(ctx, g, elapsed);
  }

  const switchId = g.switchId || g.id;
  const remaining = renderer.switchState?.getTimedRemaining?.(switchId) || 0;
  const on = remaining > 0 || !!renderer.switchState?.isOn?.(switchId);
  if (on) {
    ctx.save();
    ctx.globalAlpha = remaining > 0 ? Math.min(0.42, 0.16 + remaining * 0.06) : 0.30;
    ctx.fillStyle = '#fff3a3';
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (g.groupRequired > 1) {
    drawProgressPips(ctx, rect, g.groupActiveCount || 0, g.groupRequired, on ? '#fff1a8' : '#d2d6ec');
  }
  drawBellNotes(renderer, ctx, g, scene);
}

function drawGlassRose(renderer, ctx, g) {
  const rect = getBounds(g);
  const color = g.lit ? (g.color || 'red') : 'off';
  const img = renderer.app.assets.getImage(ROSE_ASSET_KEYS[color] || ROSE_ASSET_KEYS.off);
  const ok = drawCenteredAsset(ctx, img, rect, { scale: g.visualScale || 1.22, offsetY: 2 });
  if (!ok) drawFallbackLabel(ctx, rect, g.lit ? '#ffd2dc' : '#e5e8ff');

  if (g.lit || g.fxTimer > 0) {
    const glow = {
      red: 'rgba(255,90,130,0.30)',
      blue: 'rgba(90,190,255,0.30)',
      yellow: 'rgba(255,220,96,0.32)',
    }[g.color] || 'rgba(255,255,255,0.25)';
    ctx.save();
    ctx.globalAlpha = Math.max(0.18, Math.min(0.55, 0.28 + (g.fxTimer || 0)));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + rect.h * 0.46, rect.h * 0.56, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (g.groupRequired > 1) {
    drawProgressPips(ctx, rect, g.groupLitCount || 0, g.groupRequired, g.lit ? '#fff0aa' : '#d2d6ec');
  }
}

function drawRainbowBubble(renderer, ctx, g) {
  const rect = getBounds(g);
  const on = !!g.occupied || !!renderer.switchState?.isOn?.(g.switchId || g.groupId || g.id);
  const key = rect.w <= 42
    ? (on ? 'switch_rainbow_bubble_on_small' : 'switch_rainbow_bubble_idle_small')
    : (on ? 'switch_rainbow_bubble_on' : 'switch_rainbow_bubble_idle');
  const img = renderer.app.assets.getImage(key);
  const ok = drawCenteredAsset(ctx, img, rect, { scale: g.visualScale || 1.12, alpha: on ? 0.92 : 0.62, offsetY: 2 });
  if (!ok) {
    ctx.save();
    ctx.globalAlpha = on ? 0.88 : 0.42;
    ctx.fillStyle = on ? '#ffe0ff' : '#d8efff';
    ctx.strokeStyle = on ? '#ffcf72' : '#9fc8ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  if (g.groupRequired > 1) {
    drawProgressPips(ctx, rect, g.groupOccupiedCount || 0, g.groupRequired, on ? '#fff1a8' : '#c9dcff');
  }
}

function drawCandelabra(renderer, ctx, g, scene) {
  const rect = getBounds(g);
  const body = renderer.app.assets.getImage('switch_magic_candelabra_off');
  const lit = !!g.lit;
  const bodyScale = g.visualScale || 1.52;
  const bodyH = rect.h * bodyScale;
  const bodyW = body ? bodyH * (body.width / body.height) : rect.w * 1.8;
  const bodyX = rect.x + rect.w / 2 - bodyW / 2;
  const bodyY = rect.y + rect.h - bodyH + 4;

  const color = g.flameColor || 'orange';
  if (lit) {
    const litReference = renderer.app.assets.getImage(`switch_magic_candelabra_${color}_lit_reference`);
    if (litReference) drawSprite(ctx, litReference, bodyX, bodyY, bodyW, bodyH, false, 0.32);
  }

  if (body) {
    drawSprite(ctx, body, bodyX, bodyY, bodyW, bodyH);
  } else {
    drawFallbackLabel(ctx, rect, '#fff2d0');
  }

  if (lit) {
    const frame = (Math.floor((scene.elapsed || 0) * 12) % 6) + 1;
    const flame = renderer.app.assets.getImage(`switch_magic_flame_${color}_${frame}`)
      || renderer.app.assets.getImage(`switch_magic_flame_orange_${frame}`);
    const flameColor = FLAME_COLORS[color] || FLAME_COLORS.orange;

    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = flameColor;
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, bodyY + bodyH * 0.20, bodyW * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (flame) {
      const flameH = bodyH * 0.20;
      const flameW = flameH * (flame.width / flame.height);
      const tops = [
        [bodyX + bodyW * 0.22, bodyY + bodyH * 0.16, 0.74],
        [bodyX + bodyW * 0.50, bodyY + bodyH * 0.06, 1.0],
        [bodyX + bodyW * 0.78, bodyY + bodyH * 0.16, 0.74],
      ];
      for (const [cx, cy, s] of tops) {
        drawSprite(ctx, flame, cx - flameW * s / 2, cy - flameH * s, flameW * s, flameH * s);
      }
    }

    if (g.groupRequired > 1) {
      drawProgressPips(ctx, rect, g.groupLitCount || 0, g.groupRequired, flameColor);
    }
  }
}


function drawRibbonSwitch(renderer, ctx, g) {
  const rect = getBounds(g);
  const img = renderer.app.assets.getImage('gimmick_ribbon_switch');
  const visualW = Math.max(50, rect.w * 1.55);
  const visualH = img ? visualW * (img.height / img.width) : Math.max(58, rect.h * 1.45);
  const x = rect.x + rect.w / 2 - visualW / 2;
  const y = rect.y + rect.h - visualH + 4;
  if (img) {
    drawSprite(ctx, img, x, y, visualW, visualH);
  } else {
    drawFallbackLabel(ctx, rect, '#ffd4e5');
  }

  if ((g.fxTimer || 0) > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.5, 0.18 + g.fxTimer);
    ctx.fillStyle = 'rgba(255,209,232,0.48)';
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.64, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawProgressPips(ctx, rect, count, required, color) {
  if (!required || required <= 1) return;
  ctx.save();
  const cx = rect.x + rect.w / 2;
  const y = rect.y - 7;
  const gap = 8;
  for (let i = 0; i < required; i += 1) {
    const x = cx + (i - (required - 1) / 2) * gap;
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = i < count ? color : 'rgba(255,255,255,0.50)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,90,120,0.55)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
}

export class SwitchGimmickRenderer {
  constructor(app) {
    this.app = app;
    this.switchState = null;
  }

  render(scene, ctx) {
    this.switchState = scene.switchState;
    for (const gimmick of scene.stage.switchGimmicks || []) {
      ctx.save();
      if (gimmick.disabled) ctx.globalAlpha = 0.35;
      if (gimmick.kind === 'teaBell') drawTeaBell(this, ctx, gimmick, scene);
      else if (gimmick.kind === 'glassRose') drawGlassRose(this, ctx, gimmick);
      else if (gimmick.kind === 'rainbowBubble') drawRainbowBubble(this, ctx, gimmick);
      else if (gimmick.kind === 'magicCandelabra') drawCandelabra(this, ctx, gimmick, scene);
      else if (gimmick.kind === 'ribbonSwitch') drawRibbonSwitch(this, ctx, gimmick);
      ctx.restore();
    }
  }
}
