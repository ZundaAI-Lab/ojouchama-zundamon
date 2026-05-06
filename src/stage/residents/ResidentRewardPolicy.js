/**
 * 責務: 迷える住民を正気に戻した時の浄化数更新と報酬豆コインの散布生成だけを担当する。
 * 更新ルール: 報酬は直接加算せずRewardCoinDropServiceでアイテム化し、取得判定と所持数反映はItemCollectionServiceへ委譲する。
 * 更新ルール: 通常ステージ/風船ライドの差は resident.rewardCoins と呼び出し側オプションで吸収し、住民更新や弾判定を持たない。
 */
import { RewardCoinDropService } from '../RewardCoinDropService.js';

export class ResidentRewardPolicy {
  static getCoins(resident) {
    if (Number.isFinite(resident?.rewardCoins)) return resident.rewardCoins;
    return resident?.type === 'jelly' || resident?.type === 'macaron' ? 1 : 2;
  }

  static apply(runtime, resident, options = {}) {
    runtime.purified += 1;
    RewardCoinDropService.spawn(runtime, resident, this.getCoins(resident), options.drop || {});
    if (options.sparkCount !== 0) {
      runtime.spawnSparkles?.(
        resident.x + resident.w / 2,
        resident.y + resident.h / 2,
        options.sparkColor || '#97e97f',
        options.sparkCount ?? 12
      );
    }
    if (options.playSfx) runtime.app?.audio?.playSfx?.(options.sfx || 'resident_purify');
  }
}
