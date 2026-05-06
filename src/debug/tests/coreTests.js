/**
 * 責務: ゲーム基盤に近い純粋処理の自動テスト定義を担当する。
 * 更新ルール: DOMやScene遷移を必要とする検証は持ち込まず、軽量に実行できる対象だけを扱う。
 */
import { createTest } from '../TestRunner.js';
import { PlayerController } from '../../actors/player/PlayerController.js';
import { INPUT_ACTIONS } from '../../config/inputActions.js';
import { normalizeKeyBindings, normalizeTouchConfig } from '../../config/controlSettings.js';
import { TouchControlsView } from '../../ui/views/TouchControlsView.js';
import { SceneManager } from '../../core/SceneManager.js';
import { SCENES } from '../../config/sceneIds.js';

function createInputMock(initialActions = []) {
  const down = new Set(initialActions);
  const pressed = new Set(initialActions);
  return {
    down,
    pressed,
    isDown(action) { return down.has(action); },
    wasPressed(action) { return pressed.has(action); },
  };
}

export const coreTests = [
  createTest('SceneManager', 'Scene IDからregistryでSceneクラスを解決して遷移する', async ({ equal }) => {
    const events = [];
    class FirstScene {
      constructor(app, params) {
        this.app = app;
        this.params = params;
      }
      async enter() { events.push(['enter-first', this.params.label]); }
      exit() { events.push(['exit-first']); }
    }
    class SecondScene {
      constructor(app, params) {
        this.app = app;
        this.params = params;
      }
      async enter() { events.push(['enter-second', this.params.label]); }
    }
    const app = {
      uiRoot: { innerHTML: 'ui' },
      hudRoot: { innerHTML: 'hud' },
    };
    const manager = new SceneManager(app, new Map([
      [SCENES.TITLE, FirstScene],
      [SCENES.GARDEN, SecondScene],
    ]));
    await manager.change(SCENES.TITLE, { label: 'first' });
    await manager.change(SCENES.GARDEN, { label: 'second' });
    equal(manager.currentSceneId, SCENES.GARDEN);
    equal(app.uiRoot.innerHTML, '');
    equal(app.hudRoot.innerHTML, '');
    equal(JSON.stringify(events), JSON.stringify([
      ['enter-first', 'first'],
      ['exit-first'],
      ['enter-second', 'second'],
    ]));
  }),
  createTest('controlSettings', '重複キーは最初のアクションだけに残る', ({ equal }) => {
    const bindings = normalizeKeyBindings({
      [INPUT_ACTIONS.LEFT]: ['KeyA', 'KeyD'],
      [INPUT_ACTIONS.RIGHT]: ['KeyA', 'KeyL'],
    });
    equal(bindings[INPUT_ACTIONS.LEFT][0], 'KeyA');
    equal(bindings[INPUT_ACTIONS.RIGHT][0], null);
    equal(bindings[INPUT_ACTIONS.RIGHT][1], 'KeyL');
  }),

  createTest('controlSettings', 'タッチ設定は範囲内へ正規化される', ({ deepEqual }) => {
    deepEqual(normalizeTouchConfig({ layout: 'unknown', padSize: 999, deadZone: -1, buttonSize: 12, opacity: 5 }), {
      enabled: true,
      layout: 'rightHanded',
      padSize: 170,
      deadZone: 6,
      buttonSize: 48,
      opacity: 1,
    });
  }),

  createTest('TouchControlsView', 'destroy時にこのViewが押下した仮想入力を全解除する', ({ equal }) => {
    const calls = [];
    const view = new TouchControlsView({
      input: {
        setVirtual(action, isDown) {
          calls.push([action, isDown]);
        },
      },
    });
    view.setTouchVirtual(INPUT_ACTIONS.RIGHT, true);
    view.setTouchVirtual(INPUT_ACTIONS.RIGHT, true);
    view.setTouchVirtual(INPUT_ACTIONS.JUMP, true);
    view.destroy();
    equal(calls.filter(([action, isDown]) => action === INPUT_ACTIONS.RIGHT && !isDown).length, 2);
    equal(calls.filter(([action, isDown]) => action === INPUT_ACTIONS.JUMP && !isDown).length, 1);
    equal(view.activeVirtualActions.size, 0);
  }),

  createTest('PlayerController', '左右入力をmoveXへ変換する', ({ equal }) => {
    const input = createInputMock([INPUT_ACTIONS.RIGHT]);
    const command = new PlayerController(input).read(1 / 60);
    equal(command.moveX, 1);
    input.down.delete(INPUT_ACTIONS.RIGHT);
    input.down.add(INPUT_ACTIONS.LEFT);
    equal(new PlayerController(input).read(1 / 60).moveX, -1);
  }),

  createTest('PlayerController', 'Space/Zなどのジャンプ入力は魔法の上方向に使わない', ({ equal }) => {
    const input = createInputMock([INPUT_ACTIONS.JUMP, INPUT_ACTIONS.MAGIC]);
    const command = new PlayerController(input).read(1 / 60);
    equal(command.magicCast, false);
    equal(command.magicDirection, null);
  }),

  createTest('PlayerController', '明示された上入力だけを魔法の上方向に使う', ({ assert, equal }) => {
    const input = createInputMock([INPUT_ACTIONS.UP, INPUT_ACTIONS.MAGIC]);
    const command = new PlayerController(input).read(1 / 60);
    equal(command.magicCast, true);
    assert(command.magicDirection.y < -0.9, '上方向の魔法ベクトルが生成される');
  }),
];
