/**
 * 責務: ステージIDから正規化済みステージ定義へアクセスする集約を担当する。
 * 更新ルール: 画面切り替え式の実ステージデータはdata/stages配下へ置き、共通形式への補完はstageSchemaへ集約する。
 */
import { createStageRouteMap, STAGE_ROUTES } from './stages/routes/index.js';
import SWITCH_TEST_STAGE from './stages/switch_test_lab.js';
import { normalizeStageDefinition } from './stageSchema.js';

export const STAGES = {
  ...createStageRouteMap(),
  switch_test_lab: normalizeStageDefinition(SWITCH_TEST_STAGE),
};
export { STAGE_ROUTES };
