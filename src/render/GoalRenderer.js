/**
 * 責務: 夢のしずく・画像ゴール・ボスロック表示を描画する。
 * 更新ルール: ゴール到達判定やクリア遷移は StageClearService 側に置き、種類ごとの画像・寸法はgoalDefsを正本にする。
 * 更新ルール: ボスエリアの取得済み夢のしずくゴールは半透明表示にし、再取得不可状態の保存判定はStageClearServiceへ置く。
 */
import { resolveGoalDef } from '../data/goalDefs.js';
import { drawSprite } from './drawSprite.js';

export class GoalRenderer {
  constructor(app) {
    this.app = app;
  }

  render(ctx, goal, elapsed, boss) {
    if (!goal) return;
    const locked = boss && boss.alive;
    const def = resolveGoalDef(goal.variant);
    ctx.save();
    const acquiredDreamDrop = !!goal.dreamDropAcquired && !def.imageKey;
    ctx.globalAlpha = locked ? 0.45 : (acquiredDreamDrop ? 0.38 : 1);

    if (def.imageKey) {
      this.renderImageGoal(ctx, goal, def);
    } else {
      this.renderDefaultGoal(ctx, goal, def, elapsed);
    }

    if (locked) this.renderLockedLabel(ctx, goal, def);
    ctx.restore();
  }

  renderDefaultGoal(ctx, goal, def, elapsed) {
    const img = this.app.assets.getImage('icon_dream_drop');
    const draw = def.draw;
    const bob = Math.sin(elapsed * 2.8) * 3;
    const x = goal.x + goal.w / 2 - draw.w / 2 + (draw.offsetX || 0);
    const y = goal.y + goal.h / 2 - draw.h / 2 + (draw.offsetY || 0) + bob;
    drawSprite(ctx, img, x, y, draw.w, draw.h);
  }

  renderImageGoal(ctx, goal, def) {
    const img = this.app.assets.getImage(def.imageKey);
    const draw = def.draw;
    const x = goal.x + goal.w / 2 - draw.w / 2 + (draw.offsetX || 0);
    const y = goal.y + goal.h - draw.h + (draw.offsetY || 0);
    drawSprite(ctx, img, x, y, draw.w, draw.h);
  }

  renderLockedLabel(ctx, goal, def) {
    const labelY = def.imageKey ? goal.y - 8 : goal.y - 18;
    ctx.fillStyle = '#7c6571';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ボス浄化後', goal.x + goal.w / 2, labelY);
  }
}
