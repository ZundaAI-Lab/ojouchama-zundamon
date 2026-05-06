/**
 * 責務: SEレシピ全体を解釈し、複数voiceをSfxVoiceSchedulerへ委譲して再生する。
 * 更新ルール: SFX_DEFSのID管理やUI編集処理は持たず、正規化済みレシピの再生だけを扱う。
 */
import { normalizeSfxDefinition } from '../../data/audio/audioSchema.js';
import { SfxVoiceScheduler } from './sfxVoiceScheduler.js';

export class SfxRecipePlayer {
  constructor(getContext) {
    this.getContext = getContext;
    this.voiceScheduler = new SfxVoiceScheduler(getContext);
  }

  play(rawDefinition, destination, startTime = null) {
    const ctx = this.getContext();
    if (!ctx || !destination || !rawDefinition) return;
    const def = normalizeSfxDefinition(rawDefinition, rawDefinition.id || 'sfx');
    const now = Number.isFinite(startTime) ? startTime : ctx.currentTime;
    for (const voice of def.voices) {
      this.voiceScheduler.scheduleVoice(voice, destination, now + (voice.offset || 0), def.gain || 1);
    }
  }
}
