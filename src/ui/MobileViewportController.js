/**
 * 責務: スマホ表示時の実ビューポートサイズと端末向きクラスをCSS変数へ反映する。
 * 更新ルール: 入力処理・ゲーム進行・タッチボタンDOM生成には関与しない。
 * 更新ルール: canvas実寸更新はGameApp.resize()へ通知するだけに留める。
 * 更新ルール: 詳細負荷レポートはsetPerformanceReporterで接続し、通常refresh中に取得関数呼び出しを挟まない。
 */
const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';
const MOBILE_WIDTH_LIMIT = 900;
const MOBILE_HEIGHT_LIMIT = 640;
const RESIZE_DEBOUNCE_MS = 40;

export class MobileViewportController {
 constructor({ shell, onResize, performanceReporter = null } = {}) {
  this.shell = shell;
  this.onResize = onResize;
  this.performanceReporter = performanceReporter;
  this.root = document.documentElement;
  this.visualViewport = window.visualViewport || null;
  this.touchQuery = window.matchMedia?.(TOUCH_QUERY) || null;
  this.resizeTimer = 0;
  this.started = false;
  this.boundRefreshSoon = () => this.refreshSoon();
 }

 start() {
  if (this.started) return;
  this.started = true;
  this.refresh();

  window.addEventListener('resize', this.boundRefreshSoon, { passive: true });
  window.addEventListener('orientationchange', this.boundRefreshSoon, { passive: true });
  this.visualViewport?.addEventListener?.('resize', this.boundRefreshSoon, { passive: true });
  this.visualViewport?.addEventListener?.('scroll', this.boundRefreshSoon, { passive: true });
  this.touchQuery?.addEventListener?.('change', this.boundRefreshSoon);
 }

 setPerformanceReporter(performanceReporter = null) {
  this.performanceReporter = performanceReporter;
 }

 refreshSoon() {
  window.clearTimeout(this.resizeTimer);
  this.resizeTimer = window.setTimeout(() => {
   window.requestAnimationFrame(() => this.refresh());
  }, RESIZE_DEBOUNCE_MS);
 }

 refresh() {
  const perf = this.performanceReporter;
  const startedAt = perf ? performance.now() : 0;
  const viewport = this.getViewportSize();
  const isTouchDevice = this.isTouchDevice(viewport);
  const isLandscape = viewport.width >= viewport.height;
  const isMobileViewport = isTouchDevice && (
   Math.min(viewport.width, viewport.height) <= MOBILE_HEIGHT_LIMIT ||
   Math.max(viewport.width, viewport.height) <= MOBILE_WIDTH_LIMIT
  );

  this.root.style.setProperty('--app-vw', `${viewport.width}px`);
  this.root.style.setProperty('--app-vh', `${viewport.height}px`);
  this.root.classList.toggle('is-touch-device', isTouchDevice);
  this.root.classList.toggle('is-mobile-viewport', isMobileViewport);
  this.root.classList.toggle('is-mobile-landscape', isMobileViewport && isLandscape);
  this.root.classList.toggle('is-mobile-portrait', isMobileViewport && !isLandscape);

  this.onResize?.();
  perf?.recordEvent('viewport.mobileRefresh', {
   width: viewport.width,
   height: viewport.height,
   isTouchDevice,
   isMobileViewport,
   isLandscape,
   durationMs: performance.now() - startedAt,
  });
 }

 getViewportSize() {
  const vv = this.visualViewport;
  const width = Math.max(1, Math.round(vv?.width || window.innerWidth || document.documentElement.clientWidth || 1));
  const height = Math.max(1, Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight || 1));
  return { width, height };
 }

 isTouchDevice(viewport) {
  const coarsePointer = Boolean(this.touchQuery?.matches);
  const hasTouchPoints = Number(navigator.maxTouchPoints || 0) > 0;
  const smallViewport = Math.min(viewport.width, viewport.height) <= MOBILE_HEIGHT_LIMIT;
  return coarsePointer || (hasTouchPoints && smallViewport);
 }
}
