/**
 * 責務: ショップ画面のDOMと強化・消耗品項目行を生成する。
 * 更新ルール: 購入可否の結果反映やセーブ更新は ShopScene/SaveSystem に任せ、ここでは表示だけを組み立てる。
 */
export class ShopView {
  constructor(app) {
    this.app = app;
  }

  renderShell(save) {
    const wrapper = document.createElement('div');
    wrapper.className = 'garden-screen';
    wrapper.innerHTML = `
      <div class="garden-card shop-card panel">
        <div class="garden-header">
          <div>
            <h1 class="menu-title">おかいもの</h1>
            <p class="menu-subtitle">集めた豆コインで、冒険の準備を整えるの。</p>
          </div>
          <div class="garden-wallet">
            <div class="garden-coin"><img src="${this.app.assets.getImage('icon_coin')?.src || ''}" alt=""> ${save.totalCoins}</div>
            <div class="garden-coin"><img src="${this.app.assets.getImage('icon_teacup')?.src || ''}" alt=""> ${save.teacups}</div>
          </div>
        </div>
        <section class="garden-section shop-section">
          <div class="section-title-row">
            <h2>おかいもの一覧</h2>
            <span>↑↓←→で選択 / Enter・Space・Zで購入</span>
          </div>
          <div class="upgrade-list" id="upgrade-list"></div>
        </section>
        <div class="menu-actions garden-actions">
          <button class="secondary-btn" id="back-btn">ガーデンへ戻る</button>
        </div>
      </div>
    `;
    return wrapper;
  }


  createShopItemButton({ key, def, save }) {
    const owned = key === 'teacup' ? save.teacups : 0;
    const maxed = owned >= def.max;
    const row = document.createElement('button');
    row.className = 'upgrade-select';
    row.disabled = maxed || save.totalCoins < def.cost;
    row.dataset.shopItemKey = key;
    row.innerHTML = `
      <div class="upgrade-select-body">
        <div class="stage-select-main">
          <strong>${def.label} ${owned}/${def.max}</strong>
          <em>${maxed ? 'これ以上持てません' : `必要豆コイン: ${def.cost}`}</em>
        </div>
        <span>${def.desc}</span>
      </div>
    `;
    return row;
  }

  createUpgradeButton({ key, def, level, maxed, cost, save }) {
    const row = document.createElement('button');
    row.className = 'upgrade-select';
    row.disabled = maxed || save.totalCoins < cost;
    row.dataset.upgradeKey = key;
    row.innerHTML = `
      <div class="upgrade-select-body">
        <div class="stage-select-main">
          <strong>${def.label} Lv.${level}/${def.max}</strong>
          <em>${maxed ? '最大強化済み' : `必要豆コイン: ${cost}`}</em>
        </div>
        <span>${def.desc}</span>
      </div>
    `;
    return row;
  }
}
