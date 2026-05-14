/**
 * 責務: 起動・Scene・ステージ単位で事前ロードする画像アセットキーを算出する。
 * 更新ルール: 実際のロードとキャッシュはAssetSystemへ置き、このファイルでは必要キーの収集だけを担当する。
 * 更新ルール: 描画処理やDOM生成処理へ依存せず、データ定義と描画仕様で必要なキーをここに集約する。
 */
import { SCENES } from '../config/sceneIds.js';
import { NANO_RESCUE_EVENT_CONFIGS } from '../config/nanoRescueConfig.js';
import { TUTORIAL_ENTRIES } from '../config/tutorialDefs.js';
import { SHOP_ITEM_DEFS } from '../config/teacupInventory.js';
import { UPGRADE_DEFS } from '../config/upgradeDefs.js';
import { ASSET_MANIFEST } from './assetManifest.js';
import { GOAL_DEFS, resolveGoalDef } from './goalDefs.js';
import { getItemDef, ITEM_DEFS } from './itemDefs.js';
import { PLATFORM_KINDS } from './platformDefs.js';
import { RESIDENT_DEFS } from './residentDefs.js';
import { STAGES } from './stages.js';
import { WORLDS } from './worlds.js';
import { getSwitchTargetImageKey } from './switchVisualAssetKeys.js';

const KNOWN_ASSET_KEYS = new Set(Object.keys(ASSET_MANIFEST.images || {}));
const OPENING_PORTRAIT_KEYS = Object.freeze([
  'portrait_smile',
  'portrait_surprise',
  'portrait_gentle',
  'portrait_determined',
]);

const TITLE_ASSET_KEYS = Object.freeze([
  'bg_kingdom_opening',
  'bg_candy_forest',
  'hero_idle',
  'hero_victory',
  'npc_teacup_fairy',
  'npc_teacup_fairy_float',
]);

const MENU_BACKGROUND_ASSET_KEYS = Object.freeze([
  'bg_kingdom_opening',
]);

const GARDEN_HERO_ASSET_KEYS = Object.freeze([
  'hero_idle',
  'hero_walk',
  'hero_walk_1',
  'hero_walk_2',
  'hero_walk_3',
  'hero_walk_4',
]);

const PLAYER_STAGE_ASSET_KEYS = Object.freeze([
  'hero_idle',
  'hero_walk',
  'hero_walk_1',
  'hero_walk_2',
  'hero_walk_3',
  'hero_walk_4',
  'hero_jump',
  'hero_magic',
  'hero_bow',
  'hero_tea',
  'hero_hurt',
  'nano_mount_front',
  'npc_teacup_fairy',
  'npc_teacup_fairy_float',
  'npc_teacup_fairy_happy',
  'npc_teacup_fairy_jump',
  'npc_teacup_fairy_spin',
  'npc_teacup_fairy_shine',
  'npc_teacup_fairy_surprise',
]);

const HUD_ASSET_KEYS = Object.freeze([
  'icon_coin',
  'icon_teacup',
]);

const STAGE_COMMON_ASSET_KEYS = Object.freeze([
  ...PLAYER_STAGE_ASSET_KEYS,
  ...HUD_ASSET_KEYS,
  'icon_dream_drop',
  'stage_checkpoint_flag',
]);

const TEA_BELL_ASSET_KEYS = Object.freeze([
  'switch_tea_bell_arch',
  'switch_tea_bell_idle',
  'switch_tea_bell_swing_1',
  'switch_tea_bell_swing_2',
  'switch_tea_bell_swing_3',
  'switch_tea_bell_swing_4',
  'switch_note_pink_large',
  'switch_note_yellow_large',
  'switch_note_green_large',
  'switch_note_cyan_large',
  'switch_note_purple_large',
  'switch_note_orange_large',
]);

const GLASS_ROSE_ASSET_KEYS = Object.freeze([
  'switch_glass_rose_off',
  'switch_glass_rose_red',
  'switch_glass_rose_blue',
  'switch_glass_rose_yellow',
]);

const RAINBOW_BUBBLE_ASSET_KEYS = Object.freeze([
  'switch_rainbow_bubble_idle',
  'switch_rainbow_bubble_idle_small',
  'switch_rainbow_bubble_on',
  'switch_rainbow_bubble_on_small',
]);

const CANDELABRA_COLORS = Object.freeze(['orange', 'blue', 'pink', 'green']);
const MAGIC_CANDELABRA_ASSET_KEYS = Object.freeze([
  'switch_magic_candelabra_off',
  ...CANDELABRA_COLORS.map(color => `switch_magic_candelabra_${color}_lit_reference`),
  ...CANDELABRA_COLORS.flatMap(color => Array.from({ length: 6 }, (_, index) => `switch_magic_flame_${color}_${index + 1}`)),
]);

const BALLOON_RIDE_ASSET_KEYS = Object.freeze([
  'hero_balloon_ride_idle',
  'hero_balloon_ride_hit',
  'balloon_ride_start',
  'balloon_goal_arch',
  'balloon_goal_cloud_pad',
  'balloon_fx_wind_shot',
  'balloon_ride_1',
  'balloon_ride_2',
  'balloon_ride_3',
  'balloon_ride_4',
  'balloon_hud_orange',
  'balloon_hud_blue',
  'balloon_hud_yellow',
  'balloon_hud_pink',
  'balloon_hazard_storm_cloud',
  'balloon_hazard_storm_cloud_charged',
  'balloon_hazard_thorn_cloud',
  'balloon_hazard_thorn_cloud_charged',
  'balloon_hazard_wind_mine',
  'balloon_hazard_wind_mine_active',
  'balloon_resident_bird_idle',
  'balloon_resident_bird_dive',
  'balloon_resident_cloud_imp_idle',
  'balloon_resident_cloud_imp_attack',
  'balloon_pop_orange_1',
  'balloon_pop_orange_2',
  'balloon_pop_orange_3',
  'balloon_pop_blue_1',
  'balloon_pop_blue_2',
  'balloon_pop_blue_3',
  'balloon_pop_yellow_1',
  'balloon_pop_yellow_2',
  'balloon_pop_yellow_3',
  'balloon_pop_pink_1',
  'balloon_pop_pink_2',
  'balloon_pop_pink_3',
]);

const TUTORIAL_ASSET_KEYS = Object.freeze(TUTORIAL_ENTRIES.map(entry => entry.imageKey));
const WORLD_NPC_ASSET_KEYS = Object.freeze(WORLDS.map(world => world.npc));
const SHOP_ASSET_KEYS = Object.freeze([
  ...HUD_ASSET_KEYS,
  ...Object.values(SHOP_ITEM_DEFS).map(def => def.icon),
  ...Object.values(UPGRADE_DEFS).map(def => def.icon),
]);

export const BOOT_ASSET_KEYS = Object.freeze([
  ...TITLE_ASSET_KEYS,
  ...HUD_ASSET_KEYS,
  'icon_dream_drop',
]);

function addKey(keys, key) {
  if (typeof key === 'string' && KNOWN_ASSET_KEYS.has(key)) keys.add(key);
}

function addKeys(keys, assetKeys) {
  for (const key of assetKeys || []) addKey(keys, key);
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function collectKnownAssetStrings(value, keys, seen = new Set()) {
  if (!value || typeof value !== 'object') {
    addKey(keys, value);
    return;
  }
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach(item => collectKnownAssetStrings(item, keys, seen));
    return;
  }

  for (const child of Object.values(value)) {
    collectKnownAssetStrings(child, keys, seen);
  }
}

function collectDialogueAssets(keys, lines) {
  for (const line of toArray(lines)) addKey(keys, line?.portrait);
}

function collectNanoRescueAssets(keys, stage) {
  for (const eventObject of toArray(stage?.specialEvents)) {
    if (eventObject?.kind !== 'nanoRescue') continue;
    const config = NANO_RESCUE_EVENT_CONFIGS[eventObject.configId];
    if (!config) continue;
    addKey(keys, config.trappedImageKey);
    addKey(keys, config.brokenImageKey);
    addKeys(keys, ['npc_teacup_fairy_surprise', 'npc_teacup_fairy_jump', 'npc_teacup_fairy_happy', 'npc_teacup_fairy_spin']);
    collectDialogueAssets(keys, config.revealDialogue);
    collectDialogueAssets(keys, config.preMountDialogue);
    collectDialogueAssets(keys, config.postMountDialogue);
  }
}

function collectGoalAssets(keys, stage) {
  addKey(keys, resolveGoalDef(stage?.goal?.variant)?.imageKey);
  if (stage?.areaRole === 'boss') addKey(keys, GOAL_DEFS.default.imageKey || 'icon_dream_drop');
}

function collectResidentAssets(keys, stage) {
  for (const resident of toArray(stage?.residents)) {
    addKey(keys, resident?.imageKey);
    addKey(keys, resident?.actionImageKey);
    addKey(keys, RESIDENT_DEFS[resident?.type]?.imageKey);
  }
}

function collectItemAssets(keys, stage) {
  for (const item of toArray(stage?.items)) {
    addKey(keys, item?.imageKey);
    addKey(keys, getItemDef(item?.kind)?.imageKey);
  }
  addKeys(keys, Object.values(ITEM_DEFS).map(def => def.imageKey));
}

function collectDoorAssets(keys, stage) {
  for (const door of toArray(stage?.doors)) {
    addKey(keys, door?.imageKey);
    if (door?.kind === 'carrotClockDoor') addKey(keys, 'gimmick_carrot_clock_gate');
    else addKey(keys, 'door_bow');
  }
}

function collectPlatformAssets(keys, stage) {
  for (const platform of toArray(stage?.platforms)) {
    if (platform?.kind === PLATFORM_KINDS.RIBBON_BRIDGE) addKey(keys, 'platform_ribbon_bridge');
    if (platform?.kind === PLATFORM_KINDS.WAIT_FLOWER) addKey(keys, 'platform_wait_flower');
    if (platform?.kind === PLATFORM_KINDS.BALLOON_GOAL_CLOUD) addKey(keys, 'balloon_goal_cloud_pad');
  }
}

function collectCheckpointAssets(keys, stage) {
  for (const checkpoint of toArray(stage?.checkpoints)) {
    addKey(keys, checkpoint?.imageKey || 'stage_checkpoint_flag');
  }
}

function collectSwitchAssets(keys, stage) {
  for (const target of toArray(stage?.switchTargets)) addKey(keys, getSwitchTargetImageKey(target));

  for (const gimmick of toArray(stage?.switchGimmicks)) {
    if (gimmick?.kind === 'teaBell') addKeys(keys, TEA_BELL_ASSET_KEYS);
    else if (gimmick?.kind === 'glassRose') addKeys(keys, GLASS_ROSE_ASSET_KEYS);
    else if (gimmick?.kind === 'rainbowBubble') addKeys(keys, RAINBOW_BUBBLE_ASSET_KEYS);
    else if (gimmick?.kind === 'magicCandelabra') addKeys(keys, MAGIC_CANDELABRA_ASSET_KEYS);
    else if (gimmick?.kind === 'ribbonSwitch') addKey(keys, 'gimmick_ribbon_switch');
  }
}

function collectBalloonRideAssets(keys, stage) {
  if (toArray(stage?.balloonRides).length <= 0) return;
  addKeys(keys, BALLOON_RIDE_ASSET_KEYS);
}

function collectStageDialogueAssets(keys, stage) {
  collectDialogueAssets(keys, stage?.introDialogue);
  collectDialogueAssets(keys, stage?.bossDialogue);
  collectDialogueAssets(keys, stage?.bossDefeatDialogue);
  collectDialogueAssets(keys, stage?.clearDialogue);
  collectDialogueAssets(keys, stage?.areaClearDialogue);
}

export function getStageAssetKeys(stage) {
  const keys = new Set();
  addKeys(keys, STAGE_COMMON_ASSET_KEYS);
  addKeys(keys, TUTORIAL_ASSET_KEYS);
  collectKnownAssetStrings(stage, keys);
  collectGoalAssets(keys, stage);
  collectResidentAssets(keys, stage);
  collectItemAssets(keys, stage);
  collectDoorAssets(keys, stage);
  collectPlatformAssets(keys, stage);
  collectCheckpointAssets(keys, stage);
  collectSwitchAssets(keys, stage);
  collectBalloonRideAssets(keys, stage);
  collectStageDialogueAssets(keys, stage);
  collectNanoRescueAssets(keys, stage);
  return [...keys];
}

export function resolveStageFromParams(params = {}) {
  if (params.stageDefinition) return params.stageDefinition;
  const stageId = params.stageId || 'candy_forest_area_1';
  return STAGES[stageId] || STAGES.candy_forest_area_1;
}

export function getStageAssetKeysByParams(params = {}) {
  return getStageAssetKeys(resolveStageFromParams(params));
}

export function getStageAssetKeysById(stageId) {
  return getStageAssetKeys(STAGES[stageId] || STAGES.candy_forest_area_1);
}

function getGardenAssetKeys() {
  return [
    'bg_kingdom_opening',
    'bg_candy_forest',
    ...GARDEN_HERO_ASSET_KEYS,
    ...HUD_ASSET_KEYS,
    'icon_dream_drop',
    ...WORLD_NPC_ASSET_KEYS,
    ...TUTORIAL_ASSET_KEYS,
  ];
}

function getOpeningAssetKeys() {
  return [
    'bg_kingdom_opening',
    'hero_magic',
    ...OPENING_PORTRAIT_KEYS,
  ];
}

function getShopAssetKeys() {
  return [
    'bg_kingdom_opening',
    'bg_candy_forest',
    'hero_tea',
    'hero_idle',
    ...SHOP_ASSET_KEYS,
  ];
}

function getResultAssetKeys(params = {}) {
  return [
    params.ending ? 'bg_kingdom_opening' : 'bg_dream_tree',
    'bg_candy_world2',
    'hero_victory',
  ];
}

export function getSceneAssetKeys(sceneId, params = {}) {
  if (sceneId === SCENES.TITLE) return [...TITLE_ASSET_KEYS];
  if (sceneId === SCENES.OPENING) return getOpeningAssetKeys();
  if (sceneId === SCENES.GARDEN) return getGardenAssetKeys();
  if (sceneId === SCENES.STAGE) return getStageAssetKeysByParams(params);
  if (sceneId === SCENES.RESULT) return getResultAssetKeys(params);
  if (sceneId === SCENES.SHOP) return getShopAssetKeys();
  if (sceneId === SCENES.DEBUG) return ['bg_kingdom_opening', 'bg_candy_forest'];
  if (sceneId === SCENES.OPTION || sceneId === SCENES.KEY_CONFIG || sceneId === SCENES.TOUCH_CONTROL) {
    return [...MENU_BACKGROUND_ASSET_KEYS];
  }
  return [];
}

export function getBootAssetKeys(initialScene, initialParams = {}) {
  if (initialScene === SCENES.STAGE) return getSceneAssetKeys(SCENES.STAGE, initialParams);
  return [...BOOT_ASSET_KEYS];
}

export function getNextStagePrefetchAssetKeys(stage) {
  const nextStageId = stage?.route?.nextStageId;
  if (!nextStageId || !STAGES[nextStageId]) return [];
  return getStageAssetKeysById(nextStageId);
}

export function getGardenStagePrefetchAssetKeys(saveData = null) {
  const cleared = new Set(saveData?.clearedStages || []);
  const keys = new Set();
  for (const [index, world] of WORLDS.entries()) {
    const unlocked = index === 0 || cleared.has(WORLDS[index - 1].routeId);
    if (unlocked) addKeys(keys, getStageAssetKeysById(world.startStageId));
  }
  return [...keys];
}
