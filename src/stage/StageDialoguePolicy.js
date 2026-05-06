/**
 * 責務: セーブ済みクリア状況から、ステージ内会話イベントの再生可否を判定する。
 * 更新ルール: 会話本文や再生処理は持たず、SaveSystemの保存形式とstage.routeのIDだけを参照する。
 */
function uniqueIds(ids) {
  return [...new Set(ids.filter(Boolean))];
}

export class StageDialoguePolicy {
  static getClearRecordIds(stage) {
    return uniqueIds([
      stage?.route?.saveStageId,
      stage?.route?.startStageId,
      stage?.id,
    ]);
  }

  static isCleared(saveData, stage) {
    const ids = this.getClearRecordIds(stage);
    const clearedStages = Array.isArray(saveData?.clearedStages) ? saveData.clearedStages : [];
    const stageRecords = saveData?.stages || {};
    return ids.some(id => clearedStages.includes(id) || stageRecords[id]?.cleared);
  }

  static shouldSkipStageDialogue(saveData, stage) {
    return this.isCleared(saveData, stage);
  }
}
