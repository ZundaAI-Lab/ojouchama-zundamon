/**
 * 責務: アプリ起動時にDOMを取得し、GameAppの生成と開始だけを担当する。
 * 更新ルール: 起動順序と依存注入だけに限定し、ゲームルールや画面固有処理を追加しない。
 * 更新ルール: ステージエディタの一時プレビュー起動だけはURL/Storageブリッジから初期Sceneとして注入する。
 */
import { GameApp } from './core/GameApp.js';
import { SCENES } from './config/sceneIds.js';
import { readStageEditorPreview } from './editor/stageEditorPreviewBridge.js';

const app = new GameApp({
  canvas: document.getElementById('game-canvas'),
  hudRoot: document.getElementById('hud-root'),
  uiRoot: document.getElementById('ui-root'),
  fxRoot: document.getElementById('fx-root'),
  debugRoot: document.getElementById('debug-root'),
  shell: document.getElementById('game-shell'),
});

const previewStage = readStageEditorPreview();

app.start(previewStage ? {
  initialScene: SCENES.STAGE,
  initialParams: {
    editorPreview: true,
    stageDefinition: previewStage,
    skipIntro: true,
  },
} : undefined);
