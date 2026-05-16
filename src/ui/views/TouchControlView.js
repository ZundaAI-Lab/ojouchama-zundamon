/**
 * 責務: タッチ操作設定専用画面のDOMを生成する。
 * 更新ルール: 値の正規化・保存は OptionSettingsPageController / OptionDraftStore に残し、ここでは初期HTMLだけを担当する。
 * 更新ルール: リサイズ用の画面種別は wrapper class だけでCSSへ渡し、寸法計算はCSSへ集約する。
 * 更新ルール: 機能ボタン割り当ては5列×2段の10スロットをHTML化し、各スロットの値変更はControllerへ委譲する。
 * 更新ルール: 左利き配置時の左右反転は表示用スロットへ変換し、保存値の並びは変更しない。
 */
import {
  INPUT_ACTION_LABELS,
  TOUCH_BUTTON_ACTIONS,
  TOUCH_BUTTON_ACTION_LABELS,
  TOUCH_BUTTON_SLOT_COUNT,
  getTouchButtonSlotsForLayout,
} from '../../config/controlSettings.js';

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
        <p class="menu-subtitle">円形方向パッドとアクションボタンの見た目・割り当てを調整するの。</p>
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
          <section class="option-section touch-button-slot-section">
            <h2 class="option-section-title">機能ボタン割り当て</h2>
            <p class="option-section-note">上段が1〜5、下段が6〜10。既定は4=茶、5=なの、6=ポーズ、8=礼、9=魔法、10=飛。未割り当ての場所はゲーム画面に表示しません。</p>
            <div class="touch-button-slot-grid">
              ${this.renderButtonSlotItems(touchControls)}
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

  renderButtonSlotItems(touchControls) {
    const visualButtonSlots = getTouchButtonSlotsForLayout(touchControls.buttonSlots, touchControls.layout);
    return Array.from({ length: TOUCH_BUTTON_SLOT_COUNT }, (_, index) => {
      const action = visualButtonSlots[index] || '';
      const slotNumber = index + 1;
      return `
        <label class="touch-button-slot-item" data-menu-item="true" data-option="touchButtonSlot" data-touch-button-slot="${index}" tabindex="0">
          <span class="touch-button-slot-number">${slotNumber}</span>
          <span class="touch-button-slot-value" data-option-value="touchButtonSlot${index}">${this.getActionShortLabel(action)}</span>
          <select class="touch-button-slot-select" data-touch-button-slot-select="${index}">
            ${this.renderButtonSlotOptions(action)}
          </select>
        </label>
      `;
    }).join('');
  }

  renderButtonSlotOptions(selectedAction) {
    const options = ['<option value="">未割り当て</option>'];
    for (const action of TOUCH_BUTTON_ACTIONS) {
      const shortLabel = TOUCH_BUTTON_ACTION_LABELS[action] || action;
      const longLabel = INPUT_ACTION_LABELS[action] || action;
      options.push(`<option value="${action}" ${selectedAction === action ? 'selected' : ''}>${shortLabel}：${longLabel}</option>`);
    }
    return options.join('');
  }

  getActionShortLabel(action) {
    return action ? (TOUCH_BUTTON_ACTION_LABELS[action] || action) : '未割り当て';
  }
}
