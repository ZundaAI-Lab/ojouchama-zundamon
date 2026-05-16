/**
 * 責務: ゲーム基盤のライフサイクル、ループ、カメラ、シーン管理を担当する。
 * 更新ルール: ゲーム固有ルールを持ち込まず、汎用基盤として保つ。
 * 更新ルール: 物理/ゲーム更新は固定ステップで進め、描画だけrequestAnimationFrameへ同期する。
 * 更新ルール: 初期Sceneの差し替えはstart(options)で受け取り、Scene決定処理を各Sceneへ分散しない。
 * 更新ルール: 起動時は全画像ロードを行わず、必要キーの算出はdata/assetLoadPlans.jsへ委譲する。
 * 更新ルール: 画面全体で共通利用するUIオーバーレイは専用Controllerへ委譲し、GameAppは参照の保持に留める。
 * 更新ルール: スマホ表示の実ビューポート追従はMobileViewportControllerへ委譲し、入力処理とゲーム進行には持ち込まない。
 */
import { GAME_VIEW } from '../config/view.js';
import { GameLoop } from './GameLoop.js';
import { SceneManager } from './SceneManager.js';
import { SCENES } from '../config/sceneIds.js';
import { createSceneRegistry } from '../scenes/sceneRegistry.js';
import { InputSystem } from '../systems/InputSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AssetSystem } from '../systems/AssetSystem.js';
import { AudioSystem } from '../audio/AudioSystem.js';
import { ASSET_MANIFEST } from '../data/assetManifest.js';
import { getBootAssetKeys } from '../data/assetLoadPlans.js';
import { DebugSettings } from '../debug/DebugSettings.js';
import { DebugOverlay } from '../debug/DebugOverlay.js';
import { ConfirmDialogController } from '../ui/dialogs/ConfirmDialogController.js';
import { MobileViewportController } from '../ui/MobileViewportController.js';

const MAX_DEVICE_PIXEL_RATIO = 3;
const FIXED_STEP = 1 / 60;
const MAX_ACCUMULATED_TIME = 0.2;
const MAX_STEPS_PER_FRAME = 5;

export class GameApp {
 constructor({ canvas, hudRoot, uiRoot, fxRoot, debugRoot, shell }) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.hudRoot = hudRoot;
  this.uiRoot = uiRoot;
  this.fxRoot = fxRoot;
  this.debugRoot = debugRoot;
  this.shell = shell;
  this.renderScaleX = 1;
  this.renderScaleY = 1;
  this.lastCanvasWidth = 0;
  this.lastCanvasHeight = 0;
  this.save = new SaveSystem();
  this.input = new InputSystem();
  this.input.setKeyBindings(this.save.load().settings.keyBindings);
  this.audio = new AudioSystem(this.save);
  this.assets = new AssetSystem();
  this.debug = new DebugSettings();
  this.debugOverlay = new DebugOverlay(this.debugRoot, this.debug);
  this.confirmDialog = new ConfirmDialogController(this);
  this.sceneManager = new SceneManager(this, createSceneRegistry());
  this.performanceStats = { frameDt: 0, updateMs: 0, renderMs: 0, fixedSteps: 0 };
  this.fixedAccumulator = 0;
  this.loop = new GameLoop(dt => this.tick(dt));
  this.mobileViewport = new MobileViewportController({
   shell: this.shell,
   onResize: () => this.resize(),
  });
  this.configureCanvasQuality();
  this.mobileViewport.start();
  window.addEventListener('resize', () => this.resize());
 }

 async start(options = {}) {
  this.mobileViewport.refresh();
  this.resize();
  this.assets.setManifest(ASSET_MANIFEST);
  const initialScene = options.initialScene || SCENES.TITLE;
  const initialParams = options.initialParams || {};
  await this.assets.loadKeys(getBootAssetKeys(initialScene, initialParams));
  await this.sceneManager.change(initialScene, initialParams);
  this.loop.start();
 }

 configureCanvasQuality() {
  this.ctx.imageSmoothingEnabled = true;
  this.ctx.imageSmoothingQuality = 'high';
 }

 resize() {
  const rect = this.shell?.getBoundingClientRect?.() || this.canvas.getBoundingClientRect();
  const cssWidth = Math.max(1, rect.width || GAME_VIEW.WIDTH);
  const cssHeight = Math.max(1, rect.height || GAME_VIEW.HEIGHT);
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
  const nextWidth = Math.max(GAME_VIEW.WIDTH, Math.round(cssWidth * dpr));
  const nextHeight = Math.max(GAME_VIEW.HEIGHT, Math.round(cssHeight * dpr));

  if (this.canvas.width !== nextWidth) this.canvas.width = nextWidth;
  if (this.canvas.height !== nextHeight) this.canvas.height = nextHeight;

  this.renderScaleX = this.canvas.width / GAME_VIEW.WIDTH;
  this.renderScaleY = this.canvas.height / GAME_VIEW.HEIGHT;
  this.lastCanvasWidth = this.canvas.width;
  this.lastCanvasHeight = this.canvas.height;
  this.configureCanvasQuality();
 }

 prepareFrame() {
  if (this.canvas.width !== this.lastCanvasWidth || this.canvas.height !== this.lastCanvasHeight) {
   this.resize();
  }

  this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.setTransform(this.renderScaleX, 0, 0, this.renderScaleY, 0, 0);
  this.configureCanvasQuality();
 }

 tick(frameDt) {
  const safeFrameDt = Math.max(0, Math.min(MAX_ACCUMULATED_TIME, frameDt || 0));
  const updateStart = performance.now();

  this.audio.update(safeFrameDt);
  this.fixedAccumulator = Math.min(MAX_ACCUMULATED_TIME, this.fixedAccumulator + safeFrameDt);

  let steps = 0;
  while (this.fixedAccumulator >= FIXED_STEP && steps < MAX_STEPS_PER_FRAME) {
   this.sceneManager.update(FIXED_STEP);
   this.input.consumePressedForSimulationStep();
   this.fixedAccumulator -= FIXED_STEP;
   steps += 1;
  }

  // 長い停止復帰で処理が追いつかない時は、遅れを捨てて操作不能なスパイラルを防ぐ。
  if (steps >= MAX_STEPS_PER_FRAME) this.fixedAccumulator = 0;

  const updateMs = performance.now() - updateStart;
  this.prepareFrame();

  const renderStart = performance.now();
  this.sceneManager.render(this.ctx);
  const renderMs = performance.now() - renderStart;

  this.performanceStats = { frameDt: safeFrameDt, updateMs, renderMs, fixedSteps: steps };
  this.debugOverlay?.update(this.performanceStats);
  if (steps > 0) this.input.endFrame();
 }
}
