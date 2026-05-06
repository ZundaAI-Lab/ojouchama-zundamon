/**
 * 責務: うさぎのリボン庭園：月明かりの招待状 のステージデータを定義する。
 * 更新ルール: うさぎのリボン庭園を正式な第3ワールドとして扱い、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  "id": "ribbon_garden_area_3",
  "worldIndex": 2,
  "name": "うさぎのリボン庭園：月明かりの招待状",
  "backgroundKey": "bg_ribbon_garden",
  "bgm": "world3-ribbon-garden",
  "width": 2620,
  "height": 360,
  "playerStart": {
    "x": 48,
    "y": 264
  },
  "goal": {
    "x": 2528,
    "y": 232
  },
  "boss": null,
  "introDialogue": [],
  "bossDialogue": [],
  "bossDefeatDialogue": [],
  "clearDialogue": [],
  "areaClearDialogue": [
    {
      "portrait": "npc_rabbit_child",
      "speaker": "ミミル",
      "text": "招待状さん、もう怖くないみたいですの。けれど奥で、ほどけたリボンの影が震えていますわ……。"
    },
    {
      "portrait": "portrait_determined",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "影さんにも、ちゃんと声をかけに行くの。"
    }
  ],
  "platforms": [
    {
      "x": 0,
      "y": 320,
      "w": 304,
      "h": 32
    },
    {
      "x": 352,
      "y": 288,
      "w": 120,
      "h": 16,
      "kind": "ribbonWind",
      "windDir": 1
    },
    {
      "x": 544,
      "y": 256,
      "w": 104,
      "h": 16,
      "kind": "waitFlower"
    },
    {
      "x": 720,
      "y": 320,
      "w": 232,
      "h": 32
    },
    {
      "x": 1008,
      "y": 288,
      "w": 112,
      "h": 16,
      "kind": "sleepCloud"
    },
    {
      "x": 1192,
      "y": 272,
      "w": 104,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "moon_a"
    },
    {
      "x": 1480,
      "y": 320,
      "w": 240,
      "h": 32
    },
    {
      "x": 1784,
      "y": 280,
      "w": 112,
      "h": 16,
      "kind": "page",
      "phase": 0.6
    },
    {
      "x": 1968,
      "y": 256,
      "w": 112,
      "h": 16,
      "kind": "ribbonWind",
      "windDir": 1
    },
    {
      "x": 2160,
      "y": 296,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "moon_b"
    },
    {
      "x": 2440,
      "y": 320,
      "w": 184,
      "h": 32
    }
  ],
  "residents": [
    {
      "x": 760,
      "y": 288,
      "type": "invitationHopper",
      "minX": 720,
      "maxX": 940
    },
    {
      "x": 1080,
      "y": 240,
      "type": "ribbonWisp",
      "minX": 980,
      "maxX": 1280
    },
    {
      "x": 1544,
      "y": 288,
      "type": "invitationHopper",
      "minX": 1480,
      "maxX": 1710
    },
    {
      "x": 2008,
      "y": 216,
      "type": "ribbonWisp",
      "minX": 1900,
      "maxX": 2200
    }
  ],
  "items": [
    {
      "x": 392,
      "y": 248,
      "kind": "coin"
    },
    {
      "x": 592,
      "y": 216,
      "kind": "scone"
    },
    {
      "x": 1048,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 1240,
      "y": 232,
      "kind": "teacup"
    },
    {
      "x": 1816,
      "y": 240,
      "kind": "coin"
    },
    {
      "x": 2008,
      "y": 216,
      "kind": "coin"
    },
    {
      "x": 2200,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 2480,
      "y": 280,
      "kind": "coin"
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
    "index": 2,
    "nextStageId": "ribbon_garden_boss",
    "saveStageId": "ribbon_garden",
    "areaName": "エリア3",
    "rankTimeS": 360,
    "rankTimeA": 520,
    "ending": false
  },
  "areaRole": "area_3",
  "areas": [
    {
      "id": "area_3",
      "name": "エリア3",
      "startX": 0,
      "endX": 2620,
      "respawn": {
        "x": 48,
        "y": 264
      }
    }
  ],
  "switchGimmicks": [
    {
      "id": "ribbon_switch_moon_a",
      "kind": "ribbonSwitch",
      "x": 1344,
      "y": 288,
      "w": 40,
      "h": 40,
      "targetGroup": "moon_a",
      "triggerBy": [
        "magic"
      ]
    },
    {
      "id": "ribbon_switch_moon_b",
      "kind": "ribbonSwitch",
      "x": 2328,
      "y": 272,
      "w": 40,
      "h": 40,
      "targetGroup": "moon_b",
      "triggerBy": [
        "magic"
      ]
    }
  ]
};

export default stage;
