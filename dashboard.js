(function () {
  'use strict';
  const A = window.PortfolioAnalytics;
  const records = window.PORTFOLIO_DATA.records;
  const agent = document.getElementById('agent-filter');
  const period = document.getElementById('period-filter');
  const metric = document.getElementById('metric-filter');
  const chart = document.getElementById('trend-chart');
  const fmt = n => n.toLocaleString('en-US');
  let weekly = [];
  for (let i = 1; i <= 14; i++) {
    const id = 'A' + String(i).padStart(2, '0');
    const option = document.createElement('option');
    option.value = id; option.textContent = 'Agent ' + id; agent.append(option);
  }
  function details(s) {
    return {
      csat: `${fmt(s.satisfied)} satisfied / ${fmt(s.surveys)} surveys`,
      aht: `${fmt(s.handlingSeconds)} sec / ${fmt(s.handled)} contacts`,
      sla: `${fmt(s.withinSla)} within 24h / ${fmt(s.eligible)} eligible`,
      quality: `${fmt(s.auditEarned)} / ${fmt(s.auditAvailable)} audit points`
    };
  }
  function drawChart() {
    const key = metric.value, m = A.metrics[key];
    const width = Math.max(260, Math.round(chart.getBoundingClientRect().width));
    const height = 265, left = key === 'aht' ? 53 : 47, right = 20, top = 26, bottom = 39;
    const plotW = width - left - right, plotH = height - top - bottom;
    const values = weekly.map(w => w.values[key]).filter(v => v !== null);
    const maxY = key === 'aht' ? Math.max(10, Math.ceil(Math.max(0, ...values) / 2) * 2) : 100;
    const x = i => left + (weekly.length === 1 ? plotW / 2 : i * plotW / (weekly.length - 1));
    const y = v => top + plotH * (1 - v / maxY);
    const suffix = key === 'aht' ? '' : '%';
    const description = weekly.map(w => `Week ${w.week}: ${A.format(w.values[key], key)}`).join('; ');
    let output = `<title>${m.label} by week</title><desc>${description}. The data table below contains these values.</desc>`;
    for (let t = 0; t <= 4; t++) {
      const v = maxY * t / 4, pos = y(v);
      output += `<line x1="${left}" y1="${pos}" x2="${width - right}" y2="${pos}" stroke="#e2e0d7"/><text x="${left - 10}" y="${pos + 5}" text-anchor="end" font-size="13" fill="#62645d">${Number(v.toFixed(1))}${suffix}</text>`;
    }
    let segment = [];
    function flush() { if (segment.length > 1) output += `<polyline points="${segment.join(' ')}" stroke="#79512e" stroke-width="2.5" fill="none"/>`; segment = []; }
    weekly.forEach((w, i) => { const v = w.values[key]; if (v === null) flush(); else segment.push(`${x(i)},${y(v)}`); }); flush();
    weekly.forEach((w, i) => {
      const v = w.values[key];
      output += `<text x="${x(i)}" y="${height - 13}" text-anchor="middle" font-size="13" fill="#62645d">W${w.week}</text>`;
      if (v !== null) output += `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" fill="#79512e"><title>Week ${w.week}: ${A.format(v, key)}</title></circle>`;
    });
    if (!values.length) output += `<text x="${left + plotW / 2}" y="${top + plotH / 2}" text-anchor="middle" font-size="17" fill="#62645d">No data</text>`;
    chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
    chart.innerHTML = output;
    document.getElementById('chart-heading').textContent = m.label;
    document.getElementById('chart-context').textContent = `${agent.value === 'all' ? 'All 14 agents' : 'Agent ' + agent.value} · ${key === 'aht' ? 'Minutes per handled contact' : 'Percentage'} · W${weekly[0]?.week || '—'}–W${weekly.at(-1)?.week || '—'}`;
    document.getElementById('chart-note').textContent = key === 'aht' ? 'Lower handling time alone does not establish better service. Read it alongside quality and customer feedback.' : 'Points show weekly weighted values. Missing observations are left as gaps; they are not zero.';
  }
  function row(label, summary, tag = 'td') {
    return `<tr><th scope="row">${label}</th>${Object.keys(A.metrics).map(k => `<${tag}>${A.format(summary.values[k], k)}</${tag}>`).join('')}</tr>`;
  }
  function render() {
    const selected = A.select(records, agent.value, Number(period.value));
    const summary = A.aggregate(selected); weekly = A.weekly(selected);
    const explanations = details(summary.sums);
    for (const key of Object.keys(A.metrics)) {
      document.getElementById(key + '-value').textContent = A.format(summary.values[key], key);
      document.getElementById(key + '-detail').textContent = explanations[key];
    }
    document.getElementById('filter-summary').textContent = `${agent.value === 'all' ? 'All 14 agents' : 'Agent ' + agent.value} · ${weekly.length} ${weekly.length === 1 ? 'week' : 'weeks'} · ${selected.length} ${selected.length === 1 ? 'record' : 'records'}`;
    document.getElementById('weekly-rows').innerHTML = weekly.map(w => row('Week ' + w.week, w)).join('');
    document.getElementById('period-totals').innerHTML = row('Selected period', summary);
    document.getElementById('raw-totals').textContent = `Selected totals — CSAT: ${explanations.csat}; AHT: ${explanations.aht}; SLA: ${explanations.sla}; quality: ${explanations.quality}.`;
    drawChart();
  }
  agent.addEventListener('change', render); period.addEventListener('change', render); metric.addEventListener('change', drawChart);
  document.getElementById('case-filter').addEventListener('click', () => {
    agent.value = 'A07'; period.value = '8'; metric.value = 'csat'; render();
    document.getElementById('dashboard').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    agent.focus({ preventScroll: true });
  });
  const w3 = A.aggregate(records.filter(r => r.agent === 'A07' && r.week === 3));
  const w4 = A.aggregate(records.filter(r => r.agent === 'A07' && r.week === 4));
  document.getElementById('case-observation').textContent = `In this synthetic example, A07's CSAT moves from ${A.format(w3.values.csat, 'csat')} in week 3 to ${A.format(w4.values.csat, 'csat')} in week 4. Average handling time moves from ${A.format(w3.values.aht, 'aht')} to ${A.format(w4.values.aht, 'aht')}. Week 4 has ${w4.sums.surveys} valid survey responses; that is the sample behind the percentage.`;
  window.addEventListener('resize', drawChart);
  render();
})();
