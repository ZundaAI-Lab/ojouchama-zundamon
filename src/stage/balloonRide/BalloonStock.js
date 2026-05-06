/**
 * 責務: 風船ライド中の残風船リスト、初期個数、消費順、風船減少による沈下量を管理する。
 * 更新ルール: 在庫状態だけを持ち、破裂演出・SE・失敗遷移は呼び出し元へ返した結果から実行する。
 */
import { DEFAULT_BALLOON_RIDE_CONFIG } from './BalloonRideConfig.js';

export class BalloonStock {
  constructor() {
    this.reset();
  }

  start(colors) {
    this.remaining = [...colors];
    this.initialCount = this.remaining.length;
  }

  reset() {
    this.remaining = [];
    this.initialCount = 0;
  }

  get count() {
    return this.remaining.length;
  }

  get colors() {
    return [...this.remaining];
  }

  getVisibleCount(visible) {
    return visible ? this.remaining.length : 0;
  }

  getLostCount() {
    return Math.max(0, this.initialCount - this.remaining.length);
  }

  getDownDrift(config = DEFAULT_BALLOON_RIDE_CONFIG) {
    return this.getLostCount() * (config.balloonLossDownDrift ?? DEFAULT_BALLOON_RIDE_CONFIG.balloonLossDownDrift);
  }

  pop() {
    if (this.remaining.length <= 0) return null;
    return this.remaining.shift();
  }

  isEmpty() {
    return this.remaining.length <= 0;
  }
}
