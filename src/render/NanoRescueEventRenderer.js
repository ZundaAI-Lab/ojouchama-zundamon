/**
 * 責務: なのちゃん救出イベント専用のキャンディドームと解放中なのちゃんの描画を担当する。
 * 更新ルール: イベント状態変更や加入判定はNanoRescueEventSystemへ置き、ここでは公開フレーム情報だけを読む。頭乗り演出など手前表示が必要な一時なのちゃんはrenderFrontで描く。
 */
import { drawSprite } from './drawSprite.js';

export class NanoRescueEventRenderer {
  constructor(app) {
    this.app = app;
  }

  render(scene, ctx) {
    const event = scene.nanoRescueEvent;
    if (!event?.isVisible?.()) return;

    this.renderDome(event, ctx);
    if (!event.shouldRenderNanoInFront?.()) this.renderReleasedNano(event, ctx, scene.elapsed);
  }

  renderFront(scene, ctx) {
    const event = scene.nanoRescueEvent;
    if (!event?.isVisible?.() || !event.shouldRenderNanoInFront?.()) return;
    this.renderReleasedNano(event, ctx, scene.elapsed);
  }

  renderDome(event, ctx) {
    const frame = event.getObjectFrame?.();
    const imageKey = event.getDomeImageKey?.();
    if (!frame || !imageKey) return;

    const img = this.app.assets.getImage(imageKey);
    drawSprite(ctx, img, frame.x, frame.y, frame.w, frame.h);

    const flash = event.getBreakingFlashRate?.() || 0;
    if (flash > 0) this.renderBreakingFlash(ctx, frame, flash);
  }

  renderBreakingFlash(ctx, frame, flash) {
    ctx.save();
    ctx.globalAlpha = flash * 0.45;
    ctx.fillStyle = '#fff7c8';
    ctx.beginPath();
    ctx.ellipse(frame.x + frame.w / 2, frame.y + frame.h * 0.52, frame.w * 0.44, frame.h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderReleasedNano(event, ctx, elapsed) {
    const nano = event.getNanoVisualFrame?.();
    if (!nano) return;

    const img = this.app.assets.getImage(nano.imageKey) || this.app.assets.getImage('npc_teacup_fairy_happy');
    const bob = Math.sin(elapsed * 12) * 2;
    drawSprite(ctx, img, nano.x, nano.y + bob, nano.w, nano.h, nano.facing < 0, nano.alpha ?? 1);
  }
}
