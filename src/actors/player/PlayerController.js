/**
 * 責務: 入力状態をプレイヤー用コマンドへ変換する処理を担当する。
 * 更新ルール: 物理移動や攻撃効果を直接変更せず、現行の入力アクション定義に沿って更新する。豆の魔法は方向先押し・豆先押し短時間猶予までをここで解釈し、弾生成はPlayerMagicへ渡す。
 * 更新ルール: 魔法発射方向の上入力はINPUT_ACTIONS.UPのみを見る。Space/Zなどのジャンプ専用入力は上方向として扱わない。
 */
import { INPUT_ACTIONS } from '../../config/inputActions.js';

const MAGIC_DIRECTION_BUFFER_TIME = 0.15;
const MAGIC_PRESS_DIRECTION_GRACE_TIME = 0.12;

export class PlayerController {
  constructor(input) {
    this.input = input;
    this.prevMagicDown = false;
    this.lastMagicDirection = { x: 0, y: 0 };
    this.magicDirectionBufferTimer = 0;
    this.pendingMagicPressTimer = 0;
  }

  read(dt = 0) {
    this.updateMagicDirectionBuffer(dt);
    const pendingMagicDirection = this.consumePendingMagicPress(dt);

    const magicDown = this.input.isDown(INPUT_ACTIONS.MAGIC);
    const magicPressed = magicDown && !this.prevMagicDown;
    let magicCastDirection = pendingMagicDirection;

    if (magicPressed && magicCastDirection === undefined) {
      const dir = this.readMagicLaunchDirection();
      if (this.hasDirection(dir)) {
        magicCastDirection = dir;
        this.pendingMagicPressTimer = 0;
      } else {
        this.pendingMagicPressTimer = MAGIC_PRESS_DIRECTION_GRACE_TIME;
      }
    }
    this.prevMagicDown = magicDown;

    return {
      moveX: (this.input.isDown(INPUT_ACTIONS.RIGHT) ? 1 : 0) - (this.input.isDown(INPUT_ACTIONS.LEFT) ? 1 : 0),
      down: this.input.isDown(INPUT_ACTIONS.DOWN),
      jumpDown: this.input.isDown(INPUT_ACTIONS.JUMP),
      jumpPressed: this.input.wasPressed(INPUT_ACTIONS.JUMP),
      magicCast: magicCastDirection !== undefined,
      magicDirection: magicCastDirection ?? null,
      bowPressed: this.input.wasPressed(INPUT_ACTIONS.BOW),
      teaPressed: this.input.wasPressed(INPUT_ACTIONS.TEA),
    };
  }

  updateMagicDirectionBuffer(dt) {
    const dir = this.readCurrentDirection();
    if (this.hasDirection(dir)) {
      this.lastMagicDirection = dir;
      this.magicDirectionBufferTimer = MAGIC_DIRECTION_BUFFER_TIME;
      return;
    }
    this.magicDirectionBufferTimer = Math.max(0, this.magicDirectionBufferTimer - dt);
  }

  consumePendingMagicPress(dt) {
    if (this.pendingMagicPressTimer <= 0) return undefined;

    const dir = this.readMagicLaunchDirection();
    if (this.hasDirection(dir)) {
      this.pendingMagicPressTimer = 0;
      return dir;
    }

    this.pendingMagicPressTimer -= dt;
    if (this.pendingMagicPressTimer <= 0) {
      this.pendingMagicPressTimer = 0;
      return null;
    }
    return undefined;
  }

  readMagicLaunchDirection() {
    const current = this.readCurrentDirection();
    if (this.hasDirection(current)) return current;
    if (this.magicDirectionBufferTimer > 0) return this.lastMagicDirection;
    return { x: 0, y: 0 };
  }

  readCurrentDirection() {
    const x = (this.input.isDown(INPUT_ACTIONS.RIGHT) ? 1 : 0) - (this.input.isDown(INPUT_ACTIONS.LEFT) ? 1 : 0);
    const y = (this.input.isDown(INPUT_ACTIONS.DOWN) ? 1 : 0) - (this.input.isDown(INPUT_ACTIONS.UP) ? 1 : 0);
    if (x === 0 && y === 0) return { x: 0, y: 0 };
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  }

  hasDirection(dir) {
    return Math.hypot(dir.x, dir.y) > 0.15;
  }
}
