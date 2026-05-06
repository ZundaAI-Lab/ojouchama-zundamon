/**
 * 責務: 画面切り替え式ステージルートの集約と正規化済みステージマップ生成を担当する。
 * 更新ルール: 各ルートの詳細は各ワールド配下の route.js に置き、ステージ形式の補完はstageSchemaへ集約する。
 */
import { CANDY_FOREST_ROUTE } from '../candy_forest/route.js';
import { TEACUP_CASTLE_ROUTE } from '../teacup_castle/route.js';
import { RIBBON_GARDEN_ROUTE } from '../ribbon_garden/route.js';
import { PLUSH_CLOUD_ROUTE } from '../plush_cloud/route.js';
import { PICTUREBOOK_LIBRARY_ROUTE } from '../picturebook_library/route.js';
import { DREAM_TREE_ROUTE } from '../dream_tree/route.js';
import { createStageMapFromRoute, normalizeStageRoute } from '../../stageSchema.js';

const RAW_STAGE_ROUTES = [
  CANDY_FOREST_ROUTE,
  TEACUP_CASTLE_ROUTE,
  RIBBON_GARDEN_ROUTE,
  PLUSH_CLOUD_ROUTE,
  PICTUREBOOK_LIBRARY_ROUTE,
  DREAM_TREE_ROUTE,
];

export const STAGE_ROUTES = RAW_STAGE_ROUTES.map(normalizeStageRoute);

export const STAGE_ROUTE_MAPS = STAGE_ROUTES.map(createStageMapFromRoute);

export const ROUTE_STAGE_IDS = STAGE_ROUTES.flatMap(route => route.stageIds);

export function createStageRouteMap() {
  return Object.assign({}, ...STAGE_ROUTE_MAPS);
}
