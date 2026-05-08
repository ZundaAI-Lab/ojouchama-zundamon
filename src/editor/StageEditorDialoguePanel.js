/**
 * 責務: ステージエディタの会話編集パネル、会話行モデル、プレビュー表示を管理する。
 * 更新ルール: Canvas操作やステージ入出力は持たず、会話データの編集UIだけを追加する。
 */
import { EDITOR_DIALOGUE_DEFAULT_LINE, EDITOR_DIALOGUE_DEFS, EDITOR_DIALOGUE_PORTRAIT_OPTIONS } from './stageEditorCatalog.js';
import { createOption, setText } from './stageEditorFields.js';

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

export const stageEditorDialoguePanelMethods = {
openDialogueEditor() {
    this.dialogueState.index = this.clampDialogueIndex(this.dialogueState.key, this.dialogueState.index);
    this.renderDialogueEditor();
    if (this.dialogueDialog?.showModal) this.dialogueDialog.showModal();
    else this.dialogueDialog?.setAttribute('open', '');
  },

closeDialogueEditor() {
    if (this.dialogueDialog?.close) this.dialogueDialog.close();
    else this.dialogueDialog?.removeAttribute('open');
  },

getDialogueDef(key = this.dialogueState.key) {
    return EDITOR_DIALOGUE_DEFS.find(def => def.key === key) || EDITOR_DIALOGUE_DEFS[0];
  },

getDialogueLines(key = this.dialogueState.key) {
    const current = this.stage[key];
    if (!Array.isArray(current)) this.stage[key] = [];
    return this.stage[key];
  },

clampDialogueIndex(key = this.dialogueState.key, index = this.dialogueState.index) {
    const lines = this.getDialogueLines(key);
    if (!lines.length) return 0;
    return Math.max(0, Math.min(lines.length - 1, index));
  },

getSelectedDialogueLine() {
    const lines = this.getDialogueLines();
    return lines[this.dialogueState.index] || null;
  },

renderDialogueEditor() {
    if (!this.dialogueTabs || !this.dialogueWindowList || !this.dialogueForm || !this.dialoguePreview) return;
    this.dialogueState.index = this.clampDialogueIndex();
    this.renderDialogueTabs();
    this.renderDialogueWindowList();
    this.renderDialogueForm();
    this.renderDialoguePreview();
  },

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
  },

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
  },

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
  },

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
  },

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
  },

updateDialoguePortraitPreview(portraitKey) {
    if (!this.dialoguePortraitPreview) return;
    const img = this.getImage(portraitKey);
    this.dialoguePortraitPreview.src = img?.src || '';
    this.dialoguePortraitPreview.alt = portraitKey || '';
  },

selectDialogueEvent(event) {
    const button = event.target.closest('button[data-dialogue-key]');
    if (!button) return;
    this.dialogueState.key = button.dataset.dialogueKey;
    this.dialogueState.index = this.clampDialogueIndex(this.dialogueState.key, 0);
    this.renderDialogueEditor();
  },

selectDialogueWindow(event) {
    const button = event.target.closest('button[data-index]');
    if (!button) return;
    this.dialogueState.index = this.clampDialogueIndex(this.dialogueState.key, Number(button.dataset.index));
    this.renderDialogueEditor();
  },

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
  },

getDialogueInsertionSeed() {
    const current = this.getSelectedDialogueLine();
    if (!current) return EDITOR_DIALOGUE_DEFAULT_LINE;
    const line = normalizeEditorDialogueLine(current);
    return { portrait: line.portrait, speaker: line.speaker, text: '' };
  },

addDialogueWindow() {
    this.pushHistory();
    const lines = this.getDialogueLines();
    lines.push(createEditorDialogueLine(this.getDialogueInsertionSeed()));
    this.dialogueState.index = lines.length - 1;
    this.renderDialogueEditor();
    this.renderValidation();
    this.updateHistoryButtons();
  },

insertDialogueWindow() {
    this.pushHistory();
    const lines = this.getDialogueLines();
    const index = lines.length ? this.dialogueState.index : 0;
    lines.splice(index, 0, createEditorDialogueLine(this.getDialogueInsertionSeed()));
    this.dialogueState.index = index;
    this.renderDialogueEditor();
    this.renderValidation();
    this.updateHistoryButtons();
  },

deleteDialogueWindow() {
    const lines = this.getDialogueLines();
    if (!lines.length) return;
    this.pushHistory();
    lines.splice(this.dialogueState.index, 1);
    this.dialogueState.index = this.clampDialogueIndex();
    this.renderDialogueEditor();
    this.renderValidation();
    this.updateHistoryButtons();
  },

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
};
