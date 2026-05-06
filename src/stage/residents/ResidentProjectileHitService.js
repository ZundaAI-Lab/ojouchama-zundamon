/**
 * 責務: プレイヤー弾が迷える住民へ当たった時の共通解決を担当する。
 * 更新ルール: 弾の移動や住民AIは扱わず、命中・住民側の反応・報酬付与だけをまとめる。
 */
import { CollisionSystem } from '../../systems/CollisionSystem.js';
import { ResidentRewardPolicy } from './ResidentRewardPolicy.js';

export class ResidentProjectileHitService {
  static resolvePlayerProjectile(runtime, projectile, residents, options = {}) {
    if (!projectile?.alive || projectile.faction !== 'player') return false;

    for (const resident of residents) {
      if (!this.shouldCheckResident(projectile, resident, options)) continue;
      if (!CollisionSystem.intersectsActor(projectile, resident)) continue;

      const behaviorResult = resident.handleProjectile?.(projectile, options.behaviorContext);
      if (behaviorResult?.handled) {
        if (!behaviorResult.keepProjectile) projectile.alive = false;
        return true;
      }

      projectile.alive = false;
      options.onHitResident?.(resident, projectile);
      resident.damage?.(projectile.damage || 1);
      if (resident.hp <= 0 || resident.alive === false) {
        resident.alive = false;
        ResidentRewardPolicy.apply(runtime, resident, { playSfx: true, sfx: 'resident_purify', ...(options.reward || {}) });
      } else {
        runtime.app?.audio?.playSfx?.(options.hitSfx || 'resident_hit');
      }
      return true;
    }

    return false;
  }

  static shouldCheckResident(projectile, resident, options) {
    if (!resident?.alive) return false;
    if (options.filter && !options.filter(resident)) return false;
    if (projectile.ignoreResidentId === resident.id && projectile.ignoreResidentTimer > 0) return false;
    return true;
  }
}
