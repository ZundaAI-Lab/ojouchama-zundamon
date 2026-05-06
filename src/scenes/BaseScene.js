/**
 * 責務: 全Sceneの共通インターフェースと最小ライフサイクルを担当する。
 * 更新ルール: 具象画面のDOMやゲームルールをここに追加しない。
 */
export class BaseScene {
  constructor(app, params = {}) {
    this.app = app;
    this.params = params;
  }
  async enter() {}
  exit() {}
  update() {}
  render() {}
}
