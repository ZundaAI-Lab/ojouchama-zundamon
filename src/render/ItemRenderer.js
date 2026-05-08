/**
 * 責務: 取得アイテムの浮遊アニメーション描画を担当する。
 * 更新ルール: アイテム取得処理や効果付与は stage/ 側に置き、ここでは描画だけを行う。
 * 更新ルール: 報酬ドロップは物理座標と見た目を一致させるため、通常アイテムの浮遊bobをかけない。
 * 更新ルール: 取得済み夢のしずくは再取得不可の目印として半透明表示に留め、取得判定はItem側へ任せる。
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
      const width = item.renderWidth || item.renderSize || 18;
      const height = item.renderHeight || item.renderSize || 18;
      ctx.save();
      if (item.acquired) ctx.globalAlpha *= 0.38;
      drawSprite(ctx, img, item.x - width / 2, item.y - height / 2 + bob, width, height);
      ctx.restore();
    }
  }
}
