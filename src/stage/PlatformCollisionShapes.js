/**
 * 責務: 足場ギミックの見た目に合わせた衝突用矩形と、プレイヤー/地上Actor用の坂面情報を生成する。
 * 更新ルール: ここは「形状を作る」だけを担当し、足場のactive切替・沈み・傾き更新などの状態変更はPlatformGimmickSystemへ置く。
 * 更新ルール: 斜め足場(spoon/teacupSpin)は水平付近でも通常矩形へ戻さず、常にsurfaceOnly分割+水平/斜めslopeSurfaceとして返す。
 * 更新ルール: PhysicsSystemは返された矩形とslopeSurfaceを読むだけにし、足場種別ごとの形状定義を持たない。
 */
const SEGMENT_WIDTH = 12;
const MIN_SEGMENTS = 4;
const MAX_SEGMENTS = 18;
const SURFACE_THICKNESS = 10;
const SPOON_DEFAULT_TILT = 0.14;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function getAuthoredTiltMagnitude(platform, fallback) {
  return Number.isFinite(platform.tilt) ? Math.max(0, Math.abs(platform.tilt)) : fallback;
}

function getSpoonTilt(platform) {
  const dir = Math.sign(platform.spoonSlopeDir || platform.slopeDir || 1) || 1;
  return Number.isFinite(platform.spoonSlopeAngle)
    ? platform.spoonSlopeAngle
    : (Number.isFinite(platform.visualTilt) ? platform.visualTilt : dir * getAuthoredTiltMagnitude(platform, SPOON_DEFAULT_TILT));
}

function getTeacupTilt(platform) {
  return Number.isFinite(platform.visualTilt) ? platform.visualTilt : 0;
}

function getSurfaceYAtLocalX(platform, angle, localX) {
  const cy = platform.y + platform.h / 2;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  return cy + localX * sin - (platform.h / 2) * cos;
}

function createSlopeSurface(platform, angle) {
  const x0 = platform.x;
  const x1 = platform.x + platform.w;
  const cx = platform.x + platform.w / 2;
  const y0 = getSurfaceYAtLocalX(platform, angle, x0 - cx);
  const y1 = getSurfaceYAtLocalX(platform, angle, x1 - cx);
  return {
    x0,
    y0,
    x1,
    y1,
    angle,
    ownerPlatform: platform,
    slideDir: Math.sign(y1 - y0) || 0,
  };
}

function buildTiltedSurfaceSegments(platform, angle) {
  const surface = createSlopeSurface(platform, angle);
  const segments = clamp(Math.ceil(platform.w / SEGMENT_WIDTH), MIN_SEGMENTS, MAX_SEGMENTS);
  const segmentW = platform.w / segments;
  const cx = platform.x + platform.w / 2;
  const shapes = [];

  for (let i = 0; i < segments; i += 1) {
    const x = platform.x + i * segmentW;
    const localX = (x + segmentW / 2) - cx;
    const topY = getSurfaceYAtLocalX(platform, angle, localX);
    shapes.push({
      x,
      y: topY,
      w: segmentW + 0.75,
      h: SURFACE_THICKNESS,
      active: platform.active,
      kind: platform.kind,
      ownerPlatform: platform,
      surfaceOnly: true,
      slopeSurface: surface,
    });
  }
  return shapes;
}

export function buildPlatformCollisionShapes(platforms) {
  const shapes = [];
  for (const platform of platforms) {
    if (platform.active === false) continue;
    if (platform.kind === 'spoon') {
      shapes.push(...buildTiltedSurfaceSegments(platform, getSpoonTilt(platform)));
      continue;
    }
    if (platform.kind === 'teacupSpin') {
      shapes.push(...buildTiltedSurfaceSegments(platform, getTeacupTilt(platform)));
      continue;
    }
    shapes.push(platform);
  }
  return shapes;
}
