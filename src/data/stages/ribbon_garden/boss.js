/**
 * 責務: リボン庭園 ボスエリア：月綴じの円庭 のステージデータを定義する。
 * 更新ルール: 3面ボスは通常住民リボンウィスプとは別個体として扱い、行動パターン変更はactors/boss側に分離する。
 */
const stage = {
  "id": "ribbon_garden_boss",
  "worldIndex": 2,
  "name": "リボン庭園 ボスエリア：月綴じの円庭",
  "backgroundKey": "bg_ribbon_garden",
  "bgm": "world3-ribbon-garden",
  "width": 1080,
  "height": 360,
  "playerStart": {
    "x": 48,
    "y": 264
  },
  "goal": {
    "x": 984,
    "y": 240
  },
  "boss": {
    "id": "moon_seamstress",
    "name": "宵結びの淑女",
    "imageKey": "boss_moon_seamstress",
    "x": 648,
    "y": 224,
    "w": 72,
    "h": 80,
    "hp": 13
  },
  "introDialogue": [],
  "bossDialogue": [
    {
      "portrait": "boss_moon_seamstress",
      "speaker": "宵結びの淑女",
      "text": "道は、ちゃんと結んでおかなくてはなりませんわ。どなたかが迷ってしまったら、お茶会の場所までたどり着けませんもの。"
    },
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "ごきげんようなの。みんなが迷わないようにしてくれているのね。とてもやさしいの。"
    },
    {
      "portrait": "boss_moon_seamstress",
      "speaker": "宵結びの淑女",
      "text": "でも、やさしいだけではだめですの。もう誰も迷わないように、強く、しっかり結んでおかなければ。"
    },
    {
      "portrait": "portrait_nano_neutral",
      "speaker": "なのちゃん",
      "text": "なのだ……。"
    },
    {
      "portrait": "boss_moon_seamstress",
      "speaker": "宵結びの淑女",
      "text": "また誰かが遅れてしまったら……空っぽの席だけが残って、とても寂しいでしょう？"
    },
    {
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "遅れた人を待つことは、ひとりぼっちにすることじゃないの。その人の席を、ちゃんと空けておくことなの。"
    },
    {
      "portrait": "boss_moon_seamstress",
      "speaker": "宵結びの淑女",
      "text": "……それなら、この庭を通ってみせなさいな。きつく結んだ道を、あなたに進めるかしら。"
    },
    {
      "portrait": "portrait_determined",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "うん。きつく結ぶんじゃなくて、みんなが通れるように、やさしく結び直してみせるの。"
    }
  ],
  "bossDefeatDialogue": [
    {
      "portrait": "boss_moon_seamstress",
      "speaker": "宵結びの淑女",
      "text": "……わたくし、強く結びすぎていたのですね。ほどけてしまうのが、怖かったのです。"
    },
    {
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "うん。でも、ほどけても大丈夫なの。また結び直せば、みんなで前に進めるの。"
    },
    {
      "portrait": "boss_moon_seamstress",
      "speaker": "宵結びの淑女",
      "text": "遅れて来る方のために、通れる道を残しておけばよかったのですね。急がせてばかりでは、お茶会は楽しくありませんもの。"
    },
    {
      "portrait": "portrait_nano_laugh",
      "speaker": "なのちゃん",
      "text": "なのだ！"
    },
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "そうなの。みんなで歩ける道の方が、お茶もお菓子も、きっとずっとおいしいの。"
    }
  ],
  "clearDialogue": [
    {
      "portrait": "boss_moon_seamstress",
      "speaker": "宵結びの淑女",
      "text": "ふわふわ雲の空へ続く道を、わたくしが整えておきましたわ。今度は、みなさまを急がせるためではなく、安心して進めるように。"
    },
    {
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "ありがとうなの。やさしく作られた道なら、きっとみんな安心して歩けるの。"
    },
    {
      "portrait": "boss_moon_seamstress",
      "speaker": "宵結びの淑女",
      "text": "でも、雲の上では風が気まぐれですの。速い雲に乗ると、ゆっくり進む人を見失ってしまうかもしれません。"
    },
    {
      "portrait": "portrait_nano_neutral",
      "speaker": "なのちゃん",
      "text": "なのだ……。"
    },
    {
      "portrait": "boss_moon_seamstress",
      "speaker": "宵結びの淑女",
      "text": "どうかその先でも、遅れている人を待つやさしさを忘れないでくださいまし。"
    },
    {
      "portrait": "portrait_determined",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "うん。ずんだもんは、みんなで進める速さを忘れないの。次は、雲の上をあわてずに進んでいくの。"
    }
  ],
  "areaClearDialogue": [],
  "platforms": [
    {
      "x": 0,
      "y": 320,
      "w": 1080,
      "h": 32
    },
    {
      "x": 208,
      "y": 280,
      "w": 120,
      "h": 16,
      "kind": "waitFlower"
    },
    {
      "x": 424,
      "y": 272,
      "w": 112,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "boss_a"
    },
    {
      "x": 800,
      "y": 288,
      "w": 120,
      "h": 16,
      "kind": "ribbonWind",
      "windDir": -1
    }
  ],
  "residents": [],
  "items": [
    {
      "x": 160,
      "y": 288,
      "kind": "scone"
    },
    {
      "x": 448,
      "y": 232,
      "kind": "teacup"
    }
  ],
  "decorations": [
    {
      "x": 120,
      "y": 152,
      "r": 8,
      "color": "rgba(255,214,235,0.30)"
    },
    {
      "x": 432,
      "y": 136,
      "r": 6,
      "color": "rgba(255,246,181,0.34)"
    },
    {
      "x": 864,
      "y": 160,
      "r": 7,
      "color": "rgba(255,255,255,0.24)"
    },
    {
      "x": 1344,
      "y": 144,
      "r": 9,
      "color": "rgba(255,196,224,0.26)"
    },
    {
      "x": 1880,
      "y": 176,
      "r": 8,
      "color": "rgba(255,246,181,0.28)"
    },
    {
      "x": 2264,
      "y": 152,
      "r": 7,
      "color": "rgba(255,255,255,0.24)"
    }
  ],
  "route": {
    "id": "ribbon_garden",
    "startStageId": "ribbon_garden_area_1",
    "stageIds": [
      "ribbon_garden_area_1",
      "ribbon_garden_area_2",
      "ribbon_garden_area_3",
      "ribbon_garden_boss"
    ],
    "index": 3,
    "nextStageId": null,
    "saveStageId": "ribbon_garden",
    "areaName": "ボスエリア",
    "rankTimeS": 360,
    "rankTimeA": 520,
    "ending": false
  },
  "areaRole": "boss",
  "areas": [
    {
      "id": "boss",
      "name": "ボスエリア",
      "startX": 0,
      "endX": 1080,
      "respawn": {
        "x": 48,
        "y": 264
      }
    }
  ],
  "switchGimmicks": [
    {
      "id": "ribbon_switch_boss_a",
      "kind": "ribbonSwitch",
      "x": 552,
      "y": 280,
      "w": 40,
      "h": 40,
      "targetGroup": "boss_a",
      "triggerBy": [
        "magic"
      ]
    }
  ]
};

export default stage;
