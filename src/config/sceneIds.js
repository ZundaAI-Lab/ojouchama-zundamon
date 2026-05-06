/**
 * 責務: 画面遷移で使うScene IDを一元管理する。
 * 更新ルール: Sceneクラスを直接渡さず、このIDだけをSceneManagerへ渡してScene同士のimport循環を防ぐ。
 */
export const SCENES = Object.freeze({
  TITLE: 'title',
  OPENING: 'opening',
  GARDEN: 'garden',
  STAGE: 'stage',
  RESULT: 'result',
  OPTION: 'option',
  KEY_CONFIG: 'keyConfig',
  TOUCH_CONTROL: 'touchControl',
  SHOP: 'shop',
  DEBUG: 'debug',
});
