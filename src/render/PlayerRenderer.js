/**
 * 責務: プレイヤーの状態別スプライト、歩行アニメ、無住民点滅、ティー強化リングを描画する。
 * 更新ルール: 入力・移動・状態遷移は Player 側に置き、ここでは読み取り専用で描画する。プレイヤーの上下揺れ量と左右反転は playerVisualMetrics.js に集約し、なのちゃん頭乗り描画と完全同期させる。
 * 更新ルール: 風船ライド専用ポーズの左右反転は上昇スクロール時だけplayer.facingを反映する。横スクロール時は従来通り右向き固定にする。
 */
import { NANO_CONFIG } from '../config/nanoConfig.js';
import { drawSprite } from './drawSprite.js';
import { getPlayerVisualMetrics } from './playerVisualMetrics.js';

export class PlayerRenderer {
  constructor(app) {
    this.app = app;
  }

  render(scene, ctx, player) {
    if (scene.balloonRideSystem?.isRideVisualActive() && !scene.balloonRideSystem?.isClearing?.()) {
      this.renderBalloonRidePose(scene, ctx, player);
      return;
    }

    const visual = getPlayerVisualMetrics(scene, player);
    const img = this.app.assets.getImage(visual.imgKey) || this.app.assets.getImage(visual.baseImageKey) || this.app.assets.getImage('hero_idle');
    drawSprite(ctx, img, visual.drawX, visual.drawY, visual.drawW, visual.drawH, visual.flipX, visual.damageAlpha);

    if (player.tea.boostTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#ffe28d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 26 + Math.sin(scene.elapsed * 8) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    this.renderNanoSwapFx(ctx, player);
  }

  renderBalloonRidePose(scene, ctx, player) {
    const hit = scene.balloonRideSystem?.isHitVisualActive();
    const img = this.app.assets.getImage(hit ? 'hero_balloon_ride_hit' : 'hero_balloon_ride_idle') || this.app.assets.getImage('hero_idle');
    const drawH = hit ? 84 : 86;
    const drawW = img ? drawH * (img.width / img.height) : 74;
    const bob = scene.balloonRideSystem?.getRideBob(scene.elapsed) || 0;
    const alpha = hit && Math.floor(scene.elapsed * 22) % 2 === 0 ? 0.72 : 1;
    const flipX = !!scene.balloonRideSystem?.isVerticalUpActive?.() && player.facing < 0;
    drawSprite(ctx, img, player.x + player.w / 2 - drawW / 2, player.y + player.h - drawH + 5 + bob, drawW, drawH, flipX, alpha);
  }

  renderNanoSwapFx(ctx, player) {
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    if (player.nanoSwapFxTimer > 0) {
      const rate = player.nanoSwapFxTimer / NANO_CONFIG.SWAP_FX_TIME;
      this.strokeRing(ctx, cx, cy, 16 + (1 - rate) * 24, rate, '#f2ffe0');
    }
    if (player.nanoSwapFailFxTimer > 0) {
      const rate = player.nanoSwapFailFxTimer / NANO_CONFIG.SWAP_FAIL_FX_TIME;
      this.strokeRing(ctx, cx, cy, 18 + (1 - rate) * 12, rate, '#ff9eb4');
    }
  }

  strokeRing(ctx, x, y, r, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
