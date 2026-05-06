/**
 * 責務: 住民行動コマンドが参照できるステージ情報だけを薄くまとめる。
 * 更新ルール: Runtime全体を住民行動へ渡さず、移動・対象参照・弾生成・演出の最小APIに限定する。
 */
export function createResidentBehaviorContext(runtime, collisionWorld) {
  return {
    runtime,
    elapsed: runtime.elapsed,
    physics: runtime.physics,
    collisionWorld,
    player: runtime.player,
    nano: runtime.nano,
    addProjectile: projectile => runtime.projectiles.push(projectile),
    spawnSparkles: (x, y, color, count) => runtime.spawnSparkles(x, y, color, count),
    playSfx: name => runtime.app?.audio?.playSfx?.(name),
  };
}
