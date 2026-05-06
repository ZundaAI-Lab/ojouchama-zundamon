/**
 * 責務: 定数・設定定義を用途別に公開する。
 * 更新ルール: 実行時状態やDOM操作を置かず、定義値の変更時は利用箇所を同時に確認する。
 */
export const INPUT_ACTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
  JUMP: 'jump',
  MAGIC: 'magic',
  BOW: 'bow',
  TEA: 'tea',
  NANO: 'nano',
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  PAUSE: 'pause',
  UI_UP: 'ui_up',
  UI_DOWN: 'ui_down',
  UI_LEFT: 'ui_left',
  UI_RIGHT: 'ui_right',
  UI_CONFIRM: 'ui_confirm',
  UI_CANCEL: 'ui_cancel',
};
