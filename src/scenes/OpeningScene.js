/**
 * 責務: オープニング会話の進行、入力、ガーデン遷移、背景描画を担当する。
 * 更新ルール: 会話文の構造変更時はOpeningView/Dialogue系との境界を保つ。
 */
import { BaseScene } from './BaseScene.js';
import { SCENES } from '../config/sceneIds.js';
import { INPUT_ACTIONS } from '../config/inputActions.js';
import { drawCoverBackground } from '../utils/background.js';

const OPENING_BACKGROUND_SCROLL_SPEED = 4;

const OPENING_LINES = [
  { portrait: 'portrait_smile', speaker: 'お嬢ちゃまずんだもん', text: '今日は優雅なティータイム……のはずだったの。' },
  { portrait: 'portrait_surprise', speaker: 'お嬢ちゃまずんだもん', text: 'まあ！ 夢みる豆の木の光が小さくなっているの！？' },
  { portrait: 'portrait_gentle', speaker: 'お嬢ちゃまずんだもん', text: '風も、お花も、お菓子の香りも……なんだか少しだけ、迷子になっているみたいなの。' },
  { portrait: 'portrait_determined', speaker: 'お嬢ちゃまずんだもん', text: 'お茶会は、ひとりで待っているだけじゃ始まらないの。みんなの声を聞きに行くの！' },
];

function drawFlippedImage(ctx, img, x, y, w, h) {
  if (!img) return;
  ctx.save();
  ctx.translate(x + w / 2, 0);
  ctx.scale(-1, 1);
  ctx.translate(-(x + w / 2), 0);
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

export class OpeningScene extends BaseScene {
  async enter() {
    this.app.audio.playBgm('title-theme');
    this.index = 0;
    this.elapsed = 0;
    this.transitionTimer = 0;
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'menu-screen';
    this.wrapper.innerHTML = `
      <div class="menu-card panel opening-card">
        <div class="opening-label">OPENING</div>
        <h2 class="menu-title opening-title">夢みる豆の木の異変</h2>
        <div class="opening-text panel" id="opening-text"></div>
        <div class="opening-progress" id="opening-progress"></div>
        <div class="menu-actions">
          <button class="secondary-btn" id="next-btn">つぎへ</button>
          <button class="primary-btn" id="skip-btn">ガーデンへ</button>
        </div>
      </div>
    `;
    this.app.uiRoot.append(this.wrapper);
    this.textEl = this.wrapper.querySelector('#opening-text');
    this.progressEl = this.wrapper.querySelector('#opening-progress');
    this.nextBtn = this.wrapper.querySelector('#next-btn');
    this.nextBtn.addEventListener('click', () => this.advance());
    this.wrapper.querySelector('#skip-btn').addEventListener('click', () => this.finish());
    this.refreshText();
  }

  refreshText() {
    const line = OPENING_LINES[this.index];
    this.textEl.innerHTML = `<strong>${line.speaker}</strong><br>${line.text}`;
    this.progressEl.textContent = `${this.index + 1} / ${OPENING_LINES.length}`;
    this.nextBtn.textContent = this.index === OPENING_LINES.length - 1 ? '出発する' : 'つぎへ';
  }

  advance() {
    if (this.index < OPENING_LINES.length - 1) {
      this.index += 1;
      this.refreshText();
      this.app.audio.playSfx('dialog_next');
      return;
    }
    this.finish();
  }

  finish() {
    if (this.transitionTimer > 0) return;
    this.transitionTimer = 1.55;
    this.textEl.innerHTML = '<strong>お嬢ちゃまずんだもん</strong><br>それでは、夢みる豆の王国へ出発なの！';
  }

  update(dt) {
    this.elapsed += dt;
    // 会話送りはUI入力だけで判定する。↑などの方向入力やジャンプ入力では進めない。
    if (this.app.input.wasPressed(INPUT_ACTIONS.UI_CONFIRM)) this.advance();
    if (this.app.input.wasPressed(INPUT_ACTIONS.UI_CANCEL)) this.finish();
    if (this.transitionTimer > 0) {
      this.transitionTimer -= dt;
      if (this.transitionTimer <= 0) this.app.sceneManager.change(SCENES.GARDEN);
    }
  }

  render(ctx) {
    const bg = this.app.assets.getImage('bg_kingdom_opening');
    if (bg) {
      drawCoverBackground(ctx, bg, { scrollX: this.elapsed * OPENING_BACKGROUND_SCROLL_SPEED });
    }
    ctx.fillStyle = 'rgba(255,255,255,0.24)';
    ctx.fillRect(0, 0, 480, 270);

    drawFlippedImage(ctx, this.app.assets.getImage('hero_magic'), 350, 70 + Math.cos(this.elapsed * 2.1) * 3, 82, 110);
  }
}
