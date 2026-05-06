/**
 * 責務: お菓子の森 ボスエリア：カップケーキ広場 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  "id": "candy_forest_boss",
  "worldIndex": 0,
  "testStage": false,
  "name": "お菓子の森 ボスエリア：カップケーキ広場",
  "backgroundKey": "bg_candy_world2",
  "bgm": "world1-candy-forest",
  "width": 980,
  "height": 360,
  "playerStart": {
    "x": 48,
    "y": 264
  },
  "goal": {
    "x": 888,
    "y": 200,
    "variant": "default"
  },
  "boss": {
    "id": "cupcake",
    "name": "わがままカップケーキ",
    "imageKey": "boss_cupcake_queen",
    "x": 624,
    "y": 240,
    "w": 64,
    "h": 72,
    "hp": 10
  },
  "introDialogue": [],
  "bossDialogue": [
    {
      "portrait": "boss_cupcake_queen",
      "speaker": "わがままカップケーキ",
      "text": "ここから先は通さないよ！ この森のお菓子はぜーんぶボクのもの！"
    },
    {
      "portrait": "portrait_bashful",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "まあまあ。そんなにたくさん持っていたら、手も心もいっぱいになっちゃうの。"
    },
    {
      "portrait": "portrait_nano_smile",
      "speaker": "なのちゃん",
      "text": "なのだ！"
    },
    {
      "portrait": "boss_cupcake_queen",
      "speaker": "わがままカップケーキ",
      "text": "ボクが一番かわいいから、全部もらって当然なんだ！"
    },
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "かわいいものは、みんなで見つめるともっときらきらするの。"
    },
    {
      "portrait": "boss_cupcake_queen",
      "speaker": "わがままカップケーキ",
      "text": "そんなの知らない！ ボクのクリーム魔法、受けてみろー！"
    },
    {
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "あなたの中にも、甘くてやさしい気持ちがあると思うの。豆の魔法で思い出してほしいの。"
    }
  ],
  "bossDefeatDialogue": [
    {
      "portrait": "boss_cupcake_queen",
      "speaker": "わがままカップケーキ",
      "text": "うう……なんだか胸がぽかぽかする……。"
    },
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "それはきっと、甘い気持ちが戻ってきたの。"
    },
    {
      "portrait": "boss_cupcake_queen",
      "speaker": "わがままカップケーキ",
      "text": "ひとりじめより、みんなで食べたほうがおいしいのかな……？"
    },
    {
      "portrait": "portrait_nano_laugh",
      "speaker": "なのちゃん",
      "text": "なのだ！"
    },
    {
      "portrait": "boss_cupcake_queen",
      "speaker": "わがままカップケーキ",
      "text": "じゃあ……ボクもみんなにクリームを分けてあげる。"
    }
  ],
  "clearDialogue": [
    {
      "portrait": "npc_candy_maid",
      "speaker": "キャンディメイド",
      "text": "森の香りが戻ってきました！ お嬢ちゃま、ありがとうございました！"
    },
    {
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "お茶会はね、誰かと一緒だから宝物になるの。"
    },
    {
      "portrait": "portrait_nano_smile",
      "speaker": "なのちゃん",
      "text": "なのだ！"
    }
  ],
  "areaClearDialogue": [],
  "platforms": [
    {
      "kind": "normal",
      "x": 0,
      "y": 320,
      "w": 984,
      "h": 40,
      "active": true
    },
    {
      "x": 256,
      "y": 288,
      "w": 112,
      "h": 16,
      "kind": "jelly",
      "active": true
    },
    {
      "x": 104,
      "y": 216,
      "w": 112,
      "h": 16,
      "kind": "jam",
      "active": true
    },
    {
      "x": 752,
      "y": 288,
      "w": 112,
      "h": 16,
      "kind": "jelly",
      "active": true
    }
  ],
  "residents": [],
  "items": [
    {
      "x": 176,
      "y": 288,
      "kind": "scone"
    }
  ],
  "decorations": [
    {
      "x": 120,
      "y": 160,
      "r": 10,
      "color": "rgba(255,255,255,0.25)"
    },
    {
      "x": 520,
      "y": 144,
      "r": 7,
      "color": "rgba(255,242,171,0.34)"
    },
    {
      "x": 984,
      "y": 152,
      "r": 8,
      "color": "rgba(255,255,255,0.22)"
    },
    {
      "x": 1504,
      "y": 144,
      "r": 10,
      "color": "rgba(246,251,207,0.26)"
    },
    {
      "x": 2104,
      "y": 176,
      "r": 9,
      "color": "rgba(255,255,255,0.22)"
    }
  ],
  "checkpoints": [],
  "doors": [],
  "switchTargets": [],
  "switchGimmicks": [],
  "balloonRides": [],
  "specialEvents": [],
  "route": {
    "id": "candy_forest",
    "startStageId": "candy_forest_area_1",
    "stageIds": [
      "candy_forest_area_1",
      "candy_forest_area_2",
      "candy_forest_area_3",
      "candy_forest_boss"
    ],
    "index": 3,
    "nextStageId": null,
    "saveStageId": "candy_forest",
    "areaName": "ボスエリア",
    "rankTimeS": 330,
    "rankTimeA": 470,
    "ending": false
  },
  "areaRole": "boss",
  "areas": [
    {
      "id": "boss",
      "name": "ボスエリア",
      "startX": 0,
      "endX": 980,
      "respawn": {
        "x": 48,
        "y": 264
      }
    }
  ]
};

export default stage;
