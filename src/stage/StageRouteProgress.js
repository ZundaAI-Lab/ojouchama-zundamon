/**
 * 責務: 画面切り替え式エリア間で引き継ぐスコア・収集状況の値を扱う。
 * 更新ルール: セーブ保存やScene遷移は持たせず、値の整形に限定する。
 */
const EMPTY_PROGRESS = Object.freeze({
  elapsed: 0,
  coins: 0,
  purified: 0,
  damageCount: 0,
  teacupsCollected: 0,
});

function toFiniteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export class StageRouteProgress {
  static fromParams(value) {
    return {
      elapsed: toFiniteNumber(value?.elapsed),
      coins: toFiniteNumber(value?.coins),
      purified: toFiniteNumber(value?.purified),
      damageCount: toFiniteNumber(value?.damageCount),
      teacupsCollected: toFiniteNumber(value?.teacupsCollected),
    };
  }

  static empty() {
    return { ...EMPTY_PROGRESS };
  }

  static capture(runtime) {
    return {
      elapsed: toFiniteNumber(runtime.elapsed),
      coins: toFiniteNumber(runtime.coins),
      purified: toFiniteNumber(runtime.purified),
      damageCount: toFiniteNumber(runtime.damageCount),
      teacupsCollected: toFiniteNumber(runtime.teacupsCollected),
    };
  }

}
