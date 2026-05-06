/**
 * 責務: サウンドエディタとSfxPlayerが共有する、編集可能なSEレシピを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここでは役割名ID・表示名・voice配列だけを管理する。
 * 更新ルール: ゲーム内呼び出しは旧称ではなく、用途が分かる役割名IDへ統一する。
 */
export const SFX_DEFS = {
  "ui_move": {
    "id": "ui_move",
    "name": "UI移動",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 720,
        "duration": 0.045,
        "volume": 0.022,
        "attack": 0.004,
        "release": 0.022
      }
    ]
  },
  "ui_decide": {
    "id": "ui_decide",
    "name": "UI決定",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "sine",
        "duration": 0.055,
        "volume": 0.028,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 620,
            "duration": 0.055,
            "volume": 0.028
          },
          {
            "offset": 0.048,
            "startFreq": 880,
            "duration": 0.075,
            "volume": 0.024,
            "pan": 0.04
          }
        ]
      }
    ]
  },
  "ui_cancel": {
    "id": "ui_cancel",
    "name": "UIキャンセル",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 430,
        "endFreq": 260,
        "duration": 0.09,
        "volume": 0.027,
        "attack": 0.008,
        "release": 0.052
      }
    ]
  },
  "ui_invalid": {
    "id": "ui_invalid",
    "name": "UI不可",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 250,
        "endFreq": 180,
        "duration": 0.1,
        "volume": 0.026,
        "attack": 0.008,
        "release": 0.05
      },
      {
        "type": "noise",
        "duration": 0.055,
        "volume": 0.009,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 900,
        "offset": 0.012
      }
    ]
  },
  "dialog_next": {
    "id": "dialog_next",
    "name": "会話送り",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 860,
        "duration": 0.035,
        "volume": 0.016,
        "attack": 0.004,
        "release": 0.018
      }
    ]
  },
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
  },
  "item_coin": {
    "id": "item_coin",
    "name": "豆コイン取得",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "sine",
        "duration": 0.06,
        "volume": 0.032,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 980,
            "duration": 0.06,
            "volume": 0.032
          },
          {
            "offset": 0.05,
            "startFreq": 1320,
            "duration": 0.075,
            "volume": 0.024,
            "pan": 0.08
          }
        ]
      }
    ]
  },
  "item_large_coin": {
    "id": "item_large_coin",
    "name": "大きな豆コイン取得",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "sine",
        "duration": 0.07,
        "volume": 0.034,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 780,
            "duration": 0.07,
            "volume": 0.034
          },
          {
            "offset": 0.055,
            "startFreq": 1120,
            "duration": 0.075,
            "volume": 0.03,
            "pan": -0.08
          },
          {
            "offset": 0.115,
            "startFreq": 1500,
            "duration": 0.1,
            "volume": 0.026,
            "pan": 0.1
          }
        ]
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 390,
        "duration": 0.11,
        "volume": 0.014,
        "attack": 0.01,
        "release": 0.06
      }
    ]
  },
  "item_scone": {
    "id": "item_scone",
    "name": "スコーン取得",
    "gain": 1,
    "voices": [
      {
        "type": "chord",
        "waveform": "triangle",
        "startFreq": 520,
        "notes": [
          0,
          4,
          7
        ],
        "duration": 0.15,
        "volume": 0.03,
        "attack": 0.012,
        "release": 0.08
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1040,
        "duration": 0.12,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.06,
        "offset": 0.08
      }
    ]
  },
  "item_teacup": {
    "id": "item_teacup",
    "name": "ティーカップ取得",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1220,
        "duration": 0.1,
        "volume": 0.032,
        "attack": 0.004,
        "release": 0.08
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1640,
        "duration": 0.16,
        "volume": 0.014,
        "attack": 0.01,
        "release": 0.11,
        "offset": 0.045,
        "pan": 0.12
      }
    ]
  },
  "item_dream_drop": {
    "id": "item_dream_drop",
    "name": "夢のしずく取得",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.11,
        "volume": 0.026,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 880,
            "duration": 0.11,
            "volume": 0.026,
            "pan": -0.12
          },
          {
            "offset": 0.105,
            "startFreq": 1175,
            "duration": 0.12,
            "volume": 0.028,
            "pan": 0.12
          },
          {
            "offset": 0.22,
            "startFreq": 1568,
            "duration": 0.22,
            "volume": 0.03,
            "pan": 0
          }
        ]
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 2093,
        "duration": 0.24,
        "volume": 0.01,
        "attack": 0.01,
        "release": 0.14,
        "offset": 0.32
      }
    ]
  },
  "item_full": {
    "id": "item_full",
    "name": "アイテム満杯",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.06,
        "volume": 0.022,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 500,
            "duration": 0.06,
            "volume": 0.022
          },
          {
            "offset": 0.052,
            "startFreq": 430,
            "duration": 0.08,
            "volume": 0.018
          }
        ]
      }
    ]
  },
  "resident_hit": {
    "id": "resident_hit",
    "name": "住民命中",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 720,
        "duration": 0.055,
        "volume": 0.03,
        "attack": 0.004,
        "release": 0.035
      },
      {
        "type": "noise",
        "duration": 0.035,
        "volume": 0.007,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1500,
        "offset": 0.006
      }
    ]
  },
  "resident_purify": {
    "id": "resident_purify",
    "name": "住民浄化",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 420,
        "endFreq": 650,
        "duration": 0.11,
        "volume": 0.026,
        "attack": 0.006,
        "release": 0.055
      },
      {
        "type": "sequence",
        "waveform": "sine",
        "duration": 0.09,
        "volume": 0.024,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0.09,
            "startFreq": 780,
            "duration": 0.09,
            "volume": 0.024
          },
          {
            "offset": 0.18,
            "startFreq": 990,
            "duration": 0.1,
            "volume": 0.026,
            "pan": -0.08
          },
          {
            "offset": 0.3,
            "startFreq": 1320,
            "duration": 0.17,
            "volume": 0.03,
            "pan": 0.12
          }
        ]
      }
    ]
  },
  "resident_spawn": {
    "id": "resident_spawn",
    "name": "住民出現",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "sawtooth",
        "startFreq": 170,
        "endFreq": 420,
        "duration": 0.14,
        "volume": 0.034,
        "attack": 0.006,
        "release": 0.06,
        "filterFreq": 1400
      },
      {
        "type": "noise",
        "duration": 0.1,
        "volume": 0.014,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1000,
        "offset": 0.02
      }
    ]
  },
  "resident_attack": {
    "id": "resident_attack",
    "name": "住民攻撃",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 520,
        "endFreq": 900,
        "duration": 0.08,
        "volume": 0.034,
        "attack": 0.004,
        "release": 0.04
      },
      {
        "type": "tone",
        "waveform": "square",
        "startFreq": 760,
        "duration": 0.05,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.035,
        "offset": 0.035,
        "filterFreq": 2200
      }
    ]
  },
  "resident_charge": {
    "id": "resident_charge",
    "name": "住民攻撃予兆",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.05,
        "volume": 0.018,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 440,
            "duration": 0.05,
            "volume": 0.018
          },
          {
            "offset": 0.075,
            "startFreq": 560,
            "duration": 0.05,
            "volume": 0.021
          },
          {
            "offset": 0.15,
            "startFreq": 700,
            "duration": 0.07,
            "volume": 0.024
          }
        ]
      }
    ]
  },
  "resident_reflect": {
    "id": "resident_reflect",
    "name": "住民反射",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1420,
        "duration": 0.07,
        "volume": 0.026,
        "attack": 0.004,
        "release": 0.055,
        "pan": -0.14
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1180,
        "duration": 0.08,
        "volume": 0.022,
        "attack": 0.01,
        "release": 0.06,
        "offset": 0.052,
        "pan": 0.14
      }
    ]
  },
  "resident_projectile": {
    "id": "resident_projectile",
    "name": "住民弾発射",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 500,
        "endFreq": 760,
        "duration": 0.08,
        "volume": 0.028,
        "attack": 0.005,
        "release": 0.04
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 950,
        "duration": 0.06,
        "volume": 0.01,
        "attack": 0.01,
        "release": 0.035,
        "offset": 0.035
      }
    ]
  },
  "boss_intro_sting": {
    "id": "boss_intro_sting",
    "name": "ボス登場",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "sawtooth",
        "startFreq": 150,
        "duration": 0.18,
        "volume": 0.046,
        "attack": 0.006,
        "release": 0.08,
        "filterFreq": 900
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 225,
        "duration": 0.18,
        "volume": 0.028,
        "attack": 0.01,
        "release": 0.08,
        "offset": 0.1
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 980,
        "duration": 0.12,
        "volume": 0.018,
        "attack": 0.01,
        "release": 0.08,
        "offset": 0.22
      }
    ]
  },
  "boss_attack": {
    "id": "boss_attack",
    "name": "ボス攻撃",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "sawtooth",
        "startFreq": 260,
        "endFreq": 180,
        "duration": 0.1,
        "volume": 0.046,
        "attack": 0.004,
        "release": 0.05,
        "filterFreq": 1300
      },
      {
        "type": "noise",
        "duration": 0.085,
        "volume": 0.016,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1600,
        "offset": 0.015
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 520,
        "duration": 0.07,
        "volume": 0.014,
        "attack": 0.01,
        "release": 0.045,
        "offset": 0.05
      }
    ]
  },
  "boss_damage": {
    "id": "boss_damage",
    "name": "ボス被弾",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "sawtooth",
        "startFreq": 360,
        "endFreq": 210,
        "duration": 0.095,
        "volume": 0.042,
        "attack": 0.004,
        "release": 0.055,
        "filterFreq": 1200
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 520,
        "duration": 0.08,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.045,
        "offset": 0.04
      }
    ]
  },
  "boss_shield_block": {
    "id": "boss_shield_block",
    "name": "ボス盾防御",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 210,
        "duration": 0.1,
        "volume": 0.034,
        "attack": 0.004,
        "release": 0.055
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1320,
        "duration": 0.12,
        "volume": 0.024,
        "attack": 0.01,
        "release": 0.08,
        "offset": 0.02,
        "pan": -0.1
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1760,
        "duration": 0.08,
        "volume": 0.014,
        "attack": 0.01,
        "release": 0.06,
        "offset": 0.07,
        "pan": 0.12
      }
    ]
  },
  "boss_shield_break": {
    "id": "boss_shield_break",
    "name": "ボス盾解除",
    "gain": 1,
    "voices": [
      {
        "type": "noise",
        "duration": 0.12,
        "volume": 0.012,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1300
      },
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.08,
        "volume": 0.028,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0.08,
            "startFreq": 520,
            "duration": 0.08,
            "volume": 0.028
          },
          {
            "offset": 0.16,
            "startFreq": 760,
            "duration": 0.09,
            "volume": 0.03
          },
          {
            "offset": 0.27,
            "startFreq": 1120,
            "duration": 0.17,
            "volume": 0.034
          }
        ]
      }
    ]
  },
  "boss_defeat_jingle": {
    "id": "boss_defeat_jingle",
    "name": "ボス撃破ジングル",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.1,
        "volume": 0.03,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 520,
            "duration": 0.1,
            "volume": 0.03
          },
          {
            "offset": 0.1,
            "startFreq": 660,
            "duration": 0.1,
            "volume": 0.032
          },
          {
            "offset": 0.22,
            "startFreq": 880,
            "duration": 0.11,
            "volume": 0.034
          },
          {
            "offset": 0.36,
            "startFreq": 1320,
            "duration": 0.24,
            "volume": 0.038
          }
        ]
      },
      {
        "type": "chord",
        "waveform": "sine",
        "startFreq": 660,
        "notes": [
          0,
          4,
          7,
          12
        ],
        "duration": 0.42,
        "volume": 0.022,
        "attack": 0.012,
        "release": 0.16,
        "offset": 0.55
      }
    ]
  },
  "checkpoint": {
    "id": "checkpoint",
    "name": "チェックポイント",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.085,
        "volume": 0.028,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 660,
            "duration": 0.085,
            "volume": 0.028
          },
          {
            "offset": 0.08,
            "startFreq": 880,
            "duration": 0.085,
            "volume": 0.03
          },
          {
            "offset": 0.18,
            "startFreq": 1320,
            "duration": 0.16,
            "volume": 0.032
          }
        ]
      }
    ]
  },
  "area_enter": {
    "id": "area_enter",
    "name": "エリア到着",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "sine",
        "duration": 0.08,
        "volume": 0.026,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 620,
            "duration": 0.08,
            "volume": 0.026
          },
          {
            "offset": 0.09,
            "startFreq": 930,
            "duration": 0.12,
            "volume": 0.028
          }
        ]
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 1240,
        "duration": 0.11,
        "volume": 0.011,
        "attack": 0.01,
        "release": 0.07,
        "offset": 0.17
      }
    ]
  },
  "stage_clear_jingle": {
    "id": "stage_clear_jingle",
    "name": "ステージクリアジングル",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.1,
        "volume": 0.034,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 660,
            "duration": 0.1,
            "volume": 0.034
          },
          {
            "offset": 0.1,
            "startFreq": 880,
            "duration": 0.1,
            "volume": 0.036
          },
          {
            "offset": 0.22,
            "startFreq": 990,
            "duration": 0.11,
            "volume": 0.034
          },
          {
            "offset": 0.35,
            "startFreq": 1320,
            "duration": 0.24,
            "volume": 0.04
          }
        ]
      },
      {
        "type": "chord",
        "waveform": "sine",
        "startFreq": 660,
        "notes": [
          0,
          4,
          7,
          12
        ],
        "duration": 0.36,
        "volume": 0.02,
        "attack": 0.012,
        "release": 0.16,
        "offset": 0.52
      }
    ]
  },
  "route_clear_jingle": {
    "id": "route_clear_jingle",
    "name": "ルートクリアジングル",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.11,
        "volume": 0.032,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 520,
            "duration": 0.11,
            "volume": 0.032
          },
          {
            "offset": 0.11,
            "startFreq": 660,
            "duration": 0.11,
            "volume": 0.034
          },
          {
            "offset": 0.24,
            "startFreq": 880,
            "duration": 0.12,
            "volume": 0.036
          },
          {
            "offset": 0.39,
            "startFreq": 1175,
            "duration": 0.16,
            "volume": 0.038
          },
          {
            "offset": 0.58,
            "startFreq": 1568,
            "duration": 0.3,
            "volume": 0.04
          }
        ]
      },
      {
        "type": "chord",
        "waveform": "sine",
        "startFreq": 784,
        "notes": [
          0,
          4,
          7,
          12
        ],
        "duration": 0.52,
        "volume": 0.022,
        "attack": 0.012,
        "release": 0.22,
        "offset": 0.8
      }
    ]
  },
  "gimmick_switch": {
    "id": "gimmick_switch",
    "name": "スイッチ起動",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 540,
        "endFreq": 820,
        "duration": 0.085,
        "volume": 0.03,
        "attack": 0.005,
        "release": 0.04
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1120,
        "duration": 0.07,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.045,
        "offset": 0.05
      }
    ]
  },
  "gimmick_bell": {
    "id": "gimmick_bell",
    "name": "お茶会ベル",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1320,
        "duration": 0.16,
        "volume": 0.026,
        "attack": 0.004,
        "release": 0.12
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1760,
        "duration": 0.18,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.13,
        "offset": 0.04,
        "pan": 0.12
      }
    ]
  },
  "gimmick_complete": {
    "id": "gimmick_complete",
    "name": "ギミック達成",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.08,
        "volume": 0.026,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 620,
            "duration": 0.08,
            "volume": 0.026
          },
          {
            "offset": 0.075,
            "startFreq": 780,
            "duration": 0.08,
            "volume": 0.028
          },
          {
            "offset": 0.16,
            "startFreq": 990,
            "duration": 0.09,
            "volume": 0.03
          },
          {
            "offset": 0.27,
            "startFreq": 1320,
            "duration": 0.15,
            "volume": 0.032
          }
        ]
      }
    ]
  },
  "door_open": {
    "id": "door_open",
    "name": "ゲート開放",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 240,
        "endFreq": 360,
        "duration": 0.16,
        "volume": 0.026,
        "attack": 0.008,
        "release": 0.07
      },
      {
        "type": "sequence",
        "waveform": "sine",
        "duration": 0.08,
        "volume": 0.024,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0.12,
            "startFreq": 620,
            "duration": 0.08,
            "volume": 0.024
          },
          {
            "offset": 0.22,
            "startFreq": 880,
            "duration": 0.12,
            "volume": 0.026
          }
        ]
      }
    ]
  },
  "ribbon_bridge_on": {
    "id": "ribbon_bridge_on",
    "name": "リボン橋出現",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 540,
        "endFreq": 1180,
        "duration": 0.18,
        "volume": 0.032,
        "attack": 0.008,
        "release": 0.07,
        "pan": -0.18
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1480,
        "duration": 0.12,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.07,
        "offset": 0.14,
        "pan": 0.18
      }
    ]
  },
  "vine_grow": {
    "id": "vine_grow",
    "name": "豆の芽成長",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 300,
        "endFreq": 980,
        "duration": 0.28,
        "volume": 0.03,
        "attack": 0.012,
        "release": 0.08
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1320,
        "duration": 0.12,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.08,
        "offset": 0.22
      }
    ]
  },
  "crumble_break": {
    "id": "crumble_break",
    "name": "足場崩壊",
    "gain": 1,
    "voices": [
      {
        "type": "noise",
        "duration": 0.14,
        "volume": 0.022,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 700
      },
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 220,
        "endFreq": 130,
        "duration": 0.12,
        "volume": 0.03,
        "attack": 0.004,
        "release": 0.06,
        "offset": 0.02
      }
    ]
  },
  "jelly_bounce": {
    "id": "jelly_bounce",
    "name": "ゼリーバウンド",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 260,
        "endFreq": 860,
        "duration": 0.11,
        "volume": 0.038,
        "attack": 0.006,
        "release": 0.055
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1120,
        "duration": 0.07,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.04,
        "offset": 0.07
      }
    ]
  },
  "wait_flower_launch": {
    "id": "wait_flower_launch",
    "name": "待ち花ジャンプ",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 880,
        "duration": 0.08,
        "volume": 0.022,
        "attack": 0.006,
        "release": 0.04
      },
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 520,
        "endFreq": 1120,
        "duration": 0.16,
        "volume": 0.034,
        "attack": 0.006,
        "release": 0.06,
        "offset": 0.06
      }
    ]
  },
  "nano_join_jingle": {
    "id": "nano_join_jingle",
    "name": "なのちゃん加入ジングル",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "sine",
        "duration": 0.1,
        "volume": 0.03,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 880,
            "duration": 0.1,
            "volume": 0.03,
            "pan": -0.12
          },
          {
            "offset": 0.1,
            "startFreq": 1175,
            "duration": 0.1,
            "volume": 0.032,
            "pan": 0.12
          },
          {
            "offset": 0.22,
            "startFreq": 1320,
            "duration": 0.12,
            "volume": 0.034,
            "pan": -0.08
          },
          {
            "offset": 0.36,
            "startFreq": 1760,
            "duration": 0.26,
            "volume": 0.038,
            "pan": 0.08
          }
        ]
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 2200,
        "duration": 0.2,
        "volume": 0.009,
        "attack": 0.01,
        "release": 0.12,
        "offset": 0.5
      }
    ]
  },
  "nano_launch": {
    "id": "nano_launch",
    "name": "なのちゃん発射",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "sine",
        "startFreq": 960,
        "endFreq": 1680,
        "duration": 0.12,
        "volume": 0.03,
        "attack": 0.006,
        "release": 0.055,
        "pan": 0.18
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 1320,
        "duration": 0.07,
        "volume": 0.012,
        "attack": 0.01,
        "release": 0.04,
        "offset": 0.04,
        "pan": -0.14
      }
    ]
  },
  "nano_return": {
    "id": "nano_return",
    "name": "なのちゃん帰還",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "sine",
        "startFreq": 1500,
        "endFreq": 880,
        "duration": 0.1,
        "volume": 0.024,
        "attack": 0.006,
        "release": 0.05,
        "pan": -0.1
      },
      {
        "type": "tone",
        "waveform": "triangle",
        "startFreq": 760,
        "duration": 0.08,
        "volume": 0.018,
        "attack": 0.01,
        "release": 0.045,
        "offset": 0.08
      }
    ]
  },
  "nano_swap_success": {
    "id": "nano_swap_success",
    "name": "なのちゃん交換成功",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1320,
        "duration": 0.07,
        "volume": 0.026,
        "attack": 0.004,
        "release": 0.045,
        "pan": -0.2
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1760,
        "duration": 0.09,
        "volume": 0.026,
        "attack": 0.01,
        "release": 0.055,
        "offset": 0.075,
        "pan": 0.2
      }
    ]
  },
  "nano_swap_fail": {
    "id": "nano_swap_fail",
    "name": "なのちゃん交換失敗",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "sine",
        "startFreq": 1200,
        "endFreq": 520,
        "duration": 0.12,
        "volume": 0.028,
        "attack": 0.004,
        "release": 0.06
      },
      {
        "type": "noise",
        "duration": 0.045,
        "volume": 0.006,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1100,
        "offset": 0.045
      }
    ]
  },
  "nano_auto_shot": {
    "id": "nano_auto_shot",
    "name": "なのちゃん援護魔法",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "sine",
        "startFreq": 1180,
        "endFreq": 1760,
        "duration": 0.07,
        "volume": 0.022,
        "attack": 0.004,
        "release": 0.035,
        "pan": 0.16
      }
    ]
  },
  "nano_rescue_crack": {
    "id": "nano_rescue_crack",
    "name": "なのちゃん救出ヒビ",
    "gain": 1,
    "voices": [
      {
        "type": "noise",
        "duration": 0.11,
        "volume": 0.018,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1800
      },
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 520,
        "endFreq": 300,
        "duration": 0.09,
        "volume": 0.024,
        "attack": 0.004,
        "release": 0.05
      }
    ]
  },
  "nano_rescue_success_jingle": {
    "id": "nano_rescue_success_jingle",
    "name": "なのちゃん救出成功",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.11,
        "volume": 0.03,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 740,
            "duration": 0.11,
            "volume": 0.03
          },
          {
            "offset": 0.12,
            "startFreq": 980,
            "duration": 0.11,
            "volume": 0.032
          },
          {
            "offset": 0.25,
            "startFreq": 1240,
            "duration": 0.13,
            "volume": 0.034
          },
          {
            "offset": 0.43,
            "startFreq": 1660,
            "duration": 0.28,
            "volume": 0.038
          }
        ]
      },
      {
        "type": "chord",
        "waveform": "sine",
        "startFreq": 740,
        "notes": [
          0,
          4,
          7,
          12
        ],
        "duration": 0.36,
        "volume": 0.018,
        "attack": 0.012,
        "release": 0.18,
        "offset": 0.64
      }
    ]
  },
  "ride_start_jingle": {
    "id": "ride_start_jingle",
    "name": "風船ライド開始",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.09,
        "volume": 0.027,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 620,
            "duration": 0.09,
            "volume": 0.027
          },
          {
            "offset": 0.09,
            "startFreq": 820,
            "duration": 0.09,
            "volume": 0.029
          },
          {
            "offset": 0.2,
            "startFreq": 1120,
            "duration": 0.15,
            "volume": 0.032
          }
        ]
      },
      {
        "type": "noise",
        "duration": 0.22,
        "volume": 0.006,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1900
      }
    ]
  },
  "ride_goal_jingle": {
    "id": "ride_goal_jingle",
    "name": "風船ライド到着",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "sine",
        "duration": 0.1,
        "volume": 0.03,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 760,
            "duration": 0.1,
            "volume": 0.03
          },
          {
            "offset": 0.11,
            "startFreq": 1020,
            "duration": 0.1,
            "volume": 0.032
          },
          {
            "offset": 0.25,
            "startFreq": 1360,
            "duration": 0.2,
            "volume": 0.034
          }
        ]
      }
    ]
  },
  "ride_fail_jingle": {
    "id": "ride_fail_jingle",
    "name": "風船ライド失敗",
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
            "startFreq": 520,
            "duration": 0.09,
            "volume": 0.028
          },
          {
            "offset": 0.09,
            "startFreq": 390,
            "duration": 0.1,
            "volume": 0.03
          },
          {
            "offset": 0.21,
            "startFreq": 260,
            "duration": 0.16,
            "volume": 0.032
          }
        ]
      },
      {
        "type": "noise",
        "duration": 0.12,
        "volume": 0.01,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 800,
        "offset": 0.16
      }
    ]
  },
  "balloon_pop": {
    "id": "balloon_pop",
    "name": "風船破裂",
    "gain": 1,
    "voices": [
      {
        "type": "noise",
        "duration": 0.055,
        "volume": 0.026,
        "attack": 0.002,
        "release": 0.04,
        "filterFreq": 2600
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 1220,
        "duration": 0.04,
        "volume": 0.018,
        "attack": 0.002,
        "release": 0.025
      }
    ]
  },
  "ride_wind_shot": {
    "id": "ride_wind_shot",
    "name": "風攻撃",
    "gain": 1,
    "voices": [
      {
        "type": "noise",
        "duration": 0.16,
        "volume": 0.016,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1300
      },
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 420,
        "endFreq": 700,
        "duration": 0.13,
        "volume": 0.018,
        "attack": 0.008,
        "release": 0.07,
        "pan": -0.12
      }
    ]
  },
  "ride_lightning_shot": {
    "id": "ride_lightning_shot",
    "name": "雷攻撃",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "sawtooth",
        "startFreq": 900,
        "endFreq": 280,
        "duration": 0.09,
        "volume": 0.04,
        "attack": 0.002,
        "release": 0.04,
        "filterFreq": 2200
      },
      {
        "type": "noise",
        "duration": 0.09,
        "volume": 0.018,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 3200,
        "offset": 0.01
      }
    ]
  },
  "ride_thorn_contact": {
    "id": "ride_thorn_contact",
    "name": "トゲ雲接触",
    "gain": 1,
    "voices": [
      {
        "type": "tone",
        "waveform": "square",
        "startFreq": 620,
        "duration": 0.045,
        "volume": 0.028,
        "attack": 0.002,
        "release": 0.035,
        "filterFreq": 2000
      },
      {
        "type": "noise",
        "duration": 0.06,
        "volume": 0.014,
        "attack": 0.004,
        "release": 0.04,
        "filterFreq": 1800
      }
    ]
  },
  "shop_buy": {
    "id": "shop_buy",
    "name": "ショップ購入",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "sine",
        "duration": 0.07,
        "volume": 0.028,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 780,
            "duration": 0.07,
            "volume": 0.028
          },
          {
            "offset": 0.06,
            "startFreq": 1080,
            "duration": 0.09,
            "volume": 0.03
          },
          {
            "offset": 0.14,
            "startFreq": 1440,
            "duration": 0.12,
            "volume": 0.028
          }
        ]
      }
    ]
  },
  "shop_fail": {
    "id": "shop_fail",
    "name": "ショップ購入不可",
    "gain": 1,
    "voices": [
      {
        "type": "sweep",
        "waveform": "triangle",
        "startFreq": 300,
        "endFreq": 200,
        "duration": 0.11,
        "volume": 0.028,
        "attack": 0.005,
        "release": 0.055
      },
      {
        "type": "tone",
        "waveform": "sine",
        "startFreq": 240,
        "duration": 0.06,
        "volume": 0.011,
        "attack": 0.01,
        "release": 0.04,
        "offset": 0.055
      }
    ]
  },
  "upgrade_buy": {
    "id": "upgrade_buy",
    "name": "強化購入",
    "gain": 1,
    "voices": [
      {
        "type": "sequence",
        "waveform": "triangle",
        "duration": 0.08,
        "volume": 0.03,
        "attack": 0.008,
        "release": 0.04,
        "steps": [
          {
            "offset": 0,
            "startFreq": 620,
            "duration": 0.08,
            "volume": 0.03
          },
          {
            "offset": 0.08,
            "startFreq": 880,
            "duration": 0.09,
            "volume": 0.032
          },
          {
            "offset": 0.18,
            "startFreq": 1320,
            "duration": 0.17,
            "volume": 0.034
          }
        ]
      },
      {
        "type": "chord",
        "waveform": "sine",
        "startFreq": 660,
        "notes": [
          0,
          4,
          7
        ],
        "duration": 0.22,
        "volume": 0.014,
        "attack": 0.012,
        "release": 0.12,
        "offset": 0.28
      }
    ]
  }
};

export const SFX_IDS = Object.freeze(Object.keys(SFX_DEFS));
