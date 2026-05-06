/**
 * 責務: editor.htmlからゲーム本体へ一時プレビューステージを受け渡す。
 * 更新ルール: localStorageキーとURLパラメータの扱いだけを担当し、エディタUIやRuntime初期化処理を持ち込まない。
 */
import { createEditorStage, cloneEditorValue } from './stageEditorSchema.js';

export const STAGE_EDITOR_PREVIEW_STORAGE_KEY = 'ojouchama_stage_editor_preview';
export const STAGE_EDITOR_PREVIEW_QUERY = 'editorPreview';

export function writeStageEditorPreview(stage) {
  const previewStage = createEditorStage(cloneEditorValue(stage));
  previewStage.testStage = true;
  previewStage.route = null;
  localStorage.setItem(STAGE_EDITOR_PREVIEW_STORAGE_KEY, JSON.stringify(previewStage));
  return previewStage;
}

export function readStageEditorPreview(search = window.location.search) {
  const params = new URLSearchParams(search);
  if (params.get(STAGE_EDITOR_PREVIEW_QUERY) !== '1') return null;
  try {
    const raw = localStorage.getItem(STAGE_EDITOR_PREVIEW_STORAGE_KEY);
    if (!raw) return null;
    const stage = createEditorStage(JSON.parse(raw));
    stage.testStage = true;
    stage.route = null;
    return stage;
  } catch {
    return null;
  }
}
