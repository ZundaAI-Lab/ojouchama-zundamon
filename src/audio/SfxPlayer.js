/**
 * 責務: ゲーム側のSE名をSFX_DEFSのレシピへ解決し、短いSE再生を専用プレイヤーへ委譲する。
 * 更新ルール: SEの編集可能データは data/audio/sfxDefs.js、voice発音処理は audio/sfx/ に置く。
 */
import { SFX_DEFS } from '../data/audio/sfxDefs.js';
import { SfxRecipePlayer } from './sfx/sfxRecipePlayer.js';

export class SfxPlayer {
  constructor(getContext, getDestination) {
    this.getContext = getContext;
    this.getDestination = getDestination;
    this.recipePlayer = new SfxRecipePlayer(getContext);
  }

  play(type = 'ui_decide') {
    const ctx = this.getContext();
    const destination = this.getDestination();
    if (!ctx || !destination) return;
    this.recipePlayer.play(SFX_DEFS[type] || SFX_DEFS.ui_decide, destination, ctx.currentTime);
  }
}
