/**
 * 責務: ステージゴールの当たり判定用Actorを担当する。
 * 更新ルール: クリア判定・演出・遷移はStageClearService側に置き、種類ごとの寸法はgoalDefsから参照する。
 */
import { Actor } from './Actor.js';
import { resolveGoalDef } from '../data/goalDefs.js';

export class Goal extends Actor {
  constructor(goal = {}) {
    const def = resolveGoalDef(goal.variant);
    const hitbox = def.hitbox;
    super({ x: goal.x, y: goal.y, w: hitbox.w, h: hitbox.h });
    this.variant = def.variant;
    this.imageKey = def.imageKey;
  }
}
