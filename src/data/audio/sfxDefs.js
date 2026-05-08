/**
 * 責務: カテゴリ別に分割されたSE定義を結合し、サウンドエディタとSfxPlayerへ公開する入口を提供する。
 * 更新ルール: 個別SEの追加・編集は src/data/audio/sfx/ の用途別ファイルへ置き、このファイルには結合順だけを追加する。
 */
import { UI_SFX_DEFS } from './sfx/uiSfxDefs.js';
import { PLAYER_SFX_DEFS } from './sfx/playerSfxDefs.js';
import { ITEM_SFX_DEFS } from './sfx/itemSfxDefs.js';
import { RESIDENT_SFX_DEFS } from './sfx/residentSfxDefs.js';
import { BOSS_SFX_DEFS } from './sfx/bossSfxDefs.js';
import { STAGE_SFX_DEFS } from './sfx/stageSfxDefs.js';
import { GIMMICK_SFX_DEFS } from './sfx/gimmickSfxDefs.js';
import { NANO_SFX_DEFS } from './sfx/nanoSfxDefs.js';
import { RIDE_SFX_DEFS } from './sfx/rideSfxDefs.js';
import { SHOP_SFX_DEFS } from './sfx/shopSfxDefs.js';

export const SFX_DEFS = {
  ...UI_SFX_DEFS,
  ...PLAYER_SFX_DEFS,
  ...ITEM_SFX_DEFS,
  ...RESIDENT_SFX_DEFS,
  ...BOSS_SFX_DEFS,
  ...STAGE_SFX_DEFS,
  ...GIMMICK_SFX_DEFS,
  ...NANO_SFX_DEFS,
  ...RIDE_SFX_DEFS,
  ...SHOP_SFX_DEFS,
};

export const SFX_IDS = Object.freeze(Object.keys(SFX_DEFS));
