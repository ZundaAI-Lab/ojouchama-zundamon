/**
 * 責務: 足場種別の意味づけや拡張用定義を担当する。
 * 更新ルール: ギミック実行処理はPlatformGimmickSystem側に置く。
 * 更新ルール: ステージデータでkindとして使う足場種別はここへ追加し、自動テストで未定義参照を検出する。
 */
export const PLATFORM_KINDS = {
  NORMAL: 'normal',
  JELLY: 'jelly',
  CLOUD: 'cloud',
  VINE: 'vine',
  CRUMBLE: 'crumble',
  SPOON: 'spoon',
  JAM: 'jam',
  JAM_HARD: 'jamHard',
  SLEEP_CLOUD: 'sleepCloud',
  PAGE: 'page',
  WISH_LEAF: 'wishLeaf',
  DREAM_WIND: 'dreamWind',
  TEACUP_SPIN: 'teacupSpin',
  RIBBON_BRIDGE: 'ribbonBridge',
  WAIT_FLOWER: 'waitFlower',
  RIBBON_WIND: 'ribbonWind',
  BALLOON_GOAL_CLOUD: 'balloonGoalCloud',
};
