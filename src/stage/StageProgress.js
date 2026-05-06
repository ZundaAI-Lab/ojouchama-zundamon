/**
 * 責務: ステージ進行中の一時記録とリトライ関連状態を担当する。
 * 更新ルール: セーブデータへの永続化はStageClearService/SaveSystemへ任せる。
 * 更新ルール: ティーカップ所持数はSaveSystem、ステージ内入手数はこの一時記録で分けて扱う。
 */
export class StageProgress {
  constructor() {
    this.coins = 0;
    this.purified = 0;
    this.damageCount = 0;
    this.elapsed = 0;
    this.teacupsCollected = 0;
  }
}
