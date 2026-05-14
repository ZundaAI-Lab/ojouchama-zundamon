/**
 * 責務: サウンドエディタの試聴用AudioContextと、BGM/SE/BGM単一イベントプレビュー再生を仲介する。
 * 更新ルール: エディタDOMや保存処理は持たず、試聴再生と試聴停止だけを扱う。
 */
import { BgmTrackPlayer } from '../../audio/bgm/BgmTrackPlayer.js';
import { SfxRecipePlayer } from '../../audio/sfx/sfxRecipePlayer.js';

export class AudioEditorPreviewBridge {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.bgmPlayer = null;
    this.sfxPlayer = null;
    this.sfxStopTimer = 0;
    this.updateTimer = 0;
    this.bgmOneShotTimer = 0;
  }

  ensure() {
    if (this.ctx) return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtor();
    this.master = this.ctx.createGain();
    this.bgmGain = this.ctx.createGain();
    this.master.gain.value = 0.82;
    this.bgmGain.gain.value = 0.78;
    this.bgmGain.connect(this.master);
    this.master.connect(this.ctx.destination);
    this.recreateSfxGain(0);
    this.bgmPlayer = new BgmTrackPlayer(() => this.ctx, () => this.bgmGain);
    this.sfxPlayer = new SfxRecipePlayer(() => this.ctx);
  }

  resume() {
    this.ensure();
    this.ctx.resume?.();
  }

  recreateSfxGain(fadeSeconds = 0.04) {
    const oldGain = this.sfxGain;
    if (this.sfxStopTimer) {
      window.clearTimeout(this.sfxStopTimer);
      this.sfxStopTimer = 0;
    }
    if (oldGain && this.ctx) {
      const at = this.ctx.currentTime;
      try {
        oldGain.gain.cancelScheduledValues(at);
        oldGain.gain.setValueAtTime(Math.max(0.0001, oldGain.gain.value || 0.0001), at);
        oldGain.gain.exponentialRampToValueAtTime(0.0001, at + fadeSeconds);
      } catch {}
      this.sfxStopTimer = window.setTimeout(() => {
        try { oldGain.disconnect(); } catch {}
        this.sfxStopTimer = 0;
      }, (fadeSeconds + 0.04) * 1000);
    }
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.88;
    this.sfxGain.connect(this.master);
  }

  makeSectionPreviewTrack(track, sectionName) {
    if (!sectionName || !track?.sections?.[sectionName]) return track;
    const bars = Number(track.sectionBars?.[sectionName] ?? track.introBars ?? 4) || 4;
    return {
      ...track,
      id: `${track.id}__${sectionName}__preview`,
      introBars: 0,
      sectionBars: { A: bars },
      sections: { A: track.sections[sectionName] },
    };
  }

  makeEventPreviewTrack(track, sectionName, eventIndex) {
    const event = track?.sections?.[sectionName]?.[eventIndex];
    if (!track || !event) return null;
    const beatsPerBar = Number(track.meter?.[0]) || 4;
    const eventDuration = Math.max(0.05, Number(event.d) || 0.5);
    const previewBars = Math.max(8, Math.ceil((eventDuration + beatsPerBar) / beatsPerBar));
    return {
      ...track,
      id: `${track.id}__${sectionName}__event_${eventIndex}__preview`,
      introBars: 0,
      sectionBars: { A: previewBars },
      sections: {
        A: [{
          ...event,
          t: 0,
          n: Array.isArray(event.n) ? [...event.n] : event.n,
        }],
      },
    };
  }

  eventPreviewSeconds(track, sectionName, eventIndex) {
    const event = track?.sections?.[sectionName]?.[eventIndex];
    const secondsPerBeat = 60 / (Number(track?.tempo) || 120);
    return Math.max(0.35, (Number(event?.d) || 0.5) * secondsPerBeat + 1.2);
  }

  clearBgmOneShotTimer() {
    if (!this.bgmOneShotTimer) return;
    window.clearTimeout(this.bgmOneShotTimer);
    this.bgmOneShotTimer = 0;
  }

  startUpdateLoop() {
    if (this.updateTimer) return;
    this.updateTimer = window.setInterval(() => this.bgmPlayer?.update(), 180);
  }

  stopUpdateLoop() {
    if (!this.updateTimer) return;
    window.clearInterval(this.updateTimer);
    this.updateTimer = 0;
  }

  playBgm(track, sectionName = null) {
    this.resume();
    this.clearBgmOneShotTimer();
    const previewTrack = this.makeSectionPreviewTrack(track, sectionName);
    this.bgmPlayer.play(previewTrack);
    this.startUpdateLoop();
  }

  playBgmEvent(track, sectionName, eventIndex) {
    this.resume();
    this.stopBgm();
    const previewTrack = this.makeEventPreviewTrack(track, sectionName, eventIndex);
    if (!previewTrack) return;
    this.bgmPlayer.play(previewTrack);
    this.stopUpdateLoop();
    this.bgmOneShotTimer = window.setTimeout(() => {
      this.bgmOneShotTimer = 0;
      this.stopBgm();
    }, this.eventPreviewSeconds(track, sectionName, eventIndex) * 1000);
  }

  stopBgm() {
    this.clearBgmOneShotTimer();
    this.bgmPlayer?.stop(0.12);
    this.stopUpdateLoop();
  }

  stopSfx() {
    if (!this.ctx || !this.master) return;
    this.recreateSfxGain(0.035);
  }

  playSfx(definition) {
    this.resume();
    this.sfxPlayer.play(definition, this.sfxGain, this.ctx.currentTime);
  }

  stop() {
    this.stopBgm();
    this.stopSfx();
  }
}
