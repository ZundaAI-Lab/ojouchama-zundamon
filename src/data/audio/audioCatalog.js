/**
 * 責務: 音声カタログ共通の表示ラベル補助だけを提供する。
 * 更新ルール: BGM/SFX固有の定義 import は bgmCatalog.js / sfxCatalog.js へ分け、片方だけ使う画面が不要な音声定義を巻き込まないようにする。
 */
export const AUDIO_KIND_LABELS = Object.freeze({ bgm: 'BGM', sfx: 'SE' });

export function getAudioLabel(defs, id) {
  const def = defs[id];
  return def?.title || def?.name ? `${def.title || def.name} (${id})` : id;
}
