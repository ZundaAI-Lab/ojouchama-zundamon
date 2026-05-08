/**
 * 責務: SHOP_SFX_DEFS に属するSEレシピだけを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。
 */
export const SHOP_SFX_DEFS = {
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
