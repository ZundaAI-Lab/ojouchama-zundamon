/**
 * 責務: 音量・周波数で共有する数値補助を提供する。
 * 更新ルール: WebAudioノードを生成せず、状態を持たない定数と純粋関数だけを置く。
 * BGM_OUTPUT_GAIN/SFX_OUTPUT_GAINはスライダー値ではなく、BGM/SE間の基準音量差を補正するマスター係数として扱う。
 */
export const DEFAULT_BGM_VOLUME = 0.7;
export const DEFAULT_SFX_VOLUME = 0.75;
export const BGM_OUTPUT_GAIN = 0.22;
export const SFX_OUTPUT_GAIN = 3;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
