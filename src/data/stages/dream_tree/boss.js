/**
 * 責務: 夢みる豆の木 ボスエリア：夢冠の頂 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  id: "dream_tree_boss",
  worldIndex: 5,
  name: "夢みる豆の木 ボスエリア：夢冠の頂",
  backgroundKey: "bg_dream_tree",
  "bgm": "world6-dreaming-beanstalk",
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
    id: "final",
    name: "夢冠の守護天使",
    imageKey: "boss_final_count",
    x: 608,
    y: 208,
    w: 80,
    h: 104,
    hp: 24,
    final: true
  },
  introDialogue: [],
  bossDialogue: [
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "……こちらへ来てはいけません。"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "ごきげんようなの。あなたが、夢みる豆の木を守っている子なの？"
    },
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "王国の夢は、これ以上傷ついてはいけないのです。悲しみも、さみしさも、争いも……すべて眠らせます。"
    },
    {
      portrait: "portrait_nano_surprise",
      speaker: "なのちゃん",
      text: "なのだ……？"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "あなたは、みんなを守りたいのね。"
    },
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "守らなければならないのです。もう誰も悲しみで夢をなくさないように。すべてを静かな眠りで包むしかないのです。"
    },
    {
      portrait: "portrait_bashful",
      speaker: "お嬢ちゃまずんだもん",
      text: "泣かない世界は、静かかもしれないの。でも、笑う声まで眠ってしまうの。"
    },
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "笑う声……。でも、悲しみを残せば、また誰かが泣いてしまいます。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "悲しみは、ひとりで抱えると重くなるの。でも、誰かと分け合えば、少しずつほどけていくの。"
    },
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "分け合う……？ この重さを……？"
    },
    {
      portrait: "portrait_determined",
      speaker: "お嬢ちゃまずんだもん",
      text: "ひとりで全部持たなくていいの。ずんだもんも、なのちゃんも、みんなもいるの。"
    },
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "ならば示してください。夢を閉じずに、悲しみをほどく力を。"
    },
    {
      portrait: "portrait_proud",
      speaker: "お嬢ちゃまずんだもん",
      text: "分かったの。ずんだもんは、あなたの夢を聞きに来たの。"
    },
    {
      portrait: "portrait_nano_laugh",
      speaker: "なのちゃん",
      text: "なのだ！"
    }
  ],
  bossDefeatDialogue: [
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "光が……戻っていく……。"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "夢みる豆の木が、また息をしているの。葉っぱも、光も、うれしそうなの。"
    },
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "私は……守りたかっただけなのです。誰にもさみしい思いをしてほしくなくて……。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "うん。その気持ちは、とてもやさしいの。でも、やさしい気持ちも、ひとりで抱えると重くなってしまうの。"
    },
    {
      portrait: "portrait_nano_neutral",
      speaker: "なのちゃん",
      text: "なのだ。"
    },
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "私も……誰かに頼ってよかったのでしょうか。"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "もちろんよかったの。悲しい気持ちも、守りたい夢も、みんなで少しずつ分け合えばいいの。"
    },
    {
      portrait: "portrait_gentle",
      speaker: "お嬢ちゃまずんだもん",
      text: "お茶会みたいに、みんなでカップを並べれば、ひとりで持つ重さじゃなくなるの。"
    },
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "……そうですね。夢は、閉じ込めて守るものではなく、みんなであたためていくものなのですね。"
    },
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "ありがとう、夢をひらくお嬢さま。ありがとう、小さな妖精さん。"
    },
    {
      portrait: "portrait_nano_laugh",
      speaker: "なのちゃん",
      text: "なのだ！"
    }
  ],
  clearDialogue: [
    {
      portrait: "npc_bean_gardener",
      speaker: "豆の庭師",
      text: "夢みる豆の木が満開です！ 王国に光が戻りました！"
    },
    {
      portrait: "boss_final_count",
      speaker: "夢冠の守護天使",
      text: "夢は、もう静かな眠りの中だけに閉じこもってはいません。みんなの声に包まれて、あたたかく輝いています。"
    },
    {
      portrait: "boss_midnight_count",
      speaker: "まよなか伯爵",
      text: "忘れられた物語にも、朝が来たようだな。"
    },
    {
      portrait: "boss_moon_seamstress",
      speaker: "宵結びの淑女",
      text: "遅れて来る方の席も、ちゃんと空けておきましたわ。今度は、ゆるやかに。"
    },
    {
      portrait: "boss_cupcake_queen",
      speaker: "カップケーキ",
      text: "みんなで食べるお菓子、用意したよ！ ひとりじめより、ずっと甘いんだね！"
    },
    {
      portrait: "boss_teapot_earl",
      speaker: "ぐるぐるポット伯爵代理",
      text: "礼を尽くして、祝宴を開こう。もちろん、心をこめてな。"
    },
    {
      portrait: "boss_plush_dragon",
      speaker: "ねむねむドラゴンぬい",
      text: "ぼく、起きてるよ……たぶん……お茶会のあいだは……。"
    },
    {
      portrait: "portrait_proud",
      speaker: "お嬢ちゃまずんだもん",
      text: "ふふっ、みんなそろったの。今日は王国ぜんぶでお茶会なの。"
    },
    {
      portrait: "portrait_nano_laugh",
      speaker: "なのちゃん",
      text: "なのだ！"
    },
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "それじゃあ、ごきげんようなの。夢とずんだの、お茶会を始めるの！"
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
      x: 224,
      y: 280,
      w: 120,
      h: 16,
      kind: "wishLeaf",
      active: false
    },
    {
      x: 472,
      y: 296,
      w: 112,
      h: 16,
      kind: "page",
      phase: 0.6
    },
    {
      x: 720,
      y: 280,
      w: 120,
      h: 16,
      kind: "sleepCloud"
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
    id: "dream_tree",
    startStageId: "dream_tree_area_1",
    stageIds: [
      "dream_tree_area_1",
      "dream_tree_area_2",
      "dream_tree_area_3",
      "dream_tree_boss"
    ],
    index: 3,
    nextStageId: null,
    saveStageId: "dream_tree",
    areaName: "ボスエリア",
    rankTimeS: 380,
    rankTimeA: 540,
    ending: true
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
