/**
 * 責務: チュートリアルダイアログの開閉、表示条件フィルタ、タブ切替、MenuNavigator接続を担当する。
 * 更新ルール: チュートリアル本文はconfig/tutorialDefs.js、DOM構造はTutorialViewに委譲し、ゲーム進行やなのちゃん挙動へ直接触れない。
 */
import { formatActionBindings } from '../../config/controlSettings.js';
import { TUTORIAL_ENTRIES, TUTORIAL_TOPICS } from '../../config/tutorialDefs.js';
import { MenuNavigator } from '../MenuNavigator.js';
import { TutorialView } from '../views/TutorialView.js';

function hasStoryFlag(save, key) {
  if (!key) return true;
  return !!save?.storyFlags?.[key];
}

function hasUpgrade(save, key) {
  if (!key) return true;
  return (save?.upgrades?.[key] || 0) > 0;
}

function hasAllUpgrades(save, keys) {
  if (!keys?.length) return true;
  return keys.every(key => hasUpgrade(save, key));
}

function isTopicVisible(topic, save) {
  return hasStoryFlag(save, topic.requiredStoryFlag) && hasUpgrade(save, topic.requiredUpgrade) && hasAllUpgrades(save, topic.requiredUpgrades);
}

function isEntryVisible(entry, save) {
  return hasStoryFlag(save, entry.requiredStoryFlag) && hasUpgrade(save, entry.requiredUpgrade) && hasAllUpgrades(save, entry.requiredUpgrades);
}

function resolveBindingLabel(binding, keyBindings) {
  if (binding.text) return binding.text;
  const keys = formatActionBindings(keyBindings, binding.action);
  return binding.label ? `${binding.label}: ${keys}` : keys;
}

function groupEntries(entries) {
  const groups = [];
  const byLabel = new Map();
  for (const entry of entries) {
    if (!byLabel.has(entry.group)) {
      const group = { label: entry.group, entries: [] };
      byLabel.set(entry.group, group);
      groups.push(group);
    }
    byLabel.get(entry.group).entries.push(entry);
  }
  return groups;
}

export class TutorialDialogController {
  constructor({
    app,
    initialTopic = 'player',
    allowedTopics = null,
    lockedToSingleTopic = false,
    title = null,
    subtitle = null,
    onClose = null,
  } = {}) {
    this.app = app;
    this.initialTopic = initialTopic;
    this.allowedTopics = allowedTopics;
    this.lockedToSingleTopic = lockedToSingleTopic;
    this.titleOverride = title;
    this.subtitleOverride = subtitle;
    this.onClose = onClose;
    this.root = null;
    this.menu = null;
    this.activeTopicId = initialTopic;
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
    this.app.input.clearGameplay();
    this.render();
  }

  getSave() {
    return this.app.save.load();
  }

  getVisibleTopics(save) {
    const allowed = this.allowedTopics ? new Set(this.allowedTopics) : null;
    return TUTORIAL_TOPICS.filter(topic => {
      if (allowed && !allowed.has(topic.id)) return false;
      return isTopicVisible(topic, save);
    });
  }

  getActiveTopic(topics) {
    return topics.find(topic => topic.id === this.activeTopicId) || topics[0] || null;
  }

  getHydratedEntries(save, activeTopicId) {
    const keyBindings = this.app.input?.getKeyBindings?.() || save.settings?.keyBindings;
    return TUTORIAL_ENTRIES
      .filter(entry => entry.topic === activeTopicId && isEntryVisible(entry, save))
      .map(entry => ({
        ...entry,
        bindingLabels: (entry.bindings || []).map(binding => resolveBindingLabel(binding, keyBindings)),
      }));
  }

  render(preferredIndex = 0, focusTopicId = null) {
    const save = this.getSave();
    const topics = this.getVisibleTopics(save);
    const activeTopic = this.getActiveTopic(topics);
    this.activeTopicId = activeTopic?.id || null;

    const entries = activeTopic ? this.getHydratedEntries(save, activeTopic.id) : [];
    const groups = groupEntries(entries);
    const title = this.titleOverride || activeTopic?.title || 'チュートリアル';
    const subtitle = this.subtitleOverride || activeTopic?.subtitle || '操作を確認できるの。';

    this.menu?.destroy();
    const nextRoot = new TutorialView(this.app).render({
      title,
      subtitle,
      topics,
      activeTopicId: this.activeTopicId,
      groups,
      lockedToSingleTopic: this.lockedToSingleTopic,
    });
    this.root?.remove();
    this.root = nextRoot;
    this.app.uiRoot.append(this.root);

    this.root.querySelector('#tutorial-close-btn')?.addEventListener('click', () => this.close());
    this.root.querySelectorAll('[data-tutorial-topic]').forEach(button => {
      button.addEventListener('click', () => this.setTopic(button.dataset.tutorialTopic));
    });

    const selector = '.tutorial-tab, .tutorial-card, .tutorial-close-btn';
    const menuItems = Array.from(this.root.querySelectorAll(selector));
    const topicIndex = focusTopicId
      ? menuItems.findIndex(item => item.dataset.tutorialTopic === focusTopicId)
      : -1;

    this.menu = new MenuNavigator({
      app: this.app,
      root: this.root,
      selector,
      initialIndex: topicIndex >= 0 ? topicIndex : preferredIndex,
      onConfirm: item => this.confirm(item),
      onCancel: () => this.close(),
      onLeft: () => this.moveTopic(-1),
      onRight: () => this.moveTopic(1),
    });
  }

  confirm(item) {
    if (!item) return;
    if (item.classList.contains('tutorial-close-btn')) {
      this.close();
      return;
    }
    if (item.dataset.tutorialTopic) {
      this.setTopic(item.dataset.tutorialTopic);
    }
  }

  setTopic(topicId) {
    if (!topicId || topicId === this.activeTopicId) return;
    this.activeTopicId = topicId;
    this.app.audio.playSfx('ui_decide');
    this.render(0, topicId);
  }

  moveTopic(direction) {
    if (this.lockedToSingleTopic) return;
    const save = this.getSave();
    const topics = this.getVisibleTopics(save);
    if (topics.length <= 1) return;
    const current = Math.max(0, topics.findIndex(topic => topic.id === this.activeTopicId));
    const next = (current + direction + topics.length) % topics.length;
    this.activeTopicId = topics[next].id;
    this.app.audio.playSfx('ui_decide');
    this.render(0, topics[next].id);
  }

  update() {
    this.menu?.update();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.destroy();
    this.app.input.clearGameplay();
    this.onClose?.();
  }

  destroy() {
    this.menu?.destroy();
    this.menu = null;
    this.root?.remove();
    this.root = null;
  }
}
