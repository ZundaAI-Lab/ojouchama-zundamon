/**
 * 責務: ゲーム基盤のライフサイクル、ループ、カメラ、シーン管理を担当する。
 * 更新ルール: ゲーム固有ルールを持ち込まず、汎用基盤として保つ。
 */
import { clamp, lerp } from '../utils/math.js';
import { GAME_VIEW } from '../config/view.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.target = null;
    this.worldWidth = GAME_VIEW.WIDTH;
    this.worldHeight = GAME_VIEW.HEIGHT;
    this.shakeTimer = 0;
    this.shakeAmount = 0;
  }
  setWorldSize(width, height) {
    this.worldWidth = width;
    this.worldHeight = height;
  }
  follow(target) {
    this.target = target;
  }
  shake(amount = 3, duration = 0.22) {
    this.shakeAmount = Math.max(this.shakeAmount, amount);
    this.shakeTimer = Math.max(this.shakeTimer, duration);
  }
  update(dt) {
    if (this.target) {
      const desiredX = this.target.x + this.target.w / 2 - GAME_VIEW.WIDTH / 2;
      const desiredY = this.target.y + this.target.h / 2 - GAME_VIEW.HEIGHT / 2;
      const maxX = Math.max(0, this.worldWidth - GAME_VIEW.WIDTH);
      const maxY = Math.max(0, this.worldHeight - GAME_VIEW.HEIGHT);
      this.x = lerp(this.x, clamp(desiredX, 0, maxX), 0.12);
      this.y = lerp(this.y, clamp(desiredY, 0, maxY), 0.1);
    }
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    } else {
      this.shakeAmount = 0;
    }
  }
  begin(ctx) {
    const sx = this.shakeTimer > 0 ? (Math.random() * 2 - 1) * this.shakeAmount : 0;
    const sy = this.shakeTimer > 0 ? (Math.random() * 2 - 1) * this.shakeAmount : 0;
    ctx.save();
    ctx.translate(-Math.round(this.x) + sx, -Math.round(this.y) + sy);
  }
  end(ctx) {
    ctx.restore();
  }
}
