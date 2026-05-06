/**
 * 責務: ぬいぐるみ雲 のエリア進行順とステージデータ集合を定義する。
 * 更新ルール: 各エリアの実データは同階層の area_1 / area_2 / area_3 / boss に分割して保持する。
 */
import area1 from './area_1.js';
import area2 from './area_2.js';
import area3 from './area_3.js';
import boss from './boss.js';

export const PLUSH_CLOUD_ROUTE = {
  id: 'plush_cloud',
  startStageId: 'plush_cloud_area_1',
  stageIds: [
    'plush_cloud_area_1',
    'plush_cloud_area_2',
    'plush_cloud_area_3',
    'plush_cloud_boss'
  ],
  stages: [area1, area2, area3, boss],
};

export const PLUSH_CLOUD_ROUTE_STAGES = {
  'plush_cloud_area_1': area1,
  'plush_cloud_area_2': area2,
  'plush_cloud_area_3': area3,
  'plush_cloud_boss': boss,
};
