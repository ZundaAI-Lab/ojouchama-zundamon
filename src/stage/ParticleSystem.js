/**
 * 責務: ステージ内パーティクルの生成・寿命更新・破棄を担当する。
 * 更新ルール: canvas描画はParticleRendererに任せる。
 * 更新ルール: パーティクル種別は演出名だけを持たせ、ゲーム判定やステージ進行はここへ追加しない。
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawnSparkles(x, y, color, count = 8) {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 26 + Math.random() * 44;
      const life = 0.55 + Math.random() * 0.35;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 10,
        size: 1.5 + Math.random() * 2.5,
        color,
        life,
        maxLife: life,
      });
    }
  }

  spawnGust(x, y, w = 64, h = 48, color = '#d9fff7', count = 24) {
    for (let i = 0; i < count; i += 1) {
      const life = 0.3 + Math.random() * 0.24;
      this.particles.push({
        kind: 'gust',
        x: x + (Math.random() - 0.5) * w,
        y: y + (Math.random() - 0.5) * h,
        vx: -150 - Math.random() * 110,
        vy: -18 + Math.random() * 36,
        size: 8 + Math.random() * 14,
        color,
        life,
        maxLife: life,
      });
    }
  }

  update(dt) {
    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      if (particle.kind !== 'gust') particle.vy += 32 * dt;
      particle.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }
}
