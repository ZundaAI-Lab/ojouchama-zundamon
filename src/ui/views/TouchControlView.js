/**
 * 責務: タッチ操作設定専用画面のDOMを生成する。
 * 更新ルール: 値の正規化・保存は TouchControlScene に残し、ここでは初期HTMLだけを担当する。
 * 更新ルール: リサイズ用の画面種別は wrapper class だけでCSSへ渡し、寸法計算はCSSへ集約する。
 */
export class TouchControlView {
  constructor(app) {
    this.app = app;
  }

  render(touchControls) {
    const wrapper = document.createElement('div');
    wrapper.className = 'menu-screen touch-control-screen';
    wrapper.innerHTML = `
      <div class="menu-card option-card panel">
        <h1 class="menu-title">タッチ操作設定</h1>
        <p class="menu-subtitle">円形方向パッドとアクションボタンの見た目を調整するの。</p>
        <div class="option-scroll">
          <section class="option-section">
            <h2 class="option-section-title">タッチ操作</h2>
            <div class="option-list touch-option-list">
              <label class="option-item option-check-label" data-menu-item="true" data-option="touchEnabled" tabindex="0">
                <input id="touch-enabled" type="checkbox" ${touchControls.enabled ? 'checked' : ''}>
                <span>タッチ操作 <strong data-option-value="touchEnabled"></strong></span>
              </label>
              <label class="option-item" data-menu-item="true" data-option="touchLayout" tabindex="0">
                <span>配置 <strong data-option-value="touchLayout"></strong></span>
                <select id="touch-layout">
                  <option value="rightHanded" ${touchControls.layout === 'rightHanded' ? 'selected' : ''}>左：移動 / 右：ボタン</option>
                  <option value="leftHanded" ${touchControls.layout === 'leftHanded' ? 'selected' : ''}>左：ボタン / 右：移動</option>
                </select>
              </label>
              <label class="option-item" data-menu-item="true" data-option="touchPadSize" tabindex="0">
                <span>方向パッドサイズ <strong data-option-value="touchPadSize"></strong></span>
                <input id="touch-pad-size" type="range" min="96" max="170" step="2" value="${touchControls.padSize}">
              </label>
              <label class="option-item" data-menu-item="true" data-option="touchDeadZone" tabindex="0">
                <span>方向パッド中央無効範囲 <strong data-option-value="touchDeadZone"></strong></span>
                <input id="touch-dead-zone" type="range" min="6" max="40" step="1" value="${touchControls.deadZone}">
              </label>
              <label class="option-item" data-menu-item="true" data-option="touchButtonSize" tabindex="0">
                <span>ボタンサイズ <strong data-option-value="touchButtonSize"></strong></span>
                <input id="touch-button-size" type="range" min="48" max="88" step="2" value="${touchControls.buttonSize}">
              </label>
              <label class="option-item" data-menu-item="true" data-option="touchOpacity" tabindex="0">
                <span>表示濃度 <strong data-option-value="touchOpacity"></strong></span>
                <input id="touch-opacity" type="range" min="0.35" max="1" step="0.05" value="${touchControls.opacity}">
              </label>
            </div>
          </section>
        </div>
        <div class="menu-actions">
          <button class="secondary-btn" id="default-btn">既定に戻す</button>
          <button class="primary-btn" id="save-btn">保存して戻る</button>
          <button class="secondary-btn" id="cancel-btn">保存せず戻る</button>
        </div>
      </div>
    `;
    return wrapper;
  }
}
