/**
 * 責務: タイトル画面から直接起動するスイッチ系ギミック検証ステージを定義する。
 * 更新ルール: セーブへ反映しない検証専用ステージとして、通常ルート配列には含めない。
 */
const stage = {
  id: 'switch_test_lab',
  worldIndex: 0,
  testStage: true,
  name: 'テスト：お茶会スイッチ実験室',
  backgroundKey: 'bg_teacup_castle',
  bgm: 'world2-teacup-castle',
  width: 2200,
  height: 360,
  playerStart: { x: 40, y: 272 },
  goal: { x: 2128, y: 272 },
  boss: null,
  introDialogue: [
    {
      portrait: 'portrait_nano_smile',
      speaker: 'なのちゃん',
      text: 'なのだ！',
    },
    {
      portrait: 'portrait_gentle',
      speaker: 'お嬢ちゃまずんだもん',
      text: 'ここはセーブに残らない実験室なの。ベル、ローズ、シャボン、燭台を順番に試すの。',
    },
    {
      portrait: 'portrait_determined',
      speaker: 'お嬢ちゃまずんだもん',
      text: 'Z/Jの豆の魔法と、なのちゃんの待機・発射を使って仕掛けを確かめるの。',
    },
  ],
  clearDialogue: [
    {
      portrait: 'portrait_smile',
      speaker: 'お嬢ちゃまずんだもん',
      text: 'スイッチ実験はここまでなの。タイトルへ戻るの。',
    },
  ],
  platforms: [
    { x: 0, y: 320, w: 312, h: 32 },
    { x: 352, y: 320, w: 208, h: 32 },
    { x: 600, y: 320, w: 240, h: 32 },
    { x: 888, y: 320, w: 232, h: 32 },
    { x: 1160, y: 320, w: 248, h: 32 },
    { x: 1448, y: 320, w: 248, h: 32 },
    { x: 1744, y: 320, w: 464, h: 32 },
    { x: 424, y: 256, w: 80, h: 16, kind: 'cloud' },
    { x: 688, y: 256, w: 88, h: 16, kind: 'jelly' },
    { x: 1328, y: 256, w: 88, h: 16, kind: 'cloud' },
    { x: 1552, y: 256, w: 88, h: 16, kind: 'spoon' },
  ],
  doors: [
    { id: 'door_bell', x: 296, y: 232, w: 56, h: 80, openCondition: 'switch', switchId: 'bell_a', openWhenOn: true, imageKey: 'door_bow' },
    { id: 'door_rose', x: 840, y: 232, w: 56, h: 80, openCondition: 'switch', switchId: 'rose_all', openWhenOn: true, imageKey: 'door_bow' },
    { id: 'door_bubble', x: 1416, y: 232, w: 56, h: 80, openCondition: 'switch', switchId: 'bubble_pair', openWhenOn: true, imageKey: 'door_bow' },
    { id: 'door_candle', x: 1704, y: 232, w: 56, h: 80, openCondition: 'switch', switchId: 'candle_pair', openWhenOn: true, imageKey: 'door_bow' },
  ],
  switchTargets: [
    { id: 'bell_table', kind: 'teaTable', variant: 'long', imageKey: 'switch_target_table_long', x: 360, y: 280, w: 96, h: 40, switchId: 'bell_a', activeWhenOn: true, solid: true },
    { id: 'rose_chair_1', kind: 'teaChair', variant: 'purple', imageKey: 'switch_target_chair_purple', x: 920, y: 272, w: 48, h: 48, switchId: 'rose_all', activeWhenOn: true, solid: true },
    { id: 'bubble_table', kind: 'teaTable', variant: 'green', imageKey: 'switch_target_table_round_green', x: 1472, y: 280, w: 104, h: 40, switchId: 'bubble_pair', activeWhenOn: true, solid: true },
    { id: 'candle_chair', kind: 'teaChair', variant: 'wing', imageKey: 'switch_target_chair_wing', x: 1784, y: 272, w: 48, h: 48, switchId: 'candle_pair', activeWhenOn: true, solid: true },
  ],
  switchGimmicks: [
    { id: 'tea_bell_player', kind: 'teaBell', x: 192, y: 256, w: 40, h: 48, switchId: 'bell_a', duration: 4.0, triggerBy: ['player', 'nano', 'magic'] },
    { id: 'tea_bell_cloud', kind: 'teaBell', x: 456, y: 192, w: 40, h: 48, switchId: 'bell_a', duration: 4.0, triggerBy: ['player', 'nano', 'magic'] },

    { id: 'rose_red', kind: 'glassRose', setId: 'rose_set_a', x: 624, y: 256, w: 40, h: 56, switchId: 'rose_all', color: 'red', required: 3, litDuration: 0 },
    { id: 'rose_blue', kind: 'glassRose', setId: 'rose_set_a', x: 728, y: 200, w: 40, h: 56, switchId: 'rose_all', color: 'blue', required: 3, litDuration: 0 },
    { id: 'rose_yellow', kind: 'glassRose', setId: 'rose_set_a', x: 784, y: 256, w: 40, h: 56, switchId: 'rose_all', color: 'yellow', required: 3, litDuration: 0 },

    { id: 'bubble_player', kind: 'rainbowBubble', groupId: 'bubble_pair_a', x: 1208, y: 264, w: 48, h: 48, switchId: 'bubble_pair', required: 2, triggerBy: ['player', 'nano'] },
    { id: 'bubble_nano', kind: 'rainbowBubble', groupId: 'bubble_pair_a', x: 1344, y: 208, w: 40, h: 40, switchId: 'bubble_pair', required: 2, triggerBy: ['player', 'nano'] },

    { id: 'candle_orange', kind: 'magicCandelabra', setId: 'candle_set_a', x: 1504, y: 248, w: 56, h: 64, switchId: 'candle_pair', flameColor: 'orange', required: 2, litDuration: 5.0 },
    { id: 'candle_blue', kind: 'magicCandelabra', setId: 'candle_set_a', x: 1608, y: 192, w: 56, h: 64, switchId: 'candle_pair', flameColor: 'blue', required: 2, litDuration: 5.0 },
  ],
  residents: [],
  items: [
    { x: 104, y: 280, kind: 'coin' },
    { x: 392, y: 240, kind: 'coin' },
    { x: 640, y: 232, kind: 'coin' },
    { x: 944, y: 240, kind: 'teacup' },
    { x: 1216, y: 240, kind: 'scone' },
    { x: 1840, y: 240, kind: 'coin' },
    { x: 1968, y: 256, kind: 'largeBeanCoin' },
  ],
  decorations: [
    { x: 184, y: 168, r: 10, color: 'rgba(255,255,255,0.28)' },
    { x: 720, y: 152, r: 8, color: 'rgba(255,242,171,0.34)' },
    { x: 1288, y: 160, r: 11, color: 'rgba(204,245,255,0.30)' },
    { x: 1584, y: 144, r: 9, color: 'rgba(255,220,150,0.28)' },
  ],
  route: {
    id: 'switch_test_lab',
    startStageId: 'switch_test_lab',
    stageIds: ['switch_test_lab'],
    index: 0,
    nextStageId: null,
    saveStageId: 'switch_test_lab',
    areaName: '実験室',
    rankTimeS: 999,
    rankTimeA: 999,
    ending: false,
  },
  areaRole: 'test',
  areas: [
    { id: 'area_1', name: 'お茶会ベル', startX: 0, endX: 560, respawn: { x: 40, y: 272 } },
    { id: 'area_2', name: 'ガラスのローズ', startX: 560, endX: 1120, respawn: { x: 608, y: 272 } },
    { id: 'area_3', name: '虹色シャボン', startX: 1120, endX: 1445, respawn: { x: 1168, y: 272 } },
    { id: 'area_4', name: '魔法燭台', startX: 1445, endX: 2200, respawn: { x: 1472, y: 272 } },
  ],
};

export default stage;
