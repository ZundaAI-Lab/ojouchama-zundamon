/**
 * 責務: デバッグ画面から実行する自動テストの登録・実行・集計を担当する。
 * 更新ルール: ゲーム固有の期待値はtests配下へ置き、このファイルは判定補助と実行隔離だけを扱う。
 * 更新ルール: localStorageを使うテストは各テスト単位で退避・復元し、通常プレイのセーブデータを汚染しない。
 */
function nowMs() {
  return globalThis.performance?.now ? globalThis.performance.now() : Date.now();
}

function createAssertionError(message, details = {}) {
  const error = new Error(message || 'アサーションに失敗しました');
  error.name = 'AssertionError';
  error.details = details;
  return error;
}

function stableStringify(value) {
  const seen = new WeakSet();
  return JSON.stringify(value, (key, current) => {
    if (!current || typeof current !== 'object') return current;
    if (seen.has(current)) return '[Circular]';
    seen.add(current);
    if (Array.isArray(current)) return current;
    return Object.keys(current).sort().reduce((sorted, objectKey) => {
      sorted[objectKey] = current[objectKey];
      return sorted;
    }, {});
  });
}

function snapshotLocalStorage() {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    const snapshot = new Map();
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key !== null) snapshot.set(key, storage.getItem(key));
    }
    return snapshot;
  } catch {
    return null;
  }
}

function restoreLocalStorage(snapshot) {
  if (!snapshot) return;
  try {
    const storage = globalThis.localStorage;
    if (!storage) return;
    storage.clear();
    snapshot.forEach((value, key) => storage.setItem(key, value));
  } catch {
    // localStorageがブラウザ設定で使えない場合も、テスト本体の失敗だけを報告する。
  }
}

export function createTest(suite, name, fn) {
  return { suite, name, fn };
}

export class TestRunner {
  constructor(tests = []) {
    this.tests = tests;
  }

  async run() {
    const startedAt = nowMs();
    const results = [];

    for (const test of this.tests) {
      results.push(await this.runOne(test));
    }

    const failed = results.filter(result => !result.ok).length;
    return {
      total: results.length,
      passed: results.length - failed,
      failed,
      durationMs: Math.round(nowMs() - startedAt),
      results,
    };
  }

  async runOne(test) {
    const startedAt = nowMs();
    const storageSnapshot = snapshotLocalStorage();
    try {
      await test.fn(this.createAssertContext(test));
      return {
        suite: test.suite,
        name: test.name,
        ok: true,
        durationMs: Math.round(nowMs() - startedAt),
      };
    } catch (error) {
      return {
        suite: test.suite,
        name: test.name,
        ok: false,
        durationMs: Math.round(nowMs() - startedAt),
        message: error?.message || String(error),
        details: error?.details || null,
        stack: error?.stack || null,
      };
    } finally {
      restoreLocalStorage(storageSnapshot);
    }
  }

  createAssertContext(test) {
    const prefix = `${test.suite}: ${test.name}`;
    return {
      assert(condition, message = '期待した条件を満たしていません') {
        if (!condition) throw createAssertionError(`${prefix} - ${message}`);
      },
      equal(actual, expected, message = '値が一致しません') {
        if (!Object.is(actual, expected)) {
          throw createAssertionError(`${prefix} - ${message}`, { actual, expected });
        }
      },
      deepEqual(actual, expected, message = '構造が一致しません') {
        const actualText = stableStringify(actual);
        const expectedText = stableStringify(expected);
        if (actualText !== expectedText) {
          throw createAssertionError(`${prefix} - ${message}`, { actual, expected });
        }
      },
    };
  }
}
