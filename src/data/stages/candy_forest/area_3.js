/**
 * 責務: お菓子の森：ゼリーの丘 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  "id": "candy_forest_area_3",
  "worldIndex": 0,
  "testStage": false,
  "name": "お菓子の森：ゼリーの丘",
  "backgroundKey": "bg_candy_world2",
  "bgm": "world1-candy-forest",
  "width": 3360,
  "height": 360,
  "playerStart": {
    "x": 48,
    "y": 264
  },
  "goal": {
    "x": 3296,
    "y": 272,
    "variant": "sign_board"
  },
  "boss": null,
  "introDialogue": [],
  "bossDialogue": [],
  "bossDefeatDialogue": [],
  "clearDialogue": [],
  "areaClearDialogue": [
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "お菓子を分け合う準備はできたの。この奥にいる子とも、お話するの！"
    }
  ],
  "platforms": [
    {
      "x": 0,
      "y": 320,
      "w": 272,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 328,
      "y": 288,
      "w": 112,
      "h": 16,
      "kind": "jelly",
      "active": true
    },
    {
      "x": 512,
      "y": 320,
      "w": 192,
      "h": 24,
      "kind": "jam",
      "active": true
    },
    {
      "x": 784,
      "y": 296,
      "w": 112,
      "h": 16,
      "kind": "crumble",
      "active": true
    },
    {
      "kind": "jelly",
      "x": 960,
      "y": 272,
      "w": 104,
      "h": 16,
      "active": true
    },
    {
      "x": 1136,
      "y": 320,
      "w": 208,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1408,
      "y": 288,
      "w": 128,
      "h": 16,
      "kind": "jam",
      "active": true
    },
    {
      "x": 1592,
      "y": 264,
      "w": 104,
      "h": 16,
      "kind": "jelly",
      "active": true
    },
    {
      "x": 1816,
      "y": 184,
      "w": 120,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 2072,
      "y": 136,
      "w": 120,
      "h": 16,
      "kind": "vine",
      "active": false
    },
    {
      "x": 2240,
      "y": 328,
      "w": 160,
      "h": 32,
      "kind": "normal",
      "active": true
    },
    {
      "x": 3160,
      "y": 328,
      "w": 200,
      "h": 32,
      "kind": "normal",
      "active": true
    },
    {
      "kind": "jam",
      "x": 1784,
      "y": 312,
      "w": 200,
      "h": 16,
      "active": true
    },
    {
      "kind": "jelly",
      "x": 2432,
      "y": 304,
      "w": 96,
      "h": 16,
      "active": true
    },
    {
      "kind": "crumble",
      "x": 2560,
      "y": 240,
      "w": 128,
      "h": 16,
      "active": true
    },
    {
      "kind": "vine",
      "x": 2768,
      "y": 224,
      "w": 128,
      "h": 16,
      "active": false
    },
    {
      "kind": "jam",
      "x": 2072,
      "y": 328,
      "w": 120,
      "h": 16,
      "active": true
    }
  ],
  "residents": [
    {
      "x": 560,
      "y": 296,
      "type": "jelly",
      "minX": 510,
      "maxX": 690
    },
    {
      "x": 1184,
      "y": 296,
      "type": "macaron",
      "minX": 1140,
      "maxX": 1330
    },
    {
      "x": 1856,
      "y": 152,
      "type": "jelly",
      "minX": 1824,
      "maxX": 1928
    },
    {
      "x": 2304,
      "y": 304,
      "type": "macaron",
      "minX": 2248,
      "maxX": 2392
    },
    {
      "x": 1856,
      "y": 288,
      "type": "macaron",
      "minX": 1792,
      "maxX": 1976
    },
    {
      "x": 2112,
      "y": 304,
      "type": "jelly",
      "minX": 2080,
      "maxX": 2184
    }
  ],
  "items": [
    {
      "x": 384,
      "y": 232,
      "kind": "coin"
    },
    {
      "x": 592,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 840,
      "y": 240,
      "kind": "coin"
    },
    {
      "x": 1016,
      "y": 160,
      "kind": "teacup"
    },
    {
      "x": 1472,
      "y": 232,
      "kind": "zundamochi"
    },
    {
      "x": 1704,
      "y": 176,
      "kind": "coin"
    },
    {
      "x": 1944,
      "y": 136,
      "kind": "coin"
    },
    {
      "x": 2256,
      "y": 64,
      "kind": "dreamDrop",
      "groupId": ""
    },
    {
      "x": 2280,
      "y": 248,
      "kind": "coin"
    },
    {
      "x": 2320,
      "y": 232,
      "kind": "coin"
    },
    {
      "x": 2360,
      "y": 248,
      "kind": "coin"
    },
    {
      "x": 2832,
      "y": 184,
      "kind": "coin"
    },
    {
      "x": 2832,
      "y": 144,
      "kind": "coin"
    },
    {
      "x": 2960,
      "y": 184,
      "kind": "coin"
    },
    {
      "x": 3040,
      "y": 216,
      "kind": "coin"
    },
    {
      "x": 3120,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 1192,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 1232,
      "y": 240,
      "kind": "coin"
    },
    {
      "x": 1272,
      "y": 256,
      "kind": "coin"
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
    "index": 2,
    "nextStageId": "candy_forest_boss",
    "saveStageId": "candy_forest",
    "areaName": "エリア3",
    "rankTimeS": 330,
    "rankTimeA": 470,
    "ending": false
  },
  "areaRole": "area_3",
  "areas": [
    {
      "id": "area_3",
      "name": "エリア3",
      "startX": 0,
      "endX": 3360,
      "respawn": {
        "x": 48,
        "y": 264
      }
    }
  ]
};

export default stage;
