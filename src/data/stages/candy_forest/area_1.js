/**
 * 責務: お菓子の森：クッキーこみち のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  "id": "candy_forest_area_1",
  "worldIndex": 0,
  "testStage": false,
  "name": "お菓子の森：クッキーこみち",
  "backgroundKey": "bg_candy_world2",
  "bgm": "world1-candy-forest",
  "width": 2800,
  "height": 360,
  "playerStart": {
    "x": 48,
    "y": 288
  },
  "goal": {
    "x": 2736,
    "y": 264,
    "variant": "sign_board"
  },
  "boss": null,
  "introDialogue": [
    {
      "portrait": "npc_candy_maid",
      "speaker": "キャンディメイド",
      "text": "お嬢ちゃま！ お待ちしておりました！"
    },
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "ごきげんようなの。甘い香りがいっぱいなの。でも……少しだけ、そわそわした空気を感じるの。"
    },
    {
      "portrait": "npc_candy_maid",
      "speaker": "キャンディメイド",
      "text": "夢みる豆の木の光が弱くなってから、お菓子たちの心が少しずつかたくなってしまったのです。"
    },
    {
      "portrait": "npc_candy_maid",
      "speaker": "キャンディメイド",
      "text": "マカロンたちは『この甘い香りは自分たちだけのもの』と言って、クッキーの道をふさいでしまいました。"
    },
    {
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "甘いものはみんなで分けると、もっと甘くなるの。ひとりじめは、きっとさみしい味なの。"
    },
    {
      "portrait": "npc_candy_maid",
      "speaker": "キャンディメイド",
      "text": "このままでは、奥のお茶会広場まで誰も行けません……。"
    },
    {
      "portrait": "portrait_determined",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "それじゃあ、ずんだもんが見に行くの。豆の魔法で、やさしいお茶会みたいに落ち着かせてあげるの。"
    }
  ],
  "bossDialogue": [],
  "bossDefeatDialogue": [],
  "clearDialogue": [],
  "areaClearDialogue": [
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "甘い森の様子は分かったの。次はジャムの小川を越えていくの！"
    }
  ],
  "platforms": [
    {
      "x": 0,
      "y": 320,
      "w": 248,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 448,
      "y": 312,
      "w": 160,
      "h": 48,
      "kind": "normal",
      "active": true
    },
    {
      "x": 664,
      "y": 312,
      "w": 136,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 848,
      "y": 288,
      "w": 160,
      "h": 72,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1064,
      "y": 320,
      "w": 192,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "kind": "normal",
      "x": 1288,
      "y": 280,
      "w": 80,
      "h": 16,
      "active": true
    },
    {
      "kind": "crumble",
      "x": 1424,
      "y": 240,
      "w": 96,
      "h": 16,
      "active": true
    },
    {
      "x": 1912,
      "y": 296,
      "w": 96,
      "h": 16,
      "kind": "vine",
      "active": false
    },
    {
      "x": 2048,
      "y": 320,
      "w": 192,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 2560,
      "y": 320,
      "w": 240,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "kind": "crumble",
      "x": 1560,
      "y": 208,
      "w": 96,
      "h": 16,
      "active": true
    },
    {
      "x": 1688,
      "y": 176,
      "w": 80,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1400,
      "y": 320,
      "w": 464,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 248,
      "y": 288,
      "w": 96,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 344,
      "y": 256,
      "w": 96,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "kind": "crumble",
      "x": 2272,
      "y": 280,
      "w": 96,
      "h": 16,
      "active": true
    },
    {
      "kind": "crumble",
      "x": 2432,
      "y": 280,
      "w": 96,
      "h": 16,
      "active": true
    },
    {
      "x": 1920,
      "y": 120,
      "w": 80,
      "h": 16,
      "kind": "vine",
      "active": false
    }
  ],
  "residents": [
    {
      "x": 672,
      "y": 280,
      "type": "macaron",
      "minX": 670,
      "maxX": 792
    },
    {
      "x": 872,
      "y": 256,
      "type": "jelly",
      "minX": 856,
      "maxX": 992
    },
    {
      "x": 1088,
      "y": 296,
      "type": "macaron",
      "minX": 1090,
      "maxX": 1240
    },
    {
      "x": 1544,
      "y": 296,
      "type": "jelly",
      "minX": 1408,
      "maxX": 1632
    },
    {
      "x": 2096,
      "y": 296,
      "type": "macaron",
      "minX": 2056,
      "maxX": 2232
    },
    {
      "x": 1728,
      "y": 296,
      "type": "jelly",
      "minX": 1632,
      "maxX": 1856
    }
  ],
  "items": [
    {
      "x": 288,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 392,
      "y": 224,
      "kind": "coin"
    },
    {
      "x": 824,
      "y": 248,
      "kind": "coin"
    },
    {
      "x": 528,
      "y": 248,
      "kind": "coin"
    },
    {
      "x": 632,
      "y": 232,
      "kind": "coin"
    },
    {
      "x": 936,
      "y": 224,
      "kind": "zundamochi"
    },
    {
      "x": 1328,
      "y": 224,
      "kind": "coin"
    },
    {
      "x": 1728,
      "y": 144,
      "kind": "teacup"
    },
    {
      "x": 1960,
      "y": 248,
      "kind": "coin"
    },
    {
      "x": 1960,
      "y": 208,
      "kind": "coin"
    },
    {
      "x": 2168,
      "y": 256,
      "kind": "zundamochi"
    },
    {
      "x": 1040,
      "y": 208,
      "kind": "coin"
    },
    {
      "x": 1472,
      "y": 208,
      "kind": "coin"
    },
    {
      "x": 1600,
      "y": 176,
      "kind": "coin"
    },
    {
      "x": 2384,
      "y": 224,
      "kind": "coin"
    },
    {
      "x": 2416,
      "y": 224,
      "kind": "coin"
    },
    {
      "x": 1808,
      "y": 248,
      "kind": "coin"
    },
    {
      "x": 1960,
      "y": 40,
      "kind": "dreamDrop"
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
      "x": 2192,
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
    "index": 0,
    "nextStageId": "candy_forest_area_2",
    "saveStageId": "candy_forest",
    "areaName": "エリア1",
    "rankTimeS": 330,
    "rankTimeA": 470,
    "ending": false
  },
  "areaRole": "area_1",
  "areas": [
    {
      "id": "area_1",
      "name": "エリア1",
      "startX": 0,
      "endX": 2800,
      "respawn": {
        "x": 48,
        "y": 264
      }
    }
  ]
};

export default stage;
