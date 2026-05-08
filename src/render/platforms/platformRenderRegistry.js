/**
 * 責務: 足場kindと描画関数の対応を管理し、PlatformRenderer本体から種別分岐を分離する。
 * 更新ルール: 新しい足場kindやstyleを追加する場合は、対応する専用描画モジュールへ実装してここで接続する。
 */
import { clamp } from '../../utils/math.js';
import {
  drawClassicPlatform,
  drawCloudBlock,
  drawEdamameSeed,
  drawJamBlock,
  drawJellyPlatform,
  drawLeaf,
  drawPage,
  drawSpoonPlatform,
  drawTeacupPlatform,
  drawVinePlatform,
  drawWithPlatformTilt,
  getSpoonRenderTilt,
} from './basicPlatformDrawers.js';
import { drawConnectedVinePlatform } from './vinePlatformRenderer.js';
import { drawBalloonGoalCloud, drawRibbonBridge, drawWaitFlower } from './imagePlatformRenderer.js';
import { drawDreamStyleWind, drawRibbonStyleWind } from './windPlatformRenderer.js';

const VINE_PLATFORM_KIND = 'vinePlatform';

export function renderPlatform(app, scene, ctx, p) {
  const canGhost = p.kind === 'vine' || p.kind === 'wishLeaf' || p.kind === 'page' || p.kind === 'ribbonBridge';
  if (p.active === false && !canGhost) return;
  const crumbleAlpha = Number.isFinite(p.crumbleTimer) ? clamp(p.crumbleTimer, 0.35, 1) : 1;
  const activeAlpha = p.kind === 'crumble' ? crumbleAlpha : 1;
  const ghostAlpha = p.kind === 'vine' || p.kind === 'ribbonBridge' ? 0.36 : 0.22;
  ctx.save();
  ctx.globalAlpha = p.active === false ? ghostAlpha : activeAlpha;

  if (p.kind === 'jelly') {
    drawJellyPlatform(ctx, p);
  } else if (p.kind === 'cloud') {
    drawCloudBlock(ctx, p, false);
  } else if (p.kind === 'sleepCloud') {
    drawCloudBlock(ctx, p, true);
  } else if (p.kind === 'vine' || p.kind === 'wishLeaf') {
    if (p.kind === 'wishLeaf') {
      if (p.active !== false && Number.isFinite(p.wishLeafTimer) && p.wishLeafTimer <= 1.0) {
        ctx.globalAlpha *= Math.sin(scene.elapsed * 30) > 0 ? 0.42 : 1;
      }
      drawLeaf(ctx, p);
    } else if (p.active === false) {
      drawEdamameSeed(ctx, p, scene.elapsed);
    } else {
      const growDuration = p.growDuration || 0.56;
      const growProgress = p.growTimer > 0 ? 1 - p.growTimer / growDuration : 1;
      drawVinePlatform(ctx, p, growProgress, scene.elapsed);
    }
  } else if (p.kind === VINE_PLATFORM_KIND) {
    drawConnectedVinePlatform(ctx, p, scene.stage.platforms, scene.elapsed, p.vineStyle || 'current');
  } else if (p.kind === 'jam' || p.kind === 'jamHard') {
    drawJamBlock(ctx, p, p.kind === 'jamHard');
  } else if (p.kind === 'page') {
    drawPage(ctx, p);
  } else if (p.kind === 'spoon') {
    drawWithPlatformTilt(ctx, p, getSpoonRenderTilt(p), () => drawSpoonPlatform(ctx, p));
  } else if (p.kind === 'teacupSpin') {
    drawWithPlatformTilt(ctx, p, p.visualTilt ?? 0, () => drawTeacupPlatform(ctx, p));
  } else if (p.kind === 'ribbonBridge') {
    drawRibbonBridge(ctx, p, app.assets.getImage('platform_ribbon_bridge'));
  } else if (p.kind === 'waitFlower') {
    drawWaitFlower(ctx, p, app.assets.getImage('platform_wait_flower'));
  } else if (p.kind === 'wind') {
    if (p.windStyle === 'ribbon') drawRibbonStyleWind(ctx, p);
    else drawDreamStyleWind(ctx, p);
  } else if (p.kind === 'balloonGoalCloud') {
    const glow = scene.balloonRideSystem?.isActive?.() || scene.balloonRideSystem?.isClearing?.();
    drawBalloonGoalCloud(ctx, p, app.assets.getImage('balloon_goal_cloud_pad'), glow, scene.elapsed);
  } else {
    drawClassicPlatform(ctx, p, p.kind === 'crumble', p.kind === 'normal' ? p.platformStyle : 'normal');
  }
  ctx.restore();
}
