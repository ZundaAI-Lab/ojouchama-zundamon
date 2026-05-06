/**
 * 責務: clamp/lerp/approach/formatTimeなど数値共通関数を担当する。
 * 更新ルール: 状態を持つ処理やDOM操作を追加しない。
 */
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const approach = (value, target, delta) => {
  if (value < target) return Math.min(value + delta, target);
  if (value > target) return Math.max(value - delta, target);
  return target;
};
export const formatTime = seconds => {
  const s = Math.max(0, seconds | 0);
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const r = String(s % 60).padStart(2, '0');
  return `${m}:${r}`;
};
