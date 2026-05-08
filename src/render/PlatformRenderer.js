/**
 * 責務: scene内の足場を走査し、足場種別ごとの描画は platformRenderRegistry へ委譲する。
 * 更新ルール: 足場の状態変更や当たり判定は stage/ 側に置き、ここでは描画の入口だけを管理する。
 */
import { renderPlatform } from './platforms/platformRenderRegistry.js';

export class PlatformRenderer {
  constructor(app) {
    this.app = app;
  }

  render(scene, ctx) {
    for (const platform of scene.stage.platforms) {
      renderPlatform(this.app, scene, ctx, platform);
    }
  }
}
