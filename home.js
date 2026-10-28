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

// Scroll-timeline fallback. Mirrors the animation-range values in kimchi.css: each entry is
// [element, variable, timeline element, range], and the range is a pair of [phase, percent].
(() => {
  if (CSS.supports('animation-timeline: view()') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('sd-fallback');
  const $ = s => [...document.querySelectorAll(s)];
  const items = [];
  const add = (els, v, range, timeline) => els.forEach((el, i) => items.push({ el, v, range: typeof range === 'function' ? range(i) : range, tl: timeline || el }));
  add($('.stage-card, .stage-glow, .stage .hero-cover, .hero-cover img'), '--p', 'root');
  add($('.case, .habit-col, .experience-row'), '--p', [['entry', 0], ['entry', 70]]);
  add($('.kpi-card'), '--p', i => [['entry', i * 8], ['entry', 70 + i * 8]]);
  const title = document.querySelector('.world-title');
  add($('.world-title .ch'), '--p', i => [['cover', 12 + i * 3], ['cover', 34 + i * 3]], title);
  add($('.cover'), '--p', [['cover', 0], ['cover', 100]]);
  add($('.cover img'), '--p', [['entry', 0], ['entry', 85]]);
  add($('.cover img'), '--p2', [['entry', 0], ['exit', 40]]);
  const portal = document.querySelector('.portal');
  if (portal) {
    add($('.portal-pin'), '--p', [['contain', 55], ['contain', 100]], portal);
    add($('.portal-window'), '--p', [['contain', 0], ['contain', 80]], portal);
    add($('.portal-window'), '--p2', [['contain', 55], ['contain', 100]], portal);
    add($('.portal-word'), '--p', [['contain', 4], ['contain', 45]], portal);
  }
  // Layout positions ignore transforms, like CSS view timelines do, so moving elements don't feed back.
  const docTop = el => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
  let boxes = new Map();
  const measure = () => { boxes = new Map(); items.forEach(it => { if (!boxes.has(it.tl)) boxes.set(it.tl, { top: docTop(it.tl), h: it.tl.offsetHeight }); }); };
  const edge = (phase, pct, h, vh) => {
    const span = {
      cover: [vh, -h], entry: [vh, vh - Math.min(h, vh)],
      contain: [Math.max(vh - h, 0), Math.min(vh - h, 0)], exit: [Math.min(0, vh - h), -h]
    }[phase];
    return span[0] + (span[1] - span[0]) * pct / 100;
  };
  const clamp = n => Math.min(1, Math.max(0, n));
  let queued = false;
  const update = () => {
    queued = false;
    const vh = innerHeight, y = scrollY;
    items.forEach(it => {
      let p;
      if (it.range === 'root') p = y / vh;
      else {
        const b = boxes.get(it.tl), top = b.top - y;
        const a = edge(it.range[0][0], it.range[0][1], b.h, vh), z = edge(it.range[1][0], it.range[1][1], b.h, vh);
        p = (a - top) / (a - z);
      }
      it.el.style.setProperty(it.v, clamp(p).toFixed(4));
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  measure(); update();
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => { measure(); queue(); });
  addEventListener('load', () => { measure(); queue(); });
})();
