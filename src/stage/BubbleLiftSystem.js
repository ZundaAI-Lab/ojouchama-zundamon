/**
 * 責務: 中立ギミック弾による持ち上げ効果をプレイヤー/なのちゃんへ適用する。
 * 更新ルール: 弾生成や住民AIを扱わず、contactEffect.type='lift' の外力適用だけを担当する。
 */
import { NANO_STATES } from '../config/nanoConfig.js';
import { intersects } from '../utils/rect.js';

export class BubbleLiftSystem {
  static resolve(runtime, projectile) {
    const effect = projectile.contactEffect;
    if (!effect || effect.type !== 'lift') return false;

    let touched = false;
    const targetTypes = effect.targetTypes || ['player'];
    if (targetTypes.includes('player') && intersects(projectile.getBounds(), runtime.player.getBounds())) {
      this.applyToPlayer(runtime.player, projectile, effect);
      touched = true;
    }

    const nano = runtime.nano;
    if (
      targetTypes.includes('nano') &&
      nano &&
      nano.state !== NANO_STATES.HEAD &&
      intersects(projectile.getBounds(), nano.getBounds())
    ) {
      this.applyToNano(runtime, nano, projectile, effect);
      touched = true;
    }

    return touched;
  }

  static applyToPlayer(player, projectile, effect) {
    const followStrengthX = effect.followStrengthX ?? 0.05;
    player.vy = Math.min(player.vy, effect.liftVy ?? -48);
    player.vx += (projectile.vx - player.vx) * followStrengthX;
    player.onGround = false;
  }

  static applyToNano(runtime, nano, projectile, effect) {
    const dt = runtime.lastDt || 1 / 60;
    const liftVy = effect.nanoLiftVy ?? effect.liftVy ?? -42;
    const followStrengthX = effect.followStrengthX ?? 0.05;
    const next = {
      x: nano.x + (projectile.vx - (nano.vx || 0)) * followStrengthX * dt,
      y: nano.y + liftVy * dt,
      w: nano.w,
      h: nano.h,
    };

    if (!this.canMoveNanoTo(runtime, next)) return;
    nano.x = next.x;
    nano.y = next.y;
    nano.vy = Math.min(nano.vy || 0, liftVy);
    nano.vx += (projectile.vx - (nano.vx || 0)) * followStrengthX;
  }

  static canMoveNanoTo(runtime, rect) {
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > runtime.stage.width || rect.y + rect.h > runtime.stage.height) return false;
    return !runtime.getCollisionSolids('fitCheck').some(solid => solid.active !== false && intersects(rect, solid));
  }
}
