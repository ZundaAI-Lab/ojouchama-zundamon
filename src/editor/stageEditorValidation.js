/**
 * 責務: ステージエディタの保存前検証を担当する。
 * 更新ルール: 実行時に補完できる項目も、エディタ保存時は明示データとして壊れていないか検証する。
 * 更新ルール: 風船ライドは横/上昇スクロールの設定差分もここで検証し、Runtime側へ不正なconfigを渡さない。
 * 更新ルール: ゴール種類の妥当性だけを検証し、サイズ定義はgoalDefsへ委譲する。
 * 更新ルール: 足場のactiveDurationは0以上の秒数だけを許可し、0はRuntime側で無制限として扱う。
 * 更新ルール: 風足場は kind: 'wind' と windStyle の組み合わせだけを許可する。
 * 更新ルール: スイッチ参照検証はSwitchGimmickSystemの出力ID解決順（switchId -> setId/groupId/id）に合わせる。
 */
import { STAGE_VIEW } from '../config/view.js';
import { STAGE_ARRAY_FIELDS, STAGE_SCHEMA_KEYS } from '../data/stageSchema.js';
import { PLATFORM_KINDS } from '../data/platformDefs.js';
import { ITEM_DEFS } from '../data/itemDefs.js';
import { RESIDENT_DEFS } from '../data/residentDefs.js';
import { NANO_RESCUE_EVENT_CONFIGS } from '../config/nanoRescueConfig.js';
import { isKnownGoalVariant } from '../data/goalDefs.js';
import { DOOR_OPEN_CONDITIONS, resolveDoorOpenCondition } from '../data/doorDefs.js';
import { VINE_STYLE_ORDER } from '../config/vineStyleDefs.js';
import { PLATFORM_STYLE_ORDER } from '../config/platformStyleDefs.js';
import { WIND_STYLE_ORDER } from '../config/windStyleDefs.js';

const PLATFORM_KIND_SET = new Set(Object.values(PLATFORM_KINDS));
const VINE_STYLE_SET = new Set(VINE_STYLE_ORDER);
const PLATFORM_STYLE_SET = new Set(PLATFORM_STYLE_ORDER);
const WIND_STYLE_SET = new Set(WIND_STYLE_ORDER);
const ITEM_KIND_SET = new Set(Object.keys(ITEM_DEFS));
const RESIDENT_TYPE_SET = new Set(Object.keys(RESIDENT_DEFS));
const REQUIRED_RECT_FIELDS = ['x', 'y', 'w', 'h'];
const SPECIAL_EVENT_KIND_SET = new Set(['nanoRescue', 'residentReinforcement', 'gust', 'deactivateGroup']);
const SWITCH_GIMMICK_KIND_SET = new Set(['teaBell', 'glassRose', 'rainbowBubble', 'magicCandelabra', 'ribbonSwitch']);
const SWITCH_TRIGGER_SOURCES = Object.freeze(['player', 'nano', 'magic']);

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function add(messages, level, message, path = '') {
  messages.push({ level, message, path });
}

function checkPoint(messages, stage, point, path, options = { allowOutside: true }) {
  if (!point || !isFiniteNumber(point.x) || !isFiniteNumber(point.y)) {
    add(messages, 'error', '座標が不正です。', path);
    return;
  }
  if (point.x < 0 || point.x > stage.width || point.y < 0 || point.y > stage.height) {
    add(messages, options.allowOutside !== false ? 'warning' : 'error', '座標がステージ範囲外です。', path);
  }
}

function checkRect(messages, stage, rect, path) {
  for (const key of REQUIRED_RECT_FIELDS) {
    if (!isFiniteNumber(rect?.[key])) add(messages, 'error', `${key} が数値ではありません。`, `${path}.${key}`);
  }
  if (!rect) return;
  if ((rect.w || 0) <= 0 || (rect.h || 0) <= 0) add(messages, 'error', '幅/高さは1以上にしてください。', path);
  if ((rect.x || 0) < 0 || (rect.x || 0) > stage.width) add(messages, 'warning', 'X座標がステージ範囲外です。', `${path}.x`);
  if ((rect.y || 0) < 0 || (rect.y || 0) > stage.height + 80) add(messages, 'warning', 'Y座標が画面外寄りです。', `${path}.y`);
}

function checkGoal(messages, stage, goal, path) {
  checkPoint(messages, stage, goal, path);
  if (goal?.variant != null && !isKnownGoalVariant(goal.variant)) {
    add(messages, 'error', `未定義のゴール種類です: ${goal.variant}`, `${path}.variant`);
  }
}

function checkUniqueIds(messages, values, path) {
  const seen = new Set();
  for (const [index, value] of values.entries()) {
    if (!value?.id) continue;
    if (seen.has(value.id)) add(messages, 'error', `id が重複しています: ${value.id}`, `${path}[${index}].id`);
    seen.add(value.id);
  }
}

function getSwitchGimmickOutputId(gimmick = {}) {
  if (gimmick.kind === 'ribbonSwitch') return '';
  return gimmick.switchId || gimmick.setId || gimmick.groupId || gimmick.id || '';
}

function collectDefinedSwitchIds(stage) {
  return new Set(stage.switchGimmicks.map(getSwitchGimmickOutputId).filter(Boolean));
}

function collectInvitationClockDoorIds(stage) {
  const map = new Map();
  for (const item of stage.items || []) {
    if (item?.kind !== 'invitation' || !item.clockDoorId) continue;
    map.set(item.clockDoorId, (map.get(item.clockDoorId) || 0) + 1);
  }
  return map;
}

function checkReinforcementResident(messages, resident, path) {
  if (!resident || typeof resident !== 'object') {
    add(messages, 'error', '増援住民はオブジェクトにしてください。', path);
    return;
  }
  const type = resident.type || 'spoon';
  if (!RESIDENT_TYPE_SET.has(type)) add(messages, 'error', `未定義の住民typeです: ${type}`, `${path}.type`);
  if (!isFiniteNumber(resident.offsetX) && !isFiniteNumber(resident.x)) add(messages, 'error', 'offsetX または x を数値で指定してください。', `${path}.offsetX`);
  if (!isFiniteNumber(resident.offsetY) && !isFiniteNumber(resident.y)) add(messages, 'error', 'offsetY または y を数値で指定してください。', `${path}.offsetY`);
  for (const key of ['minX', 'maxX', 'minXOffset', 'maxXOffset', 'patrolHalfWidth', 'facing']) {
    if (resident[key] != null && !isFiniteNumber(resident[key])) add(messages, 'error', `${key} は数値にしてください。`, `${path}.${key}`);
  }
}

function checkResidentReinforcementEvent(messages, eventObject, path) {
  if (eventObject.once != null && typeof eventObject.once !== 'boolean') add(messages, 'error', 'once はbooleanにしてください。', `${path}.once`);
  if (eventObject.message != null && typeof eventObject.message !== 'object' && typeof eventObject.message !== 'string') {
    add(messages, 'error', 'message は文字列またはオブジェクトにしてください。', `${path}.message`);
  }
  if (eventObject.message && typeof eventObject.message === 'object' && eventObject.message.text != null && typeof eventObject.message.text !== 'string') {
    add(messages, 'error', 'message.text は文字列にしてください。', `${path}.message.text`);
  }
  if (!Array.isArray(eventObject.residents) || eventObject.residents.length === 0) {
    add(messages, 'error', '増援住民residentsを1件以上指定してください。', `${path}.residents`);
    return;
  }
  eventObject.residents.forEach((resident, index) => checkReinforcementResident(messages, resident, `${path}.residents[${index}]`));
}


function checkTriggerBy(messages, eventObject, path, allowed = ['player', 'nano']) {
  if (eventObject.triggerBy == null) return;
  if (!Array.isArray(eventObject.triggerBy)) {
    add(messages, 'error', 'triggerBy は配列にしてください。', `${path}.triggerBy`);
    return;
  }
  for (const [index, source] of eventObject.triggerBy.entries()) {
    if (!allowed.includes(source)) add(messages, 'error', `未対応のtriggerByです: ${source}`, `${path}.triggerBy[${index}]`);
  }
}

function checkGustEvent(messages, eventObject, path) {
  if (eventObject.once != null && typeof eventObject.once !== 'boolean') add(messages, 'error', 'once はbooleanにしてください。', `${path}.once`);
  checkTriggerBy(messages, eventObject, path, ['player', 'nano']);
  for (const key of ['vx', 'vy', 'cooldown', 'particleCount']) {
    if (eventObject[key] != null && !isFiniteNumber(eventObject[key])) add(messages, 'error', `${key} は数値にしてください。`, `${path}.${key}`);
  }
}

function checkDeactivateGroupEvent(messages, eventObject, path) {
  if (eventObject.once != null && typeof eventObject.once !== 'boolean') add(messages, 'error', 'once はbooleanにしてください。', `${path}.once`);
  checkTriggerBy(messages, eventObject, path, ['player']);
  if (!eventObject.targetGroupId && !eventObject.targetGroup) add(messages, 'error', '対象グループIDを指定してください。', `${path}.targetGroupId`);
}

function hasRibbonBridgeGroup(stage, group) {
  return (stage.platforms || []).some(platform => platform.kind === PLATFORM_KINDS.RIBBON_BRIDGE && (platform.group || 'default') === group);
}

function checkNonNegativeNumber(messages, object, key, path) {
  if (object[key] == null) return;
  if (!isFiniteNumber(object[key]) || object[key] < 0) add(messages, 'error', `${key} は0以上の数値にしてください。`, `${path}.${key}`);
}

function checkPositiveInteger(messages, object, key, path) {
  if (object[key] == null) return;
  if (!Number.isInteger(object[key]) || object[key] < 1) add(messages, 'error', `${key} は1以上の整数にしてください。`, `${path}.${key}`);
}

function checkSwitchGimmick(messages, stage, gimmick, path) {
  checkRect(messages, stage, gimmick, path);
  if (!SWITCH_GIMMICK_KIND_SET.has(gimmick.kind)) add(messages, 'error', `未定義のスイッチkindです: ${gimmick.kind}`, `${path}.kind`);
  checkTriggerBy(messages, gimmick, path, SWITCH_TRIGGER_SOURCES);
  if (gimmick.kind === 'ribbonSwitch') {
    const group = gimmick.targetGroup || gimmick.group || 'default';
    if (!group) add(messages, 'error', 'リボンスイッチはtargetGroupを指定してください。', `${path}.targetGroup`);
    else if (!hasRibbonBridgeGroup(stage, group)) add(messages, 'warning', `対象のリボン橋グループがありません: ${group}`, `${path}.targetGroup`);
    return;
  }
  const outputId = getSwitchGimmickOutputId(gimmick);
  if (!outputId) add(messages, 'error', 'スイッチ出力ID（switchId/setId/groupId/idのいずれか）を指定してください。', path);
  checkPositiveInteger(messages, gimmick, 'required', path);
  checkNonNegativeNumber(messages, gimmick, 'duration', path);
  checkNonNegativeNumber(messages, gimmick, 'litDuration', path);
}


function checkBalloonRide(messages, stage, ride, path) {
  if (!ride.id) add(messages, 'error', 'balloonRide.id を指定してください。', `${path}.id`);
  if (ride.start) {
    checkRect(messages, stage, ride.start, `${path}.start`);
    if (ride.start.cameraX != null && !isFiniteNumber(ride.start.cameraX)) add(messages, 'error', 'start.cameraX は数値にしてください。', `${path}.start.cameraX`);
    if (ride.start.cameraY != null && !isFiniteNumber(ride.start.cameraY)) add(messages, 'error', 'start.cameraY は数値にしてください。', `${path}.start.cameraY`);
    if (ride.start.respawn) checkPoint(messages, stage, ride.start.respawn, `${path}.start.respawn`);
  } else {
    add(messages, 'error', 'start を指定してください。', `${path}.start`);
  }
  if (ride.goal) checkRect(messages, stage, ride.goal, `${path}.goal`);
  else add(messages, 'error', 'goal を指定してください。', `${path}.goal`);

  const config = ride.config || {};
  const mode = config.scrollMode || 'horizontal';
  if (!['horizontal', 'verticalUp'].includes(mode)) add(messages, 'error', `未対応のscrollModeです: ${mode}`, `${path}.config.scrollMode`);
  for (const key of ['scrollSpeed', 'scrollSpeedX', 'scrollSpeedY', 'moveSpeedX', 'moveSpeedY', 'startDelay', 'hitGrace', 'balloonLossDownDrift', 'failScreenMarginY']) {
    if (config[key] != null && !isFiniteNumber(config[key])) add(messages, 'error', `${key} は数値にしてください。`, `${path}.config.${key}`);
  }
  if (config.bounds) {
    for (const key of ['minX', 'maxX', 'minY', 'maxY']) {
      if (!isFiniteNumber(config.bounds[key])) add(messages, 'error', `bounds.${key} は数値にしてください。`, `${path}.config.bounds.${key}`);
    }
    if (config.bounds.minX > config.bounds.maxX) add(messages, 'error', 'bounds.minX が maxX を超えています。', `${path}.config.bounds`);
    if (config.bounds.minY > config.bounds.maxY) add(messages, 'error', 'bounds.minY が maxY を超えています。', `${path}.config.bounds`);
  }
  (ride.hazards || []).forEach((hazard, index) => checkRect(messages, stage, hazard, `${path}.hazards[${index}]`));
}


function checkDoor(messages, stage, door, path) {
  checkRect(messages, stage, door, path);
  if (door.kind === 'carrotClockDoor') return;
  const condition = resolveDoorOpenCondition(door.openCondition);
  if (door.openCondition !== condition) add(messages, 'error', `未定義の扉開放条件です: ${door.openCondition || '未指定'}`, `${path}.openCondition`);
  if (condition === DOOR_OPEN_CONDITIONS.SWITCH && !door.switchId) add(messages, 'error', 'スイッチ扉はswitchIdを指定してください。', `${path}.switchId`);
  if (condition === DOOR_OPEN_CONDITIONS.BOW && door.bowRange != null && !isFiniteNumber(door.bowRange)) add(messages, 'error', 'bowRange は数値にしてください。', `${path}.bowRange`);
}

function checkCarrotClockDoor(messages, door, path, switchIds, invitationClockDoorIds = new Map()) {
  for (const key of ['initialTime', 'targetTime', 'hourHandTime', 'clockModulo', 'handAnimDuration', 'clockCenterYOffset']) {
    if (door[key] != null && !isFiniteNumber(door[key])) add(messages, 'error', `${key} は数値にしてください。`, `${path}.${key}`);
  }
  if (door.clockModulo != null && door.clockModulo < 2) add(messages, 'error', 'clockModulo は2以上にしてください。', `${path}.clockModulo`);
  if (door.openWhenMatched != null && typeof door.openWhenMatched !== 'boolean') add(messages, 'error', 'openWhenMatched はbooleanにしてください。', `${path}.openWhenMatched`);
  const hasInvitationInput = invitationClockDoorIds.has(door.id);
  if ((!Array.isArray(door.clockInputs) || door.clockInputs.length === 0) && !hasInvitationInput) {
    add(messages, 'error', 'clockInputsを1件以上指定するか、対応する招待状のclockDoorIdを設定してください。', `${path}.clockInputs`);
    return;
  }
  for (const [inputIndex, input] of (door.clockInputs || []).entries()) {
    const inputPath = `${path}.clockInputs[${inputIndex}]`;
    if (!input || typeof input !== 'object') {
      add(messages, 'error', '時計入力はオブジェクトにしてください。', inputPath);
      continue;
    }
    if (!input.switchId) add(messages, 'error', 'switchIdを指定してください。', `${inputPath}.switchId`);
    else if (!switchIds.has(input.switchId)) add(messages, 'error', `参照先switchIdがありません: ${input.switchId}`, `${inputPath}.switchId`);
    if (input.step != null && !isFiniteNumber(input.step)) add(messages, 'error', 'step は数値にしてください。', `${inputPath}.step`);
  }
}

export function validateEditorStage(stage) {
  const messages = [];
  if (!stage || typeof stage !== 'object') return [{ level: 'error', message: 'ステージデータがありません。', path: 'stage' }];

  const schemaKeys = new Set([...STAGE_SCHEMA_KEYS, 'schemaVersion']);
  const missingKeys = STAGE_SCHEMA_KEYS.filter(key => !(key in stage));
  const unknownKeys = Object.keys(stage).filter(key => !schemaKeys.has(key));
  if (missingKeys.length) add(messages, 'error', `トップレベルキー不足: ${missingKeys.join(', ')}`, 'stage');
  if (unknownKeys.length) add(messages, 'warning', `未定義トップレベルキー: ${unknownKeys.join(', ')}`, 'stage');

  if (!/^[a-z0-9_]+$/.test(stage.id || '')) add(messages, 'error', 'ステージIDは英小文字・数字・_ のみにしてください。', 'id');
  if (!stage.name) add(messages, 'warning', 'ステージ名が空です。', 'name');
  if (!isFiniteNumber(stage.width) || stage.width < 480) add(messages, 'error', 'ステージ幅は480以上の数値にしてください。', 'width');
  if (!isFiniteNumber(stage.height) || stage.height < STAGE_VIEW.STANDARD_HEIGHT) add(messages, 'error', `ステージ高さは${STAGE_VIEW.STANDARD_HEIGHT}以上の数値にしてください。`, 'height');

  for (const key of STAGE_ARRAY_FIELDS) {
    if (!Array.isArray(stage[key])) add(messages, 'error', `${key} は配列にしてください。`, key);
  }

  checkPoint(messages, stage, stage.playerStart, 'playerStart');
  checkGoal(messages, stage, stage.goal, 'goal');
  if (stage.boss) checkRect(messages, stage, stage.boss, 'boss');

  stage.platforms.forEach((platform, index) => {
    const path = `platforms[${index}]`;
    checkRect(messages, stage, platform, path);
    if (!platform.kind) add(messages, 'error', 'platform.kind が未指定です。', `${path}.kind`);
    if (platform.kind && !PLATFORM_KIND_SET.has(platform.kind)) add(messages, 'error', `未定義の足場kindです: ${platform.kind}`, `${path}.kind`);
    if ((platform.kind === PLATFORM_KINDS.SPOON || platform.kind === PLATFORM_KINDS.TEACUP_SPIN) && platform.tilt != null && !isFiniteNumber(platform.tilt)) {
      add(messages, 'error', 'platform.tilt は数値にしてください。', `${path}.tilt`);
    }
    if ([PLATFORM_KINDS.PAGE, PLATFORM_KINDS.WISH_LEAF, PLATFORM_KINDS.RIBBON_BRIDGE].includes(platform.kind) && platform.activeDuration != null) {
      if (!isFiniteNumber(platform.activeDuration) || platform.activeDuration < 0) {
        add(messages, 'error', 'platform.activeDuration は0以上の数値にしてください。', `${path}.activeDuration`);
      }
    }
    if (platform.kind === PLATFORM_KINDS.VINE_PLATFORM && platform.vineStyle && !VINE_STYLE_SET.has(platform.vineStyle)) {
      add(messages, 'error', `未定義の蔓足場スタイルです: ${platform.vineStyle}`, `${path}.vineStyle`);
    }
    if (platform.kind === PLATFORM_KINDS.NORMAL && platform.platformStyle && !PLATFORM_STYLE_SET.has(platform.platformStyle)) {
      add(messages, 'error', `未定義の通常床スタイルです: ${platform.platformStyle}`, `${path}.platformStyle`);
    }
    if (platform.kind === PLATFORM_KINDS.WIND) {
      if (!platform.windStyle) add(messages, 'error', '風足場は windStyle を指定してください。', `${path}.windStyle`);
      else if (!WIND_STYLE_SET.has(platform.windStyle)) add(messages, 'error', `未定義の風足場スタイルです: ${platform.windStyle}`, `${path}.windStyle`);
    }
    if (platform.active !== true && platform.active !== false) add(messages, 'error', 'platform.active はbooleanで明示してください。', `${path}.active`);
  });

  stage.items.forEach((item, index) => {
    const path = `items[${index}]`;
    checkPoint(messages, stage, item, path);
    if (!ITEM_KIND_SET.has(item.kind)) add(messages, 'error', `未定義のアイテムkindです: ${item.kind}`, `${path}.kind`);
    if (item.kind === 'invitation') {
      if (!item.switchId && !item.clockDoorId) add(messages, 'error', '招待状には switchId または clockDoorId を指定してください。', `${path}.switchId`);
      if (item.switchMode != null && !['latch', 'timed'].includes(item.switchMode)) {
        add(messages, 'error', `未対応のswitchModeです: ${item.switchMode}`, `${path}.switchMode`);
      }
      if (item.switchDuration != null && (!isFiniteNumber(item.switchDuration) || item.switchDuration < 0)) {
        add(messages, 'error', 'switchDuration は0以上の数値にしてください。', `${path}.switchDuration`);
      }
      if (item.clockStep != null && !isFiniteNumber(item.clockStep)) {
        add(messages, 'error', 'clockStep は数値にしてください。', `${path}.clockStep`);
      }
    }
  });

  stage.residents.forEach((resident, index) => {
    checkPoint(messages, stage, resident, `residents[${index}]`);
    if (!RESIDENT_TYPE_SET.has(resident.type) && !resident.rideId) add(messages, 'warning', `通常住民として未定義のtypeです: ${resident.type}`, `residents[${index}].type`);
    if (resident.minX != null && resident.maxX != null && resident.minX > resident.maxX) add(messages, 'error', 'minX が maxX を超えています。', `residents[${index}]`);
  });

  stage.checkpoints.forEach((checkpoint, index) => {
    if (checkpoint.y == null && checkpoint.w == null && checkpoint.h == null) {
      if (!isFiniteNumber(checkpoint.x)) add(messages, 'error', 'checkpoint.x が数値ではありません。', `checkpoints[${index}].x`);
      return;
    }
    checkRect(messages, stage, checkpoint, `checkpoints[${index}]`);
  });
  stage.doors.forEach((door, index) => checkDoor(messages, stage, door, `doors[${index}]`));
  stage.switchTargets.forEach((target, index) => checkRect(messages, stage, target, `switchTargets[${index}]`));
  stage.switchGimmicks.forEach((gimmick, index) => checkSwitchGimmick(messages, stage, gimmick, `switchGimmicks[${index}]`));
  stage.balloonRides.forEach((ride, index) => checkBalloonRide(messages, stage, ride, `balloonRides[${index}]`));
  stage.specialEvents.forEach((eventObject, index) => {
    const path = `specialEvents[${index}]`;
    checkRect(messages, stage, eventObject, path);
    if (!SPECIAL_EVENT_KIND_SET.has(eventObject.kind)) add(messages, 'error', `未定義の特殊イベントkindです: ${eventObject.kind}`, `${path}.kind`);
    if (eventObject.kind === 'nanoRescue' && !NANO_RESCUE_EVENT_CONFIGS[eventObject.configId]) add(messages, 'error', `nanoRescue設定IDが存在しません: ${eventObject.configId || '未指定'}`, `${path}.configId`);
    if (eventObject.kind === 'residentReinforcement') checkResidentReinforcementEvent(messages, eventObject, path);
    if (eventObject.kind === 'gust') checkGustEvent(messages, eventObject, path);
    if (eventObject.kind === 'deactivateGroup') checkDeactivateGroupEvent(messages, eventObject, path);
    if (eventObject.hitbox) {
      for (const key of REQUIRED_RECT_FIELDS) {
        if (!isFiniteNumber(eventObject.hitbox[key])) add(messages, 'error', `hitbox.${key} が数値ではありません。`, `${path}.hitbox.${key}`);
      }
      if ((eventObject.hitbox.w || 0) <= 0 || (eventObject.hitbox.h || 0) <= 0) add(messages, 'error', '命中判定の幅/高さは1以上にしてください。', `${path}.hitbox`);
    }
  });
  stage.decorations.forEach((decoration, index) => checkPoint(messages, stage, decoration, `decorations[${index}]`, { allowOutside: true }));

  checkUniqueIds(messages, stage.checkpoints, 'checkpoints');
  checkUniqueIds(messages, stage.doors, 'doors');
  checkUniqueIds(messages, stage.switchTargets, 'switchTargets');
  checkUniqueIds(messages, stage.switchGimmicks, 'switchGimmicks');
  checkUniqueIds(messages, stage.balloonRides, 'balloonRides');
  checkUniqueIds(messages, stage.specialEvents, 'specialEvents');

  const switchIds = collectDefinedSwitchIds(stage);
  const invitationClockDoorIds = collectInvitationClockDoorIds(stage);
  for (const [index, door] of stage.doors.entries()) {
    const path = `doors[${index}]`;
    if (door.kind === 'carrotClockDoor') checkCarrotClockDoor(messages, door, path, switchIds, invitationClockDoorIds);
    else if (resolveDoorOpenCondition(door.openCondition) === DOOR_OPEN_CONDITIONS.SWITCH && door.switchId && !switchIds.has(door.switchId)) add(messages, 'error', `参照先switchIdがありません: ${door.switchId}`, `${path}.switchId`);
  }
  for (const [index, target] of stage.switchTargets.entries()) {
    if (target.switchId && !switchIds.has(target.switchId)) add(messages, 'error', `参照先switchIdがありません: ${target.switchId}`, `switchTargets[${index}].switchId`);
  }
  for (const [index, platform] of stage.platforms.entries()) {
    if (platform.switchId && !switchIds.has(platform.switchId)) add(messages, 'error', `参照先switchIdがありません: ${platform.switchId}`, `platforms[${index}].switchId`);
  }
  for (const [index, item] of stage.items.entries()) {
    if (item.switchId && !switchIds.has(item.switchId)) add(messages, 'error', `参照先switchIdがありません: ${item.switchId}`, `items[${index}].switchId`);
    if (item.clockDoorId) {
      const door = stage.doors.find(candidate => candidate.id === item.clockDoorId);
      if (!door) add(messages, 'error', `参照先clockDoorIdがありません: ${item.clockDoorId}`, `items[${index}].clockDoorId`);
      else if (door.kind !== 'carrotClockDoor') add(messages, 'error', `clockDoorIdはにんじん時計扉を参照してください: ${item.clockDoorId}`, `items[${index}].clockDoorId`);
    }
  }

  const balloonRideIds = new Set(stage.balloonRides.map(ride => ride.id).filter(Boolean));
  for (const [index, resident] of stage.residents.entries()) {
    if (resident.rideId && !balloonRideIds.has(resident.rideId)) add(messages, 'error', `参照先balloonRide.idがありません: ${resident.rideId}`, `residents[${index}].rideId`);
  }

  const sortableAreas = [];
  for (const [index, area] of stage.areas.entries()) {
    const path = `areas[${index}]`;
    if (!isFiniteNumber(area.startX) || !isFiniteNumber(area.endX)) add(messages, 'error', 'area.startX/endX は数値にしてください。', path);
    else sortableAreas.push({ ...area, index });
    if (area.startX > area.endX) add(messages, 'error', 'area.startX が endX を超えています。', path);
    if (area.respawn) checkPoint(messages, stage, area.respawn, `${path}.respawn`);
  }
  sortableAreas.sort((a, b) => a.startX - b.startX);
  if (sortableAreas.length) {
    if (sortableAreas[0].startX > 0) add(messages, 'warning', '最初のareaがx=0から始まっていません。', `areas[${sortableAreas[0].index}]`);
    let lastEnd = sortableAreas[0].endX;
    for (let i = 1; i < sortableAreas.length; i += 1) {
      const area = sortableAreas[i];
      const path = `areas[${area.index}]`;
      if (area.startX < lastEnd) add(messages, 'warning', 'areaの範囲が前エリアと重なっています。', path);
      if (area.startX > lastEnd) add(messages, 'warning', `前エリアとの間にgapがあります: ${lastEnd}-${area.startX}`, path);
      lastEnd = Math.max(lastEnd, area.endX);
    }
    if (lastEnd < stage.width) add(messages, 'warning', `最後のareaがステージ終端まで届いていません: ${lastEnd}-${stage.width}`, 'areas');
  }

  if (stage.areaRole !== 'boss' && stage.boss) add(messages, 'warning', 'boss以外のareaRoleにボスが配置されています。', 'boss');
  if (stage.areaRole === 'boss' && !stage.boss) add(messages, 'warning', 'bossステージですがbossが未配置です。', 'boss');

  if (!messages.some(item => item.level === 'error')) {
    add(messages, 'ok', '保存前検証を通過しました。', 'stage');
  }
  return messages;
}

export function hasValidationErrors(messages) {
  return messages.some(item => item.level === 'error');
}
