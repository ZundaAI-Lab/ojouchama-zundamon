/**
 * 責務: まよなか絵本館 ボスエリア：閉じられた物語の大広間 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "picturebook_library_boss",
  worldIndex: 4,
  name: "まよなか絵本館 ボスエリア：閉じられた物語の大広間",
  backgroundKey: "bg_picturebook_library",
  "bgm": "world5-midnight-story-hall",
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
    id: "count",
    name: "まよなか伯爵",
    imageKey: "boss_midnight_count",
    x: 624,
    y: 216,
    w: 72,
    h: 96,
    hp: 18
  },
  introDialogue: [],
  bossDialogue: [
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "……ここまで来たか、小さなお嬢さま。"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "ごきげんようなの。あなたが、この絵本館の主なの？"
    },
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "私は、忘れられた物語の番人。読まれなくなったページの声を聞く者だ。"
    },
    {
      portrait: "portrait_nano_surprise",
      speaker: "なのちゃん",
      text: "なのだ？"
    },
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "この館の物語たちは、もう誰にも開かれない。ならばせめて、私が夜の中で守る。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "守っているのは分かるの。でも、ずっと閉じたままだと、本も心も眠ったままになっちゃうの。"
    },
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "忘れられるさみしさは、甘い菓子でも紅茶でも埋められぬ。"
    },
    {
      portrait: "portrait_bashful",
      speaker: "お嬢ちゃまずんだもん",
      text: "全部は分からないかもしれないの。でもね、お話を聞くことはできるの。"
    },
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "ならば、その耳で受け止めてみせよ。忘れられたページたちの、夜の重さを！"
    },
    {
      portrait: "portrait_determined",
      speaker: "お嬢ちゃまずんだもん",
      text: "うん。ずんだもんは逃げないの。閉じたままのお話に、ちゃんと会いに行くの。"
    }
  ],
  bossDefeatDialogue: [
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "くっ……夜が、ほどけていく……。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "あなたは、本当は物語たちを守りたかったの。"
    },
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "守るつもりだった。だが……私自身も、さみしさに飲まれていたのか。"
    },
    {
      portrait: "portrait_nano_neutral",
      speaker: "なのちゃん",
      text: "なのだ……。"
    },
    {
      portrait: "portrait_bashful",
      speaker: "お嬢ちゃまずんだもん",
      text: "さみしい気持ちはね、誰かと分けると、少しやわらかくなるの。"
    },
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "この館を包んでいた夜は、私だけのものではなかった。もっと深い場所から、さみしさが流れ込んでいたのだ。"
    },
    {
      portrait: "portrait_surprise",
      speaker: "お嬢ちゃまずんだもん",
      text: "もっと深い場所……なの？"
    },
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "異変の中心は、この館ではない。夢みる豆の木だ。"
    },
    {
      portrait: "portrait_surprise",
      speaker: "お嬢ちゃまずんだもん",
      text: "夢みる豆の木も、ずっとがまんしていたの……。"
    },
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "その頂にいる守護者を救え。彼女は、誰よりもやさしいがゆえに、すべてのさみしさを抱え込んでいる。"
    },
    {
      portrait: "portrait_nano_laugh",
      speaker: "なのちゃん",
      text: "なのだ！"
    },
    {
      portrait: "portrait_determined",
      speaker: "お嬢ちゃまずんだもん",
      text: "分かったの。物語も、夢も、ひとりぼっちにはしないの。"
    }
  ],
  clearDialogue: [
    {
      portrait: "npc_cloud_librarian",
      speaker: "絵本館の司書",
      text: "ページの影たちが静かになりました。絵本館の奥の扉も開いております。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "ありがとうなの。次は、夢みる豆の木へ行くの。"
    },
    {
      portrait: "portrait_nano_smile",
      speaker: "なのちゃん",
      text: "なのだ！"
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
      x: 232,
      y: 280,
      w: 120,
      h: 16,
      kind: "page",
      phase: 0.1
    },
    {
      x: 496,
      y: 296,
      w: 112,
      h: 16,
      kind: "crumble"
    },
    {
      x: 744,
      y: 280,
      w: 120,
      h: 16,
      kind: "page",
      phase: 1.4
    }
  ],
  residents: [],
  items: [
    {
      x: 160,
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
    id: "picturebook_library",
    startStageId: "picturebook_library_area_1",
    stageIds: [
      "picturebook_library_area_1",
      "picturebook_library_area_2",
      "picturebook_library_area_3",
      "picturebook_library_boss"
    ],
    index: 3,
    nextStageId: null,
    saveStageId: "picturebook_library",
    areaName: "ボスエリア",
    rankTimeS: 350,
    rankTimeA: 500,
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
