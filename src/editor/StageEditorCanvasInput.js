/**
 * 責務: ステージエディタCanvasの入力、ドラッグ、ズーム、ヒットテストを管理する。
 * 更新ルール: 描画処理はStageEditorCanvasViewに置き、ここでは入力からデータ更新への変換だけを追加する。
 */
import { cloneEditorValue, snapToGrid, STAGE_EDITOR_GRID_SIZE, STAGE_EDITOR_VIEW } from './stageEditorSchema.js';
import { createEditorSelectionKey, getEditorCanvasObjectEntries, getEditorHitTestCategoryOrder } from './stageEditorSelection.js';
import { getStageObjectBounds, isFiniteEditorBounds } from './stageEditorObjectMetrics.js';
import { EDITOR_CATEGORY_DEFS } from './stageEditorCatalog.js';
import { moveEditorObjectByDelta } from './stageEditorObjectMutation.js';
import { canResizeEditorObject, getEditorCanvasViewBounds, getEditorVisibleStageRect, getNextEditorCanvasScale, isEditorResizeHandleHit, isInsideBounds, normalizeEditorRectFromPoints, rectsIntersect } from './stageEditorGeometry.js';

export const stageEditorCanvasInputMethods = {
queueResizeRender() {
    cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => this.renderCanvas());
  },

getVisibleStageRect() {
    const shell = this.canvas.parentElement;
    if (!shell) return { x: this.canvasViewBounds.x, y: this.canvasViewBounds.y, w: STAGE_EDITOR_VIEW.width, h: STAGE_EDITOR_VIEW.height };
    return getEditorVisibleStageRect(shell.scrollLeft, shell.scrollTop, shell.clientWidth, shell.clientHeight, this.canvasScale, this.canvasViewBounds);
  },

getMouseStagePoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: this.canvasViewBounds.x + (event.clientX - rect.left) / this.canvasScale,
      y: this.canvasViewBounds.y + (event.clientY - rect.top) / this.canvasScale,
    };
  },

handleCanvasWheel(event) {
    const shell = this.canvas.parentElement;
    if (!shell) return;
    event.preventDefault();
    const beforePoint = this.getMouseStagePoint(event);
    const shellRect = shell.getBoundingClientRect();
    const nextScale = getNextEditorCanvasScale(this.canvasScale, event.deltaY);
    if (nextScale === this.canvasScale) return;
    this.canvasScale = nextScale;
    this.renderCanvas();
    shell.scrollLeft = (beforePoint.x - this.canvasViewBounds.x) * this.canvasScale - (event.clientX - shellRect.left);
    shell.scrollTop = (beforePoint.y - this.canvasViewBounds.y) * this.canvasScale - (event.clientY - shellRect.top);
  },

startCanvasDrag(event) {
    event.preventDefault();
    const point = this.getMouseStagePoint(event);
    const hit = this.hitTest(point.x, point.y);
    const additive = event.shiftKey || event.ctrlKey || event.metaKey;

    if (!hit) {
      this.drag = { mode: 'marquee', start: point, current: point, additive };
      this.marquee = normalizeEditorRectFromPoints(point, point);
      if (!additive) this.selectedItems = [];
      this.renderAll();
      return;
    }

    if (additive && hit && !hit.resize) {
      this.toggleSelectedObject(hit.category, hit.index);
      this.renderAll();
      return;
    }


    const hitKey = createEditorSelectionKey(hit.category, hit.index);
    if (!this.getValidSelectedItems().includes(hitKey) || hit.resize) this.selectSingleObject(hit.category, hit.index);
    else {
      this.selectedCategory = hit.category;
      this.selectedIndex = hit.index;
    }

    const entries = hit.resize
      ? [{ category: hit.category, index: hit.index, object: this.getObjectBySelection(hit.category, hit.index) }]
      : this.getSelectedEntries();
    if (!entries.length) return;
    this.pushHistory();
    this.drag = {
      mode: hit.resize ? 'resize' : 'move',
      start: point,
      entries: entries.map(entry => ({ ...entry, object: cloneEditorValue(entry.object) })),
    };
    this.renderAll();
  },

moveCanvasDrag(event) {
    if (!this.drag) return;
    const point = this.getMouseStagePoint(event);
    if (this.drag.mode === 'marquee') {
      this.drag.current = point;
      this.marquee = normalizeEditorRectFromPoints(this.drag.start, point);
      this.renderCanvas();
      return;
    }
    const dx = snapToGrid(point.x - this.drag.start.x);
    const dy = snapToGrid(point.y - this.drag.start.y);
    if (this.drag.mode === 'resize') {
      const entry = this.drag.entries[0];
      const nextObject = cloneEditorValue(entry.object);
      if (nextObject.w != null && nextObject.h != null) {
        nextObject.w = Math.max(STAGE_EDITOR_GRID_SIZE, snapToGrid(nextObject.w + dx));
        nextObject.h = Math.max(STAGE_EDITOR_GRID_SIZE, snapToGrid(nextObject.h + dy));
        this.setObjectBySelection(entry.category, entry.index, nextObject);
      }
    } else {
      for (const entry of this.drag.entries) {
        this.setObjectBySelection(entry.category, entry.index, moveEditorObjectByDelta(entry.category, entry.object, dx, dy));
      }
    }
    this.renderAll();
  },

endCanvasDrag() {
    if (this.drag?.mode === 'marquee' && this.marquee) {
      const entries = getEditorCanvasObjectEntries(this.stage, { includeAreas: this.selectedCategory === 'areas' })
        .filter(entry => rectsIntersect(this.marquee, entry.bounds));
      if (this.drag.additive) {
        const current = this.getSelectedEntries().map(entry => ({ category: entry.category, index: entry.index }));
        this.setMultiSelection([...current, ...entries]);
      } else {
        this.setMultiSelection(entries);
      }
      this.marquee = null;
      this.drag = null;
      this.renderAll();
      return;
    }
    this.drag = null;
    this.marquee = null;
  },

hitTest(x, y) {
    const selectedObjects = this.getSelectedCollection();
    const selectedObject = selectedObjects[this.selectedIndex];
    const selectedBounds = getStageObjectBounds(this.stage, this.selectedCategory, selectedObject);
    if (selectedBounds && canResizeEditorObject(this.selectedCategory, selectedObject) && isEditorResizeHandleHit(x, y, selectedBounds)) {
      return { category: this.selectedCategory, index: this.selectedIndex, resize: true };
    }

    const order = getEditorHitTestCategoryOrder(this.selectedCategory);
    const bodyHits = [];
    for (const category of order) {
      const objects = category === 'points'
        ? [{ key: 'playerStart', ...this.stage.playerStart }, { key: 'goal', ...this.stage.goal }]
        : (EDITOR_CATEGORY_DEFS[category].singleton ? (this.stage[EDITOR_CATEGORY_DEFS[category].collection] ? [this.stage[EDITOR_CATEGORY_DEFS[category].collection]] : []) : this.stage[EDITOR_CATEGORY_DEFS[category].collection]);
      if (!Array.isArray(objects)) continue;
      for (let index = objects.length - 1; index >= 0; index -= 1) {
        const object = objects[index];
        const bounds = getStageObjectBounds(this.stage, category, object);
        if (!isFiniteEditorBounds(bounds)) continue;
        if (canResizeEditorObject(category, object) && isEditorResizeHandleHit(x, y, bounds)) return { category, index, resize: true };
        if (isInsideBounds(x, y, bounds)) bodyHits.push({ category, index, resize: false });
      }
    }
    return bodyHits[0] || null;
  }
};
