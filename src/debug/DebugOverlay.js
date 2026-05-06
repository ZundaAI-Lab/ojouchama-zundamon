/**
 * 責務: デバッグ用の負荷状況モニタDOMの表示更新を担当する。
 * 更新ルール: 計測値の生成はGameAppに置き、ここではdebugRootへの反映だけを行う。
 */
export class DebugOverlay {
  constructor(root, settings) {
    this.root = root;
    this.settings = settings;
    this.el = document.createElement('div');
    this.el.className = 'debug-performance-monitor hidden';
    this.root?.append(this.el);
    this.elapsed = 0;
  }

  update(stats) {
    if (!this.root || !this.settings?.get('showPerformance')) {
      this.el?.classList.add('hidden');
      return;
    }

    this.el.classList.remove('hidden');
    this.elapsed += stats.frameDt || 0;
    if (this.elapsed < 0.15 && this.el.textContent) return;
    this.elapsed = 0;

    const fps = stats.frameDt > 0 ? 1 / stats.frameDt : 0;
    this.el.innerHTML = `
      <div><strong>DEBUG MONITOR</strong></div>
      <div>FPS: ${fps.toFixed(1)}</div>
      <div>Frame: ${(stats.frameDt * 1000).toFixed(2)} ms</div>
      <div>Update: ${stats.updateMs.toFixed(2)} ms</div>
      <div>Render: ${stats.renderMs.toFixed(2)} ms</div>
      <div>Steps: ${stats.fixedSteps}</div>
    `;
  }

  destroy() {
    this.el?.remove();
    this.el = null;
  }
}
