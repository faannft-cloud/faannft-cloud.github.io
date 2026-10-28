/* Playing state and the one scroll entrance. No library, no autoplay. */
(function () {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');

  // body.is-playing is set only while a track is actually playing.
  const audios = [...document.querySelectorAll('audio')];
  const update = () => document.body.classList.toggle('is-playing', audios.some(a => !a.paused && !a.ended));
  audios.forEach(a => ['play', 'pause', 'ended'].forEach(ev => a.addEventListener(ev, update)));

  // Sections rise in once; content is visible by default if this never runs.
  const targets = document.querySelectorAll('.case, .habit-grid, .kpi-grid, .cover-wall, .music-player, .experience-row');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  targets.forEach(t => t.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach(t => io.observe(t));
})();
