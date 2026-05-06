/**
 * 責務: ステージ画面SceneとしてStageRuntimeの生成・更新・描画委譲を担当する。
 * 更新ルール: ステージ内ロジックはstage配下へ置き、Sceneを薄く保つ。
 */
import { BaseScene } from './BaseScene.js';
import { StageRuntime } from '../stage/StageRuntime.js';

export class StageScene extends BaseScene {
  async enter() {
    this.runtime = new StageRuntime(this.app, this.params);
    await this.runtime.enter();
  }

  exit() {
    this.runtime?.exit();
    this.runtime = null;
  }

  update(dt) {
    this.runtime?.update(dt);
  }

  render(ctx) {
    this.runtime?.render(ctx);
  }
}
