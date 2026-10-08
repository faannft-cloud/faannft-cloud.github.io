(function (root) {
  'use strict';
  const metrics = {
    csat: { label: 'Customer satisfaction', short: 'CSAT', unit: '%', numerator: 'satisfied', denominator: 'surveys' },
    aht: { label: 'Average handling time', short: 'AHT', unit: 'min', numerator: 'handlingSeconds', denominator: 'handled' },
    sla: { label: 'First-response SLA', short: 'SLA', unit: '%', numerator: 'withinSla', denominator: 'eligible' },
    quality: { label: 'Audit quality', short: 'Quality', unit: '%', numerator: 'auditEarned', denominator: 'auditAvailable' }
  };
  function select(records, agent = 'all', count = 8) {
    const lastWeek = records.length ? Math.max(...records.map(r => r.week)) : 0;
    return records.filter(r => r.week > lastWeek - Number(count) && (agent === 'all' || r.agent === agent));
  }
  function aggregate(records) {
    const sums = { satisfied: 0, surveys: 0, handlingSeconds: 0, handled: 0, withinSla: 0, eligible: 0, auditEarned: 0, auditAvailable: 0 };
    for (const r of records) for (const k of Object.keys(sums)) sums[k] += r[k];
    const values = {};
    for (const [key, m] of Object.entries(metrics)) {
      values[key] = sums[m.denominator] > 0 ? sums[m.numerator] / sums[m.denominator] * (key === 'aht' ? 1 / 60 : 100) : null;
    }
    return { values, sums, count: records.length };
  }
  function weekly(records) {
    return [...new Set(records.map(r => r.week))].sort((a, b) => a - b).map(week => ({ week, ...aggregate(records.filter(r => r.week === week)) }));
  }
  function format(value, key) {
    if (value === null || !Number.isFinite(value)) return 'No data';
    // Correct representational noise at half-tenths (e.g. 7.149999999999999).
    // Keep full precision in aggregate(); round only the displayed value.
    const rounded = Math.round((value + Number.EPSILON * Math.max(1, Math.abs(value))) * 10) / 10;
    return rounded.toFixed(1) + (key === 'aht' ? ' min' : '%');
  }
  const api = { metrics, select, aggregate, weekly, format };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PortfolioAnalytics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
