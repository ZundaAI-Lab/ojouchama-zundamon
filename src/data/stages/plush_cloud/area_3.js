/**
 * 責務: ぬいぐるみ雲：空のゆりかご のステージデータを定義する。
 * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。
 * 更新ルール: 風船ライド区間の開始・ゴール・専用障害物はballoonRidesへ置き、迷える住民は通常と同じresidentsへrideId付きで集約する。
 */
const stage = {
  id: "plush_cloud_area_3",
  worldIndex: 3,
  name: "ぬいぐるみ雲：空のゆりかご",
  backgroundKey: "bg_plush_cloud",
  "bgm": "world4-plush-cloud-sky",
  width: 2480,
  height: 360,
  playerStart: {
    x: 48,
    y: 256
  },
  goal: {
    x: 2384,
    y: 232
  },
  boss: null,
  introDialogue: [],
  bossDialogue: [],
  bossDefeatDialogue: [],
  clearDialogue: [],
  areaClearDialogue: [
    {
      portrait: "portrait_smile",
      speaker: "お嬢ちゃまずんだもん",
      text: "ふわふわの風船で、空のゆりかごを渡りきったの！"
    }
  ],
  platforms: [
    {
      x: 0,
      y: 320,
      w: 320,
      h: 32
    },
    {
      x: 2040,
      y: 296,
      w: 192,
      h: 32,
      kind: "balloonGoalCloud"
    },
    {
      x: 2240,
      y: 320,
      w: 240,
      h: 32
    }
  ],
  residents: [
    {
      rideId: "plush_cloud_balloon_ride_01",
      type: "stormCloud",
      x: 800,
      y: 136,
      w: 48,
      h: 40,
      ampX: 4,
      ampY: 8,
      fireEvery: 4.8,
      fireDelay: 2.2,
      shotSpeed: 112,
      hp: 2,
      drawW: 58
    },
    {
      rideId: "plush_cloud_balloon_ride_01",
      type: "stormCloud",
      x: 1304,
      y: 240,
      w: 48,
      h: 40,
      ampX: 4,
      ampY: 8,
      fireEvery: 4.8,
      fireDelay: 2.2,
      shotSpeed: 112,
      hp: 2,
      drawW: 58
    },
    {
      rideId: "plush_cloud_balloon_ride_01",
      type: "thornCloud",
      x: 1192,
      y: 248,
      w: 48,
      h: 40,
      ampX: 4,
      ampY: 8,
      hp: 2,
      drawW: 58
    },
    {
      rideId: "plush_cloud_balloon_ride_01",
      type: "balloonBird",
      x: 704,
      y: 208,
      w: 32,
      h: 24,
      ampX: 12,
      ampY: 12,
      hp: 1,
      drawW: 42,
      diveTriggerRangeX: 130,
      diveTriggerRangeY: 100,
      idleRiseSpeed: 14,
      diveDrop: 54,
      diveCooldown: 1.05
    },
    {
      rideId: "plush_cloud_balloon_ride_01",
      type: "balloonBird",
      x: 984,
      y: 184,
      w: 32,
      h: 24,
      ampX: 12,
      ampY: 12,
      hp: 1,
      drawW: 42,
      diveTriggerRangeX: 130,
      diveTriggerRangeY: 100,
      idleRiseSpeed: 14,
      diveDrop: 54,
      diveCooldown: 1.05
    },
    {
      rideId: "plush_cloud_balloon_ride_01",
      type: "balloonBird",
      x: 1000,
      y: 240,
      w: 32,
      h: 24,
      ampX: 12,
      ampY: 12,
      hp: 1,
      drawW: 42,
      diveTriggerRangeX: 130,
      diveTriggerRangeY: 100,
      idleRiseSpeed: 14,
      diveDrop: 54,
      diveCooldown: 1.05
    },
    {
      rideId: "plush_cloud_balloon_ride_01",
      type: "balloonBird",
      x: 1400,
      y: 248,
      w: 32,
      h: 24,
      ampX: 12,
      ampY: 12,
      hp: 1,
      drawW: 42,
      diveTriggerRangeX: 130,
      diveTriggerRangeY: 100,
      idleRiseSpeed: 14,
      diveDrop: 54,
      diveCooldown: 1.05
    },
    {
      rideId: "plush_cloud_balloon_ride_01",
      type: "balloonBird",
      x: 1448,
      y: 168,
      w: 32,
      h: 24,
      ampX: 12,
      ampY: 12,
      hp: 1,
      drawW: 42,
      diveTriggerRangeX: 130,
      diveTriggerRangeY: 100,
      idleRiseSpeed: 14,
      diveDrop: 54,
      diveCooldown: 1.05
    },
    {
      rideId: "plush_cloud_balloon_ride_01",
      type: "cloudImp",
      x: 1784,
      y: 152,
      w: 48,
      h: 40,
      ampY: 10,
      fireEvery: 3.4,
      fireDelay: 2.4,
      shotSpeed: -82,
      hp: 1,
      drawW: 58
    }
  ],
  items: [
    {
      x: 608,
      y: 192,
      kind: "coin"
    },
    {
      x: 704,
      y: 160,
      kind: "coin"
    },
    {
      x: 792,
      y: 192,
      kind: "coin"
    },
    {
      x: 1144,
      y: 152,
      kind: "zundamochi"
    },
    {
      x: 1512,
      y: 152,
      kind: "teacup"
    },
    {
      x: 1840,
      y: 176,
      kind: "coin"
    },
    {
      x: 1920,
      y: 208,
      kind: "coin"
    }
  ],
  balloonRides: [
    {
      id: "plush_cloud_balloon_ride_01",
      start: {
        x: 240,
        y: 224,
        w: 40,
        h: 96,
        cameraX: 0,
        respawn: {
          x: 48,
          y: 256
        }
      },
      goal: {
        x: 2040,
        y: 296,
        w: 192,
        h: 32
      },
      config: {
        scrollSpeed: 64,
        moveSpeedX: 146,
        moveSpeedY: 128,
        startDelay: 0.48,
        hitGrace: 0.92,
        balloonLossDownDrift: 10,
        bounds: {
          minX: 72,
          maxX: 372,
          minY: 38,
          maxY: 218
        }
      },
      hazards: [
        {
          kind: "windMine",
          x: 1624,
          y: 184,
          w: 32,
          h: 32,
          active: true
        }
      ]
    }
  ],
  decorations: [
    {
      x: 120,
      y: 160,
      r: 10,
      color: "rgba(255,255,255,0.25)"
    },
    {
      x: 520,
      y: 136,
      r: 7,
      color: "rgba(255,242,171,0.34)"
    },
    {
      x: 984,
      y: 152,
      r: 8,
      color: "rgba(255,255,255,0.22)"
    },
    {
      x: 1504,
      y: 144,
      r: 10,
      color: "rgba(246,251,207,0.26)"
    },
    {
      x: 2112,
      y: 176,
      r: 9,
      color: "rgba(255,255,255,0.22)"
    }
  ],
  route: {
    id: "plush_cloud",
    startStageId: "plush_cloud_area_1",
    stageIds: [
      "plush_cloud_area_1",
      "plush_cloud_area_2",
      "plush_cloud_area_3",
      "plush_cloud_boss"
    ],
    index: 2,
    nextStageId: "plush_cloud_boss",
    saveStageId: "plush_cloud",
    areaName: "エリア3",
    rankTimeS: 330,
    rankTimeA: 470,
    ending: false
  },
  areaRole: "area_3",
  areas: [
    {
      id: "area_3",
      name: "エリア3",
      startX: 0,
      endX: 2520,
      respawn: {
        x: 48,
        y: 256
      }
    }
  ]
};

export default stage;
