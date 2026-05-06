/**
 * 責務: プレイヤーの浮遊ライド中の移動入力、画面内座標、復帰/着地時の座標反映を担当する。
 * 更新ルール: 風船の残数や住民接触などライド固有ルールは持たず、外部から渡された移動設定と沈下量だけでPlayerへ反映する。
 * 更新ルール: ライド中の座標は画面内座標＋スクロール座標として反映する。横スクロール時は従来通り右向き固定、上昇スクロール時だけ入力に応じて左右を向く。
 */
import { INPUT_ACTIONS } from '../../config/inputActions.js';
import { clamp, approach } from '../../utils/math.js';

export class PlayerFloatingRideMotion {
  constructor() {
    this.reset();
  }

  reset() {
    this.screenX = 0;
    this.screenY = 0;
    this.vx = 0;
    this.vy = 0;
  }

  begin(player, { scrollX = 0, scrollY = 0, screenX = 0, screenY = 0, scrollSpeedX = 0, scrollSpeedY = 0 } = {}) {
    this.screenX = screenX;
    this.screenY = screenY;
    this.vx = 0;
    this.vy = 0;
    this.applyPosition(player, {
      scrollX,
      scrollY,
      scrollSpeedX,
      scrollSpeedY,
    });
  }

  update(player, { dt, input, scrollX = 0, scrollY = 0, scrollSpeedX = 0, scrollSpeedY = 0, config, downDrift = 0 } = {}) {
    const moveX = (input?.isDown(INPUT_ACTIONS.RIGHT) ? 1 : 0) - (input?.isDown(INPUT_ACTIONS.LEFT) ? 1 : 0);
    const moveY = (input?.isDown(INPUT_ACTIONS.DOWN) ? 1 : 0) - (input?.isDown(INPUT_ACTIONS.UP) ? 1 : 0);
    const accel = (config?.accel || 0) * dt;
    const drag = (config?.drag || 0) * dt;

    this.vx = moveX ? approach(this.vx, moveX * (config?.moveSpeedX || 0), accel) : approach(this.vx, 0, drag);
    this.vy = moveY ? approach(this.vy, moveY * (config?.moveSpeedY || 0), accel) : approach(this.vy, 0, drag);

    const bounds = config?.bounds || { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const verticalUp = config?.scrollMode === 'verticalUp';
    const facing = verticalUp ? (moveX < 0 ? -1 : (moveX > 0 ? 1 : player?.facing)) : 1;
    this.screenX = clamp(this.screenX + this.vx * dt, bounds.minX, bounds.maxX);
    this.screenY += (this.vy + downDrift) * dt;
    if (this.screenY <= bounds.minY) {
      this.screenY = bounds.minY;
      this.vy = 0;
    }
    if (this.screenX <= bounds.minX || this.screenX >= bounds.maxX) this.vx = 0;

    this.applyPosition(player, {
      scrollX,
      scrollY,
      scrollSpeedX,
      scrollSpeedY,
      facing,
    });

    return {
      screenX: this.screenX,
      screenY: this.screenY,
    };
  }

  applyPosition(player, { scrollX = 0, scrollY = 0, scrollSpeedX = 0, scrollSpeedY = 0, facing = player?.facing } = {}) {
    if (!player) return;
    player.prevX = player.x;
    player.prevY = player.y;
    player.x = scrollX + this.screenX;
    player.y = scrollY + this.screenY;
    player.vx = scrollSpeedX + this.vx;
    player.vy = scrollSpeedY + this.vy;
    player.onGround = false;
    if (Number.isFinite(facing) && facing !== 0) player.facing = facing;
  }

  lockAtAnchor(player, anchor) {
    if (!player || !anchor) return;
    this.screenX = 0;
    this.screenY = 0;
    this.vx = 0;
    this.vy = 0;
    player.prevX = player.x;
    player.prevY = player.y;
    player.x = anchor.playerX;
    player.y = anchor.playerY;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
  }

  place(player, { x, y, vx = 0, vy = 0, onGround = false, facing = player?.facing || 1 } = {}) {
    if (!player) return;
    player.prevX = player.x;
    player.prevY = player.y;
    player.x = x;
    player.y = y;
    player.vx = vx;
    player.vy = vy;
    player.onGround = onGround;
    player.facing = facing;
    this.screenX = 0;
    this.screenY = y;
    this.vx = vx;
    this.vy = vy;
  }

  driftFailure(player, { dt, elapsed = 0, baseSpeed = 120, acceleration = 180 } = {}) {
    if (!player) return;
    player.prevX = player.x;
    player.prevY = player.y;
    player.y += (baseSpeed + elapsed * acceleration) * dt;
    player.vx = 0;
    player.vy = baseSpeed;
    player.onGround = false;
  }

  setVelocity(vx = this.vx, vy = this.vy) {
    this.vx = vx;
    this.vy = vy;
  }
}
