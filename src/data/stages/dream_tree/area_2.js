/**
 * 責務: 夢みる豆の木：夢風船のぼり のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 * 更新ルール: このステージは上昇スクロール風船ライドを主軸にし、開始・ゴール・専用障害物はballoonRidesへ、迷える住民は通常residentsへrideId付きで集約する。
 */
const stage = {
  "id": "dream_tree_area_2",
  "worldIndex": 5,
  "testStage": false,
  "name": "夢みる豆の木：夢風船のぼり",
  "backgroundKey": "bg_dream_tree_h",
  "bgm": "world6-dreaming-beanstalk",
  "width": 480,
  "height": 2000,
  "playerStart": {
    "x": 72,
    "y": 1936
  },
  "goal": {
    "x": 448,
    "y": 176
  },
  "boss": null,
  "introDialogue": [
    {
      "portrait": "npc_bean_gardener",
      "speaker": "豆の木の庭師",
      "text": "ここから先は、夢風船で豆の木をのぼる道なのです。下へ流されないよう、ふわりふわりと上を目指してくださいませ。"
    },
    {
      "portrait": "portrait_determined",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "夢風船のぼりなの！ 風船を守って、豆の木の上まで行くの。"
    }
  ],
  "bossDialogue": [],
  "bossDefeatDialogue": [],
  "clearDialogue": [],
  "areaClearDialogue": [
    {
      "portrait": "portrait_proud",
      "speaker": "お嬢ちゃまずんだもん",
      "text": "豆の木をふわりと登りきったの。"
    }
  ],
  "platforms": [
    {
      "x": 0,
      "y": 1976,
      "w": 480,
      "h": 24,
      "kind": "normal",
      "active": true
    },
    {
      "x": 96,
      "y": 1664,
      "w": 112,
      "h": 16,
      "kind": "cloud",
      "active": true
    },
    {
      "x": 288,
      "y": 1544,
      "w": 120,
      "h": 16,
      "kind": "sleepCloud",
      "active": true
    },
    {
      "x": 80,
      "y": 1360,
      "w": 96,
      "h": 16,
      "kind": "cloud",
      "active": true
    },
    {
      "x": 312,
      "y": 1168,
      "w": 104,
      "h": 16,
      "kind": "sleepCloud",
      "active": true
    },
    {
      "x": 48,
      "y": 976,
      "w": 112,
      "h": 16,
      "kind": "cloud",
      "active": true
    },
    {
      "x": 320,
      "y": 760,
      "w": 104,
      "h": 16,
      "kind": "sleepCloud",
      "active": true
    },
    {
      "x": 80,
      "y": 552,
      "w": 112,
      "h": 16,
      "kind": "cloud",
      "active": true
    },
    {
      "x": 120,
      "y": 208,
      "w": 240,
      "h": 32,
      "kind": "balloonGoalCloud",
      "active": true
    },
    {
      "kind": "cloud",
      "x": 0,
      "y": 208,
      "w": 120,
      "h": 16,
      "active": true
    },
    {
      "kind": "cloud",
      "x": 360,
      "y": 208,
      "w": 120,
      "h": 16,
      "active": true
    },
    {
      "x": 192,
      "y": 1944,
      "w": 88,
      "h": 16,
      "kind": "cloud",
      "active": true
    }
  ],
  "residents": [
    {
      "rideId": "dream_tree_vertical_balloon_ride_01",
      "type": "balloonBird",
      "x": 96,
      "y": 1472,
      "w": 32,
      "h": 24,
      "ampX": 72,
      "ampY": 16,
      "hp": 1,
      "drawW": 42,
      "diveTriggerRangeX": 128,
      "diveTriggerRangeY": 104,
      "divePatrolFrequencyX": 1.15,
      "divePatrolFrequencyY": 2,
      "diveDrop": 40,
      "diveHorizontalDrift": 18,
      "diveCooldown": 10,
      "minX": 0,
      "maxX": 480
    },
    {
      "rideId": "dream_tree_vertical_balloon_ride_01",
      "type": "stormCloud",
      "x": 344,
      "y": 1320,
      "w": 48,
      "h": 40,
      "ampX": 8,
      "ampY": 12,
      "fireEvery": 4.4,
      "fireDelay": 1.8,
      "shotSpeed": 116,
      "hp": 2,
      "drawW": 58
    },
    {
      "rideId": "dream_tree_vertical_balloon_ride_01",
      "type": "thornCloud",
      "x": 72,
      "y": 1120,
      "w": 48,
      "h": 40,
      "ampX": 8,
      "ampY": 12,
      "hp": 2,
      "drawW": 58
    },
    {
      "rideId": "dream_tree_vertical_balloon_ride_01",
      "type": "balloonBird",
      "x": 336,
      "y": 936,
      "w": 32,
      "h": 24,
      "ampX": 64,
      "ampY": 16,
      "hp": 1,
      "drawW": 42,
      "diveTriggerRangeX": 132,
      "diveTriggerRangeY": 104,
      "divePatrolFrequencyX": 1.22,
      "divePatrolFrequencyY": 2.1,
      "diveDrop": 40,
      "diveHorizontalDrift": 18,
      "diveCooldown": 10,
      "minX": 0,
      "maxX": 480
    },
    {
      "rideId": "dream_tree_vertical_balloon_ride_01",
      "type": "cloudImp",
      "x": 56,
      "y": 704,
      "w": 48,
      "h": 40,
      "ampY": 14,
      "fireEvery": 3,
      "fireDelay": 1.5,
      "shotSpeed": 88,
      "shotVy": -18,
      "hp": 2,
      "drawW": 58,
      "behaviorParams": {
        "aim": {
          "mode": "towardViewportCenterX",
          "y": 0
        },
        "emit": {
          "faceAim": true
        }
      }
    },
    {
      "rideId": "dream_tree_vertical_balloon_ride_01",
      "type": "stormCloud",
      "x": 328,
      "y": 504,
      "w": 48,
      "h": 40,
      "ampX": 8,
      "ampY": 12,
      "fireEvery": 4,
      "fireDelay": 1.2,
      "shotSpeed": 124,
      "hp": 2,
      "drawW": 58
    },
    {
      "rideId": "dream_tree_vertical_balloon_ride_01",
      "type": "balloonBird",
      "x": 120,
      "y": 328,
      "w": 32,
      "h": 24,
      "ampX": 80,
      "ampY": 18,
      "hp": 1,
      "drawW": 42,
      "diveTriggerRangeX": 140,
      "diveTriggerRangeY": 112,
      "divePatrolFrequencyX": 1.28,
      "divePatrolFrequencyY": 2.05,
      "diveDrop": 40,
      "diveHorizontalDrift": 20,
      "diveCooldown": 10,
      "minX": 0,
      "maxX": 480
    }
  ],
  "items": [
    {
      "x": 152,
      "y": 1512,
      "kind": "coin"
    },
    {
      "x": 232,
      "y": 1408,
      "kind": "coin"
    },
    {
      "x": 328,
      "y": 1248,
      "kind": "zundamochi"
    },
    {
      "x": 128,
      "y": 1040,
      "kind": "coin"
    },
    {
      "x": 344,
      "y": 848,
      "kind": "coin"
    },
    {
      "x": 168,
      "y": 672,
      "kind": "teacup"
    },
    {
      "x": 304,
      "y": 456,
      "kind": "coin"
    },
    {
      "x": 232,
      "y": 304,
      "kind": "largeBeanCoin"
    }
  ],
  "decorations": [
    {
      "x": 88,
      "y": 1600,
      "r": 9,
      "color": "rgba(185,255,152,0.30)"
    },
    {
      "x": 384,
      "y": 1464,
      "r": 8,
      "color": "rgba(255,255,210,0.26)"
    },
    {
      "x": 112,
      "y": 1232,
      "r": 11,
      "color": "rgba(176,255,137,0.26)"
    },
    {
      "x": 392,
      "y": 1040,
      "r": 8,
      "color": "rgba(255,255,255,0.20)"
    },
    {
      "x": 104,
      "y": 816,
      "r": 9,
      "color": "rgba(174,244,255,0.22)"
    },
    {
      "x": 360,
      "y": 584,
      "r": 12,
      "color": "rgba(186,255,150,0.28)"
    },
    {
      "x": 128,
      "y": 368,
      "r": 8,
      "color": "rgba(255,255,255,0.23)"
    },
    {
      "x": 344,
      "y": 208,
      "r": 10,
      "color": "rgba(255,247,171,0.26)"
    }
  ],
  "checkpoints": [],
  "doors": [],
  "switchTargets": [],
  "switchGimmicks": [],
  "balloonRides": [
    {
      "id": "dream_tree_vertical_balloon_ride_01",
      "groupId": "",
      "start": {
        "x": 216,
        "y": 1848,
        "w": 40,
        "h": 96,
        "cameraX": 0,
        "cameraY": 1568,
        "respawn": {
          "x": 216,
          "y": 1900
        }
      },
      "goal": {
        "x": 128,
        "y": 200,
        "w": 240,
        "h": 32,
        "archW": 88
      },
      "config": {
        "scrollMode": "verticalUp",
        "scrollSpeed": 58,
        "moveSpeedX": 148,
        "moveSpeedY": 132,
        "accel": 720,
        "drag": 820,
        "startDelay": 0.52,
        "startLiftY": 18,
        "startInvincible": 0.86,
        "hitGrace": 0.98,
        "hitVisualTime": 0.38,
        "failTime": 0.92,
        "clearTime": 0.85,
        "balloonLossDownDrift": 13,
        "failScreenMarginY": 80,
        "bounds": {
          "minX": 56,
          "maxX": 396,
          "minY": 36,
          "maxY": 222
        }
      },
      "hazards": ""
    }
  ],
  "specialEvents": [],
  "route": {
    "id": "dream_tree",
    "startStageId": "dream_tree_area_1",
    "stageIds": [
      "dream_tree_area_1",
      "dream_tree_area_2",
      "dream_tree_area_3",
      "dream_tree_boss"
    ],
    "index": 1,
    "nextStageId": "dream_tree_area_3",
    "saveStageId": "dream_tree",
    "areaName": "エリア2",
    "rankTimeS": 420,
    "rankTimeA": 600,
    "ending": true
  },
  "areaRole": "area_2",
  "areas": [
    {
      "id": "area_2",
      "name": "エリア2",
      "startX": 0,
      "endX": 480,
      "respawn": {
        "x": 216,
        "y": 1704
      }
    }
  ]
};

export default stage;
