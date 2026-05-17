/**
 * 責務: BGMトラックイベントを純粋なPCMへ段階レンダーし、完成したAudioBufferだけをWebAudio標準のloop再生で鳴らす。
 * 更新ルール: BGM再生中に音符ごとのOscillator/Gain/Filter/Noiseノードを生成しない。曲データは data/audio/bgm/ に置き、このクラスはPCM化・内容ハッシュ付きキャッシュ・再生/停止だけを扱う。
 */
const SECTION_ORDER = Object.freeze(['intro', 'A', 'APrime', 'B', 'C']);
const INTRO_SECTION = 'intro';

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

const CHANNELS = 2;
const LOOP_RENDER_PASSES = 2;
const LOOP_PEAK_CEILING = 0.92;
const PLAY_START_LEAD_SEC = 0.04;
const STOP_FADE_SEC = 0.18;
const RENDER_SAMPLE_RATE = 22050;
const RENDER_TIME_SLICE_MS = 9;
const RENDER_CACHE_LIMIT = 4;
const TWO_PI = Math.PI * 2;
const MIN_GAIN = 0.0001;

const RENDER_CACHE = new WeakMap();

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

function secondsPerBeat(track) {
  return 60 / (track?.tempo || 120);
}

function beatsPerBar(track) {
  return track?.meter?.[0] || 4;
}

function sectionBeats(track, name) {
  const bars = track?.sectionBars?.[name] ?? (name === 'intro' ? track?.introBars ?? 2 : 8);
  return bars * beatsPerBar(track);
}

function sectionOrderIndex(name) {
  const index = SECTION_ORDER.indexOf(name);
  return index === -1 ? 999 : index;
}

function sectionPlaybackNames(track, { includeIntro = true } = {}) {
  const names = Object.keys(track?.sections || {}).filter(name => includeIntro || name !== INTRO_SECTION);
  return names.sort((a, b) => sectionOrderIndex(a) - sectionOrderIndex(b) || a.localeCompare(b, 'ja'));
}

function existingLoopOrder(track) {
  const loopNames = sectionPlaybackNames(track, { includeIntro: false });
  if (loopNames.length) return loopNames;
  return track?.sections?.[INTRO_SECTION] ? [INTRO_SECTION] : [];
}

function buildTimeline(track, order) {
  let cursor = 0;
  const sections = order.map((name) => {
    const startBeat = cursor;
    const beats = sectionBeats(track, name);
    cursor += beats;
    return { name, startBeat, beats };
  });
  return { sections, totalBeats: cursor, totalSeconds: cursor * secondsPerBeat(track) };
}

function collectEvents(track, sections, passOffsetBeats = 0) {
  return sections.flatMap(section => (track.sections?.[section.name] || []).map(event => ({
    ...event,
    beat: passOffsetBeats + section.startBeat + (event.t ?? 0),
  })));
}

function createPcm(length) {
  return [new Float32Array(length), new Float32Array(length)];
}

function createBuffer(ctx, pcm, sampleRate) {
  const buffer = ctx.createBuffer(CHANNELS, Math.max(1, pcm[0]?.length || 1), sampleRate);
  for (let channel = 0; channel < CHANNELS; channel += 1) buffer.copyToChannel(pcm[channel], channel);
  return buffer;
}

function copyPcmSlice(pcm, startFrame, length) {
  return [pcm[0].slice(startFrame, startFrame + length), pcm[1].slice(startFrame, startFrame + length)];
}

function bufferPeakFromPcm(pcm) {
  let peak = 0;
  for (let channel = 0; channel < CHANNELS; channel += 1) {
    const data = pcm[channel];
    for (let i = 0; i < data.length; i += 1) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
  }
  return peak;
}

function scalePcm(pcm, gain) {
  if (!(gain > 0) || Math.abs(gain - 1) < 0.000001) return;
  for (let channel = 0; channel < CHANNELS; channel += 1) {
    const data = pcm[channel];
    for (let i = 0; i < data.length; i += 1) data[i] *= gain;
  }
}

function applySharedHeadroom(pcms) {
  const peak = Math.max(...pcms.filter(Boolean).map(bufferPeakFromPcm), 0);
  if (peak <= LOOP_PEAK_CEILING || peak <= 0) return;
  const gain = LOOP_PEAK_CEILING / peak;
  pcms.forEach(pcm => pcm && scalePcm(pcm, gain));
}

function schedulerNow() {
  return globalThis.performance?.now?.() ?? Date.now();
}

function yieldToMain() {
  return new Promise(resolve => globalThis.setTimeout(resolve, 0));
}

async function renderChunked(items, renderItem, stats = null) {
  let index = 0;
  while (index < items.length) {
    const chunkStart = schedulerNow();
    const deadline = chunkStart + RENDER_TIME_SLICE_MS;
    do {
      renderItem(items[index]);
      index += 1;
    } while (index < items.length && schedulerNow() < deadline);
    const chunkMs = schedulerNow() - chunkStart;
    if (stats) {
      stats.chunkCount = (stats.chunkCount || 0) + 1;
      stats.maxChunkMs = Math.max(stats.maxChunkMs || 0, chunkMs);
    }
    if (index < items.length) await yieldToMain();
  }
}

function fastHash(text = '') {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeNoise(seed) {
  let state = seed >>> 0 || 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (((value ^ (value >>> 14)) >>> 0) / 2147483648) - 1;
  };
}

function waveform(type, phase) {
  const normalized = phase - Math.floor(phase);
  if (type === 'sine') return Math.sin(normalized * TWO_PI);
  if (type === 'square') return normalized < 0.5 ? 1 : -1;
  if (type === 'sawtooth') return normalized * 2 - 1;
  return 1 - 4 * Math.abs(Math.round(normalized - 0.25) - (normalized - 0.25));
}

function envelopeAt(time, duration, velocity, instrument) {
  const attack = Math.max(0.001, instrument.attack ?? 0.01);
  const decay = Math.max(0.001, instrument.decay ?? 0.12);
  const sustain = instrument.sustain ?? 0.3;
  const release = Math.max(0.001, instrument.release ?? 0.2);
  const peak = (instrument.gain ?? 0.5) * velocity;

  if (time < 0) return 0;
  if (time < attack) return peak * (time / attack);
  if (time < attack + decay) {
    const t = (time - attack) / decay;
    return peak * (1 + (sustain - 1) * t);
  }
  if (time < duration) return peak * sustain;
  if (time < duration + release) {
    const t = (time - duration) / release;
    return peak * sustain * ((1 - t) ** 1.5);
  }
  return 0;
}

function panGains(pan = 0) {
  const clamped = Math.max(-1, Math.min(1, pan));
  const angle = (clamped + 1) * Math.PI / 4;
  return [Math.cos(angle), Math.sin(angle)];
}

function onePoleLowpassAlpha(cutoff, sampleRate) {
  if (!(cutoff > 0) || cutoff >= sampleRate * 0.45) return 1;
  const rc = 1 / (TWO_PI * cutoff);
  const dt = 1 / sampleRate;
  return dt / (rc + dt);
}

function addSample(pcm, frame, value, leftGain, rightGain) {
  if (frame < 0 || frame >= pcm[0].length) return;
  pcm[0][frame] += value * leftGain;
  pcm[1][frame] += value * rightGain;
}

function renderToneVoice(pcm, sampleRate, event, track, instrument, freq, type, multiplier = 1, gainScale = 1) {
  const spb = secondsPerBeat(track);
  const startFrame = Math.max(0, Math.round(event.beat * spb * sampleRate));
  const duration = Math.max(0.04, (event.d ?? 0.2) * spb);
  const release = Math.max(0.001, instrument.release ?? 0.2);
  const endFrame = Math.min(pcm[0].length, Math.ceil((event.beat * spb + duration + release + 0.08) * sampleRate));
  const velocity = event.v ?? 0.7;
  const [left, right] = panGains(instrument.pan ?? 0);
  const alpha = onePoleLowpassAlpha(instrument.filter, sampleRate);
  const detune = 2 ** ((instrument.detune ?? 0) / 1200);
  let phase = 0;
  let lowpass = 0;
  const baseFreq = freq * multiplier * detune;
  const slide = instrument.slide;
  const oscType = type ?? instrument.type ?? 'triangle';

  for (let frame = startFrame; frame < endFrame; frame += 1) {
    const t = (frame - startFrame) / sampleRate;
    const progress = duration > 0 ? Math.min(1, t / duration) : 1;
    const currentFreq = slide ? baseFreq * (slide ** progress) : baseFreq;
    phase += currentFreq / sampleRate;
    const env = envelopeAt(t, duration, velocity, instrument) * gainScale;
    let value = waveform(oscType, phase) * env;
    if (alpha < 1) {
      lowpass += alpha * (value - lowpass);
      value = lowpass;
    }
    addSample(pcm, frame, value, left, right);
  }
}

function renderToneEvent(pcm, sampleRate, event, track, instrument) {
  const freq = noteToFrequency(event.n);
  if (!freq) return;
  if (instrument.kind === 'bell') {
    const bellInstrument = { ...instrument, sustain: instrument.sustain ?? 0.08, release: instrument.release ?? 0.44 };
    renderToneVoice(pcm, sampleRate, event, track, bellInstrument, freq, instrument.type ?? 'sine', 1, 0.72);
    renderToneVoice(pcm, sampleRate, event, track, bellInstrument, freq, 'sine', instrument.partial ?? 2.01, 0.42);
    return;
  }
  renderToneVoice(pcm, sampleRate, event, track, instrument, freq, instrument.type ?? 'triangle');
}

function renderKick(pcm, sampleRate, event, track) {
  const spb = secondsPerBeat(track);
  const when = event.beat * spb;
  const startFrame = Math.max(0, Math.round(when * sampleRate));
  const endFrame = Math.min(pcm[0].length, Math.ceil((when + 0.24) * sampleRate));
  const velocity = event.v ?? 0.7;
  let phase = 0;

  for (let frame = startFrame; frame < endFrame; frame += 1) {
    const t = (frame - startFrame) / sampleRate;
    const freq = 42 + (132 - 42) * Math.exp(-t / 0.055);
    phase += freq / sampleRate;
    const attack = Math.min(1, t / 0.01);
    const decay = Math.exp(-Math.max(0, t - 0.01) / 0.055);
    const value = Math.sin(phase * TWO_PI) * 0.9 * velocity * attack * decay;
    addSample(pcm, frame, value, 0.707, 0.707);
  }
}

function renderSnare(pcm, sampleRate, event, track) {
  const spb = secondsPerBeat(track);
  const when = event.beat * spb;
  const startFrame = Math.max(0, Math.round(when * sampleRate));
  const endFrame = Math.min(pcm[0].length, Math.ceil((when + 0.18) * sampleRate));
  const velocity = event.v ?? 0.7;
  const noise = makeNoise(fastHash(`${track?.id}:snare:${event.beat}:${velocity}`));
  let band = 0;
  let last = 0;

  for (let frame = startFrame; frame < endFrame; frame += 1) {
    const t = (frame - startFrame) / sampleRate;
    const attack = Math.min(1, t / 0.012);
    const decay = Math.exp(-Math.max(0, t - 0.012) / 0.045);
    const raw = noise();
    const high = raw - last;
    last = raw;
    band += 0.18 * (high - band);
    const value = band * 0.42 * velocity * attack * decay;
    addSample(pcm, frame, value, 0.707, 0.707);
  }
}

function renderHat(pcm, sampleRate, event, track) {
  const spb = secondsPerBeat(track);
  const when = event.beat * spb;
  const startFrame = Math.max(0, Math.round(when * sampleRate));
  const endFrame = Math.min(pcm[0].length, Math.ceil((when + 0.07) * sampleRate));
  const velocity = event.v ?? 0.7;
  const noise = makeNoise(fastHash(`${track?.id}:hat:${event.beat}:${velocity}`));
  let last = 0;

  for (let frame = startFrame; frame < endFrame; frame += 1) {
    const t = (frame - startFrame) / sampleRate;
    const attack = Math.min(1, t / 0.004);
    const decay = Math.exp(-Math.max(0, t - 0.004) / 0.018);
    const raw = noise();
    const value = (raw - last) * 0.16 * velocity * attack * decay;
    last = raw;
    addSample(pcm, frame, value, 0.707, 0.707);
  }
}

function expandEvent(track, event) {
  if (Array.isArray(event.n)) {
    return event.n.map((note, index) => ({
      ...event,
      n: note,
      v: (event.v ?? 0.7) * (index === 0 ? 1 : 0.84),
      instrument: { ...DEFAULT_INSTRUMENTS[event.i], ...track?.instruments?.[event.i] },
    }));
  }
  return [{
    ...event,
    instrument: { ...DEFAULT_INSTRUMENTS[event.i], ...track?.instruments?.[event.i] },
  }];
}

function renderExpandedEvent(pcm, sampleRate, track, event) {
  const instrument = event.instrument || { ...DEFAULT_INSTRUMENTS[event.i], ...track?.instruments?.[event.i] };
  if (instrument.kind === 'kick') return renderKick(pcm, sampleRate, event, track);
  if (instrument.kind === 'snare') return renderSnare(pcm, sampleRate, event, track);
  if (instrument.kind === 'hat') return renderHat(pcm, sampleRate, event, track);
  return renderToneEvent(pcm, sampleRate, event, track, instrument);
}

function expandEvents(track, events) {
  return events.flatMap(event => expandEvent(track, event))
    .sort((a, b) => (a.beat ?? 0) - (b.beat ?? 0));
}

async function renderPcm(track, events, durationSeconds, sampleRate, stats = null) {
  const length = Math.max(1, Math.ceil(durationSeconds * sampleRate));
  const pcm = createPcm(length);
  const expanded = expandEvents(track, events);
  if (stats) {
    stats.eventCount = (stats.eventCount || 0) + events.length;
    stats.expandedEventCount = (stats.expandedEventCount || 0) + expanded.length;
  }
  await renderChunked(expanded, event => renderExpandedEvent(pcm, sampleRate, track, event), stats);
  return pcm;
}

async function renderLoopPcm(track, loopTimeline, sampleRate, stats = null) {
  const loopFrames = Math.max(1, Math.round(loopTimeline.totalSeconds * sampleRate));
  const events = [];
  for (let pass = 0; pass < LOOP_RENDER_PASSES; pass += 1) {
    events.push(...collectEvents(track, loopTimeline.sections, pass * loopTimeline.totalBeats));
  }
  const rendered = await renderPcm(track, events, (loopFrames * LOOP_RENDER_PASSES) / sampleRate, sampleRate, stats);
  return copyPcmSlice(rendered, loopFrames, loopFrames);
}

async function renderEntryPcm(track, introTimeline, loopTimeline, sampleRate, stats = null) {
  if (!introTimeline.sections.length) return null;
  const introEvents = collectEvents(track, introTimeline.sections, 0);
  const loopEvents = collectEvents(track, loopTimeline.sections, introTimeline.totalBeats);
  return renderPcm(track, [...introEvents, ...loopEvents], introTimeline.totalSeconds + loopTimeline.totalSeconds, sampleRate, stats);
}

function renderSampleRate(ctx) {
  return Math.max(3000, Math.min(ctx?.sampleRate || RENDER_SAMPLE_RATE, RENDER_SAMPLE_RATE));
}

async function renderTrackBuffers(ctx, track, reporter = null) {
  const renderStart = schedulerNow();
  const renderStats = { chunkCount: 0, maxChunkMs: 0, eventCount: 0, expandedEventCount: 0 };
  const loopOrder = existingLoopOrder(track);
  const introOrder = track?.sections?.[INTRO_SECTION] && !loopOrder.includes(INTRO_SECTION) ? [INTRO_SECTION] : [];
  if (!loopOrder.length) return null;

  const introTimeline = buildTimeline(track, introOrder);
  const loopTimeline = buildTimeline(track, loopOrder);
  const sampleRate = renderSampleRate(ctx);
  reporter?.recordEvent('bgm.renderStart', {
    trackId: track?.id || '',
    sampleRate,
    loopSeconds: loopTimeline.totalSeconds,
    introSeconds: introTimeline.totalSeconds,
  });
  const loopPcm = await renderLoopPcm(track, loopTimeline, sampleRate, renderStats);
  const entryPcm = await renderEntryPcm(track, introTimeline, loopTimeline, sampleRate, renderStats);
  applySharedHeadroom([entryPcm, loopPcm]);

  const bufferStart = schedulerNow();
  const buffers = {
    entryBuffer: entryPcm ? createBuffer(ctx, entryPcm, sampleRate) : null,
    loopBuffer: createBuffer(ctx, loopPcm, sampleRate),
  };
  reporter?.recordEvent('bgm.renderEnd', {
    trackId: track?.id || '',
    durationMs: schedulerNow() - renderStart,
    createBufferMs: schedulerNow() - bufferStart,
    chunkCount: renderStats.chunkCount,
    maxChunkMs: renderStats.maxChunkMs,
    eventCount: renderStats.eventCount,
    expandedEventCount: renderStats.expandedEventCount,
    sampleRate,
  });
  return buffers;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function cacheKey(track, ctx) {
  const identity = stableStringify({
    id: track?.id,
    tempo: track?.tempo,
    meter: track?.meter,
    key: track?.key,
    introBars: track?.introBars,
    sectionBars: track?.sectionBars,
    instruments: track?.instruments,
    sections: track?.sections,
  });
  return `${track?.id || 'unknown'}:${renderSampleRate(ctx)}:${fastHash(identity)}`;
}

function getRenderCacheForContext(ctx) {
  let cache = RENDER_CACHE.get(ctx);
  if (!cache) {
    cache = new Map();
    RENDER_CACHE.set(ctx, cache);
  }
  return cache;
}

function trimRenderCache(cache) {
  while (cache.size > RENDER_CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

function getRenderedBuffers(ctx, track, reporter = null) {
  const cache = getRenderCacheForContext(ctx);
  const key = cacheKey(track, ctx);
  if (cache.has(key)) {
    reporter?.recordEvent('bgm.cacheHit', { trackId: track?.id || '' });
    return cache.get(key);
  }

  reporter?.recordEvent('bgm.cacheMiss', { trackId: track?.id || '' });
  const promise = renderTrackBuffers(ctx, track, reporter).catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, promise);
  trimRenderCache(cache);
  return promise;
}

function safeStop(source, when = 0) {
  try { source.stop?.(when); } catch {}
}

function safeDisconnect(node) {
  try { node.disconnect?.(); } catch {}
}

export class BgmTrackPlayer {
  constructor(getContext, getDestination, performanceReporter = null) {
    this.getContext = getContext;
    this.getDestination = getDestination;
    this.performanceReporter = performanceReporter;
    this.currentTrackId = null;
    this.currentTrackKey = null;
    this.track = null;
    this.bus = null;
    this.sources = new Set();
    this.renderToken = 0;
  }

  get ctx() {
    return this.getContext?.() || null;
  }

  setPerformanceReporter(performanceReporter = null) {
    this.performanceReporter = performanceReporter;
  }

  play(track) {
    const ctx = this.ctx;
    const destination = this.getDestination?.();
    if (!ctx || !destination || !track) return;
    const reporter = this.performanceReporter;
    const nextTrackKey = cacheKey(track, ctx);
    reporter?.recordEvent('bgm.playRequested', { trackId: track.id || '', sameTrack: this.currentTrackKey === nextTrackKey && !!this.bus });
    if (this.currentTrackKey === nextTrackKey && this.bus) return;

    this.stop(STOP_FADE_SEC);
    const token = this.renderToken + 1;
    this.renderToken = token;
    this.currentTrackId = track.id;
    this.currentTrackKey = nextTrackKey;
    this.track = track;
    this.bus = ctx.createGain();
    this.bus.gain.setValueAtTime(MIN_GAIN, ctx.currentTime);
    this.bus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.36);
    this.bus.connect(destination);

    getRenderedBuffers(ctx, track, reporter)
      .then((buffers) => {
        if (this.renderToken !== token || this.currentTrackKey !== nextTrackKey || !this.bus || !buffers?.loopBuffer) return;
        reporter?.recordEvent('bgm.buffersReady', { trackId: track.id || '' });
        this.startBuffers(buffers, ctx.currentTime + PLAY_START_LEAD_SEC);
      })
      .catch((error) => {
        reporter?.recordEvent('bgm.renderError', { trackId: track.id || '', message: error?.message || String(error) });
        if (this.renderToken === token) this.stop(0);
      });
  }

  startBuffers({ entryBuffer, loopBuffer }, startAt) {
    const ctx = this.ctx;
    if (!ctx || !this.bus || !loopBuffer) return;

    if (entryBuffer) {
      const entrySource = ctx.createBufferSource();
      entrySource.buffer = entryBuffer;
      entrySource.connect(this.bus);
      entrySource.start(startAt);
      this.trackSource(entrySource);

      const loopSource = ctx.createBufferSource();
      loopSource.buffer = loopBuffer;
      loopSource.loop = true;
      loopSource.connect(this.bus);
      loopSource.start(startAt + entryBuffer.duration);
      this.trackSource(loopSource);
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = loopBuffer;
    source.loop = true;
    source.connect(this.bus);
    source.start(startAt);
    this.trackSource(source);
  }

  stop(fadeSeconds = STOP_FADE_SEC) {
    this.renderToken += 1;
    const ctx = this.ctx;
    const bus = this.bus;
    const at = ctx?.currentTime ?? 0;

    if (ctx && bus) {
      bus.gain.cancelScheduledValues(at);
      bus.gain.setValueAtTime(Math.max(MIN_GAIN, bus.gain.value || MIN_GAIN), at);
      bus.gain.exponentialRampToValueAtTime(MIN_GAIN, at + fadeSeconds);
      globalThis.setTimeout(() => safeDisconnect(bus), (fadeSeconds + 0.08) * 1000);
    } else if (bus) {
      safeDisconnect(bus);
    }

    for (const source of this.sources) {
      safeStop(source, at + fadeSeconds);
      globalThis.setTimeout(() => safeDisconnect(source), (fadeSeconds + 0.12) * 1000);
    }
    this.sources.clear();

    this.currentTrackId = null;
    this.currentTrackKey = null;
    this.track = null;
    this.bus = null;
  }

  update() {}

  trackSource(source) {
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      safeDisconnect(source);
    };
  }
}
