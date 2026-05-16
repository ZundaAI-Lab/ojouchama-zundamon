/**
 * 責務: ステージHUDのDOM生成とHP・コイン・時間・スキル表示更新を担当する。
 * 更新ルール: ゲームルールやセーブ更新を持ち込まない。
 * 更新ルール: 上中央は常設HUDを置かず、ステージ名はRuntimeから明示されたタイミングだけ短時間表示する。
 */
import { formatTime } from '../utils/math.js';
import { applyHudPanelStyle } from './hudPanelStyle.js';

export class Hud {
  constructor(root, assets, settings = {}) {
    this.root = root;
    this.assets = assets;
    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.element.innerHTML = `
      <div class="hud-main panel">
        <div class="hud-row hud-title-row"><span class="hud-title">お嬢ちゃまずんだもん</span></div>
        <div class="hud-row hud-stat-row">
          <span class="hud-stat-label">HP</span><span class="hearts" data-hp></span>
        </div>
        <div class="hud-row hud-meter-row">
          <span class="hud-stat-pair"><img class="hud-icon" data-icon="coin" alt="coin" /><span data-coins>0</span></span>
          <span class="hud-stat-pair"><img class="hud-icon" data-icon="teacup" alt="teacup" /><span data-teacups>0</span></span>
          <span class="hud-stat-pair hud-time-pair"><span class="hud-time-icon">🕒</span><span> <strong data-time>00:00</strong></span></span>
        </div>
      </div>
      <div class="hud-skills panel">
        <div class="skill" data-skill="magic"><span class="skill-name">魔法</span><div class="skill-bar"><div class="skill-fill"></div></div><span data-label></span></div>
        <div class="skill" data-skill="bow"><span class="skill-name">おじぎ</span><div class="skill-bar"><div class="skill-fill"></div></div><span data-label></span></div>
        <div class="skill" data-skill="tea"><span class="skill-name">お茶</span><div class="skill-bar"><div class="skill-fill"></div></div><span data-label></span></div>
      </div>
      <div class="hud-balloon panel" data-balloon-hud hidden>
        <span class="hud-balloon-title">風船</span>
        <span class="hud-balloon-icons" data-balloon-icons></span>
      </div>
    `;
    this.stageNamePop = document.createElement('div');
    this.stageNamePop.className = 'stage-name-pop panel';
    this.banner = document.createElement('div');
    this.banner.className = 'stage-banner panel';
    this.root.append(this.element, this.stageNamePop, this.banner);

    this.element.querySelector('[data-icon="coin"]').src = assets.getImage('icon_coin')?.src || '';
    this.element.querySelector('[data-icon="teacup"]').src = assets.getImage('icon_teacup')?.src || '';
    this.applySettings(settings);
  }

  applySettings(settings = {}) {
    applyHudPanelStyle(this.root, settings);
  }

  showStageName(text) {
    if (!text) return;
    this.stageNamePop.textContent = text;
    this.stageNamePop.classList.remove('show');
    clearTimeout(this.stageNameTimer);
    const nextFrame = globalThis.requestAnimationFrame || (callback => globalThis.setTimeout(callback, 0));
    nextFrame(() => this.stageNamePop.classList.add('show'));
    this.stageNameTimer = setTimeout(() => this.stageNamePop.classList.remove('show'), 2600);
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
    this.stageNamePop.classList.toggle('dialogue-mode', active);
    this.banner.classList.toggle('dialogue-mode', active);
  }

  update(state) {
    const hpEl = this.element.querySelector('[data-hp]');
    hpEl.innerHTML = Array.from({ length: state.maxHp }, (_, i) => `<span class="${i >= state.hp ? 'lost' : ''}">❤</span>`).join('');
    this.element.querySelector('[data-coins]').textContent = `${state.coins}`;
    this.element.querySelector('[data-teacups]').textContent = `${state.teacups}`;
    this.element.querySelector('[data-time]').textContent = formatTime(state.time);
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
