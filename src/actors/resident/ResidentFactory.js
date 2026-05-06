/**
 * 責務: ステージ定義から住民Actorを生成する処理を担当する。
 * 更新ルール: 住民の行動更新や描画を持たせず、生成時の初期化だけを扱う。
 */
import { Resident } from './Resident.js';

export class ResidentFactory {
  static createAll(residentDefs = [], speedScale = 1, hpBonus = 0) {
    return residentDefs.map(def => new Resident(def, speedScale, hpBonus));
  }
}
