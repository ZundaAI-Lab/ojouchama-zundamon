/**
 * 責務: 取得アイテムの浮遊アニメーション描画を担当する。
 * 更新ルール: アイテム取得処理や効果付与は stage/ 側に置き、ここでは描画だけを行う。
 * 更新ルール: 報酬ドロップは物理座標と見た目を一致させるため、通常アイテムの浮遊bobをかけない。
 */
import { drawSprite } from './drawSprite.js';

export class ItemRenderer {
  constructor(app) {
    this.app = app;
  }

  render(ctx, items) {
    for (const item of items) {
      const img = this.app.assets.getImage(item.imageKey);
      const bob = item.rewardDrop ? 0 : Math.sin(item.floatPhase) * 2;
      const size = item.renderSize || 18;
      drawSprite(ctx, img, item.x - size / 2, item.y - size / 2 + bob, size, size);
    }
  }
}
