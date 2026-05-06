/**
 * 責務: 風船ライド中の住民行動コマンドが参照する最小Contextを作る。
 * 更新ルール: 風船ライド固有の開始/失敗/接触処理は持たず、対象参照・弾追加・画面内判定だけを提供する。
 * 更新ルール: 画面内判定と画面内位置依存の狙いはカメラのX/Y矩形を基準にし、横/上昇ライドのどちらでも同じ可視条件を使う。
 */
import { GAME_VIEW } from '../../config/view.js';

function makeVisibilityRect(source) {
  const w = source.fireGateW || source.drawW || source.w || 32;
  const h = source.fireGateH || source.drawH || source.h || 26;
  return {
    x: source.x + (source.w || w) / 2 - w / 2,
    y: source.y + (source.h || h) / 2 - h / 2,
    w,
    h,
  };
}

export function createRideResidentContext(runtime, rideConfig = null) {
  return {
    runtime,
    elapsed: runtime.elapsed,
    player: runtime.player,
    nano: runtime.nano,
    camera: runtime.camera,
    view: { width: GAME_VIEW.WIDTH, height: GAME_VIEW.HEIGHT },
    rideConfig,
    rideScrollMode: rideConfig?.scrollMode || 'horizontal',
    addProjectile: projectile => runtime.projectiles.push(projectile),
    spawnSparkles: (x, y, color, count) => runtime.spawnSparkles(x, y, color, count),
    playSfx: name => runtime.app?.audio?.playSfx?.(name),
    isFullyOnScreen: (source, margin = 0) => {
      const rect = makeVisibilityRect(source);
      const left = runtime.camera.x + margin;
      const right = runtime.camera.x + GAME_VIEW.WIDTH - margin;
      const top = runtime.camera.y + margin;
      const bottom = runtime.camera.y + GAME_VIEW.HEIGHT - margin;
      return rect.x >= left && rect.x + rect.w <= right && rect.y >= top && rect.y + rect.h <= bottom;
    },
  };
}
