(() => {
  const panel = document.querySelector('.demo-disclosure');
  function openDemo() {
    if (!panel || panel.open) return;
    panel.open = true;
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }
  document.querySelectorAll('a[href="#demo"]').forEach(a => a.addEventListener('click', openDemo));
  if (location.hash === '#demo') openDemo();
  addEventListener('hashchange', () => { if (location.hash === '#demo') openDemo(); });
  panel?.addEventListener('toggle', () => { if (panel.open) window.dispatchEvent(new Event('resize')); });
})();
