/**
 * 責務: ステージ中ポーズメニュー、ステージ内オプション、チュートリアルダイアログの開閉だけを担当する。
 * 更新ルール: Scene遷移を伴わないUI差し替えはここに集約し、StageRuntime本体へDOM制御を戻さない。
 * 更新ルール: チュートリアル本文や表示条件はTutorialDialogControllerへ委譲し、ここではステージの一時停止復帰だけを管理する。
 */
import { PauseMenuView } from '../../ui/views/PauseMenuView.js';
import { OptionDialogController } from '../../ui/dialogs/OptionDialogController.js';
import { TutorialDialogController } from '../../ui/dialogs/TutorialDialogController.js';
import { SCENES } from '../../config/sceneIds.js';

export function showStagePause(runtime) {
  if (runtime.pauseView || runtime.optionDialog || runtime.tutorialDialog) return;
  runtime.paused = true;
  runtime.app.input.clearGameplay();
  runtime.pauseView = new PauseMenuView({
    app: runtime.app,
    stageName: runtime.stage.name,
    onResume: () => runtime.hidePause(),
    onTutorial: topic => runtime.openTutorial(topic),
    onOptions: () => runtime.openPauseOptions(),
    onGarden: () => runtime.app.sceneManager.change(SCENES.GARDEN),
  });
  runtime.pauseView.mount();
}

export function openStagePauseOptions(runtime) {
  if (runtime.optionDialog || runtime.tutorialDialog) return;
  runtime.app.audio.playSfx('ui_decide');
  runtime.app.input.clearGameplay();
  runtime.pauseView?.destroy();
  runtime.pauseView = null;
  runtime.optionDialog = new OptionDialogController({
    app: runtime.app,
    onClose: () => runtime.closePauseOptions(),
    onTouchSettingsChanged: () => runtime.touchControls?.reloadSettings?.(),
  });
  runtime.optionDialog.open();
}

export function closeStagePauseOptions(runtime) {
  runtime.optionDialog = null;
  runtime.showPause();
}

export function openStageTutorial(runtime, topic = 'player', { origin = 'pause' } = {}) {
  if (runtime.tutorialDialog) return;
  runtime.app.audio.playSfx('ui_decide');
  runtime.app.input.clearGameplay();
  runtime.paused = true;
  runtime.pauseView?.destroy();
  runtime.pauseView = null;
  const autoMode = origin === 'nanoRescueAuto';
  runtime.tutorialDialog = new TutorialDialogController({
    app: runtime.app,
    initialTopic: topic,
    allowedTopics: autoMode ? ['nano'] : null,
    lockedToSingleTopic: autoMode,
    title: autoMode ? 'なのちゃん解説' : null,
    subtitle: autoMode ? '仲間になったなのちゃんの特徴なの。' : null,
    onClose: () => runtime.closeTutorial({ origin }),
  });
  runtime.tutorialDialog.open();
}

export function closeStageTutorial(runtime, { origin = 'pause' } = {}) {
  runtime.tutorialDialog = null;
  if (origin === 'nanoRescueAuto') {
    runtime.paused = false;
    runtime.pendingNanoRescueTutorial = false;
    runtime.app.input.clearGameplay();
    return;
  }
  runtime.showPause();
}

export function destroyStageTutorial(runtime) {
  runtime.tutorialDialog?.destroy?.();
  runtime.tutorialDialog = null;
}

export function hideStagePause(runtime) {
  runtime.paused = false;
  runtime.tutorialDialog?.destroy?.();
  runtime.tutorialDialog = null;
  runtime.pauseView?.destroy();
  runtime.pauseView = null;
}
