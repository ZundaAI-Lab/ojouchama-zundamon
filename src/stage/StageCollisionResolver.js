/**
 * 責務: ステージ中の住民接触、弾命中、ゴール接触など衝突後処理を担当する。
 * 更新ルール: アイテム取得はItemCollectionServiceへ委譲し、低レベル矩形判定や描画処理を持ち込まない。
 * 更新ルール: なのちゃん固有の状態判定はNanoCompanionへ委譲し、ここでは衝突後の効果適用だけを行う。
 * 更新ルール: 住民弾・中立ギミック弾の特殊効果は弾の contactEffect を見て汎用処理し、住民種別名では分岐しない。
 * 更新ルール: ボス固有の防御状態はBoss側の状態を参照し、衝突後の弾き演出だけをここで接続する。
 * 更新ルール: 魔法命中リアクションはMagicHitReactionServiceへ委譲し、ここでは命中確定時に接続する。
 */
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { BubbleLiftSystem } from './BubbleLiftSystem.js';
import { ItemCollectionService } from './ItemCollectionService.js';
import { isNormalResident } from '../actors/resident/ResidentScope.js';
import { ResidentProjectileHitService } from './residents/ResidentProjectileHitService.js';
import { MagicHitReactionService } from './MagicHitReactionService.js';

export class StageCollisionResolver {
  static handle(runtime) {
    ItemCollectionService.collectWithPlayerAndNano(runtime);

    for (const resident of runtime.residents) {
      if (!resident.alive || !isNormalResident(resident) || !resident.contactDamage) continue;
      if (CollisionSystem.intersectsDamageBounds(runtime.player, resident) && resident.stunTimer <= 0) {
        this.hitPlayer(runtime, runtime.player.x < resident.x ? -1 : 1);
      }
    }

    for (const p of runtime.projectiles) {
      if (!p.alive) continue;
      if (this.handleProjectileContactEffect(runtime, p)) continue;

      if (p.faction === 'player') {
        this.handlePlayerProjectile(runtime, p);
      } else if (p.faction === 'resident' && CollisionSystem.intersectsDamageBounds(runtime.player, p)) {
        p.alive = false;
        this.hitPlayer(runtime, runtime.player.x < p.x ? -1 : 1);
      }
    }

    if (!runtime.dialogue.active && CollisionSystem.intersectsActor(runtime.player, runtime.goal) && (!runtime.boss || !runtime.boss.alive)) {
      runtime.clearStage();
    }
  }

  static hitPlayer(runtime, sourceFacing = 1) {
    if (runtime.player.hit(runtime, sourceFacing)) runtime.damageCount += 1;
  }

  static handleProjectileContactEffect(runtime, projectile) {
    const effect = projectile.contactEffect;
    if (!effect) return false;

    if (effect.type === 'lift') {
      BubbleLiftSystem.resolve(runtime, projectile);
      return projectile.faction === 'neutral';
    }

    if (effect.type === 'damage' && (effect.targetTypes || ['player']).includes('player')) {
      if (!CollisionSystem.intersectsDamageBounds(runtime.player, projectile)) return false;
      projectile.alive = false;
      this.hitPlayer(runtime, runtime.player.x < projectile.x ? -1 : 1);
      return true;
    }

    return false;
  }

  static handlePlayerProjectile(runtime, projectile) {
    // なのちゃん位置交換ルール:
    // 交換先になのちゃん周辺を使う場合でも、プレイヤーの全身が入る空間が
    // 確保できない時は失敗扱いにする。判定本体はNanoCompanionへ集約する。
    if (runtime.nano?.tryHandleSwapProjectile(runtime, projectile)) return;

    ResidentProjectileHitService.resolvePlayerProjectile(runtime, projectile, runtime.residents, {
      behaviorContext: runtime.residentBehaviorContext,
      filter: isNormalResident,
      hitSfx: 'magic_hit',
      reward: {
        sparkColor: projectile.boosted ? '#ffe79a' : '#97e97f',
        sparkCount: 12,
        playSfx: true,
        sfx: 'resident_purify',
      },
    });

    if (projectile.alive) this.handleBossProjectile(runtime, projectile);
  }

  static handleBossProjectile(runtime, projectile) {
    if (!runtime.isBossBattleActive?.() || !runtime.boss?.alive) return false;
    if (projectile.ignoreBossTimer > 0) return false;
    if (!CollisionSystem.intersectsActor(projectile, runtime.boss)) return false;

    if (runtime.boss.bowShieldActive) {
      this.deflectBossShieldProjectile(runtime, projectile);
      return true;
    }

    if (!runtime.canHitBoss()) return false;

    projectile.alive = false;
    const wasAlive = runtime.boss.alive;
    MagicHitReactionService.applyToBoss(runtime, runtime.boss, projectile);
    runtime.boss.damage(projectile.damage);
    runtime.camera.shake(2, 0.1);
    runtime.spawnSparkles(projectile.x, projectile.y, '#fff0a0', 8);
    if (wasAlive && runtime.boss.alive) runtime.app.audio.playSfx('boss_damage');
    if (wasAlive && !runtime.boss.alive) {
      runtime.handleBossDefeated();
    }
    return true;
  }

  static deflectBossShieldProjectile(runtime, projectile) {
    const boss = runtime.boss;
    const bossCenterX = boss.x + boss.w / 2;
    const projectileCenterX = projectile.x + projectile.w / 2;
    const dirX = projectileCenterX < bossCenterX ? -1 : 1;
    const currentSpeed = Math.max(80, Math.hypot(projectile.vx, projectile.vy));
    const speed = currentSpeed * 0.92;
    const diagonalSpeed = speed / Math.SQRT2;

    projectile.vx = dirX * diagonalSpeed;
    projectile.vy = -diagonalSpeed;
    projectile.x += dirX * 4;
    projectile.y -= 3;
    projectile.reflected = true;
    projectile.ignoreBossTimer = 0.16;
    projectile.life = Math.max(projectile.life, 0.45);
    projectile.maxLife = Math.max(projectile.maxLife || projectile.life, projectile.life);

    boss.triggerReflectFlash?.(0.18);
    runtime.camera?.shake?.(1, 0.08);
    runtime.spawnSparkles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#dff5ff', 8);
    runtime.app.audio.playSfx('boss_shield_block');

    if (boss.bowShieldHintTimer <= 0) {
      runtime.hud.showBanner('おじぎで作法の壁をほどくの！');
      boss.bowShieldHintTimer = 2.2;
    }
  }
}
