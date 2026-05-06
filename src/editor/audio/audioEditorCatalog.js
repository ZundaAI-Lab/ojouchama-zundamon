/**
 * 責務: サウンドエディタの選択肢・表示名・新規作成プリセットを提供する。
 * 更新ルール: 実データは data/audio/、再生処理は audio/ に置き、このファイルではUIメタ情報と新規作成時の初期値だけを扱う。
 */
import { SFX_VOICE_TYPES, SFX_WAVEFORMS } from '../../data/audio/audioSchema.js';

export const SFX_TYPE_OPTIONS = SFX_VOICE_TYPES;
export const SFX_WAVEFORM_OPTIONS = SFX_WAVEFORMS;
export const BGM_WAVEFORM_OPTIONS = Object.freeze(['sine', 'square', 'triangle', 'sawtooth']);
export const BGM_INSTRUMENT_KIND_OPTIONS = Object.freeze(['tone', 'bell', 'pad', 'pluck', 'kick', 'snare', 'hat']);
export const BGM_SECTION_ORDER = Object.freeze(['intro', 'A', 'APrime', 'B', 'C']);
export const BGM_GRID_STEPS = Object.freeze([1, 0.5, 0.25, 0.125]);
export const BGM_BUILTIN_INSTRUMENT_IDS = Object.freeze(['lead', 'sparkle', 'arp', 'pad', 'bass', 'kick', 'snare', 'hat']);

export const SFX_NEW_PRESET = Object.freeze({
  id: 'new_sfx',
  name: '新しいSE',
  gain: 1,
  voices: [
    { type: 'tone', waveform: 'sine', offset: 0, startFreq: 620, duration: 0.12, volume: 0.035, attack: 0.012, release: 0.04, pan: 0 },
  ],
});

export const BGM_NEW_PRESET = Object.freeze({
  id: 'new-bgm',
  world: '新規',
  title: '新しいBGM',
  description: 'sound-editor.htmlで作成したBGMです。',
  tempo: 120,
  meter: [4, 4],
  key: 'C Major',
  introBars: 2,
  sectionBars: { intro: 2, A: 4 },
  instruments: {
    lead: { kind: 'bell', type: 'triangle', gain: 0.48, attack: 0.012, decay: 0.18, sustain: 0.22, release: 0.42, filter: 5200, pan: 0 },
    bass: { kind: 'tone', type: 'triangle', gain: 0.32, attack: 0.012, decay: 0.15, sustain: 0.42, release: 0.18, filter: 1200, pan: 0 },
  },
  sections: {
    intro: [
      { t: 0, n: 'C5', d: 0.75, i: 'lead', v: 0.54 },
      { t: 1, n: 'E5', d: 0.75, i: 'lead', v: 0.54 },
      { t: 2, n: 'G5', d: 1, i: 'lead', v: 0.58 },
    ],
    A: [
      { t: 0, n: 'C5', d: 0.75, i: 'lead', v: 0.72 },
      { t: 1, n: 'E5', d: 0.75, i: 'lead', v: 0.72 },
      { t: 2, n: 'G5', d: 0.75, i: 'lead', v: 0.72 },
      { t: 0, n: 'C3', d: 0.75, i: 'bass', v: 0.42 },
      { t: 2, n: 'G2', d: 0.75, i: 'bass', v: 0.42 },
    ],
  },
});

export function optionHtml(options, selected) {
  return options.map(value => `<option value="${value}"${value === selected ? ' selected' : ''}>${value}</option>`).join('');
}

export function sectionSort(a, b) {
  const ia = BGM_SECTION_ORDER.indexOf(a);
  const ib = BGM_SECTION_ORDER.indexOf(b);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  return a.localeCompare(b, 'ja');
}
