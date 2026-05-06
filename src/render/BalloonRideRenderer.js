/**
 * 責務: 風船ライド専用の開始地点、ライド中住民/障害物、接続風船、破裂エフェクトを描画する。
 * 更新ルール: ライド状態の変更や当たり判定はBalloonRideSystem配下の担当モジュールへ置き、ここでは読み取り専用で描画する。
 * 更新ルール: ライド住民の左右反転は上昇スクロール時だけresident.facingを読む。横スクロール時は従来通り素材そのまま描画する。
 */
import { drawSprite } from './drawSprite.js';

function drawSoftGlow(ctx, cx, cy, rx, ry, alpha = 0.5) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  glow.addColorStop(0, 'rgba(255,244,150,0.72)');
  glow.addColorStop(0.56, 'rgba(255,202,112,0.26)');
  glow.addColorStop(1, 'rgba(255,202,112,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTinySparkles(ctx, cx, cy, elapsed, alpha = 0.55) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = 'rgba(255,250,190,0.95)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 5; i += 1) {
    const a = elapsed * 2.4 + i * 1.73;
    const r = 22 + (i % 3) * 9 + Math.sin(elapsed * 5 + i) * 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a * 0.8) * r * 0.55;
    const s = 2.8 + Math.sin(elapsed * 7 + i) * 0.7;
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.lineTo(x + s, y);
    ctx.moveTo(x, y - s);
    ctx.lineTo(x, y + s);
    ctx.stroke();
  }
  ctx.restore();
}


const BALLOON_CLUSTER_KEYS = Object.freeze({
  1: 'balloon_ride_1',
  2: 'balloon_ride_2',
  3: 'balloon_ride_3',
  4: 'balloon_ride_4',
});

const HAZARD_KEYS = Object.freeze({
  stormCloud: 'balloon_hazard_storm_cloud',
  stormCloudCharged: 'balloon_hazard_storm_cloud_charged',
  thornCloud: 'balloon_hazard_thorn_cloud',
  thornCloudCharged: 'balloon_hazard_thorn_cloud_charged',
  windMine: 'balloon_hazard_wind_mine',
  windMineActive: 'balloon_hazard_wind_mine_active',
});

export class BalloonRideRenderer {
  constructor(app) {
    this.app = app;
  }

  renderWorld(scene, ctx) {
    const system = scene.balloonRideSystem;
    if (!system) return;
    this.renderStartObjects(ctx, system, scene.elapsed);
    this.renderGoalMarkers(ctx, system, scene.elapsed);
    this.renderHazards(ctx, system, scene.elapsed);
    this.renderResidents(ctx, system, scene.elapsed);
    this.renderEffects(ctx, system);
  }

  renderOverlay(scene, ctx) {
    const system = scene.balloonRideSystem;
    if (!system?.isRideVisualActive()) return;
    this.renderAttachedBalloons(ctx, scene, system);
    this.renderClearFloat(ctx, system);
  }

  renderStartObjects(ctx, system, elapsed) {
    for (const start of system.getStartObjects()) {
      const pulse = start.active || Math.sin(elapsed * 4.5 + start.x * 0.02) > 0.45;
      const img = this.app.assets.getImage('balloon_ride_start');
      const w = start.drawW || 42;
      const h = img ? w * (img.height / img.width) : 140;
      const x = start.x + start.w / 2 - w / 2;
      const y = start.y + start.h - h + 10;
      if (pulse) {
        const alpha = start.active ? 0.62 : 0.32 + Math.sin(elapsed * 6.2 + start.x * 0.01) * 0.08;
        drawSoftGlow(ctx, start.x + start.w / 2, start.y + start.h * 0.46, w * 0.82, h * 0.56, alpha);
        drawTinySparkles(ctx, start.x + start.w / 2, start.y + start.h * 0.42, elapsed, start.active ? 0.62 : 0.42);
      }
      drawSprite(ctx, img, x, y, w, h);
    }
  }

  renderGoalMarkers(ctx, system, elapsed) {
    for (const goal of system.getGoalObjects()) {
      if (!goal.active) continue;
      const img = this.app.assets.getImage('balloon_goal_arch');
      const w = goal.archW || 82;
      const h = img ? w * (img.height / img.width) : 92;
      const bob = Math.sin(elapsed * 3.2) * 1.2;
      const x = goal.x + goal.w / 2 - w / 2;
      const y = goal.y - h - 14 + bob;
      drawSoftGlow(ctx, goal.x + goal.w / 2, goal.y - h * 0.34 + bob, w * 0.72, h * 0.5, 0.38);
      drawTinySparkles(ctx, goal.x + goal.w / 2, goal.y - h * 0.36 + bob, elapsed, 0.44);
      drawSprite(ctx, img, x, y, w, h);
    }
  }

  renderHazards(ctx, system, elapsed) {
    for (const hazard of system.getHazards()) {
      const charged = hazard.charged || hazard.active || Math.sin(elapsed * 5.5 + hazard.x * 0.03) > 0.72;
      const key = this.getHazardImageKey(hazard.kind, charged);
      const img = this.app.assets.getImage(key);
      const scale = hazard.visualScale || (hazard.kind === 'windMine' ? 0.82 : 0.86);
      const w = (hazard.drawW || hazard.w || 44) * scale;
      const h = img ? w * (img.height / img.width) : (hazard.h || 34) * scale;
      const bob = Math.sin(elapsed * 3.8 + hazard.x * 0.02) * (hazard.bob || 2.2);
      drawSprite(ctx, img, hazard.x + (hazard.w || 44) / 2 - w / 2, hazard.y + (hazard.h || 34) / 2 - h / 2 + bob, w, h);
    }
  }

  getHazardImageKey(kind, charged) {
    if (kind === 'stormCloud') return charged ? HAZARD_KEYS.stormCloudCharged : HAZARD_KEYS.stormCloud;
    if (kind === 'thornCloud') return charged ? HAZARD_KEYS.thornCloudCharged : HAZARD_KEYS.thornCloud;
    if (kind === 'windMine') return charged ? HAZARD_KEYS.windMineActive : HAZARD_KEYS.windMine;
    return HAZARD_KEYS.stormCloud;
  }

  renderResidents(ctx, system, elapsed) {
    const verticalUp = !!system.isVerticalUpActive?.();
    for (const resident of system.getResidents()) {
      const attack = resident.type === 'balloonBird' ? !!resident.balloonBirdDive : resident.attackFlash > 0;
      const key = this.getResidentImageKey(resident, attack);
      const img = this.app.assets.getImage(key);
      const w = resident.drawW || (this.isCloudLikeResident(resident.type) ? 56 : 42);
      const h = img ? w * (img.height / img.width) : resident.h || 42;
      const flipX = this.shouldFlipResident(resident, verticalUp);
      drawSprite(ctx, img, resident.x + resident.w / 2 - w / 2, resident.y + resident.h / 2 - h / 2, w, h, flipX);
    }
  }


  shouldFlipResident(resident, verticalUp) {
    // 横スクロール時は88時点の素材向きを維持し、上昇スクロール時だけ行動側の向きを見た目へ反映する。
    if (!verticalUp) return false;
    if (resident.type === 'balloonBird' || resident.type === 'cloudImp') return resident.facing > 0;
    return false;
  }

  isCloudLikeResident(type) {
    return type === 'cloudImp' || type === 'stormCloud' || type === 'thornCloud';
  }

  getResidentImageKey(resident, attack) {
    if (attack && resident.actionImageKey) return resident.actionImageKey;
    return resident.imageKey || 'balloon_resident_bird_idle';
  }

  renderEffects(ctx, system) {
    for (const effect of system.getEffects()) {
      if (effect.type !== 'balloonPop') continue;
      const rate = Math.max(0, Math.min(0.999, effect.age / effect.life));
      const frame = rate < 0.34 ? 1 : (rate < 0.68 ? 2 : 3);
      const img = this.app.assets.getImage(`balloon_pop_${effect.color}_${frame}`);
      const w = 38 + rate * 12;
      const h = img ? w * (img.height / img.width) : w;
      drawSprite(ctx, img, effect.x - w / 2, effect.y - h / 2, w, h, false, 1 - rate * 0.18);
    }
  }

  renderAttachedBalloons(ctx, scene, system) {
    const count = system.getVisibleBalloonCount();
    if (count <= 0) return;
    const rect = system.getBalloonVisualRect?.(scene.elapsed);
    if (!rect) return;
    const img = this.app.assets.getImage(BALLOON_CLUSTER_KEYS[count]);
    drawSprite(ctx, img, rect.x, rect.y, rect.w, rect.h);
  }

  renderClearFloat(ctx, system) {
    const float = system.clearFloat;
    if (!float?.count) return;
    const img = this.app.assets.getImage(BALLOON_CLUSTER_KEYS[float.count]);
    const fallbackH = float.count === 1 ? 52 : (float.count === 2 ? 66 : (float.count === 3 ? 72 : 78));
    const h = float.h || fallbackH;
    const w = float.w || (img ? h * (img.width / img.height) : 70);
    drawSprite(ctx, img, float.x - w / 2, float.y - h / 2, w, h, false, Math.max(0, 1 - float.age * 0.45));
  }
}
