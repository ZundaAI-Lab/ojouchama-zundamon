/**
 * 責務: ティーカップ城：ぐるぐる紅茶サロン のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "teacup_castle_area_3",
  worldIndex: 1,
  name: "ティーカップ城：ぐるぐる紅茶サロン",
  backgroundKey: "bg_teacup_castle",
  "bgm": "world2-teacup-castle",
  width: 2520,
  height: 360,
  playerStart: {
    x: 48,
    y: 264
  },
  goal: {
    x: 2440,
    y: 240
  },
  boss: null,
  introDialogue: [],
  bossDialogue: [],
  bossDefeatDialogue: [],
  clearDialogue: [],
  areaClearDialogue: [
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "紅茶たちも落ち着いたの。この先にいる方に、心をこめたおじぎを見せるの。"
    }
  ],
  platforms: [
    {
      x: 0,
      y: 320,
      w: 288,
      h: 32
    },
    {
      x: 360,
      y: 288,
      w: 112,
      h: 16,
      kind: "teacupSpin"
    },
    {
      x: 544,
      y: 272,
      w: 96,
      h: 16,
      kind: "spoon"
    },
    {
      x: 712,
      y: 320,
      w: 224,
      h: 32
    },
    {
      x: 1008,
      y: 296,
      w: 112,
      h: 16,
      kind: "jelly"
    },
    {
      x: 1200,
      y: 272,
      w: 96,
      h: 16,
      kind: "teacupSpin"
    },
    {
      x: 1368,
      y: 320,
      w: 248,
      h: 32
    },
    {
      x: 1704,
      y: 288,
      w: 112,
      h: 16,
      kind: "crumble"
    },
    {
      x: 1872,
      y: 272,
      w: 104,
      h: 16,
      kind: "spoon"
    },
    {
      x: 2040,
      y: 320,
      w: 264,
      h: 32
    },
    {
      x: 2360,
      y: 320,
      w: 160,
      h: 32
    }
  ],
  residents: [
    {
      x: 752,
      y: 296,
      type: "spoon",
      minX: 710,
      maxX: 920
    },
    {
      x: 1432,
      y: 288,
      type: "teaImp",
      minX: 1380,
      maxX: 1600
    },
    {
      x: 2080,
      y: 288,
      type: "teaImp",
      minX: 2040,
      maxX: 2280
    }
  ],
  items: [
    {
      x: 400,
      y: 256,
      kind: "coin"
    },
    {
      x: 584,
      y: 232,
      kind: "coin"
    },
    {
      x: 1048,
      y: 256,
      kind: "scone"
    },
    {
      x: 1240,
      y: 232,
      kind: "teacup"
    },
    {
      x: 1744,
      y: 256,
      kind: "coin"
    },
    {
      x: 1912,
      y: 232,
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
  doors: [
    { id: 'bow_door_1', groupId: '', x: 1544, y: 232, w: 64, h: 80, openCondition: 'bow', imageKey: 'door_bow', bowRange: 96 },
  ],

  route: {
    id: "teacup_castle",
    startStageId: "teacup_castle_area_1",
    stageIds: [
      "teacup_castle_area_1",
      "teacup_castle_area_2",
      "teacup_castle_area_3",
      "teacup_castle_boss"
    ],
    index: 2,
    nextStageId: "teacup_castle_boss",
    saveStageId: "teacup_castle",
    areaName: "エリア3",
    rankTimeS: 330,
    rankTimeA: 470,
    ending: false
  },
  areaRole: "area_3",
  areas: [
    {
      id: "area_3",
      name: "エリア3",
      startX: 0,
      endX: 2520,
      respawn: {
        x: 48,
        y: 264
      }
    }
  ]
};

export default stage;
