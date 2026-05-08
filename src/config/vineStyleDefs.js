/**
 * 責務: 蔓足場の見た目スタイル候補を定義する。
 * 更新ルール: 保存値・表示名だけを持ち、描画詳細は PlatformRenderer 側で解決する。
 */
export const VINE_STYLE_DEFS = {
  current: { label: '普通の蔓' },
  withered: { label: '枯れた蔓' },
  bean: { label: '豆の蔓' },
  rose: { label: '薔薇の蔓' },
};

export const VINE_STYLE_ORDER = ['current', 'withered', 'bean', 'rose'];
