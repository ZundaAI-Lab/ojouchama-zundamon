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
  },
  magic: {
    label: 'お豆のステッキ',
    desc: '魔法の射程と威力を強化',
    max: 2,
    cost: [10, 18],
  },
  bow: {
    label: '上品なリボン',
    desc: 'おじぎの待ち時間を短縮',
    max: 2,
    cost: [8, 16],
  },
  tea: {
    label: 'ロイヤルティーセット',
    desc: 'ティータイム回復量を強化',
    max: 2,
    cost: [9, 17],
  },
  nanoMagicBud: {
    label: 'まほうの芽',
    desc: 'なのちゃんが時々まほうで援護します',
    max: 1,
    cost: [8],
    requiresStoryFlag: 'nanoJoined',
  },
  nanoSugar: {
    label: 'ずんだシュガー',
    desc: 'なのちゃんの援護まほうの威力 +1',
    max: 1,
    cost: [12],
    requiresStoryFlag: 'nanoJoined',
  },
  nanoRibbon: {
    label: 'なのだリボン',
    desc: 'なのちゃんの援護まほうの発射間隔を短縮',
    max: 1,
    cost: [12],
    requiresStoryFlag: 'nanoJoined',
  },
};
