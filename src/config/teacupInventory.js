/**
 * 責務: ティーカップ所持数とショップ用消耗品定義を管理する。
 * 更新ルール: 所持数の上限・購入価格などの宣言値だけを置き、保存更新やDOM操作を追加しない。
 */
export const MAX_TEACUPS = 9;

export const SHOP_ITEM_DEFS = {
  teacup: {
    label: 'ティーカップ',
    desc: 'お茶アクションに必要。1回使うたびに1個消費するの。',
    cost: 4,
    max: MAX_TEACUPS,
    icon: 'icon_teacup',
  },
};

export function clampTeacups(value) {
  const count = Number.isFinite(value) ? Math.floor(value) : 0;
  return Math.max(0, Math.min(MAX_TEACUPS, count));
}
