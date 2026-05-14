/**
 * 責務: SFX定義のフォーム編集とvoice配列のCRUDを管理する。
 * 更新ルール: BGM編集やタイムライン操作は持たず、SFXデータ更新だけを追加する。
 */
import { deepClone, normalizeId, normalizeSfxDefinition, normalizeSfxVoice } from '../../data/audio/audioSchema.js';
import { SFX_NEW_PRESET, SFX_TYPE_OPTIONS, SFX_WAVEFORM_OPTIONS } from './audioEditorCatalog.js';
import { $, escapeHtml, numberList, parseJsonValue, toPrettyJson } from './audioEditorFormUtils.js';
import { sfxCategoryForId } from './audioEditorSfxCategories.js';

export const sfxEditorPanelMethods = {
renderSfxEditor() {
    const def = normalizeSfxDefinition(this.currentSfxDef(), this.selectedSfxId);
    this.selectedVoiceIndex = Math.min(this.selectedVoiceIndex, def.voices.length - 1);
    const voice = def.voices[this.selectedVoiceIndex] || def.voices[0];
    const form = $('#audio-editor-form', this.root);
    form.className = 'audio-editor-form sfx-form';
    form.innerHTML = `
      <section class="audio-form-card"><h2>SE基本</h2><div class="audio-form-grid">
        ${this.inputRow('id', 'ID', def.id)}
        ${this.inputRow('name', '名前', def.name)}
        ${this.numberRow('gain', 'ゲイン', def.gain, 'step="0.01" min="0" max="2"')}
      </div></section>
      <section class="audio-form-card voice-card"><div class="audio-card-title"><h2>Voice</h2><div class="audio-button-row"><button id="add-voice-btn" type="button">追加</button><button id="clone-voice-btn" type="button">複製</button><button id="delete-voice-btn" type="button">削除</button></div></div>
        <div id="voice-list" class="voice-list">${def.voices.map((item, index) => `<button type="button" data-index="${index}" class="${index === this.selectedVoiceIndex ? 'is-selected' : ''}">#${index + 1}<span>${escapeHtml(item.type)}/${escapeHtml(item.waveform)}</span></button>`).join('')}</div>
        <div class="audio-form-grid">
          ${this.selectRow('voiceType', 'type', voice.type, SFX_TYPE_OPTIONS)}
          ${this.selectRow('waveform', 'waveform', voice.waveform, SFX_WAVEFORM_OPTIONS)}
          ${this.numberRow('offset', 'offset', voice.offset || 0, 'step="0.001" min="0"')}
          ${this.numberRow('startFreq', 'startFreq', voice.startFreq, 'step="1" min="20"')}
          ${this.numberRow('endFreq', 'endFreq', voice.endFreq ?? '', 'step="1" min="20"')}
          ${this.numberRow('duration', 'duration', voice.duration, 'step="0.001" min="0.01"')}
          ${this.numberRow('volume', 'volume', voice.volume, 'step="0.001" min="0" max="1"')}
          ${this.numberRow('attack', 'attack', voice.attack, 'step="0.001" min="0.001"')}
          ${this.numberRow('release', 'release', voice.release, 'step="0.001" min="0.001"')}
          ${this.numberRow('pan', 'pan', voice.pan || 0, 'step="0.01" min="-1" max="1"')}
          ${this.numberRow('filterFreq', 'filterFreq', voice.filterFreq ?? '', 'step="10" min="20"')}
          ${this.textareaRow('notes', 'notes/chord', Array.isArray(voice.notes) ? voice.notes.join(', ') : '', '0, 4, 7')}
          ${this.textareaRow('steps', 'steps JSON', toPrettyJson(voice.steps), '[{"offset":0,"startFreq":620}]')}
        </div>
      </section>
    `;
    form.querySelectorAll('input, select, textarea').forEach(input => input.addEventListener('change', () => this.commitCurrentForm()));
    $('#voice-list', form).querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      this.commitCurrentForm();
      this.selectedVoiceIndex = Number(button.dataset.index);
      this.renderSfxEditor();
    }));
    $('#add-voice-btn', form).addEventListener('click', () => this.addVoice());
    $('#clone-voice-btn', form).addEventListener('click', () => this.cloneVoice());
    $('#delete-voice-btn', form).addEventListener('click', () => this.deleteVoice());
  },

commitSfxForm() {
    const form = $('#audio-editor-form', this.root);
    if (!form || !form.classList.contains('sfx-form')) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const oldId = this.selectedSfxId;
    const requestedId = normalizeId(data.id, oldId);
    const nextId = requestedId !== oldId && this.sfxDefs[requestedId] ? oldId : requestedId;
    const source = deepClone(this.sfxDefs[oldId]);
    const categoryId = sfxCategoryForId(this.sfxCategoryById, oldId);
    const currentVoice = source.voices?.[this.selectedVoiceIndex] || {};
    const voice = {
      type: data.voiceType,
      waveform: data.waveform,
      offset: Number(data.offset),
      startFreq: Number(data.startFreq),
      endFreq: data.endFreq === '' ? undefined : Number(data.endFreq),
      duration: Number(data.duration),
      volume: Number(data.volume),
      attack: Number(data.attack),
      release: Number(data.release),
      pan: Number(data.pan),
      filterFreq: data.filterFreq === '' ? undefined : Number(data.filterFreq),
      notes: data.notes ? numberList(data.notes) : undefined,
      steps: parseJsonValue(data.steps, currentVoice.steps),
    };
    Object.keys(voice).forEach(key => voice[key] === undefined && delete voice[key]);
    source.id = nextId;
    source.name = data.name;
    source.gain = Number(data.gain);
    source.voices[this.selectedVoiceIndex] = normalizeSfxVoice(voice);
    if (nextId !== oldId) {
      delete this.sfxDefs[oldId];
      delete this.sfxCategoryById[oldId];
    }
    this.sfxDefs[nextId] = normalizeSfxDefinition(source, nextId);
    this.sfxCategoryById[nextId] = categoryId;
    this.selectedSfxId = nextId;
  },

createSfx() {
    const base = deepClone(SFX_NEW_PRESET);
    const categoryId = sfxCategoryForId(this.sfxCategoryById, this.selectedSfxId);
    let index = 1;
    let id = base.id;
    while (this.sfxDefs[id]) {
      index += 1;
      id = `${base.id}_${index}`;
    }
    base.id = id;
    base.name = `${base.name} ${index}`;
    this.sfxDefs[id] = base;
    this.sfxCategoryById[id] = categoryId;
    this.selectedSfxId = id;
    this.selectedVoiceIndex = 0;
    this.render();
  },

cloneSfx() {
    const source = deepClone(this.currentSfxDef());
    const categoryId = sfxCategoryForId(this.sfxCategoryById, this.selectedSfxId);
    let index = 1;
    let id = `${source.id}_copy`;
    while (this.sfxDefs[id]) {
      index += 1;
      id = `${source.id}_copy_${index}`;
    }
    source.id = id;
    source.name = `${source.name || source.id} 複製`;
    this.sfxDefs[id] = source;
    this.sfxCategoryById[id] = categoryId;
    this.selectedSfxId = id;
    this.selectedVoiceIndex = 0;
    this.render();
  },

deleteSfx() {
    if (Object.keys(this.sfxDefs).length <= 1) return;
    delete this.sfxDefs[this.selectedSfxId];
    delete this.sfxCategoryById[this.selectedSfxId];
    this.selectedSfxId = Object.keys(this.sfxDefs)[0];
    this.selectedVoiceIndex = 0;
    this.render();
  },

addVoice() {
    this.commitSfxForm();
    const def = this.currentSfxDef();
    def.voices.push(deepClone(SFX_NEW_PRESET.voices[0]));
    this.selectedVoiceIndex = def.voices.length - 1;
    this.render();
  },

cloneVoice() {
    this.commitSfxForm();
    const def = this.currentSfxDef();
    def.voices.splice(this.selectedVoiceIndex + 1, 0, deepClone(def.voices[this.selectedVoiceIndex]));
    this.selectedVoiceIndex += 1;
    this.render();
  },

deleteVoice() {
    this.commitSfxForm();
    const def = this.currentSfxDef();
    if (def.voices.length <= 1) return;
    def.voices.splice(this.selectedVoiceIndex, 1);
    this.selectedVoiceIndex = Math.max(0, this.selectedVoiceIndex - 1);
    this.render();
  }
};
