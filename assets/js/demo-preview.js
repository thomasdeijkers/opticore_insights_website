(() => {
  const desktop = window.matchMedia('(min-width:1101px) and (hover:hover) and (pointer:fine)');
  const previews = document.querySelectorAll('.webapp-demo-teaser');

  previews.forEach(preview => {
    const controls = preview.querySelector('[data-demo-preview-controls]');
    const screen = preview.querySelector('.webapp-demo-teaser-scroll');
    const sources = [...preview.querySelectorAll('picture source')];
    if (!controls || !screen || sources.length !== 2) return;

    // Keep the translated, versioned picture URLs and its automatic media rules.
    const automaticMedia = sources.map(source => source.getAttribute('media'));
    const buttons = [...controls.querySelectorAll('[data-demo-preview-device]')];
    let selected = 'desktop';

    function render() {
      controls.hidden = !desktop.matches;
      if (desktop.matches) {
        preview.dataset.demoPreview = selected;
        sources.forEach((source, index) => {
          const device = index === 0 ? 'mobile' : 'tablet';
          source.media = selected === device ? 'all' : 'not all';
        });
      } else {
        delete preview.dataset.demoPreview;
        sources.forEach((source, index) => source.setAttribute('media', automaticMedia[index]));
      }
      buttons.forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.demoPreviewDevice === selected));
      });
    }

    buttons.forEach(button => button.addEventListener('click', () => {
      const device = button.dataset.demoPreviewDevice;
      if (!desktop.matches || !['desktop', 'tablet', 'mobile'].includes(device)) return;
      selected = device;
      screen.scrollTop = 0;
      render();
    }));

    desktop.addEventListener('change', render);
    render();
  });
})();
