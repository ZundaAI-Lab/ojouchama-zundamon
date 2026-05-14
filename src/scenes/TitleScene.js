/**
 * 責務: タイトル画面の入力・セーブ分岐・画面遷移を制御する。
 * 更新ルール: DOM構造は TitleView に置き、ここではイベント接続とシーン遷移だけを担当する。タイトルのなのちゃん表示はstoryFlags.nanoJoinedを基準にし、サイズ調整はキャンバス演出内に閉じ込める。
 * 更新ルール: 次画面候補の画像先読みはassetLoadPlansの算出結果だけを使い、このSceneへ個別ロード処理を持ち込まない。
 */
import { BaseScene } from './BaseScene.js';
import { SCENES } from '../config/sceneIds.js';
import { MenuNavigator } from '../ui/MenuNavigator.js';
import { TitleView } from '../ui/views/TitleView.js';
import { WORLDS } from '../data/worlds.js';
import { getSceneAssetKeys } from '../data/assetLoadPlans.js';
import { drawCoverBackground } from '../utils/background.js';

const TITLE_NANO_DRAW_W = 66;
const TITLE_NANO_DRAW_H = 74;

function drawFlippedImage(ctx, img, x, y, w, h) {
  if (!img) return;
  ctx.save();
  ctx.translate(x + w / 2, 0);
  ctx.scale(-1, 1);
  ctx.translate(-(x + w / 2), 0);
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

export class TitleScene extends BaseScene {
  async enter() {
    this.app.audio.playBgm('title-theme');
    const save = this.app.save.load();
    this.titleSave = save;
    const hasSaveData = this.app.save.hasData();
    const hasProgress = this.app.save.hasProgress();
    this.view = new TitleView(this.app);
    const wrapper = this.view.render({
      save,
      hasProgress,
      hasSaveData,
      totalWorlds: WORLDS.length,
      showDebug: this.app.debug?.isEnabled(),
    });
    this.app.uiRoot.append(wrapper);

    wrapper.querySelector('#start-btn').addEventListener('click', async () => {
      this.app.audio.resume();
      if (hasProgress) {
        const ok = await this.app.confirmDialog.confirm({
          title: '最初から始めますか？',
          message: [
            '現在のセーブデータがあります。',
            '最初から始めると、セーブデータと設定が削除されます。',
          ],
          confirmLabel: 'はじめから',
          cancelLabel: '戻る',
          danger: true,
        });
        if (!ok) return;
      }
      this.app.save.reset();
      this.app.sceneManager.change(SCENES.OPENING);
    });
    wrapper.querySelector('#continue-btn').addEventListener('click', () => {
      if (!hasProgress) return;
      this.app.audio.resume();
      this.app.sceneManager.change(SCENES.GARDEN);
    });
    wrapper.querySelector('#option-btn').addEventListener('click', () => {
      this.app.audio.resume();
      this.app.audio.playSfx('ui_decide');
      this.app.sceneManager.change(SCENES.OPTION, { returnSceneId: SCENES.TITLE });
    });
    wrapper.querySelector('#debug-btn')?.addEventListener('click', () => {
      this.app.audio.resume();
      this.app.audio.playSfx('ui_decide');
      this.app.sceneManager.change(SCENES.DEBUG);
    });
    wrapper.querySelector('#reset-btn').addEventListener('click', async () => {
      if (!hasSaveData) return;
      const ok = await this.app.confirmDialog.confirm({
        title: 'セーブデータを初期化しますか？',
        message: '消したデータは元に戻せません。',
        confirmLabel: '初期化する',
        cancelLabel: '戻る',
        danger: true,
      });
      if (!ok) return;
      this.app.save.reset();
      location.reload();
    });
    this.menu = new MenuNavigator({ app: this.app, root: wrapper });
    this.app.assets.preloadKeys([
      ...getSceneAssetKeys(SCENES.OPENING),
      ...getSceneAssetKeys(SCENES.GARDEN),
    ]);
  }

  exit() {
    this.menu?.destroy();
  }

  update() {
    this.menu?.update();
  }

  render(ctx) {
    const bg = this.app.assets.getImage('bg_kingdom_opening') || this.app.assets.getImage('bg_candy_forest');
    if (bg) {
      drawCoverBackground(ctx, bg);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(0, 0, 480, 270);

    const idle = this.app.assets.getImage('hero_victory') || this.app.assets.getImage('hero_idle');
    drawFlippedImage(ctx, idle, 350, 52, 112, 162);

    if (this.titleSave?.storyFlags?.nanoJoined) {
      const nano = this.app.assets.getImage('npc_teacup_fairy_float') || this.app.assets.getImage('npc_teacup_fairy');
      if (nano) {
        const bob = Math.sin(performance.now() * 0.003) * 4;
        ctx.save();
        ctx.shadowColor = 'rgba(74, 132, 79, 0.24)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;
        ctx.drawImage(nano, 62, 128 + bob, TITLE_NANO_DRAW_W, TITLE_NANO_DRAW_H);
        ctx.restore();
      }
    }

  }
}
