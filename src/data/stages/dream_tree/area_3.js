/**
 * 責務: 夢みる豆の木：夢の重なり階段 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "dream_tree_area_3",
  worldIndex: 5,
  name: "夢みる豆の木：夢の重なり階段",
  backgroundKey: "bg_dream_tree",
  "bgm": "world6-dreaming-beanstalk",
  width: 2880,
  height: 360,
  playerStart: {
    x: 48,
    y: 264
  },
  goal: {
    x: 2792,
    y: 240
  },
  boss: null,
  introDialogue: [],
  bossDialogue: [],
  bossDefeatDialogue: [],
  clearDialogue: [],
  areaClearDialogue: [
    {
      portrait: "portrait_proud",
      speaker: "お嬢ちゃまずんだもん",
      text: "これまで出会った世界が、ちゃんと力を貸してくれたの。頂で守護者さんに会うの。"
    }
  ],
  platforms: [
    {
      x: 0,
      y: 320,
      w: 320,
      h: 32
    },
    {
      x: 392,
      y: 288,
      w: 112,
      h: 16,
      kind: "jam"
    },
    {
      x: 560,
      y: 264,
      w: 104,
      h: 16,
      kind: "jelly"
    },
    {
      x: 744,
      y: 320,
      w: 240,
      h: 32
    },
    {
      x: 1064,
      y: 288,
      w: 112,
      h: 16,
      kind: "sleepCloud"
    },
    {
      x: 1240,
      y: 264,
      w: 104,
      h: 16,
      kind: "dreamWind"
    },
    {
      x: 1432,
      y: 320,
      w: 232,
      h: 32
    },
    {
      x: 1744,
      y: 288,
      w: 112,
      h: 16,
      kind: "page",
      phase: 0.2
    },
    {
      x: 1920,
      y: 264,
      w: 104,
      h: 16,
      kind: "wishLeaf",
      active: false
    },
    {
      x: 2112,
      y: 320,
      w: 248,
      h: 32
    },
    {
      x: 2440,
      y: 288,
      w: 112,
      h: 16,
      kind: "crumble"
    },
    {
      x: 2624,
      y: 320,
      w: 264,
      h: 32
    }
  ],
  residents: [
    {
      x: 792,
      y: 288,
      type: "shadowRabbit",
      minX: 740,
      maxX: 970
    },
    {
      x: 1480,
      y: 280,
      type: "toyKnight",
      minX: 1430,
      maxX: 1650
    },
    {
      x: 2160,
      y: 280,
      type: "mirrorGhost",
      minX: 2110,
      maxX: 2350
    },
    {
      x: 2664,
      y: 288,
      type: "teaImp",
      minX: 2620,
      maxX: 2850
    }
  ],
  items: [
    {
      x: 432,
      y: 248,
      kind: "coin"
    },
    {
      x: 608,
      y: 224,
      kind: "coin"
    },
    {
      x: 1104,
      y: 248,
      kind: "scone"
    },
    {
      x: 1280,
      y: 224,
      kind: "teacup"
    },
    {
      x: 1784,
      y: 248,
      kind: "coin"
    },
    {
      x: 1968,
      y: 224,
      kind: "coin"
    },
    {
      x: 2480,
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
  doors: [
    { id: 'bow_door_1', groupId: '', x: 1512, y: 232, w: 64, h: 80, openCondition: 'bow', imageKey: 'door_bow', bowRange: 96 },
  ],

  route: {
    id: "dream_tree",
    startStageId: "dream_tree_area_1",
    stageIds: [
      "dream_tree_area_1",
      "dream_tree_area_2",
      "dream_tree_area_3",
      "dream_tree_boss"
    ],
    index: 2,
    nextStageId: "dream_tree_boss",
    saveStageId: "dream_tree",
    areaName: "エリア3",
    rankTimeS: 380,
    rankTimeA: 540,
    ending: true
  },
  areaRole: "area_3",
  areas: [
    {
      id: "area_3",
      name: "エリア3",
      startX: 0,
      endX: 2880,
      respawn: {
        x: 48,
        y: 264
      }
    }
  ]
};

export default stage;
