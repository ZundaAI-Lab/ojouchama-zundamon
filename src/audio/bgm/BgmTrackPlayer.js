/**
 * 責務: bgmTrackDefsのBGMトラックイベントをWebAudioへスケジュールしてループ再生する。
 * 更新ルール: 曲データの内容は data/audio/bgm/ に置き、このクラスは発音・ループ・停止処理だけを扱う。
 */
const SECTION_ORDER = Object.freeze(['intro', 'A', 'APrime', 'B', 'C']);
const LOOP_ORDER = Object.freeze(['A', 'APrime', 'B', 'C']);

const DEFAULT_INSTRUMENTS = Object.freeze({
  lead: Object.freeze({ kind: 'bell', type: 'triangle', attack: 0.012, decay: 0.18, sustain: 0.22, release: 0.34, gain: 0.62, filter: 5200 }),
  sparkle: Object.freeze({ kind: 'bell', type: 'sine', attack: 0.006, decay: 0.12, sustain: 0.12, release: 0.55, gain: 0.42, filter: 7200 }),
  arp: Object.freeze({ kind: 'pluck', type: 'triangle', attack: 0.004, decay: 0.12, sustain: 0.16, release: 0.16, gain: 0.38, filter: 4200 }),
  pad: Object.freeze({ kind: 'pad', type: 'sine', attack: 0.18, decay: 0.4, sustain: 0.36, release: 0.8, gain: 0.34, filter: 2600 }),
  bass: Object.freeze({ kind: 'tone', type: 'triangle', attack: 0.012, decay: 0.15, sustain: 0.42, release: 0.18, gain: 0.52, filter: 1200 }),
  kick: Object.freeze({ kind: 'kick' }),
  snare: Object.freeze({ kind: 'snare' }),
  hat: Object.freeze({ kind: 'hat' }),
});

const SCHEDULE_AHEAD_SEC = 1.2;
const STOP_FADE_SEC = 0.24;

function noteToFrequency(note) {
  if (!note || typeof note !== 'string') return 0;
  const match = note.match(/^([A-Ga-g])([#b]?)(-?\d)$/u);
  if (!match) return 0;
  const [, rawName, accidental, octaveText] = match;
  const semitones = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  let offset = semitones[rawName.toUpperCase()];
  if (accidental === '#') offset += 1;
  if (accidental === 'b') offset -= 1;
  return 440 * (2 ** (offset / 12 + (Number(octaveText) - 4)));
}

function makeNoiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * 0.5)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function safeStop(source, when = 0) {
  try { source.stop?.(when); } catch {}
}

function safeDisconnect(node) {
  try { node.disconnect?.(); } catch {}
}

export class BgmTrackPlayer {
  constructor(getContext, getDestination) {
    this.getContext = getContext;
    this.getDestination = getDestination;
    this.currentTrackId = null;
    this.track = null;
    this.bus = null;
    this.nextStart = 0;
    this.didIntro = false;
    this.loopIndex = 0;
    this.scheduledSegments = [];
    this.disposables = new Set();
  }

  get ctx() {
    return this.getContext?.() || null;
  }

  get secondsPerBeat() {
    return 60 / (this.track?.tempo || 120);
  }

  get beatsPerBar() {
    return this.track?.meter?.[0] || 4;
  }

  play(track) {
    const ctx = this.ctx;
    const destination = this.getDestination?.();
    if (!ctx || !destination || !track) return;
    if (this.currentTrackId === track.id && this.bus) return;

    this.stop(STOP_FADE_SEC);
    this.currentTrackId = track.id;
    this.track = track;
    this.bus = ctx.createGain();
    this.bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.bus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.42);
    this.bus.connect(destination);
    this.nextStart = ctx.currentTime + 0.06;
    this.didIntro = false;
    this.loopIndex = 0;
    this.scheduledSegments = [];
    this.scheduleAhead();
  }

  stop(fadeSeconds = STOP_FADE_SEC) {
    const ctx = this.ctx;
    const bus = this.bus;
    const at = ctx?.currentTime ?? 0;

    if (ctx && bus) {
      bus.gain.cancelScheduledValues(at);
      bus.gain.setValueAtTime(Math.max(0.0001, bus.gain.value || 0.0001), at);
      bus.gain.exponentialRampToValueAtTime(0.0001, at + fadeSeconds);
      globalThis.setTimeout(() => safeDisconnect(bus), (fadeSeconds + 0.08) * 1000);
    } else if (bus) {
      safeDisconnect(bus);
    }

    for (const entry of this.disposables) {
      for (const source of entry.sources) safeStop(source, at + fadeSeconds);
      globalThis.setTimeout(() => entry.cleanup(), (fadeSeconds + 0.12) * 1000);
    }

    this.currentTrackId = null;
    this.track = null;
    this.bus = null;
    this.nextStart = 0;
    this.didIntro = false;
    this.loopIndex = 0;
    this.scheduledSegments = [];
  }

  update() {
    this.scheduleAhead();
  }

  segmentBeats(name) {
    const bars = this.track?.sectionBars?.[name] ?? (name === 'intro' ? this.track?.introBars ?? 2 : 8);
    return bars * this.beatsPerBar;
  }

  nextSegmentName() {
    if (!this.didIntro && this.track?.sections?.intro) {
      this.didIntro = true;
      return 'intro';
    }
    const existingLoopOrder = LOOP_ORDER.filter(name => this.track?.sections?.[name]);
    const order = existingLoopOrder.length ? existingLoopOrder : SECTION_ORDER.filter(name => this.track?.sections?.[name]);
    const name = order[this.loopIndex % order.length] || 'intro';
    this.loopIndex += 1;
    return name;
  }

  scheduleAhead() {
    const ctx = this.ctx;
    if (!ctx || !this.bus || !this.track) return;
    const aheadUntil = ctx.currentTime + SCHEDULE_AHEAD_SEC;
    let safety = 0;
    while (this.nextStart < aheadUntil && safety < 8) {
      const name = this.nextSegmentName();
      this.scheduleSection(name, this.nextStart);
      const end = this.nextStart + this.segmentBeats(name) * this.secondsPerBeat;
      this.scheduledSegments.push({ name, start: this.nextStart, end });
      this.scheduledSegments = this.scheduledSegments.filter(segment => segment.end > ctx.currentTime - 0.5);
      this.nextStart = end;
      safety += 1;
    }
  }

  scheduleSection(name, startTime) {
    const events = this.track?.sections?.[name] || [];
    events.forEach(event => this.scheduleEvent(event, startTime));
  }

  scheduleEvent(event, sectionStart) {
    if (Array.isArray(event.n)) {
      event.n.forEach((note, index) => this.scheduleEvent({ ...event, n: note, v: (event.v ?? 0.7) * (index === 0 ? 1 : 0.84) }, sectionStart));
      return;
    }

    const instrument = { ...DEFAULT_INSTRUMENTS[event.i], ...this.track?.instruments?.[event.i] };
    const when = sectionStart + event.t * this.secondsPerBeat;
    const duration = Math.max(0.04, event.d * this.secondsPerBeat);
    const velocity = event.v ?? 0.7;

    if (instrument.kind === 'kick') return this.scheduleKick(when, velocity);
    if (instrument.kind === 'snare') return this.scheduleSnare(when, velocity);
    if (instrument.kind === 'hat') return this.scheduleHat(when, velocity);

    const freq = noteToFrequency(event.n);
    if (!freq) return;
    if (instrument.kind === 'bell') this.scheduleBell(freq, when, duration, velocity, instrument);
    else this.scheduleTone(freq, when, duration, velocity, instrument);
  }

  connectVoice(output, instrument, nodes) {
    let node = output;
    if (instrument.filter) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = instrument.filter;
      filter.Q.value = instrument.q ?? 0.7;
      node.connect(filter);
      node = filter;
      nodes.push(filter);
    }
    const pan = this.ctx.createStereoPanner();
    pan.pan.value = instrument.pan ?? 0;
    node.connect(pan);
    pan.connect(this.bus);
    nodes.push(pan);
  }

  envelope(gainNode, when, duration, velocity, instrument) {
    const attack = instrument.attack ?? 0.01;
    const decay = instrument.decay ?? 0.12;
    const sustain = instrument.sustain ?? 0.3;
    const release = instrument.release ?? 0.2;
    const peak = (instrument.gain ?? 0.5) * velocity;
    gainNode.gain.cancelScheduledValues(when);
    gainNode.gain.setValueAtTime(0.0001, when);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), when + attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * sustain), when + attack + decay);
    gainNode.gain.setValueAtTime(Math.max(0.0002, peak * sustain), when + Math.max(attack + decay, duration * 0.65));
    gainNode.gain.exponentialRampToValueAtTime(0.0001, when + duration + release);
    return release;
  }

  scheduleTone(freq, when, duration, velocity, instrument) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const nodes = [gain];
    osc.type = instrument.type ?? 'triangle';
    osc.frequency.setValueAtTime(freq, when);
    if (instrument.slide) osc.frequency.exponentialRampToValueAtTime(freq * instrument.slide, when + duration);
    osc.detune.value = instrument.detune ?? 0;
    osc.connect(gain);
    this.connectVoice(gain, instrument, nodes);
    const release = this.envelope(gain, when, duration, velocity, instrument);
    osc.start(when);
    const stopAt = when + duration + release + 0.08;
    osc.stop(stopAt);
    this.trackDisposable([osc], nodes, stopAt);
  }

  scheduleBell(freq, when, duration, velocity, instrument) {
    const gain = this.ctx.createGain();
    const oscA = this.ctx.createOscillator();
    const oscB = this.ctx.createOscillator();
    const nodes = [gain];
    oscA.type = instrument.type ?? 'sine';
    oscB.type = 'sine';
    oscA.frequency.setValueAtTime(freq, when);
    oscB.frequency.setValueAtTime(freq * (instrument.partial ?? 2.01), when);
    oscA.connect(gain);
    oscB.connect(gain);
    this.connectVoice(gain, instrument, nodes);
    const release = this.envelope(gain, when, duration, velocity, { ...instrument, sustain: instrument.sustain ?? 0.08, release: instrument.release ?? 0.44 });
    oscA.start(when);
    oscB.start(when);
    const stopAt = when + duration + release + 0.08;
    oscA.stop(stopAt);
    oscB.stop(stopAt);
    this.trackDisposable([oscA, oscB], nodes, stopAt);
  }

  scheduleKick(when, velocity) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(132, when);
    osc.frequency.exponentialRampToValueAtTime(42, when + 0.18);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.9 * velocity, when + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
    osc.connect(gain).connect(this.bus);
    osc.start(when);
    const stopAt = when + 0.24;
    osc.stop(stopAt);
    this.trackDisposable([osc], [gain], stopAt);
  }

  scheduleSnare(when, velocity) {
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    src.buffer = makeNoiseBuffer(this.ctx);
    filter.type = 'bandpass';
    filter.frequency.value = 1900;
    filter.Q.value = 0.9;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.42 * velocity, when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
    src.connect(filter).connect(gain).connect(this.bus);
    src.start(when);
    const stopAt = when + 0.18;
    src.stop(stopAt);
    this.trackDisposable([src], [filter, gain], stopAt);
  }

  scheduleHat(when, velocity) {
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    src.buffer = makeNoiseBuffer(this.ctx);
    filter.type = 'highpass';
    filter.frequency.value = 6200;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.16 * velocity, when + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.055);
    src.connect(filter).connect(gain).connect(this.bus);
    src.start(when);
    const stopAt = when + 0.07;
    src.stop(stopAt);
    this.trackDisposable([src], [filter, gain], stopAt);
  }

  trackDisposable(sources, nodes, stopAt) {
    const entry = { sources, nodes, cleanup: null };
    entry.cleanup = () => {
      if (!this.disposables.has(entry)) return;
      this.disposables.delete(entry);
      for (const source of sources) safeDisconnect(source);
      for (const node of nodes) safeDisconnect(node);
    };
    this.disposables.add(entry);
    let remaining = sources.length;
    for (const source of sources) {
      source.onended = () => {
        remaining -= 1;
        if (remaining <= 0) entry.cleanup();
      };
    }
    const ctx = this.ctx;
    if (ctx) globalThis.setTimeout(() => entry.cleanup(), Math.max(0, stopAt - ctx.currentTime + 0.1) * 1000);
  }
}
