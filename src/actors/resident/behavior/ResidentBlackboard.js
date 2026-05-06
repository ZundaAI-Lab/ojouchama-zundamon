/**
 * 責務: 住民行動コマンド間で共有する一時状態を生成する。
 * 更新ルール: 住民種別固有の名前を持ち込まず、タイマー・対象・照準・描画フラグだけを扱う。
 */
export function createResidentBlackboard(initialState = 'default') {
  return {
    state: initialState,
    stateEntered: false,
    timers: {},
    cooldowns: {},
    flags: {},
    target: null,
    lockedAim: null,
    floatBaseY: null,
  };
}

export function tickBlackboardTimers(blackboard, dt) {
  for (const key of Object.keys(blackboard.timers)) {
    blackboard.timers[key] = Math.max(0, blackboard.timers[key] - dt);
  }
  for (const key of Object.keys(blackboard.cooldowns)) {
    blackboard.cooldowns[key] = Math.max(0, blackboard.cooldowns[key] - dt);
  }
  for (const key of Object.keys(blackboard.flags)) {
    if (typeof blackboard.flags[key] !== 'number') continue;
    blackboard.flags[key] = Math.max(0, blackboard.flags[key] - dt);
    if (blackboard.flags[key] <= 0) delete blackboard.flags[key];
  }
}
