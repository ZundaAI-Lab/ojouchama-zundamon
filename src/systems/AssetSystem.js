/**
 * 責務: 画像アセットのキー解決、段階ロード、ロード済み画像キャッシュを担当する。
 * 更新ルール: どの画面・ステージで何を読むかはdata/assetLoadPlans.jsへ置き、このクラスへゲーム固有判断を持ち込まない。
 * 更新ルール: 描画側は同期のgetImage()だけを使い、必要画像の事前ロードはScene遷移前に完了させる。
 * 更新ルール: 詳細負荷レポートはsetPerformanceReporterで接続し、通常ロード処理では取得関数呼び出しを挟まない。
 */
const DEFAULT_LOAD_CONCURRENCY = 6;
const DEFAULT_PRELOAD_CONCURRENCY = 3;

function toUniqueKeys(keys) {
  return [...new Set((keys || []).filter(key => typeof key === 'string' && key.length > 0))];
}

async function runLimited(items, concurrency, worker) {
  const queue = [...items];
  const limit = Math.max(1, Math.floor(concurrency || DEFAULT_LOAD_CONCURRENCY));
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

export class AssetSystem {
  constructor(performanceReporter = null) {
    this.performanceReporter = performanceReporter;
    this.sources = new Map();
    this.images = new Map();
    this.loading = new Map();
    this.failed = new Set();
    this.missingWarned = new Set();
  }

  setPerformanceReporter(performanceReporter = null) {
    this.performanceReporter = performanceReporter;
  }

  setManifest(manifest) {
    this.sources = new Map(Object.entries(manifest?.images || {}));
    this.images.clear();
    this.loading.clear();
    this.failed.clear();
    this.missingWarned.clear();
  }

  hasSource(key) {
    return this.sources.has(key);
  }

  isLoaded(key) {
    return this.images.has(key);
  }

  async loadKeys(keys, options = {}) {
    const uniqueKeys = toUniqueKeys(keys).filter(key => !this.images.has(key));
    if (uniqueKeys.length <= 0) return;
    const perf = this.performanceReporter;
    const startedAt = perf ? performance.now() : 0;
    perf?.recordEvent('asset.loadKeysStart', { count: uniqueKeys.length, concurrency: options.concurrency ?? DEFAULT_LOAD_CONCURRENCY });
    await runLimited(uniqueKeys, options.concurrency ?? DEFAULT_LOAD_CONCURRENCY, key => this.loadImage(key));
    perf?.recordEvent('asset.loadKeysEnd', { count: uniqueKeys.length, durationMs: performance.now() - startedAt });
  }

  preloadKeys(keys, options = {}) {
    const uniqueKeys = toUniqueKeys(keys).filter(key => !this.images.has(key) && !this.loading.has(key));
    if (uniqueKeys.length <= 0) return;
    this.performanceReporter?.recordEvent('asset.preloadQueued', { count: uniqueKeys.length });

    const run = () => {
      this.performanceReporter?.recordEvent('asset.preloadStarted', { count: uniqueKeys.length });
      this.loadKeys(uniqueKeys, { concurrency: options.concurrency ?? DEFAULT_PRELOAD_CONCURRENCY });
    };

    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(run, { timeout: options.timeout ?? 1200 });
      return;
    }
    globalThis.setTimeout?.(run, options.delayMs ?? 0);
  }

  loadImage(key) {
    if (this.images.has(key)) return Promise.resolve(this.images.get(key));
    if (this.loading.has(key)) return this.loading.get(key);

    const src = this.sources.get(key);
    if (!src) {
      if (!this.missingWarned.has(key)) {
        console.warn(`未定義の画像キーです: ${key}`);
        this.missingWarned.add(key);
      }
      return Promise.resolve(null);
    }

    const perf = this.performanceReporter;
    const startedAt = perf ? performance.now() : 0;
    perf?.recordEvent('image.loadStart', { key });
    const promise = new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        this.loading.delete(key);
        perf?.recordEvent('image.loadEnd', { key, durationMs: performance.now() - startedAt, width: img.naturalWidth || img.width || 0, height: img.naturalHeight || img.height || 0 });
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`画像を読み込めませんでした: ${key} ${src}`);
        this.failed.add(key);
        this.loading.delete(key);
        perf?.recordEvent('image.loadError', { key, durationMs: performance.now() - startedAt });
        resolve(null);
      };
      img.src = src;
    });

    this.loading.set(key, promise);
    return promise;
  }

  getImage(key) {
    return this.images.get(key);
  }
}
