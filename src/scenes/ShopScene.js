/**
 * 責務: ショップ画面の購入処理・購入後の再描画・ガーデン復帰を制御する。
 * 更新ルール: DOM生成は ShopView に任せ、セーブ更新とSE再生だけをここで扱う。
 * 更新ルール: 強化商品の表示可否は宣言された requiresStoryFlag をここで評価し、ShopViewへ実行時条件を持ち込まない。
 * 更新ルール: 消耗品購入はSaveSystemへ委譲し、ショップ画面では購入結果の再描画だけを行う。
 */
import { BaseScene } from './BaseScene.js';
import { SCENES } from '../config/sceneIds.js';
import { UPGRADE_DEFS } from '../config/upgradeDefs.js';
import { SHOP_ITEM_DEFS } from '../config/teacupInventory.js';
import { MenuNavigator } from '../ui/MenuNavigator.js';
import { ShopView } from '../ui/views/ShopView.js';
import { drawCoverBackground } from '../utils/background.js';

export class ShopScene extends BaseScene {
  async enter() {
    this.app.audio.playBgm('stage-select');
    this.elapsed = 0;
    this.selectedIndex = 0;
    this.renderUi();
  }

  renderUi() {
    const save = this.app.save.load();
    this.view = new ShopView(this.app);
    const wrapper = this.view.renderShell(save);
    this.app.uiRoot.append(wrapper);
    const upgradeList = wrapper.querySelector('#upgrade-list');

    Object.entries(SHOP_ITEM_DEFS).forEach(([key, def]) => {
      const row = this.view.createShopItemButton({ key, def, save });
      row.addEventListener('click', () => {
        this.selectedIndex = this.menu?.selectedIndex ?? this.selectedIndex;
        const result = this.app.save.purchaseShopItem(key);
        this.app.audio.playSfx(result.ok ? 'shop_buy' : 'shop_fail');
        this.menu?.destroy();
        this.app.uiRoot.innerHTML = '';
        this.renderUi();
      });
      upgradeList.append(row);
    });

    Object.entries(UPGRADE_DEFS).filter(([, def]) => this.isUpgradeVisible(def, save)).forEach(([key, def]) => {
      const level = save.upgrades[key] || 0;
      const maxed = level >= def.max;
      const cost = maxed ? 0 : def.cost[level];
      const row = this.view.createUpgradeButton({ key, def, level, maxed, cost, save });
      row.addEventListener('click', () => {
        this.selectedIndex = this.menu?.selectedIndex ?? this.selectedIndex;
        const result = this.app.save.purchaseUpgrade(key);
        this.app.audio.playSfx(result.ok ? 'upgrade_buy' : 'shop_fail');
        this.menu?.destroy();
        this.app.uiRoot.innerHTML = '';
        this.renderUi();
      });
      upgradeList.append(row);
    });

    wrapper.querySelector('#back-btn').addEventListener('click', () => this.app.sceneManager.change(SCENES.GARDEN));
    this.menu = new MenuNavigator({
      app: this.app,
      root: wrapper,
      initialIndex: this.selectedIndex,
      onCancel: () => this.app.sceneManager.change(SCENES.GARDEN),
    });
    this.selectedIndex = this.menu.selectedIndex;
  }

  isUpgradeVisible(def, save) {
    if (!def.requiresStoryFlag) return true;
    return !!save.storyFlags?.[def.requiresStoryFlag];
  }

  exit() {
    this.menu?.destroy();
  }

  update(dt) {
    this.elapsed += dt;
    this.menu?.update();
  }

  render(ctx) {
    const bg = this.app.assets.getImage('bg_kingdom_opening') || this.app.assets.getImage('bg_candy_forest');
    if (bg) {
      drawCoverBackground(ctx, bg);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.36)';
    ctx.fillRect(0, 0, 480, 270);
    const hero = this.app.assets.getImage('hero_tea') || this.app.assets.getImage('hero_idle');
    if (hero) {
      ctx.save();
      ctx.globalAlpha = 0.56;
      ctx.drawImage(hero, 22, 156 + Math.sin(this.elapsed * 1.8) * 2, 76, 84);
      ctx.restore();
    }
  }
}
