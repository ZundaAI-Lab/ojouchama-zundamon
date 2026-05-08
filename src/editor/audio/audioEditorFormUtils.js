/**
 * 責務: サウンドエディタで共有するフォーム値変換、ID正規化、BGM構造補正を管理する。
 * 更新ルール: DOM描画パネルや試聴処理は持たず、BGM/SFX編集で共通利用する純関数だけを追加する。
 */
import { deepClone } from '../../data/audio/audioSchema.js';
import { BGM_BUILTIN_INSTRUMENT_IDS, BGM_NEW_PRESET, BGM_SECTION_ORDER, sectionSort } from './audioEditorCatalog.js';

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const BGM_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const INSTRUMENT_ID_PATTERN = /^[a-z][a-z0-9_]*$/;
export const DRUM_NOTES = new Set(['kick', 'snare', 'hat']);

export function numberList(value) {
  return String(value || '').split(',').map(item => Number(item.trim())).filter(Number.isFinite);
}

export function parseJsonValue(text, fallback = undefined) {
  const source = String(text || '').trim();
  if (!source) return fallback;
  try {
    return JSON.parse(source);
  } catch {
    return fallback;
  }
}

export function toPrettyJson(value) {
  return value ? JSON.stringify(value, null, 2) : '';
}

export function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

export function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function roundToGrid(value, grid = 0.25) {
  return Math.max(0, Math.round(Number(value || 0) / grid) * grid);
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

export function normalizeBgmId(value, fallback = 'new-bgm') {
  const id = String(value || fallback).trim().replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return BGM_ID_PATTERN.test(id) ? id : fallback;
}

export function normalizeInstrumentId(value, fallback = 'lead') {
  const id = String(value || fallback).trim().replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
  return INSTRUMENT_ID_PATTERN.test(id) ? id : fallback;
}

export function parseNoteValue(value) {
  const source = String(value || '').trim();
  if (!source) return 'C5';
  if (source.includes(',')) return source.split(',').map(item => item.trim()).filter(Boolean);
  return source;
}

export function noteText(value) {
  return Array.isArray(value) ? value.join(', ') : String(value ?? '');
}

export function cleanObject(value) {
  Object.keys(value).forEach(key => value[key] === undefined && delete value[key]);
  return value;
}

export function sectionNames(track) {
  return Array.from(new Set([
    ...BGM_SECTION_ORDER.filter(name => track.sections?.[name] || track.sectionBars?.[name]),
    ...Object.keys(track.sections || {}),
    ...Object.keys(track.sectionBars || {}),
  ])).sort(sectionSort);
}

export function ensureBgmShape(raw = {}) {
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

export function timelineInstrumentIds(track) {
  const ids = new Set([...BGM_BUILTIN_INSTRUMENT_IDS, ...Object.keys(track.instruments || {})]);
  Object.values(track.sections || {}).forEach(events => {
    (events || []).forEach(event => ids.add(String(event.i || 'lead')));
  });
  return Array.from(ids).filter(Boolean);
}

export function firstInstrumentId(track) {
  return Object.keys(track.instruments || {})[0] || 'lead';
}

export function firstSectionName(track) {
  return sectionNames(track)[0] || 'intro';
}

export function sectionBeatLength(track, sectionName) {
  const bars = Number(track.sectionBars?.[sectionName] ?? (sectionName === 'intro' ? track.introBars : 4)) || 4;
  const beatsPerBar = Number(track.meter?.[0]) || 4;
  return Math.max(1, bars * beatsPerBar);
}

export function eventLabel(event) {
  return `${noteText(event.n)} / ${event.i}`;
}
