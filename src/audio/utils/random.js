/**
 * 責務: 自動作曲で使う決定的な疑似乱数生成を提供する。
 * 更新ルール: Math.randomを使わず、同じseedから同じ曲イベントが生成される決定性を保つ。
 */
export function hashString(text) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRand(seedText) {
  const rnd = mulberry32(hashString(seedText));
  return {
    raw: rnd,
    f: (min, max) => min + (max - min) * rnd(),
    i: (min, max) => Math.floor(min + (max - min + 1) * rnd()),
    p: chance => rnd() < chance,
    pick: arr => arr[Math.floor(rnd() * arr.length)],
    pickW: pairs => {
      const sum = pairs.reduce((acc, [, weight]) => acc + weight, 0);
      let r = rnd() * sum;
      for (const [value, weight] of pairs) {
        r -= weight;
        if (r <= 0) return value;
      }
      return pairs[pairs.length - 1][0];
    },
  };
}
