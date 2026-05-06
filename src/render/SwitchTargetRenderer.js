/**
 * 責務: スイッチで出現/消失する椅子・テーブルなどの対象オブジェクトを描画する。
 * 更新ルール: solid判定やON/OFF反映はstage側へ置き、ここではactive値に応じた見た目だけを扱う。
 * 更新ルール: 生成済みPNGアセットを優先して描画し、読み込み失敗時だけ簡易図形へフォールバックする。
 */
import { drawSprite, roundedRect } from './drawSprite.js';

const CHAIR_KEYS = {
  pink: 'switch_target_chair_pink',
  green: 'switch_target_chair_green',
  purple: 'switch_target_chair_purple',
  heart: 'switch_target_chair_heart',
  wing: 'switch_target_chair_wing',
};

const TABLE_KEYS = {
  pink: 'switch_target_table_round_pink',
  green: 'switch_target_table_round_green',
  purple: 'switch_target_table_purple',
  long: 'switch_target_table_long',
  sidePink: 'switch_target_table_side_pink',
  sideGreen: 'switch_target_table_side_green',
  candle: 'switch_target_table_candle',
};

function getImageKey(target) {
  if (target.imageKey) return target.imageKey;
  if (target.kind === 'teaChair') return CHAIR_KEYS[target.variant] || CHAIR_KEYS.pink;
  if (target.kind === 'teaTable') return TABLE_KEYS[target.variant] || TABLE_KEYS.pink;
  return null;
}

function drawAsset(ctx, img, target, alpha = 1) {
  if (!img) return false;
  const visualH = target.visualH || (target.kind === 'teaChair' ? target.h * 2.25 : target.h * 2.05);
  const visualW = target.visualW || visualH * (img.width / img.height);
  const x = target.x + target.w / 2 - visualW / 2 + (target.visualOffsetX || 0);
  const y = target.y + target.h - visualH + (target.visualOffsetY || 3);
  drawSprite(ctx, img, x, y, visualW, visualH, false, alpha);
  return true;
}

function drawFallback(ctx, target) {
  ctx.save();
  ctx.fillStyle = target.variant === 'green' ? '#cde9a3' : target.variant === 'purple' ? '#d8c6ff' : '#ffc6d9';
  ctx.strokeStyle = '#a87838';
  ctx.lineWidth = 2;
  roundedRect(ctx, target.x, target.y, target.w, target.h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawGhostAnchor(ctx, target) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.78)';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 2;
  roundedRect(ctx, target.x, target.y, target.w, target.h, 10);
  ctx.stroke();
  ctx.restore();
}

export class SwitchTargetRenderer {
  constructor(app) {
    this.app = app;
  }

  render(scene, ctx) {
    for (const target of scene.stage.switchTargets || []) {
      const img = this.app.assets.getImage(getImageKey(target));
      ctx.save();
      if (target.active === false) {
        drawAsset(ctx, img, target, 0.24);
        drawGhostAnchor(ctx, target);
      } else if (!drawAsset(ctx, img, target, 1)) {
        drawFallback(ctx, target);
      }
      ctx.restore();
    }
  }
}
