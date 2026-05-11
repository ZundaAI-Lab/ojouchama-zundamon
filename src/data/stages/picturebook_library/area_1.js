/**
 * 責務: まよなか絵本館：静かな入口ホール のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "picturebook_library_area_1",
  worldIndex: 4,
  name: "まよなか絵本館：静かな入口ホール",
  backgroundKey: "bg_picturebook_library",
  "bgm": "world5-midnight-story-hall",
  width: 2660,
  height: 360,
  playerStart: {
    x: 48,
    y: 264
  },
  goal: {
    x: 2568,
    y: 240
  },
  boss: null,
  introDialogue: [
    {
      portrait: "npc_cloud_librarian",
      speaker: "絵本館の司書",
      text: "ようこそ、まよなか絵本館へ。"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "ごきげんようなの。ここは静かな場所なの。でも、本たちが小さな声でおしゃべりしている気がするの。"
    },
    {
      portrait: "npc_cloud_librarian",
      speaker: "絵本館の司書",
      text: "ここには、読まれなくなった絵本や、眠ったままの物語が集まっています。"
    },
    {
      portrait: "npc_cloud_librarian",
      speaker: "絵本館の司書",
      text: "物語たちは、続きを待つうちに少しさみしくなって……そのさみしさが、影の子たちの姿になってしまったのです。"
    },
    {
      portrait: "portrait_nano_neutral",
      speaker: "なのちゃん",
      text: "なのだ……。"
    },
    {
      portrait: "npc_cloud_librarian",
      speaker: "絵本館の司書",
      text: "どうか、影の子たちを怖がらないでください。彼らは悪い子ではありません。ただ、誰かに読んでほしいだけなのです。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "読まれない物語は、ひとりぼっちで夜を待っていたのね。"
    },
    {
      portrait: "portrait_determined",
      speaker: "お嬢ちゃまずんだもん",
      text: "うん。ずんだもんは、こわがらせに来たんじゃないの。続きを聞きに来たの。"
    }
  ],
  bossDialogue: [],
  bossDefeatDialogue: [],
  clearDialogue: [],
  areaClearDialogue: [
    {
      portrait: "npc_cloud_librarian",
      speaker: "絵本館の司書",
      text: "奥のページが開きました。めくれる床にお気をつけください。"
    }
  ],
  platforms: [
    {
      x: 0,
      y: 320,
      w: 328,
      h: 32
    },
    {
      x: 392,
      y: 288,
      w: 104,
      h: 16
    },
    {
      x: 560,
      y: 264,
      w: 104,
      h: 16,
      kind: "crumble"
    },
    {
      x: 728,
      y: 320,
      w: 224,
      h: 32
    },
    {
      x: 1024,
      y: 288,
      w: 104,
      h: 16
    },
    {
      x: 1184,
      y: 320,
      w: 272,
      h: 32
    },
    {
      x: 1504,
      y: 280,
      w: 96,
      h: 16,
      kind: "vine",
      active: false
    },
    {
      x: 1664,
      y: 320,
      w: 240,
      h: 32
    },
    {
      x: 1968,
      y: 288,
      w: 120,
      h: 16
    },
    {
      x: 2168,
      y: 320,
      w: 488,
      h: 32
    }
  ],
  residents: [
    {
      x: 224,
      y: 288,
      type: "shadowRabbit",
      minX: 120,
      maxX: 320
    },
    {
      x: 800,
      y: 288,
      type: "pageWisp",
      minX: 750,
      maxX: 940
    },
    {
      x: 1232,
      y: 280,
      type: "mirrorGhost",
      minX: 1180,
      maxX: 1440
    },
    {
      x: 1720,
      y: 280,
      type: "toyKnight",
      minX: 1670,
      maxX: 1900
    },
    {
      x: 2048,
      y: 264,
      type: "pageWisp",
      minX: 1970,
      maxX: 2100
    }
  ],
  items: [
    {
      x: 424,
      y: 248,
      kind: "coin"
    },
    {
      x: 608,
      y: 232,
      kind: "teacup"
    },
    {
      x: 1080,
      y: 248,
      kind: "zundamochi"
    },
    {
      x: 1552,
      y: 240,
      kind: "coin"
    },
    {
      x: 1744,
      y: 288,
      kind: "coin"
    },
    {
      x: 2024,
      y: 256,
      kind: "coin"
    },
    {
      x: 2080,
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
    { id: 'bow_door_1', groupId: '', x: 1368, y: 232, w: 64, h: 80, openCondition: 'bow', imageKey: 'door_bow', bowRange: 96 },
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
    index: 0,
    nextStageId: "picturebook_library_area_2",
    saveStageId: "picturebook_library",
    areaName: "エリア1",
    rankTimeS: 350,
    rankTimeA: 500,
    ending: false
  },
  areaRole: "area_1",
  areas: [
    {
      id: "area_1",
      name: "エリア1",
      startX: 0,
      endX: 2660,
      respawn: {
        x: 48,
        y: 264
      }
    }
  ]
};

export default stage;
