/**
 * 責務: エディタ用ステージデータをJSON/JSファイル文字列へ変換する。
 * 更新ルール: UI操作や検証は持たず、出力形式とファイル名推定だけを担当する。
 */
import { createEditorStage, cloneEditorValue } from './stageEditorSchema.js';

const OMIT_EDITOR_ONLY_KEYS = new Set(['schemaVersion']);

function stripEditorOnly(value) {
  if (Array.isArray(value)) return value.map(stripEditorOnly);
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const [key, child] of Object.entries(value)) {
    if (OMIT_EDITOR_ONLY_KEYS.has(key)) continue;
    result[key] = stripEditorOnly(child);
  }
  return result;
}

export function createSerializableStage(stage) {
  return stripEditorOnly(createEditorStage(cloneEditorValue(stage)));
}

export function serializeStageToJson(stage) {
  return JSON.stringify(createSerializableStage(stage), null, 2);
}

export function serializeStageToJsModule(stage) {
  const json = serializeStageToJson(stage);
  return `/**\n * 責務: ${stage.name || stage.id} のステージデータを定義する。\n * 更新ルール: ステージエディタで共通的に扱えるよう、全エリアで同一形式のStageFactoryが読み取れるデータを維持する。\n */\nconst stage = ${json};\n\nexport default stage;\n`;
}

export function resolveStageSourcePath(stage) {
  if (stage.id === 'switch_test_lab' || stage.testStage) return 'src/data/stages/switch_test_lab.js';
  const routeId = stage.route?.id || stage.id.replace(/_(area_[123]|boss)$/u, '');
  const areaRole = stage.areaRole || (stage.id.endsWith('_boss') ? 'boss' : 'area_1');
  const fileName = areaRole === 'boss' ? 'boss.js' : `${areaRole}.js`;
  return `src/data/stages/${routeId}/${fileName}`;
}

export function createStageDownloadName(stage, ext = 'js') {
  const base = resolveStageSourcePath(stage).split('/').pop()?.replace(/\.js$/u, '') || stage.id || 'stage';
  return `${base}.${ext}`;
}

export function parseStageJson(text) {
  const parsed = JSON.parse(text);
  return createEditorStage(parsed);
}
