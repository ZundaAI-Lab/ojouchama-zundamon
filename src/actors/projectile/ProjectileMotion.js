/**
 * 責務: 弾種ごとの移動方式を更新する。
 * 更新ルール: 命中効果や住民AIを扱わず、位置・速度・寿命だけを変更する。
 */
export class ProjectileMotion {
  static step(projectile, dt) {
    const motion = projectile.motion || { type: 'linear' };
    projectile.prevX = projectile.x;
    projectile.prevY = projectile.y;

    const age = projectile.age || 0;
    const nextAge = age + dt;

    if (motion.type === 'rise_arc') {
      projectile.vy += (motion.ay ?? -18) * dt;
    } else if (motion.type === 'gravity_arc') {
      projectile.vy += (motion.gravity ?? 320) * dt;
    }

    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    if (motion.type === 'sine_linear') {
      projectile.y += Math.sin(age * (motion.waveFrequency ?? 8)) * (motion.waveY ?? 0);
    } else if (motion.type === 'sine_wave') {
      applySineWaveDrift(projectile, motion, age, nextAge);
    }
    projectile.life -= dt;
    projectile.age = nextAge;
    projectile.ignoreResidentTimer = Math.max(0, (projectile.ignoreResidentTimer || 0) - dt);

    if (projectile.life <= 0) projectile.alive = false;
  }
}

function applySineWaveDrift(projectile, motion, age, nextAge) {
  const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
  const normalX = -projectile.vy / speed;
  const normalY = projectile.vx / speed;
  const amplitude = motion.waveAmplitude ?? 6;
  const frequency = motion.waveFrequency ?? 6;
  const phase = motion.wavePhase ?? 0;
  const currentOffset = projectile.waveOffset ?? Math.sin(age * frequency + phase) * amplitude;
  const nextOffset = Math.sin(nextAge * frequency + phase) * amplitude;
  const deltaOffset = nextOffset - currentOffset;
  projectile.x += normalX * deltaOffset;
  projectile.y += normalY * deltaOffset;
  projectile.waveOffset = nextOffset;
}
