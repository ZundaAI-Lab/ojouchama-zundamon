/**
 * 責務: ガーデン画面のステージ選択DOMを生成する。
 * 更新ルール: ステージ解放判定や遷移処理は GardenScene に残し、ここではDOM作成だけを担当する。
 * 更新ルール: ステージカードの夢のしずく表示はSave由来の集計結果だけを受け取り、獲得判定は持たない。
 */
function renderDreamDropIcons(app, dreamDrops = {}) {
  const count = Math.max(0, Math.floor(dreamDrops.acquired || 0));
  if (count <= 0) return '';
  const src = app.assets.getImage('icon_dream_drop')?.src || '';
  const max = Math.max(count, Math.floor(dreamDrops.max || count));
  const icons = Array.from({ length: count }, () => `<img src="${src}" alt="">`).join('');
  return `<div class="stage-dream-drops" aria-label="夢のしずく ${count}/${max}">${icons}</div>`;
}

export class GardenView {
  constructor(app) {
    this.app = app;
  }

  renderShell({ save, completed }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'garden-screen';
    wrapper.innerHTML = `
      <div class="garden-card stage-card panel">
        <div class="garden-header">
          <div>
            <h1 class="menu-title">お嬢ちゃまガーデン</h1>
            <p class="menu-subtitle">${completed ? '王国は光を取り戻したの！' : '夢みる豆の木に元気を取り戻すの。'}</p>
          </div>
          <div class="garden-coin"><img src="${this.app.assets.getImage('icon_coin')?.src || ''}" alt=""> ${save.totalCoins}</div>
        </div>
        <section class="garden-section stage-section">
          <div class="section-title-row">
            <h2>ステージ選択</h2>
            <span>↑↓←→で選択 / Enter・Space・Zで決定</span>
          </div>
          <div class="stage-list" id="stage-list"></div>
        </section>
        <div class="menu-actions garden-actions">
          <button class="primary-btn" id="shop-btn">おかいもの</button>
          <button class="secondary-btn" id="garden-player-tutorial-btn">操作説明</button>
          <button class="secondary-btn" id="option-btn">オプション</button>
          <button class="secondary-btn" id="title-btn">タイトルへ</button>
        </div>
      </div>
    `;
    return wrapper;
  }

  createStageButton({ world, index, unlocked, record, dreamDrops }) {
    const row = document.createElement('button');
    row.className = `stage-select ${unlocked ? '' : 'locked'}`;
    row.disabled = !unlocked;
    row.dataset.stageIndex = String(index);
    row.innerHTML = `
      <img src="${this.app.assets.getImage(world.npc)?.src || ''}" alt="">
      <div class="stage-select-body">
        <div class="stage-select-main">
          <strong>${world.title}</strong>
          <em>${record?.cleared ? `クリア / 最高 ${record.bestRank || 'C'} / ${Math.floor(record.bestTime)}秒` : unlocked ? '未クリア' : '前ステージクリアで解放'}</em>
        </div>
        <div class="stage-desc-row">
          <span>${world.desc}</span>
          ${renderDreamDropIcons(this.app, dreamDrops)}
        </div>
      </div>
    `;
    return row;
  }
}
