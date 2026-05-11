/**
 * 責務: ぬいぐるみ雲：ふわふわ空さんぽ のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "plush_cloud_area_1",
  worldIndex: 3,
  name: "ぬいぐるみ雲：ふわふわ空さんぽ",
  backgroundKey: "bg_plush_cloud",
  "bgm": "world4-plush-cloud-sky",
  width: 2580,
  height: 360,
  playerStart: {
    x: 48,
    y: 256
  },
  goal: {
    x: 2488,
    y: 232
  },
  boss: null,
  introDialogue: [
    {
      portrait: "npc_teacup_fairy",
      speaker: "ティーカップ妖精",
      text: "お嬢ちゃまー！ こっちこっち！"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "ごきげんようなの。空の上なのに、紅茶の香りがするの。不思議なの。"
    },
    {
      portrait: "npc_teacup_fairy",
      speaker: "ティーカップ妖精",
      text: "夢みる豆の木の光が弱くなってから、雲たちが夢見ごこちでふわふわしすぎてるの！"
    },
    {
      portrait: "npc_teacup_fairy",
      speaker: "ティーカップ妖精",
      text: "空じゅうに眠りの魔法が広がって、みんな途中でうとうとしちゃうんだ。"
    },
    {
      portrait: "portrait_bashful",
      speaker: "お嬢ちゃまずんだもん",
      text: "眠りの魔法なの……。安心できるふかふかから、出られなくなっている子がいるのかもしれないの。"
    },
    {
      portrait: "npc_teacup_fairy",
      speaker: "ティーカップ妖精",
      text: "空の奥で、大きなぬいぐるみドラゴンが雲を抱えて眠ってるの。そのせいで、道がふさがっちゃってるんだ。"
    },
    {
      portrait: "portrait_determined",
      speaker: "お嬢ちゃまずんだもん",
      text: "それじゃあ、びっくりさせないように行くの。眠っている子には、やさしい声で話しかけるの。"
    },
    {
      portrait: "portrait_nano_laugh",
      speaker: "なのちゃん",
      text: "なのだ！"
    }
  ],
  bossDialogue: [],
  bossDefeatDialogue: [],
  clearDialogue: [],
  areaClearDialogue: [
    {
      portrait: "npc_teacup_fairy",
      speaker: "ティーカップ妖精",
      text: "雲の先は、もっと眠そうだよ。そーっと行こう！"
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
      x: 312,
      y: 288,
      w: 88,
      h: 16,
      kind: "cloud"
    },
    {
      x: 472,
      y: 256,
      w: 88,
      h: 16,
      kind: "cloud"
    },
    {
      x: 632,
      y: 296,
      w: 144,
      h: 16,
      kind: "jelly"
    },
    {
      x: 840,
      y: 320,
      w: 224,
      h: 32
    },
    {
      x: 1120,
      y: 280,
      w: 104,
      h: 16,
      kind: "cloud"
    },
    {
      x: 1304,
      y: 256,
      w: 88,
      h: 16,
      kind: "cloud"
    },
    {
      x: 1480,
      y: 296,
      w: 120,
      h: 16,
      kind: "vine",
      active: false
    },
    {
      x: 1704,
      y: 320,
      w: 224,
      h: 32
    },
    {
      x: 2000,
      y: 296,
      w: 112,
      h: 16,
      kind: "cloud"
    },
    {
      x: 2200,
      y: 320,
      w: 384,
      h: 32
    }
  ],
  residents: [
    {
      x: 880,
      y: 296,
      type: "cloud",
      minX: 840,
      maxX: 1040
    },
    {
      x: 1192,
      y: 256,
      type: "cloud",
      minX: 1120,
      maxX: 1220
    },
    {
      x: 1744,
      y: 288,
      type: "bat",
      minX: 1700,
      maxX: 1910
    },
    {
      x: 2072,
      y: 272,
      type: "cloud",
      minX: 2030,
      maxX: 2110
    }
  ],
  items: [
    {
      x: 328,
      y: 256,
      kind: "coin"
    },
    {
      x: 504,
      y: 224,
      kind: "coin"
    },
    {
      x: 688,
      y: 256,
      kind: "zundamochi"
    },
    {
      x: 1168,
      y: 240,
      kind: "coin"
    },
    {
      x: 1344,
      y: 216,
      kind: "teacup"
    },
    {
      x: 1536,
      y: 256,
      kind: "coin"
    },
    {
      x: 2064,
      y: 256,
      kind: "coin"
    },
    {
      x: 2112,
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
    index: 0,
    nextStageId: "plush_cloud_area_2",
    saveStageId: "plush_cloud",
    areaName: "エリア1",
    rankTimeS: 330,
    rankTimeA: 470,
    ending: false
  },
  areaRole: "area_1",
  areas: [
    {
      id: "area_1",
      name: "エリア1",
      startX: 0,
      endX: 2580,
      respawn: {
        x: 48,
        y: 256
      }
    }
  ]
};

export default stage;
