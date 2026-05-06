/**
 * 責務: 画像アセットのロード、保持、キー参照を担当する。
 * 更新ルール: アセット定義はassetManifestに置き、描画処理はrender側に置く。
 */
export class AssetSystem {
  constructor() {
    this.images = new Map();
  }

  async loadManifest(manifest) {
    const tasks = Object.entries(manifest.images).map(([key, src]) => this.loadImage(key, src));
    await Promise.all(tasks);
  }

  loadImage(key, src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`画像を読み込めませんでした: ${key} ${src}`);
        resolve(null);
      };
      img.src = src;
    });
  }

  getImage(key) {
    return this.images.get(key);
  }
}
