/**
 * 責務: ライド演出で必要ななのちゃんの帰還待ち、頭乗り維持、単体描画の一時非表示状態を担当する。
 * 更新ルール: 風船ライド固有の開始/失敗/クリア判定は持たず、NanoCompanionの公開APIだけを使ってライド側へ準備完了状態を返す。
 */
import { NANO_STATES } from '../../config/nanoConfig.js';

export class NanoRideSupport {
  constructor() {
    this.hideNanoVisual = false;
  }

  needsPreparation(runtime) {
    const nano = runtime?.nano;
    return !!nano && nano.state !== NANO_STATES.HEAD;
  }

  beginPreparation(runtime) {
    runtime?.nano?.startReturn?.();
  }

  updatePreparation(runtime, dt) {
    const nano = runtime?.nano;
    nano?.updateMotion?.(dt, runtime);
    return !nano || nano.state === NANO_STATES.HEAD;
  }

  mountToPlayer(runtime, dt = 0) {
    const nano = runtime?.nano;
    if (!nano) return;
    if (nano.state !== NANO_STATES.HEAD) nano.state = NANO_STATES.HEAD;
    nano.attachToPlayer?.(runtime.player);
    nano.updateMotion?.(dt, runtime);
  }

  setRideVisualHidden(hidden) {
    this.hideNanoVisual = !!hidden;
  }

  shouldHideNanoVisual() {
    return this.hideNanoVisual;
  }

  reset() {
    this.hideNanoVisual = false;
  }
}
