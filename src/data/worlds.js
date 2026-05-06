/**
 * 責務: ガーデン画面に表示するワールド/ステージルートのメタ情報を担当する。
 * 更新ルール: 解放判定やクリア状態はScene/Save側に置く。
 */
export const WORLDS = [
  {
    id: 'candy_forest',
    title: 'ワールド1 お菓子の森',
    routeId: 'candy_forest',
    startStageId: 'candy_forest_area_1',
    desc: '豆の魔法からはじまる、甘くてやさしい森。',
    npc: 'npc_candy_maid',
  },
  {
    id: 'teacup_castle',
    title: 'ワールド2 ティーカップ城',
    routeId: 'teacup_castle',
    startStageId: 'teacup_castle_area_1',
    desc: '礼儀が道をひらく、ふしぎなお城。',
    npc: 'npc_lamb_butler',
  },
  {
    id: 'ribbon_garden',
    title: 'ワールド3 リボン庭園',
    routeId: 'ribbon_garden',
    startStageId: 'ribbon_garden_area_1',
    desc: 'ほどけた招待状と、やさしさを結ぶ庭園。',
    npc: 'npc_rabbit_child',
  },
  {
    id: 'plush_cloud',
    title: 'ワールド4 ぬいぐるみ雲の空',
    routeId: 'plush_cloud',
    startStageId: 'plush_cloud_area_1',
    desc: '眠りの魔法に包まれた、ふわふわ雲の空。',
    npc: 'npc_teacup_fairy',
  },
  {
    id: 'picturebook_library',
    title: 'ワールド5 まよなか絵本館',
    routeId: 'picturebook_library',
    startStageId: 'picturebook_library_area_1',
    desc: '忘れられた物語が眠る、影たちの図書館。',
    npc: 'npc_cloud_librarian',
  },
  {
    id: 'dream_tree',
    title: 'ワールド6 夢みる豆の木',
    routeId: 'dream_tree',
    startStageId: 'dream_tree_area_1',
    desc: '夢と魔法をのせて伸びる、ふしぎな豆の木。',
    npc: 'npc_bean_gardener',
  },
];
