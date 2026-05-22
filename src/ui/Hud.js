/**
 * 責務: ステージHUDのDOM生成とHP・コイン・時間・スキル表示更新を担当する。
 * 更新ルール: ゲームルールやセーブ更新を持ち込まない。
 * 更新ルール: 上中央は常設HUDを置かず、ステージ名はRuntimeから明示されたタイミングだけ短時間表示する。
 * 更新ルール: スキル表示は左上ステータス下の小型リングゲージへ集約し、進捗はCSS変数で反映する。
 */
import { formatTime } from '../utils/math.js';
import { applyHudPanelStyle } from './hudPanelStyle.js';

const SKILL_ICON_KEYS = Object.freeze({
  magic: 'icon_bean_staff',
  bow: 'icon_lace_gloves',
  tea: 'icon_royal_tea_set',
});

export class Hud {
  constructor(root, assets, settings = {}) {
    this.root = root;
    this.assets = assets;
    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.element.innerHTML = `
      <div class="hud-main panel" aria-label="ステータス">
        <div class="hud-row hud-meter-row">
          <span class="hearts" data-hp aria-label="HP"></span>
          <span class="hud-stat-pair"><img class="hud-icon" data-icon="coin" alt="" /><span data-coins>0</span></span>
          <span class="hud-stat-pair"><img class="hud-icon" data-icon="teacup" alt="" /><span data-teacups>0</span></span>
          <span class="hud-stat-pair hud-time-pair"><span class="hud-time-icon" aria-hidden="true">🕒</span><strong data-time>00:00</strong></span>
        </div>
      </div>
      <div class="hud-skills" aria-label="スキル">
        <div class="skill" data-skill="magic" aria-label="魔法">
          <div class="skill-ring">
            <img class="skill-icon" data-skill-icon="magic" alt="" />
            <span class="skill-name">魔法</span>
          </div>
        </div>
        <div class="skill" data-skill="bow" aria-label="おじぎ">
          <div class="skill-ring">
            <img class="skill-icon" data-skill-icon="bow" alt="" />
            <span class="skill-name">おじぎ</span>
          </div>
        </div>
        <div class="skill" data-skill="tea" aria-label="お茶">
          <div class="skill-ring">
            <img class="skill-icon" data-skill-icon="tea" alt="" />
            <span class="skill-name">お茶</span>
          </div>
        </div>
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
    for (const [skill, key] of Object.entries(SKILL_ICON_KEYS)) {
      const icon = this.element.querySelector(`[data-skill-icon="${skill}"]`);
      if (icon) icon.src = assets.getImage(key)?.src || '';
    }
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
    this.updateSkill('bow', state.bowRate, state.bowReady);
    this.updateSkill('tea', state.teacups > 0 ? state.teaRate : 0, state.teaReady, state.teaBoosting, state.teacups <= 0);
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
      el.style.setProperty('--skill-rate', '0');
      el.style.setProperty('--skill-angle', '0deg');
    }
  }

  updateSkill(name, rate, ready, boosting = false, unavailable = false) {
    const el = this.element.querySelector(`[data-skill="${name}"]`);
    if (!el) return;
    const normalizedRate = Math.max(0, Math.min(1, Number.isFinite(rate) ? rate : 0));
    const displayRate = ready ? 1 : normalizedRate;
    el.style.setProperty('--skill-rate', displayRate.toFixed(3));
    el.style.setProperty('--skill-angle', `${(displayRate * 360).toFixed(1)}deg`);
    el.classList.toggle('ready', ready);
    el.classList.toggle('boosting', boosting);
    el.classList.toggle('unavailable', unavailable && !ready);
  }
}
