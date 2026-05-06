/**
 * 責務: ステージ定義からボスActorを生成する処理を担当する。
 * 更新ルール: ボスAIや演出開始処理は持たせない。
 */
import { Boss } from './Boss.js';

export class BossFactory {
  static create(def, difficultyScale = 1) {
    return def ? new Boss(def, difficultyScale) : null;
  }
}
