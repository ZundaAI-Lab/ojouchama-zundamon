/**
 * 責務: ガーデン画面のステージ解放判定・選択操作・各画面への遷移を制御する。
 * 更新ルール: DOM生成は GardenView に任せ、ここでは進行状態の判定とイベント接続を担当する。ステージクリア後のショップ解放通知はこの画面で一度だけ表示する。
 */
import { BaseScene } from './BaseScene.js';
import { SCENES } from '../config/sceneIds.js';
import { WORLDS } from '../data/worlds.js';
import { STAGE_ROUTES } from '../data/stages.js';
import { MenuNavigator } from '../ui/MenuNavigator.js';
import { TutorialDialogController } from '../ui/dialogs/TutorialDialogController.js';
import { GardenView } from '../ui/views/GardenView.js';
import { drawCoverBackground } from '../utils/background.js';

const GARDEN_WALK_FRAMES = ['hero_walk_1', 'hero_walk_2', 'hero_walk_3', 'hero_walk_4', 'hero_walk_3', 'hero_walk_2'];
const ROUTE_STAGE_IDS_BY_ROUTE = Object.freeze(Object.fromEntries(STAGE_ROUTES.map(route => [route.id, route.stageIds])));

function getDreamDropStatus(save, routeId) {
  const stageIds = ROUTE_STAGE_IDS_BY_ROUTE[routeId] || [];
  const acquired = stageIds.filter(stageId => !!save.dreamDrops?.[stageId]).length;
  return { acquired, max: stageIds.length };
}

function drawSprite(ctx, img, x, y, w, h, flipX = false) {
  if (!img) return;
  ctx.save();
  if (flipX) {
    ctx.translate(x + w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(x + w / 2), 0);
  }
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

export class GardenScene extends BaseScene {
  async enter() {
    this.app.audio.playBgm('stage-select');
    this.elapsed = 0;
    this.heroX = 42;
    this.heroTargetX = 42;
    this.heroFacing = 1;
    this.heroMoving = false;
    this.renderUi();
  }

  renderUi() {
    const save = this.app.save.load();
    const completed = save.clearedStages.length >= WORLDS.length;
    this.view = new GardenView(this.app);
    const wrapper = this.view.renderShell({ save, completed });
    this.app.uiRoot.append(wrapper);
    const stageList = wrapper.querySelector('#stage-list');

    WORLDS.forEach((world, index) => {
      const unlocked = index === 0 || save.clearedStages.includes(WORLDS[index - 1].routeId);
      const record = save.stages[world.routeId];
      const dreamDrops = getDreamDropStatus(save, world.routeId);
      const row = this.view.createStageButton({ world, index, unlocked, record, dreamDrops });
      row.addEventListener('click', () => {
        this.app.audio.resume();
        this.app.audio.playSfx('ui_decide');
        const bossDirectMode = !!this.app.debug?.get('bossDirectMode');
        const stageId = bossDirectMode ? `${world.routeId}_boss` : world.startStageId;
        this.app.sceneManager.change(SCENES.STAGE, { stageId, skipIntro: bossDirectMode });
      });
      stageList.append(row);
    });

    wrapper.querySelector('#shop-btn').addEventListener('click', () => this.app.sceneManager.change(SCENES.SHOP));
    wrapper.querySelector('#garden-player-tutorial-btn').addEventListener('click', () => this.openTutorial('player'));
    wrapper.querySelector('#title-btn').addEventListener('click', () => this.app.sceneManager.change(SCENES.TITLE));
    wrapper.querySelector('#option-btn').addEventListener('click', () => this.app.sceneManager.change(SCENES.OPTION, { returnSceneId: SCENES.GARDEN }));

    this.menu = new MenuNavigator({
      app: this.app,
      root: wrapper,
      onMove: item => {
        if (!item?.classList.contains('stage-select')) return;
        const index = Number(item.dataset.stageIndex || 0);
        this.heroTargetX = Math.max(14, Math.min(116, 20 + index * 22));
      },
      onCancel: () => this.app.sceneManager.change(SCENES.TITLE),
    });

    this.tryShowNanoShopNotice(wrapper, save);
  }


  openTutorial(topic) {
    if (this.tutorialDialog) return;
    this.app.audio.playSfx('ui_decide');
    this.app.input.clearGameplay();
    this.tutorialDialog = new TutorialDialogController({
      app: this.app,
      initialTopic: topic,
      onClose: () => {
        this.tutorialDialog = null;
        this.app.input.clearGameplay();
      },
    });
    this.tutorialDialog.open();
  }

  tryShowNanoShopNotice(wrapper, save) {
    if (!this.params.fromStageClear) return;
    if (!save.storyFlags?.nanoJoined || save.storyFlags?.nanoShopNoticeShown) return;

    const notice = document.createElement('div');
    notice.className = 'garden-notice panel';
    notice.innerHTML = `
      <div class="garden-notice-title">お店に新商品が並んだの！</div>
      <div class="garden-notice-body">なのちゃんのための小さな贈り物が買えるようになったの</div>
    `;
    wrapper.append(notice);
    requestAnimationFrame(() => notice.classList.add('show'));
    this.app.audio.playSfx('nano_join_jingle');
    this.app.save.setStoryFlag('nanoShopNoticeShown', true);
    window.setTimeout(() => notice.classList.remove('show'), 4600);
  }

  exit() {
    this.tutorialDialog?.destroy?.();
    this.tutorialDialog = null;
    this.menu?.destroy();
  }

  update(dt) {
    this.elapsed += dt;
    if (this.tutorialDialog) this.tutorialDialog.update();
    else this.menu?.update();
    const diff = this.heroTargetX - this.heroX;
    this.heroMoving = Math.abs(diff) > 0.5;
    if (this.heroMoving) {
      this.heroFacing = Math.sign(diff);
      this.heroX += Math.sign(diff) * Math.min(Math.abs(diff), 64 * dt);
    }
  }

  render(ctx) {
    const bg = this.app.assets.getImage('bg_kingdom_opening') || this.app.assets.getImage('bg_candy_forest');
    if (bg) {
      drawCoverBackground(ctx, bg);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.34)';
    ctx.fillRect(0, 0, 480, 270);
    const walkKey = GARDEN_WALK_FRAMES[Math.floor(this.elapsed * 8.5) % GARDEN_WALK_FRAMES.length];
    const img = this.app.assets.getImage(this.heroMoving ? walkKey : 'hero_idle') || this.app.assets.getImage(this.heroMoving ? 'hero_walk' : 'hero_idle') || this.app.assets.getImage('hero_idle');
    const bob = this.heroMoving ? Math.abs(Math.sin(this.elapsed * 8.5 * Math.PI)) * -2.0 : Math.sin(this.elapsed * 1.8) * 1.2;
    ctx.save();
    ctx.globalAlpha = 0.58;
    drawSprite(ctx, img, this.heroX, 150 + bob, 76, 102, this.heroFacing < 0);
    ctx.restore();
  }
}
