/**
 * 責務: ゲーム基盤のライフサイクル、ループ、カメラ、シーン管理を担当する。
 * 更新ルール: ゲーム固有ルールを持ち込まず、汎用基盤として保つ。
 * 更新ルール: ズーム値は汎用の描画倍率としてのみ扱い、演出ごとの開始・復帰判断は呼び出し側へ委譲する。
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
    this.zoom = 1;
  }
  setWorldSize(width, height) {
    this.worldWidth = width;
    this.worldHeight = height;
  }
  follow(target) {
    this.target = target;
  }
  getZoom() {
    return clamp(Number.isFinite(this.zoom) ? this.zoom : 1, 0.1, 4);
  }
  getViewWidth() {
    return GAME_VIEW.WIDTH / this.getZoom();
  }
  getViewHeight() {
    return GAME_VIEW.HEIGHT / this.getZoom();
  }
  getVisibleRect() {
    const viewWidth = this.getViewWidth();
    const viewHeight = this.getViewHeight();
    const offsetX = (GAME_VIEW.WIDTH - viewWidth) / 2;
    const offsetY = (GAME_VIEW.HEIGHT - viewHeight) / 2;
    const left = this.x + offsetX;
    const top = this.y + offsetY;
    return {
      left,
      right: left + viewWidth,
      top,
      bottom: top + viewHeight,
      width: viewWidth,
      height: viewHeight,
    };
  }
  getClampBounds() {
    const viewWidth = this.getViewWidth();
    const viewHeight = this.getViewHeight();
    const offsetX = (GAME_VIEW.WIDTH - viewWidth) / 2;
    const offsetY = (GAME_VIEW.HEIGHT - viewHeight) / 2;
    const minX = -offsetX;
    const minY = -offsetY;
    const maxX = this.worldWidth - viewWidth - offsetX;
    const maxY = this.worldHeight - viewHeight - offsetY;

    if (maxX < minX || maxY < minY) {
      return {
        minX: maxX < minX ? (this.worldWidth - GAME_VIEW.WIDTH) / 2 : minX,
        maxX: maxX < minX ? (this.worldWidth - GAME_VIEW.WIDTH) / 2 : maxX,
        minY: maxY < minY ? (this.worldHeight - GAME_VIEW.HEIGHT) / 2 : minY,
        maxY: maxY < minY ? (this.worldHeight - GAME_VIEW.HEIGHT) / 2 : maxY,
      };
    }

    return { minX, maxX, minY, maxY };
  }
  clampToWorld() {
    const bounds = this.getClampBounds();
    this.x = clamp(this.x, bounds.minX, bounds.maxX);
    this.y = clamp(this.y, bounds.minY, bounds.maxY);
  }
  setZoom(zoom = 1) {
    this.zoom = clamp(Number.isFinite(zoom) ? zoom : 1, 0.1, 4);
    this.clampToWorld();
  }
  resetZoom() {
    this.setZoom(1);
  }
  shake(amount = 3, duration = 0.22) {
    this.shakeAmount = Math.max(this.shakeAmount, amount);
    this.shakeTimer = Math.max(this.shakeTimer, duration);
  }
  update(dt) {
    if (this.target) {
      const desiredX = this.target.x + this.target.w / 2 - GAME_VIEW.WIDTH / 2;
      const desiredY = this.target.y + this.target.h / 2 - GAME_VIEW.HEIGHT / 2;
      const bounds = this.getClampBounds();
      this.x = lerp(this.x, clamp(desiredX, bounds.minX, bounds.maxX), 0.12);
      this.y = lerp(this.y, clamp(desiredY, bounds.minY, bounds.maxY), 0.1);
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
    const zoom = this.getZoom();
    const cameraX = Math.round(this.x);
    const cameraY = Math.round(this.y);
    ctx.save();
    if (zoom === 1) {
      ctx.translate(-cameraX + sx, -cameraY + sy);
      return;
    }
    ctx.translate(GAME_VIEW.WIDTH / 2 + sx, GAME_VIEW.HEIGHT / 2 + sy);
    ctx.scale(zoom, zoom);
    ctx.translate(-(cameraX + GAME_VIEW.WIDTH / 2), -(cameraY + GAME_VIEW.HEIGHT / 2));
  }
  end(ctx) {
    ctx.restore();
  }
}
