/**
 * 責務: sound-editor.htmlのサウンドエディタUIを管理し、BGM/SE定義の編集・試聴・JS出力を行う。
 * 更新ルール: ゲーム実行時のAudioSystemには依存せず、BGMのパート編集はタイムライン、SEの発音編集はvoiceフォーム、試聴は audioEditorPreviewBridge.js へ委譲する。
 */
import { BGM_TRACK_DEFS } from '../../data/audio/bgmTrackDefs.js';
import { SFX_DEFS } from '../../data/audio/sfxDefs.js';
import { deepClone, normalizeId, normalizeSfxDefinition, normalizeSfxVoice } from '../../data/audio/audioSchema.js';
import { AudioEditorPreviewBridge } from './audioEditorPreviewBridge.js';
import {
  BGM_BUILTIN_INSTRUMENT_IDS,
  BGM_GRID_STEPS,
  BGM_INSTRUMENT_KIND_OPTIONS,
  BGM_NEW_PRESET,
  BGM_SECTION_ORDER,
  BGM_WAVEFORM_OPTIONS,
  SFX_NEW_PRESET,
  SFX_TYPE_OPTIONS,
  SFX_WAVEFORM_OPTIONS,
  optionHtml,
  sectionSort,
} from './audioEditorCatalog.js';
import { bgmTrackOutputPath, downloadText, serializeBgmTrackDef, serializeSfxDefs } from './audioEditorSerializer.js';
import { validateBgmTrackDefs, validateSfxDefs } from './audioEditorValidation.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const BGM_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const INSTRUMENT_ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const DRUM_NOTES = new Set(['kick', 'snare', 'hat']);

function numberList(value) {
  return String(value || '').split(',').map(item => Number(item.trim())).filter(Number.isFinite);
}

function parseJsonValue(text, fallback = undefined) {
  const source = String(text || '').trim();
  if (!source) return fallback;
  try {
    return JSON.parse(source);
  } catch {
    return fallback;
  }
}

function toPrettyJson(value) {
  return value ? JSON.stringify(value, null, 2) : '';
}

function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function roundToGrid(value, grid = 0.25) {
  return Math.max(0, Math.round(Number(value || 0) / grid) * grid);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function normalizeBgmId(value, fallback = 'new-bgm') {
  const id = String(value || fallback).trim().replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return BGM_ID_PATTERN.test(id) ? id : fallback;
}

function normalizeInstrumentId(value, fallback = 'lead') {
  const id = String(value || fallback).trim().replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
  return INSTRUMENT_ID_PATTERN.test(id) ? id : fallback;
}

function parseNoteValue(value) {
  const source = String(value || '').trim();
  if (!source) return 'C5';
  if (source.includes(',')) return source.split(',').map(item => item.trim()).filter(Boolean);
  return source;
}

function noteText(value) {
  return Array.isArray(value) ? value.join(', ') : String(value ?? '');
}

function cleanObject(value) {
  Object.keys(value).forEach(key => value[key] === undefined && delete value[key]);
  return value;
}

function sectionNames(track) {
  return Array.from(new Set([
    ...BGM_SECTION_ORDER.filter(name => track.sections?.[name] || track.sectionBars?.[name]),
    ...Object.keys(track.sections || {}),
    ...Object.keys(track.sectionBars || {}),
  ])).sort(sectionSort);
}

function ensureBgmShape(raw = {}) {
  const track = deepClone(raw || BGM_NEW_PRESET);
  track.id = normalizeBgmId(track.id, BGM_NEW_PRESET.id);
  track.title = String(track.title || track.id);
  track.world = String(track.world || '');
  track.description = String(track.description || '');
  track.tempo = clampNumber(track.tempo, 1, 320, 120);
  track.meter = Array.isArray(track.meter) && track.meter.length >= 2 ? [clampNumber(track.meter[0], 1, 32, 4), clampNumber(track.meter[1], 1, 32, 4)] : [4, 4];
  track.key = String(track.key || 'C Major');
  track.instruments = track.instruments && typeof track.instruments === 'object' ? track.instruments : deepClone(BGM_NEW_PRESET.instruments);
  track.sections = track.sections && typeof track.sections === 'object' ? track.sections : deepClone(BGM_NEW_PRESET.sections);
  track.sectionBars = track.sectionBars && typeof track.sectionBars === 'object' ? track.sectionBars : {};
  for (const name of sectionNames(track)) {
    const bars = clampNumber(track.sectionBars[name] ?? (name === 'intro' ? track.introBars : 4), 1, 64, name === 'intro' ? 2 : 8);
    track.sectionBars[name] = bars;
    if (name === 'intro') track.introBars = bars;
    track.sections[name] = Array.isArray(track.sections[name]) ? track.sections[name].map(event => cleanObject({
      t: roundToGrid(event.t, 0.001),
      n: Array.isArray(event.n) ? event.n.map(String) : String(event.n ?? 'C5'),
      d: clampNumber(event.d, 0.01, 64, 0.5),
      i: String(event.i || Object.keys(track.instruments)[0] || 'lead'),
      v: clampNumber(event.v, 0, 1.5, 0.7),
    })).sort((a, b) => a.t - b.t || String(a.i).localeCompare(String(b.i))) : [];
  }
  return track;
}


function timelineInstrumentIds(track) {
  const ids = new Set([...BGM_BUILTIN_INSTRUMENT_IDS, ...Object.keys(track.instruments || {})]);
  Object.values(track.sections || {}).forEach(events => {
    (events || []).forEach(event => ids.add(String(event.i || 'lead')));
  });
  return Array.from(ids).filter(Boolean);
}

function firstInstrumentId(track) {
  return Object.keys(track.instruments || {})[0] || 'lead';
}

function firstSectionName(track) {
  return sectionNames(track)[0] || 'intro';
}

function sectionBeatLength(track, sectionName) {
  const bars = Number(track.sectionBars?.[sectionName] ?? (sectionName === 'intro' ? track.introBars : 4)) || 4;
  const beatsPerBar = Number(track.meter?.[0]) || 4;
  return Math.max(1, bars * beatsPerBar);
}

function eventLabel(event) {
  return `${noteText(event.n)} / ${event.i}`;
}

export class AudioEditorApp {
  constructor(root) {
    this.root = root;
    this.mode = 'bgm';
    this.bgmDefs = Object.fromEntries(Object.entries(BGM_TRACK_DEFS).map(([id, track]) => [id, ensureBgmShape(track)]));
    this.sfxDefs = deepClone(SFX_DEFS);
    this.selectedBgmId = Object.keys(this.bgmDefs)[0];
    this.selectedSfxId = Object.keys(this.sfxDefs)[0];
    this.selectedSectionName = firstSectionName(this.currentBgmDef());
    this.selectedInstrumentId = firstInstrumentId(this.currentBgmDef());
    this.selectedEventIndex = 0;
    this.selectedVoiceIndex = 0;
    this.timelineDrag = null;
    this.preview = new AudioEditorPreviewBridge();
  }

  init() {
    this.bindStaticActions();
    this.render();
  }

  bindStaticActions() {
    $('#tab-bgm', this.root).addEventListener('click', () => this.switchMode('bgm'));
    $('#tab-sfx', this.root).addEventListener('click', () => this.switchMode('sfx'));
    $('#new-audio-btn', this.root).addEventListener('click', () => this.createCurrent());
    $('#clone-audio-btn', this.root).addEventListener('click', () => this.cloneCurrent());
    $('#delete-audio-btn', this.root).addEventListener('click', () => this.deleteCurrent());
    $('#preview-audio-btn', this.root).addEventListener('click', () => this.previewCurrent());
    $('#stop-preview-btn', this.root).addEventListener('click', () => this.preview.stop());
    $('#export-bgm-btn', this.root).addEventListener('click', () => this.exportBgm());
    $('#export-sfx-btn', this.root).addEventListener('click', () => this.exportSfx());
    $('#download-output-btn', this.root).addEventListener('click', () => this.downloadOutput());
    $('#copy-output-btn', this.root).addEventListener('click', () => navigator.clipboard?.writeText($('#audio-export-output', this.root).value));
  }

  switchMode(mode) {
    if (this.mode === mode) return;
    this.commitCurrentForm();
    this.mode = mode;
    this.preview.stop();
    this.render();
  }

  currentBgmDef() {
    return this.bgmDefs[this.selectedBgmId];
  }

  currentSfxDef() {
    return this.sfxDefs[this.selectedSfxId];
  }

  currentDef() {
    return this.mode === 'bgm' ? this.currentBgmDef() : this.currentSfxDef();
  }

  createCurrent() {
    if (this.mode === 'bgm') return this.createBgm();
    return this.createSfx();
  }

  cloneCurrent() {
    if (this.mode === 'bgm') return this.cloneBgm();
    return this.cloneSfx();
  }

  deleteCurrent() {
    if (this.mode === 'bgm') return this.deleteBgm();
    return this.deleteSfx();
  }

  previewCurrent() {
    this.commitCurrentForm();
    if (this.mode === 'bgm') this.preview.playBgm(this.currentBgmDef(), this.selectedSectionName);
    else this.preview.playSfx(this.currentSfxDef());
  }

  previewSelectedTimelineEvent() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const events = track?.sections?.[this.selectedSectionName] || [];
    if (this.selectedEventIndex === null || !events[this.selectedEventIndex]) return;
    this.preview.playBgmEvent(track, this.selectedSectionName, this.selectedEventIndex);
  }

  exportBgm() {
    this.commitCurrentForm();
    const track = this.currentBgmDef();
    $('#audio-export-path', this.root).textContent = bgmTrackOutputPath(track);
    $('#audio-export-output', this.root).value = serializeBgmTrackDef(track);
  }

  exportSfx() {
    this.commitCurrentForm();
    $('#audio-export-path', this.root).textContent = 'src/data/audio/sfxDefs.js';
    $('#audio-export-output', this.root).value = serializeSfxDefs(this.sfxDefs);
  }

  downloadOutput() {
    const output = $('#audio-export-output', this.root).value;
    const path = $('#audio-export-path', this.root).textContent;
    if (!output || !path) return;
    downloadText(path.split('/').pop(), output);
  }

  commitCurrentForm() {
    if (this.mode === 'bgm') this.commitBgmForm();
    else this.commitSfxForm();
    this.renderListsAndValidation();
  }

  render() {
    $('#tab-bgm', this.root).classList.toggle('is-active', this.mode === 'bgm');
    $('#tab-sfx', this.root).classList.toggle('is-active', this.mode === 'sfx');
    $('#tab-bgm', this.root).setAttribute('aria-selected', String(this.mode === 'bgm'));
    $('#tab-sfx', this.root).setAttribute('aria-selected', String(this.mode === 'sfx'));
    this.renderListsAndValidation();
    if (this.mode === 'bgm') this.renderBgmEditor();
    else this.renderSfxEditor();
  }

  renderListsAndValidation() {
    this.renderList();
    this.renderValidation();
  }

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
  }

  renderValidation() {
    const messages = this.mode === 'bgm' ? validateBgmTrackDefs(this.bgmDefs) : validateSfxDefs(this.sfxDefs);
    $('#audio-validation-list', this.root).innerHTML = messages.map(message => `<li class="${message.level}">${escapeHtml(message.text)}</li>`).join('');
  }

  inputRow(key, label, value, attrs = '') {
    return `<label><span>${label}</span><input name="${key}" value="${escapeHtml(value ?? '')}" ${attrs}></label>`;
  }

  numberRow(key, label, value, attrs = '') {
    return this.inputRow(key, label, value, `type="number" ${attrs}`);
  }

  selectRow(key, label, value, options) {
    return `<label><span>${label}</span><select name="${key}">${optionHtml(options, value)}</select></label>`;
  }

  textareaRow(key, label, value, hint = '') {
    return `<label class="is-wide"><span>${label}</span><textarea name="${key}" spellcheck="false" placeholder="${escapeHtml(hint)}">${escapeHtml(value ?? '')}</textarea></label>`;
  }

  sectionTabs(track) {
    return sectionNames(track).map(name => `
      <button type="button" class="section-tab${name === this.selectedSectionName ? ' is-active' : ''}" data-section="${escapeHtml(name)}">${escapeHtml(name)}</button>
    `).join('');
  }

  instrumentButtons(track) {
    return Object.entries(track.instruments || {}).map(([id, instrument]) => `
      <button type="button" class="instrument-pill${id === this.selectedInstrumentId ? ' is-selected' : ''}" data-instrument="${escapeHtml(id)}">
        ${escapeHtml(id)}<span>${escapeHtml(instrument.kind || 'tone')}</span>
      </button>
    `).join('');
  }

  renderBgmTimeline(track) {
    const sectionName = this.selectedSectionName;
    const events = track.sections?.[sectionName] || [];
    const instruments = timelineInstrumentIds(track);
    const totalBeats = sectionBeatLength(track, sectionName);
    const beats = Array.from({ length: Math.ceil(totalBeats) + 1 }, (_, beat) => beat);
    const lanes = instruments.map(instrumentId => {
      const laneEvents = events.map((event, index) => ({ event, index })).filter(item => item.event.i === instrumentId);
      return `<div class="timeline-lane" data-lane="${escapeHtml(instrumentId)}">
        <div class="timeline-lane-label">${escapeHtml(instrumentId)}</div>
        <div class="timeline-lane-track">
          ${laneEvents.map(({ event, index }) => {
            const left = Math.max(0, Math.min(100, (Number(event.t) / totalBeats) * 100));
            const width = Math.max(1.5, Math.min(100 - left, (Number(event.d) / totalBeats) * 100));
            return `<button type="button" class="timeline-event${index === this.selectedEventIndex ? ' is-selected' : ''}" data-event-index="${index}" style="left:${left}%;width:${width}%" title="${escapeHtml(eventLabel(event))}">
              <span>${escapeHtml(noteText(event.n))}</span>
            </button>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');

    return `<div class="bgm-timeline-shell">
      <div class="bgm-timeline-ruler" aria-hidden="true">
        <div class="timeline-lane-label">beat</div>
        <div class="timeline-lane-track">
          ${beats.map(beat => `<span class="timeline-beat" style="left:${Math.min(100, (beat / totalBeats) * 100)}%">${beat}</span>`).join('')}
        </div>
      </div>
      <div class="bgm-timeline" data-total-beats="${totalBeats}">${lanes}</div>
    </div>`;
  }

  renderBgmEditor() {
    const track = ensureBgmShape(this.currentBgmDef());
    this.bgmDefs[this.selectedBgmId] = track;
    const names = sectionNames(track);
    if (!names.includes(this.selectedSectionName)) this.selectedSectionName = firstSectionName(track);
    if (!track.instruments?.[this.selectedInstrumentId]) this.selectedInstrumentId = firstInstrumentId(track);
    const events = track.sections?.[this.selectedSectionName] || [];
    if (events.length === 0) this.selectedEventIndex = null;
    else this.selectedEventIndex = Math.min(this.selectedEventIndex ?? 0, events.length - 1);
    const instrument = track.instruments?.[this.selectedInstrumentId] || {};
    const event = this.selectedEventIndex === null ? null : events[this.selectedEventIndex];
    const form = $('#audio-editor-form', this.root);
    form.className = 'audio-editor-form bgm-form';
    form.innerHTML = `
      <section class="audio-form-card"><h2>BGM基本</h2><div class="audio-form-grid">
        ${this.inputRow('bgmId', 'ID', track.id)}
        ${this.inputRow('title', '曲名', track.title)}
        ${this.inputRow('world', '分類', track.world)}
        ${this.inputRow('key', 'key', track.key)}
        ${this.numberRow('tempo', 'tempo', track.tempo, 'step="1" min="1" max="320"')}
        ${this.numberRow('meterTop', '拍子 上', track.meter?.[0] ?? 4, 'step="1" min="1" max="32"')}
        ${this.numberRow('meterBottom', '拍子 下', track.meter?.[1] ?? 4, 'step="1" min="1" max="32"')}
        ${this.textareaRow('description', '説明', track.description)}
      </div></section>

      <section class="audio-form-card"><div class="audio-card-title"><h2>パート</h2><div class="audio-button-row"><button id="add-section-btn" type="button">追加</button><button id="delete-section-btn" type="button">削除</button></div></div>
        <div id="section-tabs" class="section-tabs">${this.sectionTabs(track)}</div>
        <div class="audio-form-grid section-settings">
          ${names.map(name => this.numberRow(`sectionBars:${name}`, `${name} 小節`, track.sectionBars?.[name] ?? (name === 'intro' ? track.introBars : 4), 'step="1" min="1" max="64"')).join('')}
        </div>
      </section>

      <section class="audio-form-card"><div class="audio-card-title"><h2>音色</h2><div class="audio-button-row"><button id="add-instrument-btn" type="button">追加</button><button id="clone-instrument-btn" type="button">複製</button><button id="delete-instrument-btn" type="button">削除</button></div></div>
        <div id="instrument-list" class="instrument-list">${this.instrumentButtons(track)}</div>
        <div class="audio-form-grid">
          ${this.inputRow('instrumentId', 'instrument ID', this.selectedInstrumentId)}
          ${this.selectRow('instrumentKind', 'kind', instrument.kind || 'tone', BGM_INSTRUMENT_KIND_OPTIONS)}
          ${this.selectRow('instrumentType', 'waveform', instrument.type || 'triangle', BGM_WAVEFORM_OPTIONS)}
          ${this.numberRow('instrumentGain', 'gain', instrument.gain ?? '', 'step="0.01" min="0" max="2"')}
          ${this.numberRow('instrumentAttack', 'attack', instrument.attack ?? '', 'step="0.001" min="0"')}
          ${this.numberRow('instrumentDecay', 'decay', instrument.decay ?? '', 'step="0.001" min="0"')}
          ${this.numberRow('instrumentSustain', 'sustain', instrument.sustain ?? '', 'step="0.01" min="0" max="1"')}
          ${this.numberRow('instrumentRelease', 'release', instrument.release ?? '', 'step="0.001" min="0"')}
          ${this.numberRow('instrumentFilter', 'filter', instrument.filter ?? '', 'step="10" min="20"')}
          ${this.numberRow('instrumentQ', 'Q', instrument.q ?? '', 'step="0.1" min="0"')}
          ${this.numberRow('instrumentPan', 'pan', instrument.pan ?? '', 'step="0.01" min="-1" max="1"')}
          ${this.numberRow('instrumentPartial', 'partial', instrument.partial ?? '', 'step="0.01" min="0"')}
          ${this.numberRow('instrumentDetune', 'detune', instrument.detune ?? '', 'step="1"')}
          ${this.numberRow('instrumentSlide', 'slide', instrument.slide ?? '', 'step="0.01" min="0"')}
        </div>
      </section>

      <section class="audio-form-card bgm-part-card"><div class="audio-card-title"><h2>タイムライン / ${escapeHtml(this.selectedSectionName)}</h2><div class="audio-button-row"><button id="preview-event-btn" type="button"${event ? '' : ' disabled'}>選択音だけ試聴</button><button id="add-event-btn" type="button">イベント追加</button><button id="clone-event-btn" type="button">複製</button><button id="delete-event-btn" type="button">削除</button></div></div>
        <p class="timeline-help">イベントをクリックで選択、左右ドラッグで開始位置を編集できます。「選択音だけ試聴」で選択中の1イベントだけ鳴らせます。</p>
        ${this.renderBgmTimeline(track)}
        <div class="audio-form-grid event-form-grid">
          ${this.selectRow('eventInstrument', 'instrument', event?.i || this.selectedInstrumentId, timelineInstrumentIds(track))}
          ${this.textareaRow('eventNote', 'note / chord', event ? noteText(event.n) : '', 'C5 または C4, E4, G4')}
          ${this.numberRow('eventTime', 't beat', event?.t ?? '', 'step="0.125" min="0"')}
          ${this.numberRow('eventDuration', 'd beat', event?.d ?? '', 'step="0.125" min="0.01"')}
          ${this.numberRow('eventVelocity', 'v', event?.v ?? '', 'step="0.01" min="0" max="1.5"')}
          ${this.selectRow('eventGrid', 'drag grid', '0.25', BGM_GRID_STEPS.map(String))}
        </div>
      </section>
    `;
    this.bindBgmEditor(form);
  }

  bindBgmEditor(form) {
    form.querySelectorAll('input, select, textarea').forEach(input => input.addEventListener('change', () => this.commitCurrentForm()));
    $$('#section-tabs button', form).forEach(button => button.addEventListener('click', () => {
      this.commitBgmForm();
      this.selectedSectionName = button.dataset.section;
      this.selectedEventIndex = 0;
      this.render();
    }));
    $$('#instrument-list button', form).forEach(button => button.addEventListener('click', () => {
      this.commitBgmForm();
      this.selectedInstrumentId = button.dataset.instrument;
      this.renderBgmEditor();
    }));
    $$('.timeline-event', form).forEach(button => {
      button.addEventListener('click', () => {
        if (button.dataset.dragged === '1') {
          button.dataset.dragged = '0';
          return;
        }
        this.commitBgmForm();
        this.selectedEventIndex = Number(button.dataset.eventIndex);
        this.renderBgmEditor();
      });
      button.addEventListener('pointerdown', event => this.startTimelineDrag(event, button));
    });
    $('#add-section-btn', form).addEventListener('click', () => this.addSection());
    $('#delete-section-btn', form).addEventListener('click', () => this.deleteSection());
    $('#add-instrument-btn', form).addEventListener('click', () => this.addInstrument());
    $('#clone-instrument-btn', form).addEventListener('click', () => this.cloneInstrument());
    $('#delete-instrument-btn', form).addEventListener('click', () => this.deleteInstrument());
    $('#preview-event-btn', form).addEventListener('click', () => this.previewSelectedTimelineEvent());
    $('#add-event-btn', form).addEventListener('click', () => this.addEvent());
    $('#clone-event-btn', form).addEventListener('click', () => this.cloneEvent());
    $('#delete-event-btn', form).addEventListener('click', () => this.deleteEvent());
  }

  startTimelineDrag(pointerEvent, button) {
    if (pointerEvent.button !== 0) return;
    const trackEl = button.closest('.timeline-lane-track');
    const totalBeats = Number(button.closest('.bgm-timeline')?.dataset.totalBeats || 1);
    const index = Number(button.dataset.eventIndex);
    const events = this.currentBgmDef().sections?.[this.selectedSectionName] || [];
    const event = events[index];
    if (!trackEl || !event) return;
    this.timelineDrag = {
      button,
      index,
      startX: pointerEvent.clientX,
      originalT: Number(event.t) || 0,
      width: Math.max(1, trackEl.getBoundingClientRect().width),
      totalBeats,
      moved: false,
    };
    button.setPointerCapture(pointerEvent.pointerId);
    const move = moveEvent => this.moveTimelineDrag(moveEvent);
    const up = upEvent => {
      this.endTimelineDrag(upEvent);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  moveTimelineDrag(pointerEvent) {
    const drag = this.timelineDrag;
    if (!drag) return;
    const delta = pointerEvent.clientX - drag.startX;
    if (Math.abs(delta) > 3) drag.moved = true;
    const grid = Number($('[name="eventGrid"]', this.root)?.value || 0.25);
    const nextT = roundToGrid(drag.originalT + (delta / drag.width) * drag.totalBeats, grid);
    const events = this.currentBgmDef().sections?.[this.selectedSectionName] || [];
    if (!events[drag.index]) return;
    events[drag.index].t = Math.min(Math.max(0, nextT), drag.totalBeats);
    this.selectedEventIndex = drag.index;
    const left = Math.max(0, Math.min(100, (events[drag.index].t / drag.totalBeats) * 100));
    drag.button.style.left = `${left}%`;
    const timeInput = $('[name="eventTime"]', this.root);
    if (timeInput) timeInput.value = String(events[drag.index].t);
  }

  endTimelineDrag() {
    const drag = this.timelineDrag;
    if (!drag) return;
    drag.button.dataset.dragged = drag.moved ? '1' : '0';
    this.timelineDrag = null;
    this.commitBgmForm();
    this.renderListsAndValidation();
  }

  commitBgmForm() {
    const form = $('#audio-editor-form', this.root);
    if (!form || !form.classList.contains('bgm-form')) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const oldId = this.selectedBgmId;
    const requestedId = normalizeBgmId(data.bgmId, oldId);
    const nextId = requestedId !== oldId && this.bgmDefs[requestedId] ? oldId : requestedId;
    const source = ensureBgmShape(this.bgmDefs[oldId]);
    source.id = nextId;
    source.title = String(data.title || nextId);
    source.world = String(data.world || '');
    source.description = String(data.description || '');
    source.tempo = clampNumber(data.tempo, 1, 320, 120);
    source.meter = [clampNumber(data.meterTop, 1, 32, 4), clampNumber(data.meterBottom, 1, 32, 4)];
    source.key = String(data.key || 'C Major');

    for (const name of sectionNames(source)) {
      const bars = clampNumber(data[`sectionBars:${name}`], 1, 64, name === 'intro' ? 2 : 8);
      source.sectionBars[name] = bars;
      if (name === 'intro') source.introBars = bars;
    }

    this.commitSelectedInstrument(source, data);
    this.commitSelectedEvent(source, data);
    if (nextId !== oldId) delete this.bgmDefs[oldId];
    this.bgmDefs[nextId] = ensureBgmShape(source);
    this.selectedBgmId = nextId;
  }

  commitSelectedInstrument(source, data) {
    if (!this.selectedInstrumentId || !source.instruments?.[this.selectedInstrumentId]) return;
    const oldInstrumentId = this.selectedInstrumentId;
    const requestedId = normalizeInstrumentId(data.instrumentId, oldInstrumentId);
    const nextInstrumentId = requestedId !== oldInstrumentId && source.instruments[requestedId] ? oldInstrumentId : requestedId;
    const instrument = cleanObject({
      kind: data.instrumentKind || 'tone',
      type: data.instrumentType || 'triangle',
      gain: toOptionalNumber(data.instrumentGain),
      attack: toOptionalNumber(data.instrumentAttack),
      decay: toOptionalNumber(data.instrumentDecay),
      sustain: toOptionalNumber(data.instrumentSustain),
      release: toOptionalNumber(data.instrumentRelease),
      filter: toOptionalNumber(data.instrumentFilter),
      q: toOptionalNumber(data.instrumentQ),
      pan: toOptionalNumber(data.instrumentPan),
      partial: toOptionalNumber(data.instrumentPartial),
      detune: toOptionalNumber(data.instrumentDetune),
      slide: toOptionalNumber(data.instrumentSlide),
    });
    if (['kick', 'snare', 'hat'].includes(instrument.kind)) delete instrument.type;
    if (nextInstrumentId !== oldInstrumentId) {
      delete source.instruments[oldInstrumentId];
      for (const events of Object.values(source.sections || {})) {
        events.forEach(event => {
          if (event.i === oldInstrumentId) event.i = nextInstrumentId;
        });
      }
    }
    source.instruments[nextInstrumentId] = instrument;
    this.selectedInstrumentId = nextInstrumentId;
  }

  commitSelectedEvent(source, data) {
    const events = source.sections?.[this.selectedSectionName] || [];
    if (this.selectedEventIndex === null || !events[this.selectedEventIndex]) return;
    const totalBeats = sectionBeatLength(source, this.selectedSectionName);
    const updatedEvent = cleanObject({
      t: Math.min(totalBeats, roundToGrid(data.eventTime, 0.001)),
      n: parseNoteValue(data.eventNote),
      d: clampNumber(data.eventDuration, 0.01, totalBeats, 0.5),
      i: String(data.eventInstrument || this.selectedInstrumentId || firstInstrumentId(source)),
      v: clampNumber(data.eventVelocity, 0, 1.5, 0.7),
    });
    events[this.selectedEventIndex] = updatedEvent;
    events.sort((a, b) => a.t - b.t || String(a.i).localeCompare(String(b.i)));
    this.selectedEventIndex = Math.max(0, events.indexOf(updatedEvent));
  }

  createBgm() {
    const base = ensureBgmShape(BGM_NEW_PRESET);
    let index = 1;
    let id = base.id;
    while (this.bgmDefs[id]) {
      index += 1;
      id = `${base.id}-${index}`;
    }
    base.id = id;
    base.title = `${base.title} ${index}`;
    this.bgmDefs[id] = base;
    this.selectedBgmId = id;
    this.selectedSectionName = firstSectionName(base);
    this.selectedInstrumentId = firstInstrumentId(base);
    this.selectedEventIndex = 0;
    this.render();
  }

  cloneBgm() {
    const source = ensureBgmShape(this.currentBgmDef());
    let index = 1;
    let id = `${source.id}-copy`;
    while (this.bgmDefs[id]) {
      index += 1;
      id = `${source.id}-copy-${index}`;
    }
    source.id = id;
    source.title = `${source.title || source.id} 複製`;
    this.bgmDefs[id] = source;
    this.selectedBgmId = id;
    this.selectedSectionName = firstSectionName(source);
    this.selectedInstrumentId = firstInstrumentId(source);
    this.selectedEventIndex = 0;
    this.render();
  }

  deleteBgm() {
    if (Object.keys(this.bgmDefs).length <= 1) return;
    delete this.bgmDefs[this.selectedBgmId];
    this.selectedBgmId = Object.keys(this.bgmDefs)[0];
    this.selectedSectionName = firstSectionName(this.currentBgmDef());
    this.selectedInstrumentId = firstInstrumentId(this.currentBgmDef());
    this.selectedEventIndex = 0;
    this.render();
  }

  addSection() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    let index = 1;
    let name = 'Part1';
    while (track.sections[name]) {
      index += 1;
      name = `Part${index}`;
    }
    track.sections[name] = [];
    track.sectionBars[name] = 4;
    this.selectedSectionName = name;
    this.selectedEventIndex = null;
    this.render();
  }

  deleteSection() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const names = sectionNames(track);
    if (names.length <= 1) return;
    delete track.sections[this.selectedSectionName];
    delete track.sectionBars[this.selectedSectionName];
    if (this.selectedSectionName === 'intro') track.introBars = track.sectionBars[names.find(name => name !== 'intro')] || 4;
    this.selectedSectionName = firstSectionName(track);
    this.selectedEventIndex = 0;
    this.render();
  }

  addInstrument() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    let index = 1;
    let id = 'new_inst';
    while (track.instruments[id]) {
      index += 1;
      id = `new_inst_${index}`;
    }
    track.instruments[id] = { kind: 'tone', type: 'triangle', gain: 0.35, attack: 0.012, decay: 0.14, sustain: 0.35, release: 0.18, pan: 0 };
    this.selectedInstrumentId = id;
    this.render();
  }

  cloneInstrument() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const source = deepClone(track.instruments[this.selectedInstrumentId]);
    let index = 1;
    let id = `${this.selectedInstrumentId}_copy`;
    while (track.instruments[id]) {
      index += 1;
      id = `${this.selectedInstrumentId}_copy_${index}`;
    }
    track.instruments[id] = source;
    this.selectedInstrumentId = id;
    this.render();
  }

  deleteInstrument() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const ids = Object.keys(track.instruments || {});
    if (ids.length <= 1) return;
    const fallback = ids.find(id => id !== this.selectedInstrumentId) || ids[0];
    delete track.instruments[this.selectedInstrumentId];
    for (const events of Object.values(track.sections || {})) {
      events.forEach(event => {
        if (event.i === this.selectedInstrumentId) event.i = fallback;
      });
    }
    this.selectedInstrumentId = fallback;
    this.render();
  }

  addEvent() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const events = track.sections[this.selectedSectionName] || [];
    const instrument = this.selectedInstrumentId || firstInstrumentId(track);
    const instrumentKind = track.instruments?.[instrument]?.kind;
    const note = DRUM_NOTES.has(instrumentKind) ? instrumentKind : 'C5';
    events.push({ t: 0, n: note, d: 0.5, i: instrument, v: 0.7 });
    events.sort((a, b) => a.t - b.t || String(a.i).localeCompare(String(b.i)));
    track.sections[this.selectedSectionName] = events;
    this.selectedEventIndex = events.length - 1;
    this.render();
  }

  cloneEvent() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const events = track.sections[this.selectedSectionName] || [];
    if (this.selectedEventIndex === null || !events[this.selectedEventIndex]) return;
    const clone = deepClone(events[this.selectedEventIndex]);
    clone.t = roundToGrid(Number(clone.t) + 0.5, 0.25);
    events.splice(this.selectedEventIndex + 1, 0, clone);
    this.selectedEventIndex += 1;
    this.render();
  }

  deleteEvent() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const events = track.sections[this.selectedSectionName] || [];
    if (this.selectedEventIndex === null || !events[this.selectedEventIndex]) return;
    events.splice(this.selectedEventIndex, 1);
    this.selectedEventIndex = events.length ? Math.max(0, this.selectedEventIndex - 1) : null;
    this.render();
  }

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
  }

  commitSfxForm() {
    const form = $('#audio-editor-form', this.root);
    if (!form || !form.classList.contains('sfx-form')) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const oldId = this.selectedSfxId;
    const requestedId = normalizeId(data.id, oldId);
    const nextId = requestedId !== oldId && this.sfxDefs[requestedId] ? oldId : requestedId;
    const source = deepClone(this.sfxDefs[oldId]);
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
      steps: parseJsonValue(data.steps, undefined),
    };
    Object.keys(voice).forEach(key => voice[key] === undefined && delete voice[key]);
    source.id = nextId;
    source.name = data.name;
    source.gain = Number(data.gain);
    source.voices[this.selectedVoiceIndex] = normalizeSfxVoice(voice);
    if (nextId !== oldId) delete this.sfxDefs[oldId];
    this.sfxDefs[nextId] = normalizeSfxDefinition(source, nextId);
    this.selectedSfxId = nextId;
  }

  createSfx() {
    const base = deepClone(SFX_NEW_PRESET);
    let index = 1;
    let id = base.id;
    while (this.sfxDefs[id]) {
      index += 1;
      id = `${base.id}_${index}`;
    }
    base.id = id;
    base.name = `${base.name} ${index}`;
    this.sfxDefs[id] = base;
    this.selectedSfxId = id;
    this.selectedVoiceIndex = 0;
    this.render();
  }

  cloneSfx() {
    const source = deepClone(this.currentSfxDef());
    let index = 1;
    let id = `${source.id}_copy`;
    while (this.sfxDefs[id]) {
      index += 1;
      id = `${source.id}_copy_${index}`;
    }
    source.id = id;
    source.name = `${source.name || source.id} 複製`;
    this.sfxDefs[id] = source;
    this.selectedSfxId = id;
    this.selectedVoiceIndex = 0;
    this.render();
  }

  deleteSfx() {
    if (Object.keys(this.sfxDefs).length <= 1) return;
    delete this.sfxDefs[this.selectedSfxId];
    this.selectedSfxId = Object.keys(this.sfxDefs)[0];
    this.selectedVoiceIndex = 0;
    this.render();
  }

  addVoice() {
    this.commitSfxForm();
    const def = this.currentSfxDef();
    def.voices.push(deepClone(SFX_NEW_PRESET.voices[0]));
    this.selectedVoiceIndex = def.voices.length - 1;
    this.render();
  }

  cloneVoice() {
    this.commitSfxForm();
    const def = this.currentSfxDef();
    def.voices.splice(this.selectedVoiceIndex + 1, 0, deepClone(def.voices[this.selectedVoiceIndex]));
    this.selectedVoiceIndex += 1;
    this.render();
  }

  deleteVoice() {
    this.commitSfxForm();
    const def = this.currentSfxDef();
    if (def.voices.length <= 1) return;
    def.voices.splice(this.selectedVoiceIndex, 1);
    this.selectedVoiceIndex = Math.max(0, this.selectedVoiceIndex - 1);
    this.render();
  }
}
