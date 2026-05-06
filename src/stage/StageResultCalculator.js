/**
 * 責務: クリア時間や収集結果からランク・リザルト値を計算する。
 * 更新ルール: セーブ更新や画面遷移は行わない。
 */
export class StageResultCalculator {
  static calculateRank(runtime) {
    const routeCount = Array.isArray(runtime.stage.route?.stageIds) ? runtime.stage.route.stageIds.length : 1;
    const timeS = runtime.stage.route?.rankTimeS ?? 95 * routeCount;
    const timeA = runtime.stage.route?.rankTimeA ?? 135 * routeCount;
    const coinTarget = Math.max(12, 10 * routeCount);

    let score = 0;
    if (runtime.elapsed < timeS) score += 2;
    else if (runtime.elapsed < timeA) score += 1;
    if (runtime.damageCount === 0) score += 2;
    else if (runtime.damageCount <= 2) score += 1;
    if (runtime.coins >= coinTarget) score += 1;
    if (score >= 5 && runtime.settings.difficulty === 'royal') return 'Royal S';
    if (score >= 4) return 'S';
    if (score >= 3) return 'A';
    if (score >= 2) return 'B';
    return 'C';
  }
}
