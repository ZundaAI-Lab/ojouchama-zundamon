/**
 * 責務: ステージ定義の共通スキーマ、既定値補完、ルート由来の進行情報注入を担当する。
 * 更新ルール: StageFactoryやRuntimeへデータ補完責務を持ち込まず、エディタと実行時が参照する正規化済み形式をここで固定する。
 * 更新ルール: ルート進行情報の正本はroute.jsのroute定義とし、各ステージのrouteは正規化時に生成する。
 * 更新ルール: 通常ステージ高の既定値はSTAGE_VIEW.STANDARD_HEIGHTを正本とし、未指定データを270へ戻さない。
 * 更新ルール: ゴール種類の既定値補完だけをここで行い、種類ごとの寸法はgoalDefsへ置く。
 * 更新ルール: 未定義キーは正規化結果へ持ち越さず、現在のスキーマだけを正本にする。
 * 更新ルール: ステージBGMはBGMトラックIDだけを保持し、曲データや再生処理はaudio配下へ委譲する。
 */
import { STAGE_VIEW } from '../config/view.js';
import { PLATFORM_KINDS } from './platformDefs.js';
import { GOAL_DEFAULT_VARIANT } from './goalDefs.js';
import { resolveStageBgmId } from './audio/bgmTrackDefs.js';

export const STAGE_SCHEMA_KEYS = Object.freeze([
  'id',
  'worldIndex',
  'testStage',
  'name',
  'backgroundKey',
  'bgm',
  'width',
  'height',
  'playerStart',
  'goal',
  'boss',
  'introDialogue',
  'bossDialogue',
  'bossDefeatDialogue',
  'clearDialogue',
  'areaClearDialogue',
  'platforms',
  'residents',
  'items',
  'decorations',
  'checkpoints',
  'doors',
  'switchTargets',
  'switchGimmicks',
  'balloonRides',
  'specialEvents',
  'route',
  'areaRole',
  'areas',
]);

export const STAGE_ARRAY_FIELDS = Object.freeze([
  'introDialogue',
  'bossDialogue',
  'bossDefeatDialogue',
  'clearDialogue',
  'areaClearDialogue',
  'platforms',
  'residents',
  'items',
  'decorations',
  'checkpoints',
  'doors',
  'switchTargets',
  'switchGimmicks',
  'balloonRides',
  'specialEvents',
  'areas',
]);

const DEFAULT_POINT = Object.freeze({ x: 0, y: 0 });
const DEFAULT_GOAL = Object.freeze({ x: 0, y: 0, variant: GOAL_DEFAULT_VARIANT });
const ROUTE_STAGE_NAME_FALLBACKS = Object.freeze(['エリア1', 'エリア2', 'エリア3', 'ボスエリア']);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clonePoint(point = DEFAULT_POINT) {
  return {
    x: Number.isFinite(point.x) ? point.x : DEFAULT_POINT.x,
    y: Number.isFinite(point.y) ? point.y : DEFAULT_POINT.y,
  };
}

function cloneGoal(goal = DEFAULT_GOAL) {
  return {
    x: Number.isFinite(goal.x) ? goal.x : DEFAULT_GOAL.x,
    y: Number.isFinite(goal.y) ? goal.y : DEFAULT_GOAL.y,
    variant: typeof goal.variant === 'string' && goal.variant ? goal.variant : DEFAULT_GOAL.variant,
  };
}

function normalizePlatform(platform) {
  return {
    ...platform,
    kind: platform?.kind || PLATFORM_KINDS.NORMAL,
    active: platform?.active ?? true,
  };
}

function resolveAreaName(stage, route, index) {
  return route.areaNames?.[index]
    || stage.route?.areaName
    || stage.areas?.[0]?.name
    || ROUTE_STAGE_NAME_FALLBACKS[index]
    || `エリア${index + 1}`;
}

function createRouteContext(route, stage, index) {
  const stageIds = [...asArray(route.stageIds)];
  return {
    id: route.id,
    startStageId: route.startStageId || stageIds[0] || stage.id,
    stageIds,
    index,
    nextStageId: stageIds[index + 1] || null,
    saveStageId: route.saveStageId || route.id,
    areaName: resolveAreaName(stage, route, index),
    rankTimeS: route.rankTimeS ?? stage.route?.rankTimeS,
    rankTimeA: route.rankTimeA ?? stage.route?.rankTimeA,
    ending: route.ending ?? stage.route?.ending ?? false,
  };
}

function normalizeRoute(stage, routeContext) {
  const source = routeContext || stage.route;
  if (!source) return null;
  return {
    id: source.id || stage.id,
    startStageId: source.startStageId || stage.id,
    stageIds: [...asArray(source.stageIds || [stage.id])],
    index: Number.isInteger(source.index) ? source.index : 0,
    nextStageId: source.nextStageId ?? null,
    saveStageId: source.saveStageId || source.id || stage.id,
    areaName: source.areaName || stage.areas?.[0]?.name || 'エリア1',
    rankTimeS: Number.isFinite(source.rankTimeS) ? source.rankTimeS : 95,
    rankTimeA: Number.isFinite(source.rankTimeA) ? source.rankTimeA : 135,
    ending: !!source.ending,
  };
}

export function normalizeStageDefinition(rawStage, routeContext = null) {
  const stage = rawStage || {};
  const normalized = {
    id: stage.id || '',
    worldIndex: Number.isInteger(stage.worldIndex) ? stage.worldIndex : 0,
    testStage: stage.testStage === true,
    name: stage.name || '',
    backgroundKey: stage.backgroundKey || '',
    bgm: resolveStageBgmId(stage),
    width: Number.isFinite(stage.width) ? stage.width : 0,
    height: Number.isFinite(stage.height) ? stage.height : STAGE_VIEW.STANDARD_HEIGHT,
    playerStart: clonePoint(stage.playerStart),
    goal: cloneGoal(stage.goal),
    boss: stage.boss ?? null,
    introDialogue: asArray(stage.introDialogue),
    bossDialogue: asArray(stage.bossDialogue),
    bossDefeatDialogue: asArray(stage.bossDefeatDialogue),
    clearDialogue: asArray(stage.clearDialogue),
    areaClearDialogue: asArray(stage.areaClearDialogue),
    platforms: asArray(stage.platforms).map(normalizePlatform),
    residents: asArray(stage.residents),
    items: asArray(stage.items),
    decorations: asArray(stage.decorations),
    checkpoints: asArray(stage.checkpoints),
    doors: asArray(stage.doors),
    switchTargets: asArray(stage.switchTargets),
    switchGimmicks: asArray(stage.switchGimmicks),
    balloonRides: asArray(stage.balloonRides),
    specialEvents: asArray(stage.specialEvents),
    route: normalizeRoute(stage, routeContext),
    areaRole: stage.areaRole || 'area_1',
    areas: asArray(stage.areas),
  };

  return normalized;
}

export function normalizeStageRoute(route) {
  const stageIds = [...asArray(route.stageIds)];
  const stages = asArray(route.stages).map((stage, index) => normalizeStageDefinition(stage, createRouteContext(route, stage, index)));
  return {
    ...route,
    stageIds,
    stages,
  };
}

export function createStageMapFromRoute(route) {
  return Object.fromEntries(asArray(route.stages).map(stage => [stage.id, stage]));
}
