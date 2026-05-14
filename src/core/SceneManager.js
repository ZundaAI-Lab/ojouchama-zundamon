/**
 * 責務: ゲーム基盤のライフサイクル、ループ、カメラ、シーン管理を担当する。
 * 更新ルール: ゲーム固有ルールを持ち込まず、汎用基盤として保つ。
 * 更新ルール: 画面遷移はScene IDからregistryで解決し、Scene同士に直接依存させない。
 * 更新ルール: Scene切替前の画像ロードはdata/assetLoadPlans.jsへキー算出を委譲し、Scene破棄前に完了させる。
 */
import { getSceneAssetKeys } from '../data/assetLoadPlans.js';

export class SceneManager {
  constructor(app, sceneRegistry) {
    this.app = app;
    this.sceneRegistry = sceneRegistry;
    this.current = null;
    this.currentSceneId = null;
    this.changeToken = 0;
  }

  async change(sceneId, params = {}) {
    const SceneClass = this.sceneRegistry?.get(sceneId);
    if (!SceneClass) {
      throw new Error(`Unknown scene id: ${String(sceneId)}`);
    }

    const token = ++this.changeToken;
    await this.app.assets.loadKeys(getSceneAssetKeys(sceneId, params));
    if (token !== this.changeToken) return;

    if (this.current) {
      this.current.exit?.();
    }
    this.app.uiRoot.innerHTML = '';
    this.app.hudRoot.innerHTML = '';
    this.currentSceneId = sceneId;
    this.current = new SceneClass(this.app, params);
    await this.current.enter?.();
  }

  update(dt) {
    this.current?.update?.(dt);
  }

  render(ctx) {
    this.current?.render?.(ctx);
  }
}
