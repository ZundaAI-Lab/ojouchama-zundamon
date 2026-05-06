import { PLATFORM_KINDS } from '../data/platformDefs.js';

export function getPlatformOwner(platform) {
  return platform?.ownerPlatform ?? platform;
}

export function isNormalRespawnPlatform(platform) {
  const owner = getPlatformOwner(platform);
  return !!(
    owner &&
    owner.active !== false &&
    !owner.surfaceOnly &&
    owner.kind === PLATFORM_KINDS.NORMAL &&
    Number.isFinite(owner.x) &&
    Number.isFinite(owner.y) &&
    Number.isFinite(owner.w) &&
    Number.isFinite(owner.h)
  );
}

