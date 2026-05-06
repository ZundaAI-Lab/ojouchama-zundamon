import { isRideResident } from '../actors/resident/ResidentScope.js';
import { StageCheckpointService } from '../stage/StageCheckpointService.js';
import { PlatformGimmickSystem } from '../stage/PlatformGimmickSystem.js';
import { isCarrotClockDoor } from '../stage/CarrotClockDoorSystem.js';

/**
 * 責務: デバッグ用の当たり判定範囲だけを描画する。
 * 更新ルール: 判定ロジックは持たず、既存Actor/CollisionWorld/専用Systemが公開する矩形・範囲を可視化するだけに限定する。
 * 更新ルール: 汎用ステージイベント矩形はspecialEventsの実データを読むだけにし、発火条件はStageEventSystemへ置く。
 * 更新ルール: にんじん時計扉の時刻表示はdoorの実行時状態を読むだけにし、時計判定はCarrotClockDoorSystemへ置く。
 */
function drawRect(ctx, rect, color) {
  if (!rect) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.strokeRect(Math.round(rect.x) + 0.5, Math.round(rect.y) + 0.5, Math.round(rect.w), Math.round(rect.h));
  ctx.restore();
}


function drawDebugText(ctx, text, x, y, color = 'rgba(60, 45, 80, 0.96)') {
  ctx.save();
  ctx.font = '10px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.fillRect(x - 2, y - 10, ctx.measureText(text).width + 4, 12);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawClockDoorDebug(ctx, door) {
  if (!isCarrotClockDoor(door)) return;
  const current = Number.isFinite(door.clockTime) ? door.clockTime : door.initialTime;
  const target = Number.isFinite(door.clockTargetTime) ? door.clockTargetTime : door.targetTime;
  drawDebugText(ctx, `${door.id || 'clock'} ${current}/${target}`, door.x, Math.max(10, door.y - 12));
}

function drawActor(ctx, actor, color) {
  if (!actor) return;
  if (actor.alive !== undefined && !actor.alive) return;
  if (typeof actor.getBounds === 'function') {
    drawRect(ctx, actor.getBounds(), color);
    return;
  }
  drawRect(ctx, actor, color);
}

function drawPlayer(ctx, player) {
  if (!player) return;
  if (player.alive !== undefined && !player.alive) return;
  drawRect(ctx, player.getBounds?.() || player, 'rgba(255, 80, 110, 0.98)');
  if (typeof player.getDamageBounds === 'function') {
    drawRect(ctx, player.getDamageBounds(), 'rgba(255, 60, 210, 0.98)');
  }
}

export class DebugHitboxRenderer {
  render(scene, ctx) {
    if (!scene?.app?.debug?.get('showHitboxes')) return;

    const world = scene.collisionWorld;
    for (const solid of world?.playerSolids || []) drawRect(ctx, solid, 'rgba(80, 160, 255, 0.95)');

    drawActor(ctx, scene.goal, 'rgba(80, 255, 130, 0.95)');
    for (const door of scene.stage?.doors || []) drawClockDoorDebug(ctx, door);
    drawPlayer(ctx, scene.player);
    drawActor(ctx, scene.nano, 'rgba(140, 80, 255, 0.98)');
    drawActor(ctx, scene.boss, 'rgba(255, 70, 220, 0.98)');

    for (const resident of scene.residents || []) {
      if (isRideResident(resident)) continue;
      drawActor(ctx, resident, 'rgba(255, 120, 40, 0.98)');
    }
    for (const item of scene.items || []) drawActor(ctx, item, 'rgba(255, 230, 70, 0.9)');
    for (const checkpoint of scene.checkpoints || []) {
      drawRect(ctx, StageCheckpointService.getTouchBounds(checkpoint), 'rgba(255, 245, 120, 0.98)');
    }
    for (const eventObject of scene.stage?.specialEvents || []) {
      if (eventObject?.kind === 'residentReinforcement') drawRect(ctx, eventObject, 'rgba(255, 150, 45, 0.98)');
    }
    for (const projectile of scene.projectiles || []) drawActor(ctx, projectile, 'rgba(60, 255, 255, 0.98)');

    this.renderMagicReactiveHitboxes(scene, ctx);
    this.renderBalloonRideHitboxes(scene, ctx);
  }

  renderMagicReactiveHitboxes(scene, ctx) {
    for (const hitbox of scene.switchGimmickSystem?.getMagicHitboxes?.() || []) {
      drawRect(ctx, hitbox.rect, 'rgba(190, 255, 95, 0.98)');
    }

    for (const hitbox of PlatformGimmickSystem.getMagicHitboxes(scene)) {
      drawRect(ctx, hitbox.rect, 'rgba(160, 255, 110, 0.92)');
    }
  }

  renderBalloonRideHitboxes(scene, ctx) {
    const system = scene.balloonRideSystem;
    if (!system) return;

    for (const start of system.getStartObjects?.() || []) {
      drawRect(ctx, start, 'rgba(120, 255, 210, 0.95)');
    }
    for (const goal of system.getGoalObjects?.() || []) {
      drawRect(ctx, goal, 'rgba(90, 255, 150, 0.95)');
    }
    for (const hazard of system.getHazards?.() || []) {
      drawRect(ctx, hazard, 'rgba(255, 70, 255, 0.98)');
    }
    for (const resident of system.getResidents?.() || []) {
      drawRect(ctx, resident, 'rgba(255, 135, 35, 0.98)');
    }
    for (const shot of system.getShots?.() || []) {
      drawRect(ctx, shot, 'rgba(80, 250, 255, 0.98)');
    }

    if (system.isRideVisualActive?.()) {
      drawRect(ctx, system.getBalloonHitbox?.(), 'rgba(255, 80, 220, 0.98)');
      drawRect(ctx, system.getPlayerRideHitbox?.(), 'rgba(255, 60, 80, 0.98)');
    }
  }
}
