/**
 * 責務: サウンドエディタ上の音声定義を、ゲームへ戻せるJSモジュール文字列へ変換する。
 * 更新ルール: DOM操作や検証は持たず、data/audio配下の定義ファイル形式だけを生成する。
 */
import { SFX_CATEGORY_META } from './audioEditorSfxCategories.js';

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).map(key => [key, stableObject(value[key])]));
}

function moduleObject(defs) {
  return JSON.stringify(stableObject(defs), null, 2);
}

function toTrackFilename(id) {
  return `${String(id || 'new-bgm').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'new_bgm'}.js`;
}

export function serializeSfxCategoryDefs(categoryId, defs) {
  const meta = SFX_CATEGORY_META[categoryId] || SFX_CATEGORY_META.ui;
  return `/**\n * 責務: ${meta.exportName} に属するSEレシピだけを定義する。\n * 更新ルール: 再生処理は src/audio/sfx/ に置き、ここではID・表示名・voice配列だけを管理する。\n */\nexport const ${meta.exportName} = ${moduleObject(defs)};\n`;
}

export function serializeSfxDefs(defs) {
  return serializeSfxCategoryDefs('ui', defs);
}

export function serializeBgmTrackDef(track) {
  const title = track?.title || track?.id || 'BGMトラック';
  return `/**\n * 責務: ${title} のBGMトラックイベントデータを定義する。\n * 更新ルール: sound-editor.htmlで編集したsections/instruments/event定義だけを保持し、発音処理や場面解決は別モジュールへ委譲する。\n */\nexport default ${moduleObject(track)};\n`;
}

export function bgmTrackOutputPath(track) {
  return `src/data/audio/bgm/tracks/${toTrackFilename(track?.id)}`;
}

export function sfxCategoryOutputPath(categoryId) {
  return (SFX_CATEGORY_META[categoryId] || SFX_CATEGORY_META.ui).path;
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
