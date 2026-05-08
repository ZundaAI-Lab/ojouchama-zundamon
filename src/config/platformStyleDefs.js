/**
 * 責務: 通常床の見た目スタイル候補を定義する。
 * 更新ルール: 保存値・表示名だけを持ち、描画詳細は PlatformRenderer 側で解決する。
 */
export const PLATFORM_STYLE_DEFS = {
  normal: { label: '通常' },
  candyForest: { label: 'お菓子の森' },
  teacupCastle: { label: 'ティーカップ城' },
  ribbonGarden: { label: 'リボン庭園' },
  plushCloud: { label: 'ぬいぐるみ雲の空' },
  picturebookLibrary: { label: 'まよなか絵本館' },
  dreamTree: { label: '夢みる豆の木' },
};

export const PLATFORM_STYLE_ORDER = ['normal', 'candyForest', 'teacupCastle', 'ribbonGarden', 'plushCloud', 'picturebookLibrary', 'dreamTree'];
