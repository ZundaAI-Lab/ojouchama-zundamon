/**
 * 責務: BOSS_SFX_DEFS に属するSEレシピだけを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。
 */
export const BOSS_SFX_DEFS = {
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
  }
};
