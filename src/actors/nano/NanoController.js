/**
 * 責務: 入力状態をなのちゃんへの待機・呼び戻し・即時発射コマンドへ変換する。
 * 更新ルール: 位置移動・衝突・演出はNanoCompanionへ任せ、ここではNボタン押下前後の短い入力猶予を含む方向入力解釈だけを扱い、長押し照準状態は持たない。
 * 更新ルール: 発射方向の上入力はINPUT_ACTIONS.UPのみを見る。Space/Zなどのジャンプ専用入力は上方向として扱わない。
 */
import { INPUT_ACTIONS } from '../../config/inputActions.js';
import { NANO_STATES } from '../../config/nanoConfig.js';

const DIRECTION_BUFFER_TIME = 0.15;
const NANO_PRESS_DIRECTION_GRACE_TIME = 0.12;

export class NanoController {
  constructor(input) {
    this.input = input;
    this.prevNanoDown = false;
    this.lastDirection = { x: 0, y: 0 };
    this.directionBufferTimer = 0;
    this.pendingHeadPressTimer = 0;
  }

  update(dt, nano, runtime) {
    this.updateDirectionBuffer(dt);
    this.updatePendingHeadPress(dt, nano, runtime);

    const nanoDown = this.input.isDown(INPUT_ACTIONS.NANO);
    const nanoPressed = nanoDown && !this.prevNanoDown;

    if (nanoPressed) this.handlePressed(nano, runtime);
    this.prevNanoDown = nanoDown;
  }

  updateDirectionBuffer(dt) {
    const dir = this.readCurrentDirection();
    if (this.hasDirection(dir)) {
      this.lastDirection = dir;
      this.directionBufferTimer = DIRECTION_BUFFER_TIME;
      return;
    }
    this.directionBufferTimer = Math.max(0, this.directionBufferTimer - dt);
  }

  handlePressed(nano, runtime) {
    if (nano.state === NANO_STATES.HEAD) {
      const dir = this.readLaunchDirection();
      if (this.hasDirection(dir)) {
        nano.launchFromHead(runtime, dir);
      } else {
        this.pendingHeadPressTimer = NANO_PRESS_DIRECTION_GRACE_TIME;
      }
      return;
    }

    this.pendingHeadPressTimer = 0;
    if (nano.canReturnByInput()) nano.startReturn();
  }

  updatePendingHeadPress(dt, nano, runtime) {
    if (this.pendingHeadPressTimer <= 0) return;

    if (nano.state !== NANO_STATES.HEAD) {
      this.pendingHeadPressTimer = 0;
      return;
    }

    const dir = this.readLaunchDirection();
    if (this.hasDirection(dir)) {
      this.pendingHeadPressTimer = 0;
      nano.launchFromHead(runtime, dir);
      return;
    }

    this.pendingHeadPressTimer -= dt;
    if (this.pendingHeadPressTimer <= 0) {
      this.pendingHeadPressTimer = 0;
      nano.waitFromHead();
    }
  }

  readLaunchDirection() {
    const current = this.readCurrentDirection();
    if (this.hasDirection(current)) return current;
    if (this.directionBufferTimer > 0) return this.lastDirection;
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
