/**
 * 責務: セーブや進行保持など、システム層の自動テスト定義を担当する。
 * 更新ルール: localStorageの退避・復元はTestRunnerに任せ、ここでは対象APIの期待値だけを記述する。
 */
import { createTest } from '../TestRunner.js';
import { STORAGE_KEY, UPGRADE_DEFS } from '../../config/upgradeDefs.js';
import { MAX_TEACUPS } from '../../config/teacupInventory.js';
import { SaveSystem } from '../../systems/SaveSystem.js';
import { StageRouteProgress } from '../../stage/StageRouteProgress.js';

export const systemTests = [
  createTest('SaveSystem', '不正または旧バージョンのセーブは初期化される', ({ equal, deepEqual }) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: -1, totalCoins: 999, clearedStages: ['ghost'] }));
    const save = new SaveSystem().load();
    equal(save.totalCoins, 0);
    deepEqual(save.clearedStages, []);
  }),

  createTest('SaveSystem', 'ティーカップ数は上限内へ正規化される', ({ equal }) => {
    const saveSystem = new SaveSystem();
    const save = saveSystem.load();
    save.teacups = MAX_TEACUPS + 100;
    saveSystem.save(save);
    equal(saveSystem.load().teacups, MAX_TEACUPS);
  }),

  createTest('SaveSystem', 'ティーカップ消費は空の場合に失敗する', ({ equal }) => {
    const saveSystem = new SaveSystem();
    const result = saveSystem.consumeTeacup();
    equal(result.ok, false);
    equal(result.reason, 'empty');
  }),

  createTest('SaveSystem', '物語フラグが必要な強化は未加入状態で購入できない', ({ equal }) => {
    const gatedKey = Object.keys(UPGRADE_DEFS).find(key => UPGRADE_DEFS[key].requiresStoryFlag === 'nanoJoined');
    const saveSystem = new SaveSystem();
    const save = saveSystem.load();
    save.totalCoins = 999;
    saveSystem.save(save);
    const result = saveSystem.purchaseUpgrade(gatedKey);
    equal(result.ok, false);
    equal(result.reason, 'locked');
  }),

  createTest('SaveSystem', 'ステージクリア記録は最高値とベストランクを更新する', ({ equal }) => {
    const saveSystem = new SaveSystem();
    saveSystem.recordStageClear({ id: 'test_stage', worldIndex: 1 }, {
      clearTime: 80,
      coins: 3,
      teacups: 0,
      purified: 1,
      damageCount: 2,
      rank: 'B',
    });
    saveSystem.recordStageClear({ id: 'test_stage', worldIndex: 1 }, {
      clearTime: 64,
      coins: 7,
      teacups: 1,
      purified: 2,
      damageCount: 0,
      rank: 'S',
    });
    const record = saveSystem.load().stages.test_stage;
    equal(record.bestTime, 64);
    equal(record.bestCoins, 7);
    equal(record.bestTeacups, 1);
    equal(record.bestRank, 'S');
  }),

  createTest('StageRouteProgress', 'エリア間引き継ぎ値を数値だけに整形する', ({ deepEqual }) => {
    deepEqual(StageRouteProgress.fromParams({ elapsed: 12, coins: NaN, purified: 3, damageCount: Infinity, teacupsCollected: 2 }), {
      elapsed: 12,
      coins: 0,
      purified: 3,
      damageCount: 0,
      teacupsCollected: 2,
    });
  }),
];
