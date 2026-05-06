/**
 * 責務: スイッチ制御対象のうち、衝突ワールドへ追加する扉・家具形状だけを収集する。
 * 更新ルール: 状態変更は行わず、SwitchTargetSystemが確定したopen/active値を読むだけに限定する。
 */
export function buildSwitchTargetCollisionShapes(runtime) {
  const shapes = [];
  for (const door of runtime.stage.doors || []) {
    if (door.open) continue;
    shapes.push({ ...door, active: true, ownerPlatform: door });
  }
  for (const target of runtime.stage.switchTargets || []) {
    if (target.active === false || target.solid === false) continue;
    shapes.push({ ...target, active: true, ownerPlatform: target });
  }
  return shapes;
}
