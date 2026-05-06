/**
 * 責務: 住民Actorの利用スコープを判定する小さなヘルパーを提供する。
 * 更新ルール: 住民データは通常ステージも風船ライドも stage.residents に集約し、rideId の有無だけで実行対象を分ける。
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
  return resident?.alive !== false || isRideResident(resident);
}
