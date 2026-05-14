/**
 * 責務: プレイヤー本体の状態統合、移動更新、被弾・回復・各アクション部品の接続を担当する。
 * 更新ルール: 入力解釈・魔法・おじぎ・ティータイムの詳細は専用クラスへ分離し、Player肥大化を避ける。なのちゃん関連は演出タイマーと入力抑止の受け口に限定する。
 * 更新ルール: 地面・壁・アイテム取得はgetBounds、被弾はgetDamageBoundsで用途別に公開する。
 * 更新ルール: 表示状態は物理・足場効果でonGround/vyが確定した後にupdateVisualStateで更新する。
 */
import { Actor } from '../Actor.js';
import { PLAYER_CONFIG } from '../../config/playerConfig.js';
import { approach } from '../../utils/math.js';
import { PlayerController } from './PlayerController.js';
import { PlayerStateMachine } from './PlayerStateMachine.js';
import { PlayerMagic } from './PlayerMagic.js';
import { PlayerBowAction } from './PlayerBowAction.js';
import { PlayerTeaTime } from './PlayerTeaTime.js';

function getBodyBoundsOffset(player) {
  return {
    x: (player.w - PLAYER_CONFIG.BODY_BOUNDS_W) / 2,
    y: player.h - PLAYER_CONFIG.BODY_BOUNDS_H - 8,
  };
}

export class Player extends Actor {
  constructor({ x, y, input, upgrades = {}, baseHp = 3 }) {
    super({ x, y, w: PLAYER_CONFIG.WIDTH, h: PLAYER_CONFIG.HEIGHT });
    this.drawW = PLAYER_CONFIG.DRAW_W;
    this.drawH = PLAYER_CONFIG.DRAW_H;
    this.upgrades = { maxHp: 0, magic: 0, bow: 0, tea: 0, ...upgrades };
    this.baseHp = baseHp;
    this.maxHp = this.baseHp + this.upgrades.maxHp;
    this.hp = this.maxHp;
    this.facing = 1;
    this.controller = new PlayerController(input);
    this.stateMachine = new PlayerStateMachine(this);
    this.lastVisualCommand = { moveX: 0 };
    this.magic = new PlayerMagic(this);
    this.bow = new PlayerBowAction(this);
    this.tea = new PlayerTeaTime(this);
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.jellyBounceLock = 0;
    this.invincibleTimer = 0;
    this.damageFlash = 0;
    this.nanoSwapFxTimer = 0;
    this.nanoSwapFailFxTimer = 0;
    this.dead = false;
  }

  getBoundsAt(x = this.x, y = this.y) {
    const offset = getBodyBoundsOffset(this);
    return {
      x: x + offset.x,
      y: y + offset.y,
      w: PLAYER_CONFIG.BODY_BOUNDS_W,
      h: PLAYER_CONFIG.BODY_BOUNDS_H,
    };
  }

  getBounds() {
    return this.getBoundsAt(this.x, this.y);
  }

  getPositionFromBounds(boundsX, boundsY) {
    const offset = getBodyBoundsOffset(this);
    return {
      x: boundsX - offset.x,
      y: boundsY - offset.y,
    };
  }

  setPositionFromBounds(boundsX, boundsY) {
    const position = this.getPositionFromBounds(boundsX, boundsY);
    this.x = position.x;
    this.y = position.y;
  }

  getDamageBoundsAt(x = this.x, y = this.y) {
    const body = this.getBoundsAt(x, y);
    return {
      x: body.x + (body.w - PLAYER_CONFIG.DAMAGE_BOUNDS_W) / 2,
      y: body.y + (body.h - PLAYER_CONFIG.DAMAGE_BOUNDS_H) / 2,
      w: PLAYER_CONFIG.DAMAGE_BOUNDS_W,
      h: PLAYER_CONFIG.DAMAGE_BOUNDS_H,
    };
  }

  getDamageBounds() {
    return this.getDamageBoundsAt(this.x, this.y);
  }

  update(dt, stageScene) {
    const cmd = this.controller.read(dt);
    this.lastVisualCommand = cmd;
    if (cmd.moveX !== 0) this.facing = cmd.moveX;

    this.magic.update(dt);
    this.bow.update(dt);
    this.tea.update(dt);
    this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
    this.damageFlash = Math.max(0, this.damageFlash - dt);
    this.nanoSwapFxTimer = Math.max(0, this.nanoSwapFxTimer - dt);
    this.nanoSwapFailFxTimer = Math.max(0, this.nanoSwapFailFxTimer - dt);

    if (this.onGround) this.coyoteTimer = PLAYER_CONFIG.COYOTE_TIME;
    else this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);

    if (cmd.jumpPressed) this.jumpBufferTimer = PLAYER_CONFIG.JUMP_BUFFER;
    else this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);

    if (this.tea.activeTimer <= 0 && this.bow.activeTimer <= 0) {
      const targetSpeed = cmd.moveX * (this.onGround ? PLAYER_CONFIG.MOVE_SPEED : PLAYER_CONFIG.AIR_SPEED);
      const accel = (this.onGround ? PLAYER_CONFIG.ACCEL_GROUND : PLAYER_CONFIG.ACCEL_AIR) * dt;
      this.vx = approach(this.vx, targetSpeed, accel);
      if (!cmd.moveX && this.onGround) this.vx = approach(this.vx, 0, PLAYER_CONFIG.FRICTION * dt);
    } else {
      this.vx = approach(this.vx, 0, PLAYER_CONFIG.FRICTION * dt);
    }

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && this.tea.activeTimer <= 0 && this.bow.activeTimer <= 0) {
      this.vy = stageScene.getPlayerJumpSpeed?.(this) ?? PLAYER_CONFIG.JUMP_SPEED;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.onGround = false;
      stageScene.app.audio.playSfx('player_jump');
    }

    if (!cmd.jumpDown && this.vy < -90 && this.jellyBounceLock <= 0) {
      this.vy += 520 * dt;
    }

    if (cmd.down && !this.onGround && this.vy > 0) {
      this.vy *= 0.96;
    }

    if (cmd.magicCast && this.tea.activeTimer <= 0 && this.bow.activeTimer <= 0) this.magic.tryCast(stageScene, cmd.magicDirection);
    if (cmd.bowPressed && this.tea.activeTimer <= 0) this.bow.tryUse(stageScene);
    if (cmd.teaPressed && this.bow.activeTimer <= 0 && this.onGround) this.tea.tryUse(stageScene);

    this.vy = Math.min(this.vy + PLAYER_CONFIG.GRAVITY * dt, PLAYER_CONFIG.MAX_FALL_SPEED);
  }

  updateVisualState(command = this.lastVisualCommand) {
    this.stateMachine.update(command || { moveX: 0 });
  }

  settleForEvent(dt) {
    this.magic.update(dt);
    this.bow.update(dt);
    this.tea.update(dt);
    this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
    this.damageFlash = Math.max(0, this.damageFlash - dt);
    this.nanoSwapFxTimer = Math.max(0, this.nanoSwapFxTimer - dt);
    this.nanoSwapFailFxTimer = Math.max(0, this.nanoSwapFailFxTimer - dt);
    this.jumpBufferTimer = 0;
    this.coyoteTimer = this.onGround ? PLAYER_CONFIG.COYOTE_TIME : Math.max(0, this.coyoteTimer - dt);
    this.vx = 0;
    this.lastVisualCommand = { moveX: 0 };
    this.vy = Math.min(this.vy + PLAYER_CONFIG.GRAVITY * dt, PLAYER_CONFIG.MAX_FALL_SPEED);
  }

  isDamageInvincible() {
    return this.invincibleTimer > 0 || this.bow.activeTimer > 0;
  }

  hit(stageScene, sourceFacing = 1) {
    if (this.dead || this.isDamageInvincible()) return false;
    const infiniteHp = !!stageScene.app?.debug?.get('infiniteHp');
    if (!infiniteHp) this.hp -= 1;
    else this.hp = Math.max(1, this.hp);
    this.invincibleTimer = PLAYER_CONFIG.HIT_INVINCIBLE;
    this.damageFlash = 0.28;
    this.vx = 120 * sourceFacing;
    this.vy = -170;
    stageScene.camera.shake(4, 0.18);
    stageScene.flashTimer = 0.18;
    const damageBounds = this.getDamageBounds();
    stageScene.spawnSparkles(damageBounds.x + damageBounds.w / 2, damageBounds.y + damageBounds.h / 2, infiniteHp ? '#d7f8ff' : '#ffd1d1', 12);
    stageScene.app.audio.playSfx(!infiniteHp && this.hp <= 0 ? 'player_down' : 'player_hurt');
    if (!infiniteHp && this.hp <= 0) this.dead = true;
    return true;
  }
}
