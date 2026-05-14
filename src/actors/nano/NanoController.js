/**
 * 責務: 入力状態をなのちゃんへの待機・呼び戻し・即時発射コマンドへ変換する。
 * 更新ルール: 位置移動・衝突・演出はNanoCompanionへ任せ、ここではNボタン押下前後の短い入力猶予を含む方向入力解釈だけを扱い、長押し照準状態は持たない。
 * 更新ルール: 発射方向の上入力はINPUT_ACTIONS.UPのみを見る。Space/Zなどのジャンプ専用入力は上方向として扱わない。
 * 更新ルール: なのちゃん発射方向はActionLaunchDirectionResolverへ委譲し、上下軸・左右軸の押下ズレと発射専用フリック方向を合成する。
 */
import { INPUT_ACTIONS } from '../../config/inputActions.js';
import { NANO_STATES } from '../../config/nanoConfig.js';
import { ActionLaunchDirectionResolver } from '../../systems/ActionLaunchDirectionResolver.js';

export class NanoController {
  constructor(input) {
    this.input = input;
    this.prevNanoDown = false;
    this.launchDirectionResolver = new ActionLaunchDirectionResolver(input, INPUT_ACTIONS.NANO);
  }

  update(dt, nano, runtime) {
    this.launchDirectionResolver.update(dt);
    this.updatePendingHeadPress(nano, runtime);

    const nanoDown = this.input.isDown(INPUT_ACTIONS.NANO);
    const nanoPressed = nanoDown && !this.prevNanoDown;

    if (nanoPressed) this.handlePressed(nano, runtime);
    this.prevNanoDown = nanoDown;
  }

  handlePressed(nano, runtime) {
    if (nano.state === NANO_STATES.HEAD) {
      const dir = this.launchDirectionResolver.press();
      if (dir !== undefined) this.applyHeadLaunchResult(nano, runtime, dir);
      return;
    }

    this.launchDirectionResolver.clearPending();
    if (nano.canReturnByInput()) nano.startReturn();
  }

  updatePendingHeadPress(nano, runtime) {
    const dir = this.launchDirectionResolver.consumePending();
    if (dir === undefined) return;

    if (nano.state !== NANO_STATES.HEAD) {
      this.launchDirectionResolver.clearPending();
      return;
    }

    this.applyHeadLaunchResult(nano, runtime, dir);
  }

  applyHeadLaunchResult(nano, runtime, dir) {
    if (this.launchDirectionResolver.hasDirection(dir)) {
      nano.launchFromHead(runtime, dir);
    } else {
      nano.waitFromHead();
    }
  }
}
