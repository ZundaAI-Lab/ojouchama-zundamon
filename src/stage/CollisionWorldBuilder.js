/**
 * 責務: 1物理ステップ内で参照する衝突ワールドのスナップショットを生成する。
 * 更新ルール: StageRuntimeは各物理ステップの開始時にこのスナップショットを1回だけ作り、処理中に判定形状を再生成しない。
 * 更新ルール: 用途別(player/resident/projectile/item/fitCheck)の公開配列はここだけで作る。ActorやPhysicsSystemへ足場種別依存を持ち込まない。
 * 更新ルール: 形状生成は参照用データを返すだけに限定し、足場状態の更新・演出・報酬処理は行わない。
 */
import { buildPlatformCollisionShapes } from './PlatformCollisionShapes.js';
import { buildSwitchTargetCollisionShapes } from './SwitchTargetCollisionShapes.js';

function collectSlopeSurfaces(solids) {
  const surfaces = [];
  const seen = new Set();
  for (const solid of solids) {
    if (!solid.slopeSurface || seen.has(solid.slopeSurface)) continue;
    seen.add(solid.slopeSurface);
    surfaces.push(solid.slopeSurface);
  }
  return Object.freeze(surfaces);
}

function freezeCopy(solids) {
  return Object.freeze([...solids]);
}

export class CollisionWorldBuilder {
  static build(runtime) {
    const blockingSolids = buildPlatformCollisionShapes(runtime.stage.platforms);
    blockingSolids.push(...buildSwitchTargetCollisionShapes(runtime));

    // 現在のゲームルールでは各用途とも同じ遮蔽物を見る。
    // 用途別配列をここで確定し、呼び出し側が独自に足場形状を作り直す経路を残さない。
    const playerSolids = freezeCopy(blockingSolids);
    const residentSolids = freezeCopy(blockingSolids);
    const projectileSolids = freezeCopy(blockingSolids);
    const itemSolids = freezeCopy(blockingSolids);
    const fitCheckSolids = freezeCopy(blockingSolids);

    return Object.freeze({
      playerSolids,
      residentSolids,
      projectileSolids,
      itemSolids,
      fitCheckSolids,
      slopeSurfaces: collectSlopeSurfaces(playerSolids),
    });
  }
}
