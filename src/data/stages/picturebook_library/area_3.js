/**
 * 責務: まよなか絵本館：影絵の迷い書庫 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "picturebook_library_area_3",
  worldIndex: 4,
  name: "まよなか絵本館：影絵の迷い書庫",
  backgroundKey: "bg_picturebook_library",
  "bgm": "world5-midnight-story-hall",
  width: 2600,
  height: 360,
  playerStart: {
    x: 48,
    y: 264
  },
  goal: {
    x: 2512,
    y: 240
  },
  boss: null,
  introDialogue: [],
  bossDialogue: [],
  bossDefeatDialogue: [],
  clearDialogue: [],
  areaClearDialogue: [
    {
      portrait: "npc_cloud_librarian",
      speaker: "絵本館の司書",
      text: "閉じた物語の大広間が開きました。伯爵さまの声を聞いてあげてください。"
    }
  ],
  platforms: [
    {
      x: 0,
      y: 320,
      w: 312,
      h: 32
    },
    {
      x: 384,
      y: 288,
      w: 112,
      h: 16,
      kind: "page",
      phase: 0.3
    },
    {
      x: 560,
      y: 264,
      w: 104,
      h: 16,
      kind: "vine",
      active: false
    },
    {
      x: 752,
      y: 320,
      w: 232,
      h: 32
    },
    {
      x: 1064,
      y: 288,
      w: 112,
      h: 16,
      kind: "page",
      phase: 1.5
    },
    {
      x: 1240,
      y: 320,
      w: 224,
      h: 32
    },
    {
      x: 1544,
      y: 280,
      w: 112,
      h: 16,
      kind: "page",
      phase: 0.8
    },
    {
      x: 1720,
      y: 256,
      w: 96,
      h: 16,
      kind: "crumble"
    },
    {
      x: 1904,
      y: 320,
      w: 248,
      h: 32
    },
    {
      x: 2240,
      y: 288,
      w: 112,
      h: 16,
      kind: "page",
      phase: 2.2
    },
    {
      x: 2424,
      y: 320,
      w: 184,
      h: 32
    }
  ],
  residents: [
    {
      x: 792,
      y: 288,
      type: "mirrorGhost",
      minX: 750,
      maxX: 970
    },
    {
      x: 1280,
      y: 280,
      type: "toyKnight",
      minX: 1240,
      maxX: 1450
    },
    {
      x: 1944,
      y: 280,
      type: "shadowRabbit",
      minX: 1900,
      maxX: 2140
    },
    {
      x: 2280,
      y: 264,
      type: "pageWisp",
      minX: 2240,
      maxX: 2360
    }
  ],
  items: [
    {
      x: 424,
      y: 248,
      kind: "coin"
    },
    {
      x: 600,
      y: 224,
      kind: "teacup"
    },
    {
      x: 1104,
      y: 256,
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
    },
    {
      x: 2280,
      y: 248,
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
    { id: 'bow_door_1', groupId: '', x: 1392, y: 232, w: 64, h: 80, openCondition: 'bow', imageKey: 'door_bow', bowRange: 96 },
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
    index: 2,
    nextStageId: "picturebook_library_boss",
    saveStageId: "picturebook_library",
    areaName: "エリア3",
    rankTimeS: 350,
    rankTimeA: 500,
    ending: false
  },
  areaRole: "area_3",
  areas: [
    {
      id: "area_3",
      name: "エリア3",
      startX: 0,
      endX: 2600,
      respawn: {
        x: 48,
        y: 264
      }
    }
  ]
};

export default stage;
