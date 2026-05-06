/**
 * 責務: なのちゃん本体、滑空・位置交換の補助エフェクトを描画する。
 * 更新ルール: なのちゃんの状態変更や入力判定は行わず、NanoCompanionの公開状態を読み取って描画だけを担当する。頭乗り専用アセットは前面用だけを使い、上下揺れ・左右反転・被弾点滅はplayerVisualMetrics.jsのプレイヤー描画量と同期させる。頭乗り時のアクション沈み込み・被弾跳ね・歩行フレーム別上下補正は描画オフセットとしてここに閉じ込める。
 * 更新ルール: ライド演出中の単体非表示はNanoRideSupportの公開状態を読む。BalloonRideSystemへ描画可否を問い合わせない。
 */
import { NANO_CONFIG, NANO_STATES } from '../config/nanoConfig.js';
import { drawSprite } from './drawSprite.js';
import { getPlayerVisualMetrics } from './playerVisualMetrics.js';

export class NanoRenderer {
  constructor(app) {
    this.app = app;
  }

  render(scene, ctx, nano) {
    if (!nano || this.shouldHideForBalloonRide(scene)) return;
    this.renderNanoSprite(ctx, nano, scene.elapsed);
    this.renderSwapFx(ctx, nano);
  }

  renderMountedFront(scene, ctx, nano) {
    if (!nano || this.shouldHideForBalloonRide(scene) || !this.isMountedState(nano)) return;
    const img = this.app.assets.getImage('nano_mount_front');
    const frame = this.getMountedFrame(nano, scene);
    drawSprite(ctx, img, frame.drawX, frame.drawY, NANO_CONFIG.MOUNT_DRAW_W, NANO_CONFIG.MOUNT_DRAW_H, frame.flipX, frame.alpha);
    this.renderSwapFx(ctx, nano);
  }

  isMountedState(nano) {
    return nano.state === NANO_STATES.HEAD;
  }

  shouldHideForBalloonRide(scene) {
    return !!scene?.nanoRideSupport?.shouldHideNanoVisual?.();
  }

  renderNanoSprite(ctx, nano, elapsed) {
    const key = this.getImageKey(nano);
    const img = this.app.assets.getImage(key) || this.app.assets.getImage('npc_teacup_fairy_float') || this.app.assets.getImage('npc_teacup_fairy');
    const bob = nano.state === NANO_STATES.HEAD ? Math.sin(elapsed * 11) * 0.7 : Math.sin(elapsed * 5.8) * 2;
    const drawX = nano.x + nano.w / 2 - NANO_CONFIG.DRAW_W / 2;
    const drawY = nano.y + nano.h / 2 - NANO_CONFIG.DRAW_H / 2 + bob;
    const alpha = nano.state === NANO_STATES.RETURN ? 0.86 : 1;
    drawSprite(ctx, img, drawX, drawY, NANO_CONFIG.DRAW_W, NANO_CONFIG.DRAW_H, this.getDetachedFlipX(nano), alpha);
  }

  getDetachedFlipX(nano) {
    return (nano.facing || 1) < 0;
  }

  getMountedFrame(nano, scene) {
    const playerVisual = scene.player ? getPlayerVisualMetrics(scene, scene.player) : null;
    const playerBobY = playerVisual?.bobY ?? 0;
    const actionOffsetY = this.getMountedActionOffsetY(scene.player);
    const walkFrameOffsetY = this.getMountedWalkFrameOffsetY(playerVisual);
    const damageBounceY = this.getMountedDamageBounceY(scene.player);
    const drawX = nano.x + nano.w / 2 - NANO_CONFIG.MOUNT_DRAW_W / 2 + NANO_CONFIG.MOUNT_OFFSET_X;
    const drawY = nano.y + nano.h / 2 - NANO_CONFIG.MOUNT_DRAW_H / 2 + NANO_CONFIG.MOUNT_OFFSET_Y + playerBobY + actionOffsetY + walkFrameOffsetY + damageBounceY;
    return { drawX, drawY, flipX: playerVisual?.flipX ?? false, alpha: playerVisual?.damageAlpha ?? 1 };
  }

  getMountedActionOffsetY(player) {
    if (!player) return 0;
    const active = player.magic?.castFlash > 0 || player.tea?.activeTimer > 0 || player.bow?.activeTimer > 0;
    return active ? NANO_CONFIG.MOUNT_ACTION_OFFSET_Y : 0;
  }

  getMountedWalkFrameOffsetY(playerVisual) {
    if (!playerVisual?.isWalking) return 0;
    if (playerVisual.imgKey === 'hero_walk_1' || playerVisual.imgKey === 'hero_walk_3') return NANO_CONFIG.MOUNT_WALK_DOWN_OFFSET_Y;
    if (playerVisual.imgKey === 'hero_walk_2' || playerVisual.imgKey === 'hero_walk_4') return NANO_CONFIG.MOUNT_WALK_UP_OFFSET_Y;
    return 0;
  }

  getMountedDamageBounceY(player) {
    if (!player || player.damageFlash <= 0) return 0;
    const rate = Math.max(0, Math.min(1, player.damageFlash / NANO_CONFIG.MOUNT_DAMAGE_BOUNCE_TIME));
    return -Math.sin((1 - rate) * Math.PI) * NANO_CONFIG.MOUNT_DAMAGE_BOUNCE_Y;
  }

  getImageKey(nano) {
    if (nano.state === NANO_STATES.FLY || nano.state === NANO_STATES.RETURN) return 'npc_teacup_fairy_spin';
    if (nano.state === NANO_STATES.WAIT) return 'npc_teacup_fairy_float';
    return 'npc_teacup_fairy_happy';
  }

  renderSwapFx(ctx, nano) {
    const cx = nano.x + nano.w / 2;
    const cy = nano.y + nano.h / 2;
    if (nano.swapFxTimer > 0) {
      const rate = nano.swapFxTimer / NANO_CONFIG.SWAP_FX_TIME;
      this.strokeRing(ctx, cx, cy, 10 + (1 - rate) * 22, rate, '#d8fff7');
    }
    if (nano.swapFailFxTimer > 0) {
      const rate = nano.swapFailFxTimer / NANO_CONFIG.SWAP_FAIL_FX_TIME;
      this.strokeRing(ctx, cx, cy, 12 + (1 - rate) * 12, rate, '#ff9eb4');
      ctx.save();
      ctx.globalAlpha = rate;
      ctx.strokeStyle = '#ff7190';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8);
      ctx.lineTo(cx + 8, cy + 8);
      ctx.moveTo(cx + 8, cy - 8);
      ctx.lineTo(cx - 8, cy + 8);
      ctx.stroke();
      ctx.restore();
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
