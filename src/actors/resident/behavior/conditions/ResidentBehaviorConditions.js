/**
 * 責務: 住民行動コマンドの実行条件を判定する。
 * 更新ルール: 住民種別名に依存せず、blackboard・projectile・パラメータだけを参照する。
 */
export function canRunCommand(resident, commandDef, ctx, io = {}) {
  const when = commandDef.when;
  if (!when) return true;
  if (when === 'always') return true;
  if (when === 'lastCommandHandled') return !!io.lastCommandHandled;
  if (when === 'hasTargetAndCooldownReady') return hasTargetAndCooldownReady(resident, commandDef);
  if (when === 'hasTargetVisibleAndCooldownReady') return hasTargetVisibleAndCooldownReady(resident, commandDef, ctx);
  if (when === 'timerDone') return timerDone(resident, commandDef.timer || commandDef.key);
  if (when === 'projectileFromFront') return projectileFromFront(resident, io.projectile, resident.behaviorParams?.reflect || {});
  return false;
}

export function hasTargetAndCooldownReady(resident, commandDef = {}) {
  if (!resident.blackboard.target) return false;
  const key = commandDef.cooldownKey || commandDef.key || 'attack';
  return (resident.blackboard.cooldowns[key] || 0) <= 0;
}

export function hasTargetVisibleAndCooldownReady(resident, commandDef = {}, ctx = {}) {
  if (!hasTargetAndCooldownReady(resident, commandDef)) return false;
  return ctx.isFullyOnScreen ? ctx.isFullyOnScreen(resident, commandDef.margin ?? 0) : true;
}

export function timerDone(resident, key) {
  return (resident.blackboard.timers[key] || 0) <= 0;
}

export function projectileFromFront(resident, projectile, params = {}) {
  if (!projectile?.alive) return false;
  if (params.projectileFaction && projectile.faction !== params.projectileFaction) return false;
  if (projectile.ignoreResidentId === resident.id && projectile.ignoreResidentTimer > 0) return false;

  const residentCx = resident.x + resident.w / 2;
  const residentCy = resident.y + resident.h / 2;
  const projectileCx = projectile.x + projectile.w / 2;
  const projectileCy = projectile.y + projectile.h / 2;
  const dx = projectileCx - residentCx;
  const dy = projectileCy - residentCy;

  const side = Math.sign(dx) || resident.facing;
  const frontSide = side === resident.facing;
  const mostlyHorizontal = Math.abs(dx) > Math.abs(dy) * (params.horizontalBias ?? 0.75);
  const movingTowardFront = Math.sign(projectile.vx || 0) === -resident.facing;
  return frontSide && mostlyHorizontal && movingTowardFront;
}
