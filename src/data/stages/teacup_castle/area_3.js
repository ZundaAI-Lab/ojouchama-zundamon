/**
 * 責務: ティーカップ城：バラの迷路 のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 * 更新ルール: 迷路構造は、扉上部の蔓壁＋閉鎖扉で床から天井まで遮断し、扉開放前に先へ進める抜け道を作らない。
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
    "x": 48,
    "y": 288
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
    { "x": 0, "y": 320, "w": 3000, "h": 40, "kind": "vinePlatform", "active": true, "vineStyle": "current" },

    { "x": 700, "y": 0, "w": 56, "h": 232, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 1540, "y": 0, "w": 56, "h": 232, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 2380, "y": 0, "w": 56, "h": 232, "kind": "vinePlatform", "active": true, "vineStyle": "current" },

    { "x": 128, "y": 288, "w": 120, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 264, "y": 256, "w": 120, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 400, "y": 224, "w": 120, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 536, "y": 192, "w": 104, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 80, "y": 224, "w": 96, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },

    { "x": 820, "y": 288, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 960, "y": 256, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 1100, "y": 224, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 1240, "y": 192, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 1360, "y": 160, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 880, "y": 192, "w": 96, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },

    { "x": 1680, "y": 288, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 1816, "y": 256, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 1952, "y": 224, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 2088, "y": 192, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 2224, "y": 160, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 1736, "y": 208, "w": 96, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },

    { "x": 2504, "y": 288, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" },
    { "x": 2632, "y": 256, "w": 112, "h": 16, "kind": "vinePlatform", "active": true, "vineStyle": "current" }
  ],
  "residents": [],
  "items": [
    { "x": 96, "y": 288, "kind": "coin" },
    { "x": 344, "y": 224, "kind": "coin" },
    { "x": 584, "y": 160, "kind": "largeBeanCoin" },
    { "x": 904, "y": 160, "kind": "coin" },
    { "x": 1156, "y": 192, "kind": "coin" },
    { "x": 1416, "y": 128, "kind": "largeBeanCoin" },
    { "x": 1788, "y": 176, "kind": "coin" },
    { "x": 2008, "y": 192, "kind": "coin" },
    { "x": 2280, "y": 128, "kind": "teacup" },
    { "x": 2704, "y": 224, "kind": "coin" }
  ],
  "decorations": [
    { "x": 120, "y": 160, "r": 10, "color": "rgba(255,255,255,0.25)" },
    { "x": 520, "y": 144, "r": 7, "color": "rgba(255,242,171,0.34)" },
    { "x": 984, "y": 152, "r": 8, "color": "rgba(255,255,255,0.22)" },
    { "x": 1504, "y": 144, "r": 10, "color": "rgba(246,251,207,0.26)" },
    { "x": 2104, "y": 176, "r": 9, "color": "rgba(255,255,255,0.22)" },
    { "x": 2560, "y": 150, "r": 8, "color": "rgba(255,242,171,0.28)" }
  ],
  "checkpoints": [
    { "id": "after_rose_door_1", "x": 816, "y": 320, "w": 28, "h": 48, "respawn": { "x": 792, "y": 288 } },
    { "id": "after_rose_door_2", "x": 1656, "y": 320, "w": 28, "h": 48, "respawn": { "x": 1632, "y": 288 } },
    { "id": "after_rose_door_3", "x": 2496, "y": 320, "w": 28, "h": 48, "respawn": { "x": 2472, "y": 288 } }
  ],
  "doors": [
    { "id": "rose_maze_door_1", "groupId": "rose_maze", "x": 700, "y": 232, "w": 56, "h": 88, "openCondition": "switch", "switchId": "rose_maze_switch_1", "openWhenOn": true, "imageKey": "door_bow" },
    { "id": "rose_maze_door_2", "groupId": "rose_maze", "x": 1540, "y": 232, "w": 56, "h": 88, "openCondition": "switch", "switchId": "rose_maze_switch_2", "openWhenOn": true, "imageKey": "door_bow" },
    { "id": "rose_maze_door_3", "groupId": "rose_maze", "x": 2380, "y": 232, "w": 56, "h": 88, "openCondition": "switch", "switchId": "rose_maze_switch_3", "openWhenOn": true, "imageKey": "door_bow" }
  ],
  "switchTargets": [],
  "switchGimmicks": [
    { "id": "rose_maze_switch_1", "kind": "glassRose", "groupId": "rose_maze", "setId": "rose_maze_set_1", "x": 568, "y": 144, "w": 42, "h": 48, "switchId": "rose_maze_switch_1", "color": "red", "required": 1, "litDuration": 0, "triggerBy": ["player", "nano", "magic"] },
    { "id": "rose_maze_switch_2", "kind": "glassRose", "groupId": "rose_maze", "setId": "rose_maze_set_2", "x": 1394, "y": 112, "w": 42, "h": 48, "switchId": "rose_maze_switch_2", "color": "blue", "required": 1, "litDuration": 0, "triggerBy": ["player", "nano", "magic"] },
    { "id": "rose_maze_switch_3", "kind": "glassRose", "groupId": "rose_maze", "setId": "rose_maze_set_3", "x": 2260, "y": 112, "w": 42, "h": 48, "switchId": "rose_maze_switch_3", "color": "yellow", "required": 1, "litDuration": 0, "triggerBy": ["player", "nano", "magic"] }
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
