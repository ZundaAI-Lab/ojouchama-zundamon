/**
 * 責務: サウンドエディタ上のSE IDと、data/audio/sfx/ のカテゴリ別定義ファイルの対応を管理する。
 * 更新ルール: 分割済みSE定義の責務を保つため、SFXの保存先カテゴリ解決だけをここに集約する。
 */
import { UI_SFX_DEFS } from '../../data/audio/sfx/uiSfxDefs.js';
import { PLAYER_SFX_DEFS } from '../../data/audio/sfx/playerSfxDefs.js';
import { ITEM_SFX_DEFS } from '../../data/audio/sfx/itemSfxDefs.js';
import { RESIDENT_SFX_DEFS } from '../../data/audio/sfx/residentSfxDefs.js';
import { BOSS_SFX_DEFS } from '../../data/audio/sfx/bossSfxDefs.js';
import { STAGE_SFX_DEFS } from '../../data/audio/sfx/stageSfxDefs.js';
import { GIMMICK_SFX_DEFS } from '../../data/audio/sfx/gimmickSfxDefs.js';
import { NANO_SFX_DEFS } from '../../data/audio/sfx/nanoSfxDefs.js';
import { RIDE_SFX_DEFS } from '../../data/audio/sfx/rideSfxDefs.js';
import { SHOP_SFX_DEFS } from '../../data/audio/sfx/shopSfxDefs.js';

export const SFX_CATEGORY_META = Object.freeze({
  ui: Object.freeze({ exportName: 'UI_SFX_DEFS', path: 'src/data/audio/sfx/uiSfxDefs.js', label: 'UI' }),
  player: Object.freeze({ exportName: 'PLAYER_SFX_DEFS', path: 'src/data/audio/sfx/playerSfxDefs.js', label: 'プレイヤー' }),
  item: Object.freeze({ exportName: 'ITEM_SFX_DEFS', path: 'src/data/audio/sfx/itemSfxDefs.js', label: 'アイテム' }),
  resident: Object.freeze({ exportName: 'RESIDENT_SFX_DEFS', path: 'src/data/audio/sfx/residentSfxDefs.js', label: '住民' }),
  boss: Object.freeze({ exportName: 'BOSS_SFX_DEFS', path: 'src/data/audio/sfx/bossSfxDefs.js', label: 'ボス' }),
  stage: Object.freeze({ exportName: 'STAGE_SFX_DEFS', path: 'src/data/audio/sfx/stageSfxDefs.js', label: 'ステージ' }),
  gimmick: Object.freeze({ exportName: 'GIMMICK_SFX_DEFS', path: 'src/data/audio/sfx/gimmickSfxDefs.js', label: 'ギミック' }),
  nano: Object.freeze({ exportName: 'NANO_SFX_DEFS', path: 'src/data/audio/sfx/nanoSfxDefs.js', label: 'なのちゃん' }),
  ride: Object.freeze({ exportName: 'RIDE_SFX_DEFS', path: 'src/data/audio/sfx/rideSfxDefs.js', label: 'ライド' }),
  shop: Object.freeze({ exportName: 'SHOP_SFX_DEFS', path: 'src/data/audio/sfx/shopSfxDefs.js', label: 'ショップ' }),
});

export const SFX_CATEGORY_DEFS = Object.freeze({
  ui: UI_SFX_DEFS,
  player: PLAYER_SFX_DEFS,
  item: ITEM_SFX_DEFS,
  resident: RESIDENT_SFX_DEFS,
  boss: BOSS_SFX_DEFS,
  stage: STAGE_SFX_DEFS,
  gimmick: GIMMICK_SFX_DEFS,
  nano: NANO_SFX_DEFS,
  ride: RIDE_SFX_DEFS,
  shop: SHOP_SFX_DEFS,
});

export function createSfxCategoryMap() {
  const map = {};
  Object.entries(SFX_CATEGORY_DEFS).forEach(([categoryId, defs]) => {
    Object.keys(defs || {}).forEach(id => { map[id] = categoryId; });
  });
  return map;
}

export function sfxCategoryForId(categoryById, id, fallbackCategory = 'ui') {
  return categoryById?.[id] || (SFX_CATEGORY_META[fallbackCategory] ? fallbackCategory : 'ui');
}

export function defsForSfxCategory(defs, categoryById, categoryId) {
  return Object.fromEntries(Object.entries(defs || {}).filter(([id]) => sfxCategoryForId(categoryById, id, categoryId) === categoryId));
}
