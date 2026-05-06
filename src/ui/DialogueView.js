/**
 * 責務: 会話ウィンドウのDOM生成、表示更新、行送り状態を担当する。
 * 更新ルール: ステージ進行や戦闘判定を直接変更しない。
 */
export class DialogueView {
  constructor(root, assets, onActiveChange = null) {
    this.root = root;
    this.assets = assets;
    this.onActiveChange = onActiveChange;
    this.lines = [];
    this.index = 0;
    this.active = false;
    this.onComplete = null;
    this.mode = 'center';

    this.el = document.createElement('div');
    this.el.className = 'dialogue-layer hidden';
    this.el.innerHTML = `
      <div class="dialogue-backdrop" aria-hidden="true"></div>
      <div class="dialogue-window panel" role="dialog" aria-live="polite">
        <div class="dialogue-portrait-frame">
          <img class="dialogue-portrait" data-portrait alt="" />
        </div>
        <div class="dialogue-content">
          <div class="dialogue-speaker" data-speaker></div>
          <div class="dialogue-text" data-text></div>
          <div class="dialogue-hint">Enter / Space / Zで進む　Escで送る ▶</div>
        </div>
      </div>
    `;
    this.el.addEventListener('click', () => this.next());
    this.root.append(this.el);
  }

  start(lines, onComplete = null, options = {}) {
    this.lines = lines || [];
    this.index = 0;
    this.onComplete = onComplete;
    this.mode = options.mode || options.position || 'center';
    this.active = this.lines.length > 0;
    this.el.classList.toggle('hidden', !this.active);
    this.el.dataset.mode = this.active ? this.mode : '';
    this.onActiveChange?.(this.active);
    if (!this.active) {
      this.onComplete?.();
      return;
    }
    this.render();
  }

  next() {
    if (!this.active) return;
    this.index += 1;
    if (this.index >= this.lines.length) {
      this.active = false;
      this.el.classList.add('hidden');
      this.el.dataset.mode = '';
      this.onActiveChange?.(false);
      this.onComplete?.();
      return;
    }
    this.render();
  }

  render() {
    if (!this.active) return;
    const line = this.lines[this.index] || {};
    const img = this.assets.getImage(line.portrait);
    const portrait = this.el.querySelector('[data-portrait]');
    portrait.src = img?.src || '';
    portrait.alt = line.speaker || '';
    this.el.querySelector('[data-speaker]').textContent = line.speaker || '';
    this.el.querySelector('[data-text]').textContent = line.text || '';
  }
}
