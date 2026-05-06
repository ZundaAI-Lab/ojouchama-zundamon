/**
 * 責務: 通常ステージと風船ライドで共通利用する落下判定Y座標を算出する。
 * 更新ルール: 落下時のダメージ、復帰、ライド失敗処理は持たず、ステージ高さに対する境界計算だけを扱う。
 * 更新ルール: ステージ高未指定時は通常ステージ標準高を使い、表示基準との差分をここで再定義しない。
 */
import { STAGE_VIEW } from '../config/view.js';

const FALL_OUT_STAGE_MARGIN = 80;

export function getStageFallOutY(stage) {
  const height = Number.isFinite(stage?.height) ? stage.height : STAGE_VIEW.STANDARD_HEIGHT;
  return height + FALL_OUT_STAGE_MARGIN;
}
