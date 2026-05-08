/**
 * 責務: サウンドエディタの一覧、検証表示、共通フォームHTML生成を管理する。
 * 更新ルール: BGM/SFX固有フォームの編集処理は専用パネルへ置く。
 */
import { validateBgmTrackDefs, validateSfxDefs } from './audioEditorValidation.js';
import { optionHtml } from './audioEditorCatalog.js';
import { $, escapeHtml, firstInstrumentId, firstSectionName } from './audioEditorFormUtils.js';

export const audioEditorListPanelMethods = {
renderListsAndValidation() {
    this.renderList();
    this.renderValidation();
  },

renderList() {
    const list = $('#audio-item-list', this.root);
    if (this.mode === 'bgm') {
      const selected = this.selectedBgmId;
      list.innerHTML = Object.entries(this.bgmDefs).map(([id, def]) => `
        <button type="button" class="audio-list-item${id === selected ? ' is-selected' : ''}" data-id="${escapeHtml(id)}">
          <strong>${escapeHtml(def.title || id)}</strong><span>${escapeHtml(def.world || id)} / ${escapeHtml(id)}</span>
        </button>
      `).join('');
      list.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
        this.commitCurrentForm();
        this.selectedBgmId = button.dataset.id;
        this.selectedSectionName = firstSectionName(this.currentBgmDef());
        this.selectedInstrumentId = firstInstrumentId(this.currentBgmDef());
        this.selectedEventIndex = 0;
        this.render();
      }));
      return;
    }

    const selected = this.selectedSfxId;
    list.innerHTML = Object.entries(this.sfxDefs).map(([id, def]) => `
      <button type="button" class="audio-list-item${id === selected ? ' is-selected' : ''}" data-id="${escapeHtml(id)}">
        <strong>${escapeHtml(def.name || id)}</strong><span>${escapeHtml(id)}</span>
      </button>
    `).join('');
    list.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      this.commitCurrentForm();
      this.selectedSfxId = button.dataset.id;
      this.selectedVoiceIndex = 0;
      this.render();
    }));
  },

renderValidation() {
    const messages = this.mode === 'bgm' ? validateBgmTrackDefs(this.bgmDefs) : validateSfxDefs(this.sfxDefs);
    $('#audio-validation-list', this.root).innerHTML = messages.map(message => `<li class="${message.level}">${escapeHtml(message.text)}</li>`).join('');
  },

inputRow(key, label, value, attrs = '') {
    return `<label><span>${label}</span><input name="${key}" value="${escapeHtml(value ?? '')}" ${attrs}></label>`;
  },

numberRow(key, label, value, attrs = '') {
    return this.inputRow(key, label, value, `type="number" ${attrs}`);
  },

selectRow(key, label, value, options) {
    return `<label><span>${label}</span><select name="${key}">${optionHtml(options, value)}</select></label>`;
  },

textareaRow(key, label, value, hint = '') {
    return `<label class="is-wide"><span>${label}</span><textarea name="${key}" spellcheck="false" placeholder="${escapeHtml(hint)}">${escapeHtml(value ?? '')}</textarea></label>`;
  }
};
