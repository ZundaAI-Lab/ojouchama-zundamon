/**
 * 責務: 音声データのID一覧とエディタ向け表示ラベルを提供する。
 * 更新ルール: 実際の発音処理やDOM処理は持たず、BGMトラック定義/SE定義から参照用カタログを作る。
 */
import { BGM_TRACK_DEFS, BGM_IDS } from './bgmTrackDefs.js';
import { SFX_DEFS, SFX_IDS } from './sfxDefs.js';

export { BGM_TRACK_DEFS, BGM_IDS, SFX_DEFS, SFX_IDS };

export const AUDIO_KIND_LABELS = Object.freeze({ bgm: 'BGM', sfx: 'SE' });

export function getAudioLabel(defs, id) {
  const def = defs[id];
  return def?.title || def?.name ? `${def.title || def.name} (${id})` : id;
}

export const BGM_OPTIONS = Object.freeze(BGM_IDS.map(id => ({ value: id, label: getAudioLabel(BGM_TRACK_DEFS, id) })));
export const SFX_OPTIONS = Object.freeze(SFX_IDS.map(id => ({ value: id, label: getAudioLabel(SFX_DEFS, id) })));
