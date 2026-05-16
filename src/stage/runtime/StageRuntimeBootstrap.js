/**
 * 責務: StageRuntime.enter の初期化手順だけを担当する。
 * 更新ルール: Runtime本体へ新しい生成責務を戻さず、ステージ開始時の依存生成はここへ集約する。
 * 更新ルール: クリア済みステージの会話スキップ判定はStageDialoguePolicyで行い、ここでは開始時状態として保持するだけにする。
 * 更新ルール: 中継ポイントはStageCheckpointServiceで生成・復元し、Runtime本体へ生成責務を戻さない。
 * 更新ルール: editor.htmlの一時ステージ定義はparams.stageDefinitionから受け取り、STAGESの正本データへ書き戻さない。
 * 更新ルール: ステージ開始BGMは正規化済みstage.bgmをaudioの解決関数へ渡し、Runtime本体へ曲データを持ち込まない。
 * 更新ルール: イベント中断後に再開するためのステージBGM IDとイベントBGM一時状態だけをRuntime状態として保持し、発音・フェード処理はaudioへ委譲する。
 * 更新ルール: ボス戦専用カメラ演出の依存生成はここで行い、BossEncounterControllerには生成責務を持たせない。
 * 更新ルール: 夢のしずく取得はゴール時まで未確定としてRuntimeに保持し、保存処理はStageClearServiceで行う。
 * 更新ルール: 次ステージ画像の先読みはassetLoadPlansの算出結果だけを使い、Runtime初期化手順へステージ解析を増やさない。
 * 更新ルール: 魔法命中ヒットストップの初期値だけをここで持ち、停止処理はStageUpdateFlowへ委譲する。
 * 更新ルール: ステージ名トーストは開始会話の完了後に一度だけ表示し、HUD側の常時更新へ戻さない。
 */
import { Hud } from '../../ui/Hud.js';
import { DialogueView } from '../../ui/DialogueView.js';
import { TouchControlsView } from '../../ui/views/TouchControlsView.js';
import { StageFactory } from '../StageFactory.js';
import { StageAreaManager } from '../StageAreaManager.js';
import { StageProgress } from '../StageProgress.js';
import { ParticleSystem } from '../ParticleSystem.js';
import { SwitchStateSystem } from '../SwitchStateSystem.js';
import { SwitchGimmickSystem } from '../SwitchGimmickSystem.js';
import { SwitchTargetSystem } from '../SwitchTargetSystem.js';
import { BossEncounterController } from '../BossEncounterController.js';
import { StageRouteProgress } from '../StageRouteProgress.js';
import { initializeStageTeacups } from '../StageTeacupInventory.js';
import { StageDialoguePolicy } from '../StageDialoguePolicy.js';
import { StageCheckpointService } from '../StageCheckpointService.js';
import { FallRespawnService } from '../FallRespawnService.js';
import { BalloonRideSystem } from '../BalloonRideSystem.js';
import { StageScrollController } from '../StageScrollController.js';
import { BossCameraController } from '../BossCameraController.js';
import { NanoRideSupport } from '../../actors/nano/NanoRideSupport.js';
import { NanoRescueEventSystem } from '../NanoRescueEventSystem.js';
import { StageEventSystem } from '../StageEventSystem.js';
import { getNextStagePrefetchAssetKeys } from '../../data/assetLoadPlans.js';
import { STAGES } from '../../data/stages.js';
import { DIFFICULTY_DEFS } from '../../config/difficultyDefs.js';
import { deepClone } from '../../utils/object.js';
import { resolveStageBgmId } from '../../data/audio/bgmTrackDefs.js';

export async function enterStageRuntime(runtime) {
  runtime.saveData = runtime.app.save.load();
  runtime.settings = runtime.saveData.settings;
  runtime.difficulty = DIFFICULTY_DEFS[runtime.settings.difficulty] || DIFFICULTY_DEFS.normal;
  const stageId = runtime.params.stageId || 'candy_forest_area_1';
  runtime.stage = runtime.params.stageDefinition
    ? deepClone(runtime.params.stageDefinition)
    : deepClone(STAGES[stageId] || STAGES.candy_forest_area_1);
  if (runtime.params.editorPreview) {
    runtime.stage.testStage = true;
    runtime.stage.route = null;
  }
  runtime.skipDialogueEvents = runtime.params.editorPreview || StageDialoguePolicy.shouldSkipStageDialogue(runtime.saveData, runtime.stage);
  runtime.stageBgmId = resolveStageBgmId(runtime.stage);
  runtime.stageBgmPausedForEvent = false;
  runtime.stageEventBgmId = null;
  runtime.stageEventBgmTimer = 0;
  runtime.app.audio.playBgm(runtime.stageBgmId);

  runtime.routeProgressBase = StageRouteProgress.fromParams(runtime.params.routeProgress);
  runtime.initialSpawn = runtime.params.respawnPoint || runtime.stage.playerStart;
  runtime.areaManager = new StageAreaManager(runtime.stage, runtime.params, runtime.initialSpawn);
  runtime.areas = runtime.areaManager.areas;
  runtime.particleSystem = new ParticleSystem();
  runtime.progress = new StageProgress();
  runtime.fallRespawn = new FallRespawnService(runtime.initialSpawn);
  runtime.checkpoints = StageCheckpointService.createStageCheckpoints(runtime.stage);
  runtime.activeCheckpointId = null;
  runtime.switchState = new SwitchStateSystem();
  runtime.switchGimmickSystem = new SwitchGimmickSystem(runtime.stage, runtime.switchState);
  runtime.switchTargetSystem = new SwitchTargetSystem(runtime.stage, runtime.switchState);

  Object.assign(runtime, StageFactory.createRuntimeObjects(
    runtime.app,
    runtime.stage,
    runtime.difficulty,
    runtime.initialSpawn,
    runtime.saveData,
  ));
  runtime.particles = runtime.particleSystem.particles;
  StageCheckpointService.restoreFromRespawn(runtime);
  runtime.collisionWorld = null;
  runtime.switchTargetSystem.apply(runtime);
  runtime.stageScrollController = new StageScrollController();
  runtime.bossCameraController = new BossCameraController({ scrollController: runtime.stageScrollController });
  runtime.nanoRideSupport = new NanoRideSupport();
  runtime.balloonRideSystem = new BalloonRideSystem(runtime, {
    scrollController: runtime.stageScrollController,
    nanoRideSupport: runtime.nanoRideSupport,
  });
  runtime.nanoRescueEvent = new NanoRescueEventSystem(runtime);
  runtime.stageEventSystem = new StageEventSystem(runtime);

  runtime.hud = new Hud(runtime.app.hudRoot, runtime.app.assets, runtime.settings);
  runtime.dialogue = new DialogueView(runtime.app.uiRoot, runtime.app.assets, active => runtime.setDialogueMode(active));

  runtime.coins = runtime.routeProgressBase.coins;
  runtime.teacupsCollected = runtime.routeProgressBase.teacupsCollected;
  runtime.progress.teacupsCollected = runtime.teacupsCollected;
  initializeStageTeacups(runtime);
  runtime.elapsed = runtime.routeProgressBase.elapsed;
  runtime.purified = runtime.routeProgressBase.purified;
  runtime.damageCount = runtime.routeProgressBase.damageCount;
  runtime.pendingDreamDropStageIds = new Set();
  runtime.flashTimer = 0;
  runtime.magicHitStopTimer = 0;
  runtime.stageNameToastShown = false;
  runtime.showStageNameToast = () => {
    if (runtime.stageNameToastShown) return;
    runtime.stageNameToastShown = true;
    runtime.hud?.showStageName(runtime.stage?.name || '');
  };
  runtime.restartTimer = 0;
  runtime.pendingNanoRescueTutorial = false;
  runtime.tutorialDialog = null;
  runtime.paused = false;
  runtime.bossDialogueShown = !!(runtime.params.skipBossDialogue || runtime.params.resumeBossBattle);
  runtime.bossDefeatHandled = false;
  runtime.bossDefeatDialogueShown = !!runtime.params.skipBossDefeatDialogue;
  runtime.clearStarted = false;
  BossEncounterController.initialize(runtime);

  runtime.touchControls = new TouchControlsView(runtime.app);
  runtime.touchRoot = runtime.touchControls.mount();
  runtime.updateHud();

  const shouldShowIntroDialogue = runtime.stage.introDialogue && !runtime.params.skipIntro && !runtime.skipDialogueEvents;
  if (shouldShowIntroDialogue) {
    runtime.dialogue.start(runtime.stage.introDialogue, () => {
      runtime.app.audio.playSfx('dialog_next');
      runtime.showStageNameToast();
    }, { position: 'center' });
  } else {
    runtime.showStageNameToast();
  }

  runtime.app.assets.preloadKeys(getNextStagePrefetchAssetKeys(runtime.stage), { timeout: 1800 });
}
