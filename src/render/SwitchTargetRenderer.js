/**
 * 責務: スイッチで出現/消失する椅子・テーブルなどの対象オブジェクトを描画する。
 * 更新ルール: solid判定やON/OFF反映はstage側へ置き、ここではactive値に応じた見た目だけを扱う。
 * 更新ルール: 生成済みPNGアセットを優先して描画し、読み込み失敗時だけ簡易図形へフォールバックする。
 */
import { getSwitchTargetImageKey } from '../data/switchVisualAssetKeys.js';
import { drawSprite, roundedRect } from './drawSprite.js';

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
      const img = this.app.assets.getImage(getSwitchTargetImageKey(target));
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
