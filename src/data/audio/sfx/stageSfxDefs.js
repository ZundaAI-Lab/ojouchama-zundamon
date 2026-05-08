/**
 * 責務: STAGE_SFX_DEFS に属するSEレシピだけを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。
 */
export const STAGE_SFX_DEFS = {
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
};
