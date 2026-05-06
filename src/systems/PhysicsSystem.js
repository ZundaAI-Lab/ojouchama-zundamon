/**
 * 責務: Actorと足場の移動・衝突解決を担当する。
 * 更新ルール: ゲーム固有の報酬や演出処理を追加しない。surfaceOnly判定は斜め足場の分割上面として扱い、プレイヤー/地上Actorの通常矩形解決には使わない。
 * 更新ルール: slopeSurfaceはプレイヤー/地上Actorの接地安定化だけに使い、足場ギミックの効果はPlatformGimmickSystemへ置く。
 * 更新ルール: 衝突解決は「移動軸」ではなく、直前位置と最小侵入量から解決面を選ぶ。出現/変形した足場で上下が近い場合に左右端へ飛ばさない。
 * 更新ルール: 高速移動は内部サブステップに分割し、最終位置だけの判定によるすり抜けと大きな押し出しを抑える。
 * 更新ルール: 足場の沈み・移動に乗っているActorは、PhysicsSystem内で足場移動量を先に運搬として適用する。ギミック側からActor座標を直接書き換えない。
 * 更新ルール: Actorが用途別のgetBoundsAt/setPositionFromBoundsを持つ場合は、その矩形を地面・壁との接触基準として扱う。
 */
import { intersects } from '../utils/rect.js';
import { WORLD_CONFIG } from '../config/worldConfig.js';

const SLOPE_SNAP_DOWN = 10;
const SLOPE_SNAP_DOWN_STICKY = 8;
const SLOPE_SNAP_UP = 6;
const SLOPE_CROSSING_GRACE = 6;
const SLOPE_FOOT_INSET = 5;
const SLOPE_SURFACE_EDGE_EPSILON = 0.5;
const SLOPE_MAX_SMOOTH_CORRECTION = 6;
const SLOPE_EDGE_SAMPLE_PRIORITY_PENALTY = 8;
const SLOPE_STICKY_PRIORITY_BONUS = 1.5;

const COLLISION_EPSILON = 0.001;
const FACE_CROSS_EPSILON = 0.75;
const SPAWN_VERTICAL_BIAS = 2.5;
const MAX_RESOLVE_PASSES = 4;
const MAX_MOVEMENT_PER_SUBSTEP = 7;

function getSlopeY(surface, x) {
  const width = surface.x1 - surface.x0;
  if (!width) return surface.y0;
  const t = (x - surface.x0) / width;
  return surface.y0 + (surface.y1 - surface.y0) * t;
}

function getFootSamples(bounds) {
  const inset = Math.min(SLOPE_FOOT_INSET, Math.max(1, bounds.w / 3));
  return [
    { x: bounds.x + bounds.w / 2, priorityPenalty: 0 },
    { x: bounds.x + inset, priorityPenalty: SLOPE_EDGE_SAMPLE_PRIORITY_PENALTY },
    { x: bounds.x + bounds.w - inset, priorityPenalty: SLOPE_EDGE_SAMPLE_PRIORITY_PENALTY },
  ];
}

function getActorBounds(actor) {
  if (typeof actor.getBounds === 'function') return actor.getBounds();
  return { x: actor.x, y: actor.y, w: actor.w, h: actor.h };
}

function getActorBoundsAt(actor, x = actor.x, y = actor.y) {
  if (typeof actor.getBoundsAt === 'function') return actor.getBoundsAt(x, y);
  return { x, y, w: actor.w, h: actor.h };
}

function setActorBoundsPosition(actor, boundsX, boundsY) {
  if (typeof actor.setPositionFromBounds === 'function') {
    actor.setPositionFromBounds(boundsX, boundsY);
    return;
  }
  actor.x = boundsX;
  actor.y = boundsY;
}

function getCollisionPrevX(actor) {
  return Number.isFinite(actor.collisionPrevX) ? actor.collisionPrevX : actor.prevX;
}

function getCollisionPrevY(actor) {
  return Number.isFinite(actor.collisionPrevY) ? actor.collisionPrevY : actor.prevY;
}

function rectOf(actor, x = actor.x, y = actor.y) {
  return getActorBoundsAt(actor, x, y);
}

function getPenetration(actor, solid) {
  const bounds = getActorBounds(actor);
  return {
    left: bounds.x + bounds.w - solid.x,
    right: solid.x + solid.w - bounds.x,
    top: bounds.y + bounds.h - solid.y,
    bottom: solid.y + solid.h - bounds.y,
  };
}

function getPreviousFaceCandidates(actor, solid) {
  const prev = rectOf(actor, getCollisionPrevX(actor), getCollisionPrevY(actor));
  const curr = getActorBounds(actor);
  const solidRight = solid.x + solid.w;
  const solidBottom = solid.y + solid.h;
  const prevRight = prev.x + prev.w;
  const prevBottom = prev.y + prev.h;
  const currRight = curr.x + curr.w;
  const currBottom = curr.y + curr.h;
  const verticalOverlapBefore = prev.y < solidBottom - COLLISION_EPSILON && prevBottom > solid.y + COLLISION_EPSILON;
  const horizontalOverlapBefore = prev.x < solidRight - COLLISION_EPSILON && prevRight > solid.x + COLLISION_EPSILON;

  const candidates = [];
  if (actor.vy >= 0 && prevBottom <= solid.y + FACE_CROSS_EPSILON && currBottom >= solid.y) {
    candidates.push('top');
  }
  if (actor.vy <= 0 && prev.y >= solidBottom - FACE_CROSS_EPSILON && curr.y <= solidBottom) {
    candidates.push('bottom');
  }
  if (actor.vx >= 0 && prevRight <= solid.x + FACE_CROSS_EPSILON && currRight >= solid.x && verticalOverlapBefore) {
    candidates.push('left');
  }
  if (actor.vx <= 0 && prev.x >= solidRight - FACE_CROSS_EPSILON && curr.x <= solidRight && verticalOverlapBefore) {
    candidates.push('right');
  }

  // 前サブステップから横方向に重なっていた場合は、左右解決より上下解決を優先できるようにする。
  if (horizontalOverlapBefore) {
    return candidates.filter(face => face === 'top' || face === 'bottom');
  }
  return candidates;
}

function pickSmallestPenetrationFace(penetration) {
  const horizontal = penetration.left < penetration.right
    ? { face: 'left', amount: penetration.left }
    : { face: 'right', amount: penetration.right };
  const vertical = penetration.top < penetration.bottom
    ? { face: 'top', amount: penetration.top }
    : { face: 'bottom', amount: penetration.bottom };

  // 足場が出現/変形してActorに重なったケースでは、上下の侵入量が左右と近いなら上下へ逃がす。
  // 2Dアクションの地面・天井としての直感を優先し、中央から端へ弾く解決を避ける。
  if (vertical.amount <= horizontal.amount + SPAWN_VERTICAL_BIAS) return vertical.face;
  return horizontal.face;
}

function pickCollisionFace(actor, solid) {
  const penetration = getPenetration(actor, solid);
  const previousCandidates = getPreviousFaceCandidates(actor, solid);

  if (previousCandidates.length === 1) return previousCandidates[0];
  if (previousCandidates.length > 1) {
    let best = previousCandidates[0];
    for (const face of previousCandidates) {
      if (penetration[face] < penetration[best]) best = face;
    }
    return best;
  }

  return pickSmallestPenetrationFace(penetration);
}


function getPlatformMotionDelta(platform) {
  if (!platform) return { dx: 0, dy: 0 };
  const dx = Number.isFinite(platform.motionDeltaX) ? platform.motionDeltaX : 0;
  const dy = Number.isFinite(platform.motionDeltaY) ? platform.motionDeltaY : 0;
  return { dx, dy };
}

function hasPlatformMotion(delta) {
  return Math.abs(delta.dx) > COLLISION_EPSILON || Math.abs(delta.dy) > COLLISION_EPSILON;
}

function isValidPenetration(actor, solid) {
  const p = getPenetration(actor, solid);
  return p.left > 0 && p.right > 0 && p.top > 0 && p.bottom > 0;
}

export class PhysicsSystem {
  moveActor(actor, dt, solids, options = {}) {
    const useSlopeSurface = options.useSlopeSurface === true;
    if (useSlopeSurface && !Array.isArray(options.slopeSurfaces)) {
      throw new Error("PhysicsSystem.moveActor requires slopeSurfaces when useSlopeSurface is true.");
    }
    const slopeSurfaces = useSlopeSurface ? options.slopeSurfaces : [];
    const frameWasOnGround = actor.onGround;
    const frameGroundPlatform = actor.groundPlatform;
    const totalDx = actor.vx * dt;
    const totalDy = actor.vy * dt;
    const movement = Math.max(Math.abs(totalDx), Math.abs(totalDy));
    const steps = Math.max(1, Math.min(12, Math.ceil(movement / MAX_MOVEMENT_PER_SUBSTEP)));
    const stepDt = dt / steps;

    // prevX/prevYはゲームプレイ側が「前フレーム位置」として参照するため、物理サブステップでは上書きしない。
    // collisionPrevX/Yだけを各サブステップの直前位置として更新し、衝突面判定へ使う。
    actor.prevX = actor.x;
    actor.prevY = actor.y;
    actor.collisionPrevX = actor.x;
    actor.collisionPrevY = actor.y;

    const platformDelta = getPlatformMotionDelta(frameGroundPlatform);
    if (frameWasOnGround && hasPlatformMotion(platformDelta)) {
      this.applyPlatformCarry(actor, platformDelta, solids, { useSlopeSurface });
    }

    let stickyGround = frameWasOnGround;
    let stickyPlatform = frameGroundPlatform;

    for (let i = 0; i < steps; i += 1) {
      const stepWasOnGround = actor.onGround || stickyGround;
      const stepGroundPlatform = actor.groundPlatform || stickyPlatform;

      actor.collisionPrevX = actor.x;
      actor.collisionPrevY = actor.y;
      actor.onGround = false;
      actor.groundPlatform = null;

      actor.x += actor.vx * stepDt;
      actor.y += actor.vy * stepDt;

      if (useSlopeSurface) {
        this.snapActorToSlope(actor, slopeSurfaces, stepWasOnGround, stepGroundPlatform);
      }

      this.resolveSolidIntersections(actor, solids, { useSlopeSurface });

      if (useSlopeSurface) {
        this.snapActorToSlope(actor, slopeSurfaces, actor.onGround || stepWasOnGround, actor.groundPlatform || stepGroundPlatform);
      }

      stickyGround = actor.onGround;
      stickyPlatform = actor.groundPlatform;
    }

    if (actor.vy > WORLD_CONFIG.FLOOR_KILL_Y) actor.vy = WORLD_CONFIG.FLOOR_KILL_Y;
  }

  applyPlatformCarry(actor, delta, solids, { useSlopeSurface = false } = {}) {
    actor.collisionPrevX = actor.x;
    actor.collisionPrevY = actor.y;
    actor.x += delta.dx;
    actor.y += delta.dy;
    this.resolveSolidIntersections(actor, solids, { useSlopeSurface });
  }

  resolveSolidIntersections(actor, solids, { useSlopeSurface = false } = {}) {
    for (let pass = 0; pass < MAX_RESOLVE_PASSES; pass += 1) {
      let resolved = false;
      for (const solid of solids) {
        if (solid.active === false) continue;
        if (useSlopeSurface && solid.surfaceOnly) continue;
        if (!intersects(getActorBounds(actor), solid) || !isValidPenetration(actor, solid)) continue;

        const face = pickCollisionFace(actor, solid);
        this.applyCollisionFace(actor, solid, face);
        resolved = true;
      }
      if (!resolved) break;
    }
  }

  applyCollisionFace(actor, solid, face) {
    const bounds = getActorBounds(actor);
    if (face === 'top') {
      setActorBoundsPosition(actor, bounds.x, solid.y - bounds.h);
      if (actor.vy > 0) actor.vy = 0;
      actor.onGround = true;
      actor.groundPlatform = solid.ownerPlatform ?? solid;
      return;
    }
    if (face === 'bottom') {
      setActorBoundsPosition(actor, bounds.x, solid.y + solid.h);
      if (actor.vy < 0) actor.vy = 0;
      return;
    }
    if (face === 'left') {
      setActorBoundsPosition(actor, solid.x - bounds.w, bounds.y);
      if (actor.vx > 0) actor.vx = 0;
      return;
    }
    if (face === 'right') {
      setActorBoundsPosition(actor, solid.x + solid.w, bounds.y);
      if (actor.vx < 0) actor.vx = 0;
    }
  }

  snapActorToSlope(actor, slopeSurfaces, wasOnGround, previousGroundPlatform) {
    if (actor.vy < -5) return false;

    const bounds = getActorBounds(actor);
    const previousBounds = rectOf(actor, getCollisionPrevX(actor), getCollisionPrevY(actor));
    const footY = bounds.y + bounds.h;
    const prevFootY = previousBounds.y + previousBounds.h;
    const samples = getFootSamples(bounds);
    let best = null;

    for (const surface of slopeSurfaces) {
      const owner = surface.ownerPlatform;
      const sticky = wasOnGround && previousGroundPlatform === owner;
      if (actor.onGround && actor.groundPlatform !== owner && !sticky) continue;
      const x0 = Math.min(surface.x0, surface.x1) - SLOPE_SURFACE_EDGE_EPSILON;
      const x1 = Math.max(surface.x0, surface.x1) + SLOPE_SURFACE_EDGE_EPSILON;

      for (const sample of samples) {
        if (sample.x < x0 || sample.x > x1) continue;

        const surfaceY = getSlopeY(surface, sample.x);
        const gap = surfaceY - footY;
        const crossed = actor.vy >= 0
          && prevFootY <= surfaceY + SLOPE_CROSSING_GRACE
          && footY >= surfaceY - SLOPE_SNAP_UP;

        // 坂面吸着は「地面を安定してなぞる」ための補正であり、離れたActorを強く引き寄せる処理ではない。
        // 直前から同じ坂に乗っている場合でも、1サブステップで許可する補正量を小さく保つ。
        // 中央の足元を第一候補にし、端サンプルは中央が坂外へ出た時の補助に限定する。
        if (!sticky && !crossed && !wasOnGround) continue;
        const snapDown = sticky ? SLOPE_SNAP_DOWN_STICKY : SLOPE_SNAP_DOWN;
        if (gap > snapDown || gap < -SLOPE_SNAP_UP) continue;
        if (!crossed && Math.abs(gap) > SLOPE_MAX_SMOOTH_CORRECTION) continue;

        const priority = Math.abs(gap)
          + sample.priorityPenalty
          - (sticky ? SLOPE_STICKY_PRIORITY_BONUS : 0)
          - (crossed ? 2 : 0);
        if (!best || priority < best.priority) best = { owner, surfaceY, priority };
      }
    }

    if (!best) return false;
    const currentBounds = getActorBounds(actor);
    setActorBoundsPosition(actor, currentBounds.x, best.surfaceY - currentBounds.h);
    if (actor.vy > 0) actor.vy = 0;
    actor.onGround = true;
    actor.groundPlatform = best.owner;
    return true;
  }
}
