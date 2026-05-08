/**
 * 責務: GIMMICK_SFX_DEFS に属するSEレシピだけを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。
 */
export const GIMMICK_SFX_DEFS = {
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
  }
};
