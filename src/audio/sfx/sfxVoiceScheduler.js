/**
 * 責務: SEレシピ内のvoiceをWebAudioノードへ変換し、指定時刻に発音予約する。
 * 更新ルール: SE IDやUIの都合は扱わず、単一voiceの発音処理だけをここへ集約する。
 */
import { normalizeSfxVoice } from '../../data/audio/audioSchema.js';

function safeTime(ctx, time) {
  return Math.max(ctx.currentTime, Number.isFinite(time) ? time : ctx.currentTime);
}

export class SfxVoiceScheduler {
  constructor(getContext) {
    this.getContext = getContext;
  }

  scheduleVoice(rawVoice, destination, startTime, gainScale = 1) {
    const ctx = this.getContext();
    if (!ctx || !destination) return;
    const voice = normalizeSfxVoice(rawVoice);
    const time = safeTime(ctx, startTime);
    if (voice.type === 'noise') {
      this.scheduleNoise(ctx, destination, time, voice, gainScale);
      return;
    }
    if (voice.type === 'chord') {
      this.scheduleChord(ctx, destination, time, voice, gainScale);
      return;
    }
    if (voice.type === 'sequence') {
      this.scheduleSequence(destination, time, voice, gainScale);
      return;
    }
    this.scheduleTone(ctx, destination, time, voice, gainScale);
  }

  createVoiceChain(ctx, destination, voice, gainScale) {
    const gain = ctx.createGain();
    const pan = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
    const filter = Number.isFinite(voice.filterFreq) ? ctx.createBiquadFilter() : null;
    const volume = Math.max(0.0001, voice.volume * gainScale);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + Math.max(0.001, voice.attack));
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + voice.duration + Math.max(0.001, voice.release));

    let input = gain;
    if (filter) {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(voice.filterFreq, ctx.currentTime);
      gain.connect(filter);
      input = filter;
    }
    if (pan) {
      pan.pan.setValueAtTime(voice.pan || 0, ctx.currentTime);
      input.connect(pan);
      pan.connect(destination);
    } else {
      input.connect(destination);
    }
    return gain;
  }

  scheduleTone(ctx, destination, time, voice, gainScale) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const pan = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
    const filter = Number.isFinite(voice.filterFreq) ? ctx.createBiquadFilter() : null;
    const endAt = time + voice.duration + voice.release + 0.03;
    const volume = Math.max(0.0001, voice.volume * gainScale);

    osc.type = voice.waveform;
    osc.frequency.setValueAtTime(voice.startFreq, time);
    if (voice.type === 'sweep' || Number.isFinite(voice.endFreq)) {
      const endFreq = Math.max(20, voice.endFreq || voice.startFreq);
      osc.frequency.exponentialRampToValueAtTime(endFreq, time + Math.max(0.01, voice.duration));
    }

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + Math.max(0.001, voice.attack));
    gain.gain.exponentialRampToValueAtTime(0.0001, time + voice.duration + Math.max(0.001, voice.release));

    let output = gain;
    if (filter) {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(voice.filterFreq, time);
      gain.connect(filter);
      output = filter;
    }
    if (pan) {
      pan.pan.setValueAtTime(voice.pan || 0, time);
      output.connect(pan);
      pan.connect(destination);
    } else {
      output.connect(destination);
    }

    osc.connect(gain);
    osc.start(time);
    osc.stop(endAt);
  }

  scheduleNoise(ctx, destination, time, voice, gainScale) {
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * voice.duration)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const pan = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
    const volume = Math.max(0.0001, voice.volume * gainScale);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(voice.filterFreq || 1800, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + Math.max(0.001, voice.attack));
    gain.gain.exponentialRampToValueAtTime(0.0001, time + voice.duration + Math.max(0.001, voice.release));
    source.connect(filter);
    filter.connect(gain);
    if (pan) {
      pan.pan.setValueAtTime(voice.pan || 0, time);
      gain.connect(pan);
      pan.connect(destination);
    } else {
      gain.connect(destination);
    }
    source.start(time);
    source.stop(time + voice.duration + voice.release + 0.03);
  }

  scheduleChord(ctx, destination, time, voice, gainScale) {
    const notes = Array.isArray(voice.notes) && voice.notes.length > 0 ? voice.notes : [0, 4, 7];
    notes.forEach((semi, index) => this.scheduleTone(ctx, destination, time, {
      ...voice,
      type: 'tone',
      startFreq: voice.startFreq * (2 ** (semi / 12)),
      volume: voice.volume * (index === 0 ? 1 : 0.72),
      pan: (voice.pan || 0) + (index - (notes.length - 1) / 2) * 0.08,
    }, gainScale));
  }

  scheduleSequence(destination, time, voice, gainScale) {
    const { type: _parentType, offset: _parentOffset, steps: _parentSteps, ...stepDefaults } = voice;
    const steps = Array.isArray(voice.steps) && voice.steps.length > 0
      ? voice.steps
      : [{ ...stepDefaults, type: 'tone', offset: 0 }];
    steps.forEach((step) => {
      const stepOffset = Number(step.offset || 0);
      this.scheduleVoice({
        ...stepDefaults,
        ...step,
        type: step.type || 'tone',
      }, destination, time + stepOffset, gainScale);
    });
  }
}
