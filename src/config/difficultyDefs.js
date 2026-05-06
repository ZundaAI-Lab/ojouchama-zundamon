/**
 * 責務: 難易度ごとのプレイヤー体力・通常住民補正・ボスHP倍率を定義する。
 * 更新ルール: 実行時状態やDOM操作を置かず、難易度仕様の変更時はPlayer/ResidentFactory/StageFactoryの適用箇所を同時に確認する。
 */
export const DIFFICULTY_DEFS = {
  fluffy: {
    label: 'ふんわり',
    damageScale: 0.75,
    residentSpeed: 0.85,
    playerBaseHp: 5,
    residentHpBonus: -1,
  },
  normal: {
    label: 'おでかけ',
    damageScale: 1,
    residentSpeed: 1,
    playerBaseHp: 4,
    residentHpBonus: 0,
  },
  royal: {
    label: 'ロイヤル',
    damageScale: 1.25,
    residentSpeed: 1.15,
    playerBaseHp: 3,
    residentHpBonus: 1,
  },
};
