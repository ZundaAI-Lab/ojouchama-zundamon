/**
 * 責務: ステージ内エリア、到達済みエリア、リスポーン位置の管理を担当する。
 * 更新ルール: Actor生成やクリア処理を持たせず、進行位置管理に限定する。
 * 更新ルール: 外部から渡された復帰地点はエリア既定地点より優先し、ゲームオーバー復帰先の維持をここで担保する。
 */
import { deepClone } from '../utils/object.js';
import { isNormalRespawnPlatform } from './SafeRespawnPlatform.js';

function findSafeRespawn(stage, x) {
  const candidates = (stage.platforms || [])
    .filter(p => isNormalRespawnPlatform(p) && x >= p.x - 12 && x <= p.x + p.w + 12)
    .sort((a, b) => a.y - b.y);
  const platform = candidates[candidates.length - 1];
  return platform ? { x, y: platform.y - 42 } : { ...stage.playerStart };
}

function buildDefaultAreas(stage) {
  const bossStartX = stage.boss ? Math.max(0, stage.boss.x - 180) : Math.floor(stage.width * 0.78);
  const areaWidth = Math.max(1, Math.floor(bossStartX / 3));
  return [
    { id: 'area_1', name: 'エリア1', startX: 0, endX: areaWidth, respawn: stage.playerStart },
    { id: 'area_2', name: 'エリア2', startX: areaWidth, endX: areaWidth * 2, respawn: findSafeRespawn(stage, areaWidth + 24) },
    { id: 'area_3', name: 'エリア3', startX: areaWidth * 2, endX: bossStartX, respawn: findSafeRespawn(stage, areaWidth * 2 + 24) },
    { id: 'boss', name: 'ボス', startX: bossStartX, endX: stage.width, respawn: findSafeRespawn(stage, bossStartX + 24) },
  ];
}

export class StageAreaManager {
  constructor(stage, params = {}, initialSpawn = stage.playerStart) {
    this.stage = stage;
    this.areas = this.normalizeAreas(stage);
    this.currentAreaIndex = this.getIndexAt(initialSpawn.x);
    this.highestAreaIndexReached = Math.max(params.startAreaIndex || 0, this.currentAreaIndex);
    this.respawnPoint = deepClone(params.respawnPoint || this.areas[this.highestAreaIndexReached]?.respawn || initialSpawn);
  }

  normalizeAreas(stage) {
    const sourceAreas = Array.isArray(stage.areas) && stage.areas.length > 0 ? stage.areas : buildDefaultAreas(stage);
    return sourceAreas.map((area, index) => ({
      id: area.id || `area_${index + 1}`,
      name: area.name || (index >= 3 ? 'ボス' : `エリア${index + 1}`),
      startX: Number.isFinite(area.startX) ? area.startX : 0,
      endX: Number.isFinite(area.endX) ? area.endX : stage.width,
      respawn: area.respawn || stage.playerStart,
    })).sort((a, b) => a.startX - b.startX);
  }

  getIndexAt(x) {
    let found = 0;
    for (let i = 0; i < this.areas.length; i += 1) {
      const area = this.areas[i];
      if (x >= area.startX && x < area.endX) {
        found = i;
        break;
      }
      if (x >= area.startX) found = i;
    }
    return Math.max(0, Math.min(this.areas.length - 1, found));
  }

  getCurrentArea() {
    return this.areas[this.currentAreaIndex] || this.areas[0];
  }

  isBossArea() {
    const area = this.getCurrentArea();
    return !!area && (area.id === 'boss' || this.stage.areaRole === 'boss');
  }

  updateByPlayer(player, onAdvance, onMoveOnly) {
    const centerX = player.x + player.w / 2;
    const nextAreaIndex = this.getIndexAt(centerX);
    const previousAreaIndex = this.currentAreaIndex;
    this.currentAreaIndex = nextAreaIndex;

    if (nextAreaIndex > this.highestAreaIndexReached) {
      this.highestAreaIndexReached = nextAreaIndex;
      const area = this.areas[nextAreaIndex];
      this.respawnPoint = deepClone(area.respawn || { x: player.x, y: player.y });
      onAdvance?.(area, nextAreaIndex);
    } else if (nextAreaIndex !== previousAreaIndex) {
      onMoveOnly?.(this.getCurrentArea(), nextAreaIndex);
    }
  }
}
