/**
 * 責務: ティーカップ城 ボスエリア：紅茶の円舞台 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "teacup_castle_boss",
  worldIndex: 1,
  name: "ティーカップ城 ボスエリア：紅茶の円舞台",
  backgroundKey: "bg_teacup_castle",
  "bgm": "world2-teacup-castle",
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
    id: "teapot",
    name: "ぐるぐるポット伯爵代理",
    imageKey: "boss_teapot_earl",
    x: 624,
    y: 232,
    w: 72,
    h: 72,
    hp: 13,
    bowShieldRequired: true
  },
  introDialogue: [],
  bossDialogue: [
    {
      portrait: "boss_teapot_earl",
      speaker: "ぐるぐるポット伯爵代理",
      text: "止まれい！ この先は格式ある者のみ通行を許す！"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "ごきげんようなの。ずんだもんは、お茶会に向かう途中なの。"
    },
    {
      portrait: "boss_teapot_earl",
      speaker: "ぐるぐるポット伯爵代理",
      text: "ならばまず礼を示せ！角度、間、手の位置、すべて完璧でなければ無礼である！"
    },
    {
      portrait: "portrait_nano_surprise",
      speaker: "なのちゃん",
      text: "なのだ！"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "形も大切なの。でも、いちばん大切なのは、相手を思う気持ちなの。"
    },
    {
      portrait: "boss_teapot_earl",
      speaker: "ぐるぐるポット伯爵代理",
      text: "気持ちなど見えぬ！ 見えるのは角度と作法のみ！"
    },
    {
      portrait: "portrait_determined",
      speaker: "お嬢ちゃまずんだもん",
      text: "見えなくても、伝わるものはあるの。やさしいごあいさつは、心から始まるの。"
    },
    {
      portrait: "boss_teapot_earl",
      speaker: "ぐるぐるポット伯爵代理",
      text: "ならば見せてみよ！ このぐるぐる作法試験、受けきれるものならな！"
    },
    {
      portrait: "portrait_proud",
      speaker: "お嬢ちゃまずんだもん",
      text: "うん。ずんだもんのおじぎ、心をこめて届けるの。"
    }
  ],
  bossDefeatDialogue: [
    {
      portrait: "boss_teapot_earl",
      speaker: "ぐるぐるポット伯爵代理",
      text: "むむ……なんという穏やかなおじぎ……。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "おじぎはね、心を小さなお花みたいに差し出すことなの。"
    },
    {
      portrait: "boss_teapot_earl",
      speaker: "ぐるぐるポット伯爵代理",
      text: "私は……礼儀を守るつもりで、皆を遠ざけていたのか。"
    },
    {
      portrait: "portrait_nano_neutral",
      speaker: "なのちゃん",
      text: "なのだ。"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "守るだけじゃなくて、迎える気持ちも大切なの。"
    },
    {
      portrait: "boss_teapot_earl",
      speaker: "ぐるぐるポット伯爵代理",
      text: "なるほど……礼とは、門を閉ざすためではなく、客人を迎えるためのもの。"
    },
    {
      portrait: "boss_teapot_earl",
      speaker: "ぐるぐるポット伯爵代理",
      text: "失礼いたしました。どうぞお通りくださいませ。心より、歓迎いたします。"
    }
  ],
  clearDialogue: [
    {
      portrait: "npc_lamb_butler",
      speaker: "ひつじ執事",
      text: "うさぎのリボン庭園へ続く扉が開きました！ ティーカップたちも静けさを取り戻しております！"
    },
    {
      portrait: "boss_teapot_earl",
      speaker: "ぐるぐるポット伯爵代理",
      text: "ずんだもん殿。どうか、この城の客人としてリボンの庭へお進みください。"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "ありがとうなの。今日のティーカップ城は、やさしい音で回っているの。"
    }
  ],
  areaClearDialogue: [],
  platforms: [
    {
      x: 0,
      y: 320,
      w: 984,
      h: 32
    },
    {
      x: 248,
      y: 280,
      w: 120,
      h: 16,
      kind: "teacupSpin"
    },
    {
      x: 456,
      y: 296,
      w: 104,
      h: 16,
      kind: "spoon"
    },
    {
      x: 728,
      y: 280,
      w: 120,
      h: 16,
      kind: "teacupSpin"
    }
  ],
  residents: [],
  items: [
    {
      x: 160,
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
    id: "teacup_castle",
    startStageId: "teacup_castle_area_1",
    stageIds: [
      "teacup_castle_area_1",
      "teacup_castle_area_2",
      "teacup_castle_area_3",
      "teacup_castle_boss"
    ],
    index: 3,
    nextStageId: null,
    saveStageId: "teacup_castle",
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
