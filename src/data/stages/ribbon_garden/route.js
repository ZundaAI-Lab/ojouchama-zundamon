/**
 * 責務: うさぎのリボン庭園 のエリア進行順とステージデータ集合を定義する。
 * 更新ルール: 各エリアの実データは同階層の area_1 / area_2 / area_3 / boss に分割して保持する。
 */
import area1 from './area_1.js';
import area2 from './area_2.js';
import area3 from './area_3.js';
import boss from './boss.js';

export const RIBBON_GARDEN_ROUTE = {
  id: 'ribbon_garden',
  startStageId: 'ribbon_garden_area_1',
  stageIds: [
    'ribbon_garden_area_1',
    'ribbon_garden_area_2',
    'ribbon_garden_area_3',
    'ribbon_garden_boss'
  ],
  stages: [area1, area2, area3, boss],
};

export const RIBBON_GARDEN_ROUTE_STAGES = {
  'ribbon_garden_area_1': area1,
  'ribbon_garden_area_2': area2,
  'ribbon_garden_area_3': area3,
  'ribbon_garden_boss': boss,
};
