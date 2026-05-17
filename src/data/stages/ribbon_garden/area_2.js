/**
 * 責務: うさぎのリボン庭園：時まわりの庭 のステージデータを定義する。
 * 更新ルール: うさぎのリボン庭園を正式な第3ワールドとして扱い、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 * 更新ルール: このエリアはにんじん時計扉を主体にし、switchGimmicksは時計入力のON/OFF生成だけを担当し、時刻の増減量はdoors[].clockInputsへ集約する。
 */
const stage = {
  "id": "ribbon_garden_area_2",
  "worldIndex": 2,
  "testStage": false,
  "name": "うさぎのリボン庭園：時まわりの庭",
  "backgroundKey": "bg_ribbon_garden",
  "bgm": "world3-ribbon-garden",
  "width": 2720,
  "height": 360,
  "playerStart": {
    "x": 48,
    "y": 264
  },
  "goal": {
    "x": 2648,
    "y": 272,
    "variant": "sign_board"
  },
  "boss": null,
  "introDialogue": [
    {
      "portrait": "npc_rabbit_child",
      "speaker": "ミミル",
      "text": "ここは、時まわりの庭ですわ。毎日12時ピッタリに扉が開きますの。"
    },
    {
      "portrait": "portrait_smile",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "お庭を見て回りながら、時計の針もちゃんと見ておくの。"
    }
  ],
  "bossDialogue": [],
  "bossDefeatDialogue": [],
  "clearDialogue": [],
  "areaClearDialogue": [
    {
      "portrait": "npc_rabbit_child",
      "speaker": "ミミル",
      "text": "時計さんも、待ってくれる子にはやさしいの。"
    },
    {
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "急がないことも、きれいな礼儀なの。"
    }
  ],
  "platforms": [
    {
      "x": 0,
      "y": 320,
      "w": 288,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 344,
      "y": 304,
      "w": 240,
      "h": 16,
      "kind": "normal",
      "active": true
    },
    {
      "x": 672,
      "y": 320,
      "w": 280,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1016,
      "y": 288,
      "w": 104,
      "h": 16,
      "kind": "spoon",
      "active": true,
      "slopeDir": 1,
      "tilt": 0.28
    },
    {
      "x": 1168,
      "y": 264,
      "w": 96,
      "h": 16,
      "kind": "jelly",
      "active": true
    },
    {
      "x": 1376,
      "y": 320,
      "w": 288,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 1728,
      "y": 296,
      "w": 112,
      "h": 16,
      "kind": "waitFlower",
      "active": true
    },
    {
      "x": 1888,
      "y": 272,
      "w": 96,
      "h": 16,
      "kind": "teacupSpin",
      "active": true,
      "tilt": 0.24
    },
    {
      "x": 2112,
      "y": 320,
      "w": 240,
      "h": 40,
      "kind": "normal",
      "active": true
    },
    {
      "x": 2424,
      "y": 320,
      "w": 296,
      "h": 40,
      "kind": "normal",
      "active": true
    }
  ],
  "residents": [
    {
      "x": 744,
      "y": 288,
      "type": "invitationHopper",
      "minX": 680,
      "maxX": 940
    },
    {
      "x": 1464,
      "y": 288,
      "type": "ribbonWisp",
      "minX": 1384,
      "maxX": 1656
    },
    {
      "x": 2216,
      "y": 288,
      "type": "invitationHopper",
      "minX": 2120,
      "maxX": 2328
    }
  ],
  "items": [
    {
      "x": 384,
      "y": 272,
      "kind": "coin"
    },
    {
      "x": 424,
      "y": 272,
      "kind": "coin"
    },
    {
      "x": 744,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 1080,
      "y": 256,
      "kind": "coin"
    },
    {
      "x": 1216,
      "y": 224,
      "kind": "teacup"
    },
    {
      "x": 1496,
      "y": 280,
      "kind": "zundamochi"
    },
    {
      "x": 1776,
      "y": 264,
      "kind": "coin"
    },
    {
      "x": 1936,
      "y": 232,
      "kind": "coin"
    },
    {
      "x": 2256,
      "y": 280,
      "kind": "coin"
    },
    {
      "x": 2536,
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
  "checkpoints": [],
  "doors": [
    {
      "id": "clock_door_first",
      "kind": "carrotClockDoor",
      "groupId": "",
      "x": 600,
      "y": 216,
      "w": 64,
      "h": 104,
      "imageKey": "gimmick_carrot_clock_gate",
      "initialTime": 0,
      "targetTime": 3,
      "hourHandTime": 0,
      "clockModulo": 12,
      "openWhenMatched": true,
      "handAnimDuration": 0.34,
      "clockInputs": [
        {
          "switchId": "clock_1_plus_1",
          "step": 1
        },
        {
          "switchId": "clock_1_plus_3",
          "step": 3
        }
      ]
    },
    {
      "id": "clock_door_second",
      "kind": "carrotClockDoor",
      "groupId": "",
      "x": 1288,
      "y": 216,
      "w": 64,
      "h": 104,
      "imageKey": "gimmick_carrot_clock_gate",
      "initialTime": 8,
      "targetTime": 5,
      "hourHandTime": 8,
      "clockModulo": 12,
      "openWhenMatched": true,
      "handAnimDuration": 0.34,
      "clockInputs": [
        {
          "switchId": "clock_2_plus_1",
          "step": 1
        },
        {
          "switchId": "clock_2_minus_2",
          "step": -2
        }
      ]
    },
    {
      "id": "clock_door_third",
      "kind": "carrotClockDoor",
      "groupId": "",
      "x": 2360,
      "y": 216,
      "w": 64,
      "h": 104,
      "imageKey": "gimmick_carrot_clock_gate",
      "initialTime": 2,
      "targetTime": 10,
      "hourHandTime": 2,
      "clockModulo": 12,
      "openWhenMatched": true,
      "handAnimDuration": 0.34,
      "clockInputs": [
        {
          "switchId": "clock_3_plus_4",
          "step": 4
        },
        {
          "switchId": "clock_3_minus_1",
          "step": -1
        }
      ]
    }
  ],
  "switchTargets": [],
  "switchGimmicks": [
    {
      "id": "clock_1_plus_1_bell",
      "kind": "teaBell",
      "groupId": "",
      "x": 352,
      "y": 256,
      "w": 42,
      "h": 48,
      "switchId": "clock_1_plus_1",
      "duration": 1.15,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "showArch": false
    },
    {
      "id": "clock_1_plus_3_bell",
      "kind": "teaBell",
      "groupId": "",
      "x": 464,
      "y": 256,
      "w": 42,
      "h": 48,
      "switchId": "clock_1_plus_3",
      "duration": 1.15,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "showArch": false
    },
    {
      "id": "clock_2_plus_1_bell",
      "kind": "teaBell",
      "groupId": "",
      "x": 1040,
      "y": 240,
      "w": 42,
      "h": 48,
      "switchId": "clock_2_plus_1",
      "duration": 1.15,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "showArch": false
    },
    {
      "id": "clock_2_minus_2_bell",
      "kind": "teaBell",
      "groupId": "",
      "x": 1144,
      "y": 216,
      "w": 42,
      "h": 48,
      "switchId": "clock_2_minus_2",
      "duration": 1.15,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "showArch": false
    },
    {
      "id": "clock_3_plus_4_bell",
      "kind": "teaBell",
      "groupId": "",
      "x": 1760,
      "y": 248,
      "w": 42,
      "h": 48,
      "switchId": "clock_3_plus_4",
      "duration": 1.15,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "showArch": false
    },
    {
      "id": "clock_3_minus_1_bell",
      "kind": "teaBell",
      "groupId": "",
      "x": 1920,
      "y": 224,
      "w": 42,
      "h": 48,
      "switchId": "clock_3_minus_1",
      "duration": 1.15,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ],
      "showArch": false
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
    "index": 1,
    "nextStageId": "ribbon_garden_area_3",
    "saveStageId": "ribbon_garden",
    "areaName": "エリア2",
    "rankTimeS": 360,
    "rankTimeA": 520,
    "ending": false
  },
  "areaRole": "area_2",
  "areas": [
    {
      "id": "area_2",
      "name": "エリア2",
      "startX": 0,
      "endX": 2720,
      "respawn": {
        "x": 48,
        "y": 264
      }
    }
  ]
};

export default stage;
