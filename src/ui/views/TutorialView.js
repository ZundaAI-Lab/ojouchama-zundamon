/**
 * 責務: チュートリアルダイアログのDOM生成だけを担当する。
 * 更新ルール: セーブデータ判定・タブ切替・入力処理はControllerへ戻し、ここでは渡された表示モデルだけを描画する。
 */
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }[char]));
}

function renderImage(app, imageKey, alt) {
  const src = app.assets.getImage(imageKey)?.src || '';
  if (!src) return '<div class="tutorial-card-fallback">?</div>';
  return `<img src="${src}" alt="${escapeHtml(alt)}">`;
}

function renderBadges(bindings) {
  if (!bindings?.length) return '';
  return `
    <div class="tutorial-badges">
      ${bindings.map(binding => `<span class="tutorial-badge">${escapeHtml(binding)}</span>`).join('')}
    </div>
  `;
}

function renderNotes(notes) {
  if (!notes?.length) return '';
  return `
    <ul class="tutorial-notes">
      ${notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}
    </ul>
  `;
}

function renderCard(app, entry) {
  return `
    <article class="tutorial-card" data-menu-item="true" tabindex="0" data-tutorial-card="${escapeHtml(entry.id)}">
      <div class="tutorial-card-icon">
        ${renderImage(app, entry.imageKey, entry.title)}
      </div>
      <div class="tutorial-card-body">
        <div class="tutorial-card-head">
          <h3>${escapeHtml(entry.title)}</h3>
          ${renderBadges(entry.bindingLabels)}
        </div>
        <p>${escapeHtml(entry.body)}</p>
        ${renderNotes(entry.notes)}
      </div>
    </article>
  `;
}

function renderGroups(app, groups) {
  return groups.map(group => `
    <section class="tutorial-group">
      <h2>${escapeHtml(group.label)}</h2>
      <div class="tutorial-card-list">
        ${group.entries.map(entry => renderCard(app, entry)).join('')}
      </div>
    </section>
  `).join('');
}

export class TutorialView {
  constructor(app) {
    this.app = app;
  }

  render({ title, subtitle, topics, activeTopicId, groups, lockedToSingleTopic = false }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'menu-screen tutorial-screen stage-tutorial-dialog';
    const showTabs = !lockedToSingleTopic && topics.length > 1;
    wrapper.innerHTML = `
      <div class="menu-card tutorial-card-panel panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="tutorial-header">
          <h1 class="menu-title">${escapeHtml(title)}</h1>
          <p class="menu-subtitle">${escapeHtml(subtitle)}</p>
          <p class="tutorial-control-hint">↑↓で項目選択、←→で切替、Enter・Space・Zで決定、Escで閉じるの。</p>
        </div>
        ${showTabs ? `
          <div class="tutorial-tabs" role="tablist">
            ${topics.map(topic => `
              <button class="tutorial-tab ${topic.id === activeTopicId ? 'is-active' : ''}" data-tutorial-topic="${escapeHtml(topic.id)}" role="tab" aria-selected="${topic.id === activeTopicId ? 'true' : 'false'}">
                ${escapeHtml(topic.label)}
              </button>
            `).join('')}
          </div>
        ` : ''}
        <div class="tutorial-scroll">
          ${groups.length ? renderGroups(this.app, groups) : '<p class="tutorial-empty">表示できる説明はまだないの。</p>'}
        </div>
        <div class="menu-actions tutorial-actions">
          <button class="secondary-btn tutorial-close-btn" id="tutorial-close-btn">閉じる</button>
        </div>
      </div>
    `;
    return wrapper;
  }
}
