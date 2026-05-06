/**
 * 責務: editor.htmlのDOM読み込み後にStageEditorAppを起動する。
 * 更新ルール: エディタ機能の実装はStageEditorAppへ集約し、このファイルには起動処理だけを置く。
 */
import { StageEditorApp } from './StageEditorApp.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new StageEditorApp(document.getElementById('stage-editor-root'));
  app.init();
});
