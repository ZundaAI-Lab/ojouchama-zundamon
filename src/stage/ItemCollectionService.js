/**
 * 責務: ステージ内アイテムの取得判定、所持数/回復反映、取得演出、取得SEを共通処理として担当する。
 * 更新ルール: 通常ステージ・特殊ライドのどちらから呼ばれても同じ効果になるよう、アイテム種別ごとの反映をここへ集約する。
 */
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { addStageTeacups } from './StageTeacupInventory.js';

const ITEM_SFX_BY_KIND = Object.freeze({
  coin: 'item_coin',
  largeBeanCoin: 'item_large_coin',
  scone: 'item_scone',
  teacup: 'item_teacup',
  dreamDrop: 'item_dream_drop',
});

function getItemSfx(item) {
  return ITEM_SFX_BY_KIND[item.kind] || 'item_coin';
}

export class ItemCollectionService {
  static collectTouchedItems(runtime, collectors = [runtime.player]) {
    for (const item of runtime.items) {
      if (!item.alive || !this.isCollectable(item)) continue;
      if (!this.isTouchedByAnyCollector(item, collectors)) continue;
      this.collect(runtime, item);
    }
  }

  static collectWithPlayerAndNano(runtime) {
    const collectors = [runtime.player];
    if (runtime.nano?.canCollectItems?.()) collectors.push(runtime.nano);
    this.collectTouchedItems(runtime, collectors);
  }

  static isCollectable(item) {
    if (typeof item.isCollectable === 'function') return item.isCollectable();
    return (item.pickupDelay ?? 0) <= 0;
  }

  static isTouchedByAnyCollector(item, collectors) {
    return collectors.some(collector => collector && CollisionSystem.intersectsActor(collector, item));
  }

  static collect(runtime, item) {
    if (item.effect === 'teacup' && !addStageTeacups(runtime, item.value)) {
      if ((runtime.elapsed ?? 0) >= (runtime.nextTeacupFullNoticeAt ?? 0)) {
        runtime.hud?.showBanner?.('ティーカップは9個まで持てるの');
        runtime.app.audio.playSfx('item_full');
        runtime.nextTeacupFullNoticeAt = (runtime.elapsed ?? 0) + 1.2;
      }
      return;
    }

    item.alive = false;
    if (item.effect === 'coin') runtime.coins += item.value;
    if (item.effect === 'heal') runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + item.value);
    const center = typeof item.getCenter === 'function' ? item.getCenter() : { x: item.x + item.w / 2, y: item.y + item.h / 2 };
    runtime.spawnSparkles(center.x, center.y, '#fff2a2', 8);
    runtime.app.audio.playSfx(getItemSfx(item));
  }
}
