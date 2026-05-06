/**
 * 責務: ティーカップ城：ベル回廊 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  "id": "teacup_castle_area_2",
  "worldIndex": 1,
  "testStage": false,
  "name": "ティーカップ城：ベル回廊",
  "backgroundKey": "bg_teacup_castle",
  "bgm": "world2-teacup-castle",
  "width": 3000,
  "height": 360,
  "playerStart": {
    "x": 48,
    "y": 264
  },
  "goal": {
    "x": 2936,
    "y": 264,
    "variant": "sign_board"
  },
  "boss": null,
  "introDialogue": [
    {
      "portrait": "npc_lamb_butler",
      "speaker": "ヒツジ執事",
      "text": "こちらは、ベル回廊でございます。御用の際には、備え付けのベルを鳴らしてくださいませ。音が続いている間だけ、扉が応じることもございます。"
    },
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "そっと近づけばいいのね。ベルの音がしている間に、扉を通るの。"
    }
  ],
  "bossDialogue": [],
  "bossDefeatDialogue": [],
  "clearDialogue": [],
  "areaClearDialogue": [
    {
      "portrait": "portrait_proud",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "ベルにも、扉にも、ちゃんとごあいさつできたの。次は紅茶サロンなの。"
    }
  ],
  "platforms": [
    {
      "x": 0,
      "y": 320,
      "w": 480,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 504,
      "y": 272,
      "w": 112,
      "h": 16,
      "kind": "spoon",
      "active": true,
      "slopeDir": -1,
      "tilt": 0.35
    },
    {
      "x": 632,
      "y": 224,
      "w": 120,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 776,
      "y": 288,
      "w": 136,
      "h": 16,
      "kind": "teacupSpin",
      "active": true,
      "tilt": 0.4
    },
    {
      "x": 920,
      "y": 320,
      "w": 288,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1240,
      "y": 304,
      "w": 120,
      "h": 16,
      "kind": "spoon",
      "active": true,
      "slopeDir": -1,
      "tilt": 0.3
    },
    {
      "x": 1384,
      "y": 272,
      "w": 96,
      "h": 16,
      "kind": "jelly",
      "active": true
    },
    {
      "x": 1840,
      "y": 320,
      "w": 552,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 2528,
      "y": 280,
      "w": 152,
      "h": 16,
      "kind": "crumble",
      "active": true
    },
    {
      "x": 2808,
      "y": 320,
      "w": 192,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 632,
      "y": 336,
      "w": 128,
      "h": 16,
      "kind": "normal",
      "active": true,
      "groupId": ""
    },
    {
      "x": 920,
      "y": 192,
      "w": 80,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1512,
      "y": 224,
      "w": 136,
      "h": 16,
      "kind": "normal",
      "active": true,
      "groupId": ""
    },
    {
      "x": 2232,
      "y": 232,
      "w": 88,
      "h": 16,
      "kind": "normal",
      "active": true,
      "groupId": ""
    },
    {
      "kind": "teacupSpin",
      "x": 1728,
      "y": 264,
      "w": 112,
      "h": 16,
      "active": true,
      "tilt": 0.4
    },
    {
      "x": 2040,
      "y": 168,
      "w": 88,
      "h": 16,
      "kind": "normal",
      "active": true,
      "groupId": ""
    },
    {
      "x": 1888,
      "y": 232,
      "w": 88,
      "h": 16,
      "kind": "normal",
      "active": true,
      "groupId": ""
    },
    {
      "kind": "spoon",
      "x": 1968,
      "y": 272,
      "w": 96,
      "h": 16,
      "active": true,
      "slopeDir": 1,
      "tilt": 0.35
    },
    {
      "x": 2432,
      "y": 296,
      "w": 72,
      "h": 16,
      "kind": "normal",
      "active": true,
      "groupId": ""
    },
    {
      "x": 2704,
      "y": 296,
      "w": 72,
      "h": 16,
      "kind": "normal",
      "active": true,
      "groupId": ""
    }
  ],
  "residents": [
    {
      "x": 712,
      "y": 192,
      "type": "spoon",
      "minX": 640,
      "maxX": 744,
      "hp": 1
    },
    {
      "x": 968,
      "y": 296,
      "type": "macaron",
      "minX": 928,
      "maxX": 1024
    },
    {
      "x": 1560,
      "y": 184,
      "type": "spoon",
      "minX": 1520,
      "maxX": 1640
    },
    {
      "x": 2024,
      "y": 288,
      "type": "teaImp",
      "minX": 1864,
      "maxX": 2152
    },
    {
      "x": 2584,
      "y": 256,
      "type": "macaron",
      "minX": 2544,
      "maxX": 2664
    }
  ],
  "items": [
    {
      "x": 448,
      "y": 288,
      "kind": "coin"
    },
    {
      "x": 1072,
      "y": 128,
      "kind": "teacup"
    },
    {
      "x": 1576,
      "y": 152,
      "kind": "scone"
    },
    {
      "x": 1152,
      "y": 288,
      "kind": "coin"
    },
    {
      "x": 2272,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 656,
      "y": 160,
      "kind": "coin"
    },
    {
      "x": 728,
      "y": 160,
      "kind": "coin"
    },
    {
      "x": 2312,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 2352,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 2600,
      "y": 328,
      "kind": "largeBeanCoin",
      "groupId": ""
    },
    {
      "x": 1184,
      "y": 288,
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
  "doors": [
    {
      "id": "door_1",
      "groupId": "",
      "x": 344,
      "y": 240,
      "w": 54,
      "h": 82,
      "openCondition": "switch",
      "switchId": "switch_1",
      "openWhenOn": true,
      "imageKey": "door_bow"
    },
    {
      "id": "door_1_2",
      "groupId": "",
      "x": 1040,
      "y": 240,
      "w": 54,
      "h": 82,
      "openCondition": "switch",
      "switchId": "switch_2",
      "openWhenOn": true,
      "imageKey": "door_bow"
    },
    {
      "id": "door_1_3",
      "groupId": "",
      "x": 2152,
      "y": 240,
      "w": 54,
      "h": 82,
      "openCondition": "switch",
      "switchId": "switch_3",
      "openWhenOn": true,
      "imageKey": "door_bow"
    }
  ],
  "switchTargets": [],
  "switchGimmicks": [
    {
      "id": "switch_1",
      "kind": "teaBell",
      "groupId": "",
      "x": 224,
      "y": 272,
      "w": 42,
      "h": 48,
      "switchId": "switch_1",
      "duration": 4,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "required": 1,
      "setId": "S1"
    },
    {
      "id": "switch_2_1",
      "kind": "teaBell",
      "groupId": "",
      "x": 672,
      "y": 280,
      "w": 42,
      "h": 48,
      "switchId": "switch_2",
      "duration": 4,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "setId": "S2",
      "required": 2
    },
    {
      "id": "switch_2_2",
      "kind": "teaBell",
      "groupId": "",
      "x": 936,
      "y": 136,
      "w": 42,
      "h": 48,
      "switchId": "switch_2",
      "duration": 4,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "setId": "S2",
      "required": 2
    },
    {
      "id": "switch_3_1",
      "kind": "teaBell",
      "groupId": "",
      "x": 1912,
      "y": 176,
      "w": 42,
      "h": 48,
      "switchId": "switch_3",
      "duration": 4,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "setId": "S3",
      "required": 3
    },
    {
      "id": "switch_3_3",
      "kind": "teaBell",
      "groupId": "",
      "x": 2256,
      "y": 176,
      "w": 42,
      "h": 48,
      "switchId": "switch_3",
      "duration": 4,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "setId": "S3",
      "required": 3
    },
    {
      "id": "switch_3_2",
      "kind": "teaBell",
      "groupId": "",
      "x": 2064,
      "y": 112,
      "w": 42,
      "h": 48,
      "switchId": "switch_3",
      "duration": 4,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "setId": "S3",
      "required": 3
    }
  ],
  "balloonRides": [],
  "specialEvents": [
    {
      "id": "door_b_1",
      "kind": "residentReinforcement",
      "groupId": "E1",
      "x": 344,
      "y": 232,
      "w": 64,
      "h": 8,
      "once": true,
      "message": {
        "portrait": "resident_spoon_a",
        "speaker": "スプーン兵",
        "text": "無礼者！"
      },
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
      ]
    },
    {
      "id": "door_c_1",
      "kind": "deactivateGroup",
      "groupId": "E1",
      "targetGroupId": "E1",
      "x": 344,
      "y": 240,
      "w": 8,
      "h": 80,
      "once": true,
      "triggerBy": [
        "player"
      ]
    },
    {
      "id": "door_b_2",
      "kind": "residentReinforcement",
      "groupId": "E2",
      "x": 1040,
      "y": 232,
      "w": 64,
      "h": 8,
      "once": true,
      "message": {
        "portrait": "resident_spoon_a",
        "speaker": "スプーン兵",
        "text": "無礼者！"
      },
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
      ]
    },
    {
      "id": "doorc_2",
      "kind": "deactivateGroup",
      "groupId": "E2",
      "targetGroupId": "E2",
      "x": 1040,
      "y": 240,
      "w": 8,
      "h": 80,
      "once": true,
      "triggerBy": [
        "player"
      ]
    },
    {
      "id": "door_b_3",
      "kind": "residentReinforcement",
      "groupId": "E3",
      "x": 2152,
      "y": 232,
      "w": 64,
      "h": 8,
      "once": true,
      "message": {
        "portrait": "resident_spoon_a",
        "speaker": "スプーン兵",
        "text": "無礼者！"
      },
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
      ]
    },
    {
      "id": "doorc_3",
      "kind": "deactivateGroup",
      "groupId": "E3",
      "targetGroupId": "E3",
      "x": 2152,
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
    "index": 1,
    "nextStageId": "teacup_castle_area_3",
    "saveStageId": "teacup_castle",
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
