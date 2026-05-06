/**
 * 責務: リザルト画面のBGM選択・ボタン入力・次画面遷移を制御する。
 * 更新ルール: 成績表示DOMは ResultView に任せ、ここでは遷移イベントと背景描画を担当する。
 */
import { BaseScene } from './BaseScene.js';
import { SCENES } from '../config/sceneIds.js';
import { MenuNavigator } from '../ui/MenuNavigator.js';
import { ResultView } from '../ui/views/ResultView.js';
import { drawCoverBackground } from '../utils/background.js';

export class ResultScene extends BaseScene {
  async enter() {
    this.app.audio.playBgm(this.params.ending ? 'title-theme' : 'stage-select');
    this.view = new ResultView(this.app);
    const wrapper = this.view.render({ result: this.params.result, ending: this.params.ending });
    this.app.uiRoot.append(wrapper);
    wrapper.querySelector('#garden-btn').addEventListener('click', () => this.app.sceneManager.change(SCENES.GARDEN, { fromStageClear: true }));
    wrapper.querySelector('#retry-btn').addEventListener('click', () => this.app.sceneManager.change(SCENES.STAGE, { stageId: this.params.stageId }));
    this.menu = new MenuNavigator({
      app: this.app,
      root: wrapper,
      onCancel: () => this.app.sceneManager.change(SCENES.GARDEN, { fromStageClear: true }),
    });
  }

  exit() {
    this.menu?.destroy();
  }

  update() {
    this.menu?.update();
  }

  render(ctx) {
    const bg = this.app.assets.getImage(this.params.ending ? 'bg_kingdom_opening' : 'bg_dream_tree') || this.app.assets.getImage('bg_candy_world2');
    if (bg) {
      drawCoverBackground(ctx, bg);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(0, 0, 480, 270);
    const img = this.app.assets.getImage('hero_victory');
    if (img) ctx.drawImage(img, 28, 72, 104, 136);
  }
}
