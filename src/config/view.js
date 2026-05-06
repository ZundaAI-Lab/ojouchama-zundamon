/**
 * 責務: 画面サイズやステージ表示基準値を管理する。
 * 更新ルール: 設定値だけを置き、実行時ロジックやDOM操作を追加しない。
 * 更新ルール: 通常ステージの高さ基準はここで固定し、個別データ・描画・落下境界が同じ値を参照する。
 */
export const GAME_VIEW = {
  WIDTH: 480,
  HEIGHT: 270,
};

export const STAGE_VIEW = {
  STANDARD_HEIGHT: 360,
};
