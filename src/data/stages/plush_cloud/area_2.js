/**
 * 責務: ぬいぐるみ雲：夢風のふわふわ回廊 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "plush_cloud_area_2",
  worldIndex: 3,
  name: "ぬいぐるみ雲：夢風のふわふわ回廊",
  backgroundKey: "bg_plush_cloud",
  "bgm": "world4-plush-cloud-sky",
  width: 2520,
  height: 360,
  playerStart: {
    x: 48,
    y: 256
  },
  goal: {
    x: 2432,
    y: 232
  },
  boss: null,
  introDialogue: [],
  bossDialogue: [],
  bossDefeatDialogue: [],
  clearDialogue: [],
  areaClearDialogue: [
    {
      portrait: "npc_teacup_fairy",
      speaker: "ティーカップ妖精",
      text: "夢風を抜けたよ！ ドラゴンさんのところまで、もう少し！"
    }
  ],
  platforms: [
    {
      x: 0,
      y: 320,
      w: 264,
      h: 32
    },
    {
      x: 328,
      y: 288,
      w: 104,
      h: 16,
      kind: "sleepCloud"
    },
    {
      x: 520,
      y: 264,
      w: 96,
      h: 16,
      kind: "cloud"
    },
    {
      x: 704,
      y: 288,
      w: 112,
      h: 16,
      kind: "wind",
      windStyle: "dream"
    },
    {
      x: 912,
      y: 320,
      w: 224,
      h: 32
    },
    {
      x: 1224,
      y: 280,
      w: 104,
      h: 16,
      kind: "sleepCloud"
    },
    {
      x: 1408,
      y: 256,
      w: 104,
      h: 16,
      kind: "vine",
      active: false
    },
    {
      x: 1600,
      y: 320,
      w: 232,
      h: 32
    },
    {
      x: 1928,
      y: 288,
      w: 120,
      h: 16,
      kind: "wind",
      windStyle: "dream"
    },
    {
      x: 2160,
      y: 296,
      w: 112,
      h: 16,
      kind: "sleepCloud"
    },
    {
      x: 2344,
      y: 320,
      w: 184,
      h: 32
    }
  ],
  residents: [
    {
      x: 960,
      y: 296,
      type: "bat",
      minX: 910,
      maxX: 1120
    },
    {
      x: 1648,
      y: 288,
      type: "cloud",
      minX: 1600,
      maxX: 1810
    },
    {
      x: 2200,
      y: 272,
      type: "bat",
      minX: 2160,
      maxX: 2280
    }
  ],
  items: [
    {
      x: 360,
      y: 256,
      kind: "coin"
    },
    {
      x: 744,
      y: 256,
      kind: "coin"
    },
    {
      x: 1264,
      y: 248,
      kind: "scone"
    },
    {
      x: 1448,
      y: 216,
      kind: "teacup"
    },
    {
      x: 1976,
      y: 248,
      kind: "coin"
    },
    {
      x: 2208,
      y: 256,
      kind: "coin"
    }
  ],
  decorations: [
    {
      x: 120,
      y: 160,
      r: 10,
      color: "rgba(255,255,255,0.25)"
    },
    {
      x: 520,
      y: 144,
      r: 7,
      color: "rgba(255,242,171,0.34)"
    },
    {
      x: 984,
      y: 152,
      r: 8,
      color: "rgba(255,255,255,0.22)"
    },
    {
      x: 1504,
      y: 144,
      r: 10,
      color: "rgba(246,251,207,0.26)"
    },
    {
      x: 2104,
      y: 176,
      r: 9,
      color: "rgba(255,255,255,0.22)"
    }
  ],
  route: {
    id: "plush_cloud",
    startStageId: "plush_cloud_area_1",
    stageIds: [
      "plush_cloud_area_1",
      "plush_cloud_area_2",
      "plush_cloud_area_3",
      "plush_cloud_boss"
    ],
    index: 1,
    nextStageId: "plush_cloud_area_3",
    saveStageId: "plush_cloud",
    areaName: "エリア2",
    rankTimeS: 330,
    rankTimeA: 470,
    ending: false
  },
  areaRole: "area_2",
  areas: [
    {
      id: "area_2",
      name: "エリア2",
      startX: 0,
      endX: 2480,
      respawn: {
        x: 48,
        y: 256
      }
    }
  ]
};

export default stage;
