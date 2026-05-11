/**
 * 責務: アイテム種別の表示名・画像キー・表示/当たり判定サイズ・既定効果値定義を担当する。
 * 更新ルール: 取得処理そのものはstage側に置く。種別追加時はITEM_DEFSへ表示メトリクスと既定効果値をまとめる。
 * 更新ルール: アイテム版の夢のしずくはゴール版の見た目/当たり判定サイズを参照し、大きさの正本をgoalDefsへ集約する。
 */
import { GOAL_DEFAULT_VARIANT, GOAL_DEFS } from './goalDefs.js';

const GOAL_DREAM_DROP_DEF = GOAL_DEFS[GOAL_DEFAULT_VARIANT];
const GOAL_DREAM_DROP_DRAW = GOAL_DREAM_DROP_DEF.draw;
const GOAL_DREAM_DROP_HITBOX = GOAL_DREAM_DROP_DEF.hitbox;

export const ITEM_DEFS = {
  coin: {
    label: '豆コイン',
    imageKey: 'icon_coin',
    effect: 'coin',
    value: 1,
    hitboxSize: 14,
    renderSize: 18,
  },
  largeBeanCoin: {
    label: '大きな豆コイン',
    imageKey: 'icon_coin',
    effect: 'coin',
    value: 10,
    hitboxSize: 28,
    renderSize: 36,
  },
  zundamochi: {
    label: 'ずんだもち',
    imageKey: 'icon_zundamochi',
    effect: 'heal',
    value: 1,
    hitboxSize: 14,
    renderSize: 18,
  },
  invitation: {
    label: '招待状',
    imageKey: 'icon_invitation',
    effect: 'switch',
    switchMode: 'latch',
    value: 1,
    hitboxSize: 14,
    renderSize: 18,
  },
  teacup: {
    label: 'ティーカップ',
    imageKey: 'icon_teacup',
    effect: 'teacup',
    value: 1,
    hitboxSize: 14,
    renderSize: 18,
  },
  dreamDrop: {
    label: '夢のしずく',
    imageKey: 'icon_dream_drop',
    effect: 'none',
    value: 1,
    hitboxWidth: GOAL_DREAM_DROP_HITBOX.w,
    hitboxHeight: GOAL_DREAM_DROP_HITBOX.h,
    renderSize: GOAL_DREAM_DROP_DRAW.w,
    renderWidth: GOAL_DREAM_DROP_DRAW.w,
    renderHeight: GOAL_DREAM_DROP_DRAW.h,
  },
};

export const ITEM_IMAGES = Object.fromEntries(
  Object.entries(ITEM_DEFS).map(([kind, def]) => [kind, def.imageKey]),
);

export function getItemDef(kind) {
  return ITEM_DEFS[kind] || ITEM_DEFS.coin;
}
