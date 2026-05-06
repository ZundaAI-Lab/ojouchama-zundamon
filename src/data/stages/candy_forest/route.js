/**
 * 責務: お菓子の森 のエリア進行順とステージデータ集合を定義する。
 * 更新ルール: 各エリアの実データは同階層の area_1 / area_2 / area_3 / boss に分割して保持する。
 */
import area1 from './area_1.js';
import area2 from './area_2.js';
import area3 from './area_3.js';
import boss from './boss.js';

export const CANDY_FOREST_ROUTE = {
  id: 'candy_forest',
  startStageId: 'candy_forest_area_1',
  stageIds: [
    'candy_forest_area_1',
    'candy_forest_area_2',
    'candy_forest_area_3',
    'candy_forest_boss'
  ],
  stages: [area1, area2, area3, boss],
};

export const CANDY_FOREST_ROUTE_STAGES = {
  'candy_forest_area_1': area1,
  'candy_forest_area_2': area2,
  'candy_forest_area_3': area3,
  'candy_forest_boss': boss,
};
