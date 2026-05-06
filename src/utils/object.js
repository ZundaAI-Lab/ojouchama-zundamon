/**
 * 責務: オブジェクトの複製などデータ操作補助を担当する。
 * 更新ルール: ゲーム固有の状態更新を持ち込まない。
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
