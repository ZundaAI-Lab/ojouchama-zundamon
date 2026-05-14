/**
 * 責務: 豆の魔法のクールダウン、弾生成、魔法アニメ時間を担当する。
 * 更新ルール: 弾の命中処理や描画はstage/render側に置く。
 */
import { Projectile } from '../Projectile.js';

export class PlayerMagic {
  constructor(player) {
    this.player = player;
    this.cooldown = 0;
    this.castFlash = 0;
  }

  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.castFlash = Math.max(0, this.castFlash - dt);
  }

  get readyRate() {
    const max = Math.max(0.16, 0.32 - this.player.upgrades.magic * 0.04);
    return this.cooldown <= 0 ? 1 : 1 - this.cooldown / max;
  }

  tryCast(stageScene, direction = null) {
    if (this.cooldown > 0) return false;
    const magicLevel = this.player.upgrades.magic || 0;
    const boosted = this.player.tea.boostTimer > 0;
    this.cooldown = boosted ? 0.16 : Math.max(0.18, 0.32 - magicLevel * 0.04);
    this.castFlash = 0.18;
    const damage = 1 + magicLevel + (boosted ? 1 : 0);
    const speed = 220 + magicLevel * 32 + (boosted ? 20 : 0);
    const life = 0.92 + magicLevel * 0.2 + (boosted ? 0.18 : 0);
    const dir = this.resolveDirection(direction);
    const projectileW = boosted ? 23 : 18;
    const projectileH = boosted ? 18 : 15;
    const projectile = new Projectile({
      x: this.player.x + this.player.w / 2 + dir.x * 10 - projectileW / 2,
      y: this.player.y + projectileH / 2 + dir.y * 10 - projectileH / 2,
      vx: dir.x * speed,
      vy: dir.y * speed,
      boosted,
      faction: 'player',
      damage,
      color: boosted ? '#fff06f' : '#a8ff75',
      life,
      w: projectileW,
      h: projectileH,
    });
    stageScene.projectiles.push(projectile);
    stageScene.spawnSparkles(this.player.x + this.player.w / 2, this.player.y + 16, boosted ? '#fff1a3' : '#baff83', 8);
    stageScene.app.audio.playSfx(boosted ? 'magic_cast_boosted' : 'magic_cast');
    return true;
  }

  resolveDirection(direction) {
    if (!direction || Math.hypot(direction.x, direction.y) <= 0.15) {
      return { x: this.player.facing >= 0 ? 1 : -1, y: 0 };
    }
    const len = Math.hypot(direction.x, direction.y) || 1;
    return { x: direction.x / len, y: direction.y / len };
  }
}
