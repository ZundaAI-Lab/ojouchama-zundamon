/**
 * 責務: ITEM_SFX_DEFS に属するSEレシピだけを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。
 */
export const ITEM_SFX_DEFS = {
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
  }
};
