(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('.motion-toggle');
  const label = document.querySelector('[data-motion-label]');
  const video = document.querySelector('.atmosphere-video');
  let videoFailed = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let saved = false;
  try { saved = sessionStorage.getItem('seocheon-motion-paused') === 'true'; } catch (_) {}
  let paused = saved || reduced.matches;
  let pending = false;
  function paint() {
    pending = false;
    if (paused) return;
    const max = Math.max(1, root.scrollHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / max));
    const phase = Math.max(0, (progress - .24) / .76);
    root.style.setProperty('--journey', progress.toFixed(4));
    root.style.setProperty('--drift', (-progress * 48).toFixed(1) + 'px');
    root.style.setProperty('--haze', (phase * .27).toFixed(3));
    root.style.setProperty('--violet', (.04 + phase * .72).toFixed(3));
    root.style.setProperty('--prism-turn', (phase * 110).toFixed(1) + 'deg');
  }
  function requestPaint() {
    if (!paused && !pending) { pending = true; requestAnimationFrame(paint); }
  }
  function syncVideo() {
    if (!video) return;
    if (paused || reduced.matches || document.hidden || navigator.connection?.saveData || videoFailed) {
      video.pause();
      return;
    }
    video.muted = true;
    if (!video.getAttribute('src')) {
      video.src = video.querySelector('source').dataset.videoSrc;
      video.load();
    }
    const playback = video.play();
    if (playback) playback.catch(() => { /* Static artwork remains if autoplay is unavailable. */ });
  }
  if (video) video.addEventListener('error', () => { videoFailed = true; video.style.display = 'none'; });
  function sync() {
    document.body.classList.toggle('motion-paused', paused);
    toggle.disabled = reduced.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', reduced.matches ? 'Background motion disabled by your device preference' : (paused ? 'Resume background motion' : 'Pause background motion'));
    label.textContent = reduced.matches ? 'Reduced motion on' : (paused ? 'Motion paused' : 'Pause motion');
    requestPaint();
    syncVideo();
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    saved = paused;
    try { sessionStorage.setItem('seocheon-motion-paused', String(paused)); } catch (_) {}
    sync();
  });
  reduced.addEventListener('change', () => { paused = reduced.matches || saved; sync(); });
  window.addEventListener('scroll', requestPaint, { passive:true });
  window.addEventListener('resize', requestPaint, { passive:true });
  document.addEventListener('visibilitychange', () => {
    document.querySelector('.seocheon-atmosphere').style.visibility = document.hidden ? 'hidden' : '';
    if (!document.hidden) requestPaint();
    syncVideo();
  });
  sync();
})();
