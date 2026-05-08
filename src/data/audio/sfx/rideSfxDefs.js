/**
 * 責務: RIDE_SFX_DEFS に属するSEレシピだけを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。
 */
export const RIDE_SFX_DEFS = {
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
  }
};
