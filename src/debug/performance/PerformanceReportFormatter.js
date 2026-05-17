/**
 * 責務: 負荷状況詳細レポートの表示用テキストとコピー用JSONを生成する。
 * 更新ルール: 計測や保存は持たず、確定済みレポートの整形だけを担当する。
 */
function ms(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}ms` : '-';
}

function fps(value) {
  return Number.isFinite(value) ? value.toFixed(1) : '-';
}

function count(value) {
  return Number.isFinite(value) ? `${value}` : '0';
}

function formatTopPhases(phases, limit = 10) {
  return Object.entries(phases || {})
    .sort((a, b) => (b[1]?.maxMs || 0) - (a[1]?.maxMs || 0))
    .slice(0, limit)
    .map(([name, item]) => `  - ${name}: max ${ms(item.maxMs)} / p95 ${ms(item.p95Ms)} / avg ${ms(item.avgMs)} / count ${count(item.count)}`)
    .join('\n') || '  - なし';
}

function formatTopSpikes(spikes, limit = 12) {
  return (spikes || []).slice(0, limit).map((spike, index) => {
    const suspects = spike.suspects?.length ? ` / ${spike.suspects.join(', ')}` : '';
    return `  ${index + 1}. +${ms(spike.atMs)} frame ${ms(spike.frameMs)} update ${ms(spike.updateMs)} render ${ms(spike.renderMs)} steps ${spike.fixedSteps} mode ${spike.mode || '-'}${suspects}`;
  }).join('\n') || '  - なし';
}

function formatTimeline(events, limit = 12) {
  return (events || []).slice(-limit).map(event => `  - +${ms(event.atMs)} ${event.type} ${JSON.stringify(event.details || {})}`).join('\n') || '  - なし';
}

export function formatPerformanceReport(report) {
  if (!report) return '負荷状況レポートはまだありません。';
  const s = report.summary || {};
  return [
    `# 負荷状況レポート`,
    `Stage: ${report.stage?.id || '-'} ${report.stage?.name ? `(${report.stage.name})` : ''}`,
    `Reason: ${report.reason || '-'}`,
    `Duration: ${s.durationSec?.toFixed?.(2) || '0.00'}s / Frames: ${count(s.frameCount)} / Avg FPS: ${fps(s.avgFps)} / Min FPS: ${fps(s.minFps)}`,
    `Frame: avg ${ms(s.frameMs?.avg)} / p95 ${ms(s.frameMs?.p95)} / p99 ${ms(s.frameMs?.p99)} / max ${ms(s.frameMs?.max)}`,
    `Update: avg ${ms(s.updateMs?.avg)} / p95 ${ms(s.updateMs?.p95)} / max ${ms(s.updateMs?.max)}`,
    `Render: avg ${ms(s.renderMs?.avg)} / p95 ${ms(s.renderMs?.p95)} / max ${ms(s.renderMs?.max)}`,
    `Steps: max ${count(s.fixedStepsMax)} / steps=5 ${count(s.fixedStepsAtLimit)} / accumulator drop ${count(s.accumulatorDroppedCount)}`,
    `Spikes: ${count(s.spikeCount)} / LongTasks: ${count(s.longTaskCount)}`,
    '',
    '## Stage Counts',
    JSON.stringify(report.stage?.counts || {}, null, 2),
    '',
    '## Max Runtime Counts',
    JSON.stringify(report.maxCounts || {}, null, 2),
    '',
    '## Top Spikes',
    formatTopSpikes(report.spikes),
    '',
    '## Phase Breakdown',
    formatTopPhases(report.phases),
    '',
    '## Counters',
    JSON.stringify(report.counters || {}, null, 2),
    '',
    '## Async / Event Timeline',
    formatTimeline(report.events),
  ].join('\n');
}

export function buildPerformanceReportJson(report) {
  return JSON.stringify(report || null, null, 2);
}
