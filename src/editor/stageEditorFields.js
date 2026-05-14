/**
 * 責務: ステージエディタのフォーム生成、値正規化、表示ラベル生成を管理する。
 * 更新ルール: StageEditorApp本体の状態は持たず、フォーム部品とフィールド値変換だけを追加する。
 */
import { STAGE_EDITOR_GRID_SIZE } from './stageEditorSchema.js';
import { EDITOR_CATEGORY_DEFS } from './stageEditorCatalog.js';

const JSON_FIELDS = new Set(['triggerBy', 'behaviorParams', 'config', 'hazards', 'start', 'goal', 'respawn', 'route', 'residents', 'clockInputs']);

export function createOption(value, label = value) {
  const option = document.createElement('option');
  option.value = String(value);
  option.textContent = label;
  return option;
}

export function normalizeSelectOption(option) {
  if (option && typeof option === 'object') return { value: option.value, label: option.label ?? option.value };
  return { value: option, label: option };
}

export function setText(el, text) {
  if (el) el.textContent = text;
}

export function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

export function getPathValue(source, path) {
  if (!path) return undefined;
  return path.split('.').reduce((current, part) => current?.[part], source);
}

export function setPathValue(target, path, value) {
  const parts = path.split('.');
  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!isObject(current[part])) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

export function flattenFieldGroups(groups) {
  return groups.flatMap(group => group.fields || []);
}

export function fieldKeySet(groups) {
  return new Set(flattenFieldGroups(groups).map(field => field.key));
}

export function getFieldRootKey(key) {
  return key.split('.')[0];
}

export function isRuntimePrivateEditorKey(key) {
  return [
    'id', 'age', 'alive', 'vx', 'vy', 'spawnX', 'spawnY', 'baseX', 'baseY', 'stunTimer',
    'attackFlash', 'blackboard', 'onGround', 'balloonBirdDive', 'balloonBirdDiveTimer',
    'balloonBirdCooldownTimer', 'balloonBirdDiveStart', 'balloonBirdDiveTarget',
  ].includes(key);
}

export function inferFieldFromValue(key, value) {
  if (typeof value === 'boolean') return { key, label: key, type: 'checkbox' };
  if (typeof value === 'number') return { key, label: key, type: 'number', step: key === 'duration' || key === 'hp' ? 1 : STAGE_EDITOR_GRID_SIZE };
  if (isObject(value) || Array.isArray(value)) return { key, label: key, type: 'json' };
  return { key, label: key, type: 'text' };
}

export function createFieldset(group) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'editor-fieldset';
  if (group.label) {
    const legend = document.createElement('legend');
    legend.textContent = group.label;
    fieldset.append(legend);
  }
  return fieldset;
}

export function normalizeFieldValue(input, field, previousValue = undefined) {
  if (field.type === 'checkbox') return input.checked;
  if (field.type === 'number') return Number(input.value || 0);
  if (field.type === 'select' && field.valueType === 'number') return Number(input.value || 0);
  if (field.type === 'json') {
    try {
      const value = JSON.parse(input.value || 'null');
      input.classList.remove('editor-json-error');
      input.setCustomValidity?.('');
      delete input.dataset.invalidJson;
      return value;
    } catch (error) {
      input.classList.add('editor-json-error');
      input.dataset.invalidJson = '1';
      input.setCustomValidity?.(`JSONの形式が不正です: ${error.message}`);
      return previousValue;
    }
  }
  return input.value;
}

export function formatFieldValue(value, field) {
  if (field.type === 'json' || JSON_FIELDS.has(field.key) || isObject(value) || Array.isArray(value)) {
    return JSON.stringify(value ?? null, null, 2);
  }
  return value ?? '';
}

export function getObjectLabel(category, object, index) {
  if (category === 'points') return object.key === 'playerStart' ? '開始位置' : 'ゴール';
  if (category === 'areas') return `${object.name || object.id || 'area'} (${object.startX}-${object.endX})`;
  if (object?.id) return object.id;
  if (object?.kind) return `${object.kind} #${index + 1}`;
  if (object?.type) return `${object.type} #${index + 1}`;
  return `${EDITOR_CATEGORY_DEFS[category]?.label || category} #${index + 1}`;
}

export function createInputField(field, value) {
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

