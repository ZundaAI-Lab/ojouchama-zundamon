/**
 * 責務: ティーカップ城：庭園のごあいさつ のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  "id": "teacup_castle_area_1",
  "worldIndex": 1,
  "testStage": false,
  "name": "ティーカップ城：庭園のごあいさつ",
  "backgroundKey": "bg_teacup_castle",
  "bgm": "world2-teacup-castle",
  "width": 3000,
  "height": 360,
  "playerStart": {
    "x": 48,
    "y": 264
  },
  "goal": {
    "x": 2928,
    "y": 264,
    "variant": "sign_board"
  },
  "boss": null,
  "introDialogue": [
    {
      "portrait": "npc_lamb_butler",
      "speaker": "ひつじ執事",
      "text": "ようこそお越しくださいました、ずんだもんさま。"
    },
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "ごきげんようなの。きれいなお庭なのに、ティーカップたちが少し困った顔をしているの。"
    },
    {
      "portrait": "npc_lamb_butler",
      "speaker": "ひつじ執事",
      "text": "夢みる豆の木の光が弱まり、城の礼儀作法までおかしくなってしまいました。"
    },
    {
      "portrait": "portrait_nano_surprise",
      "speaker": "なのちゃん",
      "text": "なのだ？"
    },
    {
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "礼儀は誰かを困らせるためのものじゃないの。心をそっとあたためるためのものなの。"
    },
    {
      "portrait": "npc_lamb_butler",
      "speaker": "ひつじ執事",
      "text": "はい。どうか、心のこもったおじぎで、城のみなさまに本当の礼儀を思い出させてくださいませ。"
    },
    {
      "portrait": "portrait_determined",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "うん。ずんだもんが、心をこめておじぎするの。なのちゃん、一緒に行くの。"
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
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "おじぎの扉は心で開くの。次は礼儀ベルを試してみるの。"
    }
  ],
  "platforms": [
    {
      "x": 0,
      "y": 320,
      "w": 304,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 496,
      "y": 240,
      "w": 120,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 336,
      "y": 280,
      "w": 128,
      "h": 16,
      "kind": "spoon",
      "active": true,
      "slopeDir": -1,
      "tilt": 0.35
    },
    {
      "x": 680,
      "y": 320,
      "w": 296,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1048,
      "y": 288,
      "w": 136,
      "h": 16,
      "kind": "jelly",
      "active": true
    },
    {
      "x": 1240,
      "y": 312,
      "w": 224,
      "h": 48,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1512,
      "y": 296,
      "w": 88,
      "h": 16,
      "kind": "crumble",
      "active": true
    },
    {
      "x": 1648,
      "y": 264,
      "w": 96,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1784,
      "y": 304,
      "w": 184,
      "h": 56,
      "kind": "normal",
      "active": true
    },
    {
      "x": 2640,
      "y": 320,
      "w": 360,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1320,
      "y": 184,
      "w": 64,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "kind": "crumble",
      "x": 2520,
      "y": 208,
      "w": 88,
      "h": 16,
      "active": true
    },
    {
      "x": 2744,
      "y": 144,
      "w": 104,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 2072,
      "y": 304,
      "w": 264,
      "h": 56,
      "kind": "normal",
      "active": true
    },
    {
      "x": 2048,
      "y": 168,
      "w": 288,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "kind": "vinePlatform",
      "x": 2296,
      "y": 184,
      "w": 40,
      "h": 120,
      "active": true
    },
    {
      "kind": "crumble",
      "x": 2384,
      "y": 160,
      "w": 88,
      "h": 16,
      "active": true
    },
    {
      "x": 1816,
      "y": 240,
      "w": 128,
      "h": 16,
      "kind": "spoon",
      "active": true,
      "slopeDir": 1,
      "tilt": 0.35
    },
    {
      "x": 1872,
      "y": 160,
      "w": 128,
      "h": 16,
      "kind": "spoon",
      "active": true,
      "slopeDir": -1,
      "tilt": 0.35
    }
  ],
  "residents": [
    {
      "x": 584,
      "y": 192,
      "type": "spoon",
      "minX": 504,
      "maxX": 608
    },
    {
      "x": 1096,
      "y": 256,
      "type": "macaron",
      "minX": 1064,
      "maxX": 1168
    },
    {
      "x": 1328,
      "y": 264,
      "type": "spoon",
      "minX": 1256,
      "maxX": 1456
    },
    {
      "x": 1808,
      "y": 264,
      "type": "teaImp",
      "minX": 1792,
      "maxX": 1952
    },
    {
      "x": 2128,
      "y": 128,
      "type": "spoon",
      "minX": 2056,
      "maxX": 2336
    }
  ],
  "items": [
    {
      "x": 192,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 232,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 1352,
      "y": 144,
      "kind": "teacup"
    },
    {
      "x": 568,
      "y": 144,
      "kind": "coin"
    },
    {
      "x": 1144,
      "y": 216,
      "kind": "zundamochi"
    },
    {
      "x": 1552,
      "y": 248,
      "kind": "coin"
    },
    {
      "x": 1688,
      "y": 224,
      "kind": "coin"
    },
    {
      "x": 2800,
      "y": 120,
      "kind": "largeBeanCoin"
    },
    {
      "x": 2176,
      "y": 272,
      "kind": "coin"
    },
    {
      "x": 2224,
      "y": 272,
      "kind": "dreamDrop"
    },
    {
      "x": 2272,
      "y": 272,
      "kind": "coin"
    },
    {
      "x": 904,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 944,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 2024,
      "y": 88,
      "kind": "coin"
    },
    {
      "x": 2560,
      "y": 144,
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
    }
  ],
  "checkpoints": [],
  "doors": [
    {
      "id": "bow_door_1",
      "groupId": "",
      "x": 792,
      "y": 240,
      "w": 64,
      "h": 80,
      "openCondition": "bow",
      "imageKey": "door_bow",
      "bowRange": 96
    },
    {
      "id": "bow_door_1_2",
      "groupId": "",
      "x": 2064,
      "y": 224,
      "w": 64,
      "h": 80,
      "openCondition": "bow",
      "imageKey": "door_bow",
      "bowRange": 96
    }
  ],
  "switchTargets": [],
  "switchGimmicks": [],
  "balloonRides": [],
  "specialEvents": [
    {
      "id": "teacup_castle_area1_rude_reinforcement",
      "kind": "residentReinforcement",
      "x": 792,
      "y": 224,
      "w": 64,
      "h": 16,
      "once": true,
      "message": {
        "portrait": "resident_spoon_a",
        "speaker": "スプーン兵",
        "text": "無礼者！"
      },
      "initialVy": 40,
      "residents": [
        {
          "type": "spoon",
          "offsetX": -60,
          "offsetY": -160,
          "facing": 1
        },
        {
          "type": "spoon",
          "offsetX": 60,
          "offsetY": -160,
          "facing": -1
        }
      ],
      "groupId": "E1"
    },
    {
      "id": "area_clear",
      "kind": "deactivateGroup",
      "groupId": "E1",
      "targetGroupId": "E1",
      "x": 792,
      "y": 240,
      "w": 8,
      "h": 80,
      "once": true,
      "triggerBy": [
        "player"
      ]
    }
  ],
  "route": {
    "id": "teacup_castle",
    "startStageId": "teacup_castle_area_1",
    "stageIds": [
      "teacup_castle_area_1",
      "teacup_castle_area_2",
      "teacup_castle_area_3",
      "teacup_castle_boss"
    ],
    "index": 0,
    "nextStageId": "teacup_castle_area_2",
    "saveStageId": "teacup_castle",
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
      "endX": 3000,
      "respawn": {
        "x": 48,
        "y": 264
      }
    }
  ]
};

export default stage;
