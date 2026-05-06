/**
 * 責務: 風船ライドの接続風船に関する揺れ、表示矩形、当たり判定、クリア時分離座標を計算する。
 * 更新ルール: 風船の在庫や演出配列は持たず、プレイヤー位置・残数・設定から幾何情報だけを返す。
 * 更新ルール: ライド中のアイテム取得判定は被弾判定とは分け、乗車姿勢の見た目に寄せた広めの矩形として公開する。
 * 更新ルール: 接続風船は画像自体を反転せず、上昇スクロール時だけplayer.facingに応じて手側へ表示位置を寄せる。横スクロール時は従来の右手側固定にする。
 */
import { DEFAULT_BALLOON_RIDE_CONFIG } from './BalloonRideConfig.js';

const BALLOON_VISUAL_HEIGHT_BY_COUNT = Object.freeze({ 1: 58, 2: 66, 3: 72, 4: 78 });
const BALLOON_VISUAL_ASPECT = 320 / 480;
const BALLOON_VISUAL_OFFSET_X_RIGHT = 26;
const BALLOON_VISUAL_OFFSET_X_LEFT = -21;
const BALLOON_VISUAL_OFFSET_Y = 3;

export class BalloonRideBalloonModel {
  getRideBob(config = DEFAULT_BALLOON_RIDE_CONFIG, elapsed = 0) {
    return Math.sin(elapsed * config.rideBobSpeed) * config.rideBobAmount;
  }

  getVisualRect(player, count, config = DEFAULT_BALLOON_RIDE_CONFIG, elapsed = 0) {
    if (count <= 0) return null;
    const h = BALLOON_VISUAL_HEIGHT_BY_COUNT[count] || BALLOON_VISUAL_HEIGHT_BY_COUNT[4];
    const w = h * BALLOON_VISUAL_ASPECT;
    const bob = this.getRideBob(config, elapsed);
    const verticalUp = config?.scrollMode === 'verticalUp';
    const offsetX = verticalUp && player.facing < 0 ? BALLOON_VISUAL_OFFSET_X_LEFT : BALLOON_VISUAL_OFFSET_X_RIGHT;
    return {
      x: player.x + player.w / 2 - w / 2 + offsetX,
      y: player.y + BALLOON_VISUAL_OFFSET_Y - h + bob,
      w,
      h,
    };
  }

  getHitbox(player, count, config = DEFAULT_BALLOON_RIDE_CONFIG, elapsed = 0) {
    const visual = this.getVisualRect(player, count, config, elapsed);
    if (!visual) return null;
    const padX = Math.max(3, visual.w * 0.12);
    const padY = Math.max(4, visual.h * 0.12);
    return {
      x: visual.x + padX,
      y: visual.y + padY,
      w: Math.max(4, visual.w - padX * 2),
      h: Math.max(4, visual.h - padY * 2),
    };
  }

  getPlayerRideHitbox(player) {
    if (typeof player.getDamageBounds === 'function') return player.getDamageBounds();
    return {
      x: player.x + 4,
      y: player.y + 6,
      w: Math.max(4, player.w - 8),
      h: Math.max(4, player.h - 10),
    };
  }

  getPlayerRidePickupBounds(player, config = DEFAULT_BALLOON_RIDE_CONFIG, elapsed = 0) {
    const base = typeof player.getBounds === 'function'
      ? player.getBounds()
      : { x: player.x, y: player.y, w: player.w || 28, h: player.h || 40 };
    const bob = this.getRideBob(config, elapsed);
    return {
      x: base.x - 22,
      y: base.y - 28 + Math.min(0, bob),
      w: base.w + 44,
      h: base.h + 50 + Math.abs(bob),
    };
  }

  createDetachedFloatSeed(player, count, config, elapsed) {
    const rect = this.getVisualRect(player, count, config, elapsed);
    if (!rect || count <= 0) return null;
    return {
      count,
      x: rect.x + rect.w / 2,
      y: rect.y + rect.h / 2,
      w: rect.w,
      h: rect.h,
      age: 0,
    };
  }
}
