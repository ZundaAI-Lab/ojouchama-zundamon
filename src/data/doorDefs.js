/**
 * 責務: 扉の開放条件とエディタ用選択肢の正本を担当する。
 * 更新ルール: 開放条件の追加はここへ定義し、Stage/Editor/Systemへ文字列を重複させない。
 */
export const DOOR_OPEN_CONDITIONS = Object.freeze({
  SWITCH: 'switch',
  BOW: 'bow',
});

export const DOOR_OPEN_CONDITION_OPTIONS = Object.freeze([
  { value: DOOR_OPEN_CONDITIONS.SWITCH, label: 'スイッチ' },
  { value: DOOR_OPEN_CONDITIONS.BOW, label: 'おじぎ' },
]);

export function resolveDoorOpenCondition(value) {
  return Object.values(DOOR_OPEN_CONDITIONS).includes(value) ? value : DOOR_OPEN_CONDITIONS.SWITCH;
}

export function isBowDoor(door) {
  return resolveDoorOpenCondition(door?.openCondition) === DOOR_OPEN_CONDITIONS.BOW;
}
