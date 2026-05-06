/**
 * 責務: うさぎのリボン庭園：リボン小径 のステージデータを定義する。
 * 更新ルール: うさぎのリボン庭園を正式な第3ワールドとして扱い、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  "id": "ribbon_garden_area_1",
  "worldIndex": 2,
  "testStage": false,
  "name": "うさぎのリボン庭園：リボン小径",
  "backgroundKey": "bg_ribbon_garden",
  "bgm": "world3-ribbon-garden",
  "width": 3360,
  "height": 360,
  "playerStart": {
    "x": 48,
    "y": 264
  },
  "goal": {
    "x": 3296,
    "y": 232,
    "variant": "sign_board"
  },
  "boss": null,
  "introDialogue": [
    {
      "portrait": "npc_rabbit_child",
      "speaker": "ミミル",
      "text": "たいへんですの、たいへんですの！ お嬢ちゃま、お助けくださいませ！"
    },
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "ごきげんようなの。あなたは、リボン庭園の案内役さんなの？"
    },
    {
      "portrait": "npc_rabbit_child",
      "speaker": "ミミル",
      "text": "はい、ミミルと申しますの。お茶会への招待状を、みなさまにお届けする係ですの。"
    },
    {
      "portrait": "npc_rabbit_child",
      "speaker": "ミミル",
      "text": "けれど夢みる豆の木の光が弱まってから、リボンがほどけて、招待状さんまで迷子になってしまいましたの！"
    },
    {
      "portrait": "portrait_nano_surprise",
      "speaker": "なのちゃん",
      "text": "なのだ！？"
    },
    {
      "portrait": "npc_rabbit_child",
      "speaker": "ミミル",
      "text": "招待状さんは、リボンの小径へぴょんぴょん逃げてしまって……このままでは、お茶会の場所をみんなに知らせられませんの。"
    },
    {
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "迷子の招待状さんは、やさしく迎えに行けばいいの。きっと安心して戻ってくるの。"
    },
    {
      "portrait": "portrait_determined",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "あわてずに、一緒にリボンの小径をたどってみるの。"
    },
    {
      "portrait": "portrait_nano_laugh",
      "speaker": "なのちゃん",
      "text": "なのだ！"
    }
  ],
  "bossDialogue": [],
  "bossDefeatDialogue": [],
  "clearDialogue": [],
  "areaClearDialogue": [
    {
      "portrait": "npc_rabbit_child",
      "speaker": "ミミル",
      "text": "すごいですの！ リボンの橋が、ちゃんと待ってくれましたの！"
    },
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "次は時計の丘なの。急ぐ前に、針の声を聞くの。"
    }
  ],
  "platforms": [
    {
      "x": 0,
      "y": 320,
      "w": 312,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 336,
      "y": 296,
      "w": 112,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "a",
      "activeDuration": 0
    },
    {
      "x": 472,
      "y": 320,
      "w": 184,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 728,
      "y": 304,
      "w": 104,
      "h": 16,
      "kind": "waitFlower",
      "active": true
    },
    {
      "x": 1096,
      "y": 304,
      "w": 112,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "b",
      "activeDuration": 0
    },
    {
      "x": 1832,
      "y": 248,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "e",
      "activeDuration": 0
    },
    {
      "x": 1800,
      "y": 328,
      "w": 272,
      "h": 32,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1664,
      "y": 288,
      "w": 104,
      "h": 16,
      "kind": "waitFlower",
      "active": true
    },
    {
      "x": 3160,
      "y": 288,
      "w": 200,
      "h": 72,
      "kind": "normal",
      "active": true
    },
    {
      "x": 904,
      "y": 304,
      "w": 176,
      "h": 56,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1232,
      "y": 304,
      "w": 112,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "c",
      "activeDuration": 0
    },
    {
      "x": 1368,
      "y": 304,
      "w": 112,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "d",
      "activeDuration": 0
    },
    {
      "x": 1496,
      "y": 304,
      "w": 128,
      "h": 56,
      "kind": "normal",
      "active": true
    },
    {
      "x": 2112,
      "y": 288,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "f",
      "activeDuration": 0
    },
    {
      "x": 2360,
      "y": 128,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "g",
      "activeDuration": 0
    },
    {
      "x": 1984,
      "y": 208,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "e",
      "activeDuration": 0
    },
    {
      "x": 2136,
      "y": 176,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "e",
      "activeDuration": 0
    },
    {
      "x": 2288,
      "y": 296,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "f",
      "activeDuration": 0
    },
    {
      "x": 2456,
      "y": 304,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "f",
      "activeDuration": 0
    },
    {
      "x": 2512,
      "y": 112,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "g",
      "activeDuration": 0
    },
    {
      "x": 2664,
      "y": 96,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "g",
      "activeDuration": 0
    },
    {
      "x": 2848,
      "y": 168,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "h",
      "activeDuration": 0
    },
    {
      "x": 3008,
      "y": 216,
      "w": 120,
      "h": 16,
      "kind": "ribbonBridge",
      "active": false,
      "group": "h",
      "activeDuration": 0
    }
  ],
  "residents": [
    {
      "x": 528,
      "y": 288,
      "type": "invitationHopper",
      "minX": 480,
      "maxX": 648
    },
    {
      "x": 976,
      "y": 272,
      "type": "invitationHopper",
      "minX": 912,
      "maxX": 1152
    },
    {
      "x": 1216,
      "y": 208,
      "type": "ribbonWisp",
      "minX": 1128,
      "maxX": 1264
    },
    {
      "x": 1384,
      "y": 208,
      "type": "ribbonWisp",
      "minX": 1296,
      "maxX": 1432
    },
    {
      "x": 1888,
      "y": 296,
      "type": "invitationHopper",
      "minX": 1824,
      "maxX": 2016
    },
    {
      "x": 2032,
      "y": 136,
      "type": "ribbonWisp",
      "minX": 1864,
      "maxX": 2096
    },
    {
      "x": 2504,
      "y": 248,
      "type": "ribbonWisp",
      "minX": 2304,
      "maxX": 2568
    }
  ],
  "items": [
    {
      "x": 144,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 176,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 208,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 392,
      "y": 240,
      "kind": "coin"
    },
    {
      "x": 1024,
      "y": 224,
      "kind": "scone"
    },
    {
      "x": 1280,
      "y": 112,
      "kind": "teacup"
    },
    {
      "x": 1520,
      "y": 248,
      "kind": "coin"
    },
    {
      "x": 1560,
      "y": 240,
      "kind": "coin"
    },
    {
      "x": 776,
      "y": 216,
      "kind": "coin"
    },
    {
      "x": 2832,
      "y": 232,
      "kind": "largeBeanCoin",
      "groupId": ""
    },
    {
      "x": 1600,
      "y": 248,
      "kind": "coin"
    },
    {
      "x": 2304,
      "y": 192,
      "kind": "coin"
    },
    {
      "x": 2304,
      "y": 232,
      "kind": "coin"
    },
    {
      "x": 2568,
      "y": 64,
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
  "checkpoints": [],
  "doors": [],
  "switchTargets": [],
  "switchGimmicks": [
    {
      "id": "ribbon_switch_a",
      "kind": "ribbonSwitch",
      "x": 272,
      "y": 280,
      "w": 40,
      "h": 40,
      "targetGroup": "a",
      "triggerBy": [
        "magic"
      ]
    },
    {
      "id": "ribbon_switch_e",
      "kind": "ribbonSwitch",
      "x": 2024,
      "y": 288,
      "w": 40,
      "h": 40,
      "targetGroup": "e",
      "triggerBy": [
        "magic"
      ]
    },
    {
      "id": "ribbon_switch_b",
      "kind": "ribbonSwitch",
      "x": 1064,
      "y": 264,
      "w": 40,
      "h": 40,
      "targetGroup": "b",
      "triggerBy": [
        "magic"
      ]
    },
    {
      "id": "ribbon_switch_c",
      "kind": "ribbonSwitch",
      "x": 1200,
      "y": 264,
      "w": 40,
      "h": 40,
      "targetGroup": "c",
      "triggerBy": [
        "magic"
      ]
    },
    {
      "id": "ribbon_switch_d",
      "kind": "ribbonSwitch",
      "x": 1336,
      "y": 264,
      "w": 40,
      "h": 40,
      "targetGroup": "d",
      "triggerBy": [
        "magic"
      ]
    },
    {
      "id": "ribbon_switch_f",
      "kind": "ribbonSwitch",
      "x": 2256,
      "y": 56,
      "w": 40,
      "h": 40,
      "targetGroup": "f",
      "triggerBy": [
        "magic"
      ]
    },
    {
      "id": "ribbon_switch_g",
      "kind": "ribbonSwitch",
      "x": 2640,
      "y": 288,
      "w": 40,
      "h": 40,
      "targetGroup": "g",
      "triggerBy": [
        "magic"
      ]
    },
    {
      "id": "ribbon_switch_h",
      "kind": "ribbonSwitch",
      "x": 2928,
      "y": 56,
      "w": 40,
      "h": 40,
      "targetGroup": "h",
      "triggerBy": [
        "magic"
      ]
    }
  ],
  "balloonRides": [],
  "specialEvents": [],
  "route": {
    "id": "ribbon_garden",
    "startStageId": "ribbon_garden_area_1",
    "stageIds": [
      "ribbon_garden_area_1",
      "ribbon_garden_area_2",
      "ribbon_garden_area_3",
      "ribbon_garden_boss"
    ],
    "index": 0,
    "nextStageId": "ribbon_garden_area_2",
    "saveStageId": "ribbon_garden",
    "areaName": "エリア1",
    "rankTimeS": 360,
    "rankTimeA": 520,
    "ending": false
  },
  "areaRole": "area_1",
  "areas": [
    {
      "id": "area_1",
      "name": "エリア1",
      "startX": 0,
      "endX": 3360,
      "respawn": {
        "x": 48,
        "y": 208
      }
    }
  ]
};

export default stage;
