/**
 * 責務: 任意スコープの迷える住民配列を、共通Resident.updateでまとめて更新する。
 * 更新ルール: 通常ステージ/風船ライドの違いはContext側に閉じ込め、ここでは住民種別名やライド専用分岐を持たない。
 */
export class ResidentGroupSystem {
  static update(residents, dt, context) {
    for (const resident of residents) {
      if (resident.alive === false) continue;
      resident.update(dt, context);
    }
  }
}
