/**
 * 責務: ステージクリア時のセーブ反映、SE、リザルト遷移を担当する。
 * 更新ルール: ランク計算の詳細はStageResultCalculatorへ委譲する。
 * 更新ルール: クリア済みステージの再挑戦では、保存・遷移は維持して会話イベントだけを省略する。
 * 更新ルール: 夢のしずく取得はステージゴール時にだけ確定保存し、通常エリアは取得保留、ボスエリアはゴール到達を獲得扱いにする。
 */
import { SCENES } from '../config/sceneIds.js';
import { StageResultCalculator } from './StageResultCalculator.js';
import { StageRouteProgress } from './StageRouteProgress.js';

function collectDreamDropStageIdsForClear(runtime) {
  if (runtime.stage.testStage) return [];
  const ids = new Set(runtime.pendingDreamDropStageIds || []);
  if (runtime.stage.areaRole === 'boss') ids.add(runtime.stage.id);
  return [...ids];
}

export class StageClearService {
  static clear(runtime) {
    if (runtime.clearStarted) return;
    runtime.clearStarted = true;
    runtime.app.input.clearGameplay();
    const dreamDropStageIds = collectDreamDropStageIdsForClear(runtime);
    if (dreamDropStageIds.length) {
      runtime.saveData = runtime.app.save.recordDreamDrops(dreamDropStageIds);
    }

    const nextStageId = runtime.stage.route?.nextStageId;
    runtime.app.audio.playSfx(nextStageId ? 'stage_clear_jingle' : 'route_clear_jingle');
    if (nextStageId) {
      const routeProgress = StageRouteProgress.capture(runtime);
      const goNext = () => runtime.app.sceneManager.change(SCENES.STAGE, { stageId: nextStageId, routeProgress });
      if (!runtime.skipDialogueEvents && Array.isArray(runtime.stage.areaClearDialogue) && runtime.stage.areaClearDialogue.length > 0) {
        runtime.dialogue.start(runtime.stage.areaClearDialogue, goNext, { mode: 'center' });
        return;
      }
      goNext();
      return;
    }

    if (runtime.stage.testStage) {
      const goTitle = () => runtime.app.sceneManager.change(SCENES.TITLE);
      if (!runtime.skipDialogueEvents && runtime.stage.clearDialogue) {
        runtime.dialogue.start(runtime.stage.clearDialogue, goTitle, { mode: 'center' });
        return;
      }
      goTitle();
      return;
    }

    const result = {
      clearTime: runtime.elapsed,
      coins: runtime.coins,
      teacups: runtime.teacupsCollected || 0,
      purified: runtime.purified,
      damageCount: runtime.damageCount,
      rank: StageResultCalculator.calculateRank(runtime),
    };

    const saveStageId = runtime.stage.route?.saveStageId || runtime.stage.id;
    const saveStage = { ...runtime.stage, id: saveStageId };
    const record = runtime.app.save.recordStageClear(saveStage, result);
    const finalResult = { ...result, bestTime: record.bestTime };
    const ending = !!runtime.stage.route?.ending;

    if (!runtime.skipDialogueEvents && runtime.stage.clearDialogue) {
      runtime.dialogue.start(runtime.stage.clearDialogue, () => {
        runtime.app.sceneManager.change(SCENES.RESULT, { result: finalResult, stageId: runtime.stage.route?.startStageId || runtime.stage.id, ending });
      }, { mode: 'center' });
      return;
    }

    runtime.app.sceneManager.change(SCENES.RESULT, { result: finalResult, stageId: runtime.stage.route?.startStageId || runtime.stage.id, ending });
  }
}
