/**
 * 責務: ステージエディタの選択キー、編集対象コレクション、ヒットテスト順を管理する。
 * 更新ルール: オブジェクトの変更やCanvas描画は持たず、選択対象の列挙だけを追加する。
 */
import { EDITOR_CATEGORY_DEFS } from './stageEditorCatalog.js';
import { getStageObjectBounds, isFiniteEditorBounds } from './stageEditorObjectMetrics.js';

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

export function createEditorSelectionKey(category, index) {
  return `${category}:${index}`;
}

export function parseEditorSelectionKey(key) {
  const [category, indexText] = String(key).split(':');
  return { category, index: Number(indexText) };
}

export function getEditorCollectionObjects(stage, category) {
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

