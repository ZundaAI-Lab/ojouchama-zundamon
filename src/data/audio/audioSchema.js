/**
 * 責務: サウンドエディタと再生系が共有する音声データの既定値・正規化・軽量検証を提供する。
 * 更新ルール: UI固有のDOM処理やWebAudio発音処理は置かず、SE定義の形を保つ処理だけを扱う。
 */
export const AUDIO_ID_PATTERN = /^[a-z][a-z0-9_]*$/;

export const SFX_WAVEFORMS = Object.freeze(['sine', 'square', 'triangle', 'sawtooth']);
export const SFX_VOICE_TYPES = Object.freeze(['tone', 'sweep', 'noise', 'chord', 'sequence']);

export const SFX_DEFAULTS = Object.freeze({
  id: 'new_sfx',
  name: '新しいSE',
  gain: 1,
  voices: Object.freeze([
    Object.freeze({
      type: 'tone',
      waveform: 'sine',
      offset: 0,
      startFreq: 620,
      duration: 0.12,
      volume: 0.035,
      attack: 0.012,
      release: 0.04,
      pan: 0,
    }),
  ]),
});

export function deepClone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function normalizeId(value, fallback = 'audio_item') {
  const id = String(value || fallback).trim().replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
  return AUDIO_ID_PATTERN.test(id) ? id : fallback;
}

export function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeSfxVoice(raw = {}) {
  const voice = {
    type: SFX_VOICE_TYPES.includes(raw.type) ? raw.type : 'tone',
    waveform: SFX_WAVEFORMS.includes(raw.waveform) ? raw.waveform : 'sine',
    offset: Math.max(0, toNumber(raw.offset, 0)),
    startFreq: clampNumber(raw.startFreq ?? raw.freq, 20, 12000, 620),
    duration: clampNumber(raw.duration ?? raw.dur, 0.01, 4, 0.12),
    volume: clampNumber(raw.volume ?? raw.vol, 0, 1, 0.035),
    attack: clampNumber(raw.attack, 0.001, 1, 0.012),
    release: clampNumber(raw.release, 0.001, 2, 0.04),
    pan: clampNumber(raw.pan, -1, 1, 0),
  };
  if (Number.isFinite(Number(raw.endFreq))) voice.endFreq = clampNumber(raw.endFreq, 20, 12000, voice.startFreq);
  if (Number.isFinite(Number(raw.filterFreq))) voice.filterFreq = clampNumber(raw.filterFreq, 20, 16000, 2400);
  if (Array.isArray(raw.notes)) voice.notes = raw.notes.map(note => Number(note)).filter(Number.isFinite);
  if (Array.isArray(raw.steps)) {
    const { type: _parentType, offset: _parentOffset, steps: _parentSteps, ...stepDefaults } = raw;
    voice.steps = raw.steps.map((step) => {
      const stepSource = step && typeof step === 'object' ? step : {};
      const stepType = SFX_VOICE_TYPES.includes(stepSource.type) ? stepSource.type : 'tone';
      // sequenceの子stepは親の音色だけを継承し、親type/offset/stepsは再帰再生防止のため継承しない。
      return normalizeSfxVoice({
        ...stepDefaults,
        ...stepSource,
        type: stepType,
        offset: stepSource.offset ?? 0,
      });
    });
  }
  return voice;
}

export function normalizeSfxDefinition(raw = {}, fallbackId = 'new_sfx') {
  const source = { ...SFX_DEFAULTS, ...(raw || {}) };
  const id = normalizeId(source.id || fallbackId, fallbackId);
  const voices = Array.isArray(source.voices) && source.voices.length > 0 ? source.voices : SFX_DEFAULTS.voices;
  return {
    ...source,
    id,
    name: String(source.name || id),
    gain: clampNumber(source.gain, 0, 2, 1),
    voices: voices.map(normalizeSfxVoice),
  };
}
