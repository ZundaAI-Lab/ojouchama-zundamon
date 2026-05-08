/**
 * 責務: ステージエディタCanvasのズーム、表示範囲、矩形判定、リサイズ判定を管理する。
 * 更新ルール: DOMイベントや描画処理は持たず、Canvas座標計算とヒット補助だけを追加する。
 */
import { STAGE_EDITOR_GRID_SIZE, STAGE_EDITOR_VIEW } from './stageEditorSchema.js';
import { getEditorCanvasObjectEntries } from './stageEditorSelection.js';

export const EDITOR_CANVAS_ZOOM = Object.freeze({
  min: 0.6,
  max: 4,
  defaultScale: 2,
  wheelStep: 1.12,
});
export const HANDLE_DRAW_SIZE = 8;
const HANDLE_HIT_SIZE = 12;
export const EDITOR_CANVAS_OUTSIDE_MARGIN = 240;
const RECT_COLLECTIONS = new Set(['platforms', 'checkpoints', 'doors', 'switchGimmicks', 'switchTargets', 'specialEvents']);

export function clampEditorCanvasScale(value) {
  return Math.max(EDITOR_CANVAS_ZOOM.min, Math.min(EDITOR_CANVAS_ZOOM.max, value));
}

export function getNextEditorCanvasScale(currentScale, wheelDeltaY) {
  const factor = wheelDeltaY < 0 ? EDITOR_CANVAS_ZOOM.wheelStep : 1 / EDITOR_CANVAS_ZOOM.wheelStep;
  return clampEditorCanvasScale(currentScale * factor);
}

export function rectsIntersect(a, b) {
  return a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y;
}

export function normalizeEditorRectFromPoints(a, b) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) };
}

export function getEditorCanvasViewBounds(stage, margin = EDITOR_CANVAS_OUTSIDE_MARGIN) {
  const entries = getEditorCanvasObjectEntries(stage, { includeAreas: true, includePoints: true });
  let minX = 0;
  let minY = 0;
  let maxX = Math.max(STAGE_EDITOR_VIEW.width, stage.width || 0);
  let maxY = Math.max(STAGE_EDITOR_VIEW.height, stage.height || 0);
  for (const entry of entries) {
    minX = Math.min(minX, entry.bounds.x);
    minY = Math.min(minY, entry.bounds.y);
    maxX = Math.max(maxX, entry.bounds.x + entry.bounds.w);
    maxY = Math.max(maxY, entry.bounds.y + entry.bounds.h);
  }
  const x = Math.floor((minX - margin) / STAGE_EDITOR_GRID_SIZE) * STAGE_EDITOR_GRID_SIZE;
  const y = Math.floor((minY - margin) / STAGE_EDITOR_GRID_SIZE) * STAGE_EDITOR_GRID_SIZE;
  const right = Math.ceil((maxX + margin) / STAGE_EDITOR_GRID_SIZE) * STAGE_EDITOR_GRID_SIZE;
  const bottom = Math.ceil((maxY + margin) / STAGE_EDITOR_GRID_SIZE) * STAGE_EDITOR_GRID_SIZE;
  return { x, y, w: Math.max(STAGE_EDITOR_VIEW.width, right - x), h: Math.max(STAGE_EDITOR_VIEW.height, bottom - y) };
}

export function getEditorVisibleStageRect(scrollLeft, scrollTop, clientWidth, clientHeight, scale, viewBounds) {
  return {
    x: viewBounds.x + scrollLeft / scale,
    y: viewBounds.y + scrollTop / scale,
    w: clientWidth / scale,
    h: clientHeight / scale,
  };
}

export function isInsideBounds(x, y, bounds) {
  return x >= bounds.x && x <= bounds.x + bounds.w && y >= bounds.y && y <= bounds.y + bounds.h;
}

export function canResizeEditorObject(category, object) {
  if (!object || ['points', 'areas', 'items', 'residents', 'decorations', 'balloonRides'].includes(category)) return false;
  if (category === 'boss') return true;
  return RECT_COLLECTIONS.has(category) && object.w != null && object.h != null;
}

export function getEditorResizeHandleBounds(bounds) {
  const size = HANDLE_HIT_SIZE;
  return {
    x: bounds.x + bounds.w - size / 2,
    y: bounds.y + bounds.h - size / 2,
    w: size,
    h: size,
  };
}

export function isEditorResizeHandleHit(x, y, bounds) {
  return isInsideBounds(x, y, getEditorResizeHandleBounds(bounds));
}

