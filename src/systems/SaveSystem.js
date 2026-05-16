/**
 * 責務: localStorageのセーブデータ、設定、進行状況、ショップ購入を担当する。
 * 更新ルール: 画面DOMや描画処理を持ち込まない。
 * 更新ルール: キーコンフィグとタッチ操作設定はsettings配下へ保存し、読み込み時に正規化してから返す。
 * 更新ルール: 物語進行フラグはstoryFlags配下へ保存し、加入状態などのステージ外進行をここで一元管理する。
 * 更新ルール: ショップ商品の購入可否は強化定義の宣言条件を確認し、未解放商品の直接購入を許可しない。
 * 更新ルール: デバッグ用の進行フラグ変更も、保存形式の整合性維持のためここで正規化する。
 * 更新ルール: BGM/SEの音量設定はsettings配下で分けて保持し、読み込み時に0〜1へ正規化する。
 * 更新ルール: 夢のしずく獲得状況はエリアstageId単位でdreamDropsへ保持し、取得だけでは保存せずゴール時に記録する。
 * 更新ルール: HUD外観設定はsettings配下に保存し、読み込み時に色と不透明度を正規化する。
 */
import { STORAGE_KEY, UPGRADE_DEFS } from '../config/upgradeDefs.js';
import { SHOP_ITEM_DEFS, clampTeacups } from '../config/teacupInventory.js';
import { DEFAULT_KEY_BINDINGS, DEFAULT_TOUCH_CONFIG, normalizeKeyBindings, normalizeTouchConfig } from '../config/controlSettings.js';
import { normalizeHudSettings } from '../config/hudSettings.js';

const SAVE_VERSION = 6;

const defaultUpgrades = () => Object.fromEntries(Object.keys(UPGRADE_DEFS).map(key => [key, 0]));

const defaultSettings = () => ({
  bgmVolume: 0.7,
  sfxVolume: 0.75,
  muted: false,
  difficulty: 'normal',
  ...normalizeHudSettings(),
  keyBindings: normalizeKeyBindings(DEFAULT_KEY_BINDINGS),
  touchControls: normalizeTouchConfig(DEFAULT_TOUCH_CONFIG),
});

const defaultSave = () => ({
  version: SAVE_VERSION,
  totalCoins: 0,
  teacups: 0,
  clearedStages: [],
  stages: {},
  dreamDrops: {},
  upgrades: defaultUpgrades(),
  settings: defaultSettings(),
  storyFlags: {
    nanoJoined: false,
    nanoShopNoticeShown: false,
  },
  endingSeen: false,
});

function clampVolume(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(1, number));
}

function normalizeSettings(settings = {}) {
  const defaults = defaultSettings();
  const merged = { ...defaults, ...settings };
  merged.bgmVolume = clampVolume(merged.bgmVolume, defaults.bgmVolume);
  merged.sfxVolume = clampVolume(merged.sfxVolume, defaults.sfxVolume);
  Object.assign(merged, normalizeHudSettings(merged));
  merged.keyBindings = normalizeKeyBindings(merged.keyBindings);
  merged.touchControls = normalizeTouchConfig(merged.touchControls);
  return merged;
}

function normalizeDreamDrops(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([stageId, acquired]) => typeof stageId === 'string' && !!acquired));
}

function saveHasProgress(save) {
  if (!save) return false;
  if ((save.totalCoins || 0) > 0) return true;
  if (clampTeacups(save.teacups) > 0) return true;
  if (Array.isArray(save.clearedStages) && save.clearedStages.length > 0) return true;
  if (save.stages && Object.keys(save.stages).length > 0) return true;
  if (save.dreamDrops && Object.keys(save.dreamDrops).length > 0) return true;
  if (save.endingSeen) return true;
  if (Object.values(save.storyFlags || {}).some(Boolean)) return true;
  return Object.values(save.upgrades || {}).some(level => (level || 0) > 0);
}

export class SaveSystem {
  hasData() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  hasProgress() {
    return saveHasProgress(this.load());
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      const parsed = JSON.parse(raw);
      if (parsed.version !== SAVE_VERSION) return defaultSave();
      const base = defaultSave();
      return {
        ...base,
        ...parsed,
        teacups: clampTeacups(parsed.teacups),
        settings: normalizeSettings(parsed.settings),
        upgrades: { ...defaultUpgrades(), ...(parsed.upgrades || {}) },
        storyFlags: { ...base.storyFlags, ...(parsed.storyFlags || {}) },
        clearedStages: Array.isArray(parsed.clearedStages) ? parsed.clearedStages : [],
        stages: parsed.stages || {},
        dreamDrops: normalizeDreamDrops(parsed.dreamDrops),
      };
    } catch {
      return defaultSave();
    }
  }

  save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  recordStageClear(stage, result) {
    const save = this.load();
    if (!save.clearedStages.includes(stage.id)) save.clearedStages.push(stage.id);

    const prev = save.stages[stage.id] || {};
    const bestTime = prev.bestTime ? Math.min(prev.bestTime, result.clearTime) : result.clearTime;
    const bestCoins = Math.max(prev.bestCoins || 0, result.coins);
    const bestTeacups = Math.max(prev.bestTeacups || 0, result.teacups);
    const bestRank = this.bestRank(prev.bestRank, result.rank);

    save.stages[stage.id] = {
      cleared: true,
      worldIndex: stage.worldIndex,
      lastResult: result,
      bestTime,
      bestCoins,
      bestTeacups,
      bestRank,
    };
    save.totalCoins += result.coins;
    if (stage.route?.ending) save.endingSeen = true;
    this.save(save);
    return save.stages[stage.id];
  }

  bestRank(a = 'C', b = 'C') {
    const order = ['C', 'B', 'A', 'S', 'Royal S'];
    return order[Math.max(order.indexOf(a), order.indexOf(b))] || b;
  }

  hasDreamDrop(stageId) {
    if (!stageId) return false;
    const save = this.load();
    return !!save.dreamDrops?.[stageId];
  }

  recordDreamDrops(stageIds = []) {
    const ids = [...new Set((Array.isArray(stageIds) ? stageIds : [stageIds]).filter(Boolean))];
    const save = this.load();
    save.dreamDrops = normalizeDreamDrops(save.dreamDrops);
    let changed = false;
    for (const stageId of ids) {
      if (save.dreamDrops[stageId]) continue;
      save.dreamDrops[stageId] = true;
      changed = true;
    }
    if (changed) this.save(save);
    return save;
  }


  addTeacups(amount = 1) {
    const save = this.load();
    const before = clampTeacups(save.teacups);
    const after = clampTeacups(before + amount);
    save.teacups = after;
    this.save(save);
    return { ok: after > before, reason: after > before ? null : 'max', save, before, after };
  }

  consumeTeacup() {
    const save = this.load();
    const before = clampTeacups(save.teacups);
    if (before <= 0) return { ok: false, reason: 'empty', save };
    save.teacups = before - 1;
    this.save(save);
    return { ok: true, save, before, after: save.teacups };
  }

  purchaseShopItem(key) {
    const save = this.load();
    const def = SHOP_ITEM_DEFS[key];
    if (!def) return { ok: false, reason: 'unknown', save };
    if (key === 'teacup' && clampTeacups(save.teacups) >= def.max) return { ok: false, reason: 'max', save };
    if (save.totalCoins < def.cost) return { ok: false, reason: 'coin', save };
    save.totalCoins -= def.cost;
    if (key === 'teacup') save.teacups = clampTeacups(save.teacups + 1);
    this.save(save);
    return { ok: true, save };
  }

  purchaseUpgrade(key) {
    const save = this.load();
    const def = UPGRADE_DEFS[key];
    if (!def) return { ok: false, reason: 'unknown' };
    if (!this.isUpgradePurchaseAllowed(def, save)) return { ok: false, reason: 'locked' };
    const level = save.upgrades[key] || 0;
    if (level >= def.max) return { ok: false, reason: 'max' };
    const cost = def.cost[level] || 999;
    if (save.totalCoins < cost) return { ok: false, reason: 'coin' };
    save.totalCoins -= cost;
    save.upgrades[key] = level + 1;
    this.save(save);
    return { ok: true, save };
  }

  isUpgradePurchaseAllowed(def, save) {
    if (def.requiresStoryFlag && !save.storyFlags?.[def.requiresStoryFlag]) return false;
    return true;
  }

  updateSettings(patch) {
    const save = this.load();
    save.settings = normalizeSettings({ ...save.settings, ...patch });
    this.save(save);
    return save.settings;
  }

  setStoryFlag(key, value) {
    const save = this.load();
    save.storyFlags = { ...(save.storyFlags || {}), [key]: !!value };
    this.save(save);
    return save;
  }

  setUpgradeLevel(key, level) {
    const def = UPGRADE_DEFS[key];
    if (!def) return this.load();
    const save = this.load();
    const normalized = Math.max(0, Math.min(def.max, Math.floor(Number(level) || 0)));
    save.upgrades = { ...defaultUpgrades(), ...(save.upgrades || {}), [key]: normalized };
    this.save(save);
    return save;
  }

  setStageClearFlags(stageRecords, value) {
    const save = this.load();
    const records = Array.isArray(stageRecords) ? stageRecords.filter(record => record?.id) : [];
    const ids = records.map(record => record.id);
    save.clearedStages = Array.isArray(save.clearedStages) ? save.clearedStages.filter(id => !ids.includes(id)) : [];
    save.stages = { ...(save.stages || {}) };

    records.forEach(record => {
      delete save.stages[record.id];
    });

    if (value) {
      records.forEach((record, index) => {
        if (!save.clearedStages.includes(record.id)) save.clearedStages.push(record.id);
        save.stages[record.id] = {
          cleared: true,
          worldIndex: record.worldIndex ?? index + 1,
          bestTime: 0,
          bestCoins: 0,
          bestTeacups: 0,
          bestRank: 'C',
          lastResult: {
            clearTime: 0,
            coins: 0,
            teacups: 0,
            purified: 0,
            damageCount: 0,
            rank: 'C',
          },
        };
      });
    }

    save.endingSeen = !!value && records.some(record => record.ending);
    this.save(save);
    return save;
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
