/**
 * 責務: まよなか絵本館：めくれるページの廊下 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "picturebook_library_area_2",
  worldIndex: 4,
  name: "まよなか絵本館：めくれるページの廊下",
  backgroundKey: "bg_picturebook_library",
  "bgm": "world5-midnight-story-hall",
  width: 2440,
  height: 360,
  playerStart: {
    x: 48,
    y: 264
  },
  goal: {
    x: 2352,
    y: 240
  },
  boss: null,
  introDialogue: [],
  bossDialogue: [],
  bossDefeatDialogue: [],
  clearDialogue: [],
  areaClearDialogue: [
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "ページは、待っていればちゃんと開くの。次は暗い書庫に明かりを灯すの。"
    }
  ],
  platforms: [
    {
      x: 0,
      y: 320,
      w: 304,
      h: 32
    },
    {
      x: 368,
      y: 288,
      w: 112,
      h: 16,
      kind: "page",
      phase: 0.1
    },
    {
      x: 552,
      y: 264,
      w: 112,
      h: 16,
      kind: "page",
      phase: 1.2
    },
    {
      x: 744,
      y: 320,
      w: 232,
      h: 32
    },
    {
      x: 1048,
      y: 288,
      w: 112,
      h: 16,
      kind: "page",
      phase: 0.4
    },
    {
      x: 1224,
      y: 320,
      w: 240,
      h: 32
    },
    {
      x: 1544,
      y: 280,
      w: 112,
      h: 16,
      kind: "crumble"
    },
    {
      x: 1712,
      y: 256,
      w: 104,
      h: 16,
      kind: "page",
      phase: 1.8
    },
    {
      x: 1904,
      y: 320,
      w: 248,
      h: 32
    },
    {
      x: 2264,
      y: 320,
      w: 184,
      h: 32
    }
  ],
  residents: [
    {
      x: 784,
      y: 288,
      type: "pageWisp",
      minX: 740,
      maxX: 960
    },
    {
      x: 1280,
      y: 280,
      type: "shadowRabbit",
      minX: 1220,
      maxX: 1450
    },
    {
      x: 1952,
      y: 280,
      type: "pageWisp",
      minX: 1900,
      maxX: 2140
    }
  ],
  items: [
    {
      x: 408,
      y: 248,
      kind: "coin"
    },
    {
      x: 592,
      y: 224,
      kind: "teacup"
    },
    {
      x: 1104,
      y: 248,
      kind: "scone"
    },
    {
      x: 1584,
      y: 240,
      kind: "coin"
    },
    {
      x: 1760,
      y: 224,
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
    id: "picturebook_library",
    startStageId: "picturebook_library_area_1",
    stageIds: [
      "picturebook_library_area_1",
      "picturebook_library_area_2",
      "picturebook_library_area_3",
      "picturebook_library_boss"
    ],
    index: 1,
    nextStageId: "picturebook_library_area_3",
    saveStageId: "picturebook_library",
    areaName: "エリア2",
    rankTimeS: 350,
    rankTimeA: 500,
    ending: false
  },
  areaRole: "area_2",
  areas: [
    {
      id: "area_2",
      name: "エリア2",
      startX: 0,
      endX: 2440,
      respawn: {
        x: 48,
        y: 264
      }
    }
  ]
};

export default stage;
