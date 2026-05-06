/**
 * 責務: ステージ実行中のティーカップ所持数変更、ステージ内入手数集計、SaveSystemへの同期を担当する。
 * 更新ルール: 入力判定・お茶効果・HUD表示は持ち込まず、所持数の増減・入手数集計・永続化だけを扱う。
 */
import { clampTeacups } from '../config/teacupInventory.js';

export function initializeStageTeacups(runtime) {
  runtime.teacups = clampTeacups(runtime.saveData?.teacups);
}

export function addStageTeacups(runtime, amount = 1) {
  const result = runtime.app.save.addTeacups(amount);
  runtime.saveData = result.save;
  runtime.teacups = result.save.teacups;
  const gained = Math.max(0, (result.after ?? runtime.teacups) - (result.before ?? runtime.teacups));
  if (gained > 0) {
    runtime.teacupsCollected = (runtime.teacupsCollected || 0) + gained;
    if (runtime.progress) runtime.progress.teacupsCollected = runtime.teacupsCollected;
  }
  return result.ok;
}

export function consumeStageTeacup(runtime) {
  const result = runtime.app.save.consumeTeacup();
  runtime.saveData = result.save;
  runtime.teacups = result.save.teacups;
  return result.ok;
}
