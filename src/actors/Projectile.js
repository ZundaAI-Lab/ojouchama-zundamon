/**
 * 責務: 豆の魔法弾・住民弾・中立ギミック弾の位置、寿命、勢力、効果情報を持つActorを担当する。
 * 更新ルール: 命中判定や描画はstage/render側に置き、ここでは弾個体の状態と単純移動だけを扱う。
 */
import { Actor } from './Actor.js';

export class Projectile extends Actor {
  constructor({
    x,
    y,
    vx,
    vy = 0,
    boosted = false,
    faction = 'player',
    damage = 1,
    color = '#90df79',
    life = 1,
    source = null,
    w = null,
    h = null,
    kind = null,
    motion = null,
    contactEffect = null,
    collision = null,
    render = null,
  }) {
    const defaultW = boosted ? 13 : 10;
    const defaultH = boosted ? 10 : 7;
    super({ x, y, w: w ?? defaultW, h: h ?? defaultH });
    this.vx = vx;
    this.vy = vy;
    this.boosted = boosted;
    this.faction = faction;
    this.damage = damage;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.source = source;
    this.kind = kind || (faction === 'player' ? 'playerMagic' : 'residentOrb');
    this.motion = motion || { type: 'linear' };
    this.contactEffect = contactEffect;
    this.collision = collision || { disappearOnTerrain: true };
    this.render = render || null;
    this.age = 0;
    this.reflected = false;
    this.ignoreResidentId = null;
    this.ignoreResidentTimer = 0;
    this.ignoreBossTimer = 0;
  }

  update(dt) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    this.age += dt;
    this.ignoreResidentTimer = Math.max(0, this.ignoreResidentTimer - dt);
    this.ignoreBossTimer = Math.max(0, this.ignoreBossTimer - dt);
    if (this.life <= 0) this.alive = false;
  }
}
