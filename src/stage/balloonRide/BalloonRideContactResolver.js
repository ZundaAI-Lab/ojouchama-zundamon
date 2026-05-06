/**
 * 責務: 風船ライド中の障害物・迷える住民・住民弾と、プレイヤー本体/風船との接触結果を解決する。
 * 更新ルール: 矩形判定と接触結果の分岐だけを担当し、風船在庫・状態遷移・演出生成は呼び出し元の処理へ委譲する。
 * 更新ルール: プレイヤー本体と風船が同時に触れた場合は、見た目の納得感を優先してプレイヤー本体ヒットを優先する。
 */
import { intersects } from '../../utils/rect.js';

function makeRectLike(source, fallbackW = 28, fallbackH = 28) {
  return {
    x: source.x,
    y: source.y,
    w: source.w || fallbackW,
    h: source.h || fallbackH,
  };
}

export class BalloonRideContactResolver {
  constructor(runtime, balloonModel) {
    this.runtime = runtime;
    this.balloonModel = balloonModel;
  }

  resolve({ active, hazards, residents, shots, dt, hitGraceTimer, balloonCount, config, elapsed, onPlayerHit, onBalloonHit }) {
    if (!active) return null;

    for (const hazard of hazards) {
      hazard.age += dt;
      const result = this.resolveOne(makeRectLike(hazard, 40, 32), hazard.kind || 'hazard', {
        hitGraceTimer,
        balloonCount,
        config,
        elapsed,
        onPlayerHit,
        onBalloonHit,
      });
      if (result) return result;
    }

    for (const resident of residents) {
      const result = this.resolveOne(makeRectLike(resident, resident.w, resident.h), resident.type || 'resident', {
        hitGraceTimer,
        balloonCount,
        config,
        elapsed,
        onPlayerHit,
        onBalloonHit: reason => {
          resident.alive = false;
          onBalloonHit(reason);
        },
      });
      if (result) return result;
    }

    for (const shot of shots) {
      const reason = shot.kind || 'windShot';
      const result = this.resolveOne(makeRectLike(shot, shot.w, shot.h), reason, {
        hitGraceTimer,
        balloonCount,
        config,
        elapsed,
        onPlayerHit: sourceRect => {
          shot.alive = false;
          onPlayerHit(sourceRect);
        },
        onBalloonHit: balloonReason => {
          shot.alive = false;
          onBalloonHit(balloonReason);
        },
      });
      if (result) return result;
    }

    return null;
  }

  resolveOne(sourceRect, reason, context) {
    const playerHitbox = this.balloonModel.getPlayerRideHitbox(this.runtime.player);
    if (intersects(playerHitbox, sourceRect)) {
      context.onPlayerHit(sourceRect);
      return { type: 'player', reason };
    }

    if (context.hitGraceTimer > 0) return null;
    const balloonHitbox = this.balloonModel.getHitbox(this.runtime.player, context.balloonCount, context.config, context.elapsed);
    if (!balloonHitbox || !intersects(balloonHitbox, sourceRect)) return null;

    context.onBalloonHit(reason);
    return { type: 'balloon', reason };
  }
}
