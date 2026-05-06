/**
 * 責務: 住民名に依存しない汎用行動セットを定義する。
 * 更新ルール: 住民固有名を含めず、移動・検知・予備動作・発射・反射などのコマンド列だけで構成する。
 */
export const RESIDENT_BEHAVIOR_CATALOG = {
  ground_patrol: {
    update: [
      { command: 'groundPatrol' },
    ],
  },

  float_patrol: {
    update: [
      { command: 'floatPatrol' },
    ],
  },

  ground_hop_patrol: {
    update: [
      { command: 'groundHopPatrol' },
    ],
  },

  ground_charge: {
    initialState: 'patrol',
    states: {
      patrol: {
        update: [
          { command: 'groundPatrol' },
          { command: 'detectTarget', saveAs: 'target' },
          { command: 'changeState', to: 'windup', when: 'hasTargetAndCooldownReady', cooldownKey: 'attack' },
        ],
      },
      windup: {
        enter: [
          { command: 'faceTarget' },
          { command: 'setFlag', key: 'alertGlow' },
          { command: 'startTimer', key: 'windup', from: 'charge.windupTime' },
        ],
        update: [
          { command: 'groundStand' },
          { command: 'changeState', to: 'charge', when: 'timerDone', timer: 'windup' },
        ],
        exit: [
          { command: 'clearFlag', key: 'alertGlow' },
        ],
      },
      charge: {
        enter: [
          { command: 'startCharge' },
          { command: 'startTimer', key: 'charge', from: 'charge.time' },
        ],
        update: [
          { command: 'groundChargeMove' },
          { command: 'changeState', to: 'recover', when: 'timerDone', timer: 'charge' },
        ],
      },
      recover: {
        enter: [
          { command: 'startTimer', key: 'recover', from: 'charge.recoverTime' },
        ],
        update: [
          { command: 'groundStand' },
          { command: 'changeState', to: 'patrol', when: 'timerDone', timer: 'recover' },
        ],
        exit: [
          { command: 'startCooldown', key: 'attack', from: 'charge.cooldown' },
        ],
      },
    },
  },

  float_emit_projectile: {
    update: [
      { command: 'floatPatrol' },
      { command: 'detectTarget', saveAs: 'target' },
      { command: 'emitProjectile', when: 'hasTargetAndCooldownReady', cooldownKey: 'emit' },
      { command: 'startCooldown', key: 'emit', from: 'emit.cooldown', when: 'lastCommandHandled' },
    ],
  },

  ground_emit_projectile: {
    update: [
      { command: 'groundPatrol' },
      { command: 'detectTarget', saveAs: 'target' },
      { command: 'emitProjectile', when: 'hasTargetAndCooldownReady', cooldownKey: 'emit' },
      { command: 'startCooldown', key: 'emit', from: 'emit.cooldown', when: 'lastCommandHandled' },
    ],
  },

  ground_reflect_projectile: {
    update: [
      { command: 'groundPatrol' },
    ],
    onProjectile: [
      { command: 'reflectProjectile', when: 'projectileFromFront' },
    ],
  },

  ground_telegraph_emit_projectile: {
    initialState: 'patrol',
    states: {
      patrol: {
        update: [
          { command: 'groundPatrol' },
          { command: 'detectTarget', saveAs: 'target' },
          { command: 'changeState', to: 'windup', when: 'hasTargetAndCooldownReady', cooldownKey: 'attack' },
        ],
      },
      windup: {
        enter: [
          { command: 'faceTarget' },
          { command: 'lockAim' },
          { command: 'setFlag', key: 'eyeGlow' },
          { command: 'startTimer', key: 'windup', from: 'telegraph.time' },
        ],
        update: [
          { command: 'groundStand' },
          { command: 'changeState', to: 'emit', when: 'timerDone', timer: 'windup' },
        ],
        exit: [
          { command: 'clearFlag', key: 'eyeGlow' },
        ],
      },
      emit: {
        enter: [
          { command: 'emitProjectile', aim: 'lockedAim' },
          { command: 'startTimer', key: 'recover', from: 'emit.recoverTime' },
        ],
        update: [
          { command: 'changeState', to: 'recover' },
        ],
      },
      recover: {
        update: [
          { command: 'groundStand' },
          { command: 'changeState', to: 'patrol', when: 'timerDone', timer: 'recover' },
        ],
        exit: [
          { command: 'startCooldown', key: 'attack', from: 'emit.cooldown' },
        ],
      },
    },
  },

  ride_float_idle: {
    update: [
      { command: 'rideFloatAroundBase' },
    ],
  },

  ride_float_emit_when_visible: {
    update: [
      { command: 'rideFloatAroundBase' },
      { command: 'detectTarget', saveAs: 'target' },
      { command: 'emitProjectile', when: 'hasTargetVisibleAndCooldownReady', cooldownKey: 'emit' },
      { command: 'startCooldown', key: 'emit', residentKey: 'fireEvery', from: 'emit.cooldown', when: 'lastCommandHandled' },
      { command: 'setAttackFlash', from: 'emit.attackFlashTime', when: 'lastCommandHandled' },
    ],
  },

  ride_dive_at_target: {
    update: [
      { command: 'rideBirdDive' },
    ],
  },

};
