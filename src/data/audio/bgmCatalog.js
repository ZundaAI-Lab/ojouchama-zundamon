/**
 * 責務: BGM定義から参照用カタログを作る。
 * 更新ルール: SFX定義は import せず、BGM選択UIからSEレシピ群を巻き込まない。
 */
import { BGM_TRACK_DEFS, BGM_IDS } from './bgmTrackDefs.js';
import { getAudioLabel } from './audioCatalog.js';

export { BGM_TRACK_DEFS, BGM_IDS };

export const BGM_OPTIONS = Object.freeze(BGM_IDS.map(id => ({ value: id, label: getAudioLabel(BGM_TRACK_DEFS, id) })));
