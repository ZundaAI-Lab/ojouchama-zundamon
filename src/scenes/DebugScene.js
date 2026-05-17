/**
 * 責務: デバッグ画面の設定変更と検証用ステージ遷移を制御する。
 * 更新ルール: デバッグ用の実ゲーム設定はDebugSettingsへ集約し、このSceneではUI接続だけを担当する。
 * 更新ルール: 自動テストの内容はsrc/debug/tests配下へ置き、このSceneでは実行ボタンと結果表示の接続だけを担当する。
 * 更新ルール: 進行フラグの表示定義とUI接続はここで扱い、保存形式の正規化はSaveSystemへ委譲する。
 * 更新ルール: 詳細負荷レポートの取得ON/OFFはGameAppの遅延読込APIへ委譲し、レポート保存はメモリ保持だけにする。
 * 更新ルール: 指定ステージ直行の候補はSTAGE_ROUTESを正本にし、デバッグ画面側にステージID固定配列を持たない。
 */
import { BaseScene } from './BaseScene.js';
import { SCENES } from '../config/sceneIds.js';
import { MenuNavigator } from '../ui/MenuNavigator.js';
import { DebugView } from '../ui/views/DebugView.js';
import { WORLDS } from '../data/worlds.js';
import { STAGE_ROUTES } from '../data/stages.js';
import { drawCoverBackground } from '../utils/background.js';

const DEBUG_PROGRESS_FLAG_HANDLERS = Object.freeze({
  nanoJoined: {
    label: 'なのちゃん加入',
    isChecked: save => !!save.storyFlags?.nanoJoined,
    apply: (app, checked) => app.save.setStoryFlag('nanoJoined', checked),
  },
  nanoMagicRibbon: {
    label: 'まほうのリボン入手',
    isChecked: save => (save.upgrades?.nanoMagicRibbon || 0) > 0,
    apply: (app, checked) => app.save.setUpgradeLevel('nanoMagicRibbon', checked ? 1 : 0),
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

function createDebugStageGroups() {
  return STAGE_ROUTES.map((route, worldIndex) => {
    const world = WORLDS.find(item => item.id === route.id || item.routeId === route.id);
    return {
      id: route.id,
      title: world?.title || route.id,
      stages: route.stages.map((stage, stageIndex) => ({
        stageId: stage.id,
        label: `${worldIndex + 1}-${stageIndex + 1}${stage.boss ? ' ボス' : ''}`,
        name: stage.name || stage.route?.areaName || stage.id,
      })),
    };
  });
}

const DEBUG_STAGE_GROUPS = Object.freeze(createDebugStageGroups().map(group => Object.freeze({
  ...group,
  stages: Object.freeze(group.stages.map(stage => Object.freeze(stage))),
})));

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
      stageGroups: DEBUG_STAGE_GROUPS,
      progressFlags: createProgressFlagRows(this.app.save.load()),
    });
    this.app.uiRoot.append(wrapper);

    wrapper.querySelectorAll('[data-debug-setting]').forEach(input => {
      input.addEventListener('change', async () => {
        this.app.debug.set(input.dataset.debugSetting, input.checked);
        if (input.dataset.debugSetting === 'capturePerformanceReport') {
          await this.app.syncPerformanceReportCapture();
          this.view.showPerformanceReport(wrapper, this.app.getLatestPerformanceReport?.());
        }
        this.app.audio.playSfx('ui_decide');
      });
    });

    this.view.showPerformanceReport(wrapper, this.app.getLatestPerformanceReport?.());

    wrapper.querySelector('#debug-refresh-report-btn')?.addEventListener('click', () => {
      this.app.audio.playSfx('ui_decide');
      this.view.showPerformanceReport(wrapper, this.app.getLatestPerformanceReport?.());
    });

    wrapper.querySelector('#debug-copy-report-btn')?.addEventListener('click', async () => {
      const report = this.app.getLatestPerformanceReport?.();
      if (!report?.jsonText) {
        this.view.showPerformanceReport(wrapper, null);
        this.app.audio.playSfx('ui_cancel');
        return;
      }
      try {
        if (!navigator.clipboard?.writeText) throw new Error('clipboard API unavailable');
        await navigator.clipboard.writeText(report.jsonText);
        this.view.showPerformanceReportCopied(wrapper, true);
        this.app.audio.playSfx('ui_decide');
      } catch (_) {
        this.view.showPerformanceReportCopied(wrapper, false);
        this.app.audio.playSfx('ui_cancel');
      }
    });

    wrapper.querySelector('#debug-clear-report-btn')?.addEventListener('click', () => {
      this.app.clearPerformanceReports?.();
      this.view.showPerformanceReport(wrapper, null);
      this.app.audio.playSfx('ui_cancel');
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
      button.addEventListener('click', async () => {
        this.app.audio.resume();
        this.app.audio.playSfx('ui_decide');
        await this.app.syncPerformanceReportCapture();
        this.app.sceneManager.change(SCENES.STAGE, {
          stageId: button.dataset.stageId,
          skipIntro: true,
        });
      });
    });

    wrapper.querySelector('#switch-test-btn').addEventListener('click', async () => {
      this.app.audio.resume();
      this.app.audio.playSfx('ui_decide');
      await this.app.syncPerformanceReportCapture();
      this.app.sceneManager.change(SCENES.STAGE, { stageId: 'switch_test_lab', skipIntro: false });
    });

    wrapper.querySelector('#debug-run-tests-btn').addEventListener('click', async () => {
      this.app.audio.resume();
      this.app.audio.playSfx('ui_decide');
      this.view.showTestRunning(wrapper);
      try {
        const { runAllDebugTests } = await import('../debug/tests/runAllDebugTests.js');
        const result = await runAllDebugTests();
        this.view.showTestResult(wrapper, result);
        this.app.audio.playSfx(result.failed > 0 ? 'ui_cancel' : 'ui_decide');
      } catch (error) {
        this.view.showTestResult(wrapper, {
          passed: 0,
          failed: 1,
          durationMs: 0,
          results: [{
            ok: false,
            suite: 'DebugScene',
            name: '自動テスト読込',
            message: error?.message || String(error),
          }],
        });
        this.app.audio.playSfx('ui_cancel');
      }
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
