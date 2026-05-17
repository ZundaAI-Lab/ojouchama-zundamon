/**
 * 責務: ステージ復帰時のScene再入場パラメータを作る。
 * 更新ルール: リトライ条件が増えた場合もStageRuntime本体ではなく、このファイルでrouteProgressと復帰地点を調整する。
 * 更新ルール: 中継ポイントIDは復帰地点の見た目復元にだけ渡し、接触判定や登録処理はStageCheckpointServiceへ置く。
 * 更新ルール: 詳細負荷レポート取得中のリトライはretry理由で現在ステージ分を確定する。
 */
import { SCENES } from '../../config/sceneIds.js';

export function retryFromStageRespawn(runtime) {
  runtime.performanceReportFinishReason = 'retry';
  runtime.app.performanceReporter?.recordEvent('stage.retryRequested', { elapsed: runtime.elapsed });
  const resumeBossBattle = !!(runtime.boss && runtime.bossBattleStarted && !runtime.bossDefeatHandled);
  runtime.app.sceneManager.change(SCENES.STAGE, {
    stageId: runtime.stage.id,
    routeProgress: runtime.routeProgressBase,
    skipIntro: true,
    skipBossDialogue: resumeBossBattle || runtime.bossDialogueShown,
    skipBossDefeatDialogue: runtime.bossDefeatDialogueShown,
    resumeBossBattle,
    respawnPoint: resumeBossBattle ? (runtime.bossBattleRespawnPoint || runtime.respawnPoint) : runtime.respawnPoint,
    startAreaIndex: runtime.highestAreaIndexReached,
    activeCheckpointId: runtime.activeCheckpointId,
  });
}
