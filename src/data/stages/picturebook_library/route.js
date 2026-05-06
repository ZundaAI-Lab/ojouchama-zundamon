/**
 * 責務: まよなか絵本館 のエリア進行順とステージデータ集合を定義する。
 * 更新ルール: 各エリアの実データは同階層の area_1 / area_2 / area_3 / boss に分割して保持する。
 */
import area1 from './area_1.js';
import area2 from './area_2.js';
import area3 from './area_3.js';
import boss from './boss.js';

export const PICTUREBOOK_LIBRARY_ROUTE = {
  id: 'picturebook_library',
  startStageId: 'picturebook_library_area_1',
  stageIds: [
    'picturebook_library_area_1',
    'picturebook_library_area_2',
    'picturebook_library_area_3',
    'picturebook_library_boss'
  ],
  stages: [area1, area2, area3, boss],
};

export const PICTUREBOOK_LIBRARY_ROUTE_STAGES = {
  'picturebook_library_area_1': area1,
  'picturebook_library_area_2': area2,
  'picturebook_library_area_3': area3,
  'picturebook_library_boss': boss,
};
