/**
 * 責務: 弾種ごとの移動方式・当たり効果・描画ヒントを定義する。
 * 更新ルール: どの住民が撃つかを持ち込まず、弾そのものの性質だけを扱う。
 */
export const PROJECTILE_CATALOG = {
  bubble: {
    faction: 'neutral',
    damage: 0,
    w: 18,
    h: 18,
    color: '#c9f8ff',
    life: 2.8,
    motion: {
      type: 'rise_arc',
      speed: 24,
      vy: -18,
      ay: -18,
    },
    contactEffect: {
      type: 'lift',
      targetTypes: ['player', 'nano'],
      liftVy: -54,
      nanoLiftVy: -44,
      followStrengthX: 0.05,
    },
    collision: {
      disappearOnTerrain: true,
      hitPlayer: false,
      hitNano: false,
    },
    render: {
      type: 'bubble',
    },
  },

  slash: {
    faction: 'resident',
    damage: 1,
    w: 30,
    h: 18,
    color: '#f8f2ff',
    life: 1.15,
    motion: {
      type: 'linear',
      speed: 145,
    },
    contactEffect: {
      type: 'damage',
      targetTypes: ['player'],
    },
    collision: {
      disappearOnTerrain: true,
      hitPlayer: true,
      hitNano: false,
    },
    render: {
      type: 'slash',
    },
  },

  tea_arc: {
    faction: 'resident',
    damage: 1,
    w: 12,
    h: 10,
    color: '#d8925f',
    life: 2.6,
    motion: {
      type: 'gravity_arc',
      speed: 178,
      gravity: 260,
    },
    contactEffect: {
      type: 'damage',
      targetTypes: ['player'],
    },
    collision: {
      disappearOnTerrain: true,
      hitPlayer: true,
      hitNano: false,
    },
    render: {
      type: 'orb',
    },
  },

  ribbon_wisp: {
    faction: 'resident',
    damage: 1,
    w: 28,
    h: 14,
    color: '#ff9bc6',
    life: 1.58,
    motion: {
      type: 'sine_wave',
      speed: 64,
      waveAmplitude: 7.5,
      waveFrequency: 7.1,
    },
    contactEffect: {
      type: 'damage',
      targetTypes: ['player'],
    },
    collision: {
      disappearOnTerrain: true,
      hitPlayer: true,
      hitNano: false,
    },
    render: {
      type: 'ribbon_wisp',
    },
  },

  wind_gust: {
    faction: 'resident',
    damage: 1,
    w: 18,
    h: 12,
    color: '#dff9ff',
    life: 2.3,
    motion: {
      type: 'sine_linear',
      speed: 96,
      waveY: 0.08,
      waveFrequency: 8,
    },
    contactEffect: {
      type: 'damage',
      targetTypes: ['player', 'rideBalloon'],
    },
    collision: {
      disappearOnTerrain: false,
      hitPlayer: true,
      hitNano: false,
    },
    render: {
      type: 'wind_gust',
    },
  },

  lightning_bolt: {
    faction: 'resident',
    damage: 1,
    w: 22,
    h: 18,
    color: '#fff25c',
    life: 2.4,
    motion: {
      type: 'linear',
      speed: 112,
    },
    contactEffect: {
      type: 'damage',
      targetTypes: ['player', 'rideBalloon'],
    },
    collision: {
      disappearOnTerrain: false,
      hitPlayer: true,
      hitNano: false,
    },
    render: {
      type: 'lightning_bolt',
    },
  },

};
