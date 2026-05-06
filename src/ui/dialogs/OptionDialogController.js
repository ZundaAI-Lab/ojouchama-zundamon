/**
 * 責務: ステージ中にScene遷移せず開くオプション系ダイアログのページ切り替えを制御する。
 * 更新ルール: ページ固有のDOM操作はstageOptions配下のControllerへ委譲し、ここはページ寿命とclose処理だけを担当する。
 * 更新ルール: ステージ状態を保持するため、StageRuntimeから呼ばれる時はSceneManager.changeを使わず、DOMの差し替えだけでページ遷移する。
 */
import { OptionDraftStore } from './stageOptions/OptionDraftStore.js';
import { OptionSettingsPageController } from './stageOptions/OptionSettingsPageController.js';
import { KeyConfigPageController } from './stageOptions/KeyConfigPageController.js';
import { TouchControlPageController } from './stageOptions/TouchControlPageController.js';

export class OptionDialogController {
  constructor({ app, onClose, onTouchSettingsChanged } = {}) {
    this.app = app;
    this.onClose = onClose;
    this.onTouchSettingsChanged = onTouchSettingsChanged;
    this.root = null;
    this.activePage = null;
    this.drafts = new OptionDraftStore(app);
  }

  open() {
    this.app.input.clearGameplay();
    this.showOptionPage({ reloadFromSave: true });
  }

  destroyPage() {
    this.activePage?.destroy?.();
    this.activePage = null;
    this.root?.remove();
    this.root = null;
  }

  setPageRoot(wrapper) {
    this.destroyPage();
    this.root = wrapper;
    this.root.classList.add('stage-option-dialog');
    this.app.uiRoot.append(this.root);
  }

  showOptionPage({ reloadFromSave = false } = {}) {
    const page = new OptionSettingsPageController(this);
    page.open({ reloadFromSave });
    this.activePage = page;
  }

  openKeyConfigPage() {
    const page = new KeyConfigPageController(this);
    page.open();
    this.activePage = page;
  }

  openTouchControlPage() {
    const page = new TouchControlPageController(this);
    page.open();
    this.activePage = page;
  }

  close({ restoreAudio = true } = {}) {
    if (restoreAudio) this.app.audio.applySettings();
    this.destroyPage();
    this.app.input.clearGameplay();
    this.onClose?.();
  }

  destroy() {
    this.destroyPage();
  }

  update() {
    this.activePage?.update?.();
  }
}
