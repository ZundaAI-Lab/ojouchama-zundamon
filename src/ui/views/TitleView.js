/**
 * 責務: タイトル画面のDOM構造を生成する。
 * 更新ルール: 画面遷移・セーブ初期化などの処理は TitleScene に残し、ここでは表示用HTMLだけを組み立てる。
 * 更新ルール: タイトル画面は上部タイトルの直下に、進行状況パネルと操作ボタンパネルを上下配置で分離する。
 * 更新ルール: バージョン表記は appVersion のグローバル定数を参照し、画面側へ直書きしない。
 */
import { APP_VERSION_LABEL } from '../../config/appVersion.js';

export class TitleView {
  constructor(app) {
    this.app = app;
  }

  render({ save, hasProgress, hasSaveData, totalWorlds, showDebug }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'menu-screen title-screen';
    wrapper.innerHTML = `
      <h1 class="title-main-heading">お嬢ちゃまずんだもんと<br>夢みる豆の王国</h1>

      <div class="title-bottom-panels">
        <section class="title-progress-panel panel" aria-label="進行状況">
          <div class="title-block-heading">進行状況</div>
          <div class="title-status-grid">
            <div class="title-status-item">
              <span>クリア済み</span>
              <strong>${save.clearedStages.length} / ${totalWorlds}</strong>
            </div>
            <div class="title-status-item">
              <span>総豆コイン</span>
              <strong>${save.totalCoins}</strong>
            </div>
          </div>
        </section>

        <div class="title-actions-panel panel" aria-label="タイトルメニュー">
          <div class="menu-actions title-actions title-actions-vertical">
            <button class="primary-btn title-primary-action" id="start-btn">はじめから</button>
            <button class="secondary-btn" id="continue-btn" ${hasProgress ? '' : 'disabled'}>つづきから</button>
            <button class="secondary-btn" id="option-btn">オプション</button>
            ${showDebug ? '<button class="secondary-btn" id="debug-btn">デバッグ</button>' : ''}
            <button class="secondary-btn danger-btn" id="reset-btn" ${hasSaveData ? '' : 'disabled'}>セーブ初期化</button>
          </div>
        </div>
      </div>

      <div class="title-version-label" aria-label="バージョン">${APP_VERSION_LABEL}</div>
    `;
    return wrapper;
  }
}
