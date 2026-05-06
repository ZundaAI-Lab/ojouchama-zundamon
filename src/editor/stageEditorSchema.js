/**
 * 責務: ステージエディタで直接編集できる項目、既定値、履歴対象の編集ドキュメント形式を定義する。
 * 更新ルール: 実行時正規化はdata/stageSchema.jsへ任せ、ここではエディタUIと保存前編集単位だけを扱う。
 * 更新ルール: xのみの中継ポイントはエディタ内で足場から表示位置を解決し、矩形編集できる形へ補完する。
 * 更新ルール: 新規ステージの高さは通常ステージ標準高を使い、実行時の背景cover同期とずれないようにする。
 * 更新ルール: ゴール種類の選択値はgoalDefsの既定値を初期値にする。
 * 更新ルール: ステージBGMはBGMトラックIDのみを編集対象にし、曲データの編集責務は持たない。
 */
import { STAGE_VIEW } from '../config/view.js';
import { normalizeStageDefinition } from '../data/stageSchema.js';
import { PLATFORM_KINDS } from '../data/platformDefs.js';
import { GOAL_DEFAULT_VARIANT } from '../data/goalDefs.js';
import { STAGE_BGM_BY_WORLD_INDEX } from '../data/audio/bgmTrackDefs.js';

export const STAGE_EDITOR_SCHEMA_VERSION = 1;
export const STAGE_EDITOR_GRID_SIZE = 8;
export const STAGE_EDITOR_VIEW = Object.freeze({ width: 480, height: 270 });

export const EDITOR_CATEGORY_IDS = Object.freeze([
  'points',
  'platforms',
  'items',
  'residents',
  'checkpoints',
  'areas',
  'boss',
  'doors',
  'switchGimmicks',
  'switchTargets',
  'balloonRides',
  'specialEvents',
  'decorations',
]);

export const EDITOR_SINGLETON_CATEGORIES = Object.freeze(['points', 'boss']);


const EDITOR_CHECKPOINT_DEFAULT_W = 32;
const EDITOR_CHECKPOINT_DEFAULT_H = 48;

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function isUsableCheckpointPlatform(platform) {
  return !!(
    platform &&
    platform.active !== false &&
    !platform.surfaceOnly &&
    isFiniteNumber(platform.x) &&
    isFiniteNumber(platform.y) &&
    isFiniteNumber(platform.w) &&
    platform.w >= EDITOR_CHECKPOINT_DEFAULT_W + 24
  );
}

function resolveCheckpointPlatform(platforms = [], targetX = 0) {
  const usable = platforms.filter(isUsableCheckpointPlatform);
  const containing = usable
    .filter(platform => targetX >= platform.x + 16 && targetX <= platform.x + platform.w - 16)
    .sort((a, b) => Math.abs((a.x + a.w / 2) - targetX) - Math.abs((b.x + b.w / 2) - targetX));
  if (containing[0]) return containing[0];
  return usable
    .slice()
    .sort((a, b) => Math.abs((a.x + a.w / 2) - targetX) - Math.abs((b.x + b.w / 2) - targetX))[0] || null;
}

function normalizeEditorCheckpoint(stage, checkpoint = {}, index = 0) {
  const fallbackX = isFiniteNumber(checkpoint.x) ? checkpoint.x : (stage.playerStart?.x ?? 48) + 180;
  const platform = isFiniteNumber(checkpoint.y) ? null : resolveCheckpointPlatform(stage.platforms || [], fallbackX);
  const x = isFiniteNumber(checkpoint.x)
    ? checkpoint.x
    : platform
      ? platform.x + platform.w / 2
      : (stage.playerStart?.x ?? 48) + 180;
  const y = isFiniteNumber(checkpoint.y)
    ? checkpoint.y
    : platform
      ? platform.y
      : (stage.playerStart?.y ?? 180) + 40;

  return {
    ...checkpoint,
    id: checkpoint.id || `${stage.id || 'stage'}_checkpoint_${index + 1}`,
    x: snapToGrid(x),
    y: snapToGrid(y),
    w: isFiniteNumber(checkpoint.w) ? checkpoint.w : EDITOR_CHECKPOINT_DEFAULT_W,
    h: isFiniteNumber(checkpoint.h) ? checkpoint.h : EDITOR_CHECKPOINT_DEFAULT_H,
    imageKey: checkpoint.imageKey || 'stage_checkpoint_flag',
  };
}

function normalizeEditorCheckpoints(stage) {
  stage.checkpoints = Array.isArray(stage.checkpoints)
    ? stage.checkpoints.map((checkpoint, index) => normalizeEditorCheckpoint(stage, checkpoint, index))
    : [];
  return stage;
}

export const EDITOR_STAGE_DEFAULTS = Object.freeze({
  id: 'new_stage',
  worldIndex: 0,
  testStage: false,
  name: '新しいステージ',
  backgroundKey: 'bg_candy_world2',
  bgm: STAGE_BGM_BY_WORLD_INDEX[0],
  width: 2400,
  height: STAGE_VIEW.STANDARD_HEIGHT,
  playerStart: { x: 48, y: 180 },
  goal: { x: 2320, y: 160, variant: GOAL_DEFAULT_VARIANT },
  boss: null,
  introDialogue: [],
  bossDialogue: [],
  bossDefeatDialogue: [],
  clearDialogue: [],
  areaClearDialogue: [],
  platforms: [
    { x: 0, y: 236, w: 2400, h: 34, kind: PLATFORM_KINDS.NORMAL, active: true },
  ],
  residents: [],
  items: [],
  decorations: [],
  checkpoints: [],
  doors: [],
  switchTargets: [],
  switchGimmicks: [],
  balloonRides: [],
  specialEvents: [],
  route: null,
  areaRole: 'area_1',
  areas: [
    { id: 'area_1', name: 'エリア1', startX: 0, endX: 2400, respawn: { x: 48, y: 180 } },
  ],
});

export function cloneEditorValue(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function createEditorStage(rawStage = EDITOR_STAGE_DEFAULTS) {
  const stage = normalizeEditorCheckpoints(normalizeStageDefinition(cloneEditorValue(rawStage)));
  stage.schemaVersion = STAGE_EDITOR_SCHEMA_VERSION;
  if (!stage.areas.length) {
    stage.areas = cloneEditorValue(EDITOR_STAGE_DEFAULTS.areas);
    stage.areas[0].endX = stage.width;
  }
  return stage;
}

export function snapToGrid(value, grid = STAGE_EDITOR_GRID_SIZE) {
  if (!Number.isFinite(value)) return 0;
  const snapped = Math.round(value / grid) * grid;
  return Object.is(snapped, -0) ? 0 : snapped;
}

export function clampStageX(stage, value) {
  return Math.max(0, Math.min(stage.width, Number(value) || 0));
}

export function clampStageY(stage, value) {
  return Math.max(0, Math.min(stage.height, Number(value) || 0));
}
