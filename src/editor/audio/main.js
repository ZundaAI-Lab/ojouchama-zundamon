/**
 * 責務: sound-editor.htmlのDOM読み込み後にAudioEditorAppを起動する。
 * 更新ルール: サウンドエディタの実装はAudioEditorAppへ集約し、このファイルには起動処理だけを置く。
 */
import { AudioEditorApp } from './AudioEditorApp.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new AudioEditorApp(document.getElementById('audio-editor-root'));
  app.init();
});
