/**
 * 責務: 風足場の見た目スタイル候補を定義する。
 * 更新ルール: 風の効果は kind: 'wind' で共通化し、見た目差分だけを windStyle に集約する。
 */
export const WIND_STYLE_DEFS = {
  dream: { label: '夢風' },
  ribbon: { label: 'リボン風' },
};

export const WIND_STYLE_ORDER = ['dream', 'ribbon'];
