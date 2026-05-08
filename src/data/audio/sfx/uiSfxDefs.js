/**
 * 責務: UI_SFX_DEFS に属するSEレシピだけを定義する。
 * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。
 */
export const UI_SFX_DEFS = {
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
  }
};
