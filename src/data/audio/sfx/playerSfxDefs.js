/**
 * 責務: PLAYER_SFX_DEFS に属するSEレシピだけを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。
 */
export const PLAYER_SFX_DEFS = {
  "player_jump": {
    "id": "player_jump",
    "name": "プレイヤージャンプ",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "square",
        "startFreq": 520,
        "endFreq": 760,
        "duration": 0.08,
        "volume": 0.034,
        "attack": 0.006,
        "release": 0.04,
        "filterFreq": 3200
      }
    ]
  },
  "player_land": {
    "id": "player_land",
    "name": "プレイヤー着地",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 190,
        "duration": 0.055,
        "volume": 0.025,
        "attack": 0.004,
        "release": 0.035,
        "filterFreq": 900
      },
      {
        "type": "noise",
        "duration": 0.035,
        "volume": 0.008,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 700
      }
    ]
  },
  "player_hurt": {
    "id": "player_hurt",
    "name": "プレイヤー被弾",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "sawtooth",
        "startFreq": 300,
        "endFreq": 170,
        "duration": 0.105,
        "volume": 0.044,
        "attack": 0.004,
        "release": 0.055,
        "filterFreq": 1600
      },
      {
        "type": "noise",
        "duration": 0.075,
        "volume": 0.016,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1350,
        "offset": 0.006
      }
    ]
  },
  "player_down": {
    "id": "player_down",
    "name": "プレイヤーダウン",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "sawtooth",
        "startFreq": 360,
        "endFreq": 150,
        "duration": 0.16,
        "volume": 0.042,
        "attack": 0.005,
        "release": 0.075,
        "filterFreq": 1300
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 220,
        "duration": 0.12,
        "volume": 0.018,
        "attack": 0.01,
        "release": 0.08,
        "offset": 0.08
      }
    ]
  },
  "player_fall_respawn": {
    "id": "player_fall_respawn",
    "name": "落下復帰",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 420,
        "endFreq": 190,
        "duration": 0.12,
        "volume": 0.032,
        "attack": 0.004,
        "release": 0.05
      },
      {
        "type": "sweep",
        "waveform": "sine",
        "startFreq": 460,
        "endFreq": 760,
        "duration": 0.12,
        "volume": 0.024,
        "attack": 0.01,
        "release": 0.06,
        "offset": 0.14
      }
    ]
  },
  "magic_cast": {
    "id": "magic_cast",
    "name": "豆の魔法発射",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 760,
        "endFreq": 1120,
        "duration": 0.085,
        "volume": 0.036,
        "attack": 0.006,
        "release": 0.04
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1480,
        "duration": 0.07,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.045,
        "offset": 0.035,
        "pan": 0.14
      }
    ]
  },
  "magic_cast_boosted": {
    "id": "magic_cast_boosted",
    "name": "強化魔法発射",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 760,
        "endFreq": 1280,
        "duration": 0.1,
        "volume": 0.04,
        "attack": 0.006,
        "release": 0.045
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1520,
        "duration": 0.12,
        "volume": 0.018,
        "attack": 0.01,
        "release": 0.07,
        "offset": 0.028,
        "pan": -0.12
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1820,
        "duration": 0.09,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.06,
        "offset": 0.06,
        "pan": 0.16
      }
    ]
  },
  "magic_hit": {
    "id": "magic_hit",
    "name": "魔法命中",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1180,
        "duration": 0.055,
        "volume": 0.032,
        "attack": 0.004,
        "release": 0.035
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 1580,
        "duration": 0.07,
        "volume": 0.014,
        "attack": 0.01,
        "release": 0.04,
        "offset": 0.028,
        "pan": 0.1
      }
    ]
  },
  "magic_wall": {
    "id": "magic_wall",
    "name": "魔法消滅",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 780,
        "endFreq": 360,
        "duration": 0.08,
        "volume": 0.024,
        "attack": 0.004,
        "release": 0.04
      },
      {
        "type": "noise",
        "duration": 0.045,
        "volume": 0.007,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1400
      }
    ]
  },
  "magic_reflect": {
    "id": "magic_reflect",
    "name": "魔法反射",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 820,
        "endFreq": 1460,
        "duration": 0.1,
        "volume": 0.04,
        "attack": 0.004,
        "release": 0.05,
        "pan": -0.16
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1720,
        "duration": 0.09,
        "volume": 0.017,
        "attack": 0.01,
        "release": 0.055,
        "offset": 0.055,
        "pan": 0.18
      }
    ]
  },
  "bow_use": {
    "id": "bow_use",
    "name": "おじぎ使用",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 740,
        "duration": 0.075,
        "volume": 0.034,
        "attack": 0.01,
        "release": 0.04
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 930,
        "duration": 0.08,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.045,
        "offset": 0.05
      }
    ]
  },
  "bow_success": {
    "id": "bow_success",
    "name": "おじぎ成功",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.09,
        "volume": 0.028,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 660,
            "duration": 0.09,
            "volume": 0.028
          },
          {
            "offset": 0.085,
            "startFreq": 880,
            "duration": 0.09,
            "volume": 0.03
          },
          {
            "offset": 0.18,
            "startFreq": 1180,
            "duration": 0.16,
            "volume": 0.032
          }
        ]
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1480,
        "duration": 0.13,
        "volume": 0.011,
        "attack": 0.01,
        "release": 0.08,
        "offset": 0.26,
        "pan": 0.12
      }
    ]
  },
  "tea_use": {
    "id": "tea_use",
    "name": "ティータイム使用",
    "gain": 1,
    "voices": [
      {
        "type": "chord",
        "waveform": "sine",
        "startFreq": 520,
        "notes": [
          0,
          4,
          7
        ],
        "duration": 0.14,
        "volume": 0.032,
        "attack": 0.012,
        "release": 0.07
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1320,
        "duration": 0.1,
        "volume": 0.014,
        "attack": 0.01,
        "release": 0.06,
        "offset": 0.095,
        "pan": 0.14
      }
    ]
  },
  "tea_no_cup": {
    "id": "tea_no_cup",
    "name": "ティーカップ不足",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 360,
        "endFreq": 230,
        "duration": 0.11,
        "volume": 0.03,
        "attack": 0.006,
        "release": 0.055
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 300,
        "duration": 0.06,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.04,
        "offset": 0.055
      }
    ]
  }
};
