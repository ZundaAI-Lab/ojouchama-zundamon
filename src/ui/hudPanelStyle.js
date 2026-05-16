/**
 * 責務: 保存済みHUD外観設定をDOMのCSS変数へ反映する。
 * 更新ルール: HUD設定の正規化は config/hudSettings.js に委譲し、ここでは反映先DOMだけを扱う。
 */
import { getHudPanelCssVars } from '../config/hudSettings.js';

export function applyHudPanelStyle(root, settings = {}) {
  if (!root?.style) return;
  const vars = getHudPanelCssVars(settings);
  root.style.setProperty('--hud-panel-rgb', vars.rgb);
  root.style.setProperty('--hud-panel-alpha', vars.alpha);
}
