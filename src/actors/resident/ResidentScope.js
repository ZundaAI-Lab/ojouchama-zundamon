/**
 * 責務: 住民Actorの利用スコープを判定する小さなヘルパーを提供する。
 * 更新ルール: 住民データは通常ステージも風船ライドも stage.residents に集約し、rideId の有無だけで実行対象を分ける。
 * 更新ルール: 浄化直後の通常住民は、魔法命中リアクション表示が残っている間だけ配列に残す。
 */
export function isRideResident(resident) {
  return !!resident?.rideId;
}

export function isNormalResident(resident) {
  return !isRideResident(resident);
}

export function isResidentForRide(resident, rideId) {
  return !!rideId && resident?.rideId === rideId;
}

export function keepResidentAfterFrame(resident) {
  if (!resident) return false;
  if (isRideResident(resident)) return true;
  if (resident.alive !== false) return true;
  return (resident.magicHitFlashTimer || 0) > 0 || (resident.magicHitKnockbackTimer || 0) > 0;
}
