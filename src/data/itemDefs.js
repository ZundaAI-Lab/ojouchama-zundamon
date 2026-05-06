/**
 * 責務: アイテム種別の表示名・画像キー・表示/当たり判定サイズ・既定効果値定義を担当する。
 * 更新ルール: 取得処理そのものはstage側に置く。種別追加時はITEM_DEFSへ表示メトリクスと既定効果値をまとめる。
 */
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
  scone: {
    label: 'スコーン',
    imageKey: 'icon_scone',
    effect: 'heal',
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
    hitboxSize: 14,
    renderSize: 18,
  },
};

export const ITEM_IMAGES = Object.fromEntries(
  Object.entries(ITEM_DEFS).map(([kind, def]) => [kind, def.imageKey]),
);

export function getItemDef(kind) {
  return ITEM_DEFS[kind] || ITEM_DEFS.coin;
}
