/**
 * 責務: 負荷状況モニタの詳細レポート取得時だけ、1ステージ分の集計とスパイク追跡を担当する。
 * 更新ルール: 通常プレイへ影響しないよう、DebugSettings.capturePerformanceReportがONの時だけ生成・接続される。
 * 更新ルール: レポートはPerformanceReportStoreへメモリ保持し、localStorage保存や実行中console出力は行わない。
 */
import { buildPerformanceReportJson, formatPerformanceReport } from './PerformanceReportFormatter.js';

const MAX_SPIKES = 40;
const MAX_EVENTS = 180;
const MAX_LONG_TASKS = 40;
const SPIKE_FRAME_MS = 50;
const SPIKE_UPDATE_MS = 12;
const SPIKE_RENDER_MS = 12;
const SPIKE_STEPS = 4;
const METRIC_BUCKETS_MS = Object.freeze([0.1, 0.25, 0.5, 1, 2, 4, 8, 12, 16, 24, 33, 50, 66, 100, 150, 250, 500, 1000]);

function now() {
  return globalThis.performance?.now?.() ?? Date.now();
}

function makeMetric() {
  return { count: 0, total: 0, max: 0, buckets: new Uint32Array(METRIC_BUCKETS_MS.length + 1) };
}

function addMetric(metric, value) {
  if (!Number.isFinite(value)) return;
  metric.count += 1;
  metric.total += value;
  if (value > metric.max) metric.max = value;
  let bucketIndex = METRIC_BUCKETS_MS.length;
  for (let i = 0; i < METRIC_BUCKETS_MS.length; i += 1) {
    if (value <= METRIC_BUCKETS_MS[i]) {
      bucketIndex = i;
      break;
    }
  }
  metric.buckets[bucketIndex] += 1;
}

function percentileFromBuckets(metric, ratio) {
  if (!metric?.count) return 0;
  const target = Math.max(1, Math.ceil(metric.count * ratio));
  let total = 0;
  for (let i = 0; i < metric.buckets.length; i += 1) {
    total += metric.buckets[i];
    if (total >= target) return i < METRIC_BUCKETS_MS.length ? METRIC_BUCKETS_MS[i] : metric.max;
  }
  return metric.max;
}

function summarizeMetric(metric) {
  return {
    count: metric.count,
    avg: metric.count ? metric.total / metric.count : 0,
    p95: percentileFromBuckets(metric, 0.95),
    p99: percentileFromBuckets(metric, 0.99),
    max: metric.max,
  };
}

function summarizePhaseMetric(metric) {
  return {
    count: metric.count,
    totalMs: metric.total,
    avgMs: metric.count ? metric.total / metric.count : 0,
    p95Ms: percentileFromBuckets(metric, 0.95),
    maxMs: metric.max,
  };
}

function countArray(value) {
  return Array.isArray(value) ? value.length : 0;
}

function safeStageCounts(stage = {}) {
  return {
    width: stage.width || 0,
    height: stage.height || 0,
    platforms: countArray(stage.platforms),
    decorations: countArray(stage.decorations),
    doors: countArray(stage.doors),
    switchGimmicks: countArray(stage.switchGimmicks),
    switchTargets: countArray(stage.switchTargets),
    checkpoints: countArray(stage.checkpoints),
    items: countArray(stage.items),
    residents: countArray(stage.residents),
    projectiles: countArray(stage.projectiles),
    specialEvents: countArray(stage.specialEvents),
  };
}

function runtimeCounts(runtime) {
  if (!runtime) return {};
  const collisionWorld = runtime.collisionWorld || {};
  return {
    residents: countArray(runtime.residents),
    projectiles: countArray(runtime.projectiles),
    particles: countArray(runtime.particles),
    items: countArray(runtime.items),
    collisionSolids: countArray(collisionWorld.playerSolids),
    projectileSolids: countArray(collisionWorld.projectileSolids),
    slopeSurfaces: countArray(collisionWorld.slopeSurfaces),
  };
}

function mergeMax(target, values) {
  for (const [key, value] of Object.entries(values || {})) {
    if (!Number.isFinite(value)) continue;
    target[key] = Math.max(target[key] || 0, value);
  }
}

function compactDetails(details = {}) {
  const result = {};
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined) continue;
    if (typeof value === 'number') result[key] = Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
    else if (typeof value === 'string' || typeof value === 'boolean' || value === null) result[key] = value;
    else if (Array.isArray(value)) result[key] = value.slice(0, 12);
    else if (typeof value === 'object') result[key] = { ...value };
  }
  return result;
}

function spikeSuspects(stats, counters, longTaskNearby, eventsNearby) {
  const suspects = [];
  if (stats.updateMs >= SPIKE_UPDATE_MS) suspects.push('update-heavy');
  if (stats.renderMs >= SPIKE_RENDER_MS) suspects.push('render-heavy');
  if (stats.fixedSteps >= SPIKE_STEPS) suspects.push('fixed-step-catchup');
  if (stats.accumulatorDropped) suspects.push('accumulator-drop');
  if (stats.frameMs >= SPIKE_FRAME_MS && stats.updateMs < SPIKE_UPDATE_MS && stats.renderMs < SPIKE_RENDER_MS) suspects.push('async-main-thread');
  if ((counters?.projectileSubstepsTotal || 0) > 0) suspects.push('projectiles');
  if ((counters?.physicsSubsteps || 0) > 0) suspects.push('physics');
  if (longTaskNearby) suspects.push('longtask');
  if (eventsNearby?.some(event => event.type?.startsWith('bgm.'))) suspects.push('bgm');
  if (eventsNearby?.some(event => event.type?.startsWith('asset.') || event.type?.startsWith('image.'))) suspects.push('asset');
  if (eventsNearby?.some(event => event.type?.startsWith('viewport.'))) suspects.push('viewport');
  return [...new Set(suspects)];
}

export class PerformanceReportRecorder {
  constructor({ app, store }) {
    this.app = app;
    this.store = store;
    this.session = null;
    this.pendingFrameCounters = {};
    this.longTaskObserver = null;
    this.startLongTaskObserver();
  }

  startLongTaskObserver() {
    const Observer = globalThis.PerformanceObserver;
    if (!Observer) return;
    try {
      this.longTaskObserver = new Observer(list => {
        for (const entry of list.getEntries()) {
          this.recordLongTask(entry);
        }
      });
      this.longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (_) {
      this.longTaskObserver = null;
    }
  }

  destroy(reason = 'disabled') {
    this.finishStage(reason);
    try { this.longTaskObserver?.disconnect?.(); } catch (_) {}
    this.longTaskObserver = null;
  }

  beginStage(runtime, metadata = {}) {
    this.finishStage('replaced');
    const startMs = now();
    const stage = runtime?.stage || {};
    this.session = {
      id: `${metadata.stageId || stage.id || 'stage'}:${Math.round(startMs)}`,
      runtime,
      startedAtMs: startMs,
      endedAtMs: 0,
      reason: '',
      stage: {
        id: metadata.stageId || stage.id || 'unknown',
        name: stage.name || '',
        backgroundKey: stage.backgroundKey || '',
        bgmId: metadata.bgmId || runtime?.stageBgmId || '',
        counts: safeStageCounts(stage),
      },
      metrics: {
        frameMs: makeMetric(),
        updateMs: makeMetric(),
        renderMs: makeMetric(),
        fixedSteps: makeMetric(),
      },
      fixedStepsAtLimit: 0,
      accumulatorDroppedCount: 0,
      phases: new Map(),
      counterTotals: {},
      counterMax: {},
      maxCounts: {},
      spikes: [],
      events: [],
      longTasks: [],
    };
    this.pendingFrameCounters = {};
    this.recordEvent('stage.begin', {
      stageId: this.session.stage.id,
      bgmId: this.session.stage.bgmId,
      backgroundKey: this.session.stage.backgroundKey,
      counts: this.session.stage.counts,
    });
  }

  recordRuntimeReady(runtime) {
    if (!this.session || this.session.runtime !== runtime) return;
    const counts = runtimeCounts(runtime);
    mergeMax(this.session.maxCounts, counts);
    this.recordEvent('stage.runtimeReady', counts);
  }

  finishStage(reason = 'finish', runtime = null) {
    if (!this.session) return null;
    if (runtime && this.session.runtime && this.session.runtime !== runtime) return null;
    const session = this.session;
    session.endedAtMs = now();
    session.reason = reason;
    this.session = null;
    this.pendingFrameCounters = {};

    const report = this.buildReport(session);
    this.store?.add(report);
    return report;
  }

  buildReport(session) {
    const frame = summarizeMetric(session.metrics.frameMs);
    const durationMs = Math.max(0, (session.endedAtMs || now()) - session.startedAtMs);
    const frameCount = session.metrics.frameMs.count;
    const maxFrameMs = frame.max || 0;
    const minFps = maxFrameMs > 0 ? 1000 / maxFrameMs : 0;
    const avgFps = frame.avg > 0 ? 1000 / frame.avg : 0;
    const phases = {};
    for (const [name, metric] of session.phases.entries()) phases[name] = summarizePhaseMetric(metric);

    const report = {
      id: session.id,
      generatedAt: new Date().toISOString(),
      reason: session.reason,
      stage: session.stage,
      summary: {
        durationSec: durationMs / 1000,
        frameCount,
        avgFps,
        minFps,
        frameMs: frame,
        updateMs: summarizeMetric(session.metrics.updateMs),
        renderMs: summarizeMetric(session.metrics.renderMs),
        fixedStepsMax: session.metrics.fixedSteps.max,
        fixedStepsAtLimit: session.fixedStepsAtLimit,
        accumulatorDroppedCount: session.accumulatorDroppedCount,
        spikeCount: session.spikes.length,
        longTaskCount: session.longTasks.length,
      },
      phases,
      counters: {
        totals: { ...session.counterTotals },
        maxPerFrame: { ...session.counterMax },
      },
      maxCounts: { ...session.maxCounts },
      spikes: session.spikes,
      events: session.events,
      longTasks: session.longTasks,
    };
    report.summaryText = formatPerformanceReport(report);
    report.jsonText = buildPerformanceReportJson(report);
    return report;
  }

  recordFrame(stats = {}) {
    const session = this.session;
    if (!session) {
      this.pendingFrameCounters = {};
      return;
    }
    const runtime = this.app?.sceneManager?.current?.runtime || session.runtime || null;
    const frameMs = (stats.rawFrameDt ?? stats.frameDt ?? 0) * 1000;
    const normalized = {
      frameMs,
      updateMs: stats.updateMs || 0,
      renderMs: stats.renderMs || 0,
      fixedSteps: stats.fixedSteps || 0,
      accumulatorDropped: !!stats.accumulatorDropped,
    };
    addMetric(session.metrics.frameMs, normalized.frameMs);
    addMetric(session.metrics.updateMs, normalized.updateMs);
    addMetric(session.metrics.renderMs, normalized.renderMs);
    addMetric(session.metrics.fixedSteps, normalized.fixedSteps);
    if (normalized.fixedSteps >= 5) session.fixedStepsAtLimit += 1;
    if (normalized.accumulatorDropped) session.accumulatorDroppedCount += 1;

    const counts = runtimeCounts(runtime);
    mergeMax(session.maxCounts, counts);
    const counters = { ...this.pendingFrameCounters };
    this.pendingFrameCounters = {};

    const shouldSpike = normalized.frameMs >= SPIKE_FRAME_MS ||
      normalized.updateMs >= SPIKE_UPDATE_MS ||
      normalized.renderMs >= SPIKE_RENDER_MS ||
      normalized.fixedSteps >= SPIKE_STEPS ||
      normalized.accumulatorDropped;

    if (shouldSpike) {
      const atMs = now() - session.startedAtMs;
      const nearbyEvents = session.events.filter(event => Math.abs(event.atMs - atMs) <= 120);
      const nearbyLongTask = session.longTasks.some(task => Math.abs(task.atMs - atMs) <= 120);
      session.spikes.push({
        atMs,
        ...normalized,
        mode: runtime?.performanceUpdateMode || this.app?.sceneManager?.currentSceneId || '',
        sceneId: this.app?.sceneManager?.currentSceneId || '',
        player: runtime?.player ? {
          x: Math.round(runtime.player.x * 10) / 10,
          y: Math.round(runtime.player.y * 10) / 10,
          vx: Math.round((runtime.player.vx || 0) * 10) / 10,
          vy: Math.round((runtime.player.vy || 0) * 10) / 10,
        } : null,
        camera: runtime?.camera ? {
          x: Math.round((runtime.camera.x || 0) * 10) / 10,
          y: Math.round((runtime.camera.y || 0) * 10) / 10,
        } : null,
        counts,
        counters,
        canvas: {
          width: this.app?.canvas?.width || 0,
          height: this.app?.canvas?.height || 0,
          dpr: globalThis.devicePixelRatio || 1,
        },
        suspects: spikeSuspects(normalized, counters, nearbyLongTask, nearbyEvents),
      });
      session.spikes.sort((a, b) => b.frameMs - a.frameMs);
      if (session.spikes.length > MAX_SPIKES) session.spikes.length = MAX_SPIKES;
    }
  }

  recordPhase(name, durationMs) {
    if (!this.session || !name || !Number.isFinite(durationMs)) return;
    let metric = this.session.phases.get(name);
    if (!metric) {
      metric = makeMetric();
      this.session.phases.set(name, metric);
    }
    addMetric(metric, durationMs);
  }

  addFrameCounters(counters = {}) {
    if (!this.session) return;
    for (const [key, value] of Object.entries(counters)) {
      if (!Number.isFinite(value)) continue;
      this.pendingFrameCounters[key] = (this.pendingFrameCounters[key] || 0) + value;
      this.session.counterTotals[key] = (this.session.counterTotals[key] || 0) + value;
      this.session.counterMax[key] = Math.max(this.session.counterMax[key] || 0, this.pendingFrameCounters[key]);
    }
  }

  setFrameMaxCounter(key, value) {
    if (!this.session || !Number.isFinite(value)) return;
    this.pendingFrameCounters[key] = Math.max(this.pendingFrameCounters[key] || 0, value);
    this.session.counterMax[key] = Math.max(this.session.counterMax[key] || 0, value);
  }

  recordEvent(type, details = {}) {
    if (!this.session || !type) return;
    this.session.events.push({
      atMs: now() - this.session.startedAtMs,
      type,
      details: compactDetails(details),
    });
    if (this.session.events.length > MAX_EVENTS) this.session.events.shift();
  }

  recordLongTask(entry) {
    if (!this.session) return;
    this.session.longTasks.push({
      atMs: Math.max(0, (entry.startTime || now()) - this.session.startedAtMs),
      durationMs: entry.duration || 0,
      name: entry.name || 'longtask',
    });
    if (this.session.longTasks.length > MAX_LONG_TASKS) this.session.longTasks.shift();
  }
}
