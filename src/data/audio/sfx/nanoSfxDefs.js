/**
 * 責務: NANO_SFX_DEFS に属するSEレシピだけを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。
 */
export const NANO_SFX_DEFS = {
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
  }
};
