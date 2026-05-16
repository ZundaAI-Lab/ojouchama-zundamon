/**
 * 責務: ティーカップ城：バラの迷路 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 */
const stage = {
  "id": "teacup_castle_area_3",
  "worldIndex": 1,
  "testStage": false,
  "name": "ティーカップ城：バラの迷路",
  "backgroundKey": "bg_teacup_castle",
  "bgm": "world2-teacup-castle",
  "width": 3000,
  "height": 360,
  "playerStart": {
    "x": 40,
    "y": 312
  },
  "goal": {
    "x": 2928,
    "y": 264,
    "variant": "sign_board"
  },
  "boss": null,
  "introDialogue": [],
  "bossDialogue": [],
  "bossDefeatDialogue": [],
  "clearDialogue": [],
  "areaClearDialogue": [
    {
      "portrait": "portrait_gentle",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "紅茶たちも落ち着いたの。この先にいる方に、心をこめたおじぎを見せるの。"
    }
  ],
  "platforms": [
    {
      "kind": "normal",
      "x": 0,
      "y": 320,
      "w": 480,
      "h": 40,
      "active": true,
      "platformStyle": "normal",
      "activeWhenOn": true
    },
    {
      "x": 1624,
      "y": 256,
      "w": 16,
      "h": 72,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1544,
      "y": 56,
      "w": 16,
      "h": 96,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 288,
      "y": 0,
      "w": 16,
      "h": 216,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 304,
      "y": 200,
      "w": 176,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 464,
      "y": 16,
      "w": 16,
      "h": 96,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 600,
      "y": 200,
      "w": 104,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 384,
      "y": 112,
      "w": 16,
      "h": 88,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1296,
      "y": 40,
      "w": 1616,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1320,
      "y": 232,
      "w": 16,
      "h": 80,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1432,
      "y": 240,
      "w": 120,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 304,
      "y": 0,
      "w": 560,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1824,
      "y": 184,
      "w": 80,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1696,
      "y": 240,
      "w": 112,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1968,
      "y": 240,
      "w": 112,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1920,
      "y": 128,
      "w": 112,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1968,
      "y": 312,
      "w": 144,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1640,
      "y": 312,
      "w": 264,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "kind": "vinePlatform",
      "x": 800,
      "y": 312,
      "w": 224,
      "h": 16,
      "active": true,
      "activeWhenOn": true,
      "vineStyle": "current"
    },
    {
      "x": 704,
      "y": 200,
      "w": 16,
      "h": 72,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 704,
      "y": 104,
      "w": 80,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1688,
      "y": 56,
      "w": 16,
      "h": 72,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "kind": "spoon",
      "groupId": "",
      "x": 480,
      "y": 256,
      "w": 120,
      "h": 16,
      "active": true,
      "slopeDir": -1,
      "tilt": 0.35,
      "activeWhenOn": true
    },
    {
      "kind": "spoon",
      "groupId": "",
      "x": 576,
      "y": 136,
      "w": 104,
      "h": 16,
      "active": true,
      "slopeDir": 1,
      "tilt": 0.35,
      "activeWhenOn": true
    },
    {
      "kind": "vinePlatform",
      "x": 1392,
      "y": 312,
      "w": 232,
      "h": 16,
      "active": true,
      "activeWhenOn": true,
      "vineStyle": "current"
    },
    {
      "x": 880,
      "y": 216,
      "w": 456,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 720,
      "y": 256,
      "w": 64,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 784,
      "y": 256,
      "w": 16,
      "h": 72,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 784,
      "y": 104,
      "w": 16,
      "h": 72,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 800,
      "y": 160,
      "w": 64,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 864,
      "y": 160,
      "w": 16,
      "h": 72,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1392,
      "y": 152,
      "w": 280,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 864,
      "y": 0,
      "w": 16,
      "h": 88,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 880,
      "y": 72,
      "w": 80,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 960,
      "y": 72,
      "w": 16,
      "h": 80,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1952,
      "y": 240,
      "w": 16,
      "h": 88,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1128,
      "y": 104,
      "w": 144,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 1248,
      "y": 0,
      "w": 16,
      "h": 104,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 976,
      "y": 136,
      "w": 88,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 2720,
      "y": 320,
      "w": 280,
      "h": 40,
      "kind": "normal",
      "active": true,
      "groupId": ""
    },
    {
      "x": 2984,
      "y": 0,
      "w": 16,
      "h": 144,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "kind": "vinePlatform",
      "x": 1112,
      "y": 312,
      "w": 224,
      "h": 16,
      "active": true,
      "activeWhenOn": true,
      "vineStyle": "current"
    },
    {
      "x": 1904,
      "y": 128,
      "w": 16,
      "h": 72,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 2096,
      "y": 184,
      "w": 264,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 2080,
      "y": 184,
      "w": 16,
      "h": 72,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 2288,
      "y": 296,
      "w": 112,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current",
      "tilt": "0.5"
    },
    {
      "x": 1808,
      "y": 56,
      "w": 16,
      "h": 56,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 2032,
      "y": 56,
      "w": 16,
      "h": 88,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 2672,
      "y": 200,
      "w": 208,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 2624,
      "y": 56,
      "w": 16,
      "h": 160,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "kind": "teacupSpin",
      "x": 2392,
      "y": 208,
      "w": 176,
      "h": 16,
      "active": true,
      "tilt": 0.6,
      "activeWhenOn": true
    },
    {
      "x": 2560,
      "y": 296,
      "w": 112,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current",
      "tilt": "0.5"
    },
    {
      "x": 1808,
      "y": 184,
      "w": 16,
      "h": 72,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 2896,
      "y": 128,
      "w": 88,
      "h": 16,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    },
    {
      "x": 2880,
      "y": 80,
      "w": 16,
      "h": 136,
      "kind": "vinePlatform",
      "active": true,
      "vineStyle": "current"
    }
  ],
  "residents": [
    {
      "type": "spoon",
      "groupId": "",
      "x": 888,
      "y": 280,
      "minX": 808,
      "maxX": 1000
    },
    {
      "type": "teaImp",
      "groupId": "",
      "x": 976,
      "y": 184,
      "minX": 888,
      "maxX": 1144
    },
    {
      "type": "teaImp",
      "groupId": "",
      "x": 1152,
      "y": 280,
      "minX": 1128,
      "maxX": 1304
    },
    {
      "type": "jelly",
      "groupId": "",
      "x": 656,
      "y": 176,
      "minX": 608,
      "maxX": 712,
      "speed": 23
    },
    {
      "type": "jelly",
      "groupId": "",
      "x": 1752,
      "y": 216,
      "minX": 1704,
      "maxX": 1800,
      "speed": 23
    },
    {
      "type": "spoon",
      "groupId": "",
      "x": 1480,
      "y": 280,
      "minX": 1400,
      "maxX": 1616
    },
    {
      "type": "spoon",
      "groupId": "",
      "x": 2184,
      "y": 152,
      "minX": 2104,
      "maxX": 2352
    }
  ],
  "items": [
    {
      "x": 752,
      "y": 56,
      "kind": "coin"
    },
    {
      "x": 1968,
      "y": 104,
      "kind": "coin"
    },
    {
      "x": 920,
      "y": 24,
      "kind": "coin",
      "groupId": ""
    },
    {
      "x": 896,
      "y": 48,
      "kind": "coin"
    },
    {
      "x": 944,
      "y": 48,
      "kind": "coin"
    },
    {
      "x": 344,
      "y": 168,
      "kind": "largeBeanCoin"
    },
    {
      "x": 1968,
      "y": 192,
      "kind": "coin"
    },
    {
      "x": 1904,
      "y": 240,
      "kind": "coin"
    },
    {
      "x": 1744,
      "y": 112,
      "kind": "teacup"
    },
    {
      "x": 2944,
      "y": 88,
      "kind": "dreamDrop",
      "groupId": ""
    },
    {
      "x": 1480,
      "y": 120,
      "kind": "coin"
    },
    {
      "x": 1504,
      "y": 96,
      "kind": "coin"
    },
    {
      "x": 1528,
      "y": 120,
      "kind": "coin"
    },
    {
      "x": 1992,
      "y": 88,
      "kind": "coin"
    },
    {
      "x": 2016,
      "y": 104,
      "kind": "coin"
    },
    {
      "x": 2496,
      "y": 120,
      "kind": "zundamochi",
      "groupId": ""
    },
    {
      "x": 2344,
      "y": 264,
      "kind": "coin"
    },
    {
      "x": 2632,
      "y": 256,
      "kind": "coin"
    }
  ],
  "decorations": [],
  "checkpoints": [
    {
      "id": "after_rose_door_1",
      "x": 1496,
      "y": 224,
      "w": 28,
      "h": 48,
      "respawn": {
        "x": 1496,
        "y": 240
      },
      "imageKey": "stage_checkpoint_flag"
    }
  ],
  "doors": [
    {
      "id": "rose_maze_door_1",
      "groupId": "rose_maze",
      "x": 312,
      "y": 232,
      "w": 56,
      "h": 88,
      "openCondition": "switch",
      "switchId": "rose_maze_switch_1",
      "openWhenOn": true,
      "imageKey": "door_bow"
    },
    {
      "id": "rose_maze_door_2",
      "groupId": "rose_maze",
      "x": 1176,
      "y": 128,
      "w": 56,
      "h": 88,
      "openCondition": "switch",
      "switchId": "rose_maze_switch_2",
      "openWhenOn": true,
      "imageKey": "door_bow"
    },
    {
      "id": "rose_maze_door_3",
      "groupId": "rose_maze",
      "x": 2800,
      "y": 232,
      "w": 56,
      "h": 88,
      "openCondition": "switch",
      "switchId": "rose_maze_switch_3",
      "openWhenOn": true,
      "imageKey": "door_bow"
    }
  ],
  "switchTargets": [],
  "switchGimmicks": [
    {
      "id": "rose_maze_switch_1",
      "kind": "glassRose",
      "groupId": "rose_maze",
      "setId": "rose_maze_set_1",
      "x": 184,
      "y": 272,
      "w": 42,
      "h": 48,
      "switchId": "rose_maze_switch_1",
      "color": "red",
      "required": 1,
      "litDuration": 0,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ]
    },
    {
      "id": "rose_maze_switch_2",
      "kind": "glassRose",
      "groupId": "rose_maze",
      "setId": "rose_maze_set_2",
      "x": 1272,
      "y": 264,
      "w": 42,
      "h": 48,
      "switchId": "rose_maze_switch_2",
      "color": "blue",
      "required": 2,
      "litDuration": 0,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ]
    },
    {
      "id": "rose_maze_switch_3_3",
      "kind": "glassRose",
      "groupId": "rose_maze",
      "setId": "rose_maze_set_3",
      "x": 1568,
      "y": 104,
      "w": 42,
      "h": 48,
      "switchId": "rose_maze_switch_3",
      "color": "yellow",
      "required": 3,
      "litDuration": 0,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ]
    },
    {
      "id": "rose_maze_switch_2_2",
      "kind": "glassRose",
      "groupId": "rose_maze",
      "setId": "rose_maze_set_2",
      "x": 1200,
      "y": 56,
      "w": 42,
      "h": 48,
      "switchId": "rose_maze_switch_2",
      "color": "blue",
      "required": 2,
      "litDuration": 0,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ]
    },
    {
      "id": "rose_maze_switch_3_2",
      "kind": "glassRose",
      "groupId": "rose_maze",
      "setId": "rose_maze_set_3",
      "x": 2744,
      "y": 152,
      "w": 42,
      "h": 48,
      "switchId": "rose_maze_switch_3",
      "color": "yellow",
      "required": 3,
      "litDuration": 0,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ]
    },
    {
      "id": "rose_maze_switch_3_2_2",
      "kind": "glassRose",
      "groupId": "rose_maze",
      "setId": "rose_maze_set_3",
      "x": 1976,
      "y": 264,
      "w": 42,
      "h": 48,
      "switchId": "rose_maze_switch_3",
      "color": "yellow",
      "required": 3,
      "litDuration": 0,
      "triggerBy": [
        "player",
        "nano",
        "magic"
      ]
    }
  ],
  "balloonRides": [],
  "specialEvents": [],
  "route": {
    "id": "teacup_castle",
    "startStageId": "teacup_castle_area_1",
    "stageIds": [
      "teacup_castle_area_1",
      "teacup_castle_area_2",
      "teacup_castle_area_3",
      "teacup_castle_boss"
    ],
    "index": 2,
    "nextStageId": "teacup_castle_boss",
    "saveStageId": "teacup_castle",
    "areaName": "エリア3",
    "rankTimeS": 420,
    "rankTimeA": 600,
    "ending": false
  },
  "areaRole": "area_3",
  "areas": [
    {
      "id": "area_3",
      "name": "エリア3",
      "startX": 0,
      "endX": 3000,
      "respawn": {
        "x": 48,
        "y": 288
      }
    }
  ]
};

export default stage;
