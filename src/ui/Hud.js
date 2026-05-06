/**
 * 責務: ステージHUDのDOM生成とHP・コイン・時間・スキル表示更新を担当する。
 * 更新ルール: ゲームルールやセーブ更新を持ち込まない。
 */
import { formatTime } from '../utils/math.js';

export class Hud {
  constructor(root, assets) {
    this.root = root;
    this.assets = assets;
    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.element.innerHTML = `
      <div class="hud-main panel">
        <div class="hud-row hud-title-row"><span class="hud-title">お嬢ちゃまずんだもん</span><span class="hud-stage-name" data-stage-name></span></div>
        <div class="hud-row"><span>HP</span><span class="hearts" data-hp></span></div>
        <div class="hud-row">
          <img class="hud-icon" data-icon="coin" alt="coin" />
          <span data-coins>0</span>
          <img class="hud-icon" data-icon="teacup" alt="teacup" />
          <span data-teacups>0</span>
          <span>時間 <strong data-time>00:00</strong></span>
        </div>
      </div>
      <div class="hud-skills panel">
        <div class="skill" data-skill="magic"><span>魔法</span><div class="skill-bar"><div class="skill-fill"></div></div><span data-label></span></div>
        <div class="skill" data-skill="bow"><span>おじぎ</span><div class="skill-bar"><div class="skill-fill"></div></div><span data-label></span></div>
        <div class="skill" data-skill="tea"><span>お茶</span><div class="skill-bar"><div class="skill-fill"></div></div><span data-label></span></div>
      </div>
      <div class="hud-balloon panel" data-balloon-hud hidden>
        <span class="hud-balloon-title">風船</span>
        <span class="hud-balloon-icons" data-balloon-icons></span>
      </div>
    `;
    this.banner = document.createElement('div');
    this.banner.className = 'stage-banner panel';
    this.root.append(this.element, this.banner);

    this.element.querySelector('[data-icon="coin"]').src = assets.getImage('icon_coin')?.src || '';
    this.element.querySelector('[data-icon="teacup"]').src = assets.getImage('icon_teacup')?.src || '';
  }

  showBanner(text) {
    this.banner.textContent = text;
    this.banner.classList.add('show');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => this.banner.classList.remove('show'), 2400);
  }

  setDialogueMode(active) {
    this.root.classList.toggle('dialogue-mode', active);
    this.element.classList.toggle('dialogue-mode', active);
    this.banner.classList.toggle('dialogue-mode', active);
  }

  update(state) {
    const hpEl = this.element.querySelector('[data-hp]');
    hpEl.innerHTML = Array.from({ length: state.maxHp }, (_, i) => `<span class="${i >= state.hp ? 'lost' : ''}">❤</span>`).join('');
    this.element.querySelector('[data-coins]').textContent = `${state.coins}`;
    this.element.querySelector('[data-teacups]').textContent = `${state.teacups}`;
    this.element.querySelector('[data-time]').textContent = formatTime(state.time);
    this.element.querySelector('[data-stage-name]').textContent = state.stageName || '';
    this.updateSkill('magic', state.magicRate, state.magicReady);
    this.updateSkill('bow', state.bowRate, state.bowReady, false, state.bowReady ? null : 'NG');
    this.updateSkill('tea', state.teacups > 0 ? state.teaRate : 0, state.teaReady, state.teaBoosting, state.teaReady ? null : 'NG');
    this.updateBalloonRide(state.balloonRide);
  }

  updateBalloonRide(balloonRide) {
    const hud = this.element.querySelector('[data-balloon-hud]');
    const icons = this.element.querySelector('[data-balloon-icons]');
    const active = !!balloonRide?.active;
    hud.hidden = !active;
    hud.classList.toggle('hit-flash', !!balloonRide?.hitFlash);

    const balloonKeys = {
      orange: 'balloon_hud_orange',
      blue: 'balloon_hud_blue',
      yellow: 'balloon_hud_yellow',
      pink: 'balloon_hud_pink',
    };
    icons.innerHTML = active
      ? (balloonRide.balloons || []).map(color => {
        const img = this.assets.getImage(balloonKeys[color]);
        return img ? `<img class="hud-balloon-icon" src="${img.src}" alt="${color}" />` : `<span class="hud-balloon-dot ${color}"></span>`;
      }).join('')
      : '';

    this.setSkillLocked('bow', active);
    this.setSkillLocked('tea', active);
  }

  setSkillLocked(name, locked) {
    const el = this.element.querySelector(`[data-skill="${name}"]`);
    if (!el) return;
    el.classList.toggle('locked', locked);
    if (locked) {
      el.querySelector('.skill-fill').style.width = '0%';
      el.querySelector('[data-label]').textContent = 'NG';
    }
  }

  updateSkill(name, rate, ready, boosting = false, labelOverride = null) {
    const el = this.element.querySelector(`[data-skill="${name}"]`);
    const fill = el.querySelector('.skill-fill');
    const label = el.querySelector('[data-label]');
    fill.style.width = `${Math.max(0, Math.min(100, rate * 100))}%`;
    el.classList.toggle('ready', ready);
    label.textContent = boosting ? '強化中' : (labelOverride || (ready ? 'OK' : `${Math.round(rate * 100)}%`));
  }
}
