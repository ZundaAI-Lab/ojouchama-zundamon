/**
 * 責務: Actor同士の矩形交差判定を担当する。
 * 更新ルール: 衝突後の効果適用はStageCollisionResolverへ任せる。
 * 更新ルール: ダメージ判定が公開されているActorは、通常接触とは別の小さい矩形でも交差判定できるようにする。
 */
import { intersects } from '../utils/rect.js';

function getRect(rectLike) {
  return rectLike?.getBounds ? rectLike.getBounds() : rectLike;
}

export class CollisionSystem {
  static intersectsActor(actor, rectLike) {
    return intersects(actor.getBounds(), getRect(rectLike));
  }

  static intersectsDamageBounds(actor, rectLike) {
    const bounds = actor.getDamageBounds ? actor.getDamageBounds() : actor.getBounds();
    return intersects(bounds, getRect(rectLike));
  }
}
