(function () {
  'use strict';
  const A = window.PortfolioAnalytics;
  const data = window.PORTFOLIO_DATA;
  if (!A || !data || !document.getElementById('preview-csat')) return;
  const totals = A.aggregate(data.records);
  for (const key of ['csat', 'aht', 'sla']) {
    document.getElementById('preview-' + key).textContent = A.format(totals.values[key], key);
  }
  const chart = document.getElementById('preview-chart');
  if (!chart) return;
  const weeks = A.weekly(data.records);
  function drawPreview() {
    const width = Math.max(230, Math.round(chart.getBoundingClientRect().width));
    const right = width - 12, points = [], description = [];
    chart.setAttribute('viewBox', '0 0 ' + width + ' 116');
    let svg = '<line x1="32" y1="92" x2="' + right + '" y2="92" stroke="#c8cbc3"/><line x1="32" y1="14" x2="' + right + '" y2="14" stroke="#c8cbc3"/><text x="0" y="18" font-size="11" fill="#62645d">100</text><text x="15" y="96" font-size="11" fill="#62645d">0</text>';
    weeks.forEach((w, i) => {
      const x = 38 + i * (right - 38) / Math.max(1, weeks.length - 1), value = w.values.csat;
      description.push('Week ' + w.week + ': ' + A.format(value, 'csat'));
      svg += '<text x="' + x + '" y="113" text-anchor="middle" font-size="11" fill="#62645d">W' + w.week + '</text>';
      if (value !== null) {
        const y = 92 - value * .78;
        points.push(x + ',' + y);
        svg += '<circle cx="' + x + '" cy="' + y + '" r="3.4" fill="#79512e"/>';
      }
    });
    if (points.length > 1) svg = '<polyline points="' + points.join(' ') + '" fill="none" stroke="#79512e" stroke-width="2"/>' + svg;
    chart.innerHTML = svg;
    chart.setAttribute('aria-label', 'Synthetic weekly CSAT. ' + description.join('; ') + '. The dashboard includes the full data table.');
  }
  drawPreview();
  window.addEventListener('resize', drawPreview);
})();
