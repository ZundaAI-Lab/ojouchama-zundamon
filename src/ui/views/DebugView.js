/**
 * 責務: デバッグ画面のDOM構造を生成する。
 * 更新ルール: デバッグ設定の保存や画面遷移はDebugScene側で処理し、ここでは表示HTMLだけを担当する。
 * 更新ルール: 自動テスト結果や進行フラグ保存状態のDOM反映は表示責務としてここで扱い、テスト実行や保存判定は持たない。
 * 更新ルール: 負荷状況詳細レポートは渡された確定済みテキストだけを表示し、計測や保存を持たない。
 * 更新ルール: 指定ステージ直行パネルは渡されたstageGroupsだけを表示し、ステージ候補の生成責務は持たない。
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDetailValue(value) {
  if (value === undefined) return 'undefined';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export class DebugView {
  render({ settings, stageGroups, progressFlags }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'menu-screen debug-screen';
    wrapper.innerHTML = `
      <div class="menu-card debug-card panel">
        <div class="debug-label">DEBUG</div>
        <h1 class="menu-title debug-title">デバッグ</h1>
        <p class="menu-subtitle debug-subtitle">検証用の設定と直行先をまとめています。</p>

        <section class="debug-block">
          <div class="debug-block-heading">モード</div>
          <label class="debug-toggle-row">
            <input type="checkbox" data-debug-setting="bossDirectMode" ${settings.bossDirectMode ? 'checked' : ''}>
            <span>ボス直行モード</span>
          </label>
          <label class="debug-toggle-row">
            <input type="checkbox" data-debug-setting="infiniteHp" ${settings.infiniteHp ? 'checked' : ''}>
            <span>体力無限モード</span>
          </label>
          <label class="debug-toggle-row">
            <input type="checkbox" data-debug-setting="showHitboxes" ${settings.showHitboxes ? 'checked' : ''}>
            <span>当たり判定の範囲</span>
          </label>
          <label class="debug-toggle-row">
            <input type="checkbox" data-debug-setting="showPerformance" ${settings.showPerformance ? 'checked' : ''}>
            <span>負荷状況モニタ</span>
          </label>
          <label class="debug-toggle-row">
            <input type="checkbox" data-debug-setting="capturePerformanceReport" ${settings.capturePerformanceReport ? 'checked' : ''}>
            <span>詳細レポート取得</span>
          </label>
        </section>


        <section class="debug-block debug-progress-block">
          <div class="debug-block-heading">進行フラグ</div>
          <p class="debug-flag-note">セーブデータ上の加入・入手・クリア状態を直接切り替えます。</p>
          ${progressFlags.map(flag => `
            <label class="debug-toggle-row debug-progress-row">
              <input type="checkbox" data-debug-progress-flag="${flag.key}" ${flag.checked ? 'checked' : ''}>
              <span>${escapeHtml(flag.label)}</span>
            </label>
          `).join('')}
          <div class="debug-flag-state" id="debug-progress-state" aria-live="polite">変更するとすぐ保存されます。</div>
        </section>

        <section class="debug-block debug-stage-direct-block">
          <div class="debug-block-heading">指定ステージ直行</div>
          <p class="debug-stage-note">選択したステージをイントロ省略で開始します。</p>
          <div class="debug-stage-group-list">
            ${stageGroups.map(group => `
              <div class="debug-stage-group">
                <div class="debug-stage-group-title">${escapeHtml(group.title)}</div>
                <div class="debug-stage-grid">
                  ${group.stages.map(stage => `
                    <button class="secondary-btn debug-stage-btn" data-stage-id="${escapeHtml(stage.stageId)}">
                      <span class="debug-stage-label">${escapeHtml(stage.label)}</span>
                      <span class="debug-stage-name">${escapeHtml(stage.name)}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="debug-block debug-test-block">
          <div class="debug-block-heading">自動テスト</div>
          <p class="debug-test-note">通常プレイのセーブを退避し、デバッグ専用の単体・整合性テストを実行します。</p>
          <button class="primary-btn debug-test-run-btn" id="debug-run-tests-btn">自動テスト実行</button>
          <div class="debug-test-result" id="debug-test-result" aria-live="polite">未実行</div>
        </section>

        <section class="debug-block debug-performance-report-block">
          <div class="debug-block-heading">負荷状況レポート</div>
          <p class="debug-report-note">詳細レポート取得ONでステージを開始すると、終了時に1ステージ分の集計をメモリ上だけに保持します。</p>
          <div class="debug-report-actions">
            <button class="secondary-btn" id="debug-refresh-report-btn">最新を表示</button>
            <button class="secondary-btn" id="debug-copy-report-btn">JSONコピー</button>
            <button class="secondary-btn" id="debug-clear-report-btn">消去</button>
          </div>
          <pre class="debug-performance-report" id="debug-performance-report" aria-live="polite">負荷状況レポートはまだありません。</pre>
        </section>

        <div class="menu-actions debug-actions">
          <button class="primary-btn" id="switch-test-btn">スイッチ実験室</button>
          <button class="secondary-btn" id="debug-title-btn">タイトルへ戻る</button>
        </div>
      </div>
    `;
    return wrapper;
  }

  showProgressFlagSaved(wrapper, label, enabled) {
    const stateNode = wrapper.querySelector('#debug-progress-state');
    if (!stateNode) return;
    stateNode.textContent = `${label}：${enabled ? 'ON' : 'OFF'} にしました。`;
  }

  showPerformanceReport(wrapper, report) {
    const reportNode = wrapper.querySelector('#debug-performance-report');
    const copyButton = wrapper.querySelector('#debug-copy-report-btn');
    if (!reportNode) return;
    if (!report) {
      reportNode.textContent = '負荷状況レポートはまだありません。';
      if (copyButton) copyButton.disabled = true;
      return;
    }
    reportNode.textContent = report.summaryText || '負荷状況レポートを表示できません。';
    if (copyButton) copyButton.disabled = !report.jsonText;
  }

  showPerformanceReportCopied(wrapper, ok) {
    const reportNode = wrapper.querySelector('#debug-performance-report');
    if (!reportNode) return;
    const current = reportNode.textContent || '';
    const message = ok ? '[JSONをコピーしました]' : '[JSONコピーに失敗しました]';
    reportNode.textContent = `${message}\n${current.replace(/^\[(JSONをコピーしました|JSONコピーに失敗しました)\]\n/, '')}`;
  }

  showTestRunning(wrapper) {
    const resultNode = wrapper.querySelector('#debug-test-result');
    const button = wrapper.querySelector('#debug-run-tests-btn');
    if (button) button.disabled = true;
    if (resultNode) {
      resultNode.className = 'debug-test-result is-running';
      resultNode.textContent = '自動テストを実行中…';
    }
  }

  showTestResult(wrapper, result) {
    const resultNode = wrapper.querySelector('#debug-test-result');
    const button = wrapper.querySelector('#debug-run-tests-btn');
    if (button) button.disabled = false;
    if (!resultNode) return;

    const failedResults = result.results.filter(item => !item.ok);
    resultNode.className = `debug-test-result ${result.failed > 0 ? 'is-failed' : 'is-passed'}`;
    resultNode.innerHTML = `
      <div class="debug-test-summary">
        ${result.passed} passed / ${result.failed} failed
        <span class="debug-test-duration">${result.durationMs}ms</span>
      </div>
      ${failedResults.length > 0 ? `
        <ul class="debug-test-failures">
          ${failedResults.map(failure => `
            <li>
              <strong>${escapeHtml(failure.suite)}: ${escapeHtml(failure.name)}</strong>
              <p>${escapeHtml(failure.message)}</p>
              ${failure.details ? `
                <dl>
                  <dt>expected</dt><dd>${escapeHtml(formatDetailValue(failure.details.expected))}</dd>
                  <dt>actual</dt><dd>${escapeHtml(formatDetailValue(failure.details.actual))}</dd>
                </dl>
              ` : ''}
            </li>
          `).join('')}
        </ul>
      ` : '<p class="debug-test-all-clear">すべてのテストに成功しました。</p>'}
    `;
  }
}
