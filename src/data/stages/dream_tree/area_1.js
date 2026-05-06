/**
 * 責務: 夢みる豆の木：根元の願い道 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "dream_tree_area_1",
  worldIndex: 5,
  name: "夢みる豆の木：根元の願い道",
  backgroundKey: "bg_dream_tree",
  "bgm": "world6-dreaming-beanstalk",
  width: 2800,
  height: 360,
  playerStart: {
    x: 48,
    y: 264
  },
  goal: {
    x: 2712,
    y: 240
  },
  boss: null,
  introDialogue: [
    {
      portrait: "npc_bean_gardener",
      speaker: "豆の庭師",
      text: "ずんだもんさま……ついに来てくださったのですね。"
    },
    {
      portrait: "portrait_surprise",
      speaker: "お嬢ちゃまずんだもん",
      text: "ごきげんようなの。夢みる豆の木の光が、こんなに小さくなっているの……。"
    },
    {
      portrait: "npc_bean_gardener",
      speaker: "豆の庭師",
      text: "この木は、王国中の願いを受け止めて育ちます。けれど今は、願いと一緒にさみしさまで集まりすぎてしまいました。"
    },
    {
      portrait: "portrait_nano_neutral",
      speaker: "なのちゃん",
      text: "なのだ……。"
    },
    {
      portrait: "npc_bean_gardener",
      speaker: "豆の庭師",
      text: "頂にいる守護者さまは、すべてをひとりで抱えこもうとされています。"
    },
    {
      portrait: "portrait_bashful",
      speaker: "お嬢ちゃまずんだもん",
      text: "やさしい子ほど、つらい気持ちを隠してしまうの。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "でも、願いもさみしさも、ひとりで全部持たなくていいの。"
    },
    {
      portrait: "portrait_determined",
      speaker: "お嬢ちゃまずんだもん",
      text: "ずんだもんが行くの。夢を閉じるためじゃなくて、もう一度ひらくために、守護者さんに会いに行くの。"
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
      portrait: "npc_bean_gardener",
      speaker: "豆の庭師",
      text: "願いの葉が、頂へ向かう道を示しています。どうかお気をつけて。"
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
      w: 104,
      h: 16,
      kind: "vine",
      active: false
    },
    {
      x: 560,
      y: 264,
      w: 104,
      h: 16
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
      w: 120,
      h: 16,
      kind: "jelly"
    },
    {
      x: 1200,
      y: 280,
      w: 88,
      h: 16,
      kind: "cloud"
    },
    {
      x: 1400,
      y: 320,
      w: 264,
      h: 32
    },
    {
      x: 1720,
      y: 288,
      w: 88,
      h: 16,
      kind: "crumble"
    },
    {
      x: 1880,
      y: 272,
      w: 88,
      h: 16,
      kind: "vine",
      active: false
    },
    {
      x: 2048,
      y: 320,
      w: 264,
      h: 32
    },
    {
      x: 2368,
      y: 320,
      w: 432,
      h: 32
    }
  ],
  residents: [
    {
      x: 784,
      y: 288,
      type: "shadowRabbit",
      minX: 730,
      maxX: 940
    },
    {
      x: 1072,
      y: 264,
      type: "jelly",
      minX: 1030,
      maxX: 1140
    },
    {
      x: 1448,
      y: 280,
      type: "toyKnight",
      minX: 1410,
      maxX: 1660
    },
    {
      x: 2088,
      y: 280,
      type: "mirrorGhost",
      minX: 2060,
      maxX: 2300
    }
  ],
  items: [
    {
      x: 424,
      y: 248,
      kind: "coin"
    },
    {
      x: 616,
      y: 224,
      kind: "scone"
    },
    {
      x: 1072,
      y: 248,
      kind: "coin"
    },
    {
      x: 1272,
      y: 224,
      kind: "teacup"
    },
    {
      x: 1768,
      y: 256,
      kind: "coin"
    },
    {
      x: 1920,
      y: 232,
      kind: "coin"
    },
    {
      x: 2144,
      y: 288,
      kind: "scone"
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
    id: "dream_tree",
    startStageId: "dream_tree_area_1",
    stageIds: [
      "dream_tree_area_1",
      "dream_tree_area_2",
      "dream_tree_area_3",
      "dream_tree_boss"
    ],
    index: 0,
    nextStageId: "dream_tree_area_2",
    saveStageId: "dream_tree",
    areaName: "エリア1",
    rankTimeS: 380,
    rankTimeA: 540,
    ending: true
  },
  areaRole: "area_1",
  areas: [
    {
      id: "area_1",
      name: "エリア1",
      startX: 0,
      endX: 2800,
      respawn: {
        x: 48,
        y: 264
      }
    }
  ]
};

export default stage;
