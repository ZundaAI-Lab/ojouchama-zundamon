/**
 * 責務: ステージゴールの種類、画像キー、描画サイズ、当たり判定サイズの正本を担当する。
 * 更新ルール: ゴール種類追加時はここへ定義を追加し、Actor/Renderer/Editorへ個別サイズを持ち込まない。
 */
export const GOAL_DEFAULT_VARIANT = 'default';

export const GOAL_DEFS = Object.freeze({
  default: Object.freeze({
    variant: 'default',
    label: '夢のしずく',
    imageKey: null,
    hitbox: Object.freeze({ w: 22, h: 42 }),
    draw: Object.freeze({ w: 28, h: 30, offsetX: 0, offsetY: 0 }),
  }),
  sign_arrow: Object.freeze({
    variant: 'sign_arrow',
    label: '木の矢印看板',
    imageKey: 'goal_sign_arrow',
    hitbox: Object.freeze({ w: 38, h: 56 }),
    draw: Object.freeze({ w: 50, h: 70, offsetX: 0, offsetY: 0 }),
  }),
  sign_board: Object.freeze({
    variant: 'sign_board',
    label: 'GOAL看板',
    imageKey: 'goal_sign_board',
    hitbox: Object.freeze({ w: 56, h: 56 }),
    draw: Object.freeze({ w: 75, h: 70, offsetX: 0, offsetY: 0 }),
  }),
});

export const GOAL_VARIANT_OPTIONS = Object.freeze(Object.values(GOAL_DEFS).map(def => ({
  value: def.variant,
  label: def.label,
})));

export function isKnownGoalVariant(variant) {
  return !!GOAL_DEFS[variant || GOAL_DEFAULT_VARIANT];
}

export function resolveGoalDef(variant = GOAL_DEFAULT_VARIANT) {
  return GOAL_DEFS[variant] || GOAL_DEFS[GOAL_DEFAULT_VARIANT];
}
