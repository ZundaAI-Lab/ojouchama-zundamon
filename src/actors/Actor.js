/**
 * 責務: Actor共通の座標・サイズ・速度・矩形取得を提供する基底クラスを担当する。
 * 更新ルール: 描画・入力・セーブ処理を持たせず、全Actorに共通する最小状態だけを置く。
 */
export class Actor {
  constructor({ x = 0, y = 0, w = 16, h = 16 } = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.alive = true;
    this.prevX = x;
    this.prevY = y;
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
