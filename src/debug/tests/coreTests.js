/**
 * 責務: ゲーム基盤に近い純粋処理の自動テスト定義を担当する。
 * 更新ルール: DOMやScene遷移を必要とする検証は持ち込まず、軽量に実行できる対象だけを扱う。
 */
import { createTest } from '../TestRunner.js';
import { Player } from '../../actors/player/Player.js';
import { Resident } from '../../actors/resident/Resident.js';
import { PlayerController } from '../../actors/player/PlayerController.js';
import { PhysicsSystem } from '../../systems/PhysicsSystem.js';
import { INPUT_ACTIONS } from '../../config/inputActions.js';
import {
  DEFAULT_TOUCH_BUTTON_SLOTS,
  getTouchButtonSlotSourceIndexForLayout,
  getTouchButtonSlotsForLayout,
  normalizeKeyBindings,
  normalizeTouchConfig,
} from '../../config/controlSettings.js';
import { TouchControlsView } from '../../ui/views/TouchControlsView.js';
import { SceneManager } from '../../core/SceneManager.js';
import { PlatformGimmickSystem } from '../../stage/PlatformGimmickSystem.js';
import { SCENES } from '../../config/sceneIds.js';

function createInputMock(initialActions = []) {
  const down = new Set(initialActions);
  const pressed = new Set(initialActions);
  const actionAims = new Map();
  return {
    down,
    pressed,
    actionAims,
    isDown(action) { return down.has(action); },
    wasPressed(action) { return pressed.has(action); },
    getActionAim(action) { return actionAims.get(action) || null; },
    setActionAim(action, direction) { actionAims.set(action, direction); },
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
      assets: {
        loadKeys: async () => {},
      },
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
      buttonSlots: DEFAULT_TOUCH_BUTTON_SLOTS,
    });
  }),

  createTest('controlSettings', '左利き配置では機能ボタンの表示スロットを左右反転する', ({ deepEqual, equal }) => {
    equal(getTouchButtonSlotSourceIndexForLayout('leftHanded', 0), 4);
    equal(getTouchButtonSlotSourceIndexForLayout('leftHanded', 1), 3);
    equal(getTouchButtonSlotSourceIndexForLayout('leftHanded', 5), 9);
    equal(getTouchButtonSlotSourceIndexForLayout('leftHanded', 6), 8);
    equal(getTouchButtonSlotSourceIndexForLayout('leftHanded', 9), 5);
    deepEqual(getTouchButtonSlotsForLayout(DEFAULT_TOUCH_BUTTON_SLOTS, 'leftHanded'), [
      INPUT_ACTIONS.NANO,
      INPUT_ACTIONS.TEA,
      null,
      null,
      null,
      INPUT_ACTIONS.JUMP,
      INPUT_ACTIONS.MAGIC,
      INPUT_ACTIONS.BOW,
      null,
      INPUT_ACTIONS.PAUSE,
    ]);
  }),

  createTest('Resident', '魔法ヒット地上ノックバックの縦速度は同一フレームで重複加算しない', ({ equal }) => {
    const resident = new Resident({ x: 0, y: 0, type: 'macaron' });
    resident.applyMagicHitReaction({ knockbackDuration: 1, knockbackVX: 0, knockbackVY: -28 });
    resident.applyMagicHitGroundVelocity();
    resident.applyMagicHitGroundVelocity();
    equal(resident.vy, -28);
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
    const controller = new PlayerController(input);
    equal(controller.read(1 / 60).magicCast, false);
    const command = controller.read(1 / 20);
    equal(command.magicCast, true);
    assert(command.magicDirection.y < -0.9, '上方向の魔法ベクトルが生成される');
  }),

  createTest('PlayerController', '魔法ボタン後に上下左右が少しズレても斜め方向へ合成する', ({ assert, equal }) => {
    const input = createInputMock([INPUT_ACTIONS.MAGIC]);
    const controller = new PlayerController(input);
    equal(controller.read(1 / 60).magicCast, false);
    input.down.add(INPUT_ACTIONS.UP);
    equal(controller.read(1 / 60).magicCast, false);
    input.down.add(INPUT_ACTIONS.RIGHT);
    const command = controller.read(1 / 60);
    equal(command.magicCast, true);
    assert(command.magicDirection.x > 0.6 && command.magicDirection.y < -0.6, '右上方向の魔法ベクトルが生成される');
  }),

  createTest('PlayerController', '発射専用フリック方向は方向パッド入力と合成し、同軸はフリックを優先する', ({ assert, equal }) => {
    const input = createInputMock([INPUT_ACTIONS.RIGHT, INPUT_ACTIONS.MAGIC]);
    input.setActionAim(INPUT_ACTIONS.MAGIC, { x: -1, y: -1 });
    const command = new PlayerController(input).read(1 / 60);
    equal(command.magicCast, true);
    assert(command.magicDirection.x < -0.6 && command.magicDirection.y < -0.6, '右入力中でも左上フリックが優先される');
  }),

  createTest('PhysicsSystem', 'stepUpHeight以内の横衝突は小段差として上面へ乗り上げる', ({ assert, equal }) => {
    const physics = new PhysicsSystem();
    const actor = { x: -3, y: 0, w: 10, h: 10, vx: 300, vy: 0, onGround: false, groundPlatform: null };
    const solid = { x: 8, y: 5, w: 20, h: 8 };
    physics.moveActor(actor, 1 / 60, [solid], { stepUpHeight: 5 });
    equal(actor.y, -5);
    equal(actor.onGround, true);
    equal(actor.groundPlatform, solid);
    assert(actor.x > -3, '横方向の進行を止めずに小段差へ乗る');
  }),

  createTest('PhysicsSystem', '弱い上昇中の小段差乗り上げは縦速度を0にして接地を安定させる', ({ equal }) => {
    const physics = new PhysicsSystem();
    const actor = { x: -3, y: 0, w: 10, h: 10, vx: 300, vy: -20, onGround: false, groundPlatform: null };
    const solid = { x: 8, y: 5, w: 20, h: 8 };
    physics.moveActor(actor, 1 / 60, [solid], { stepUpHeight: 5 });
    equal(actor.y, -5);
    equal(actor.vy, 0);
    equal(actor.onGround, true);
    equal(actor.groundPlatform, solid);
  }),

  createTest('PhysicsSystem', '強めの上昇中は小段差乗り上げに吸い上げない', ({ equal }) => {
    const physics = new PhysicsSystem();
    const actor = { x: -3, y: 0, w: 10, h: 10, vx: 300, vy: -80, onGround: false, groundPlatform: null };
    const solid = { x: 8, y: 5, w: 20, h: 8 };
    physics.moveActor(actor, 1 / 60, [solid], { stepUpHeight: 5 });
    equal(actor.onGround, false);
    equal(actor.vx, 0);
  }),

  createTest('PhysicsSystem', 'stepUpHeightを超える横衝突は通常の壁として止める', ({ equal }) => {
    const physics = new PhysicsSystem();
    const actor = { x: -3, y: 0, w: 10, h: 10, vx: 300, vy: 0, onGround: false, groundPlatform: null };
    const solid = { x: 8, y: 4, w: 20, h: 8 };
    physics.moveActor(actor, 1 / 60, [solid], { stepUpHeight: 5 });
    equal(actor.y, 0);
    equal(actor.vx, 0);
    equal(actor.onGround, false);
  }),


  createTest('PlatformGimmickSystem', 'teacupSpinは非接地時に元の角度へ自動復帰しない', ({ equal }) => {
    const teacup = { kind: 'teacupSpin', x: 0, y: 0, w: 80, h: 12, visualTilt: 0.12 };
    const runtime = {
      stage: { platforms: [teacup] },
      player: { x: 0, y: 0, w: 14, h: 18, onGround: false, groundPlatform: null },
    };
    PlatformGimmickSystem.updateBeforePhysics(runtime, 1 / 60);
    equal(teacup.visualTilt, 0.12);
  }),

  createTest('Player', '表示状態はupdate直後ではなく物理後のupdateVisualStateで更新する', ({ equal }) => {
    const input = createInputMock([INPUT_ACTIONS.RIGHT]);
    const player = new Player({ x: 0, y: 0, input });
    const stageScene = {
      getPlayerJumpSpeed: () => null,
      app: { audio: { playSfx() {} } },
    };
    player.onGround = false;
    player.vy = -10;
    player.stateMachine.current = 'idle';
    player.update(1 / 60, stageScene);
    equal(player.stateMachine.current, 'idle');
    player.onGround = true;
    player.vy = 0;
    player.updateVisualState();
    equal(player.stateMachine.current, 'walk');
  }),
];
