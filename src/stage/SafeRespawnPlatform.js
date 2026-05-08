import { PLATFORM_KINDS } from '../data/platformDefs.js';

export function getPlatformOwner(platform) {
  return platform?.ownerPlatform ?? platform;
}

const NORMAL_RESPAWN_PLATFORM_KINDS = new Set([
  PLATFORM_KINDS.NORMAL,
  PLATFORM_KINDS.VINE_PLATFORM,
]);

export function isNormalRespawnPlatform(platform) {
  const owner = getPlatformOwner(platform);
  return !!(
    owner &&
    owner.active !== false &&
    !owner.surfaceOnly &&
    NORMAL_RESPAWN_PLATFORM_KINDS.has(owner.kind) &&
    Number.isFinite(owner.x) &&
    Number.isFinite(owner.y) &&
    Number.isFinite(owner.w) &&
    Number.isFinite(owner.h)
  );
}

