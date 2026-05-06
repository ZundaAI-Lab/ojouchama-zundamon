/**
 * 責務: ボスエリア到達時の出現演出、会話、ボス戦開始、撃破後の消滅演出・報酬生成・浄化後会話制御を担当する。
 * 更新ルール: ボス本体AIや描画はactors/renderへ分離し、ボスの戦闘可能状態はこのControllerの状態で判定する。
 * 更新ルール: クリア済みステージの会話スキップ時も、出現・撃破後演出・報酬生成・待機の状態遷移は維持して会話開始だけを省略する。
 * 更新ルール: ボス戦BGMの選択はBGM定義の解決関数に委譲し、このControllerでは戦闘状態の切替だけを行う。
 * 更新ルール: ボス登場時はRuntimeへステージBGMフェードアウトだけ通知し、実際の音量制御はAudioSystemへ委譲する。
 */
import { GAME_VIEW } from '../config/view.js';
import { RewardCoinDropService } from './RewardCoinDropService.js';
import { resolveBossBgmId, resolveStageBgmId } from '../data/audio/bgmTrackDefs.js';

const BOSS_APPEAR_DURATION = 1.15;
const BOSS_PURIFY_DURATION = 1.3;
const BOSS_REWARD_WAIT_DURATION = 1;
const BOSS_ENTRY_MARGIN = 8;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeOutCubic(value) {
  const t = clamp01(value);
  return 1 - (1 - t) ** 3;
}

function getBossVisualBounds(boss) {
  const drawW = boss.drawW || boss.w;
  const drawH = boss.drawH || boss.h;
  const centerX = boss.x + boss.w / 2;
  return {
    left: centerX - drawW / 2,
    right: centerX + drawW / 2,
    top: boss.y + boss.h - drawH,
    bottom: boss.y + boss.h,
  };
}

function getCameraRect(runtime) {
  const x = runtime.camera?.x ?? 0;
  const y = runtime.camera?.y ?? 0;

  return {
    left: x,
    right: x + GAME_VIEW.WIDTH,
    top: y,
    bottom: y + GAME_VIEW.HEIGHT,
  };
}

function clonePoint(point) {
  return { x: point.x, y: point.y };
}

export class BossEncounterController {
  static initialize(runtime) {
    if (!runtime.boss) {
      runtime.bossEncounterState = 'none';
      runtime.bossBattleStarted = false;
      runtime.bossIntroTimer = 0;
      runtime.bossPurifyTimer = 0;
      runtime.bossRewardWaitTimer = 0;
      runtime.bossRewardDropped = false;
      runtime.bossBattleRespawnPoint = null;
      return;
    }

    const resumeBattle = !!(runtime.params.resumeBossBattle || runtime.params.skipBossDialogue);
    runtime.bossEncounterState = resumeBattle ? 'battle' : 'hidden';
    runtime.bossBattleStarted = resumeBattle;
    runtime.bossIntroTimer = 0;
    runtime.bossPurifyTimer = 0;
    runtime.bossRewardWaitTimer = 0;
    runtime.bossRewardDropped = false;
    runtime.bossBattleRespawnPoint = resumeBattle ? clonePoint(runtime.initialSpawn) : null;

    runtime.boss.visible = resumeBattle;
    runtime.boss.invulnerable = !resumeBattle;
    runtime.boss.bowShieldActive = false;
    runtime.boss.bowShieldBroken = false;
    runtime.boss.reflectFlash = 0;
    runtime.boss.bowShieldReleaseFlash = 0;
    runtime.boss.bowShieldBreakLockTimer = 0;
    if (resumeBattle) runtime.boss.startBattleShield?.();
    runtime.boss.appearProgress = resumeBattle ? 1 : 0;
    runtime.boss.purifyProgress = 0;
    runtime.boss.purifying = false;
  }

  static shouldShowGauge(runtime) {
    return this.isBattleActive(runtime) && !runtime.dialogue?.active;
  }

  static isBattleActive(runtime) {
    return !!(
      runtime.boss &&
      runtime.boss.alive &&
      runtime.bossEncounterState === 'battle'
    );
  }

  static canHitBoss(runtime) {
    return this.isBattleActive(runtime) && !runtime.boss.invulnerable;
  }

  static shouldUpdateBoss(runtime) {
    return this.isBattleActive(runtime);
  }

  static getDialogue(runtime) {
    if (Array.isArray(runtime.stage.bossDialogue) && runtime.stage.bossDialogue.length > 0) {
      return runtime.stage.bossDialogue;
    }
    return [
      { portrait: 'portrait_determined', speaker: 'お嬢ちゃまずんだもん', text: `${runtime.boss.name}なの。ここからは、ちゃんとお話してから浄化するの！` },
      { portrait: runtime.boss.imageKey, speaker: runtime.boss.name, text: 'ここまで来たなら、ぼくとお話してから進むんだ。' },
    ];
  }

  static getDefeatDialogue(runtime) {
    if (Array.isArray(runtime.stage.bossDefeatDialogue) && runtime.stage.bossDefeatDialogue.length > 0) {
      return runtime.stage.bossDefeatDialogue;
    }
    return [
      { portrait: runtime.boss.imageKey, speaker: runtime.boss.name, text: '心が、ふわっと軽くなった気がする……。' },
      { portrait: 'portrait_gentle', speaker: 'お嬢ちゃまずんだもん', text: 'よかったの。あとは夢のしずくまで進むの。' },
    ];
  }

  static isEntryTriggerReached(runtime) {
    if (!runtime.boss || !runtime.player || !runtime.isBossArea()) return false;

    const cameraRect = getCameraRect(runtime);
    const bossBounds = getBossVisualBounds(runtime.boss);

    return (
      bossBounds.left >= cameraRect.left + BOSS_ENTRY_MARGIN &&
      bossBounds.right <= cameraRect.right - BOSS_ENTRY_MARGIN &&
      bossBounds.top >= cameraRect.top + BOSS_ENTRY_MARGIN &&
      bossBounds.bottom <= cameraRect.bottom - BOSS_ENTRY_MARGIN
    );
  }

  static tryStart(runtime) {
    if (!runtime.boss || !runtime.boss.alive || runtime.bossEncounterState !== 'hidden') return false;
    if (!this.isEntryTriggerReached(runtime)) return false;

    runtime.app.input.clearGameplay();
    runtime.player.jumpBufferTimer = 0;
    runtime.player.vx = 0;

    if (!runtime.player.onGround) {
      runtime.bossEncounterState = 'landing';
      runtime.hud.showBanner('落ち着いて着地してから、お話しするの');
      return true;
    }

    this.startAppearance(runtime);
    return true;
  }

  static updateEventSequence(runtime, dt) {
    if (!runtime.boss) return false;

    if (runtime.bossEncounterState === 'landing') {
      this.settlePlayerForEvent(runtime, dt);
      if (runtime.player.onGround) this.startAppearance(runtime);
      return true;
    }

    if (runtime.bossEncounterState === 'appearing') {
      this.settlePlayerForEvent(runtime, dt);
      runtime.bossIntroTimer += dt;
      runtime.boss.appearProgress = easeOutCubic(runtime.bossIntroTimer / BOSS_APPEAR_DURATION);

      if (runtime.bossIntroTimer < BOSS_APPEAR_DURATION) {
        const cx = runtime.boss.x + runtime.boss.w / 2;
        const cy = runtime.boss.y + runtime.boss.h / 2;
        runtime.spawnSparkles(cx, cy, '#fff0a8', 2);
      } else {
        this.startPreBattleDialogue(runtime);
      }
      return true;
    }

    if (runtime.bossEncounterState === 'purifying') {
      runtime.app.input.clearGameplay();
      runtime.bossPurifyTimer += dt;
      runtime.boss.purifyProgress = clamp01(runtime.bossPurifyTimer / BOSS_PURIFY_DURATION);

      const cx = runtime.boss.x + runtime.boss.w / 2;
      const cy = runtime.boss.y + runtime.boss.h / 2;
      runtime.spawnSparkles(cx, cy, runtime.bossPurifyTimer < BOSS_PURIFY_DURATION * 0.65 ? '#fff4a3' : '#ffffff', 3);
      this.updateBlockingEventVisuals(runtime, dt);

      if (runtime.bossPurifyTimer >= BOSS_PURIFY_DURATION) {
        this.startRewardDropWait(runtime);
      }
      return true;
    }

    if (runtime.bossEncounterState === 'rewardWait') {
      runtime.app.input.clearGameplay();
      runtime.bossRewardWaitTimer += dt;
      this.updateBlockingEventVisuals(runtime, dt, { rewardDrops: true });
      if (runtime.bossRewardWaitTimer >= BOSS_REWARD_WAIT_DURATION) {
        this.startDefeatDialogue(runtime);
      }
      return true;
    }

    return false;
  }

  static updateBlockingEventVisuals(runtime, dt, { rewardDrops = false } = {}) {
    if (rewardDrops && Array.isArray(runtime.items)) {
      const collisionWorld = runtime.rebuildCollisionWorld();
      RewardCoinDropService.updateItems(runtime.items, dt, collisionWorld, runtime.physics);
      runtime.items = runtime.items.filter(item => item.alive);
    }
    runtime.particleSystem?.update(dt);
    runtime.particles = runtime.particleSystem?.particles || runtime.particles;
  }

  static settlePlayerForEvent(runtime, dt) {
    runtime.app.input.clearGameplay();
    runtime.player.jumpBufferTimer = 0;
    runtime.player.vx = 0;
    runtime.player.settleForEvent(dt);
    const collisionWorld = runtime.rebuildCollisionWorld();
    runtime.physics.moveActor(runtime.player, dt, collisionWorld.playerSolids, {
      useSlopeSurface: true,
      slopeSurfaces: collisionWorld.slopeSurfaces,
    });
  }

  static startAppearance(runtime) {
    runtime.bossEncounterState = 'appearing';
    runtime.bossIntroTimer = 0;
    runtime.boss.visible = true;
    runtime.boss.invulnerable = true;
    runtime.boss.appearProgress = 0;
    runtime.boss.purifyProgress = 0;
    runtime.boss.purifying = false;
    runtime.fadeOutStageBgmForBossIntro?.();
    runtime.app.audio.playSfx('boss_intro_sting');
    runtime.hud.showBanner(`何かの気配が近づいてくるの…`);
  }

  static startPreBattleDialogue(runtime) {
    runtime.bossEncounterState = 'dialogue';
    runtime.boss.visible = true;
    runtime.boss.invulnerable = true;
    runtime.boss.appearProgress = 1;
    runtime.bossDialogueShown = true;
    runtime.bossBattleRespawnPoint = clonePoint(runtime.player);
    runtime.app.input.clearGameplay();

    if (runtime.skipDialogueEvents) {
      this.startBattle(runtime);
      return;
    }

    runtime.dialogue.start(this.getDialogue(runtime), () => {
      BossEncounterController.startBattle(runtime);
    }, { mode: 'bossIntro' });
  }

  static startBattle(runtime) {
    runtime.bossEncounterState = 'battle';
    runtime.bossBattleStarted = true;
    runtime.boss.visible = true;
    runtime.boss.startBattleShield?.();
    runtime.boss.appearProgress = 1;
    runtime.boss.shotTimer = Math.max(runtime.boss.shotTimer, 0.8);
    runtime.app.audio.playBgm(resolveBossBgmId(runtime.stage));
    runtime.app.audio.playSfx('boss_intro_sting');
    const shieldMessage = runtime.boss.bowShieldActive ? 'おじぎで作法の壁をほどくの！' : `${runtime.boss.name}が現れたの！`;
    runtime.hud.showBanner(shieldMessage);
  }

  static clearBossProjectiles(runtime) {
    for (const projectile of runtime.projectiles) {
      if (projectile.source === 'boss') projectile.alive = false;
    }
    runtime.projectiles = runtime.projectiles.filter(projectile => projectile.alive);
  }

  static handleDefeated(runtime) {
    if (!runtime.boss || runtime.boss.alive || runtime.bossDefeatHandled) return false;
    runtime.bossDefeatHandled = true;
    runtime.bossEncounterState = 'purifying';
    runtime.bossPurifyTimer = 0;
    runtime.bossRewardWaitTimer = 0;
    runtime.bossRewardDropped = false;
    runtime.boss.visible = true;
    runtime.boss.invulnerable = true;
    runtime.boss.purifying = true;
    runtime.boss.purifyProgress = 0;

    runtime.purified += 1;
    runtime.app.input.clearGameplay();
    runtime.app.audio.playSfx('boss_defeat_jingle');
    runtime.camera.shake(5, 0.24);
    this.clearBossProjectiles(runtime);
    runtime.hud.showBanner(`${runtime.boss.name}を浄化しているの…`);
    runtime.spawnSparkles(runtime.boss.x + runtime.boss.w / 2, runtime.boss.y + runtime.boss.h / 2, '#fff4a3', 34);
    return true;
  }

  static startRewardDropWait(runtime) {
    runtime.bossEncounterState = 'rewardWait';
    runtime.bossRewardWaitTimer = 0;
    runtime.boss.visible = false;
    runtime.boss.purifying = false;
    runtime.boss.purifyProgress = 1;
    runtime.app.input.clearGameplay();

    if (!runtime.bossRewardDropped) {
      runtime.bossRewardDropped = true;
      RewardCoinDropService.spawn(runtime, runtime.boss, 5);
      runtime.app.audio.playSfx('coin');
      runtime.hud.showBanner('ごほうびの豆コインがこぼれたの！');
    }
  }

  static startDefeatDialogue(runtime) {
    runtime.bossEncounterState = 'postDialogue';
    runtime.boss.visible = false;
    runtime.boss.purifying = false;
    runtime.boss.purifyProgress = 1;
    runtime.bossDefeatDialogueShown = true;
    runtime.app.audio.playBgm(resolveStageBgmId(runtime.stage));
    runtime.app.input.clearGameplay();

    if (runtime.skipDialogueEvents) {
      this.finishDefeatDialogue(runtime);
      return;
    }

    runtime.dialogue.start(this.getDefeatDialogue(runtime), () => {
      BossEncounterController.finishDefeatDialogue(runtime);
    }, { mode: 'bossDefeat' });
  }

  static finishDefeatDialogue(runtime) {
    runtime.bossEncounterState = 'defeated';
    runtime.app.audio.playSfx('door_open');
    runtime.hud.showBanner('夢のしずくへ進めるの！');
  }
}
