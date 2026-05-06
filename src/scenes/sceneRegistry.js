/**
 * 責務: Scene IDとSceneクラスの対応を集約する。
 * 更新ルール: Sceneクラスの横断importはこのファイルだけに限定し、各Sceneやstage層から他Sceneを直接importしない。
 */
import { SCENES } from '../config/sceneIds.js';
import { DebugScene } from './DebugScene.js';
import { GardenScene } from './GardenScene.js';
import { KeyConfigScene } from './KeyConfigScene.js';
import { OpeningScene } from './OpeningScene.js';
import { OptionScene } from './OptionScene.js';
import { ResultScene } from './ResultScene.js';
import { ShopScene } from './ShopScene.js';
import { StageScene } from './StageScene.js';
import { TitleScene } from './TitleScene.js';
import { TouchControlScene } from './TouchControlScene.js';

export function createSceneRegistry() {
  return new Map([
    [SCENES.TITLE, TitleScene],
    [SCENES.OPENING, OpeningScene],
    [SCENES.GARDEN, GardenScene],
    [SCENES.STAGE, StageScene],
    [SCENES.RESULT, ResultScene],
    [SCENES.OPTION, OptionScene],
    [SCENES.KEY_CONFIG, KeyConfigScene],
    [SCENES.TOUCH_CONTROL, TouchControlScene],
    [SCENES.SHOP, ShopScene],
    [SCENES.DEBUG, DebugScene],
  ]);
}
