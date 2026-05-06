/**
 * 責務: 矩形生成・交差・中心・距離計算の共通関数を担当する。
 * 更新ルール: 衝突後のゲーム効果はstage側に置く。
 */
export const rect = (x, y, w, h) => ({ x, y, w, h });
export const intersects = (a, b) => (
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y
);
export const centerOf = r => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
export const distanceRects = (a, b) => {
  const ac = centerOf(a);
  const bc = centerOf(b);
  return Math.hypot(ac.x - bc.x, ac.y - bc.y);
};
