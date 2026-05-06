/**
 * 責務: 汎用ステージイベント矩形の接触判定とイベント進行を担当する。
 * 更新ルール: 住民生成はResidentSpawnServiceへ委譲し、扉・足場・スイッチなど個別オブジェクトへイベント責務を持たせない。
 * 更新ルール: 特殊イベントの種類追加はこのクラスで分岐し、対象オブジェクトの無効化はgroupId一致だけで扱う。
 */
import { RESIDENT_DEFS } from '../data/residentDefs.js';
import { NANO_STATES } from '../config/nanoConfig.js';
import { intersects } from '../utils/rect.js';
import { ResidentSpawnService } from './ResidentSpawnService.js';

const EVENT_KIND_REINFORCEMENT = 'residentReinforcement';
const EVENT_KIND_GUST = 'gust';
const EVENT_KIND_DEACTIVATE_GROUP = 'deactivateGroup';
const DEFAULT_GUST_VX = -360;
const DEFAULT_GUST_VY = -230;
const DEFAULT_GUST_PARTICLES = 26;
const DEFAULT_GUST_COOLDOWN = 0.24;
const GROUP_DEACTIVATE_COLLECTIONS = Object.freeze([
  'platforms',
  'doors',
  'switchTargets',
  'switchGimmicks',
  'balloonRides',
  'checkpoints',
  'specialEvents',
]);
const DEFAULT_REINFORCEMENT_RESIDENTS = Object.freeze([
  { type: 'spoon', offsetX: -60, offsetY: -160, facing: 1 },
  { type: 'spoon', offsetX: 60, offsetY: -160, facing: -1 },
]);
const DEFAULT_TRIGGER_SOURCES = Object.freeze({
  [EVENT_KIND_REINFORCEMENT]: ['player'],
  [EVENT_KIND_GUST]: ['player', 'nano'],
  [EVENT_KIND_DEACTIVATE_GROUP]: ['player'],
});

function getEventRect(eventObject) {
  return {
    x: eventObject.x,
    y: eventObject.y,
    w: eventObject.w,
    h: eventObject.h,
  };
}

function isFiniteRect(rect) {
  return !!rect && Number.isFinite(rect.x) && Number.isFinite(rect.y) && Number.isFinite(rect.w) && Number.isFinite(rect.h) && rect.w > 0 && rect.h > 0;
}

function getEventId(eventObject, index) {
  return eventObject.id || `stage_event_${index}`;
}

function normalizeMessage(message = {}) {
  if (typeof message === 'string') return { text: message };
  return message || {};
}

function createDialogueLine(message = {}) {
  return {
    portrait: message.portrait || 'resident_spoon_a',
    speaker: message.speaker ?? 'スプーン兵',
    text: message.text || '',
  };
}

function createResidentDefs(eventObject) {
  const defs = Array.isArray(eventObject.residents) && eventObject.residents.length
    ? eventObject.residents
    : DEFAULT_REINFORCEMENT_RESIDENTS;
  return defs
    .filter(def => def && (def.type == null || RESIDENT_DEFS[def.type]))
    .map(def => ({ ...def, type: def.type || 'spoon' }));
}

function getActorBounds(actor) {
  if (!actor) return null;
  if (typeof actor.getBounds === 'function') return actor.getBounds();
  return actor;
}

function getTriggerSources(eventObject) {
  if (Array.isArray(eventObject.triggerBy) && eventObject.triggerBy.length) return eventObject.triggerBy;
  return DEFAULT_TRIGGER_SOURCES[eventObject.kind] || ['player'];
}

function canTriggerBySource(eventObject, source) {
  return getTriggerSources(eventObject).includes(source);
}

function getTargetGroupId(eventObject) {
  return eventObject.targetGroupId || eventObject.targetGroup || '';
}

function hasGroupId(object, groupId) {
  return !!groupId && object?.groupId === groupId;
}

function deactivateObject(object) {
  object.disabled = true;
  object.active = false;
  if ('open' in object) object.open = true;
  if ('lit' in object) object.lit = false;
  if ('occupied' in object) object.occupied = false;
  if ('ribbonBridgeTimer' in object) object.ribbonBridgeTimer = 0;
  if ('wishLeafTimer' in object) object.wishLeafTimer = 0;
}

function deactivateActor(actor) {
  actor.disabled = true;
  actor.active = false;
  actor.alive = false;
}

export class StageEventSystem {
  constructor(runtime) {
    this.runtime = runtime;
    this.firedEventIds = new Set();
  }

  update(dt = 0) {
    const runtime = this.runtime;
    if (!runtime?.player || runtime.dialogue?.active) return false;
    const events = runtime.stage?.specialEvents || [];
    for (let index = 0; index < events.length; index += 1) {
      const eventObject = events[index];
      if (!this.canTrigger(eventObject, index)) continue;
      if (eventObject.kind === EVENT_KIND_GUST) {
        if (this.updateGustEvent(eventObject, index, dt)) return true;
        continue;
      }
      const match = this.findTouchingActor(eventObject);
      if (!match) continue;
      this.startEvent(eventObject, index, match);
      return true;
    }
    return false;
  }

  canTrigger(eventObject, index) {
    if (!eventObject || eventObject.active === false || eventObject.disabled) return false;
    if (![EVENT_KIND_REINFORCEMENT, EVENT_KIND_GUST, EVENT_KIND_DEACTIVATE_GROUP].includes(eventObject.kind)) return false;
    if (eventObject.kind === EVENT_KIND_GUST && eventObject.once !== true) return true;
    const eventId = getEventId(eventObject, index);
    return eventObject.once === false || !this.firedEventIds.has(eventId);
  }

  getTriggerActors(eventObject) {
    const runtime = this.runtime;
    const actors = [];
    if (canTriggerBySource(eventObject, 'player')) actors.push({ source: 'player', actor: runtime.player, bounds: getActorBounds(runtime.player) });
    if (canTriggerBySource(eventObject, 'nano') && runtime.nano) actors.push({ source: 'nano', actor: runtime.nano, bounds: getActorBounds(runtime.nano) });
    return actors.filter(item => item.actor && isFiniteRect(item.bounds));
  }

  findTouchingActor(eventObject) {
    const rect = getEventRect(eventObject);
    if (!isFiniteRect(rect)) return null;
    return this.getTriggerActors(eventObject).find(item => intersects(item.bounds, rect)) || null;
  }

  updateGustEvent(eventObject, index, dt) {
    eventObject.gustCooldown = Math.max(0, (eventObject.gustCooldown || 0) - dt);
    const rect = getEventRect(eventObject);
    if (!isFiniteRect(rect)) return false;
    if (!eventObject.touchingSources) eventObject.touchingSources = {};

    for (const item of this.getTriggerActors(eventObject)) {
      const touching = intersects(item.bounds, rect);
      const started = touching && !eventObject.touchingSources[item.source];
      eventObject.touchingSources[item.source] = touching;
      if (!started || eventObject.gustCooldown > 0) continue;
      this.startEvent(eventObject, index, item);
      eventObject.gustCooldown = Number.isFinite(eventObject.cooldown) ? eventObject.cooldown : DEFAULT_GUST_COOLDOWN;
      return true;
    }
    return false;
  }

  startEvent(eventObject, index, match = null) {
    const eventId = getEventId(eventObject, index);
    if (eventObject.once !== false) this.firedEventIds.add(eventId);
    if (eventObject.kind === EVENT_KIND_REINFORCEMENT) {
      this.startResidentReinforcement(eventObject);
      return;
    }
    if (eventObject.kind === EVENT_KIND_GUST) {
      this.startGust(eventObject, match);
      return;
    }
    if (eventObject.kind === EVENT_KIND_DEACTIVATE_GROUP) {
      this.startDeactivateGroup(eventObject);
    }
  }

  startResidentReinforcement(eventObject) {
    const message = normalizeMessage(eventObject.message);
    const spawn = () => this.spawnReinforcements(eventObject);
    if (!message.text) {
      spawn();
      return;
    }
    this.runtime.app?.audio?.playSfx?.(eventObject.sfx || 'resident_charge');
    this.runtime.dialogue?.start?.([createDialogueLine(message)], spawn, { mode: message.mode || 'center' });
  }

  startGust(eventObject, match) {
    if (!match?.actor) return;
    const runtime = this.runtime;
    const rect = getEventRect(eventObject);
    const vx = Number.isFinite(eventObject.vx) ? eventObject.vx : DEFAULT_GUST_VX;
    const vy = Number.isFinite(eventObject.vy) ? eventObject.vy : DEFAULT_GUST_VY;
    this.applyGustToActor(match.actor, match.source, vx, vy);
    runtime.particleSystem?.spawnGust?.(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h, eventObject.particleColor || '#d9fff7', eventObject.particleCount || DEFAULT_GUST_PARTICLES);
    runtime.camera?.shake?.(eventObject.shake ?? 2.2, eventObject.shakeTime ?? 0.12);
    runtime.app?.audio?.playSfx?.(eventObject.sfx || 'ride_wind_shot');
  }

  applyGustToActor(actor, source, vx, vy) {
    if (source === 'nano') {
      if (actor.state === NANO_STATES.HEAD) return;
      actor.state = NANO_STATES.FLY;
      actor.flyStartX = actor.x;
      actor.flyStartY = actor.y;
    }
    actor.vx = vx;
    actor.vy = vy;
    actor.onGround = false;
    actor.groundPlatform = null;
    if ('jumpBufferTimer' in actor) actor.jumpBufferTimer = 0;
    if ('coyoteTimer' in actor) actor.coyoteTimer = 0;
    if ('facing' in actor) actor.facing = vx < 0 ? -1 : 1;
  }

  startDeactivateGroup(eventObject) {
    const groupId = getTargetGroupId(eventObject);
    const count = this.deactivateGroup(groupId);
    if (count <= 0) return;
    const rect = getEventRect(eventObject);
    this.runtime.spawnSparkles?.(rect.x + rect.w / 2, rect.y + rect.h / 2, eventObject.sparkColor || '#c9b6ff', 14);
    this.runtime.app?.audio?.playSfx?.(eventObject.sfx || 'gimmick_switch');
  }

  deactivateGroup(groupId) {
    if (!groupId) return 0;
    const runtime = this.runtime;
    let count = 0;
    for (const collectionKey of GROUP_DEACTIVATE_COLLECTIONS) {
      for (const object of runtime.stage?.[collectionKey] || []) {
        if (!hasGroupId(object, groupId) || object.disabled) continue;
        deactivateObject(object);
        count += 1;
      }
    }
    for (const resident of runtime.residents || []) {
      if (!hasGroupId(resident, groupId) || resident.alive === false) continue;
      deactivateActor(resident);
      count += 1;
    }
    for (const item of runtime.items || []) {
      if (!hasGroupId(item, groupId) || item.alive === false) continue;
      deactivateActor(item);
      count += 1;
    }
    for (const ride of runtime.balloonRideSystem?.rides || []) {
      if (!hasGroupId(ride, groupId) || ride.disabled) continue;
      deactivateObject(ride);
      if (ride.start) deactivateObject(ride.start);
      if (ride.goal) deactivateObject(ride.goal);
      count += 1;
    }
    return count;
  }

  spawnReinforcements(eventObject) {
    const runtime = this.runtime;
    const residents = ResidentSpawnService.spawn(runtime, createResidentDefs(eventObject), runtime.player);
    for (const resident of residents) {
      resident.vy = Math.max(resident.vy || 0, eventObject.initialVy ?? 40);
    }
    if (residents.length) {
      runtime.app?.audio?.playSfx?.(eventObject.spawnSfx || 'resident_spawn');
      const player = runtime.player;
      runtime.spawnSparkles?.(player.x + player.w / 2, player.y - 18, eventObject.sparkColor || '#f7d7aa', 12);
    }
  }
}
