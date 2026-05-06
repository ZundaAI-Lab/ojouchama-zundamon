/**
 * 責務: ポーズメニューDOM生成、表示切替、ボタンイベント接続を担当する。
 * 更新ルール: ポーズ状態の決定やシーン遷移の実行はStageRuntimeへ委譲する。
 */
import { MenuNavigator } from '../MenuNavigator.js';

export class PauseMenuView {
  constructor({ app, stageName, onResume, onTutorial, onOptions, onGarden }) {
    this.app = app;
    this.stageName = stageName;
    this.onResume = onResume;
    this.onTutorial = onTutorial;
    this.onOptions = onOptions;
    this.onGarden = onGarden;
    this.root = null;
    this.menu = null;
  }

  mount() {
    if (this.root) return this.root;
    this.root = document.createElement('div');
    this.root.className = 'menu-screen';
    this.root.innerHTML = `
      <div class="menu-card panel">
        <h1 class="menu-title">ポーズ</h1>
        <p class="menu-subtitle">${this.stageName}</p>
        <p class="menu-subtitle">↑↓←→で選択 / Enter・Space・Zで決定 / Esc・Pで再開</p>
        <div class="menu-actions pause-actions">
          <button class="primary-btn" id="resume-btn">再開</button>
          <button class="secondary-btn" id="pause-player-tutorial-btn">操作説明</button>
          <button class="secondary-btn" id="pause-option-btn">オプション</button>
          <button class="secondary-btn" id="garden-btn">ガーデンへ</button>
        </div>
      </div>
    `;
    this.app.uiRoot.append(this.root);
    this.root.querySelector('#resume-btn').addEventListener('click', this.onResume);
    this.root.querySelector('#pause-player-tutorial-btn').addEventListener('click', () => this.onTutorial?.('player'));
    this.root.querySelector('#pause-option-btn').addEventListener('click', this.onOptions);
    this.root.querySelector('#garden-btn').addEventListener('click', this.onGarden);
    this.menu = new MenuNavigator({ app: this.app, root: this.root, onCancel: this.onResume });
    return this.root;
  }

  update() {
    this.menu?.update();
  }

  destroy() {
    this.menu?.destroy();
    this.menu = null;
    this.root?.remove();
    this.root = null;
  }
}
