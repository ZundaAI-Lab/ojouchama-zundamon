/**
 * 責務: 任意の弾配列を指定された範囲内で移動・寿命更新する。
 * 更新ルール: 命中効果や報酬は呼び出し側の onAfterStep へ委譲し、弾そのものの更新だけを扱う。
 */
import { ProjectileMotion } from '../../actors/projectile/ProjectileMotion.js';

export class ProjectileUpdateSystem {
  static update(projectiles, dt, options = {}) {
    const bounds = options.bounds || {};
    const left = bounds.left ?? -Infinity;
    const right = bounds.right ?? Infinity;
    const top = bounds.top ?? -Infinity;
    const bottom = bounds.bottom ?? Infinity;

    for (const projectile of projectiles) {
      if (!projectile.alive) continue;
      ProjectileMotion.step(projectile, dt);
      if (!projectile.alive) continue;
      options.onAfterStep?.(projectile);
      if (!projectile.alive) continue;
      if (projectile.x < left || projectile.x > right || projectile.y < top || projectile.y > bottom) {
        projectile.alive = false;
      }
    }
  }
}
