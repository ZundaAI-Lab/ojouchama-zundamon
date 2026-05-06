/**
 * 責務: リザルト画面の成績表示DOMを生成する。
 * 更新ルール: 次画面への遷移やリトライ処理は ResultScene に残し、ここでは結果値の表示だけを担当する。
 */
export class ResultView {
  constructor(app) {
    this.app = app;
  }

  render({ result, ending }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'menu-screen';
    wrapper.innerHTML = `
      <div class="menu-card panel">
        <h1 class="menu-title">${ending ? 'エンディング！' : 'ステージクリア！'}</h1>
        <p class="menu-subtitle">${ending ? '夢みる豆の木は光を取り戻したの。' : 'お嬢ちゃまずんだもんの大活躍なの！'}</p>
        <div class="result-grid">
          <div class="result-row"><span>ランク</span><strong>${result.rank}</strong></div>
          <div class="result-row"><span>クリア時間</span><strong>${result.clearTime.toFixed(1)} 秒</strong></div>
          <div class="result-row"><span>豆コイン</span><strong>${result.coins}</strong></div>
          <div class="result-row"><span>入手ティーカップ</span><strong>${result.teacups}</strong></div>
          <div class="result-row"><span>浄化した相手</span><strong>${result.purified}</strong></div>
          <div class="result-row"><span>被ダメージ</span><strong>${result.damageCount}</strong></div>
          <div class="result-row"><span>ベスト時間</span><strong>${result.bestTime.toFixed(1)} 秒</strong></div>
        </div>
        <div class="menu-actions">
          <button class="primary-btn" id="garden-btn">ガーデンへ</button>
          <button class="secondary-btn" id="retry-btn">もういちど</button>
        </div>
      </div>
    `;
    return wrapper;
  }
}
