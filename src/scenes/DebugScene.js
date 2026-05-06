/**
 * 責務: デバッグ画面の設定変更と検証用ステージ遷移を制御する。
 * 更新ルール: デバッグ用の実ゲーム設定はDebugSettingsへ集約し、このSceneではUI接続だけを担当する。
 * 更新ルール: 自動テストの内容はsrc/debug/tests配下へ置き、このSceneでは実行ボタンと結果表示の接続だけを担当する。
 * 更新ルール: 進行フラグの表示定義とUI接続はここで扱い、保存形式の正規化はSaveSystemへ委譲する。
 */
import { BaseScene } from './BaseScene.js';
import { SCENES } from '../config/sceneIds.js';
import { MenuNavigator } from '../ui/MenuNavigator.js';
import { DebugView } from '../ui/views/DebugView.js';
import { runAllDebugTests } from '../debug/tests/runAllDebugTests.js';
import { WORLDS } from '../data/worlds.js';
import { drawCoverBackground } from '../utils/background.js';

const DEBUG_PROGRESS_FLAG_HANDLERS = Object.freeze({
  nanoJoined: {
    label: 'なのちゃん加入',
    isChecked: save => !!save.storyFlags?.nanoJoined,
    apply: (app, checked) => app.save.setStoryFlag('nanoJoined', checked),
  },
  nanoMagicBud: {
    label: 'まほうの芽入手',
    isChecked: save => (save.upgrades?.nanoMagicBud || 0) > 0,
    apply: (app, checked) => app.save.setUpgradeLevel('nanoMagicBud', checked ? 1 : 0),
  },
  stagesCleared: {
    label: 'ステージクリア',
    isChecked: save => WORLDS.every(world => save.clearedStages?.includes(world.routeId)),
    apply: (app, checked) => app.save.setStageClearFlags(
      WORLDS.map((world, index) => ({
        id: world.routeId,
        worldIndex: index + 1,
        ending: index === WORLDS.length - 1,
      })),
      checked,
    ),
  },
});

function createProgressFlagRows(save) {
  return Object.entries(DEBUG_PROGRESS_FLAG_HANDLERS).map(([key, flag]) => ({
    key,
    label: flag.label,
    checked: flag.isChecked(save),
  }));
}

const DEBUG_BOSS_STAGES = Object.freeze([
  { label: '1面 ボス', stageId: 'candy_forest_boss' },
  { label: '2面 ボス', stageId: 'teacup_castle_boss' },
  { label: '3面 ボス', stageId: 'ribbon_garden_boss' },
  { label: '4面 ボス', stageId: 'plush_cloud_boss' },
  { label: '5面 ボス', stageId: 'picturebook_library_boss' },
  { label: '6面 ボス', stageId: 'dream_tree_boss' },
]);

export class DebugScene extends BaseScene {
  async enter() {
    this.app.audio.playBgm('stage-select');
    if (!this.app.debug?.isEnabled()) {
      this.app.sceneManager.change(SCENES.TITLE);
      return;
    }
    this.view = new DebugView();
    const wrapper = this.view.render({
      settings: this.app.debug.snapshot(),
      bossStages: DEBUG_BOSS_STAGES,
      progressFlags: createProgressFlagRows(this.app.save.load()),
    });
    this.app.uiRoot.append(wrapper);

    wrapper.querySelectorAll('[data-debug-setting]').forEach(input => {
      input.addEventListener('change', () => {
        this.app.debug.set(input.dataset.debugSetting, input.checked);
        this.app.audio.playSfx('ui_decide');
      });
    });

    wrapper.querySelectorAll('[data-debug-progress-flag]').forEach(input => {
      input.addEventListener('change', () => {
        const handler = DEBUG_PROGRESS_FLAG_HANDLERS[input.dataset.debugProgressFlag];
        if (!handler) return;
        handler.apply(this.app, input.checked);
        this.view.showProgressFlagSaved(wrapper, handler.label, input.checked);
        this.app.audio.playSfx('ui_decide');
      });
    });

    wrapper.querySelectorAll('[data-stage-id]').forEach(button => {
      button.addEventListener('click', () => {
        this.app.audio.resume();
        this.app.audio.playSfx('ui_decide');
        this.app.sceneManager.change(SCENES.STAGE, {
          stageId: button.dataset.stageId,
          skipIntro: true,
        });
      });
    });

    wrapper.querySelector('#switch-test-btn').addEventListener('click', () => {
      this.app.audio.resume();
      this.app.audio.playSfx('ui_decide');
      this.app.sceneManager.change(SCENES.STAGE, { stageId: 'switch_test_lab', skipIntro: false });
    });

    wrapper.querySelector('#debug-run-tests-btn').addEventListener('click', async () => {
      this.app.audio.resume();
      this.app.audio.playSfx('ui_decide');
      this.view.showTestRunning(wrapper);
      const result = await runAllDebugTests();
      this.view.showTestResult(wrapper, result);
      this.app.audio.playSfx(result.failed > 0 ? 'ui_cancel' : 'ui_decide');
    });

    wrapper.querySelector('#debug-title-btn').addEventListener('click', () => {
      this.app.audio.playSfx('ui_cancel');
      this.app.sceneManager.change(SCENES.TITLE);
    });

    this.menu = new MenuNavigator({
      app: this.app,
      root: wrapper,
      selector: 'button, input[type="checkbox"]',
      onCancel: () => this.app.sceneManager.change(SCENES.TITLE),
    });
  }

  exit() {
    this.menu?.destroy();
  }

  update() {
    this.menu?.update();
  }

  render(ctx) {
    const bg = this.app.assets.getImage('bg_kingdom_opening') || this.app.assets.getImage('bg_candy_forest');
    if (bg) drawCoverBackground(ctx, bg);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(0, 0, 480, 270);
  }
}
