/**
 * 責務: ステージエディタCanvasの描画処理を管理する。
 * 更新ルール: マウス入力やステージデータ更新は持たず、現在状態をCanvasへ描画する処理だけを追加する。
 */
import { STAGE_EDITOR_GRID_SIZE, STAGE_EDITOR_VIEW } from './stageEditorSchema.js';
import { GOAL_DEFAULT_VARIANT, resolveGoalDef } from '../data/goalDefs.js';
import { getEditorItemMetrics, getEditorObjectImageKey, getEditorResidentMetrics, getStageObjectBounds, isFiniteEditorBounds } from './stageEditorObjectMetrics.js';
import { getObjectLabel } from './stageEditorFields.js';
import { canResizeEditorObject, getEditorCanvasViewBounds, HANDLE_DRAW_SIZE } from './stageEditorGeometry.js';

export const stageEditorCanvasViewMethods = {
renderCanvas() {
    const viewBounds = getEditorCanvasViewBounds(this.stage);
    this.canvasViewBounds = viewBounds;
    this.canvas.width = Math.ceil(viewBounds.w * this.canvasScale);
    this.canvas.height = Math.ceil(viewBounds.h * this.canvasScale);
    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.scale(this.canvasScale, this.canvasScale);
    ctx.translate(-viewBounds.x, -viewBounds.y);
    this.drawWorkspace(ctx, viewBounds);
    this.drawBackground(ctx);
    this.drawGrid(ctx, viewBounds);
    this.drawStageBounds(ctx);
    this.drawCameraFrames(ctx);
    this.drawAreas(ctx);
    this.drawObjects(ctx);
    this.drawSelectionMarquee(ctx);
    ctx.restore();
  },

drawWorkspace(ctx, viewBounds) {
    ctx.fillStyle = 'rgba(250, 255, 245, 0.62)';
    ctx.fillRect(viewBounds.x, viewBounds.y, viewBounds.w, viewBounds.h);
  },

drawBackground(ctx) {
    const img = this.getImage(this.stage.backgroundKey);
    if (img?.complete && img.naturalWidth > 0) {
      const pattern = ctx.createPattern(img, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, this.stage.width, this.stage.height);
      }
    } else {
      ctx.fillStyle = '#f9e6ef';
      ctx.fillRect(0, 0, this.stage.width, this.stage.height);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.46)';
    ctx.fillRect(0, 0, this.stage.width, this.stage.height);
  },

drawGrid(ctx, viewBounds) {
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(90, 150, 90, 0.18)';
    const startX = Math.floor(viewBounds.x / STAGE_EDITOR_GRID_SIZE) * STAGE_EDITOR_GRID_SIZE;
    const endX = viewBounds.x + viewBounds.w;
    const startY = Math.floor(viewBounds.y / STAGE_EDITOR_GRID_SIZE) * STAGE_EDITOR_GRID_SIZE;
    const endY = viewBounds.y + viewBounds.h;
    for (let x = startX; x <= endX; x += STAGE_EDITOR_GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, viewBounds.y); ctx.lineTo(x, endY); ctx.stroke();
    }
    for (let y = startY; y <= endY; y += STAGE_EDITOR_GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(viewBounds.x, y); ctx.lineTo(endX, y); ctx.stroke();
    }
  },

drawStageBounds(ctx) {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(64, 96, 64, 0.72)';
    ctx.strokeRect(0, 0, this.stage.width, this.stage.height);
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(64, 96, 64, 0.28)';
    ctx.strokeRect(-0.5, -0.5, this.stage.width + 1, this.stage.height + 1);
    ctx.restore();
  },

drawCameraFrames(ctx) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(96, 90, 130, 0.45)';
    for (let x = 0; x < this.stage.width; x += STAGE_EDITOR_VIEW.width) {
      ctx.strokeRect(x + 0.5, 0.5, STAGE_EDITOR_VIEW.width - 1, STAGE_EDITOR_VIEW.height - 1);
    }
  },

drawAreas(ctx) {
    this.stage.areas.forEach((area, index) => {
      ctx.fillStyle = index % 2 === 0 ? 'rgba(160, 220, 180, 0.10)' : 'rgba(255, 220, 150, 0.12)';
      ctx.fillRect(area.startX, 0, area.endX - area.startX, this.stage.height);
      ctx.strokeStyle = 'rgba(95, 120, 95, 0.72)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(area.startX, 0); ctx.lineTo(area.startX, this.stage.height); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#52624e';
      ctx.font = '12px sans-serif';
      ctx.fillText(area.name || area.id || `area ${index + 1}`, area.startX + 6, 14);
    });
  },

drawObjects(ctx) {
    this.stage.decorations.forEach((object, index) => this.drawCircle(ctx, 'decorations', object, index, 'rgba(255, 255, 255, 0.74)', '#d9b5e6'));
    this.stage.platforms.forEach((object, index) => this.drawRect(ctx, 'platforms', object, index, 'rgba(115, 176, 103, 0.78)', '#477a45'));
    this.stage.doors.forEach((object, index) => this.drawDoorLike(ctx, 'doors', object, index));
    this.stage.switchTargets.forEach((object, index) => this.drawSwitchTarget(ctx, object, index));
    this.stage.switchGimmicks.forEach((object, index) => this.drawSwitchGimmick(ctx, object, index));
    this.stage.specialEvents.forEach((object, index) => this.drawSpecialEvent(ctx, object, index));
    this.stage.items.forEach((object, index) => this.drawItem(ctx, object, index));
    this.drawSelectedResidentMoveRange(ctx);
    this.stage.residents.forEach((object, index) => this.drawResident(ctx, object, index));
    this.stage.checkpoints.forEach((object, index) => this.drawImageOrRect(ctx, 'checkpoints', object, index, 'stage_checkpoint_flag', 'rgba(101, 170, 236, 0.28)', '#346da8'));
    this.stage.balloonRides.forEach((object, index) => this.drawImageOrRect(ctx, 'balloonRides', object, index, 'balloon_ride_start', 'rgba(199, 161, 255, 0.22)', '#7e5eb8'));
    if (this.stage.boss) this.drawBoss(ctx, this.stage.boss, 0);
    this.drawPoint(ctx, 'points', { ...this.stage.playerStart, label: 'START' }, 0, '#4f9e5a');
    this.drawGoal(ctx, { ...this.stage.goal, key: 'goal', label: 'GOAL' }, 1);
  },

isSelected(category, index) {
    return this.isObjectSelected(category, index) || (category === this.selectedCategory && index === this.selectedIndex);
  },

drawSelectionMarquee(ctx) {
    if (!this.marquee) return;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 51, 102, 0.08)';
    ctx.strokeStyle = 'rgba(255, 51, 102, 0.86)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 4]);
    ctx.fillRect(this.marquee.x, this.marquee.y, this.marquee.w, this.marquee.h);
    ctx.strokeRect(this.marquee.x, this.marquee.y, this.marquee.w, this.marquee.h);
    ctx.restore();
  },

drawImage(ctx, imageKey, x, y, w, h, alpha = 1) {
    const img = this.getImage(imageKey);
    if (!img) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    return true;
  },

drawImageBottomAligned(ctx, imageKey, rect, options = {}) {
    const img = this.getImage(imageKey);
    if (!img) return false;
    const visualH = options.h ?? rect.h;
    const visualW = options.w ?? visualH * (img.width / img.height);
    const x = rect.x + rect.w / 2 - visualW / 2 + (options.offsetX || 0);
    const y = rect.y + rect.h - visualH + (options.offsetY || 0);
    return this.drawImage(ctx, imageKey, x, y, visualW, visualH, options.alpha ?? 1);
  },

drawObjectLabel(ctx, category, object, index, bounds) {
    ctx.fillStyle = '#304030';
    ctx.font = '10px sans-serif';
    ctx.fillText(getObjectLabel(category, object, index), bounds.x + 3, Math.max(10, bounds.y - 3));
  },

drawCollisionBounds(ctx, category, object, index, bounds, stroke, fill = 'rgba(255,255,255,0.12)') {
    const selected = this.isSelected(category, index);
    ctx.save();
    ctx.fillStyle = selected ? 'rgba(255,51,102,0.10)' : fill;
    ctx.strokeStyle = selected ? '#ff3366' : stroke;
    ctx.lineWidth = selected ? 3 : 1.2;
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
    ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
    ctx.restore();
    if (selected && canResizeEditorObject(category, object)) this.drawResizeHandle(ctx, bounds);
  },

drawResizeHandle(ctx, bounds) {
    ctx.fillStyle = '#ff3366';
    const handleOffset = HANDLE_DRAW_SIZE / 2;
    ctx.fillRect(bounds.x + bounds.w - handleOffset, bounds.y + bounds.h - handleOffset, HANDLE_DRAW_SIZE, HANDLE_DRAW_SIZE);
  },

drawRect(ctx, category, object, index, fill, stroke) {
    if (!object) return;
    const rect = getStageObjectBounds(this.stage, category, object);
    if (!isFiniteEditorBounds(rect)) return;
    ctx.fillStyle = fill;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    this.drawCollisionBounds(ctx, category, object, index, rect, stroke, 'rgba(255,255,255,0.08)');
    this.drawObjectLabel(ctx, category, object, index, rect);
  },

drawImageOrRect(ctx, category, object, index, imageKey, fill, stroke) {
    if (!object) return;
    const rect = getStageObjectBounds(this.stage, category, object);
    if (!isFiniteEditorBounds(rect)) return;
    const ok = this.drawImageBottomAligned(ctx, imageKey || getEditorObjectImageKey(category, object), rect, { h: rect.h + 10 });
    if (!ok) {
      ctx.fillStyle = fill;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    this.drawCollisionBounds(ctx, category, object, index, rect, stroke);
    this.drawObjectLabel(ctx, category, object, index, rect);
  },

drawDoorLike(ctx, category, object, index) {
    const rect = getStageObjectBounds(this.stage, category, object);
    const imageKey = getEditorObjectImageKey(category, object);
    const ok = this.drawImageBottomAligned(ctx, imageKey, rect, { h: rect.h + 18 });
    if (!ok) {
      ctx.fillStyle = 'rgba(120, 94, 72, 0.35)';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    this.drawCollisionBounds(ctx, category, object, index, rect, '#6d4a37');
    this.drawObjectLabel(ctx, category, object, index, rect);
  },

drawBoss(ctx, object, index) {
    const rect = getStageObjectBounds(this.stage, 'boss', object);
    const visualW = object.drawW ?? rect.w * 1.8;
    const visualH = object.drawH ?? rect.h * 1.45;
    const ok = this.drawImageBottomAligned(ctx, getEditorObjectImageKey('boss', object), rect, { w: visualW, h: visualH });
    if (!ok) {
      ctx.fillStyle = 'rgba(184, 88, 172, 0.32)';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    this.drawCollisionBounds(ctx, 'boss', object, index, rect, '#913d85');
    this.drawObjectLabel(ctx, 'boss', object, index, rect);
  },

drawSwitchTarget(ctx, object, index) {
    const rect = getStageObjectBounds(this.stage, 'switchTargets', object);
    const imageKey = getEditorObjectImageKey('switchTargets', object);
    const img = this.getImage(imageKey);
    let ok = false;
    if (img) {
      const visualH = object.visualH || (object.kind === 'teaChair' ? rect.h * 2.25 : rect.h * 2.05);
      const visualW = object.visualW || visualH * (img.width / img.height);
      ok = this.drawImage(ctx, imageKey, rect.x + rect.w / 2 - visualW / 2 + (object.visualOffsetX || 0), rect.y + rect.h - visualH + (object.visualOffsetY || 3), visualW, visualH, object.active === false ? 0.24 : 1);
    }
    if (!ok) {
      ctx.fillStyle = 'rgba(117, 199, 220, 0.32)';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    this.drawCollisionBounds(ctx, 'switchTargets', object, index, rect, '#407b92');
    this.drawObjectLabel(ctx, 'switchTargets', object, index, rect);
  },

drawSwitchGimmick(ctx, object, index) {
    const rect = getStageObjectBounds(this.stage, 'switchGimmicks', object);
    let ok = false;
    if (object.kind === 'teaBell') {
      const archKey = 'switch_tea_bell_arch';
      const archImg = this.getImage(archKey);
      if (archImg && object.showArch !== false) {
        const archH = rect.h * (object.archScale || 1.72);
        const archW = archH * (archImg.width / archImg.height);
        this.drawImage(ctx, archKey, rect.x + rect.w / 2 - archW / 2, rect.y + rect.h - archH + 8, archW, archH);
      }
      ok = this.drawImageBottomAligned(ctx, 'switch_tea_bell_idle', rect, { h: rect.h * (object.bellScale || 1.28), offsetY: 4 });
    } else if (object.kind === 'glassRose') {
      ok = this.drawImageBottomAligned(ctx, getEditorObjectImageKey('switchGimmicks', object), rect, { h: rect.h * (object.visualScale || 1.22), offsetY: 2 });
    } else if (object.kind === 'rainbowBubble') {
      ok = this.drawImageBottomAligned(ctx, getEditorObjectImageKey('switchGimmicks', object), rect, { h: rect.h * (object.visualScale || 1.12), offsetY: 2, alpha: 0.78 });
    } else if (object.kind === 'magicCandelabra') {
      ok = this.drawImageBottomAligned(ctx, getEditorObjectImageKey('switchGimmicks', object), rect, { h: rect.h * (object.visualScale || 1.52), offsetY: 4 });
    } else if (object.kind === 'ribbonSwitch') {
      const imageKey = getEditorObjectImageKey('switchGimmicks', object);
      const img = this.getImage(imageKey);
      const visualW = Math.max(50, rect.w * 1.55);
      const visualH = img ? visualW * (img.height / img.width) : Math.max(58, rect.h * 1.45);
      ok = this.drawImage(ctx, imageKey, rect.x + rect.w / 2 - visualW / 2, rect.y + rect.h - visualH + 4, visualW, visualH);
    } else {
      ok = this.drawImageBottomAligned(ctx, getEditorObjectImageKey('switchGimmicks', object), rect, { h: rect.h });
    }
    if (!ok) {
      ctx.fillStyle = 'rgba(255, 190, 95, 0.34)';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    this.drawCollisionBounds(ctx, 'switchGimmicks', object, index, rect, '#b56f1d');
    this.drawObjectLabel(ctx, 'switchGimmicks', object, index, rect);
  },

drawSpecialEvent(ctx, object, index) {
    const rect = getStageObjectBounds(this.stage, 'specialEvents', object);
    const imageKey = getEditorObjectImageKey('specialEvents', object);
    const isReinforcement = object.kind === 'residentReinforcement';
    const isGust = object.kind === 'gust';
    const isDeactivateGroup = object.kind === 'deactivateGroup';
    const strokeColor = isReinforcement ? '#c7771d' : isGust ? '#5db8c9' : isDeactivateGroup ? '#7b65c9' : '#c04e86';
    const fillColor = isReinforcement ? 'rgba(255,166,70,0.08)' : isGust ? 'rgba(110,220,240,0.10)' : isDeactivateGroup ? 'rgba(150,120,255,0.10)' : 'rgba(255,255,255,0.08)';
    const ok = !isReinforcement && !isGust && !isDeactivateGroup && this.drawImageBottomAligned(ctx, imageKey, rect, { h: rect.h, alpha: object.active === false ? 0.35 : 1 });
    if (!ok) {
      ctx.fillStyle = isReinforcement ? 'rgba(255, 166, 70, 0.22)' : isGust ? 'rgba(110, 220, 240, 0.26)' : isDeactivateGroup ? 'rgba(150, 120, 255, 0.24)' : 'rgba(255, 135, 180, 0.32)';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    this.drawCollisionBounds(ctx, 'specialEvents', object, index, rect, strokeColor, fillColor);
    if (object.hitbox) {
      const hitbox = {
        x: rect.x + (object.hitbox.x || 0),
        y: rect.y + (object.hitbox.y || 0),
        w: object.hitbox.w || rect.w,
        h: object.hitbox.h || rect.h,
      };
      ctx.save();
      ctx.strokeStyle = 'rgba(192,78,134,0.78)';
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
      ctx.restore();
    }
    this.drawObjectLabel(ctx, 'specialEvents', object, index, rect);
  },

drawItem(ctx, object, index) {
    const rect = getStageObjectBounds(this.stage, 'items', object);
    const metrics = getEditorItemMetrics(object);
    const size = metrics.renderSize;
    const ok = this.drawImage(ctx, metrics.imageKey, object.x - size / 2, object.y - size / 2, size, size);
    if (!ok) {
      ctx.fillStyle = '#f2c94c';
      ctx.beginPath();
      ctx.arc(object.x, object.y, Math.max(6, rect.w / 2), 0, Math.PI * 2);
      ctx.fill();
    }
    this.drawCollisionBounds(ctx, 'items', object, index, rect, '#b58d16', 'rgba(255,255,255,0.08)');
    this.drawObjectLabel(ctx, 'items', object, index, rect);
  },

drawSelectedResidentMoveRange(ctx) {
    if (this.selectedCategory !== 'residents') return;
    const resident = this.getSelectedObject();
    if (!resident) return;
    const metrics = getEditorResidentMetrics(resident);
    const minX = Number.isFinite(resident.minX) ? resident.minX : resident.x - 40;
    const maxX = Number.isFinite(resident.maxX) ? resident.maxX : resident.x + 40;
    const y = resident.y + metrics.h + 6;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,51,102,0.86)';
    ctx.fillStyle = 'rgba(255,51,102,0.86)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(minX, y - 5); ctx.lineTo(minX, y + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(maxX, y - 5); ctx.lineTo(maxX, y + 5); ctx.stroke();
    ctx.font = '10px sans-serif';
    ctx.fillText(`移動範囲 ${Math.round(minX)}-${Math.round(maxX)}`, minX + 4, y - 7);
    ctx.restore();
  },

drawResident(ctx, object, index) {
    const rect = getStageObjectBounds(this.stage, 'residents', object);
    const metrics = getEditorResidentMetrics(object);
    const imageX = rect.x - (metrics.drawW - metrics.w) / 2;
    const imageY = rect.y - (metrics.drawH - metrics.h);
    const ok = this.drawImage(ctx, metrics.imageKey, imageX, imageY, metrics.drawW, metrics.drawH);
    if (!ok) {
      ctx.fillStyle = '#ef7f9a';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    this.drawCollisionBounds(ctx, 'residents', object, index, rect, '#304030', 'rgba(255,255,255,0.08)');
    this.drawObjectLabel(ctx, 'residents', object, index, rect);
  },

drawGoal(ctx, object, index) {
    const rect = getStageObjectBounds(this.stage, 'points', object);
    if (!isFiniteEditorBounds(rect)) return;
    const def = resolveGoalDef(object.variant || GOAL_DEFAULT_VARIANT);
    const imageKey = getEditorObjectImageKey('points', object);
    const ok = imageKey && this.drawImageBottomAligned(ctx, imageKey, rect, def.draw || {});
    if (!ok) this.drawPoint(ctx, 'points', object, index, '#e879a8');
    this.drawCollisionBounds(ctx, 'points', object, index, rect, '#9a4d6d');
    this.drawObjectLabel(ctx, 'points', object, index, rect);
  },

drawPoint(ctx, category, object, index, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = this.isSelected(category, index) ? '#ff3366' : '#304030';
    ctx.lineWidth = this.isSelected(category, index) ? 3 : 1;
    ctx.beginPath();
    ctx.arc(object.x, object.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#304030';
    ctx.font = '10px sans-serif';
    ctx.fillText(object.label || getObjectLabel(category, object, index), object.x + 11, object.y - 8);
  },

drawCircle(ctx, category, object, index, fill, stroke) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = this.isSelected(category, index) ? '#ff3366' : stroke;
    ctx.lineWidth = this.isSelected(category, index) ? 3 : 1;
    ctx.beginPath();
    ctx.arc(object.x, object.y, object.r || 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
};
