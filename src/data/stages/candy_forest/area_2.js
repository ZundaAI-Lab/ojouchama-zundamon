/**
 * 責務: お菓子の森：ジャム小川 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  "id": "candy_forest_area_2",
  "worldIndex": 0,
  "testStage": false,
  "name": "お菓子の森：ジャム小川",
  "backgroundKey": "bg_candy_world2",
  "bgm": "world1-candy-forest",
  "width": 3000,
  "height": 360,
  "playerStart": {
    "x": 48,
    "y": 264
  },
  "goal": {
    "x": 2936,
    "y": 240,
    "variant": "sign_board"
  },
  "boss": null,
  "introDialogue": [],
  "bossDialogue": [],
  "bossDefeatDialogue": [],
  "clearDialogue": [],
  "areaClearDialogue": [
    {
      "portrait": "portrait_proud",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "ジャムを固めたら、ちゃんと道になったの。次は甘い迷路なの！"
    }
  ],
  "platforms": [
    {
      "x": 0,
      "y": 320,
      "w": 280,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 344,
      "y": 304,
      "w": 208,
      "h": 16,
      "kind": "jam",
      "active": true
    },
    {
      "kind": "normal",
      "x": 608,
      "y": 320,
      "w": 104,
      "h": 40,
      "active": true
    },
    {
      "kind": "normal",
      "x": 928,
      "y": 280,
      "w": 88,
      "h": 16,
      "active": true
    },
    {
      "x": 1208,
      "y": 248,
      "w": 96,
      "h": 16,
      "kind": "vine",
      "active": false
    },
    {
      "x": 1496,
      "y": 320,
      "w": 216,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1768,
      "y": 288,
      "w": 104,
      "h": 16,
      "kind": "jam",
      "active": true
    },
    {
      "x": 1928,
      "y": 272,
      "w": 96,
      "h": 16,
      "kind": "crumble",
      "active": true
    },
    {
      "x": 2088,
      "y": 296,
      "w": 112,
      "h": 64,
      "kind": "normal",
      "active": true
    },
    {
      "kind": "jam",
      "x": 768,
      "y": 320,
      "w": 120,
      "h": 16,
      "active": true
    },
    {
      "kind": "jam",
      "x": 1056,
      "y": 280,
      "w": 120,
      "h": 16,
      "active": true
    },
    {
      "x": 2520,
      "y": 184,
      "w": 80,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 2776,
      "y": 296,
      "w": 224,
      "h": 64,
      "kind": "normal",
      "active": true
    },
    {
      "x": 2400,
      "y": 312,
      "w": 120,
      "h": 48,
      "kind": "normal",
      "active": true
    }
  ],
  "residents": [
    {
      "x": 1096,
      "y": 248,
      "type": "jelly",
      "minX": 1064,
      "maxX": 1168
    },
    {
      "x": 1552,
      "y": 296,
      "type": "jelly",
      "minX": 1504,
      "maxX": 1704
    },
    {
      "x": 384,
      "y": 280,
      "type": "macaron",
      "minX": 352,
      "maxX": 544
    },
    {
      "x": 2136,
      "y": 272,
      "type": "macaron",
      "minX": 2104,
      "maxX": "2208"
    },
    {
      "x": 808,
      "y": 288,
      "type": "macaron",
      "minX": 776,
      "maxX": 880
    }
  ],
  "items": [
    {
      "x": 208,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 448,
      "y": 224,
      "kind": "coin"
    },
    {
      "x": 1464,
      "y": 232,
      "kind": "zundamochi"
    },
    {
      "x": 904,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 664,
      "y": 160,
      "kind": "teacup"
    },
    {
      "x": 1824,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 1976,
      "y": 232,
      "kind": "coin"
    },
    {
      "x": 2496,
      "y": 232,
      "kind": "coin"
    },
    {
      "x": 2552,
      "y": 112,
      "kind": "zundamochi"
    },
    {
      "x": 2496,
      "y": 192,
      "kind": "coin"
    },
    {
      "x": 2496,
      "y": 152,
      "kind": "coin"
    },
    {
      "x": 2680,
      "y": 144,
      "kind": "coin"
    },
    {
      "x": 2728,
      "y": 176,
      "kind": "coin"
    },
    {
      "x": 2768,
      "y": 216,
      "kind": "coin"
    },
    {
      "x": 1256,
      "y": 216,
      "kind": "coin"
    },
    {
      "x": 1256,
      "y": 176,
      "kind": "coin"
    },
    {
      "x": 2384,
      "y": 240,
      "kind": "coin"
    },
    {
      "x": 1368,
      "y": 168,
      "kind": "coin"
    },
    {
      "x": 1416,
      "y": 200,
      "kind": "coin"
    },
    {
      "x": 2312,
      "y": 240,
      "kind": "coin"
    },
    {
      "x": 2240,
      "y": 240,
      "kind": "coin"
    },
    {
      "x": 2640,
      "y": 304,
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
      "y": 200,
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
  "specialEvents": [
    {
      "id": "nano_rescue_candy_forest_area_2",
      "kind": "nanoRescue",
      "configId": "candyDomeNanoRescue",
      "x": 936,
      "y": 216,
      "w": 64,
      "h": 64,
      "hitbox": {
        "x": 8,
        "y": 8,
        "w": 48,
        "h": 56
      }
    }
  ],
  "route": {
    "id": "candy_forest",
    "startStageId": "candy_forest_area_1",
    "stageIds": [
      "candy_forest_area_1",
      "candy_forest_area_2",
      "candy_forest_area_3",
      "candy_forest_boss"
    ],
    "index": 1,
    "nextStageId": "candy_forest_area_3",
    "saveStageId": "candy_forest",
    "areaName": "エリア2",
    "rankTimeS": 330,
    "rankTimeA": 470,
    "ending": false
  },
  "areaRole": "area_2",
  "areas": [
    {
      "id": "area_2",
      "name": "エリア2",
      "startX": 0,
      "endX": 3000,
      "respawn": {
        "x": 48,
        "y": 264
      }
    }
  ]
};

export default stage;
