/**
 * 責務: WebAudioContextとmaster/BGM/SEの基本ノード接続を管理する。
 * 更新ルール: BGM/SEの種類や発音処理は扱わず、音量設定とノード配線だけを現行仕様に沿って管理する。
 */
import { BGM_OUTPUT_GAIN, DEFAULT_BGM_VOLUME, DEFAULT_SFX_VOLUME, SFX_OUTPUT_GAIN } from './utils/audioMath.js';

export class AudioContextGraph {
  constructor(save) {
    this.save = save;
    this.ctx = null;
    this.master = null;
    this.bgmGain = null;
    this.sfxGain = null;
  }

  ensure() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.bgmGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    this.bgmGain.connect(this.master);
    this.sfxGain.connect(this.master);
    this.master.connect(this.ctx.destination);
    this.applySettings();
  }

  applySettings(settingsOverride = null) {
    if (!this.ctx) return;
    const settings = settingsOverride || this.save.load().settings;
    const at = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(at);
    this.bgmGain.gain.cancelScheduledValues(at);
    this.sfxGain.gain.cancelScheduledValues(at);
    this.master.gain.setTargetAtTime(settings.muted ? 0 : 1, at, 0.025);
    this.bgmGain.gain.setTargetAtTime((settings.bgmVolume ?? DEFAULT_BGM_VOLUME) * BGM_OUTPUT_GAIN, at, 0.025);
    this.sfxGain.gain.setTargetAtTime((settings.sfxVolume ?? DEFAULT_SFX_VOLUME) * SFX_OUTPUT_GAIN, at, 0.025);
  }
}
