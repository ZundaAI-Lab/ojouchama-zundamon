/**
 * 責務: ステージ演出やギミックが使う強制スクロール状態を管理し、Cameraへの適用だけを担当する。
 * 更新ルール: 風船ライドなど個別ギミックのルールは持たず、開始位置・速度・表示範囲・follow復帰だけを公開APIとして提供する。
 */
import { GAME_VIEW } from '../config/view.js';
import { clamp } from '../utils/math.js';

export class StageScrollController {
  constructor() {
    this.camera = null;
    this.target = null;
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.worldWidth = GAME_VIEW.WIDTH;
    this.worldHeight = GAME_VIEW.HEIGHT;
    this.viewWidth = GAME_VIEW.WIDTH;
    this.viewHeight = GAME_VIEW.HEIGHT;
  }

  begin({
    camera,
    target = null,
    startX = 0,
    startY = 0,
    speedX = 0,
    speedY = 0,
    worldWidth = GAME_VIEW.WIDTH,
    worldHeight = GAME_VIEW.HEIGHT,
    viewWidth = GAME_VIEW.WIDTH,
    viewHeight = GAME_VIEW.HEIGHT,
  } = {}) {
    this.camera = camera;
    this.target = target;
    this.active = true;
    this.speedX = speedX;
    this.speedY = speedY;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.x = this.clampX(startX);
    this.y = this.clampY(startY);
    this.applyToCamera();
  }

  update(dt) {
    if (!this.active) return;
    this.x = this.clampX(this.x + this.speedX * dt);
    this.y = this.clampY(this.y + this.speedY * dt);
    this.applyToCamera();
  }

  setPosition(x = this.x, y = this.y) {
    this.x = this.clampX(x);
    this.y = this.clampY(y);
    this.applyToCamera();
  }

  getViewRect() {
    return {
      x: this.x,
      y: this.y,
      w: this.viewWidth,
      h: this.viewHeight,
    };
  }

  endFollow(target = this.target) {
    const camera = this.camera;
    this.active = false;
    this.target = target;
    if (camera && target) camera.follow(target);
  }

  reset() {
    this.active = false;
    this.camera = null;
    this.target = null;
    this.speedX = 0;
    this.speedY = 0;
  }

  applyToCamera() {
    if (!this.camera) return;
    this.camera.target = null;
    this.camera.x = this.x;
    this.camera.y = this.y;
  }

  clampX(x) {
    return clamp(x, 0, Math.max(0, this.worldWidth - this.viewWidth));
  }

  clampY(y) {
    return clamp(y, 0, Math.max(0, this.worldHeight - this.viewHeight));
  }
}
