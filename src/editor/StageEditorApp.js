/**
 * 責務: editor.html専用のステージ編集UI、履歴、キャンバス配置編集、出力操作を統括する。
 * 更新ルール: ゲーム本体Runtimeの生成責務は持たず、プレビューはstageEditorPreviewBridge経由で一時ステージを渡すだけにする。
 * 更新ルール: ゴール種類の画像・寸法はgoalDefsを参照し、エディタ内に個別定義を重複させない。
 */
import { STAGES, STAGE_ROUTES } from '../data/stages.js';
import { normalizeStageDefinition } from '../data/stageSchema.js';
import { createEditorStage, cloneEditorValue, snapToGrid, STAGE_EDITOR_GRID_SIZE, STAGE_EDITOR_VIEW } from './stageEditorSchema.js';
import { EDITOR_BACKGROUND_KEYS, EDITOR_CATEGORY_DEFS, EDITOR_OBJECT_PRESETS, EDITOR_FIELD_GROUPS, EDITOR_DIALOGUE_DEFAULT_LINE, EDITOR_DIALOGUE_DEFS, EDITOR_DIALOGUE_PORTRAIT_OPTIONS, getEditorFieldGroupsForObject, getResidentDefinitionValue } from './stageEditorCatalog.js';
import { ASSET_MANIFEST } from '../data/assetManifest.js';
import { ITEM_DEFS } from '../data/itemDefs.js';
import { RESIDENT_DEFS } from '../data/residentDefs.js';
import { GOAL_DEFAULT_VARIANT, GOAL_VARIANT_OPTIONS, resolveGoalDef } from '../data/goalDefs.js';
import { hasValidationErrors, validateEditorStage } from './stageEditorValidation.js';
import { createStageDownloadName, parseStageJson, resolveStageSourcePath, serializeStageToJsModule, serializeStageToJson } from './stageEditorSerializer.js';
import { writeStageEditorPreview } from './stageEditorPreviewBridge.js';

export const EDITOR_CANVAS_ZOOM = Object.freeze({
  min: 0.6,
  max: 4,
  defaultScale: 2,
  wheelStep: 1.12,
});
const HANDLE_DRAW_SIZE = 8;
const HANDLE_HIT_SIZE = 12;
export const EDITOR_CANVAS_OUTSIDE_MARGIN = 240;
export const EDITOR_DUPLICATE_OFFSET = STAGE_EDITOR_GRID_SIZE * 2;
const EDITABLE_COLLECTIONS = Object.keys(EDITOR_CATEGORY_DEFS);
// ヒット判定は選択中カテゴリを最優先にし、背景扱いのareasはareas編集時だけ拾う。
const HIT_TEST_FALLBACK_ORDER = Object.freeze([
  'points',
  'boss',
  'specialEvents',
  'balloonRides',
  'switchGimmicks',
  'switchTargets',
  'doors',
  'checkpoints',
  'residents',
  'items',
  'decorations',
  'platforms',
]);
const RECT_COLLECTIONS = new Set(['platforms', 'checkpoints', 'doors', 'switchGimmicks', 'switchTargets', 'specialEvents']);
const POINT_COLLECTIONS = new Set(['items', 'residents', 'decorations']);
const JSON_FIELDS = new Set(['triggerBy', 'behaviorParams', 'config', 'hazards', 'start', 'goal', 'respawn', 'route', 'residents', 'clockInputs']);
const RESIDENT_TYPE_RESET_KEEP_KEYS = new Set(['x', 'y', 'minX', 'maxX']);
const PLATFORM_KIND_RESET_KEEP_KEYS = new Set(['x', 'y', 'w', 'h', 'active', 'switchId', 'activeWhenOn']);
const SPECIAL_EVENT_KIND_RESET_KEEP_KEYS = new Set(['id', 'groupId', 'active', 'x', 'y', 'w', 'h']);

const SWITCH_TARGET_CHAIR_KEYS = Object.freeze({
  pink: 'switch_target_chair_pink',
  green: 'switch_target_chair_green',
  purple: 'switch_target_chair_purple',
  heart: 'switch_target_chair_heart',
  wing: 'switch_target_chair_wing',
});
const SWITCH_TARGET_TABLE_KEYS = Object.freeze({
  pink: 'switch_target_table_round_pink',
  green: 'switch_target_table_round_green',
  purple: 'switch_target_table_purple',
  long: 'switch_target_table_long',
  sidePink: 'switch_target_table_side_pink',
  sideGreen: 'switch_target_table_side_green',
  candle: 'switch_target_table_candle',
});
const GLASS_ROSE_KEYS = Object.freeze({
  red: 'switch_glass_rose_red',
  blue: 'switch_glass_rose_blue',
  yellow: 'switch_glass_rose_yellow',
  off: 'switch_glass_rose_off',
});

export function clampEditorCanvasScale(value) {
  return Math.max(EDITOR_CANVAS_ZOOM.min, Math.min(EDITOR_CANVAS_ZOOM.max, value));
}

export function getNextEditorCanvasScale(currentScale, wheelDeltaY) {
  const factor = wheelDeltaY < 0 ? EDITOR_CANVAS_ZOOM.wheelStep : 1 / EDITOR_CANVAS_ZOOM.wheelStep;
  return clampEditorCanvasScale(currentScale * factor);
}

export function getEditorResidentMetrics(object = {}) {
  const def = RESIDENT_DEFS[object.type] || RESIDENT_DEFS.macaron;
  return {
    w: object.w ?? def.w ?? 28,
    h: object.h ?? def.h ?? 28,
    drawW: object.drawW ?? def.drawW ?? object.w ?? def.w ?? 28,
    drawH: object.drawH ?? def.drawH ?? object.h ?? def.h ?? 28,
    imageKey: object.imageKey || def.imageKey,
  };
}

export function getEditorItemMetrics(object = {}) {
  const def = ITEM_DEFS[object.kind] || ITEM_DEFS.coin;
  return {
    hitboxSize: object.hitboxSize ?? def.hitboxSize ?? 14,
    renderSize: object.renderSize ?? def.renderSize ?? 18,
    imageKey: object.imageKey || def.imageKey,
  };
}


function isFiniteEditorBounds(bounds) {
  return !!(
    bounds &&
    Number.isFinite(bounds.x) &&
    Number.isFinite(bounds.y) &&
    Number.isFinite(bounds.w) &&
    Number.isFinite(bounds.h)
  );
}

function resolveEditorCheckpointBounds(stage, object = {}) {
  const w = Number.isFinite(object.w) ? object.w : 32;
  const h = Number.isFinite(object.h) ? object.h : 48;
  const x = Number.isFinite(object.x) ? object.x : (stage.playerStart?.x ?? 48) + 180;
  const y = Number.isFinite(object.y) ? object.y : (stage.playerStart?.y ?? 180) + 40;
  return { x: x - w / 2, y: y - h, w, h };
}

function resolveEditorGoalBounds(object = {}) {
  const def = resolveGoalDef(object.variant || GOAL_DEFAULT_VARIANT);
  return {
    x: Number.isFinite(object.x) ? object.x : 0,
    y: Number.isFinite(object.y) ? object.y : 0,
    w: def.hitbox.w,
    h: def.hitbox.h,
  };
}

export function getEditorSwitchTargetImageKey(target = {}) {
  if (target.imageKey) return target.imageKey;
  if (target.kind === 'teaChair') return SWITCH_TARGET_CHAIR_KEYS[target.variant] || SWITCH_TARGET_CHAIR_KEYS.pink;
  if (target.kind === 'teaTable') return SWITCH_TARGET_TABLE_KEYS[target.variant] || SWITCH_TARGET_TABLE_KEYS.pink;
  return null;
}

export function getEditorSwitchGimmickImageKey(gimmick = {}) {
  if (gimmick.imageKey) return gimmick.imageKey;
  if (gimmick.kind === 'teaBell') return 'switch_tea_bell_idle';
  if (gimmick.kind === 'glassRose') return GLASS_ROSE_KEYS[gimmick.color] || GLASS_ROSE_KEYS.off;
  if (gimmick.kind === 'rainbowBubble') return (gimmick.w || 40) <= 42 ? 'switch_rainbow_bubble_idle_small' : 'switch_rainbow_bubble_idle';
  if (gimmick.kind === 'magicCandelabra') return 'switch_magic_candelabra_off';
  if (gimmick.kind === 'ribbonSwitch') return 'gimmick_ribbon_switch';
  return null;
}

export function getEditorObjectImageKey(category, object = {}) {
  if (category === 'points' && object.key === 'goal') return resolveGoalDef(object.variant || GOAL_DEFAULT_VARIANT).imageKey;
  if (category === 'items') return getEditorItemMetrics(object).imageKey;
  if (category === 'residents') return getEditorResidentMetrics(object).imageKey;
  if (category === 'doors') return object.imageKey || 'door_bow';
  if (category === 'boss') return object.imageKey || null;
  if (category === 'switchTargets') return getEditorSwitchTargetImageKey(object);
  if (category === 'switchGimmicks') return getEditorSwitchGimmickImageKey(object);
  if (category === 'specialEvents' && object.kind === 'nanoRescue') return object.imageKey || 'event_nano_candy_dome_trapped';
  return object.imageKey || null;
}

function $(id) {
  return document.getElementById(id);
}

function createOption(value, label = value) {
  const option = document.createElement('option');
  option.value = String(value);
  option.textContent = label;
  return option;
}

function normalizeSelectOption(option) {
  if (option && typeof option === 'object') return { value: option.value, label: option.label ?? option.value };
  return { value: option, label: option };
}

function setText(el, text) {
  if (el) el.textContent = text;
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function getPathValue(source, path) {
  if (!path) return undefined;
  return path.split('.').reduce((current, part) => current?.[part], source);
}

function setPathValue(target, path, value) {
  const parts = path.split('.');
  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!isObject(current[part])) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function flattenFieldGroups(groups) {
  return groups.flatMap(group => group.fields || []);
}

function fieldKeySet(groups) {
  return new Set(flattenFieldGroups(groups).map(field => field.key));
}

function getFieldRootKey(key) {
  return key.split('.')[0];
}

function isRuntimePrivateEditorKey(key) {
  return [
    'id', 'age', 'alive', 'vx', 'vy', 'spawnX', 'spawnY', 'baseX', 'baseY', 'stunTimer',
    'attackFlash', 'blackboard', 'onGround', 'balloonBirdDive', 'balloonBirdDiveTimer',
    'balloonBirdCooldownTimer', 'balloonBirdDiveStart', 'balloonBirdDiveTarget',
  ].includes(key);
}

function inferFieldFromValue(key, value) {
  if (typeof value === 'boolean') return { key, label: key, type: 'checkbox' };
  if (typeof value === 'number') return { key, label: key, type: 'number', step: key === 'duration' || key === 'hp' ? 1 : STAGE_EDITOR_GRID_SIZE };
  if (isObject(value) || Array.isArray(value)) return { key, label: key, type: 'json' };
  return { key, label: key, type: 'text' };
}

function createFieldset(group) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'editor-fieldset';
  if (group.label) {
    const legend = document.createElement('legend');
    legend.textContent = group.label;
    fieldset.append(legend);
  }
  return fieldset;
}

function normalizeFieldValue(input, field) {
  if (field.type === 'checkbox') return input.checked;
  if (field.type === 'number') return Number(input.value || 0);
  if (field.type === 'select' && field.valueType === 'number') return Number(input.value || 0);
  if (field.type === 'json') {
    try { return JSON.parse(input.value || 'null'); } catch { return input.value; }
  }
  return input.value;
}

function formatFieldValue(value, field) {
  if (field.type === 'json' || JSON_FIELDS.has(field.key) || isObject(value) || Array.isArray(value)) {
    return JSON.stringify(value ?? null, null, 2);
  }
  return value ?? '';
}

function getObjectLabel(category, object, index) {
  if (category === 'points') return object.key === 'playerStart' ? '開始位置' : 'ゴール';
  if (category === 'areas') return `${object.name || object.id || 'area'} (${object.startX}-${object.endX})`;
  if (object?.id) return object.id;
  if (object?.kind) return `${object.kind} #${index + 1}`;
  if (object?.type) return `${object.type} #${index + 1}`;
  return `${EDITOR_CATEGORY_DEFS[category]?.label || category} #${index + 1}`;
}

export function createEditorSelectionKey(category, index) {
  return `${category}:${index}`;
}

export function parseEditorSelectionKey(key) {
  const [category, indexText] = String(key).split(':');
  return { category, index: Number(indexText) };
}

function getEditorCollectionObjects(stage, category) {
  const def = EDITOR_CATEGORY_DEFS[category];
  if (!def) return [];
  if (category === 'points') return [
    { key: 'playerStart', ...stage.playerStart },
    { key: 'goal', ...stage.goal },
  ];
  if (def.singleton) return stage[def.collection] ? [stage[def.collection]] : [];
  return Array.isArray(stage[def.collection]) ? stage[def.collection] : [];
}

export function getEditorCanvasObjectEntries(stage, options = {}) {
  const includeAreas = options.includeAreas === true;
  const includePoints = options.includePoints === true;
  const entries = [];
  for (const category of EDITABLE_COLLECTIONS) {
    if (category === 'areas' && !includeAreas) continue;
    if (category === 'points' && !includePoints) continue;
    const objects = getEditorCollectionObjects(stage, category);
    for (let index = 0; index < objects.length; index += 1) {
      const object = objects[index];
      const bounds = getStageObjectBounds(stage, category, object);
      if (isFiniteEditorBounds(bounds)) entries.push({ category, index, object, bounds, key: createEditorSelectionKey(category, index) });
    }
  }
  return entries;
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

function createInputField(field, value) {
  const wrapper = document.createElement('label');
  wrapper.className = 'editor-field';
  const span = document.createElement('span');
  span.textContent = field.label || field.key;
  wrapper.append(span);

  let input;
  if (field.type === 'select') {
    input = document.createElement('select');
    for (const rawOption of field.options || []) {
      const option = normalizeSelectOption(rawOption);
      input.append(createOption(option.value, option.label));
    }
    input.value = String(value ?? '');
  } else if (field.type === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!value;
  } else if (field.type === 'json') {
    input = document.createElement('textarea');
    input.rows = 5;
    input.value = formatFieldValue(value, field);
  } else {
    input = document.createElement('input');
    input.type = field.type || 'text';
    if (field.step != null) input.step = String(field.step);
    if (field.min != null) input.min = String(field.min);
    input.value = formatFieldValue(value, field);
  }
  input.dataset.key = field.key;
  wrapper.append(input);
  return wrapper;
}

function getStageObjectBounds(stage, category, object) {
  if (!object) return null;
  if (category === 'points') return object.key === 'goal' ? resolveEditorGoalBounds(object) : { x: object.x - 8, y: object.y - 16, w: 16, h: 24 };
  if (category === 'areas') return { x: object.startX, y: 0, w: Math.max(1, object.endX - object.startX), h: stage.height };
  if (category === 'items') {
    const metrics = getEditorItemMetrics(object);
    const size = metrics.hitboxSize;
    return { x: object.x - size / 2, y: object.y - size / 2, w: size, h: size };
  }
  if (category === 'residents') {
    const metrics = getEditorResidentMetrics(object);
    return { x: object.x, y: object.y, w: metrics.w, h: metrics.h };
  }
  if (category === 'checkpoints') return resolveEditorCheckpointBounds(stage, object);
  if (category === 'boss') return object ? { x: object.x, y: object.y, w: object.w || 48, h: object.h || 48 } : null;
  if (category === 'balloonRides') return object.start ? { x: object.start.x, y: object.start.y, w: object.start.w || 38, h: object.start.h || 94 } : null;
  if (object.w != null && object.h != null) return { x: object.x, y: object.y, w: object.w, h: object.h };
  if (category === 'decorations') return { x: object.x - (object.r || 8), y: object.y - (object.r || 8), w: (object.r || 8) * 2, h: (object.r || 8) * 2 };
  return { x: object.x - 10, y: object.y - 10, w: 20, h: 20 };
}

function isInsideBounds(x, y, bounds) {
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


export function getEditorHitTestCategoryOrder(selectedCategory) {
  const order = [];
  const push = category => {
    if (!category || !EDITABLE_COLLECTIONS.includes(category) || order.includes(category)) return;
    order.push(category);
  };

  push(selectedCategory);
  for (const category of HIT_TEST_FALLBACK_ORDER) push(category);
  return order;
}

function createDownload(text, filename, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function normalizeEditorDialogueLine(line = {}, fallback = EDITOR_DIALOGUE_DEFAULT_LINE) {
  return {
    portrait: line.portrait || fallback.portrait || EDITOR_DIALOGUE_DEFAULT_LINE.portrait,
    speaker: line.speaker ?? fallback.speaker ?? EDITOR_DIALOGUE_DEFAULT_LINE.speaker,
    text: line.text ?? '',
  };
}

export function createEditorDialogueLine(seed = {}) {
  return normalizeEditorDialogueLine({ ...seed, text: seed.text ?? '' });
}

export function moveEditorDialogueLine(lines, fromIndex, toIndex) {
  const nextLines = Array.isArray(lines) ? lines.map(line => normalizeEditorDialogueLine(line)) : [];
  if (fromIndex < 0 || fromIndex >= nextLines.length || toIndex < 0 || toIndex >= nextLines.length) return nextLines;
  const [line] = nextLines.splice(fromIndex, 1);
  nextLines.splice(toIndex, 0, line);
  return nextLines;
}

export function getEditorDialogueSummary(line = {}, index = 0) {
  const normalized = normalizeEditorDialogueLine(line);
  const text = normalized.text.replace(/\s+/gu, ' ').trim();
  return `${index + 1}. ${normalized.speaker || '名前なし'}：${text || '本文なし'}`;
}

export class StageEditorApp {
  constructor(root) {
    this.root = root;
    this.canvas = $('editor-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.stageSelect = $('stage-select');
    this.categoryTabs = $('category-tabs');
    this.objectList = $('object-list');
    this.propertyForm = $('property-form');
    this.basicForm = $('basic-form');
    this.validationList = $('validation-list');
    this.output = $('export-output');
    this.pathHint = $('path-hint');
    this.dialogueDialog = $('dialogue-editor-dialog');
    this.dialogueTabs = $('dialogue-event-tabs');
    this.dialogueWindowList = $('dialogue-window-list');
    this.dialogueForm = $('dialogue-window-form');
    this.dialoguePreview = $('dialogue-preview');
    this.dialogueCountLabel = $('dialogue-count-label');
    this.dialoguePortraitPreview = $('dialogue-portrait-preview');
    this.stage = createEditorStage(Object.values(STAGES)[0]);
    this.selectedCategory = 'platforms';
    this.selectedIndex = 0;
    this.selectedItems = [createEditorSelectionKey(this.selectedCategory, this.selectedIndex)];
    this.history = [];
    this.future = [];
    this.drag = null;
    this.marquee = null;
    this.assetImages = new Map();
    this.canvasScale = EDITOR_CANVAS_ZOOM.defaultScale;
    this.canvasViewBounds = { x: -EDITOR_CANVAS_OUTSIDE_MARGIN, y: -EDITOR_CANVAS_OUTSIDE_MARGIN, w: STAGE_EDITOR_VIEW.width + EDITOR_CANVAS_OUTSIDE_MARGIN * 2, h: STAGE_EDITOR_VIEW.height + EDITOR_CANVAS_OUTSIDE_MARGIN * 2 };
    this.dialogueState = { key: EDITOR_DIALOGUE_DEFS[0].key, index: 0 };
    this.resizeRaf = 0;
  }

  init() {
    this.preloadBackgrounds();
    this.renderStageSelect();
    this.renderCategoryTabs();
    this.bindEvents();
    this.loadStage(this.stageSelect.value || this.stage.id, { pushHistory: false });
  }

  preloadBackgrounds() {
    this.preloadEditorAssets();
  }

  preloadEditorAssets() {
    if (typeof Image === 'undefined') return;
    for (const [key, src] of Object.entries(ASSET_MANIFEST.images)) {
      const img = new Image();
      img.onload = () => {
        this.assetImages.set(key, img);
        this.queueResizeRender();
      };
      img.onerror = () => this.assetImages.delete(key);
      img.src = src;
      this.assetImages.set(key, img);
    }
  }

  getImage(key) {
    if (!key) return null;
    const img = this.assetImages.get(key);
    if (!img || !img.complete || img.naturalWidth <= 0) return null;
    return img;
  }

  renderStageSelect() {
    this.stageSelect.innerHTML = '';
    for (const route of STAGE_ROUTES) {
      const group = document.createElement('optgroup');
      group.label = route.id;
      for (const id of route.stageIds) {
        const stage = STAGES[id];
        group.append(createOption(id, `${stage?.name || id} / ${id}`));
      }
      this.stageSelect.append(group);
    }
    this.stageSelect.append(createOption('switch_test_lab', `${STAGES.switch_test_lab.name} / switch_test_lab`));
  }

  renderCategoryTabs() {
    this.categoryTabs.innerHTML = '';
    for (const category of EDITABLE_COLLECTIONS) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = EDITOR_CATEGORY_DEFS[category].label;
      button.dataset.category = category;
      button.className = category === this.selectedCategory ? 'is-active' : '';
      this.categoryTabs.append(button);
    }
  }

  bindEvents() {
    this.stageSelect.addEventListener('change', () => this.loadStage(this.stageSelect.value));
    $('new-stage-btn').addEventListener('click', () => this.newStage());
    $('clone-stage-btn').addEventListener('click', () => this.cloneStage());
    $('undo-btn').addEventListener('click', () => this.undo());
    $('redo-btn').addEventListener('click', () => this.redo());
    $('add-object-btn').addEventListener('click', () => this.addSelectedObject());
    $('duplicate-object-btn')?.addEventListener('click', () => this.duplicateSelectedObjects());
    $('delete-object-btn').addEventListener('click', () => this.deleteSelectedObject());
    $('export-js-btn').addEventListener('click', () => this.updateOutput('js'));
    $('export-json-btn').addEventListener('click', () => this.updateOutput('json'));
    $('download-js-btn').addEventListener('click', () => createDownload(serializeStageToJsModule(this.stage), createStageDownloadName(this.stage, 'js'), 'text/javascript'));
    $('download-json-btn').addEventListener('click', () => createDownload(serializeStageToJson(this.stage), createStageDownloadName(this.stage, 'json'), 'application/json'));
    $('copy-output-btn').addEventListener('click', () => navigator.clipboard?.writeText(this.output.value));
    $('import-json-btn').addEventListener('click', () => this.importJson());
    $('preview-btn').addEventListener('click', () => this.openPreview());
    $('dialogue-edit-btn')?.addEventListener('click', () => this.openDialogueEditor());
    $('dialogue-dialog-close')?.addEventListener('click', () => this.closeDialogueEditor());
    $('dialogue-add-btn')?.addEventListener('click', () => this.addDialogueWindow());
    $('dialogue-insert-btn')?.addEventListener('click', () => this.insertDialogueWindow());
    $('dialogue-delete-btn')?.addEventListener('click', () => this.deleteDialogueWindow());
    $('dialogue-up-btn')?.addEventListener('click', () => this.moveDialogueWindow(-1));
    $('dialogue-down-btn')?.addEventListener('click', () => this.moveDialogueWindow(1));

    this.dialogueTabs?.addEventListener('click', event => this.selectDialogueEvent(event));
    this.dialogueWindowList?.addEventListener('click', event => this.selectDialogueWindow(event));
    this.dialogueForm?.addEventListener('input', event => this.updateDialogueField(event));
    this.dialogueForm?.addEventListener('change', event => this.updateDialogueField(event));

    this.categoryTabs.addEventListener('click', event => {
      const button = event.target.closest('button[data-category]');
      if (!button) return;
      this.selectedCategory = button.dataset.category;
      this.selectedIndex = 0;
      if (this.getSelectedCollection().length) this.selectSingleObject(this.selectedCategory, this.selectedIndex);
      else this.selectedItems = [];
      this.renderAll();
    });

    this.objectList.addEventListener('click', event => {
      const button = event.target.closest('button[data-index]');
      if (!button) return;
      const index = Number(button.dataset.index);
      if (event.shiftKey || event.ctrlKey || event.metaKey) this.toggleSelectedObject(this.selectedCategory, index);
      else this.selectSingleObject(this.selectedCategory, index);
      this.renderAll();
    });

    this.basicForm.addEventListener('input', event => this.updateStageField(event));
    this.propertyForm.addEventListener('input', event => this.updateObjectField(event));

    this.canvas.addEventListener('mousedown', event => this.startCanvasDrag(event));
    this.canvas.parentElement?.addEventListener('wheel', event => this.handleCanvasWheel(event), { passive: false });
    window.addEventListener('mousemove', event => this.moveCanvasDrag(event));
    window.addEventListener('mouseup', () => this.endCanvasDrag());
    window.addEventListener('resize', () => this.queueResizeRender());
    window.addEventListener('keydown', event => this.handleEditorKeyDown(event));
  }

  handleEditorKeyDown(event) {
    if (event.defaultPrevented || event.key !== 'Delete') return;
    if (this.isEditorValueEditingTarget(event.target)) return;
    if (!this.getSelectedEntries().some(entry => entry.category !== 'points')) return;
    event.preventDefault();
    this.deleteSelectedObject();
  }

  isEditorValueEditingTarget(target) {
    if (!target || typeof target.closest !== 'function') return false;
    return Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'));
  }

  pushHistory() {
    this.history.push(cloneEditorValue(this.stage));
    if (this.history.length > 80) this.history.shift();
    this.future = [];
    this.updateHistoryButtons();
  }

  undo() {
    if (!this.history.length) return;
    this.future.push(cloneEditorValue(this.stage));
    this.stage = createEditorStage(this.history.pop());
    this.renderAll();
  }

  redo() {
    if (!this.future.length) return;
    this.history.push(cloneEditorValue(this.stage));
    this.stage = createEditorStage(this.future.pop());
    this.renderAll();
  }

  updateHistoryButtons() {
    $('undo-btn').disabled = this.history.length === 0;
    $('redo-btn').disabled = this.future.length === 0;
  }

  loadStage(stageId, { pushHistory = true } = {}) {
    const raw = STAGES[stageId] || Object.values(STAGES)[0];
    if (pushHistory) this.pushHistory();
    this.stage = createEditorStage(raw);
    this.selectedCategory = 'platforms';
    this.selectedIndex = 0;
    this.selectedItems = [createEditorSelectionKey(this.selectedCategory, this.selectedIndex)];
    this.renderAll();
  }

  newStage() {
    this.pushHistory();
    this.stage = createEditorStage();
    this.stage.id = 'new_stage_' + Date.now().toString(36);
    this.stage.name = '新しいステージ';
    this.stageSelect.value = '';
    this.selectedCategory = 'platforms';
    this.selectedIndex = 0;
    this.selectedItems = [createEditorSelectionKey(this.selectedCategory, this.selectedIndex)];
    this.renderAll();
  }

  cloneStage() {
    this.pushHistory();
    this.stage = createEditorStage(this.stage);
    this.stage.id = `${this.stage.id}_copy`;
    this.stage.name = `${this.stage.name} コピー`;
    this.stage.route = null;
    this.selectedItems = [createEditorSelectionKey(this.selectedCategory, this.selectedIndex)];
    this.renderAll();
  }

  renderAll() {
    this.stage = normalizeStageDefinition(this.stage);
    this.renderCategoryTabs();
    this.renderBasicForm();
    this.renderObjectList();
    this.renderPropertyForm();
    this.renderValidation();
    this.renderCanvas();
    this.updateHistoryButtons();
    this.updatePathHint();
    if (this.dialogueDialog?.open) this.renderDialogueEditor();
  }

  renderAfterFieldEdit({ renderBasicForm = false, renderPropertyForm = false } = {}) {
    this.stage = normalizeStageDefinition(this.stage);
    if (renderBasicForm) this.renderBasicForm();
    this.renderObjectList();
    if (renderPropertyForm) this.renderPropertyForm();
    this.renderValidation();
    this.renderCanvas();
    this.updateHistoryButtons();
    this.updatePathHint();
    if (this.dialogueDialog?.open) this.renderDialogueEditor();
  }

  renderBasicForm() {
    this.basicForm.innerHTML = '';
    for (const field of EDITOR_FIELD_GROUPS.stage) {
      this.basicForm.append(createInputField(field, this.stage[field.key]));
    }
  }

  getSelectedCollection() {
    const def = EDITOR_CATEGORY_DEFS[this.selectedCategory];
    if (!def) return [];
    if (this.selectedCategory === 'points') return [
      { key: 'playerStart', ...this.stage.playerStart },
      { key: 'goal', ...this.stage.goal },
    ];
    if (def.singleton) return this.stage[def.collection] ? [this.stage[def.collection]] : [];
    return Array.isArray(this.stage[def.collection]) ? this.stage[def.collection] : [];
  }

  getSelectedObject() {
    return this.getSelectedCollection()[this.selectedIndex] || null;
  }

  getObjectBySelection(category, index) {
    return getEditorCollectionObjects(this.stage, category)[index] || null;
  }

  setObjectBySelection(category, index, nextObject) {
    const def = EDITOR_CATEGORY_DEFS[category];
    if (!def) return;
    if (category === 'points') {
      const key = index === 0 ? 'playerStart' : 'goal';
      this.stage[key] = key === 'goal'
        ? { x: nextObject.x, y: nextObject.y, variant: nextObject.variant || GOAL_DEFAULT_VARIANT }
        : { x: nextObject.x, y: nextObject.y };
      return;
    }
    if (def.singleton) {
      this.stage[def.collection] = nextObject;
      return;
    }
    if (Array.isArray(this.stage[def.collection])) this.stage[def.collection][index] = nextObject;
  }

  getValidSelectedItems() {
    const seen = new Set();
    const valid = [];
    for (const key of this.selectedItems || []) {
      if (seen.has(key)) continue;
      const item = parseEditorSelectionKey(key);
      if (!EDITOR_CATEGORY_DEFS[item.category]) continue;
      if (!this.getObjectBySelection(item.category, item.index)) continue;
      seen.add(key);
      valid.push(key);
    }
    this.selectedItems = valid;
    return valid;
  }

  getSelectedEntries() {
    return this.getValidSelectedItems().map(key => {
      const item = parseEditorSelectionKey(key);
      return { ...item, key, object: this.getObjectBySelection(item.category, item.index) };
    }).filter(entry => entry.object);
  }

  selectSingleObject(category, index) {
    this.selectedCategory = category;
    this.selectedIndex = index;
    this.selectedItems = [createEditorSelectionKey(category, index)];
  }

  toggleSelectedObject(category, index) {
    const key = createEditorSelectionKey(category, index);
    const selected = new Set(this.getValidSelectedItems());
    if (selected.has(key)) selected.delete(key);
    else selected.add(key);
    this.selectedCategory = category;
    this.selectedIndex = index;
    this.selectedItems = [...selected];
  }

  setMultiSelection(entries) {
    const keys = entries.map(entry => createEditorSelectionKey(entry.category, entry.index));
    this.selectedItems = [...new Set(keys)];
    if (entries.length) {
      this.selectedCategory = entries[0].category;
      this.selectedIndex = entries[0].index;
    }
  }

  isObjectSelected(category, index) {
    return this.getValidSelectedItems().includes(createEditorSelectionKey(category, index));
  }

  setSelectedObject(nextObject) {
    const def = EDITOR_CATEGORY_DEFS[this.selectedCategory];
    if (this.selectedCategory === 'points') {
      const key = this.selectedIndex === 0 ? 'playerStart' : 'goal';
      this.stage[key] = key === 'goal'
        ? { x: nextObject.x, y: nextObject.y, variant: nextObject.variant || GOAL_DEFAULT_VARIANT }
        : { x: nextObject.x, y: nextObject.y };
      return;
    }
    if (def.singleton) {
      this.stage[def.collection] = nextObject;
      return;
    }
    this.stage[def.collection][this.selectedIndex] = nextObject;
  }

  renderObjectList() {
    const objects = this.getSelectedCollection();
    this.objectList.innerHTML = '';
    if (!objects.length) {
      const empty = document.createElement('p');
      empty.className = 'editor-empty';
      empty.textContent = '配置なし';
      this.objectList.append(empty);
      return;
    }
    objects.forEach((object, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.index = String(index);
      button.className = this.isObjectSelected(this.selectedCategory, index) ? 'is-active' : '';
      const indexLabel = document.createElement('span');
      indexLabel.className = 'object-index';
      indexLabel.textContent = String(index + 1);
      const nameLabel = document.createElement('span');
      nameLabel.className = 'object-label';
      nameLabel.textContent = getObjectLabel(this.selectedCategory, object, index);
      button.append(indexLabel, nameLabel);
      this.objectList.append(button);
    });
  }

  openDialogueEditor() {
    this.dialogueState.index = this.clampDialogueIndex(this.dialogueState.key, this.dialogueState.index);
    this.renderDialogueEditor();
    if (this.dialogueDialog?.showModal) this.dialogueDialog.showModal();
    else this.dialogueDialog?.setAttribute('open', '');
  }

  closeDialogueEditor() {
    if (this.dialogueDialog?.close) this.dialogueDialog.close();
    else this.dialogueDialog?.removeAttribute('open');
  }

  getDialogueDef(key = this.dialogueState.key) {
    return EDITOR_DIALOGUE_DEFS.find(def => def.key === key) || EDITOR_DIALOGUE_DEFS[0];
  }

  getDialogueLines(key = this.dialogueState.key) {
    const current = this.stage[key];
    if (!Array.isArray(current)) this.stage[key] = [];
    return this.stage[key];
  }

  clampDialogueIndex(key = this.dialogueState.key, index = this.dialogueState.index) {
    const lines = this.getDialogueLines(key);
    if (!lines.length) return 0;
    return Math.max(0, Math.min(lines.length - 1, index));
  }

  getSelectedDialogueLine() {
    const lines = this.getDialogueLines();
    return lines[this.dialogueState.index] || null;
  }

  renderDialogueEditor() {
    if (!this.dialogueTabs || !this.dialogueWindowList || !this.dialogueForm || !this.dialoguePreview) return;
    this.dialogueState.index = this.clampDialogueIndex();
    this.renderDialogueTabs();
    this.renderDialogueWindowList();
    this.renderDialogueForm();
    this.renderDialoguePreview();
  }

  renderDialogueTabs() {
    this.dialogueTabs.innerHTML = '';
    for (const def of EDITOR_DIALOGUE_DEFS) {
      const lines = this.getDialogueLines(def.key);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.dialogueKey = def.key;
      button.className = def.key === this.dialogueState.key ? 'is-active' : '';
      button.textContent = `${def.label} (${lines.length})`;
      this.dialogueTabs.append(button);
    }
  }

  renderDialogueWindowList() {
    const lines = this.getDialogueLines();
    this.dialogueWindowList.innerHTML = '';
    setText(this.dialogueCountLabel, `${this.getDialogueDef().label}: ${lines.length}件`);
    if (!lines.length) {
      const empty = document.createElement('p');
      empty.className = 'editor-empty';
      empty.textContent = '会話ウィンドウがありません。追加してください。';
      this.dialogueWindowList.append(empty);
      return;
    }
    lines.forEach((line, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.index = String(index);
      button.className = index === this.dialogueState.index ? 'is-active' : '';
      const portrait = normalizeEditorDialogueLine(line).portrait;
      const thumb = document.createElement('img');
      thumb.className = 'dialogue-window-thumb';
      const img = this.getImage(portrait);
      thumb.src = img?.src || '';
      thumb.alt = portrait;
      const label = document.createElement('span');
      label.textContent = getEditorDialogueSummary(line, index);
      button.append(thumb, label);
      this.dialogueWindowList.append(button);
    });
  }

  renderDialogueForm() {
    const line = this.getSelectedDialogueLine();
    this.dialogueForm.innerHTML = '';
    if (!line) {
      const empty = document.createElement('p');
      empty.className = 'editor-empty';
      empty.textContent = '編集する会話ウィンドウを選択してください。';
      this.dialogueForm.append(empty);
      this.updateDialoguePortraitPreview(null);
      return;
    }
    const normalized = normalizeEditorDialogueLine(line);
    const fields = [
      { key: 'portrait', label: '顔アイコン', type: 'select', options: EDITOR_DIALOGUE_PORTRAIT_OPTIONS },
      { key: 'speaker', label: '名前', type: 'text' },
      { key: 'text', label: '本文', type: 'textarea' },
    ];
    for (const field of fields) {
      this.dialogueForm.append(this.createDialogueInputField(field, normalized[field.key]));
    }
    this.updateDialoguePortraitPreview(normalized.portrait);
  }

  createDialogueInputField(field, value) {
    const wrapper = document.createElement('label');
    wrapper.className = `editor-field dialogue-field dialogue-field-${field.key}`;
    const span = document.createElement('span');
    span.textContent = field.label;
    wrapper.append(span);
    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      for (const option of field.options || []) input.append(createOption(option.value, option.label));
      input.value = value || '';
    } else if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 8;
      input.value = value || '';
    } else {
      input = document.createElement('input');
      input.type = field.type || 'text';
      input.value = value || '';
    }
    input.dataset.field = field.key;
    wrapper.append(input);
    return wrapper;
  }

  renderDialoguePreview() {
    const line = normalizeEditorDialogueLine(this.getSelectedDialogueLine() || {});
    const img = this.getImage(line.portrait);
    this.dialoguePreview.innerHTML = '';
    const windowEl = document.createElement('div');
    windowEl.className = 'dialogue-preview-window';
    const portraitFrame = document.createElement('div');
    portraitFrame.className = 'dialogue-preview-portrait-frame';
    const portraitImg = document.createElement('img');
    portraitImg.src = img?.src || '';
    portraitImg.alt = line.speaker || '';
    portraitFrame.append(portraitImg);
    const content = document.createElement('div');
    content.className = 'dialogue-preview-content';
    const speaker = document.createElement('div');
    speaker.className = 'dialogue-preview-speaker';
    speaker.textContent = line.speaker || '名前なし';
    const text = document.createElement('div');
    text.className = 'dialogue-preview-text';
    text.textContent = line.text || '本文なし';
    const hint = document.createElement('div');
    hint.className = 'dialogue-preview-hint';
    hint.textContent = 'プレビュー表示';
    content.append(speaker, text, hint);
    windowEl.append(portraitFrame, content);
    this.dialoguePreview.append(windowEl);
  }

  updateDialoguePortraitPreview(portraitKey) {
    if (!this.dialoguePortraitPreview) return;
    const img = this.getImage(portraitKey);
    this.dialoguePortraitPreview.src = img?.src || '';
    this.dialoguePortraitPreview.alt = portraitKey || '';
  }

  selectDialogueEvent(event) {
    const button = event.target.closest('button[data-dialogue-key]');
    if (!button) return;
    this.dialogueState.key = button.dataset.dialogueKey;
    this.dialogueState.index = this.clampDialogueIndex(this.dialogueState.key, 0);
    this.renderDialogueEditor();
  }

  selectDialogueWindow(event) {
    const button = event.target.closest('button[data-index]');
    if (!button) return;
    this.dialogueState.index = this.clampDialogueIndex(this.dialogueState.key, Number(button.dataset.index));
    this.renderDialogueEditor();
  }

  updateDialogueField(event) {
    const input = event.target.closest('[data-field]');
    if (!input) return;
    if (event.type === 'change' && input.tagName !== 'SELECT') return;
    if (event.type === 'input' && input.tagName === 'SELECT') return;
    const lines = this.getDialogueLines();
    const current = lines[this.dialogueState.index];
    if (!current) return;
    this.pushHistory();
    const nextLine = normalizeEditorDialogueLine(current);
    nextLine[input.dataset.field] = input.value;
    lines[this.dialogueState.index] = nextLine;
    if (input.dataset.field === 'portrait') this.updateDialoguePortraitPreview(input.value);
    this.renderDialogueTabs();
    this.renderDialogueWindowList();
    this.renderDialoguePreview();
    this.renderValidation();
    this.updateHistoryButtons();
  }

  getDialogueInsertionSeed() {
    const current = this.getSelectedDialogueLine();
    if (!current) return EDITOR_DIALOGUE_DEFAULT_LINE;
    const line = normalizeEditorDialogueLine(current);
    return { portrait: line.portrait, speaker: line.speaker, text: '' };
  }

  addDialogueWindow() {
    this.pushHistory();
    const lines = this.getDialogueLines();
    lines.push(createEditorDialogueLine(this.getDialogueInsertionSeed()));
    this.dialogueState.index = lines.length - 1;
    this.renderDialogueEditor();
    this.renderValidation();
    this.updateHistoryButtons();
  }

  insertDialogueWindow() {
    this.pushHistory();
    const lines = this.getDialogueLines();
    const index = lines.length ? this.dialogueState.index : 0;
    lines.splice(index, 0, createEditorDialogueLine(this.getDialogueInsertionSeed()));
    this.dialogueState.index = index;
    this.renderDialogueEditor();
    this.renderValidation();
    this.updateHistoryButtons();
  }

  deleteDialogueWindow() {
    const lines = this.getDialogueLines();
    if (!lines.length) return;
    this.pushHistory();
    lines.splice(this.dialogueState.index, 1);
    this.dialogueState.index = this.clampDialogueIndex();
    this.renderDialogueEditor();
    this.renderValidation();
    this.updateHistoryButtons();
  }

  moveDialogueWindow(direction) {
    const lines = this.getDialogueLines();
    const nextIndex = this.dialogueState.index + direction;
    if (nextIndex < 0 || nextIndex >= lines.length) return;
    this.pushHistory();
    this.stage[this.dialogueState.key] = moveEditorDialogueLine(lines, this.dialogueState.index, nextIndex);
    this.dialogueState.index = nextIndex;
    this.renderDialogueEditor();
    this.renderValidation();
    this.updateHistoryButtons();
  }

  renderPropertyForm() {
    this.propertyForm.innerHTML = '';
    const selectedCount = this.getValidSelectedItems().length;
    const object = selectedCount === 1 ? this.getSelectedObject() : null;
    if (selectedCount > 1) {
      const note = document.createElement('p');
      note.className = 'editor-empty';
      note.textContent = `${selectedCount}件を一括選択中です。ドラッグで一括移動、複製ボタンで一括複製できます。個別編集する場合は1件だけ選択してください。`;
      this.propertyForm.append(note);
      return;
    }
    if (!object) {
      const empty = document.createElement('p');
      empty.className = 'editor-empty';
      empty.textContent = '編集対象を選択してください。';
      this.propertyForm.append(empty);
      return;
    }

    const groups = this.createFieldGroupsForObject(object);
    for (const group of groups) {
      const fieldset = createFieldset(group);
      for (const field of group.fields) {
        fieldset.append(createInputField(field, this.resolveFieldValue(object, field)));
      }
      this.propertyForm.append(fieldset);
    }
  }

  createFieldsForObject(object) {
    return flattenFieldGroups(this.createFieldGroupsForObject(object));
  }

  createFieldGroupsForObject(object) {
    if (this.selectedCategory === 'points') {
      const fields = [
        { key: 'x', label: 'X', type: 'number', step: STAGE_EDITOR_GRID_SIZE },
        { key: 'y', label: 'Y', type: 'number', step: STAGE_EDITOR_GRID_SIZE },
      ];
      if (object.key === 'goal') fields.push({ key: 'variant', label: 'ゴール種類', type: 'select', options: GOAL_VARIANT_OPTIONS });
      return [{ label: '座標', fields }];
    }
    if (this.selectedCategory === 'areas') return [{
      label: 'エリア',
      fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'name', label: '名前', type: 'text' },
        { key: 'startX', label: '開始X', type: 'number', step: STAGE_EDITOR_GRID_SIZE },
        { key: 'endX', label: '終了X', type: 'number', step: STAGE_EDITOR_GRID_SIZE },
        { key: 'respawn', label: '復帰地点JSON', type: 'json' },
      ],
    }];

    const typedGroups = getEditorFieldGroupsForObject(this.selectedCategory, object);
    if (typedGroups.length) return this.appendExtraFieldsForObject(object, typedGroups);

    const fields = [];
    for (const key of Object.keys(object)) {
      if (key === 'kind' && this.selectedCategory === 'items') {
        fields.push({ key, label: '種類', type: 'select', options: EDITOR_OBJECT_PRESETS.items.map(preset => preset.value.kind) });
      } else {
        fields.push(inferFieldFromValue(key, object[key]));
      }
    }
    return [{ label: 'プロパティ', fields }];
  }

  appendExtraFieldsForObject(object, groups) {
    const knownKeys = fieldKeySet(groups);
    const knownRootKeys = new Set([...knownKeys].map(getFieldRootKey));
    const extraFields = [];
    for (const key of Object.keys(object)) {
      if (isRuntimePrivateEditorKey(key) || knownKeys.has(key)) continue;
      if (knownRootKeys.has(key) && isObject(object[key])) continue;
      extraFields.push(inferFieldFromValue(key, object[key]));
    }
    if (!extraFields.length) return groups;
    return [...groups, { label: 'その他', fields: extraFields }];
  }

  resolveFieldValue(object, field) {
    const explicitValue = getPathValue(object, field.key);
    if (explicitValue !== undefined) return explicitValue;
    if (this.selectedCategory === 'residents') {
      const defValue = getResidentDefinitionValue(object.type || 'macaron', field.key);
      if (defValue !== undefined) return defValue;
    }
    return field.defaultValue;
  }

  renderValidation() {
    const messages = validateEditorStage(this.stage);
    this.validationList.innerHTML = '';
    for (const item of messages) {
      const li = document.createElement('li');
      li.className = `validation-${item.level}`;
      li.textContent = `${item.level.toUpperCase()}: ${item.message}${item.path ? ` (${item.path})` : ''}`;
      this.validationList.append(li);
    }
    $('preview-btn').disabled = hasValidationErrors(messages);
    $('download-js-btn').disabled = hasValidationErrors(messages);
    $('download-json-btn').disabled = hasValidationErrors(messages);
  }

  updatePathHint() {
    setText(this.pathHint, `出力先候補: ${resolveStageSourcePath(this.stage)}`);
  }

  updateStageField(event) {
    const input = event.target.closest('[data-key]');
    if (!input) return;
    this.pushHistory();
    const field = EDITOR_FIELD_GROUPS.stage.find(item => item.key === input.dataset.key);
    this.stage[input.dataset.key] = normalizeFieldValue(input, field || { key: input.dataset.key });
    if (input.dataset.key === 'width' && this.stage.areas.length === 1) this.stage.areas[0].endX = this.stage.width;
    this.renderAfterFieldEdit();
  }

  updateObjectField(event) {
    const input = event.target.closest('[data-key]');
    if (!input) return;
    const object = this.getSelectedObject();
    if (!object) return;
    this.pushHistory();
    const fields = this.createFieldsForObject(object);
    const field = fields.find(item => item.key === input.dataset.key) || { key: input.dataset.key };
    const value = normalizeFieldValue(input, field);
    let nextObject = cloneEditorValue(object);
    let requiresPropertyFormRender = false;
    if (this.selectedCategory === 'residents' && field.key === 'type') {
      nextObject = this.createResidentAfterTypeChange(nextObject, value);
      requiresPropertyFormRender = true;
    } else if (this.selectedCategory === 'platforms' && field.key === 'kind') {
      nextObject = this.createPlatformAfterKindChange(nextObject, value);
      requiresPropertyFormRender = true;
    } else if (this.selectedCategory === 'specialEvents' && field.key === 'kind') {
      nextObject = this.createSpecialEventAfterKindChange(nextObject, value);
      requiresPropertyFormRender = true;
    } else {
      setPathValue(nextObject, field.key, value);
    }
    this.setSelectedObject(nextObject);
    this.renderAfterFieldEdit({ renderPropertyForm: requiresPropertyFormRender });
  }

  createResidentAfterTypeChange(object, nextType) {
    const nextObject = { type: nextType };
    for (const key of RESIDENT_TYPE_RESET_KEEP_KEYS) {
      if (object[key] !== undefined) nextObject[key] = object[key];
    }
    if (object.rideId && ['cloudImp', 'stormCloud', 'thornCloud', 'balloonBird'].includes(nextType)) nextObject.rideId = object.rideId;
    return nextObject;
  }

  createPlatformAfterKindChange(object, nextKind) {
    const nextObject = { kind: nextKind };
    for (const key of PLATFORM_KIND_RESET_KEEP_KEYS) {
      if (object[key] !== undefined) nextObject[key] = object[key];
    }
    return nextObject;
  }

  createSpecialEventAfterKindChange(object, nextKind) {
    const preset = (EDITOR_OBJECT_PRESETS.specialEvents || []).find(item => item.value?.kind === nextKind)?.value || { kind: nextKind };
    const nextObject = cloneEditorValue(preset);
    for (const key of SPECIAL_EVENT_KIND_RESET_KEEP_KEYS) {
      if (object[key] !== undefined) nextObject[key] = object[key];
    }
    nextObject.kind = nextKind;
    return nextObject;
  }

  addSelectedObject() {
    const presets = EDITOR_OBJECT_PRESETS[this.selectedCategory] || [];
    const def = EDITOR_CATEGORY_DEFS[this.selectedCategory];
    if (!presets.length || this.selectedCategory === 'points') return;
    this.pushHistory();
    let object = cloneEditorValue(presets[0].value);
    object = placeEditorObjectInVisibleRect(this.selectedCategory, object, this.getVisibleStageRect());
    if (def.singleton) {
      this.stage[def.collection] = object;
      this.selectSingleObject(this.selectedCategory, 0);
    } else {
      this.stage[def.collection].push(this.createUniqueObject(object, def.collection));
      this.selectSingleObject(this.selectedCategory, this.stage[def.collection].length - 1);
    }
    this.renderAll();
  }

  createUniqueObject(object, collection) {
    if (!object.id) return object;
    const existing = new Set((this.stage[collection] || []).map(item => item.id).filter(Boolean));
    let id = object.id;
    let count = 1;
    while (existing.has(id)) {
      count += 1;
      id = `${object.id}_${count}`;
    }
    return { ...object, id };
  }

  duplicateSelectedObjects() {
    const entries = this.getSelectedEntries().filter(entry => {
      const def = EDITOR_CATEGORY_DEFS[entry.category];
      return def && !def.singleton && entry.category !== 'points';
    });
    if (!entries.length) return;
    this.pushHistory();
    const nextSelection = [];
    for (const entry of entries) {
      const def = EDITOR_CATEGORY_DEFS[entry.category];
      let clone = moveEditorObjectByDelta(entry.category, entry.object, EDITOR_DUPLICATE_OFFSET, EDITOR_DUPLICATE_OFFSET);
      clone = this.createUniqueObject(clone, def.collection);
      this.stage[def.collection].push(clone);
      nextSelection.push({ category: entry.category, index: this.stage[def.collection].length - 1 });
    }
    this.setMultiSelection(nextSelection);
    this.renderAll();
  }

  deleteSelectedObject() {
    const entries = this.getSelectedEntries().filter(entry => entry.category !== 'points');
    if (!entries.length) return;
    this.pushHistory();
    const byCategory = new Map();
    for (const entry of entries) {
      if (!byCategory.has(entry.category)) byCategory.set(entry.category, []);
      byCategory.get(entry.category).push(entry.index);
    }
    for (const [category, indexes] of byCategory) {
      const def = EDITOR_CATEGORY_DEFS[category];
      if (!def) continue;
      if (def.singleton) {
        this.stage[def.collection] = null;
      } else {
        indexes.sort((a, b) => b - a).forEach(index => this.stage[def.collection].splice(index, 1));
      }
    }
    this.selectedIndex = 0;
    this.selectedItems = this.getSelectedCollection().length ? [createEditorSelectionKey(this.selectedCategory, 0)] : [];
    this.renderAll();
  }

  updateOutput(mode) {
    this.output.value = mode === 'json' ? serializeStageToJson(this.stage) : serializeStageToJsModule(this.stage);
  }

  importJson() {
    try {
      const nextStage = parseStageJson(this.output.value);
      this.pushHistory();
      this.stage = nextStage;
      this.selectedCategory = 'platforms';
      this.selectedIndex = 0;
      this.selectedItems = [createEditorSelectionKey(this.selectedCategory, this.selectedIndex)];
      this.renderAll();
    } catch (error) {
      this.output.value = `JSON import error: ${error.message}`;
    }
  }

  openPreview() {
    writeStageEditorPreview(this.stage);
    window.open('./index.html?editorPreview=1', '_blank', 'noopener');
  }

  queueResizeRender() {
    cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => this.renderCanvas());
  }

  getVisibleStageRect() {
    const shell = this.canvas.parentElement;
    if (!shell) return { x: this.canvasViewBounds.x, y: this.canvasViewBounds.y, w: STAGE_EDITOR_VIEW.width, h: STAGE_EDITOR_VIEW.height };
    return getEditorVisibleStageRect(shell.scrollLeft, shell.scrollTop, shell.clientWidth, shell.clientHeight, this.canvasScale, this.canvasViewBounds);
  }

  getMouseStagePoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: this.canvasViewBounds.x + (event.clientX - rect.left) / this.canvasScale,
      y: this.canvasViewBounds.y + (event.clientY - rect.top) / this.canvasScale,
    };
  }

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
  }

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
  }

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
  }

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
  }

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
  }

  drawWorkspace(ctx, viewBounds) {
    ctx.fillStyle = 'rgba(250, 255, 245, 0.62)';
    ctx.fillRect(viewBounds.x, viewBounds.y, viewBounds.w, viewBounds.h);
  }

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
  }

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
  }

  drawStageBounds(ctx) {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(64, 96, 64, 0.72)';
    ctx.strokeRect(0, 0, this.stage.width, this.stage.height);
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(64, 96, 64, 0.28)';
    ctx.strokeRect(-0.5, -0.5, this.stage.width + 1, this.stage.height + 1);
    ctx.restore();
  }

  drawCameraFrames(ctx) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(96, 90, 130, 0.45)';
    for (let x = 0; x < this.stage.width; x += STAGE_EDITOR_VIEW.width) {
      ctx.strokeRect(x + 0.5, 0.5, STAGE_EDITOR_VIEW.width - 1, STAGE_EDITOR_VIEW.height - 1);
    }
  }

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
  }

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
  }

  isSelected(category, index) {
    return this.isObjectSelected(category, index) || (category === this.selectedCategory && index === this.selectedIndex);
  }

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
  }

  drawImage(ctx, imageKey, x, y, w, h, alpha = 1) {
    const img = this.getImage(imageKey);
    if (!img) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    return true;
  }

  drawImageBottomAligned(ctx, imageKey, rect, options = {}) {
    const img = this.getImage(imageKey);
    if (!img) return false;
    const visualH = options.h ?? rect.h;
    const visualW = options.w ?? visualH * (img.width / img.height);
    const x = rect.x + rect.w / 2 - visualW / 2 + (options.offsetX || 0);
    const y = rect.y + rect.h - visualH + (options.offsetY || 0);
    return this.drawImage(ctx, imageKey, x, y, visualW, visualH, options.alpha ?? 1);
  }

  drawObjectLabel(ctx, category, object, index, bounds) {
    ctx.fillStyle = '#304030';
    ctx.font = '10px sans-serif';
    ctx.fillText(getObjectLabel(category, object, index), bounds.x + 3, Math.max(10, bounds.y - 3));
  }

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
  }

  drawResizeHandle(ctx, bounds) {
    ctx.fillStyle = '#ff3366';
    const handleOffset = HANDLE_DRAW_SIZE / 2;
    ctx.fillRect(bounds.x + bounds.w - handleOffset, bounds.y + bounds.h - handleOffset, HANDLE_DRAW_SIZE, HANDLE_DRAW_SIZE);
  }

  drawRect(ctx, category, object, index, fill, stroke) {
    if (!object) return;
    const rect = getStageObjectBounds(this.stage, category, object);
    if (!isFiniteEditorBounds(rect)) return;
    ctx.fillStyle = fill;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    this.drawCollisionBounds(ctx, category, object, index, rect, stroke, 'rgba(255,255,255,0.08)');
    this.drawObjectLabel(ctx, category, object, index, rect);
  }

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
  }

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
  }

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
  }

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
  }

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
  }


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
  }

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
  }

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
  }

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
  }

  drawGoal(ctx, object, index) {
    const rect = getStageObjectBounds(this.stage, 'points', object);
    if (!isFiniteEditorBounds(rect)) return;
    const def = resolveGoalDef(object.variant || GOAL_DEFAULT_VARIANT);
    const imageKey = getEditorObjectImageKey('points', object);
    const ok = imageKey && this.drawImageBottomAligned(ctx, imageKey, rect, def.draw || {});
    if (!ok) this.drawPoint(ctx, 'points', object, index, '#e879a8');
    this.drawCollisionBounds(ctx, 'points', object, index, rect, '#9a4d6d');
    this.drawObjectLabel(ctx, 'points', object, index, rect);
  }

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
  }

  drawCircle(ctx, category, object, index, fill, stroke) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = this.isSelected(category, index) ? '#ff3366' : stroke;
    ctx.lineWidth = this.isSelected(category, index) ? 3 : 1;
    ctx.beginPath();
    ctx.arc(object.x, object.y, object.r || 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}
