/**
 * 責務: キーコンフィグ専用画面のDOMを生成する。
 * 更新ルール: キー入力待ち受け・重複解決・保存処理は OptionSettingsPageController / OptionDraftStore に残す。
 * 更新ルール: リサイズ用の画面種別は wrapper class だけでCSSへ渡し、寸法計算はCSSへ集約する。
 */
import { CONFIGURABLE_KEY_ACTIONS, INPUT_ACTION_LABELS, getKeyDisplayName } from '../../config/controlSettings.js';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export class KeyConfigView {
  constructor(app) {
    this.app = app;
  }

  render(bindings) {
    const wrapper = document.createElement('div');
    wrapper.className = 'menu-screen key-config-screen';
    wrapper.innerHTML = `
      <div class="menu-card option-card panel">
        <h1 class="menu-title">キーコンフィグ</h1>
        <p class="menu-subtitle">ボタンを選んで、キー・左/右クリック・ホイールを入力するの。Backspace/Deleteでその枠だけ未設定にできるの。</p>
        <div class="option-scroll">
          <section class="option-section">
            <h2 class="option-section-title">キー割り当て</h2>
            <p class="option-section-note">各アクションは2枠まで設定できるの。「既定」はそのアクションだけ初期入力へ戻すの。入力待ち中は他のボタンへ移動できないの。</p>
            <div class="key-config-list">
              ${this.renderKeyConfigRows(bindings)}
            </div>
          </section>
        </div>
        <div class="menu-actions">
          <button class="primary-btn" id="save-btn">保存して戻る</button>
          <button class="secondary-btn" id="cancel-btn">保存せず戻る</button>
        </div>
      </div>
    `;
    return wrapper;
  }

  renderKeyConfigRows(bindings) {
    return CONFIGURABLE_KEY_ACTIONS.map(action => {
      const slots = bindings[action] || [];
      const label = INPUT_ACTION_LABELS[action] || action;
      return `
        <div class="key-config-row">
          <span class="key-config-action">${escapeHtml(label)}</span>
          <div class="key-config-buttons">
            ${[0, 1].map(slot => `
              <button class="key-bind-btn" data-key-bind-action="${escapeHtml(action)}" data-key-bind-slot="${slot}">
                ${escapeHtml(getKeyDisplayName(slots[slot]))}
              </button>
            `).join('')}
            <button class="key-default-btn" data-key-default-action="${escapeHtml(action)}">既定</button>
          </div>
        </div>
      `;
    }).join('');
  }
}
