/**
 * 責務: ステージ定義・ルート定義・画像キー参照の整合性テストを担当する。
 * 更新ルール: 実行時ロジックは持たず、宣言データ同士の参照不備だけを検出する。
 * 更新ルール: ゴール画像キーはgoalDefsを正本として検証対象へ含める。
 */
import { createTest } from '../TestRunner.js';
import { ASSET_MANIFEST } from '../../data/assetManifest.js';
import { ITEM_IMAGES } from '../../data/itemDefs.js';
import { PLATFORM_KINDS } from '../../data/platformDefs.js';
import { NANO_RESCUE_EVENT_CONFIGS } from '../../config/nanoRescueConfig.js';
import { STAGES, STAGE_ROUTES } from '../../data/stages.js';
import { STAGE_ARRAY_FIELDS, STAGE_SCHEMA_KEYS } from '../../data/stageSchema.js';
import { GOAL_DEFS, resolveGoalDef } from '../../data/goalDefs.js';
import { WORLDS } from '../../data/worlds.js';

const assetKeys = new Set(Object.keys(ASSET_MANIFEST.images || {}));
const itemKinds = new Set(Object.keys(ITEM_IMAGES));
const platformKinds = new Set(Object.values(PLATFORM_KINDS));

function collectImageKeysFromDialogue(dialogues = []) {
  return (dialogues || []).map(line => line?.portrait).filter(Boolean);
}


function collectStageImageKeys(stage) {
  const keys = [];
  if (stage.backgroundKey) keys.push(stage.backgroundKey);
  if (stage.boss?.imageKey) keys.push(stage.boss.imageKey);
  if (stage.goal?.variant) {
    const goalImageKey = resolveGoalDef(stage.goal.variant).imageKey;
    if (goalImageKey) keys.push(goalImageKey);
  }
  for (const door of stage.doors || []) if (door.imageKey) keys.push(door.imageKey);
  for (const target of stage.switchTargets || []) if (target.imageKey) keys.push(target.imageKey);
  for (const item of stage.items || []) {
    if (item.imageKey) keys.push(item.imageKey);
    if (item.kind && ITEM_IMAGES[item.kind]) keys.push(ITEM_IMAGES[item.kind]);
  }
  for (const eventObject of stage.specialEvents || []) {
    if (eventObject.imageKey) keys.push(eventObject.imageKey);
    if (eventObject.kind === 'nanoRescue') keys.push('event_nano_candy_dome_trapped');
    const nanoConfig = eventObject.kind === 'nanoRescue' ? NANO_RESCUE_EVENT_CONFIGS[eventObject.configId] : null;
    if (nanoConfig) {
      if (nanoConfig.trappedImageKey) keys.push(nanoConfig.trappedImageKey);
      if (nanoConfig.brokenImageKey) keys.push(nanoConfig.brokenImageKey);
      keys.push(...collectImageKeysFromDialogue(nanoConfig.revealDialogue));
      keys.push(...collectImageKeysFromDialogue(nanoConfig.preMountDialogue));
      keys.push(...collectImageKeysFromDialogue(nanoConfig.postMountDialogue));
    }
  }
  keys.push(...collectImageKeysFromDialogue(stage.introDialogue));
  keys.push(...collectImageKeysFromDialogue(stage.areaClearDialogue));
  keys.push(...collectImageKeysFromDialogue(stage.bossDialogue));
  keys.push(...collectImageKeysFromDialogue(stage.bossDefeatDialogue));
  keys.push(...collectImageKeysFromDialogue(stage.clearDialogue));
  return keys;
}

export const dataValidationTests = [
  createTest('stageData', '全ルートのstageIdsは実在するステージを参照する', ({ assert }) => {
    const missing = STAGE_ROUTES.flatMap(route => route.stageIds.filter(stageId => !STAGES[stageId]).map(stageId => `${route.id}:${stageId}`));
    assert(missing.length === 0, `存在しないステージ参照: ${missing.join(', ')}`);
  }),

  createTest('stageData', 'ワールドの開始ステージは実在する', ({ assert }) => {
    const missing = WORLDS.filter(world => !STAGES[world.startStageId]).map(world => `${world.id}:${world.startStageId}`);
    assert(missing.length === 0, `存在しない開始ステージ: ${missing.join(', ')}`);
  }),

  createTest('stageData', 'switch_test_labは検証専用として通常ルートに含めない', ({ equal, assert }) => {
    equal(STAGES.switch_test_lab?.testStage, true);
    const includedRoutes = STAGE_ROUTES.filter(route => route.stageIds.includes('switch_test_lab')).map(route => route.id);
    assert(includedRoutes.length === 0, `通常ルートに含まれている: ${includedRoutes.join(', ')}`);
  }),

  createTest('stageData', '全ステージはエディタ向け共通スキーマに正規化されている', ({ assert }) => {
    const expectedKeys = STAGE_SCHEMA_KEYS.join(',');
    const mismatchedKeys = Object.values(STAGES)
      .filter(stage => Object.keys(stage).join(',') !== expectedKeys)
      .map(stage => stage.id);
    assert(mismatchedKeys.length === 0, `トップレベルキー不一致: ${mismatchedKeys.join(', ')}`);

    const nonArrayFields = Object.values(STAGES).flatMap(stage => STAGE_ARRAY_FIELDS
      .filter(field => !Array.isArray(stage[field]))
      .map(field => `${stage.id}:${field}`));
    assert(nonArrayFields.length === 0, `配列ではないフィールド: ${nonArrayFields.join(', ')}`);
  }),

  createTest('stageData', 'ステージrouteはroute.js由来の進行情報と一致する', ({ assert }) => {
    const mismatched = STAGE_ROUTES.flatMap(route => route.stages.flatMap((stage, index) => {
      const expectedNextStageId = route.stageIds[index + 1] || null;
      const failures = [];
      if (stage.route?.id !== route.id) failures.push('id');
      if (stage.route?.startStageId !== route.startStageId) failures.push('startStageId');
      if (stage.route?.index !== index) failures.push('index');
      if (stage.route?.nextStageId !== expectedNextStageId) failures.push('nextStageId');
      if (stage.route?.saveStageId !== route.id) failures.push('saveStageId');
      if ((stage.route?.stageIds || []).join(',') !== route.stageIds.join(',')) failures.push('stageIds');
      return failures.map(field => `${stage.id}:${field}`);
    }));
    assert(mismatched.length === 0, `route不一致: ${mismatched.join(', ')}`);
  }),

  createTest('stageData', 'ゴール種類の画像キーはアセット定義に存在する', ({ assert }) => {
    const missing = Object.values(GOAL_DEFS)
      .map(def => def.imageKey)
      .filter(Boolean)
      .filter(key => !assetKeys.has(key));
    assert(missing.length === 0, `未定義ゴール画像キー: ${missing.join(', ')}`);
  }),

  createTest('stageData', 'ステージのアイテムkindは定義済み', ({ assert }) => {
    const unknown = Object.values(STAGES).flatMap(stage => (stage.items || [])
      .filter(item => item.kind && !itemKinds.has(item.kind))
      .map(item => `${stage.id}:${item.kind}`));
    assert(unknown.length === 0, `未定義アイテムkind: ${unknown.join(', ')}`);
  }),

  createTest('stageData', 'ステージの足場kindは定義済み', ({ assert }) => {
    const unknown = Object.values(STAGES).flatMap(stage => (stage.platforms || [])
      .filter(platform => !platform.kind || !platformKinds.has(platform.kind))
      .map(platform => `${stage.id}:${platform.kind || 'kind未指定'}`));
    assert(unknown.length === 0, `未定義足場kind: ${unknown.join(', ')}`);

    const inactiveTypeMissing = Object.values(STAGES).flatMap(stage => (stage.platforms || [])
      .filter(platform => typeof platform.active !== 'boolean')
      .map(platform => `${stage.id}:${platform.x},${platform.y}`));
    assert(inactiveTypeMissing.length === 0, `activeがbooleanではない足場: ${inactiveTypeMissing.join(', ')}`);
  }),


  createTest('stageData', 'nanoRescue特殊イベントは実在する設定IDを参照する', ({ assert }) => {
    const missing = Object.values(STAGES).flatMap(stage => (stage.specialEvents || [])
      .filter(eventObject => eventObject.kind === 'nanoRescue' && !NANO_RESCUE_EVENT_CONFIGS[eventObject.configId])
      .map(eventObject => `${stage.id}:${eventObject.id || 'id未指定'}:${eventObject.configId || 'configId未指定'}`));
    assert(missing.length === 0, `nanoRescue設定ID不一致: ${missing.join(', ')}`);
  }),

  createTest('stageData', 'ステージから参照する画像キーはmanifestに存在する', ({ assert }) => {
    const missing = Object.values(STAGES).flatMap(stage => collectStageImageKeys(stage)
      .filter(key => !assetKeys.has(key))
      .map(key => `${stage.id}:${key}`));
    assert(missing.length === 0, `manifestにない画像キー: ${missing.join(', ')}`);
  }),

  createTest('worldData', 'ワールドNPC画像キーはmanifestに存在する', ({ assert }) => {
    const missing = WORLDS.filter(world => world.npc && !assetKeys.has(world.npc)).map(world => `${world.id}:${world.npc}`);
    assert(missing.length === 0, `manifestにないNPC画像キー: ${missing.join(', ')}`);
  }),
];
