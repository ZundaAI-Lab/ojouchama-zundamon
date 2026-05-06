/**
 * 責務: プレイヤーの表示状態と対応スプライトキーの選択を担当する。
 * 更新ルール: 現行の画像キー定義に沿い、移動判定や攻撃処理を持ち込まない。
 */
export class PlayerStateMachine {
  constructor(player) {
    this.player = player;
    this.current = 'idle';
  }

  update(command) {
    if (this.player.damageFlash > 0) this.current = 'hurt';
    else if (this.player.bow.activeTimer > 0) this.current = 'bow';
    else if (this.player.tea.activeTimer > 0) this.current = 'tea';
    else if (this.player.magic.castFlash > 0) this.current = 'magic';
    else if (!this.player.onGround && this.player.vy < 0) this.current = 'jump';
    else if (!this.player.onGround) this.current = 'jump';
    else if (Math.abs(command.moveX) > 0.1) this.current = 'walk';
    else this.current = 'idle';
  }

  get imageKey() {
    return {
      idle: 'hero_idle',
      walk: 'hero_walk',
      jump: 'hero_jump',
      magic: 'hero_magic',
      bow: 'hero_bow',
      tea: 'hero_tea',
      hurt: 'hero_hurt',
      victory: 'hero_victory',
    }[this.current] || 'hero_idle';
  }
}
