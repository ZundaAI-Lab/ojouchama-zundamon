/**
 * 責務: requestAnimationFrameから経過時間を測り、GameAppへフレーム時間を渡す。
 * 更新ルール: 固定物理ステップの分割はGameAppが担当する。ここにはゲーム固有ルールや物理処理を持ち込まない。
 */
export class GameLoop {
  constructor(update) {
    this.update = update;
    this.running = false;
    this.lastTime = 0;
    this.frame = this.frame.bind(this);
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = 0;
    requestAnimationFrame(this.frame);
  }
  stop() {
    this.running = false;
  }
  frame(time) {
    if (!this.running) return;
    const dt = (time - (this.lastTime || time)) / 1000;
    this.lastTime = time;
    this.update(dt);
    requestAnimationFrame(this.frame);
  }
}
