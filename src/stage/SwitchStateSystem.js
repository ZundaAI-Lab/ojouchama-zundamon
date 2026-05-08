/**
 * 責務: スイッチIDごとのON/OFF状態を一元管理する。
 * 更新ルール: 個別ギミックの入力判定や対象オブジェクト操作は持たず、時限ON・ラッチON・同フレーム要求・状態参照だけを担当する。
 */
export class SwitchStateSystem {
  constructor() {
    this.entries = new Map();
  }

  getEntry(switchId) {
    if (!switchId) return null;
    if (!this.entries.has(switchId)) {
      this.entries.set(switchId, { timed: 0, computed: false, hold: false, latched: false });
    }
    return this.entries.get(switchId);
  }

  beginFrame(dt) {
    for (const entry of this.entries.values()) {
      entry.computed = false;
      entry.hold = false;
      entry.timed = Math.max(0, (entry.timed || 0) - dt);
    }
  }

  requestTimedOn(switchId, duration = 1) {
    const entry = this.getEntry(switchId);
    if (!entry) return;
    entry.timed = Math.max(entry.timed || 0, duration);
  }

  requestHoldOn(switchId) {
    const entry = this.getEntry(switchId);
    if (!entry) return;
    entry.hold = true;
  }

  requestLatchedOn(switchId) {
    const entry = this.getEntry(switchId);
    if (!entry) return;
    entry.latched = true;
  }

  setComputedOn(switchId, on) {
    const entry = this.getEntry(switchId);
    if (!entry) return;
    entry.computed = !!on || entry.computed;
  }

  isOn(switchId) {
    const entry = this.entries.get(switchId);
    if (!entry) return false;
    return !!entry.computed || !!entry.hold || !!entry.latched || (entry.timed || 0) > 0;
  }

  getTimedRemaining(switchId) {
    const entry = this.entries.get(switchId);
    return entry ? Math.max(0, entry.timed || 0) : 0;
  }
}
