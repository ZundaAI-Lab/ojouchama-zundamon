/**
 * 責務: スイッチ対象家具の見た目から画像アセットキーを解決する。
 * 更新ルール: 描画とロード計画で同じ解決規則を使い、SwitchTargetRendererへ画像キー判定を重複させない。
 */
const CHAIR_KEYS = Object.freeze({
  pink: 'switch_target_chair_pink',
  green: 'switch_target_chair_green',
  purple: 'switch_target_chair_purple',
  heart: 'switch_target_chair_heart',
  wing: 'switch_target_chair_wing',
});

const TABLE_KEYS = Object.freeze({
  pink: 'switch_target_table_round_pink',
  green: 'switch_target_table_round_green',
  purple: 'switch_target_table_purple',
  long: 'switch_target_table_long',
  sidePink: 'switch_target_table_side_pink',
  sideGreen: 'switch_target_table_side_green',
  candle: 'switch_target_table_candle',
});

export function getSwitchTargetImageKey(target) {
  if (target?.imageKey) return target.imageKey;
  if (target?.kind === 'teaChair') return CHAIR_KEYS[target.variant] || CHAIR_KEYS.pink;
  if (target?.kind === 'teaTable') return TABLE_KEYS[target.variant] || TABLE_KEYS.pink;
  return null;
}
