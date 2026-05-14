/**
 * 責務: 入力状態をプレイヤー用コマンドへ変換する処理を担当する。
 * 更新ルール: 物理移動や攻撃効果を直接変更せず、現行の入力アクション定義に沿って更新する。豆の魔法は方向先押し・豆先押し短時間猶予までをここで解釈し、弾生成はPlayerMagicへ渡す。
 * 更新ルール: 魔法発射方向の上入力はINPUT_ACTIONS.UPのみを見る。Space/Zなどのジャンプ専用入力は上方向として扱わない。
 * 更新ルール: 魔法発射方向はActionLaunchDirectionResolverへ委譲し、上下軸・左右軸の押下ズレと発射専用フリック方向を合成する。
 */
import { INPUT_ACTIONS } from '../../config/inputActions.js';
import { ActionLaunchDirectionResolver } from '../../systems/ActionLaunchDirectionResolver.js';

export class PlayerController {
  constructor(input) {
    this.input = input;
    this.prevMagicDown = false;
    this.magicDirectionResolver = new ActionLaunchDirectionResolver(input, INPUT_ACTIONS.MAGIC);
  }

  read(dt = 0) {
    this.magicDirectionResolver.update(dt);
    const pendingMagicDirection = this.magicDirectionResolver.consumePending();

    const magicDown = this.input.isDown(INPUT_ACTIONS.MAGIC);
    const magicPressed = magicDown && !this.prevMagicDown;
    let magicCastDirection = pendingMagicDirection;

    if (magicPressed && magicCastDirection === undefined) {
      magicCastDirection = this.magicDirectionResolver.press();
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
}
