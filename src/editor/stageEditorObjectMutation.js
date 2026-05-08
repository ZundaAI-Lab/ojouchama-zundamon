/**
 * 責務: ステージエディタ上でのオブジェクト配置・移動用の純粋なデータ更新を管理する。
 * 更新ルール: DOM、Canvas、選択状態は持たず、座標更新ルールだけを追加する。
 */
import { cloneEditorValue, snapToGrid, STAGE_EDITOR_GRID_SIZE, STAGE_EDITOR_VIEW } from './stageEditorSchema.js';
import { getStageObjectBounds } from './stageEditorObjectMetrics.js';

export const EDITOR_DUPLICATE_OFFSET = STAGE_EDITOR_GRID_SIZE * 2;

export function placeEditorObjectInVisibleRect(category, object, visibleRect) {
  const next = cloneEditorValue(object);
  const centerX = snapToGrid(visibleRect.x + visibleRect.w / 2);
  const centerY = snapToGrid(visibleRect.y + visibleRect.h / 2);
  const bounds = getStageObjectBounds({ width: 0, height: 0 }, category, next) || { w: next.w || 32, h: next.h || 32 };
  if (category === 'areas') {
    const width = Math.max(STAGE_EDITOR_VIEW.width, (next.endX ?? STAGE_EDITOR_VIEW.width) - (next.startX ?? 0));
    next.startX = snapToGrid(visibleRect.x);
    next.endX = snapToGrid(next.startX + width);
    if (next.respawn) {
      next.respawn.x = snapToGrid(next.startX + 48);
      next.respawn.y = centerY;
    }
    return next;
  }
  if (category === 'balloonRides' && next.start) {
    next.start.x = snapToGrid(centerX - (next.start.w || 38) / 2);
    next.start.y = snapToGrid(centerY - (next.start.h || 94) / 2);
    return next;
  }
  if (category === 'items' || category === 'decorations') {
    next.x = centerX;
    next.y = centerY;
    return next;
  }
  next.x = snapToGrid(centerX - (bounds.w || next.w || 32) / 2);
  next.y = snapToGrid(centerY - (bounds.h || next.h || 32) / 2);
  return next;
}

export function moveEditorObjectByDelta(category, object, dx, dy) {
  const next = cloneEditorValue(object);
  if (category === 'areas') {
    if (Number.isFinite(next.startX)) next.startX = snapToGrid(next.startX + dx);
    if (Number.isFinite(next.endX)) next.endX = snapToGrid(next.endX + dx);
    if (next.respawn) {
      next.respawn.x = snapToGrid((next.respawn.x ?? 0) + dx);
      next.respawn.y = snapToGrid((next.respawn.y ?? 0) + dy);
    }
    return next;
  }
  if (category === 'balloonRides') {
    for (const key of ['start', 'goal']) {
      if (next[key]) {
        next[key].x = snapToGrid((next[key].x ?? 0) + dx);
        next[key].y = snapToGrid((next[key].y ?? 0) + dy);
      }
    }
    if (Array.isArray(next.hazards)) {
      next.hazards = next.hazards.map(hazard => ({
        ...hazard,
        x: Number.isFinite(hazard.x) ? snapToGrid(hazard.x + dx) : hazard.x,
        y: Number.isFinite(hazard.y) ? snapToGrid(hazard.y + dy) : hazard.y,
      }));
    }
    return next;
  }
  next.x = snapToGrid((next.x ?? 0) + dx);
  next.y = snapToGrid((next.y ?? 0) + dy);
  if (category === 'residents') {
    if (Number.isFinite(next.minX)) next.minX = snapToGrid(next.minX + dx);
    if (Number.isFinite(next.maxX)) next.maxX = snapToGrid(next.maxX + dx);
  }
  return next;
}

