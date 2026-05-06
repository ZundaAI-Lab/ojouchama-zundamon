/**
 * 責務: ステージ進行・リザルト計算の自動テスト定義を担当する。
 * 更新ルール: Sceneや描画に依存する検証は避け、進行サービスへ渡す最小runtimeだけを使う。
 */
import { createTest } from '../TestRunner.js';
import { Item } from '../../actors/item/Item.js';
import { ItemCollectionService } from '../../stage/ItemCollectionService.js';
import { RewardCoinDropService } from '../../stage/RewardCoinDropService.js';
import { PhysicsSystem } from '../../systems/PhysicsSystem.js';
import { StageClearService } from '../../stage/StageClearService.js';
import { BalloonRideSystem } from '../../stage/BalloonRideSystem.js';
import { NanoCompanion } from '../../actors/nano/NanoCompanion.js';
import { NANO_CONFIG, NANO_STATES } from '../../config/nanoConfig.js';
import { StageResultCalculator } from '../../stage/StageResultCalculator.js';
import { SwitchGimmickSystem } from '../../stage/SwitchGimmickSystem.js';
import { PlatformGimmickSystem } from '../../stage/PlatformGimmickSystem.js';
import { FallRespawnService } from '../../stage/FallRespawnService.js';
import { StageCheckpointService } from '../../stage/StageCheckpointService.js';
import { updateStageRuntimeFlow } from '../../stage/runtime/StageUpdateFlow.js';
import { clampPlayerToHorizontalScreen } from '../../stage/StagePlayerScreenBoundary.js';

function createRuntimeFlowMock(overrides = {}) {
  return {
    elapsed: 10,
    lastDt: 0,
    flashTimer: 0,
    dialogue: { active: false, next() {} },
    pendingNanoRescueTutorial: false,
    tutorialDialog: null,
    optionDialog: null,
    paused: false,
    restartTimer: 0,
    nanoRescueEvent: null,
    balloonRideSystem: null,
    app: { input: { wasPressed() { return false; } } },
    camera: { update() {} },
    updateHud() {},
    updateBossEncounterEvent() { return false; },
    tryStartBossEncounter() { return false; },
    showPause() {},
    hidePause() {},
    pauseView: { update() {} },
    openTutorial() {},
    ...overrides,
  };
}

function createBalloonRuntimeFlowMock(overrides = {}) {
  return createRuntimeFlowMock({
    player: { jellyBounceLock: 0 },
    balloonRideSystem: { isActive() { return true; }, update() {} },
    particleSystem: { particles: [], update() {} },
    particles: [],
    projectiles: [],
    items: [],
    ...overrides,
  });
}

function createRuntime(overrides = {}) {
  return {
    elapsed: 40,
    coins: 20,
    purified: 4,
    damageCount: 0,
    teacupsCollected: 1,
    settings: { difficulty: 'normal' },
    stage: {
      id: 'sample_stage',
      worldIndex: 0,
      route: { stageIds: ['sample_stage'], startStageId: 'sample_stage' },
    },
    ...overrides,
  };
}

function createNanoSwapRuntime(overrides = {}) {
  const player = {
    x: 36,
    y: 84,
    w: 20,
    h: 32,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
  };

  return {
    player,
    stage: { width: 240, height: 180 },
    getCollisionSolids() { return []; },
    spawnSparkles() {},
    camera: { shake() {} },
    app: {
      input: { isDown() { return false; } },
      audio: { playSfx() {} },
    },
    ...overrides,
  };
}

export const stageTests = [

  createTest('StageUpdateFlow', '会話・チュートリアル・ポーズ中はクリアタイムを進めない', ({ equal }) => {
    const dialogueRuntime = createRuntimeFlowMock({ dialogue: { active: true, next() {} } });
    updateStageRuntimeFlow(dialogueRuntime, 1.5);
    equal(dialogueRuntime.elapsed, 10);

    const tutorialRuntime = createRuntimeFlowMock({ tutorialDialog: { update() {} } });
    updateStageRuntimeFlow(tutorialRuntime, 1.5);
    equal(tutorialRuntime.elapsed, 10);

    const pausedRuntime = createRuntimeFlowMock({ paused: true });
    updateStageRuntimeFlow(pausedRuntime, 1.5);
    equal(pausedRuntime.elapsed, 10);
  }),

  createTest('StageUpdateFlow', '操作可能なライド中はクリアタイムを進める', ({ equal }) => {
    const runtime = createBalloonRuntimeFlowMock();
    updateStageRuntimeFlow(runtime, 1.25);
    equal(runtime.elapsed, 11.25);
  }),

  createTest('ItemCollectionService', '大きな豆コイン取得で豆コイン10枚分を加算する', ({ equal }) => {
    const item = new Item({ x: 0, y: 0, kind: 'largeBeanCoin' });
    const runtime = {
      coins: 2,
      player: { hp: 1, maxHp: 3 },
      spawnSparkles() {},
      app: { audio: { playSfx() {} } },
    };
    ItemCollectionService.collect(runtime, item);
    equal(runtime.coins, 12);
    equal(item.alive, false);
  }),

  createTest('RewardCoinDropService', '報酬豆コインは実地形に接地したらその場で固定する', ({ assert, equal }) => {
    const item = new Item({ x: 24, y: 8, kind: 'coin', rewardDrop: true, vx: 0, vy: 0, gravity: 760 });
    const physics = new PhysicsSystem();
    const collisionWorld = {
      itemSolids: [{ x: 0, y: 44, w: 120, h: 12 }],
      slopeSurfaces: [],
    };

    for (let i = 0; i < 40 && item.dropActive; i += 1) {
      RewardCoinDropService.updateDropItem(item, 1 / 60, collisionWorld, physics);
    }

    equal(item.dropActive, false);
    equal(item.fixedOnGround, true);
    assert(Math.abs(item.y - (44 - item.h / 2)) < 0.001, '豆コインの中心Yが地面上端に合う');
  }),

  createTest('RewardCoinDropService', '報酬豆コインは移動中に壁へ当たると横速度が止まる', ({ assert, equal }) => {
    const item = new Item({ x: 20, y: 18, kind: 'coin', rewardDrop: true, vx: 260, vy: 0, gravity: 0 });
    const physics = new PhysicsSystem();
    const collisionWorld = {
      itemSolids: [{ x: 34, y: 0, w: 10, h: 80 }],
      slopeSurfaces: [],
    };

    RewardCoinDropService.updateDropItem(item, 0.12, collisionWorld, physics);

    equal(item.vx, 0);
    equal(item.dropActive, true);
    assert(item.x <= 34 - item.w / 2 + 0.001, '豆コインが壁へ埋まらない');
  }),

  createTest('RewardCoinDropService', '足場がない報酬豆コインは空中停止せず画面外まで落下して消える', ({ equal }) => {
    const item = new Item({ x: 24, y: 8, kind: 'coin', rewardDrop: true, vx: 0, vy: 0, gravity: 760 });
    const physics = new PhysicsSystem();
    const collisionWorld = { itemSolids: [], slopeSurfaces: [] };

    for (let i = 0; i < 180 && item.alive; i += 1) {
      RewardCoinDropService.updateDropItem(item, 1 / 60, collisionWorld, physics);
    }

    equal(item.alive, false);
  }),

  createTest('NanoCompanion', '位置交換の移動可能判定は上下方向へ広く候補を探す', ({ assert, equal }) => {
    const runtime = createNanoSwapRuntime();
    const nano = new NanoCompanion({ player: runtime.player, input: runtime.app.input });
    nano.state = NANO_STATES.WAIT;
    nano.x = 91;
    nano.y = 91;
    runtime.nano = nano;
    runtime.getCollisionSolids = () => [{ x: 70, y: 76, w: 70, h: 32 }];

    const destination = nano.findValidPlayerDestination(runtime);

    assert(destination, '上下にずらした交換先を見つける');
    equal(destination.y, 108);
  }),

  createTest('NanoCompanion', '上方向へ発射したなのちゃんは画面上端の内側で待機する', ({ equal }) => {
    const runtime = createNanoSwapRuntime({
      player: { x: 36, y: 168, w: 20, h: 32, vx: 0, vy: 0, onGround: false, facing: 1 },
      camera: { x: 0, y: 96, shake() {} },
      stage: { width: 480, height: 420 },
    });
    const nano = new NanoCompanion({ player: runtime.player, input: runtime.app.input });
    runtime.nano = nano;

    nano.launchFromHead(runtime, { x: 0, y: -1 });
    nano.updateFly(0.3, runtime);

    const expectedY = runtime.camera.y + Math.max(0, (NANO_CONFIG.DRAW_H - nano.h) / 2) + NANO_CONFIG.SCREEN_TOP_VISUAL_PADDING;
    equal(nano.state, NANO_STATES.WAIT);
    equal(nano.y, expectedY);
  }),

  createTest('BalloonRideSystem', 'ライド中の報酬豆コインは取得猶予が進み乗車姿勢の取得判定で拾える', ({ equal }) => {
    const item = new Item({ x: 101, y: 72, kind: 'coin', rewardDrop: true, vx: 0, vy: 0, gravity: 0, pickupDelay: 0.1 });
    const runtime = {
      elapsed: 20,
      coins: 0,
      purified: 0,
      items: [item],
      projectiles: [],
      residents: [],
      stage: { width: 480, height: 320, balloonRides: [] },
      player: {
        x: 100,
        y: 96,
        w: 28,
        h: 40,
        hp: 3,
        maxHp: 3,
        getBounds() { return { x: this.x + 2, y: this.y - 16, w: 24, h: 48 }; },
      },
      spawnSparkles() {},
      app: { audio: { playSfx() {} } },
    };
    const system = new BalloonRideSystem(runtime);

    system.updateRideItems(0.12);

    equal(runtime.coins, 1);
    equal(item.alive, false);
  }),

  createTest('BalloonRideSystem', 'ライド中に住民が落とす報酬豆コインは画面上で自動スクロール速度に合わせて左へ流れる', ({ assert, equal }) => {
    const scrollSpeed = 64;
    const runtime = {
      elapsed: 20,
      coins: 0,
      purified: 0,
      items: [],
      projectiles: [{
        x: 108, y: 96, w: 12, h: 12, vx: 0, vy: 0, life: 1, alive: true, faction: 'player', damage: 1,
        getBounds() { return { x: this.x, y: this.y, w: this.w, h: this.h }; },
      }],
      residents: [{
        id: 'ride_resident', rideId: 'ride_1', x: 104, y: 92, w: 24, h: 24, hp: 1, alive: true, rewardCoins: 2,
        getBounds() { return { x: this.x, y: this.y, w: this.w, h: this.h }; },
        damage(amount) { this.hp -= amount; if (this.hp <= 0) this.alive = false; },
      }],
      camera: { x: 0 },
      stage: { width: 480, height: 320, balloonRides: [] },
      player: { x: 100, y: 96, w: 28, h: 40, hp: 3, maxHp: 3 },
      spawnSparkles() {},
      app: { audio: { playSfx() {} } },
    };
    const system = new BalloonRideSystem(runtime);
    system.session.activeRide = { config: { scrollSpeed } };

    system.updateRideProjectiles(0, runtime.residents);

    equal(runtime.items.length, 2);
    assert(runtime.items.every(item => item.vx === 0), 'ライド報酬豆コインは追加の横速度を持たない');
    assert(runtime.items.every(item => item.vx - scrollSpeed === -scrollSpeed), '画面上では自動スクロール速度ぶんだけ左へ流れる');
    assert(runtime.items.every(item => item.vy > 0 && item.vy <= 24), 'ライド報酬豆コインの下向き初速が控えめ');
    assert(runtime.items.every(item => item.gravity <= 52), 'ライド報酬豆コインの下向き加速が控えめ');
  }),


  createTest('SwitchGimmickSystem', 'リボンスイッチはスイッチギミック分類からリボン橋を起動する', ({ assert, equal }) => {
    const bridge = { x: 80, y: 120, w: 96, h: 16, kind: 'ribbonBridge', active: false, group: 'a' };
    const gimmick = { id: 'ribbon_switch_a', kind: 'ribbonSwitch', x: 40, y: 96, w: 40, h: 40, targetGroup: 'a', triggerBy: ['magic'] };
    const stage = { platforms: [bridge], switchGimmicks: [gimmick] };
    const system = new SwitchGimmickSystem(stage, { beginFrame() {} });
    const runtime = {
      stage,
      spawnSparkles() {},
      hud: { showBanner() {} },
      app: { audio: { playSfx() {} } },
    };
    const projectile = {
      alive: true,
      faction: 'player',
      getBounds() { return { x: 48, y: 104, w: 8, h: 8 }; },
    };

    const hit = system.hitWithMagic(runtime, projectile);

    equal(hit, true);
    equal(bridge.active, true);
    assert(bridge.ribbonBridgeTimer > 0, 'リボン橋の寿命タイマーが設定される');
  }),

  createTest('SwitchGimmickSystem', 'リボン橋の起動中にリボンスイッチへ魔法を当てても残り時間をリセットしない', ({ equal }) => {
    const bridge = { x: 80, y: 120, w: 96, h: 16, kind: 'ribbonBridge', active: true, ribbonBridgeTimer: 2.4, group: 'a' };
    const gimmick = { id: 'ribbon_switch_a', kind: 'ribbonSwitch', x: 40, y: 96, w: 40, h: 40, targetGroup: 'a', triggerBy: ['magic'] };
    const stage = { platforms: [bridge], switchGimmicks: [gimmick] };
    const system = new SwitchGimmickSystem(stage, { beginFrame() {} });
    const runtime = {
      stage,
      spawnSparkles() {},
      hud: { showBanner() {} },
      app: { audio: { playSfx() {} } },
    };
    const projectile = {
      alive: true,
      faction: 'player',
      getBounds() { return { x: 48, y: 104, w: 8, h: 8 }; },
    };

    equal(system.hitWithMagic(runtime, projectile), true);
    equal(bridge.ribbonBridgeTimer, 2.4);
  }),

  createTest('PlatformGimmickSystem', 'ribbonBridgeへ直接魔法を当てても起動しない', ({ equal }) => {
    const bridge = { x: 40, y: 96, w: 96, h: 16, kind: 'ribbonBridge', active: false, group: 'a' };
    const runtime = {
      stage: { platforms: [bridge] },
      spawnSparkles() {},
      hud: { showBanner() {} },
      app: { audio: { playSfx() {} } },
    };
    const projectile = {
      getBounds() { return { x: 64, y: 96, w: 8, h: 8 }; },
    };

    equal(PlatformGimmickSystem.hitPlatformWithMagic(runtime, projectile), false);
    equal(bridge.active, false);
    equal(bridge.ribbonBridgeTimer, undefined);
  }),

  createTest('PlatformGimmickSystem', '有効時間0のpage/wishLeaf/ribbonBridgeは無制限で有効を維持する', ({ equal }) => {
    const page = { x: 0, y: 100, w: 64, h: 16, kind: 'page', active: false, activeDuration: 0 };
    const leaf = { x: 80, y: 100, w: 64, h: 16, kind: 'wishLeaf', active: true, activeDuration: 0 };
    const bridge = { x: 160, y: 100, w: 64, h: 16, kind: 'ribbonBridge', active: true, activeDuration: 0 };
    const runtime = {
      elapsed: 999,
      stage: { platforms: [page, leaf, bridge] },
      player: { groundPlatform: null, onGround: false },
      spawnSparkles() {},
      hud: { showBanner() {} },
      app: { audio: { playSfx() {} } },
    };

    PlatformGimmickSystem.updateBeforePhysics(runtime, 999);

    equal(page.active, true);
    equal(leaf.active, true);
    equal(bridge.active, true);
    equal(leaf.wishLeafTimer, undefined);
    equal(bridge.ribbonBridgeTimer, undefined);
  }),


  createTest('FallRespawnService', '落下復帰地点は通常足場だけで更新し特殊足場では上書きしない', ({ equal }) => {
    const normal = { id: 'normal_floor', x: 100, y: 200, w: 120, h: 16, kind: 'normal', active: true };
    const ribbonBridge = { id: 'ribbon_bridge', x: 260, y: 180, w: 96, h: 16, kind: 'ribbonBridge', active: true };
    const cloud = { id: 'cloud_floor', x: 420, y: 160, w: 96, h: 16, kind: 'cloud', active: true };
    const service = new FallRespawnService({ x: 0, y: 0 });
    const player = {
      x: 110,
      y: 160,
      w: 20,
      h: 40,
      facing: -1,
      groundPlatform: cloud,
      getBounds() { return { x: this.x, y: this.y, w: this.w, h: this.h }; },
      getPositionFromBounds(x, y) { return { x, y }; },
    };
    const runtime = { stage: { platforms: [normal, ribbonBridge, cloud] }, player };

    service.updateSafePoint(runtime);
    equal(service.safePoint.x, 0);
    equal(service.safePoint.source, 'initial');

    player.groundPlatform = normal;
    service.updateSafePoint(runtime);
    equal(service.safePoint.x, 110);
    equal(service.safePoint.y, 159.5);
    equal(service.safePoint.facing, -1);
    equal(service.safePoint.source, 'normalFloor');

    player.x = 268;
    player.y = 140;
    player.facing = 1;
    player.groundPlatform = ribbonBridge;
    service.updateSafePoint(runtime);
    equal(service.safePoint.x, 110);
    equal(service.safePoint.y, 159.5);
    equal(service.safePoint.source, 'normalFloor');

    player.x = 430;
    player.y = 120;
    player.groundPlatform = cloud;
    service.updateSafePoint(runtime);
    equal(service.safePoint.x, 110);
    equal(service.safePoint.y, 159.5);
  }),

  createTest('FallRespawnService', '落下復帰時はカメラも同期し古いスクロールで押し戻さない', ({ equal }) => {
    const service = new FallRespawnService({ x: 48, y: 208 });
    const player = {
      x: 2456,
      y: 272,
      w: 28,
      h: 40,
      drawW: 58,
      facing: 1,
      onGround: false,
      groundPlatform: null,
      jumpBufferTimer: 1,
      coyoteTimer: 1,
      jellyBounceLock: 1,
      tea: { activeTimer: 1 },
      bow: { activeTimer: 1 },
      getDamageBoundsAt(x = this.x, y = this.y) { return { x, y, w: this.w, h: this.h }; },
    };
    const runtime = {
      stage: { width: 3360, height: 360 },
      player,
      camera: {
        x: 2216,
        y: 0,
        follow(target) { this.target = target; },
      },
      nano: null,
      app: { input: { clearGameplay() {} } },
    };

    service.respawn(runtime);
    const clamped = clampPlayerToHorizontalScreen(runtime);

    equal(player.x, 48);
    equal(player.y, 208);
    equal(runtime.camera.x, 0);
    equal(clamped, false);
  }),

  createTest('StageCheckpointService', '中継ポイントは落下復帰地点を上書きせずライド終点だけが登録する', ({ equal }) => {
    const fallRespawn = new FallRespawnService({ x: 12, y: 34 });
    const runtime = {
      player: { w: 20, h: 40, getBounds() { return { x: 0, y: 0, w: this.w, h: this.h }; }, getPositionFromBounds(x, y) { return { x, y }; } },
      checkpoints: [{ id: 'cp1', x: 200, y: 160, w: 34, h: 46, activated: false }],
      activeCheckpointId: null,
      respawnPoint: { x: 12, y: 34 },
      fallRespawn,
      spawnSparkles() {},
      hud: { showBanner() {} },
      app: { audio: { playSfx() {} } },
    };

    StageCheckpointService.setActiveCheckpoint(runtime, runtime.checkpoints[0], { silent: true, syncRespawn: true });
    equal(runtime.respawnPoint.x, 190);
    equal(runtime.respawnPoint.y, 119.5);
    equal(fallRespawn.safePoint.x, 12);
    equal(fallRespawn.safePoint.y, 34);
    equal(fallRespawn.safePoint.source, 'initial');

    StageCheckpointService.registerRideGoalSafePoint(runtime, { x: 320, y: 96, facing: -1 });
    equal(runtime.respawnPoint.x, 320);
    equal(runtime.respawnPoint.y, 96);
    equal(runtime.activeCheckpointId, null);
    equal(runtime.checkpoints[0].activated, false);
    equal(fallRespawn.safePoint.x, 320);
    equal(fallRespawn.safePoint.y, 96);
    equal(fallRespawn.safePoint.facing, -1);
    equal(fallRespawn.safePoint.source, 'rideGoal');
  }),

  createTest('StageResultCalculator', 'royal難易度で満点条件ならRoyal Sになる', ({ equal }) => {
    const runtime = createRuntime({ settings: { difficulty: 'royal' } });
    equal(StageResultCalculator.calculateRank(runtime), 'Royal S');
  }),

  createTest('StageResultCalculator', '遅延・被弾・収集不足が重なるとCになる', ({ equal }) => {
    const runtime = createRuntime({ elapsed: 999, coins: 0, damageCount: 5, settings: { difficulty: 'normal' } });
    equal(StageResultCalculator.calculateRank(runtime), 'C');
  }),

  createTest('StageClearService', '検証専用ステージは保存せずタイトルへ戻す', ({ equal }) => {
    let recorded = false;
    let changedTo = null;
    const runtime = createRuntime({
      stage: { id: 'switch_test_lab', testStage: true, clearDialogue: null, route: { stageIds: ['switch_test_lab'] } },
      app: {
        input: { clearGameplay() {} },
        audio: { playSfx() {} },
        save: { recordStageClear() { recorded = true; } },
        sceneManager: { change(sceneId) { changedTo = sceneId; } },
      },
    });
    StageClearService.clear(runtime);
    equal(recorded, false);
    equal(changedTo, 'title');
  }),

  createTest('StageClearService', '通常ステージは保存してリザルトへ遷移する', ({ equal }) => {
    let savedStageId = null;
    let changedTo = null;
    const runtime = createRuntime({
      stage: {
        id: 'route_last_area',
        worldIndex: 0,
        clearDialogue: null,
        route: { stageIds: ['route_area_1', 'route_last_area'], startStageId: 'route_area_1', saveStageId: 'route_root' },
      },
      app: {
        input: { clearGameplay() {} },
        audio: { playSfx() {} },
        save: {
          recordStageClear(stage, result) {
            savedStageId = stage.id;
            return { bestTime: result.clearTime };
          },
        },
        sceneManager: { change(sceneId) { changedTo = sceneId; } },
      },
    });
    StageClearService.clear(runtime);
    equal(savedStageId, 'route_root');
    equal(changedTo, 'result');
  }),
];
