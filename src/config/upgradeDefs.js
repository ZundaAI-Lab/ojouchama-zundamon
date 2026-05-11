/**
 * 責務: ショップ強化定義を管理する。
 * 更新ルール: 設定値だけを置き、実行時ロジックやDOM操作を追加しない。
 * 更新ルール: 表示条件は requiresStoryFlag などの宣言値に留め、判定と購入制御は ShopScene/SaveSystem 側で行う。
 */
export const STORAGE_KEY = 'ojouchama_zundamon_save_v2';

export const UPGRADE_DEFS = {
  maxHp: {
    label: 'ハートのブローチ',
    desc: '最大HP +1',
    max: 2,
    cost: [8, 14],
    icon: 'icon_heart_brooch',
  },
  magic: {
    label: '枝豆のステッキ',
    desc: '魔法の射程と威力を強化',
    max: 2,
    cost: [10, 18],
    icon: 'icon_bean_staff',
  },
  bow: {
    label: 'レースの手袋',
    desc: 'おじぎの待ち時間を短縮',
    max: 2,
    cost: [8, 16],
    icon: 'icon_lace_gloves',
  },
  tea: {
    label: 'ロイヤルティーセット',
    desc: 'ティータイム回復量を強化',
    max: 2,
    cost: [9, 17],
    icon: 'icon_royal_tea_set',
  },
  nanoMagicRibbon: {
    label: 'まほうのリボン',
    desc: 'なのちゃんが時々まほうで援護します',
    max: 1,
    cost: [8],
    icon: 'icon_magic_ribbon',
    requiresStoryFlag: 'nanoJoined',
  },
  nanoSugar: {
    label: 'ずんだシュガー',
    desc: 'なのちゃんの援護まほうの威力 +1',
    max: 1,
    cost: [12],
    icon: 'icon_zunda_sugar',
    requiresStoryFlag: 'nanoJoined',
  },
  nanoPowder: {
    label: 'なのだパウダー',
    desc: 'なのちゃんの援護まほうの発射間隔を短縮',
    max: 1,
    cost: [12],
    icon: 'icon_nanoda_powder',
    requiresStoryFlag: 'nanoJoined',
  },
};
