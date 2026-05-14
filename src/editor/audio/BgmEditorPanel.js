/**
 * 責務: BGM定義のフォーム編集、音色・セクション・イベントのCRUDを管理する。
 * 更新ルール: タイムラインのドラッグ操作はBgmTimelineControllerへ、一覧・検証表示はAudioEditorListPanelへ置く。
 */
import { deepClone } from '../../data/audio/audioSchema.js';
import { BGM_GRID_STEPS, BGM_INSTRUMENT_KIND_OPTIONS, BGM_NEW_PRESET, BGM_WAVEFORM_OPTIONS } from './audioEditorCatalog.js';
import { $, $$, DRUM_NOTES, cleanObject, clampNumber, ensureBgmShape, escapeHtml, firstInstrumentId, firstSectionName, normalizeBgmId, normalizeInstrumentId, noteText, parseNoteValue, roundToGrid, sectionBeatLength, sectionNames, timelineInstrumentIds, toOptionalNumber } from './audioEditorFormUtils.js';

export const bgmEditorPanelMethods = {
sectionTabs(track) {
    return sectionNames(track).map(name => `
      <button type="button" class="section-tab${name === this.selectedSectionName ? ' is-active' : ''}" data-section="${escapeHtml(name)}">${escapeHtml(name)}</button>
    `).join('');
  },

instrumentButtons(track) {
    return Object.entries(track.instruments || {}).map(([id, instrument]) => `
      <button type="button" class="instrument-pill${id === this.selectedInstrumentId ? ' is-selected' : ''}" data-instrument="${escapeHtml(id)}">
        ${escapeHtml(id)}<span>${escapeHtml(instrument.kind || 'tone')}</span>
      </button>
    `).join('');
  },

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
  },

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
  },

commitBgmForm() {
    const form = $('#audio-editor-form', this.root);
    if (!form || !form.classList.contains('bgm-form')) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const oldId = this.selectedBgmId;
    const requestedId = normalizeBgmId(data.bgmId, oldId);
    const nextId = requestedId !== oldId && this.bgmDefs[requestedId] ? oldId : requestedId;
    const source = deepClone(this.bgmDefs[oldId] || BGM_NEW_PRESET);
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
  },

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
  },

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
  },

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
  },

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
  },

deleteBgm() {
    if (Object.keys(this.bgmDefs).length <= 1) return;
    delete this.bgmDefs[this.selectedBgmId];
    this.selectedBgmId = Object.keys(this.bgmDefs)[0];
    this.selectedSectionName = firstSectionName(this.currentBgmDef());
    this.selectedInstrumentId = firstInstrumentId(this.currentBgmDef());
    this.selectedEventIndex = 0;
    this.render();
  },

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
  },

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
  },

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
  },

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
  },

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
  },

addEvent() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const events = track.sections[this.selectedSectionName] || [];
    const instrument = this.selectedInstrumentId || firstInstrumentId(track);
    const instrumentKind = track.instruments?.[instrument]?.kind;
    const note = DRUM_NOTES.has(instrumentKind) ? instrumentKind : 'C5';
    const newEvent = { t: 0, n: note, d: 0.5, i: instrument, v: 0.7 };
    events.push(newEvent);
    events.sort((a, b) => a.t - b.t || String(a.i).localeCompare(String(b.i)));
    track.sections[this.selectedSectionName] = events;
    this.selectedEventIndex = Math.max(0, events.indexOf(newEvent));
    this.render();
  },

cloneEvent() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const events = track.sections[this.selectedSectionName] || [];
    if (this.selectedEventIndex === null || !events[this.selectedEventIndex]) return;
    const clone = deepClone(events[this.selectedEventIndex]);
    clone.t = roundToGrid(Number(clone.t) + 0.5, 0.25);
    events.splice(this.selectedEventIndex + 1, 0, clone);
    events.sort((a, b) => a.t - b.t || String(a.i).localeCompare(String(b.i)));
    this.selectedEventIndex = Math.max(0, events.indexOf(clone));
    this.render();
  },

deleteEvent() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const events = track.sections[this.selectedSectionName] || [];
    if (this.selectedEventIndex === null || !events[this.selectedEventIndex]) return;
    events.splice(this.selectedEventIndex, 1);
    this.selectedEventIndex = events.length ? Math.max(0, this.selectedEventIndex - 1) : null;
    this.render();
  }
};
