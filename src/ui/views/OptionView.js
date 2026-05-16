/**
 * 責務: オプション画面の設定入力DOMを生成する。
 * 更新ルール: 設定値の検証・保存・プレビュー反映は OptionSettingsPageController / OptionDraftStore に残し、音量入力はBGM/SEを個別に表示する。
 * 更新ルール: リサイズ用の画面種別は wrapper class だけでCSSへ渡し、寸法計算はCSSへ集約する。
 * 更新ルール: HUD外観設定は色入力と濃さ入力の初期DOMだけを生成し、保存・プレビュー処理はScene/Controllerへ渡す。
 */
export class OptionView {
  constructor(app) {
    this.app = app;
  }

  render(settings) {
    const wrapper = document.createElement('div');
    wrapper.className = 'menu-screen option-screen';
    wrapper.innerHTML = `
      <div class="menu-card option-card panel">
        <h1 class="menu-title">オプション</h1>
        <p class="menu-subtitle">↑↓で項目選択、←→で変更、Enter・Space・Zで決定するの。</p>
        <div class="option-scroll">
          <section class="option-section">
            <h2 class="option-section-title">音量・難易度</h2>
            <div class="option-list">
              <label class="option-item" data-menu-item="true" data-option="bgm" tabindex="0">
                <span>BGM音量 <strong data-option-value="bgm"></strong></span>
                <input id="bgm" type="range" min="0" max="1" step="0.05" value="${settings.bgmVolume}">
              </label>
              <label class="option-item" data-menu-item="true" data-option="sfx" tabindex="0">
                <span>SE音量 <strong data-option-value="sfx"></strong></span>
                <input id="sfx" type="range" min="0" max="1" step="0.05" value="${settings.sfxVolume}">
              </label>
              <label class="option-item option-check-label" data-menu-item="true" data-option="muted" tabindex="0">
                <input id="muted" type="checkbox" ${settings.muted ? 'checked' : ''}>
                <span>ミュート <strong data-option-value="muted"></strong></span>
              </label>
              <label class="option-item" data-menu-item="true" data-option="difficulty" tabindex="0">
                <span>難易度 <strong data-option-value="difficulty"></strong></span>
                <select id="difficulty">
                  <option value="fluffy" ${settings.difficulty === 'fluffy' ? 'selected' : ''}>ふんわり</option>
                  <option value="normal" ${settings.difficulty === 'normal' ? 'selected' : ''}>おでかけ</option>
                  <option value="royal" ${settings.difficulty === 'royal' ? 'selected' : ''}>ロイヤル</option>
                </select>
              </label>
            </div>
          </section>


          <section class="option-section">
            <h2 class="option-section-title">HUD表示</h2>
            <p class="option-section-note">ステージ中HUDの背景色と半透明の濃さを調整するの。</p>
            <div class="option-list">
              <label class="option-item option-color-label" data-menu-item="true" data-option="hudPanelColor" tabindex="0">
                <span>HUD背景色 <strong data-option-value="hudPanelColor"></strong></span>
                <input id="hud-panel-color" class="option-color-input" type="color" value="${settings.hudPanelColor}">
              </label>
              <label class="option-item" data-menu-item="true" data-option="hudPanelOpacity" tabindex="0">
                <span>HUD背景の濃さ <strong data-option-value="hudPanelOpacity"></strong></span>
                <input id="hud-panel-opacity" type="range" min="0.35" max="0.92" step="0.01" value="${settings.hudPanelOpacity}">
              </label>
            </div>
          </section>

          <section class="option-section">
            <h2 class="option-section-title">操作設定</h2>
            <p class="option-section-note">キー割り当てとタッチ操作は別画面で調整するの。</p>
            <div class="option-nav-list">
              <button class="secondary-btn option-nav-btn" id="key-config-btn">キーコンフィグ</button>
              <button class="secondary-btn option-nav-btn" id="touch-control-btn">タッチ操作設定</button>
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
}
