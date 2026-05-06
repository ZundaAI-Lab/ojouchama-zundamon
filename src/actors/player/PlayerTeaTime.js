/**
 * 責務: ティータイムの回復、強化時間、使用コスト判定を担当する。
 * 更新ルール: HUD表示やアイテム取得処理、所持数の保存同期を持ち込まない。
 */
export class PlayerTeaTime {
  constructor(player) {
    this.player = player;
    this.cooldown = 0;
    this.activeTimer = 0;
    this.boostTimer = 0;
  }

  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.activeTimer = Math.max(0, this.activeTimer - dt);
    this.boostTimer = Math.max(0, this.boostTimer - dt);
  }

  get maxCooldown() {
    return Math.max(4.8, 7 - this.player.upgrades.tea * 0.6);
  }

  get readyRate() {
    return this.cooldown <= 0 ? 1 : 1 - this.cooldown / this.maxCooldown;
  }

  tryUse(stageScene) {
    if (this.cooldown > 0) return false;
    if (!stageScene.tryConsumeTeacupForAction?.()) {
      stageScene.hud?.showBanner?.('お茶にはティーカップが必要なの');
      stageScene.app.audio.playSfx('tea_no_cup');
      return false;
    }
    this.cooldown = this.maxCooldown;
    this.activeTimer = 1.2;
    this.boostTimer = 6.5 + this.player.upgrades.tea * 1.5;
    const recover = 1 + (this.player.upgrades.tea >= 2 ? 1 : 0);
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + recover);
    stageScene.spawnSparkles(this.player.x + this.player.w / 2, this.player.y + 10, '#ffe79a', 14);
    stageScene.app.audio.playSfx('tea_use');
    return true;
  }
}
