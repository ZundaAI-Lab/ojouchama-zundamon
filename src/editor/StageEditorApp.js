/**
 * 責務: editor.html専用のステージ編集UI、履歴、ステージ入出力、分割済み編集パネルの接続を統括する。
 * 更新ルール: Canvas入力・Canvas描画・会話編集・フォーム値変換は責務別モジュールへ委譲し、ここへ再統合しない。
 * 更新ルール: ゲーム本体Runtimeの生成責務は持たず、プレビューはstageEditorPreviewBridge経由で一時ステージを渡すだけにする。
 */
import { STAGES, STAGE_ROUTES } from '../data/stages.js';
import { normalizeStageDefinition } from '../data/stageSchema.js';
import { createEditorStage, cloneEditorValue, STAGE_EDITOR_GRID_SIZE, STAGE_EDITOR_VIEW } from './stageEditorSchema.js';
import { EDITOR_CATEGORY_DEFS, EDITOR_DIALOGUE_DEFS, EDITOR_OBJECT_PRESETS, EDITOR_FIELD_GROUPS, getEditorFieldGroupsForObject, getResidentDefinitionValue } from './stageEditorCatalog.js';
import { GOAL_DEFAULT_VARIANT, GOAL_VARIANT_OPTIONS } from '../data/goalDefs.js';
import { ASSET_MANIFEST } from '../data/assetManifest.js';
import { hasValidationErrors, validateEditorStage } from './stageEditorValidation.js';
import { createStageDownloadName, parseStageJson, resolveStageSourcePath, serializeStageToJsModule, serializeStageToJson } from './stageEditorSerializer.js';
import { writeStageEditorPreview } from './stageEditorPreviewBridge.js';
import { stageEditorDialoguePanelMethods } from './StageEditorDialoguePanel.js';
import { stageEditorCanvasInputMethods } from './StageEditorCanvasInput.js';
import { stageEditorCanvasViewMethods } from './StageEditorCanvasView.js';
import { EDITOR_CANVAS_OUTSIDE_MARGIN, EDITOR_CANVAS_ZOOM } from './stageEditorGeometry.js';
import { EDITOR_DUPLICATE_OFFSET, moveEditorObjectByDelta, placeEditorObjectInVisibleRect } from './stageEditorObjectMutation.js';
import { createEditorSelectionKey, getEditorCollectionObjects, parseEditorSelectionKey } from './stageEditorSelection.js';
import { createFieldset, createInputField, createOption, fieldKeySet, flattenFieldGroups, getFieldRootKey, getObjectLabel, getPathValue, inferFieldFromValue, isObject, isRuntimePrivateEditorKey, normalizeFieldValue, setPathValue, setText } from './stageEditorFields.js';


const EDITABLE_COLLECTIONS = Object.keys(EDITOR_CATEGORY_DEFS);
const RESIDENT_TYPE_RESET_KEEP_KEYS = new Set(['x', 'y', 'minX', 'maxX']);
const PLATFORM_KIND_RESET_KEEP_KEYS = new Set(['x', 'y', 'w', 'h', 'active', 'switchId', 'activeWhenOn']);
const SPECIAL_EVENT_KIND_RESET_KEEP_KEYS = new Set(['id', 'groupId', 'active', 'x', 'y', 'w', 'h']);


function $(id) {
  return document.getElementById(id);
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
    return this.applyFieldDefaults(nextObject, getEditorFieldGroupsForObject('platforms', nextObject));
  }

  applyFieldDefaults(object, fieldGroups) {
    const nextObject = cloneEditorValue(object);
    for (const field of flattenFieldGroups(fieldGroups)) {
      if (field.defaultValue === undefined) continue;
      if (getPathValue(nextObject, field.key) !== undefined) continue;
      setPathValue(nextObject, field.key, cloneEditorValue(field.defaultValue));
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

}

Object.assign(
  StageEditorApp.prototype,
  stageEditorDialoguePanelMethods,
  stageEditorCanvasInputMethods,
  stageEditorCanvasViewMethods,
);
