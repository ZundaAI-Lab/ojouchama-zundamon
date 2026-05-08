/**
 * 責務: RESIDENT_SFX_DEFS に属するSEレシピだけを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。
 */
export const RESIDENT_SFX_DEFS = {
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
  }
};
