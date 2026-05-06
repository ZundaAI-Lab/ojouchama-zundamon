/**
 * 責務: SwitchStateSystemのON/OFF状態を、扉・出現家具・スイッチ制御足場へ反映する。
 * 更新ルール: 入力判定やギミック内部状態はSwitchGimmickSystemへ置き、このファイルは対象オブジェクトのactive/open更新だけを担当する。
 * 更新ルール: 物理ステップ中に状態が変わっても衝突ワールドは再生成せず、次ステップのCollisionWorldBuilderへ反映する。
 * 更新ルール: 特殊イベントでdisabledになった対象は、スイッチ状態より優先して不活性に固定する。
 * 更新ルール: にんじん時計扉の時刻入力・針アニメーション・一致判定はCarrotClockDoorSystemへ委譲し、ここでは返されたdesiredOpenを通常扉と同じopen/activeへ反映する。
 * 更新ルール: おじぎ扉はdoor.openedByBowだけを開放状態の正本とし、入力処理はStagePlayerActionFlowへ置く。
 */
import { NANO_STATES } from '../config/nanoConfig.js';
import { intersects } from '../utils/rect.js';
import { CarrotClockDoorSystem, isCarrotClockDoor } from './CarrotClockDoorSystem.js';
import { DOOR_OPEN_CONDITIONS, resolveDoorOpenCondition } from '../data/doorDefs.js';

function shouldBeActive(switchState, target) {
  if (target.disabled) return false;
  if (!target.switchId) return target.active !== false;
  const on = switchState.isOn(target.switchId);
  return (target.activeWhenOn !== false) ? on : !on;
}

function nanoCanBlockDoor(nano) {
  return !!nano && nano.state !== NANO_STATES.RETURN && nano.state !== NANO_STATES.HEAD;
}

function actorOverlapsDoor(runtime, door) {
  const playerOverlaps = runtime.player && intersects(runtime.player.getBounds(), door);
  const nanoOverlaps = nanoCanBlockDoor(runtime.nano) && intersects(runtime.nano.getBounds(), door);
  return playerOverlaps || nanoOverlaps;
}

export class SwitchTargetSystem {
  constructor(stage, switchState) {
    this.stage = stage;
    this.switchState = switchState;
    this.clockDoorSystem = new CarrotClockDoorSystem(stage, switchState);
    if (!Array.isArray(this.stage.doors)) this.stage.doors = [];
    if (!Array.isArray(this.stage.switchTargets)) this.stage.switchTargets = [];
  }

  apply(runtime) {
    this.applyDoors(runtime);
    this.applySwitchTargets();
    this.applyPlatforms();
  }

  applyDoors(runtime) {
    for (const door of this.stage.doors) {
      if (door.disabled) {
        door.open = true;
        door.active = false;
        door.blockedByActor = false;
        continue;
      }
      const desiredOpen = this.getDoorDesiredOpen(runtime, door);
      door.blockedByActor = false;
      if (!desiredOpen && actorOverlapsDoor(runtime, door)) {
        door.open = true;
        door.blockedByActor = true;
      } else {
        door.open = desiredOpen;
      }
      door.active = !door.open;
    }
  }

  getDoorDesiredOpen(runtime, door) {
    if (isCarrotClockDoor(door)) return this.clockDoorSystem.updateDoor(runtime, door);
    const condition = resolveDoorOpenCondition(door.openCondition);
    if (condition === DOOR_OPEN_CONDITIONS.BOW) return !!door.openedByBow;
    return this.getSwitchDoorDesiredOpen(door);
  }

  getSwitchDoorDesiredOpen(door) {
    const on = door.switchId ? this.switchState.isOn(door.switchId) : false;
    return (door.openWhenOn !== false) ? on : !on;
  }

  applySwitchTargets() {
    for (const target of this.stage.switchTargets) {
      target.active = shouldBeActive(this.switchState, target);
    }
  }

  applyPlatforms() {
    for (const platform of this.stage.platforms || []) {
      if (platform.disabled) {
        platform.active = false;
        continue;
      }
      if (!platform.switchId) continue;
      platform.active = shouldBeActive(this.switchState, platform);
    }
  }
}
