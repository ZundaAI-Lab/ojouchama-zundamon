/**
 * 責務: 風船ライド専用の一時エフェクト配列と寿命更新を管理する。
 * 更新ルール: 描画はRender側へ任せ、ここではエフェクトの生成・経過時間・破棄だけを扱う。
 */
export class BalloonRideEffectStore {
  constructor() {
    this.effects = [];
  }

  list() {
    return this.effects;
  }

  reset() {
    this.effects = [];
  }

  update(dt) {
    for (const effect of this.effects) effect.age += dt;
    this.effects = this.effects.filter(effect => effect.age < effect.life);
  }

  spawnBalloonPop(color, x, y) {
    this.effects.push({ type: 'balloonPop', color, x, y, age: 0, life: 0.34 });
  }
}
