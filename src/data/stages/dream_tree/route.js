/**
 * 責務: 夢みる豆の木 のエリア進行順とステージデータ集合を定義する。
 * 更新ルール: 各エリアの実データは同階層の area_1 / area_2 / area_3 / boss に分割して保持する。
 */
import area1 from './area_1.js';
import area2 from './area_2.js';
import area3 from './area_3.js';
import boss from './boss.js';

export const DREAM_TREE_ROUTE = {
  id: 'dream_tree',
  startStageId: 'dream_tree_area_1',
  stageIds: [
    'dream_tree_area_1',
    'dream_tree_area_2',
    'dream_tree_area_3',
    'dream_tree_boss'
  ],
  stages: [area1, area2, area3, boss],
};

export const DREAM_TREE_ROUTE_STAGES = {
  'dream_tree_area_1': area1,
  'dream_tree_area_2': area2,
  'dream_tree_area_3': area3,
  'dream_tree_boss': boss,
};
