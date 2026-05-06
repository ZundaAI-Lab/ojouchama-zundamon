/**
 * 責務: 風船ライドの進行状態、待機中ライド、実行中ライド、完了済みID、共通タイマーを保持する。
 * 更新ルール: 状態名とタイマーの所有はここへ集約し、住民挙動・接触判定・演出処理は持たない。
 * 更新ルール: BalloonRideSystem はこのセッションを通して状態を読み書きし、個別フローの詳細は担当モジュールへ委譲する。
 */
export const BALLOON_RIDE_STATE = Object.freeze({
  IDLE: 'idle',
  PREPARING_RIDE_SUPPORT: 'preparingRideSupport',
  STARTING: 'starting',
  RIDING: 'riding',
  HIT: 'hit',
  FAILING: 'failing',
  CLEARING: 'clearing',
});

export class BalloonRideSession {
  constructor() {
    this.completedRideIds = new Set();
    this.reset();
  }

  isActive() {
    return this.state !== BALLOON_RIDE_STATE.IDLE;
  }

  isRideVisualActive() {
    return (
      this.state === BALLOON_RIDE_STATE.STARTING ||
      this.state === BALLOON_RIDE_STATE.RIDING ||
      this.state === BALLOON_RIDE_STATE.HIT ||
      this.state === BALLOON_RIDE_STATE.CLEARING
    );
  }

  isHitVisualActive() {
    return this.state === BALLOON_RIDE_STATE.HIT || this.hitVisualTimer > 0 || this.playerHitVisualTimer > 0;
  }

  isClearing() {
    return this.state === BALLOON_RIDE_STATE.CLEARING;
  }

  isPreparingRideSupport() {
    return this.state === BALLOON_RIDE_STATE.PREPARING_RIDE_SUPPORT;
  }

  beginRideSupportPreparation(ride, anchor) {
    this.state = BALLOON_RIDE_STATE.PREPARING_RIDE_SUPPORT;
    this.pendingRide = ride;
    this.pendingStartAnchor = anchor;
    this.activeRide = null;
  }

  startRide(ride, anchor, config) {
    this.activeRide = ride;
    this.pendingRide = null;
    this.pendingStartAnchor = null;
    this.state = BALLOON_RIDE_STATE.STARTING;
    this.startTimer = config.startDelay;
    this.hitGraceTimer = Math.max(config.startInvincible, config.startDelay + 0.15);
    this.hitVisualTimer = 0;
    this.playerHitVisualTimer = 0;
    this.failTimer = 0;
    this.clearTimer = 0;
    this.startAnchor = anchor;
  }

  beginFailing(duration) {
    this.state = BALLOON_RIDE_STATE.FAILING;
    this.failTimer = duration;
  }

  beginClearing(duration) {
    this.state = BALLOON_RIDE_STATE.CLEARING;
    this.clearTimer = duration;
  }

  tickCommonTimers(dt) {
    this.hitGraceTimer = Math.max(0, this.hitGraceTimer - dt);
    this.hitVisualTimer = Math.max(0, this.hitVisualTimer - dt);
    this.playerHitVisualTimer = Math.max(0, this.playerHitVisualTimer - dt);
  }

  markBalloonHit(config) {
    this.hitVisualTimer = config.hitVisualTime;
    this.hitGraceTimer = config.hitGrace;
    this.state = BALLOON_RIDE_STATE.HIT;
  }

  markPlayerHit(config) {
    this.playerHitVisualTimer = config.hitVisualTime;
  }

  resolveHitState(config) {
    if (this.state === BALLOON_RIDE_STATE.HIT && this.hitVisualTimer <= Math.max(0.04, config.hitVisualTime * 0.42)) {
      this.state = BALLOON_RIDE_STATE.RIDING;
    }
  }

  completeActiveRide() {
    if (this.activeRide?.id) this.completedRideIds.add(this.activeRide.id);
  }

  reset() {
    this.state = BALLOON_RIDE_STATE.IDLE;
    this.activeRide = null;
    this.pendingRide = null;
    this.pendingStartAnchor = null;
    this.startAnchor = null;
    this.startTimer = 0;
    this.hitGraceTimer = 0;
    this.hitVisualTimer = 0;
    this.playerHitVisualTimer = 0;
    this.failTimer = 0;
    this.clearTimer = 0;
  }
}
