/* Reel upgrade (2026-10-30). Needs vendor/gsap, ScrollTrigger and SplitText loaded first.
   Without GSAP or with reduced motion, the inserted pieces stay static. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const svgNS = 'http://www.w3.org/2000/svg';

  /* ---------- static pieces (inserted for everyone) ---------- */

  const SKILLS = ['Team <em>leadership</em>', 'Quality assurance', 'Root-cause <em>analysis</em>', 'Coaching',
    'KPI reporting', 'Practical <em>AI tools</em>', 'Korean / English', 'DJ <em>KIMCHI</em>'];
  const route = $('.career-route');
  let marquee;
  if (route) {
    marquee = document.createElement('div');
    marquee.className = 'reel-marquee';
    marquee.setAttribute('aria-hidden', 'true');
    const items = SKILLS.map(s => `<span>${s}</span><i>✦</i>`).join('');
    marquee.innerHTML = `<div class="reel-track">${items}${SKILLS.map(s => `<span data-dup>${s}</span><i data-dup>✦</i>`).join('')}</div>`;
    route.after(marquee);
  }

  // Blob path through n points on a circle (closed Catmull-Rom → cubic Bézier).
  const blobPath = (radii, cx = 300, cy = 300) => {
    const n = radii.length;
    const pts = radii.map((r, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + 'Z';
  };
  const SCENE_COLORS = {
    seocheon: ['#f2b48f', '#fbf3dc', '#c9d6c8'],
    genesis: ['#9fb4e0', '#efe7f6', '#d9c6ef'],
    present: ['#e8875f', '#fbe3cf', '#f2b48f'],
  };
  const randomRadii = (n, base, spread) => Array.from({ length: n }, () => base + (Math.random() - .5) * spread);

  const stage = $('.opening-art .constellation');
  let blob;
  if (stage) {
    const wrap = document.createElement('div');
    wrap.className = 'reel-blob';
    wrap.setAttribute('aria-hidden', 'true');
    const c = SCENE_COLORS.seocheon;
    wrap.innerHTML = `<svg viewBox="0 0 600 600"><defs><linearGradient id="reel-blob-fill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient></defs>
      <path class="reel-blob-ring"/><path class="reel-blob-body" fill="url(#reel-blob-fill)" opacity=".78"/></svg>`;
    stage.prepend(wrap);
    blob = { el: wrap, body: $('.reel-blob-body', wrap), ring: $('.reel-blob-ring', wrap), stops: $$('stop', wrap),
      radii: randomRadii(7, 220, 70), ringRadii: randomRadii(9, 262, 40) };
    blob.body.setAttribute('d', blobPath(blob.radii));
    blob.ring.setAttribute('d', blobPath(blob.ringRadii));
    $$('[data-scene-choice]').forEach(b => b.addEventListener('click', () => {
      const colors = SCENE_COLORS[b.dataset.sceneChoice];
      if (colors) blob.stops.forEach((s, i) => s.setAttribute('stop-color', colors[i]));
    }));
  }

  // Layered waves (Haikei-style) between sections whose backgrounds differ.
  const bg = el => getComputedStyle(el).backgroundColor;
  const visibleBg = el => {
    for (let n = el; n; n = n.parentElement) {
      const c = bg(n);
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
    }
    return '#f6eee2';
  };
  const waves = [];
  const addWave = (next, flip) => {
    const prev = next && next.previousElementSibling;
    if (!next || !prev) return;
    const from = visibleBg(prev), to = visibleBg(next);
    if (from === to) return;
    const w = document.createElement('div');
    w.className = 'reel-wave';
    w.setAttribute('aria-hidden', 'true');
    w.style.background = from;
    // Each path spans two widths so it can loop sideways.
    const layer = (y, amp, len) => {
      let d = `M0,${y}`;
      for (let x = 0; x < 2400; x += len) d += ` q${len / 4},${-amp} ${len / 2},0 t${len / 2},0`;
      return d + ' V160 H0 Z';
    };
    w.innerHTML = `<svg viewBox="0 0 1200 160" preserveAspectRatio="none">
      <path d="${layer(58, 26, 400)}" fill="${to}" opacity=".28"/>
      <path d="${layer(86, 22, 300)}" fill="${to}" opacity=".5"/>
      <path d="${layer(116, 18, 600)}" fill="${to}"/></svg>`;
    if (flip) w.style.transform = 'scaleX(-1)';
    next.before(w);
    waves.push(w);
  };
  addWave($('.habit'));
  addWave($('.contact'), true);

  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  gsap.ticker.lagSmoothing(0); // reveals finish on time even on a slow phone
  root.classList.add('reel-motion');
  // Never leave a heading hidden if fonts or splitting stall.
  setTimeout(() => $$('.reel-split-pending').forEach(el => el.classList.remove('reel-split-pending')), 2500);

  /* ---------- scroll progress ---------- */
  const bar = document.createElement('div');
  bar.className = 'reel-progress';
  bar.innerHTML = '<i></i>';
  document.body.append(bar);
  gsap.to(bar.firstChild, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  /* ---------- split-text headings ---------- */
  const heads = $$('#work-title, #demo-title, #experience-title, #habit-title, #about-title, #contact-title');
  const hero = $('#intro-name');
  if (window.SplitText) {
    [hero, ...heads].forEach(el => el && el.classList.add('reel-split-pending'));
    document.fonts.ready.then(() => {
      if (hero) SplitText.create(hero, {
        type: 'lines,chars', linesClass: 'reel-line', mask: 'lines', autoSplit: true,
        onSplit(self) {
          hero.classList.remove('reel-split-pending');
          return gsap.from(self.chars, { yPercent: 115, rotate: 6, duration: 1.1, stagger: .035, ease: 'expo.out', delay: .15 });
        },
      });
      heads.forEach(el => SplitText.create(el, {
        type: 'lines,words', linesClass: 'reel-line', mask: 'lines', autoSplit: true,
        onSplit(self) {
          el.classList.remove('reel-split-pending');
          return gsap.from(self.words, {
            yPercent: 110, duration: .95, stagger: .06, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 86%', once: true },
          });
        },
      }));
    });
  }

  /* ---------- marquee with scroll-velocity boost ---------- */
  if (marquee) {
    const track = $('.reel-track', marquee);
    const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    let boost = gsap.to({}, {});
    ScrollTrigger.create({
      onUpdate(self) {
        const v = Math.min(Math.abs(self.getVelocity()) / 260, 5);
        boost.kill();
        loop.timeScale(1 + v);
        boost = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'power2.out' });
      },
    });
    ScrollTrigger.create({ trigger: marquee, start: 'top bottom', end: 'bottom top',
      onToggle: s => (s.isActive ? loop.resume() : loop.pause()) });
  }

  /* ---------- breathing blob ---------- */
  if (blob) {
    const state = { r: blob.radii.slice(), q: blob.ringRadii.slice() };
    const draw = () => {
      blob.body.setAttribute('d', blobPath(state.r));
      blob.ring.setAttribute('d', blobPath(state.q));
    };
    const morph = () => gsap.to(state.r, {
      endArray: randomRadii(7, 220, 80), duration: 4.5, ease: 'sine.inOut', onUpdate: draw, onComplete: morph,
    });
    const morphRing = () => gsap.to(state.q, {
      endArray: randomRadii(9, 262, 46), duration: 6, ease: 'sine.inOut', onComplete: morphRing,
    });
    morph();
    morphRing();
    gsap.to(blob.el, { rotate: 360, duration: 90, ease: 'none', repeat: -1 });
    gsap.from(blob.el, { scale: .6, opacity: 0, duration: 1.6, ease: 'expo.out', delay: .1 });
    gsap.to(blob.el, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- waves drift and part on scroll ---------- */
  waves.forEach(w => {
    $$('path', w).forEach((p, i) => {
      gsap.to(p, { x: -600, duration: 16 + i * 7, ease: 'none', repeat: -1 });
      gsap.fromTo(p, { y: 22 - i * 6 }, { y: 0, ease: 'none', scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom 55%', scrub: true } });
    });
  });

  /* ---------- section entrances ---------- */
  gsap.utils.toArray('.career-route a').forEach((a, i) => gsap.from(a, {
    y: 28, opacity: 0, duration: .9, delay: i * .08, ease: 'expo.out',
    scrollTrigger: { trigger: '.career-route', start: 'top 92%', once: true },
  }));

  /* ---------- pointer-only: spotlight, magnetic, cursor ring ---------- */
  if (fine) {
    $$('.career-route a, .kpi-card, .case, .contact-links a').forEach(el => {
      el.classList.add('reel-spot');
      const glow = document.createElement('span');
      glow.className = 'reel-glow';
      glow.setAttribute('aria-hidden', 'true');
      el.prepend(glow);
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });

    $$('.button, .nav-resume, .contact-links a, .opening-music-link').forEach(el => {
      const x = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3.out' });
      const y = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * .28);
        y((e.clientY - r.top - r.height / 2) * .35);
      });
      el.addEventListener('pointerleave', () => { x(0); y(0); });
    });

    const ring = document.createElement('div');
    ring.className = 'reel-cursor';
    ring.setAttribute('aria-hidden', 'true');
    document.body.append(ring);
    const cx = gsap.quickTo(ring, 'x', { duration: .35, ease: 'power3.out' });
    const cy = gsap.quickTo(ring, 'y', { duration: .35, ease: 'power3.out' });
    const darkZones = '.world, .scene-gate, .habit, .dashboard, .site-footer';
    addEventListener('pointermove', e => {
      cx(e.clientX); cy(e.clientY);
      ring.classList.add('is-on');
      const t = e.target instanceof Element ? e.target : null;
      ring.classList.toggle('is-link', !!(t && t.closest('a, button, [role="button"], input, select, label')));
      ring.classList.toggle('on-dark', !!(t && t.closest(darkZones)));
    }, { passive: true });
    document.addEventListener('pointerleave', () => ring.classList.remove('is-on'));
  }

  /* ---------- respect the existing Pause effects button ---------- */
  const sync = () => {
    const paused = root.classList.contains('effects-paused');
    paused ? gsap.globalTimeline.pause() : gsap.globalTimeline.resume();
  };
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
