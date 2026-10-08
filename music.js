(function () {
  'use strict';
  document.querySelectorAll('[data-music-player]').forEach(player => {
    const audio = player.querySelector('audio');
    const rows = [...player.querySelectorAll('[data-track]')];
    const cover = player.querySelector('[data-now-cover]');
    const title = player.querySelector('[data-now-title]');
    const credit = player.querySelector('[data-now-credit]');
    const status = player.querySelector('[data-playback-status]');
    const fileLink = player.querySelector('[data-audio-link]');
    let selected = 0;
    let request = 0;

    function sync() {
      rows.forEach((row, index) => {
        const playing = index === selected && !audio.paused && !audio.ended;
        row.classList.toggle('is-selected', index === selected);
        row.classList.toggle('is-playing', playing);
        row.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + row.dataset.title);
        row.querySelector('[data-track-action]').textContent = playing ? 'Pause' : 'Play';
      });
    }

    async function select(index) {
      const ownRequest = ++request;
      const row = rows[index];
      if (index === selected && !audio.paused && !audio.ended) {
        audio.pause();
        return;
      }
      if (index !== selected || audio.error) {
        audio.pause();
        selected = index;
        audio.src = row.dataset.src;
        audio.load();
      } else if (audio.ended) {
        audio.currentTime = 0;
      }
      cover.src = row.dataset.cover;
      cover.alt = row.dataset.title + ' cover artwork';
      title.textContent = row.dataset.title;
      credit.textContent = 'Artwork: ' + row.dataset.credit;
      audio.setAttribute('aria-label', row.dataset.title + ' audio player');
      fileLink.href = row.dataset.src;
      status.textContent = 'Loading ' + row.dataset.title + '…';
      sync();
      try {
        await audio.play();
      } catch (error) {
        if (ownRequest !== request || error.name === 'AbortError') return;
        status.textContent = error.name === 'NotAllowedError'
          ? 'Press play in the audio controls to begin.'
          : 'This track could not load. Select it again to retry, or open the audio file.';
        sync();
      }
    }

    rows.forEach((row, index) => row.addEventListener('click', () => select(index)));
    audio.addEventListener('play', () => {
      document.querySelectorAll('audio').forEach(other => { if (other !== audio) other.pause(); });
      sync();
    });
    audio.addEventListener('playing', () => {
      status.textContent = 'Playing — ' + rows[selected].dataset.title;
      sync();
    });
    audio.addEventListener('waiting', () => {
      if (!audio.paused) status.textContent = 'Buffering — ' + rows[selected].dataset.title;
    });
    audio.addEventListener('pause', () => {
      if (!audio.error) status.textContent = 'Paused — ' + rows[selected].dataset.title;
      sync();
    });
    audio.addEventListener('ended', () => {
      status.textContent = 'Track finished. Choose another track to continue.';
      sync();
    });
    audio.addEventListener('error', () => {
      status.textContent = 'This track could not load. Select it again to retry, or open the audio file.';
      sync();
    });
    sync();
  });
})();
