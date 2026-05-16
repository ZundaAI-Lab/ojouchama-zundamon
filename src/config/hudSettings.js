/**
 * 責務: HUD外観設定の初期値・正規化・プリセットを一元管理する。
 * 更新ルール: DOM反映やHUD生成は持たず、保存値として扱う色と不透明度だけを扱う。
 */
export const HUD_PANEL_COLOR_PRESETS = [
  { value: '#fffdf7', label: 'ミルク白' },
  { value: '#f4fff1', label: 'ミント' },
  { value: '#fff1f8', label: 'さくら' },
  { value: '#f6f0ff', label: 'ラベンダー' },
  { value: '#fff7dc', label: 'ハニー' },
  { value: '#eef8ff', label: 'ソーダ' },
];

export const DEFAULT_HUD_PANEL_COLOR = HUD_PANEL_COLOR_PRESETS[0].value;
export const DEFAULT_HUD_PANEL_OPACITY = 0.68;
export const HUD_PANEL_OPACITY_MIN = 0.35;
export const HUD_PANEL_OPACITY_MAX = 0.92;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeHudPanelColor(value, fallback = DEFAULT_HUD_PANEL_COLOR) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  const shortMatch = /^#([0-9a-f]{3})$/i.exec(trimmed);
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const longMatch = /^#([0-9a-f]{6})$/i.exec(trimmed);
  return longMatch ? `#${longMatch[1].toLowerCase()}` : fallback;
}

export function normalizeHudPanelOpacity(value, fallback = DEFAULT_HUD_PANEL_OPACITY) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.round(clamp(number, HUD_PANEL_OPACITY_MIN, HUD_PANEL_OPACITY_MAX) * 100) / 100;
}

export function normalizeHudSettings(settings = {}) {
  return {
    hudPanelColor: normalizeHudPanelColor(settings.hudPanelColor),
    hudPanelOpacity: normalizeHudPanelOpacity(settings.hudPanelOpacity),
  };
}

export function getHudPanelColorLabel(value) {
  const normalized = normalizeHudPanelColor(value);
  return HUD_PANEL_COLOR_PRESETS.find(preset => preset.value === normalized)?.label || normalized.toUpperCase();
}

export function getAdjacentHudPanelColor(value, direction) {
  const normalized = normalizeHudPanelColor(value);
  const index = HUD_PANEL_COLOR_PRESETS.findIndex(preset => preset.value === normalized);
  const current = index >= 0 ? index : 0;
  const next = (current + direction + HUD_PANEL_COLOR_PRESETS.length) % HUD_PANEL_COLOR_PRESETS.length;
  return HUD_PANEL_COLOR_PRESETS[next].value;
}

export function getHudPanelCssVars(settings = {}) {
  const normalized = normalizeHudSettings(settings);
  const hex = normalized.hudPanelColor.slice(1);
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return {
    rgb: `${r}, ${g}, ${b}`,
    alpha: `${normalized.hudPanelOpacity}`,
  };
}
