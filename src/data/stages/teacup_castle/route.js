/**
 * 責務: ティーカップ城 のエリア進行順とステージデータ集合を定義する。
 * 更新ルール: 各エリアの実データは同階層の area_1 / area_2 / area_3 / boss に分割して保持する。
 */
import area1 from './area_1.js';
import area2 from './area_2.js';
import area3 from './area_3.js';
import boss from './boss.js';

export const TEACUP_CASTLE_ROUTE = {
  id: 'teacup_castle',
  startStageId: 'teacup_castle_area_1',
  stageIds: [
    'teacup_castle_area_1',
    'teacup_castle_area_2',
    'teacup_castle_area_3',
    'teacup_castle_boss'
  ],
  stages: [area1, area2, area3, boss],
};

export const TEACUP_CASTLE_ROUTE_STAGES = {
  'teacup_castle_area_1': area1,
  'teacup_castle_area_2': area2,
  'teacup_castle_area_3': area3,
  'teacup_castle_boss': boss,
};
