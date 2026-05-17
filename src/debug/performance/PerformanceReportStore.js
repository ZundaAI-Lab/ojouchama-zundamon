/**
 * 責務: 負荷状況の詳細レポートをメモリ上だけで保持する。
 * 更新ルール: 詳細レポートはlocalStorageへ保存せず、デバッグセッション中の参照とコピーだけを担当する。
 */
const DEFAULT_REPORT_LIMIT = 5;

export class PerformanceReportStore {
  constructor(limit = DEFAULT_REPORT_LIMIT) {
    this.limit = Math.max(1, Math.floor(limit || DEFAULT_REPORT_LIMIT));
    this.reports = [];
  }

  add(report) {
    if (!report) return null;
    this.reports.unshift(report);
    if (this.reports.length > this.limit) this.reports.length = this.limit;
    return report;
  }

  latest() {
    return this.reports[0] || null;
  }

  all() {
    return [...this.reports];
  }

  clear() {
    this.reports.length = 0;
  }
}
