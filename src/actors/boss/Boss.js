/**
 * 責務: ボス個体のHP、正気に戻った状態、無敵シールド状態、移動/攻撃パターン実行への委譲を担当する。
 * 更新ルール: ボスごとの具体的な移動・攻撃処理はBossPatterns/BossMovementPatterns/BossAttackPatternsへ分離する。
 * 更新ルール: おじぎ解除などの入力接続や弾衝突処理はstage側へ置き、ここでは状態の開始/解除と解除直後の硬直だけを扱う。
 */
import { Actor } from '../Actor.js';
import {
  getBossPatternConfig,
  getBossPhaseIndex,
  resetBossPatternQueues,
  updateBossPatterns,
} from './BossPatterns.js';

export class Boss extends Actor {
  constructor(def, difficultyScale = 1) {
    super({ x: def.x, y: def.y, w: def.w, h: def.h });
    this.id = def.id;
    this.name = def.name;
    this.imageKey = def.imageKey;
    this.hp = Math.ceil(def.hp * difficultyScale);
    this.maxHp = this.hp;
    this.drawW = def.w * 1.8;
    this.drawH = def.h * 1.45;
    this.baseX = def.x;
    this.baseY = def.y;
    this.timer = 0;
    this.shotTimer = 1.2;
    this.final = !!def.final;
    this.patternConfig = getBossPatternConfig(def);
    this.phaseIndex = 1;
    this.phaseChangeTimer = 0;
    this.patternState = {
      movement: {},
      attack: {
        queue: [],
        timer: 1.0,
      },
    };
    this.purified = false;
    this.visible = false;
    this.invulnerable = true;
    this.bowShieldRequired = !!def.bowShieldRequired;
    this.bowShieldActive = false;
    this.bowShieldBroken = false;
    this.bowShieldHintTimer = 0;
    this.reflectFlash = 0;
    this.bowShieldReleaseFlash = 0;
    this.bowShieldBreakLockTimer = 0;
    this.appearProgress = 0;
    this.purifyProgress = 0;
    this.purifying = false;
  }

  update(dt, scene) {
    if (!this.alive) return;
    this.timer += dt;
    this.phaseChangeTimer = Math.max(0, this.phaseChangeTimer - dt);
    this.bowShieldHintTimer = Math.max(0, this.bowShieldHintTimer - dt);
    this.reflectFlash = Math.max(0, this.reflectFlash - dt);
    this.bowShieldReleaseFlash = Math.max(0, this.bowShieldReleaseFlash - dt);
    this.bowShieldBreakLockTimer = Math.max(0, this.bowShieldBreakLockTimer - dt);

    if (this.bowShieldBreakLockTimer > 0) {
      return;
    }

    const nextPhase = getBossPhaseIndex(this);
    if (nextPhase !== this.phaseIndex) {
      this.phaseIndex = nextPhase;
      this.phaseChangeTimer = 0.7;
      resetBossPatternQueues(this);
      scene.camera?.shake?.(2, 0.16);
      scene.spawnSparkles(this.x + this.w / 2, this.y + this.h / 2, this.final ? '#e6c2ff' : '#fff4a3', 24);
    }

    updateBossPatterns(this, dt, scene);
  }

  startBattleShield() {
    this.bowShieldActive = this.bowShieldRequired && !this.bowShieldBroken;
    this.invulnerable = this.bowShieldActive;
  }

  releaseBowShield({ sourceX = null, knockbackDistance = 42, lockDuration = 1 } = {}) {
    if (!this.bowShieldActive) return false;
    this.bowShieldActive = false;
    this.bowShieldBroken = true;
    this.invulnerable = false;
    this.reflectFlash = Math.max(this.reflectFlash, 0.28);
    this.bowShieldReleaseFlash = Math.max(this.bowShieldReleaseFlash, 0.9);
    this.bowShieldBreakLockTimer = Math.max(this.bowShieldBreakLockTimer, lockDuration);
    this.applyBowShieldBreakKnockback(sourceX, knockbackDistance);
    this.patternState.attack.queue = [];
    this.patternState.attack.timer = Math.max(this.patternState.attack.timer ?? 0, lockDuration);
    return true;
  }

  applyBowShieldBreakKnockback(sourceX, distance) {
    if (sourceX == null || !Number.isFinite(sourceX) || distance <= 0) return;
    const centerX = this.x + this.w / 2;
    const dir = centerX >= sourceX ? 1 : -1;
    const minX = this.baseX - 105;
    const maxX = this.baseX + 105;
    this.x = Math.max(minX, Math.min(maxX, this.x + dir * distance));
    this.y -= 6;
  }

  triggerReflectFlash(duration = 0.18) {
    this.reflectFlash = Math.max(this.reflectFlash, duration);
  }

  damage(amount) {
    if (this.invulnerable) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.purified = true;
    }
  }
}
