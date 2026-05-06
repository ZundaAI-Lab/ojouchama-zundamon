/**
 * 責務: デバッグ画面の自動テスト一覧を集約して実行する。
 * 更新ルール: テスト定義は領域別ファイルへ追加し、このファイルは実行順の管理だけを担当する。
 */
import { TestRunner } from '../TestRunner.js';
import { coreTests } from './coreTests.js';
import { dataValidationTests } from './dataValidationTests.js';
import { stageTests } from './stageTests.js';
import { stageEditorTests } from './stageEditorTests.js';
import { systemTests } from './systemTests.js';

export const DEBUG_TESTS = [
  ...coreTests,
  ...systemTests,
  ...stageTests,
  ...dataValidationTests,
  ...stageEditorTests,
];

export async function runAllDebugTests() {
  const runner = new TestRunner(DEBUG_TESTS);
  const result = await runner.run();
  if (typeof window !== 'undefined') {
    window.__OJOUCHAMA_TEST_RESULT__ = result;
  }
  return result;
}
