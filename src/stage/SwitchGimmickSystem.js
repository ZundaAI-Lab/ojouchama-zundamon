/**
 * 責務: お茶会ベル/ガラスのローズ/虹色シャボン/魔法燭台の入力判定と、SwitchStateSystemへのON要求を担当する。
 * 更新ルール: 扉・家具・足場など対象側の状態変更はSwitchTargetSystemへ任せ、ここではギミック本体の実行時状態だけを更新する。
 * 更新ルール: リボンスイッチだけは足場リボン橋の起動要求をPlatformGimmickSystemへ委譲し、橋の寿命管理は足場側に残す。
 * 更新ルール: 魔法弾命中はStageRuntime.updateProjectilesから呼ばれ、同フレームの描画状態へ即時反映する。ただし衝突ワールド更新は次物理ステップに反映する。
 * 更新ルール: 魔法反応スイッチの命中判定とデバッグ表示範囲は同じ矩形生成関数を使い、表示と実判定をずらさない。
 * 更新ルール: 接触式ベルは接触開始時だけ鳴動し、接触継続中はベル鳴動時間の維持だけを行う。
 * 更新ルール: お茶会ベルの複数同時ON判定はsetId/groupId/switchId単位で集計し、扉などの対象側へはswitchStateの算出ONだけを渡す。
 */
import { intersects } from '../utils/rect.js';
import { activateRibbonBridgeGroup } from './PlatformGimmickSystem.js';

const DEFAULT_BELL_DURATION = 3.6;
const DEFAULT_LIT_DURATION = 0;
const DEFAULT_TRIGGER_BY = ['player', 'nano', 'magic'];
const ROSE_KIND = 'glassRose';
const CANDLE_KIND = 'magicCandelabra';
const BUBBLE_KIND = 'rainbowBubble';
const BELL_KIND = 'teaBell';
const RIBBON_SWITCH_KIND = 'ribbonSwitch';
const MAGIC_SWITCH_PADDING_X = 6;
const MAGIC_SWITCH_PADDING_Y = 6;

function getBounds(gimmick) {
  return {
    x: gimmick.x,
    y: gimmick.y,
    w: gimmick.w || 36,
    h: gimmick.h || 36,
  };
}

function getMagicBounds(gimmick) {
  const bounds = getBounds(gimmick);
  return {
    x: bounds.x - MAGIC_SWITCH_PADDING_X,
    y: bounds.y - MAGIC_SWITCH_PADDING_Y,
    w: bounds.w + MAGIC_SWITCH_PADDING_X * 2,
    h: bounds.h + MAGIC_SWITCH_PADDING_Y * 2,
  };
}

function centerOf(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

function canTrigger(gimmick, source) {
  const triggerBy = Array.isArray(gimmick.triggerBy) ? gimmick.triggerBy : DEFAULT_TRIGGER_BY;
  return triggerBy.includes(source);
}

function getGroupKey(gimmick) {
  return gimmick.setId || gimmick.groupId || gimmick.switchId || gimmick.id;
}

function getSwitchId(gimmick) {
  return gimmick.switchId || getGroupKey(gimmick);
}

function getRibbonTargetGroup(gimmick) {
  return gimmick.targetGroup || gimmick.group || 'default';
}

function hasRibbonBridgeGroup(runtime, group) {
  return (runtime.stage?.platforms || []).some(platform => (
    platform.kind === 'ribbonBridge' && (platform.group || 'default') === group
  ));
}

function getRequired(gimmick, fallback = 1) {
  return Math.max(1, Math.floor(Number.isFinite(gimmick.required) ? gimmick.required : fallback));
}

function getGroupRequired(members, fallback = 1) {
  const configured = members
    .map(gimmick => Number.isFinite(gimmick.required) ? Math.floor(gimmick.required) : null)
    .filter(value => value != null);
  if (configured.length === 0) return Math.max(1, Math.floor(fallback));
  return Math.max(1, ...configured);
}

function ensureRuntimeFields(gimmick) {
  if (!Number.isFinite(gimmick.cooldown)) gimmick.cooldown = 0;
  if (!Number.isFinite(gimmick.fxTimer)) gimmick.fxTimer = 0;
}

function getBellContactKey(source) {
  return source === 'nano' ? 'nanoTouchingBell' : 'playerTouchingBell';
}

export class SwitchGimmickSystem {
  constructor(stage, switchState) {
    this.stage = stage;
    this.switchState = switchState;
    this.gimmicks = Array.isArray(stage.switchGimmicks) ? stage.switchGimmicks : [];
  }

  beginFrame(dt) {
    this.switchState.beginFrame(dt);
    for (const gimmick of this.gimmicks) {
      ensureRuntimeFields(gimmick);
      gimmick.cooldown = Math.max(0, gimmick.cooldown - dt);
      gimmick.fxTimer = Math.max(0, gimmick.fxTimer - dt);
      gimmick.ringTimer = Math.max(0, (gimmick.ringTimer || 0) - dt);
      gimmick.bellActiveTimer = Math.max(0, (gimmick.bellActiveTimer || 0) - dt);
      if ((gimmick.kind === ROSE_KIND || gimmick.kind === CANDLE_KIND) && gimmick.lit && Number.isFinite(gimmick.litTimer)) {
        gimmick.litTimer = Math.max(0, gimmick.litTimer - dt);
        if (gimmick.litTimer <= 0) {
          gimmick.lit = false;
          gimmick.fxTimer = 0.18;
        }
      }
    }
  }

  getMagicHitboxes() {
    return this.gimmicks
      .filter(gimmick => !gimmick.disabled && canTrigger(gimmick, 'magic'))
      .map(gimmick => ({
        id: gimmick.id,
        kind: gimmick.kind,
        rect: getMagicBounds(gimmick),
      }));
  }

  hitWithMagic(runtime, projectile) {
    if (!projectile?.alive || projectile.faction !== 'player') return false;
    const projectileBounds = projectile.getBounds();
    for (const gimmick of this.gimmicks) {
      if (gimmick.disabled || !canTrigger(gimmick, 'magic')) continue;
      if (!intersects(projectileBounds, getMagicBounds(gimmick))) continue;
      if (this.activateByMagic(runtime, gimmick)) return true;
    }
    return false;
  }

  activateByMagic(runtime, gimmick) {
    if (gimmick.kind === BELL_KIND) {
      this.activateBell(runtime, gimmick, 'magic');
      return true;
    }
    if (gimmick.kind === ROSE_KIND || gimmick.kind === CANDLE_KIND) {
      this.lightTimedGimmick(runtime, gimmick);
      return true;
    }
    if (gimmick.kind === RIBBON_SWITCH_KIND) {
      return this.activateRibbonSwitch(runtime, gimmick);
    }
    return false;
  }


  activateRibbonSwitch(runtime, gimmick) {
    const group = getRibbonTargetGroup(gimmick);
    if (!hasRibbonBridgeGroup(runtime, group)) return false;

    const activated = activateRibbonBridgeGroup(runtime, group);
    gimmick.lastTriggerSource = 'magic';
    if (activated > 0) {
      this.playGimmickFeedback(runtime, gimmick, '#ffd1e8', 20);
      runtime.hud.showBanner('リボンの道がふわりと結ばれたの！');
      runtime.app.audio.playSfx('ribbon_bridge_on');
      gimmick.cooldown = Math.max(gimmick.cooldown || 0, 0.34);
    }
    return true;
  }

  updateContactTriggers(runtime) {
    const playerBounds = runtime.player?.getBounds?.();
    const nanoBounds = runtime.nano?.getBounds?.();

    for (const gimmick of this.gimmicks) {
      if (gimmick.disabled) continue;
      const bounds = getBounds(gimmick);
      const playerTouches = !!playerBounds && intersects(playerBounds, bounds);
      const nanoTouches = !!nanoBounds && intersects(nanoBounds, bounds);

      if (gimmick.kind === BELL_KIND) {
        this.updateBellContact(runtime, gimmick, 'player', playerTouches);
        this.updateBellContact(runtime, gimmick, 'nano', nanoTouches);
      }

      if (gimmick.kind === BUBBLE_KIND) {
        const occupiedByPlayer = playerTouches && canTrigger(gimmick, 'player');
        const occupiedByNano = nanoTouches && canTrigger(gimmick, 'nano');
        const occupied = occupiedByPlayer || occupiedByNano;
        if (occupied && !gimmick.occupied) this.playGimmickFeedback(runtime, gimmick, '#fff2a8', 6);
        gimmick.occupied = occupied;
        gimmick.occupiedByPlayer = occupiedByPlayer;
        gimmick.occupiedByNano = occupiedByNano;
      }
    }

    this.resolveBellGroups();
    this.resolveLitGroups(ROSE_KIND);
    this.resolveLitGroups(CANDLE_KIND);
    this.resolveBubbleGroups();
  }

  updateBellContact(runtime, gimmick, source, touches) {
    const contactKey = getBellContactKey(source);
    const active = !!touches && canTrigger(gimmick, source);
    const started = active && !gimmick[contactKey];
    gimmick[contactKey] = active;
    if (!active) return;
    this.activateBell(runtime, gimmick, source, { feedback: started });
  }

  activateBell(runtime, gimmick, source, { feedback = true } = {}) {
    const duration = Number.isFinite(gimmick.duration) ? gimmick.duration : DEFAULT_BELL_DURATION;
    gimmick.bellActiveTimer = Math.max(gimmick.bellActiveTimer || 0, duration);
    gimmick.lastTriggerSource = source;
    if (!feedback || gimmick.cooldown > 0) return;
    gimmick.ringTimer = Math.max(gimmick.ringTimer || 0, Math.min(0.5, duration));
    this.playGimmickFeedback(runtime, gimmick, '#ffd6e8', 12);
    runtime.app.audio.playSfx('gimmick_bell');
    gimmick.cooldown = 0.34;
  }

  resolveBellGroups() {
    const groups = new Map();
    for (const gimmick of this.gimmicks) {
      if (gimmick.kind !== BELL_KIND || gimmick.disabled) continue;
      const key = getGroupKey(gimmick);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(gimmick);
    }

    for (const members of groups.values()) {
      const activeCount = members.filter(gimmick => (gimmick.bellActiveTimer || 0) > 0).length;
      const required = getGroupRequired(members, 1);
      const on = activeCount >= required;
      for (const gimmick of members) {
        gimmick.groupActiveCount = activeCount;
        gimmick.groupRequired = required;
        this.switchState.setComputedOn(getSwitchId(gimmick), on);
      }
    }
  }

  lightTimedGimmick(runtime, gimmick) {
    const litDuration = Number.isFinite(gimmick.litDuration) ? gimmick.litDuration : DEFAULT_LIT_DURATION;
    gimmick.lit = true;
    gimmick.litTimer = litDuration > 0 ? litDuration : Infinity;
    gimmick.fxTimer = 0.28;
    if (gimmick.cooldown <= 0) {
      const color = gimmick.kind === ROSE_KIND ? this.getRoseFxColor(gimmick) : this.getFlameFxColor(gimmick);
      this.playGimmickFeedback(runtime, gimmick, color, 12);
      runtime.app.audio.playSfx('gimmick_switch');
      gimmick.cooldown = 0.22;
    }
  }

  resolveLitGroups(kind) {
    const groups = new Map();
    for (const gimmick of this.gimmicks) {
      if (gimmick.kind !== kind || gimmick.disabled) continue;
      const key = getGroupKey(gimmick);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(gimmick);
    }

    for (const members of groups.values()) {
      const litCount = members.filter(gimmick => gimmick.lit).length;
      for (const gimmick of members) {
        const required = getRequired(gimmick, members.length);
        const on = litCount >= required;
        gimmick.groupLitCount = litCount;
        gimmick.groupRequired = required;
        this.switchState.setComputedOn(getSwitchId(gimmick), on);
      }
    }
  }

  resolveBubbleGroups() {
    const groups = new Map();
    for (const gimmick of this.gimmicks) {
      if (gimmick.kind !== BUBBLE_KIND || gimmick.disabled) continue;
      const key = getGroupKey(gimmick);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(gimmick);
    }

    for (const members of groups.values()) {
      const occupiedCount = members.filter(gimmick => gimmick.occupied).length;
      for (const gimmick of members) {
        const required = getRequired(gimmick, 1);
        const on = occupiedCount >= required;
        gimmick.groupOccupiedCount = occupiedCount;
        gimmick.groupRequired = required;
        this.switchState.setComputedOn(getSwitchId(gimmick), on);
      }
    }
  }

  getRoseFxColor(gimmick) {
    if (gimmick.color === 'blue') return '#89d9ff';
    if (gimmick.color === 'yellow') return '#ffe07a';
    return '#ff9fbc';
  }

  getFlameFxColor(gimmick) {
    if (gimmick.flameColor === 'blue') return '#8fe8ff';
    if (gimmick.flameColor === 'pink') return '#ff9fcb';
    if (gimmick.flameColor === 'green') return '#a8ee7f';
    return '#ffd36e';
  }

  playGimmickFeedback(runtime, gimmick, color, count) {
    const c = centerOf(getBounds(gimmick));
    gimmick.fxTimer = Math.max(gimmick.fxTimer || 0, 0.22);
    runtime.spawnSparkles(c.x, c.y, color, count);
  }
}
