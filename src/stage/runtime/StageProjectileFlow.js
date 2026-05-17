/**
 * 責務: ステージ内の弾移動、地形接触、魔法命中先への接続を担当する。
 * 更新ルール: 弾の生成定義はactors/projectile、命中先ごとの効果は各Systemへ委譲し、ここでは移動順とalive整理だけを扱う。
 */
import { ProjectileMotion } from '../../actors/projectile/ProjectileMotion.js';
import { intersects } from '../../utils/rect.js';

export function updateStageProjectiles(runtime, dt, collisionWorld) {
  const projectileSolids = collisionWorld.projectileSolids;
  const perf = runtime.app.performanceReporter;
  let projectileSubstepsTotal = 0;
  let projectileSubstepsMax = 0;
  let terrainChecks = 0;
  let terrainHits = 0;
  let playerProjectileSteps = 0;

  for (const projectile of runtime.projectiles) {
    if (!projectile.alive) continue;
    const distance = Math.hypot(projectile.vx * dt, projectile.vy * dt);
    const steps = Math.max(1, Math.min(10, Math.ceil(distance / 6)));
    const stepDt = dt / steps;
    if (perf) {
      projectileSubstepsTotal += steps;
      projectileSubstepsMax = Math.max(projectileSubstepsMax, steps);
      if (projectile.faction === 'player') playerProjectileSteps += steps;
    }

    for (let i = 0; i < steps && projectile.alive; i += 1) {
      ProjectileMotion.step(projectile, stepDt);
      if (!projectile.alive) break;

      if (projectile.faction === 'player') {
        if (runtime.hitNanoRescueWithMagic(projectile)) break;
        if (runtime.hitSwitchWithMagic(projectile)) break;
        runtime.hitPlatformWithMagic(projectile);
      }

      if (
        projectile.x < -60 ||
        projectile.x > runtime.stage.width + 60 ||
        projectile.y < -80 ||
        projectile.y > 360
      ) {
        projectile.alive = false;
        break;
      }

      const terrainHit = projectileSolids.some(solid => {
        if (perf) terrainChecks += 1;
        return solid.active !== false && intersects(projectile.getBounds(), solid);
      });
      if (terrainHit) {
        if (perf) terrainHits += 1;
        if (projectile.faction === 'player') {
          if (runtime.hitNanoRescueWithMagic(projectile)) break;
          if (runtime.hitSwitchWithMagic(projectile)) break;
          runtime.hitPlatformWithMagic(projectile);
        }
        if (projectile.collision?.disappearOnTerrain !== false) projectile.alive = false;
      }
    }
  }

  if (perf) {
    perf.addFrameCounters({
      projectilesBefore: runtime.projectiles.length,
      projectileSubstepsTotal,
      projectileTerrainChecks: terrainChecks,
      projectileTerrainHits: terrainHits,
      playerProjectileSteps,
    });
    perf.setFrameMaxCounter('projectileSubstepsMax', projectileSubstepsMax);
  }
}
