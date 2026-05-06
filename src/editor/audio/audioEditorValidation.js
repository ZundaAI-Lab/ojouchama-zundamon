/**
 * 責務: サウンドエディタの保存前検証を行い、ユーザーへ表示しやすいメッセージ配列を返す。
 * 更新ルール: 自動修正やDOM描画は持たず、BGM/SEデータの矛盾検出だけを扱う。
 * 更新ルール: sequence voiceは親voiceではなくsteps単位で発音値を検証する。
 */
import { AUDIO_ID_PATTERN } from '../../data/audio/audioSchema.js';
import { BGM_BUILTIN_INSTRUMENT_IDS, BGM_INSTRUMENT_KIND_OPTIONS, BGM_WAVEFORM_OPTIONS, SFX_TYPE_OPTIONS, SFX_WAVEFORM_OPTIONS } from './audioEditorCatalog.js';

const BGM_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const NOTE_PATTERN = /^([A-Ga-g])([#b]?)(-?\d)$/u;

function checkId(id, label, messages, pattern = AUDIO_ID_PATTERN, hint = 'idは小文字英数字と_で、先頭は英字にしてください') {
  if (!id) messages.push({ level: 'error', text: `${label}: idが空です` });
  else if (!pattern.test(id)) messages.push({ level: 'error', text: `${label}: ${hint}` });
}

function checkKnown(value, options, label, messages, level = 'warn') {
  if (value && !options.includes(value)) messages.push({ level, text: `${label}: 未知の値 ${value}` });
}

function hasPositiveNumber(value) {
  return Number(value) > 0;
}

function noteValues(value) {
  return Array.isArray(value) ? value : [value];
}

function checkBgmNote(value, label, messages) {
  for (const note of noteValues(value)) {
    if (['kick', 'snare', 'hat'].includes(note)) continue;
    if (!NOTE_PATTERN.test(String(note || ''))) messages.push({ level: 'warn', text: `${label}: 音名 ${note} は C5 / F#4 / Bb3 形式を推奨します` });
  }
}

function checkSfxPlayableVoice(voice, label, messages) {
  if (voice.type === 'noise') return;
  if (voice.type === 'sequence') {
    if (!Array.isArray(voice.steps) || voice.steps.length === 0) {
      messages.push({ level: 'error', text: `${label}: sequenceはstepsを1件以上設定してください` });
      return;
    }
    voice.steps.forEach((step, index) => {
      const stepType = step.type || 'tone';
      checkKnown(stepType, SFX_TYPE_OPTIONS, `${label} step#${index + 1} type`, messages, 'error');
      if (step.waveform) checkKnown(step.waveform, SFX_WAVEFORM_OPTIONS, `${label} step#${index + 1} waveform`, messages);
      if (!(Number(step.duration ?? voice.duration) > 0)) messages.push({ level: 'error', text: `${label} step#${index + 1}: durationは0より大きくしてください` });
      if (stepType !== 'noise' && !hasPositiveNumber(step.startFreq ?? voice.startFreq)) messages.push({ level: 'error', text: `${label} step#${index + 1}: startFreqは0より大きくしてください` });
    });
    return;
  }
  if (!hasPositiveNumber(voice.startFreq)) messages.push({ level: 'error', text: `${label}: startFreqは0より大きくしてください` });
}

export function validateSfxDefs(defs) {
  const messages = [];
  const ids = new Set();
  Object.entries(defs).forEach(([key, def]) => {
    const label = `SE ${def.id || key}`;
    checkId(def.id, label, messages);
    if (ids.has(def.id)) messages.push({ level: 'error', text: `${label}: idが重複しています` });
    ids.add(def.id);
    if (!Array.isArray(def.voices) || def.voices.length === 0) messages.push({ level: 'error', text: `${label}: voicesが空です` });
    (def.voices || []).forEach((voice, index) => {
      checkKnown(voice.type, SFX_TYPE_OPTIONS, `${label} voice#${index + 1} type`, messages, 'error');
      checkKnown(voice.waveform, SFX_WAVEFORM_OPTIONS, `${label} voice#${index + 1} waveform`, messages);
      if (!(Number(voice.duration) > 0)) messages.push({ level: 'error', text: `${label} voice#${index + 1}: durationは0より大きくしてください` });
      checkSfxPlayableVoice(voice, `${label} voice#${index + 1}`, messages);
    });
  });
  if (messages.length === 0) messages.push({ level: 'ok', text: 'SE定義に重大な問題はありません' });
  return messages;
}

export function validateBgmTrackDefs(defs) {
  const messages = [];
  const ids = new Set();
  Object.entries(defs).forEach(([key, track]) => {
    const label = `BGM ${track.id || key}`;
    checkId(track.id, label, messages, BGM_ID_PATTERN, 'idは小文字英数字と-で、先頭は英字にしてください');
    if (ids.has(track.id)) messages.push({ level: 'error', text: `${label}: idが重複しています` });
    ids.add(track.id);
    if (!hasPositiveNumber(track.tempo)) messages.push({ level: 'error', text: `${label}: tempoは0より大きくしてください` });
    if (!Array.isArray(track.meter) || track.meter.length < 2 || !hasPositiveNumber(track.meter[0]) || !hasPositiveNumber(track.meter[1])) messages.push({ level: 'error', text: `${label}: meterは [4, 4] 形式で指定してください` });
    const instruments = track.instruments || {};
    Object.entries(instruments).forEach(([id, instrument]) => {
      checkKnown(instrument.kind, BGM_INSTRUMENT_KIND_OPTIONS, `${label} instrument ${id} kind`, messages, 'error');
      if (instrument.type) checkKnown(instrument.type, BGM_WAVEFORM_OPTIONS, `${label} instrument ${id} type`, messages);
      if (Number(instrument.gain) < 0) messages.push({ level: 'error', text: `${label} instrument ${id}: gainは0以上にしてください` });
    });
    const instrumentIds = new Set([...BGM_BUILTIN_INSTRUMENT_IDS, ...Object.keys(instruments)]);
    const sections = track.sections || {};
    if (Object.keys(sections).length === 0) messages.push({ level: 'error', text: `${label}: sectionsが空です` });
    Object.entries(sections).forEach(([sectionName, events]) => {
      const sectionLabel = `${label} ${sectionName}`;
      if (!(Number(track.sectionBars?.[sectionName] ?? track.introBars ?? 0) > 0)) messages.push({ level: 'error', text: `${sectionLabel}: 小節数は0より大きくしてください` });
      if (!Array.isArray(events)) {
        messages.push({ level: 'error', text: `${sectionLabel}: eventsは配列にしてください` });
        return;
      }
      events.forEach((event, index) => {
        const eventLabel = `${sectionLabel} event#${index + 1}`;
        if (!instrumentIds.has(event.i)) messages.push({ level: 'error', text: `${eventLabel}: 未定義のinstrument ${event.i}` });
        if (Number(event.t) < 0) messages.push({ level: 'error', text: `${eventLabel}: tは0以上にしてください` });
        if (!(Number(event.d) > 0)) messages.push({ level: 'error', text: `${eventLabel}: dは0より大きくしてください` });
        if (Number(event.v) < 0 || Number(event.v) > 1.5) messages.push({ level: 'warn', text: `${eventLabel}: vは0〜1.5程度を推奨します` });
        checkBgmNote(event.n, eventLabel, messages);
      });
    });
  });
  if (messages.length === 0) messages.push({ level: 'ok', text: 'BGM定義に重大な問題はありません' });
  return messages;
}
