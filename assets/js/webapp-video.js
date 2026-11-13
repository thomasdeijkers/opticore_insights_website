(() => {
  for (const section of document.querySelectorAll('.webapp-promo-video')) {
    const trigger = section.querySelector('.webapp-video-preview');
    const dialog = section.querySelector('.webapp-video-dialog');
    const loop = section.querySelector('.webapp-video-loop');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reducedMotion.matches) {
      const startLoop = () => {
        if (!loop.src) loop.src = loop.dataset.previewSrc;
        loop.play().then(() => loop.classList.add('preview-loop-active')).catch(() => {});
      };
      if (window.IntersectionObserver) {
        const observer = new IntersectionObserver(entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) startLoop(); else loop.pause();
          }
        }, { threshold: 0.15 });
        observer.observe(loop);
      } else startLoop();
    }
    const video = section.querySelector('.webapp-video-dialog video');
    const close = dialog.querySelector('.webapp-video-close');
    if (!dialog.showModal) continue;
    trigger.addEventListener('click', event => {
      event.preventDefault();
      if (!video.src) video.src = video.dataset.videoSrc;
      loop.pause();
      dialog.showModal();
      video.play().catch(() => {});
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { video.pause(); video.currentTime = 0; if (loop.src && !reducedMotion.matches) loop.play().catch(() => {}); trigger.focus(); });
  }
})();
