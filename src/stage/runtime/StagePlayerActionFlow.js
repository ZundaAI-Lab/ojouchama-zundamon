/**
 * 責務: ステージ中のプレイヤー特殊アクションが周辺オブジェクトへ与える効果を担当する。
 * 更新ルール: 入力判定はPlayer側、演出・接触効果の接続はここに置き、Runtime本体へ個別効果を戻さない。
 * 更新ルール: おじぎで開く扉はdoors[].openCondition='bow'だけを対象にし、旧ゲート経路は持たない。
 */
import { distanceRects } from '../../utils/rect.js';
import { isNormalResident } from '../../actors/resident/ResidentScope.js';
import { isBowDoor } from '../../data/doorDefs.js';


function openBowDoors(runtime) {
  let opened = 0;
  const playerBounds = runtime.player.getBounds();
  for (const door of runtime.stage.doors || []) {
    if (!isBowDoor(door) || door.disabled || door.openedByBow) continue;
    const range = Number.isFinite(door.bowRange) ? door.bowRange : 96;
    if (distanceRects(playerBounds, door) >= range) continue;
    door.openedByBow = true;
    door.open = true;
    door.active = false;
    opened += 1;
    runtime.spawnSparkles(door.x + door.w / 2, door.y + door.h / 2, '#fff6b3', 14);
  }
  return opened;
}

export function triggerStageBowAction(runtime) {
  runtime.spawnSparkles(runtime.player.x + runtime.player.w / 2, runtime.player.y + 8, '#fff6b3', 10);
  if (openBowDoors(runtime) > 0) {
    runtime.app.audio.playSfx('bow_success');
    runtime.hud.showBanner('おじぎのとびらが開いたの！');
  }
  for (const resident of runtime.residents) {
    if (!isNormalResident(resident)) continue;
    if (distanceRects(runtime.player.getBounds(), resident.getBounds()) < 82) resident.stun();
  }
  if (runtime.isBossBattleActive() && runtime.boss?.bowShieldActive && distanceRects(runtime.player.getBounds(), runtime.boss.getBounds()) < 110) {
    const playerCenterX = runtime.player.x + runtime.player.w / 2;
    if (runtime.boss.releaseBowShield({ sourceX: playerCenterX, lockDuration: 1 })) {
      runtime.camera?.shake?.(3, 0.16);
      runtime.spawnSparkles(runtime.boss.x + runtime.boss.w / 2, runtime.boss.y + 18, '#dff5ff', 18);
      runtime.spawnSparkles(runtime.boss.x + runtime.boss.w / 2, runtime.boss.y + 18, '#fff6b3', 14);
      runtime.app.audio.playSfx('boss_shield_break');
      runtime.hud.showBanner('作法の壁がほどけたの！');
    }
    return;
  }

  if (runtime.canHitBoss() && distanceRects(runtime.player.getBounds(), runtime.boss.getBounds()) < 110) {
    const wasAlive = runtime.boss.alive;
    runtime.boss.damage(1);
    runtime.spawnSparkles(runtime.boss.x + runtime.boss.w / 2, runtime.boss.y + 18, '#fff6b3', 16);
    if (wasAlive && runtime.boss.alive) runtime.app.audio.playSfx('boss_damage');
    if (wasAlive && !runtime.boss.alive) {
      runtime.handleBossDefeated();
      return;
    }
    runtime.hud.showBanner('おじぎで、心が少し静まったの！');
  }
}
