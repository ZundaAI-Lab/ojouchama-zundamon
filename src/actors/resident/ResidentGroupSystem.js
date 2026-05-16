/**
 * 責務: 任意スコープの迷える住民配列を、共通Resident.updateでまとめて更新する。
 * 更新ルール: 通常ステージ/風船ライドの違いはContext側に閉じ込め、ここでは住民種別名やライド専用分岐を持たない。
 * 更新ルール: 浄化直後に残る魔法命中リアクションは、行動停止中の住民にも実座標反映とタイマー更新を続ける。
 */
export class ResidentGroupSystem {
  static update(residents, dt, context) {
    for (const resident of residents) {
      if (resident.alive === false) {
        resident.updateInactiveHitReaction?.(dt);
        continue;
      }
      resident.update(dt, context);
    }
  }
}
