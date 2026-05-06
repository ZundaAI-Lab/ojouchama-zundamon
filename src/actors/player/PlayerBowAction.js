/**
 * 責務: おじぎアクションの発動時間とクールダウンを担当する。
 * 更新ルール: ゲート開閉や住民を正気に戻すの判定はstage側に委譲する。
 */
export class PlayerBowAction {
  constructor(player) {
    this.player = player;
    this.cooldown = 0;
    this.activeTimer = 0;
  }

  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.activeTimer = Math.max(0, this.activeTimer - dt);
  }

  get maxCooldown() {
    return Math.max(0.85, 1.6 - this.player.upgrades.bow * 0.28);
  }

  get readyRate() {
    return this.cooldown <= 0 ? 1 : 1 - this.cooldown / this.maxCooldown;
  }

  tryUse(stageScene) {
    if (this.cooldown > 0) return false;
    this.cooldown = this.maxCooldown;
    this.activeTimer = 0.42;
    stageScene.triggerBowAction();
    stageScene.app.audio.playSfx('bow_use');
    return true;
  }
}
