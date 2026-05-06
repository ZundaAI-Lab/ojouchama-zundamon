/**
 * 責務: なのちゃん救出イベントの状態遷移、魔法命中判定、加入確定処理を担当する。
 * 更新ルール: トリガー座標はstage.specialEvents、演出や台詞はconfig/nanoRescueConfig.js、描画はNanoRescueEventRendererへ分離し、このクラスは特殊イベントの進行だけを扱う。
 * 更新ルール: 救出後チュートリアルのDOM起動はRuntimeへ予約通知するだけに留め、会話中に別UIを直接開かない。
 * 更新ルール: 救出イベント中のBGM切替・再開はRuntimeへ通知し、このクラスはイベント進行タイミングと使用テーマIDの指定だけを担当する。
 */
import { GAME_VIEW } from '../config/view.js';
import { NANO_CONFIG } from '../config/nanoConfig.js';
import { getNanoRescueEventConfig, NANO_RESCUE_STORY_FLAG } from '../config/nanoRescueConfig.js';
import { NANO_THEME_BGM_ID } from '../data/audio/bgmTrackDefs.js';
import { intersects } from '../utils/rect.js';

const STATE = {
  INACTIVE: 'inactive',
  SEALED: 'sealed',
  BREAKING: 'breaking',
  REVEAL_WAIT: 'revealWait',
  REVEAL_JUMP: 'revealJump',
  REVEAL_JUMP_HOLD: 'revealJumpHold',
  DIALOGUE: 'dialogue',
  RELEASED_RUN: 'releasedRun',
  MEET_PLAYER: 'meetPlayer',
  MEET_WAIT: 'meetWait',
  MOUNT: 'mount',
  MOUNT_HOLD: 'mountHold',
  COMPLETED: 'completed',
};


function getNanoRescueEventObject(stage) {
  return (stage?.specialEvents || []).find(eventObject => eventObject?.kind === 'nanoRescue') || null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function moveTowardPoint(actor, target, speed, dt) {
  const dx = target.x - actor.x;
  const dy = target.y - actor.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= 0.01 || dist <= speed * dt) {
    actor.x = target.x;
    actor.y = target.y;
    return true;
  }
  actor.x += dx / dist * speed * dt;
  actor.y += dy / dist * speed * dt;
  return false;
}

export class NanoRescueEventSystem {
  constructor(runtime) {
    this.runtime = runtime;
    this.object = getNanoRescueEventObject(runtime.stage);
    this.config = this.object ? getNanoRescueEventConfig(this.object.configId) : null;
    this.state = STATE.INACTIVE;
    this.timer = 0;
    this.nanoVisual = null;
    this.path = [];
    this.pathIndex = 0;
    this.mountStart = null;
    this.revealJumpStart = null;
    this.joinApplied = false;

    if (!this.config || !this.object) return;
    const joined = !!runtime.saveData?.storyFlags?.[NANO_RESCUE_STORY_FLAG];
    this.state = joined ? STATE.COMPLETED : STATE.SEALED;
    this.joinApplied = joined;
  }

  get active() {
    return this.state !== STATE.INACTIVE && this.state !== STATE.COMPLETED;
  }

  isBlockingGameplay() {
    return this.state === STATE.BREAKING ||
      this.state === STATE.REVEAL_WAIT ||
      this.state === STATE.REVEAL_JUMP ||
      this.state === STATE.REVEAL_JUMP_HOLD ||
      this.state === STATE.RELEASED_RUN ||
      this.state === STATE.MEET_PLAYER ||
      this.state === STATE.MEET_WAIT ||
      this.state === STATE.MOUNT ||
      this.state === STATE.MOUNT_HOLD;
  }

  isVisible() {
    return this.active;
  }

  getObjectFrame() {
    return this.object || null;
  }

  getHitBounds() {
    if (!this.config || !this.object) return null;
    const object = this.object;
    const hitbox = object.hitbox || { x: 0, y: 0, w: object.w, h: object.h };
    return {
      x: object.x + hitbox.x,
      y: object.y + hitbox.y,
      w: hitbox.w,
      h: hitbox.h,
    };
  }

  getDomeImageKey() {
    if (!this.config) return null;
    if (this.state === STATE.SEALED) return this.config.trappedImageKey;
    if (this.state === STATE.BREAKING && this.timer < this.config.breakingTime * 0.34) return this.config.trappedImageKey;
    return this.config.brokenImageKey;
  }

  getBreakingFlashRate() {
    if (this.state !== STATE.BREAKING) return 0;
    const rate = 1 - Math.min(1, this.timer / Math.max(0.01, this.config.breakingTime));
    return Math.max(0, rate);
  }

  getNanoVisualFrame() {
    return this.nanoVisual;
  }

  shouldRenderNanoInFront() {
    return this.state === STATE.REVEAL_WAIT ||
      this.state === STATE.REVEAL_JUMP ||
      this.state === STATE.REVEAL_JUMP_HOLD ||
      this.state === STATE.MOUNT;
  }

  hitWithMagic(projectile) {
    if (this.state !== STATE.SEALED || !projectile?.alive || projectile.faction !== 'player') return false;
    const hitBounds = this.getHitBounds();
    if (!hitBounds || !intersects(projectile.getBounds(), hitBounds)) return false;

    projectile.alive = false;
    this.startBreaking();
    return true;
  }

  startBreaking() {
    const object = this.object;
    this.state = STATE.BREAKING;
    this.timer = 0;
    this.runtime.app.input.clearGameplay();
    this.runtime.startEventBgm?.(NANO_THEME_BGM_ID);
    this.runtime.spawnSparkles(object.x + object.w / 2, object.y + object.h * 0.45, '#fff1a8', 24);
    this.runtime.spawnSparkles(object.x + object.w / 2, object.y + object.h * 0.62, '#ff9fc8', 18);
    this.runtime.app.audio.playSfx('nano_rescue_crack');
  }

  update(dt) {
    if (!this.active) return;

    if (this.state === STATE.BREAKING) {
      this.timer += dt;
      if (this.timer >= this.config.breakingTime) this.startRevealWait();
      return;
    }

    if (this.state === STATE.REVEAL_WAIT) {
      this.timer += dt;
      if (this.timer >= this.config.revealWaitTime) this.startRevealDialogue();
      return;
    }

    if (this.state === STATE.REVEAL_JUMP) {
      this.updateRevealJump(dt);
      return;
    }

    if (this.state === STATE.REVEAL_JUMP_HOLD) {
      this.updateRevealJumpHold(dt);
      return;
    }

    if (this.state === STATE.RELEASED_RUN) {
      this.updateReleasedRun(dt);
      return;
    }

    if (this.state === STATE.MEET_PLAYER) {
      this.updateMeetPlayer(dt);
      return;
    }

    if (this.state === STATE.MEET_WAIT) {
      this.updateMeetWait(dt);
      return;
    }

    if (this.state === STATE.MOUNT) {
      this.updateMount(dt);
      return;
    }

    if (this.state === STATE.MOUNT_HOLD) {
      this.updateMountHold(dt);
    }
  }

  startRevealWait() {
    const object = this.object;
    const draw = this.config.nanoDraw;
    this.nanoVisual = {
      x: object.x + object.w / 2 - draw.w / 2,
      y: object.y + object.h * 0.55 - draw.h / 2,
      w: draw.w,
      h: draw.h,
      imageKey: 'npc_teacup_fairy_surprise',
      facing: 1,
      alpha: 1,
    };
    this.state = STATE.REVEAL_WAIT;
    this.timer = 0;
    this.runtime.spawnSparkles(this.nanoVisual.x + draw.w / 2, this.nanoVisual.y + draw.h / 2, '#d9fff2', 18);
    this.runtime.app.audio.playSfx('nano_rescue_success_jingle');
  }

  startRevealDialogue() {
    this.state = STATE.DIALOGUE;
    this.runtime.app.input.clearGameplay();
    this.runtime.dialogue.start(this.config.revealDialogue || [], () => {
      this.startRevealJump();
    }, { position: 'center' });
  }

  startRevealJump() {
    if (!this.nanoVisual) this.createNanoVisualAtDome('npc_teacup_fairy_jump');
    this.nanoVisual.imageKey = 'npc_teacup_fairy_jump';
    this.revealJumpStart = { x: this.nanoVisual.x, y: this.nanoVisual.y };
    this.state = STATE.REVEAL_JUMP;
    this.timer = 0;
    this.runtime.app.audio.playSfx('nano_launch');
  }

  updateRevealJump(dt) {
    if (!this.nanoVisual || !this.revealJumpStart) return;
    this.timer += dt;
    const rate = Math.min(1, this.timer / Math.max(0.01, this.config.revealJumpTime));
    this.nanoVisual.x = this.revealJumpStart.x;
    this.nanoVisual.y = this.revealJumpStart.y - Math.sin(rate * Math.PI) * 20;
    if (rate >= 1) this.startRevealJumpHold();
  }

  startRevealJumpHold() {
    if (this.nanoVisual && this.revealJumpStart) {
      this.nanoVisual.x = this.revealJumpStart.x;
      this.nanoVisual.y = this.revealJumpStart.y;
      this.nanoVisual.imageKey = 'npc_teacup_fairy_happy';
    }
    this.state = STATE.REVEAL_JUMP_HOLD;
    this.timer = 0;
  }

  updateRevealJumpHold(dt) {
    this.timer += dt;
    if (this.timer >= this.config.revealJumpHoldTime) this.startReleasedRun();
  }

  createNanoVisualAtDome(imageKey) {
    const object = this.object;
    const draw = this.config.nanoDraw;
    this.nanoVisual = {
      x: object.x + object.w / 2 - draw.w / 2,
      y: object.y + object.h * 0.54 - draw.h / 2,
      w: draw.w,
      h: draw.h,
      imageKey,
      facing: 1,
      alpha: 1,
    };
  }

  startReleasedRun() {
    const draw = this.config.nanoDraw;
    if (!this.nanoVisual) this.createNanoVisualAtDome('npc_teacup_fairy_spin');
    this.nanoVisual.w = draw.w;
    this.nanoVisual.h = draw.h;
    this.nanoVisual.imageKey = 'npc_teacup_fairy_spin';
    this.path = this.createRunPath();
    this.pathIndex = 0;
    this.state = STATE.RELEASED_RUN;
    this.timer = 0;
  }

  createRunPath() {
    const draw = this.config.nanoDraw;
    const camera = this.runtime.camera;
    const left = camera.x + 36;
    const right = camera.x + GAME_VIEW.WIDTH - 36;
    const top = camera.y + 38;
    const bottom = camera.y + GAME_VIEW.HEIGHT - 72;
    const object = this.object;
    const cx = object.x + object.w / 2;

    const points = [
      { x: cx - 150, y: top + 18 },
      { x: cx + 150, y: top + 58 },
      { x: cx - 94, y: bottom - 10 },
      { x: cx + 108, y: top + 28 },
    ];

    return points.map(point => ({
      x: clamp(point.x - draw.w / 2, left, right - draw.w),
      y: clamp(point.y - draw.h / 2, top, bottom - draw.h),
    }));
  }

  updateReleasedRun(dt) {
    if (!this.nanoVisual) return;
    const target = this.path[this.pathIndex];
    if (!target) {
      this.state = STATE.MEET_PLAYER;
      this.nanoVisual.imageKey = 'npc_teacup_fairy_happy';
      return;
    }
    const beforeX = this.nanoVisual.x;
    const reached = moveTowardPoint(this.nanoVisual, target, this.config.releasedRunSpeed, dt);
    this.nanoVisual.facing = this.nanoVisual.x >= beforeX ? 1 : -1;
    if (reached) this.pathIndex += 1;
  }

  updateMeetPlayer(dt) {
    if (!this.nanoVisual) return;
    const target = this.getMeetTarget();
    const beforeX = this.nanoVisual.x;
    const reached = moveTowardPoint(this.nanoVisual, target, this.config.meetSpeed, dt);
    this.nanoVisual.facing = this.nanoVisual.x >= beforeX ? 1 : -1;
    if (reached) this.startMeetWait();
  }

  startMeetWait() {
    const target = this.getMeetTarget();
    if (this.nanoVisual) {
      this.nanoVisual.x = target.x;
      this.nanoVisual.y = target.y;
      this.nanoVisual.imageKey = 'npc_teacup_fairy_happy';
      this.faceNanoTowardPlayer();
    }
    this.state = STATE.MEET_WAIT;
    this.timer = 0;
  }

  updateMeetWait(dt) {
    if (!this.nanoVisual) return;
    const target = this.getMeetTarget();
    this.nanoVisual.x = target.x;
    this.nanoVisual.y = target.y;
    this.faceNanoTowardPlayer();
    this.timer += dt;
    if (this.timer >= this.config.meetDialogueWaitTime) this.startDialogue();
  }

  faceNanoTowardPlayer() {
    if (!this.nanoVisual) return;
    const player = this.runtime.player;
    const playerCenterX = player.x + player.w / 2;
    const nanoCenterX = this.nanoVisual.x + this.nanoVisual.w / 2;
    this.nanoVisual.facing = playerCenterX >= nanoCenterX ? 1 : -1;
  }

  getMeetTarget() {
    const draw = this.config.nanoDraw;
    const player = this.runtime.player;
    const facing = player.facing || 1;
    const centerX = player.x + player.w / 2 + facing * 42;
    const centerY = player.y + 7;
    return {
      x: centerX - draw.w / 2,
      y: centerY - draw.h / 2,
    };
  }

  startDialogue() {
    this.state = STATE.DIALOGUE;
    this.runtime.app.input.clearGameplay();
    this.faceNanoTowardPlayer();
    this.runtime.dialogue.start(this.config.preMountDialogue || [], () => {
      this.state = STATE.MOUNT;
      this.timer = 0;
      this.mountStart = this.nanoVisual ? { x: this.nanoVisual.x, y: this.nanoVisual.y } : this.getMeetTarget();
      if (this.nanoVisual) this.nanoVisual.imageKey = 'npc_teacup_fairy_happy';
    }, { position: 'center' });
  }

  updateMount(dt) {
    if (!this.nanoVisual) return;
    this.timer += dt;
    const rate = Math.min(1, this.timer / Math.max(0.01, this.config.mountTime));
    const eased = 1 - Math.pow(1 - rate, 3);
    const target = this.getMountTarget();
    this.nanoVisual.x = this.mountStart.x + (target.x - this.mountStart.x) * eased;
    this.nanoVisual.y = this.mountStart.y + (target.y - this.mountStart.y) * eased - Math.sin(rate * Math.PI) * 18;
    this.nanoVisual.facing = this.runtime.player.facing || 1;

    if (rate >= 1) this.startMountHold();
  }

  startMountHold() {
    this.applyJoinedHeadState();
    this.nanoVisual = null;
    this.state = STATE.MOUNT_HOLD;
    this.timer = 0;
  }

  applyJoinedHeadState() {
    if (this.joinApplied) return;
    this.runtime.completeNanoRescueEvent?.();
    this.joinApplied = true;
  }

  updateMountHold(dt) {
    this.timer += dt;
    this.runtime.nano?.attachToPlayer?.(this.runtime.player);
    if (this.timer >= this.config.mountHoldTime) this.startPostMountDialogue();
  }

  getMountTarget() {
    const draw = this.config.nanoDraw;
    const player = this.runtime.player;
    const actorX = player.x + player.w / 2 - NANO_CONFIG.BODY_W / 2 + NANO_CONFIG.HEAD_OFFSET_X;
    const actorY = player.y + NANO_CONFIG.HEAD_OFFSET_Y;
    return {
      x: actorX + NANO_CONFIG.BODY_W / 2 - draw.w / 2,
      y: actorY + NANO_CONFIG.BODY_H / 2 - draw.h / 2,
    };
  }

  startPostMountDialogue() {
    const lines = this.config.postMountDialogue || [];
    if (lines.length <= 0) {
      this.finishEvent();
      return;
    }
    this.state = STATE.DIALOGUE;
    this.runtime.app.input.clearGameplay();
    this.runtime.dialogue.start(lines, () => {
      this.finishEvent();
    }, { position: 'center' });

  }

  finishEvent() {
    this.state = STATE.COMPLETED;
    this.runtime.resumeStageBgmAfterEvent?.();
    this.runtime.scheduleNanoRescueTutorial?.();
  }
}
