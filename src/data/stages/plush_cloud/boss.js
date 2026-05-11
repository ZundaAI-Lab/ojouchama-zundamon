/**
 * 責務: ぬいぐるみ雲 ボスエリア：ふかふかおふとん雲 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "plush_cloud_boss",
  worldIndex: 3,
  name: "ぬいぐるみ雲 ボスエリア：ふかふかおふとん雲",
  backgroundKey: "bg_plush_cloud",
  "bgm": "world4-plush-cloud-sky",
  width: 980,
  height: 360,
  playerStart: {
    x: 48,
    y: 264
  },
  goal: {
    x: 888,
    y: 240
  },
  boss: {
    id: "dragon",
    name: "ねむねむドラゴンぬい",
    imageKey: "boss_plush_dragon",
    x: 616,
    y: 240,
    w: 80,
    h: 64,
    hp: 14
  },
  introDialogue: [],
  bossDialogue: [
    {
      portrait: "boss_plush_dragon",
      speaker: "ねむねむドラゴンぬい",
      text: "ぐう……ここは……ぼくのおふとん……。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "ごきげんようなの。起こしちゃったなら、ごめんなの。"
    },
    {
      portrait: "boss_plush_dragon",
      speaker: "ねむねむドラゴンぬい",
      text: "だめ……どかない……この雲、ふかふかで安心するから……。"
    },
    {
      portrait: "portrait_nano_neutral",
      speaker: "なのちゃん",
      text: "なのだ……。"
    },
    {
      portrait: "portrait_bashful",
      speaker: "お嬢ちゃまずんだもん",
      text: "みんなの道も、あなたのおふとんも、どっちも大切なの。"
    },
    {
      portrait: "boss_plush_dragon",
      speaker: "ねむねむドラゴンぬい",
      text: "やだ……雲をはなしたら、またこわい夢が来ちゃう……。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "こわい夢から隠れていたのね。大丈夫なの、ひとりで抱えこまなくてもいいの。"
    },
    {
      portrait: "boss_plush_dragon",
      speaker: "ねむねむドラゴンぬい",
      text: "うう……夢が、ぐるぐるして……止まらない……！"
    },
    {
      portrait: "portrait_determined",
      speaker: "お嬢ちゃまずんだもん",
      text: "それなら、ずんだもんがそばにいるの。こわい夢を、やさしい夢に変えてみせるの。"
    }
  ],
  bossDefeatDialogue: [
    {
      portrait: "boss_plush_dragon",
      speaker: "ねむねむドラゴンぬい",
      text: "ふわぁ……あれ？ 空が明るい……。"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "おはようなの。よく眠れたの？"
    },
    {
      portrait: "boss_plush_dragon",
      speaker: "ねむねむドラゴンぬい",
      text: "うん……こわい夢が小さくなった。もう、雲をぎゅっと抱えこまなくても大丈夫かも。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "こわい夢はね、誰かと分けると少し軽くなるの。"
    },
    {
      portrait: "boss_plush_dragon",
      speaker: "ねむねむドラゴンぬい",
      text: "じゃあ……またこわい夢を見たら、話してもいい？"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "もちろん、いつでも聞くの。"
    },
    {
      portrait: "boss_plush_dragon",
      speaker: "ねむねむドラゴンぬい",
      text: "ありがとう。ぼく、端っこの雲でお昼寝するね。道はもう、ふさがないよ。"
    },
    {
      portrait: "portrait_nano_laugh",
      speaker: "なのちゃん",
      text: "なのだ！"
    }
  ],
  clearDialogue: [
    {
      portrait: "npc_teacup_fairy",
      speaker: "ティーカップ妖精",
      text: "お嬢ちゃま、雲の向こうに次の光が見えるよ！"
    },
    {
      portrait: "portrait_proud",
      speaker: "お嬢ちゃまずんだもん",
      text: "また遊びに行くの。お茶と毛布と、ずんだ餅を持ってくるの。"
    },
    {
      portrait: "npc_teacup_fairy",
      speaker: "ティーカップ妖精",
      text: "約束だよ！ ぬいぐるみ雲の空で待ってるね！"
    }
  ],
  areaClearDialogue: [],
  platforms: [
    {
      x: 0,
      y: 320,
      w: 984,
      h: 32,
      kind: "cloud"
    },
    {
      x: 248,
      y: 280,
      w: 112,
      h: 16,
      kind: "sleepCloud"
    },
    {
      x: 504,
      y: 288,
      w: 120,
      h: 16,
      kind: "cloud"
    },
    {
      x: 736,
      y: 280,
      w: 112,
      h: 16,
      kind: "sleepCloud"
    }
  ],
  residents: [],
  items: [
    {
      x: 168,
      y: 288,
      kind: "zundamochi"
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
    index: 3,
    nextStageId: null,
    saveStageId: "plush_cloud",
    areaName: "ボスエリア",
    rankTimeS: 330,
    rankTimeA: 470,
    ending: false
  },
  areaRole: "boss",
  areas: [
    {
      id: "boss",
      name: "ボスエリア",
      startX: 0,
      endX: 980,
      respawn: {
        x: 48,
        y: 264
      }
    }
  ]
};

export default stage;
