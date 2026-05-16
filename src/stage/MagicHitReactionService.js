/**
 * 責務: 豆の魔法がダメージ対象へ命中した時の短い停止時間、対象フラッシュ、対象ノックバック演出をまとめる。
 * 更新ルール: 命中判定やダメージ量は扱わず、命中確定後の短い停止時間と、対象Actorが実座標へ反映するリアクション速度だけを渡す。
 */

const DEFAULT_REACTION = Object.freeze({
  hitStop: 0.04,
  flash: 0.1,
  knockbackDuration: 0.16,
  residentKnockbackSpeedX: 120,
  residentKnockbackSpeedY: -28,
  flyingResidentKnockbackSpeedX: 138,
  flyingResidentKnockbackSpeedY: -42,
  bossKnockbackSpeedX: 92,
  bossKnockbackSpeedY: -18,
});

export class MagicHitReactionService {
  static applyToResident(runtime, resident, projectile, options = {}) {
    if (!resident) return;
    const reaction = { ...DEFAULT_REACTION, ...(options || {}) };
    this.triggerHitStop(runtime, reaction.hitStop);
    const dirX = this.getDirectionFromProjectile(projectile, resident);
    const knockbackSpeedX = resident.flying ? reaction.flyingResidentKnockbackSpeedX : reaction.residentKnockbackSpeedX;
    const knockbackSpeedY = resident.flying ? reaction.flyingResidentKnockbackSpeedY : reaction.residentKnockbackSpeedY;
    resident.applyMagicHitReaction?.({
      dirX,
      flash: reaction.flash,
      knockbackDuration: reaction.knockbackDuration,
      knockbackVX: dirX * knockbackSpeedX,
      knockbackVY: knockbackSpeedY,
    });
  }

  static applyToBoss(runtime, boss, projectile, options = {}) {
    if (!boss) return;
    const reaction = { ...DEFAULT_REACTION, ...(options || {}) };
    this.triggerHitStop(runtime, reaction.hitStop);
    const dirX = this.getDirectionFromProjectile(projectile, boss);
    boss.applyMagicHitReaction?.({
      dirX,
      flash: reaction.flash,
      knockbackDuration: reaction.knockbackDuration,
      knockbackVX: dirX * reaction.bossKnockbackSpeedX,
      knockbackVY: reaction.bossKnockbackSpeedY,
    });
  }

  static triggerHitStop(runtime, duration = DEFAULT_REACTION.hitStop) {
    if (!runtime || !Number.isFinite(duration) || duration <= 0) return;
    runtime.magicHitStopTimer = Math.max(runtime.magicHitStopTimer || 0, duration);
  }

  static getDirectionFromProjectile(projectile, target) {
    const targetCenterX = (target?.x || 0) + (target?.w || 0) / 2;
    const projectileCenterX = (projectile?.x || 0) + (projectile?.w || 0) / 2;
    if (Math.abs(projectileCenterX - targetCenterX) > 0.01) return projectileCenterX < targetCenterX ? 1 : -1;
    if (Number.isFinite(projectile?.vx) && Math.abs(projectile.vx) > 0.01) return projectile.vx >= 0 ? 1 : -1;
    return 1;
  }
}
