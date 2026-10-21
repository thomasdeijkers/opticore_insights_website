(() => {
  const mobile = window.matchMedia('(max-width: 760px)');
  const imageLinks = 'a[href^="/assets/img/"]';
  let viewer;
  let active;
  let opener;
  let previousOverflow;

  function readItem(link) {
    const image = link.querySelector('img');
    return {
      link,
      src: link.getAttribute('href'),
      alt: image.alt,
      title: link.dataset.screenTitle || (image.alt.length > 80 ? `${image.alt.slice(0, 77)}…` : image.alt),
      device: link.dataset.screenDevice || 'desktop',
      demo: link.dataset.screenDemo === 'true' || /fictie|DEMO-/i.test(image.alt)
    };
  }

  function button(label, text, action) {
    const element = document.createElement('button');
    element.type = 'button';
    element.setAttribute('aria-label', label);
    element.textContent = text;
    element.addEventListener('click', action);
    return element;
  }

  function swipe(element, move, disabled = () => false) {
    let start;
    element.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch' && event.isPrimary && !disabled()) {
        start = { x: event.clientX, y: event.clientY };
      }
    });
    element.addEventListener('pointerup', event => {
      if (!start || disabled()) return;
      const x = event.clientX - start.x;
      const y = event.clientY - start.y;
      start = null;
      if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.3) move(x < 0 ? 1 : -1);
    });
    element.addEventListener('pointercancel', () => { start = null; });
  }

  function createViewer() {
    const dialog = document.createElement('dialog');
    dialog.className = 'image-viewer';
    dialog.setAttribute('aria-labelledby', 'image-viewer-title');
    dialog.innerHTML = '<div class="image-viewer-shell"><header class="image-viewer-header"><div><strong id="image-viewer-title"></strong><span class="image-viewer-kind"></span></div></header><div class="image-viewer-stage"><img alt=""></div><footer class="image-viewer-footer"><div class="image-viewer-arrows"></div><span class="image-viewer-count" role="status" aria-live="polite"></span></footer></div>';
    const close = button('Afbeeldingen sluiten', 'Sluiten ×', () => dialog.close());
    close.className = 'image-viewer-close';
    dialog.querySelector('.image-viewer-header').append(close);
    const stage = dialog.querySelector('.image-viewer-stage');
    const arrows = dialog.querySelector('.image-viewer-arrows');
    const prev = button('Vorige afbeelding', '← Vorige', () => moveViewer(-1));
    const next = button('Volgende afbeelding', 'Volgende →', () => moveViewer(1));
    arrows.append(prev, next);
    const zoom = button('Afbeelding vergroten', 'Vergroten +', () => {
      const zoomed = stage.classList.toggle('is-zoomed');
      zoom.textContent = zoomed ? 'Passend maken −' : 'Vergroten +';
      zoom.setAttribute('aria-label', zoomed ? 'Afbeelding passend maken' : 'Afbeelding vergroten');
      zoom.setAttribute('aria-pressed', String(zoomed));
      stage.scrollTo(0, 0);
    });
    zoom.className = 'image-viewer-zoom';
    dialog.querySelector('.image-viewer-footer').append(zoom);
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      }
    });
    dialog.addEventListener('close', () => {
      document.documentElement.style.overflow = previousOverflow;
      active = null;
      stage.classList.remove('is-zoomed');
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (!stage.classList.contains('is-zoomed')) {
          event.preventDefault();
          moveViewer(event.key === 'ArrowRight' ? 1 : -1);
        }
      }
    });
    swipe(stage, moveViewer, () => stage.classList.contains('is-zoomed'));
    document.body.append(dialog);
    return { dialog, close, stage, image: stage.querySelector('img'), prev, next, zoom };
  }

  function renderViewer() {
    const item = active.items[active.index];
    const { dialog, image, stage, zoom, prev, next } = viewer;
    stage.classList.remove('is-zoomed');
    stage.scrollTo(0, 0);
    zoom.textContent = 'Vergroten +';
    zoom.setAttribute('aria-label', 'Afbeelding vergroten');
    zoom.setAttribute('aria-pressed', 'false');
    image.src = item.src;
    image.alt = item.alt;
    dialog.querySelector('#image-viewer-title').textContent = item.title;
    dialog.querySelector('.image-viewer-kind').textContent = `${item.device === 'mobile' ? 'Mobiel' : 'Desktop'}${item.demo ? ' · Voorbeeldgegevens' : ''}`;
    dialog.querySelector('.image-viewer-count').textContent = `${active.index + 1} van ${active.items.length}`;
    prev.disabled = next.disabled = active.items.length < 2;
    // Only the current full image and its neighbour are downloaded eagerly.
    if (active.items.length > 1) {
      const preload = new Image();
      preload.src = active.items[(active.index + 1) % active.items.length].src;
    }
  }

  function moveViewer(delta) {
    if (!active) return;
    active.index = (active.index + delta + active.items.length) % active.items.length;
    renderViewer();
  }

  function openViewer(items, index, trigger) {
    viewer ||= createViewer();
    active = { items, index };
    opener = trigger;
    renderViewer();
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    viewer.dialog.showModal();
    viewer.close.focus();
  }

  document.querySelectorAll('[data-screen-gallery]').forEach(root => {
    const items = Array.from(root.querySelectorAll('[data-screen-device]')).map(readItem);
    if (!items.length) return;
    const stage = root.querySelector('.screen-gallery-stage');
    const state = { selected: false, index: 0 };
    const toolbar = document.createElement('div');
    toolbar.className = 'screen-gallery-toolbar';
    const title = document.createElement('strong');
    title.className = 'screen-gallery-title';
    const controls = document.createElement('div');
    controls.className = 'screen-gallery-controls';
    const modes = document.createElement('div');
    modes.className = 'screen-gallery-modes';
    modes.setAttribute('role', 'group');
    modes.setAttribute('aria-label', 'Kies een schermweergave');
    const choose = device => {
      const index = items.findIndex(item => item.device === device);
      if (index < 0) return;
      state.selected = true;
      state.index = index;
      render();
    };
    const phone = button('Toon mobiele beelden', 'Mobiel', () => choose('mobile'));
    const desktop = button('Toon desktopbeelden', 'Desktop', () => choose('desktop'));
    phone.hidden = !items.some(item => item.device === 'mobile');
    desktop.hidden = !items.some(item => item.device === 'desktop');
    modes.append(phone, desktop);
    const count = document.createElement('span');
    count.className = 'screen-gallery-count';
    count.setAttribute('role', 'status');
    count.setAttribute('aria-live', 'polite');
    const move = delta => {
      state.selected = true;
      state.index = (state.index + delta + items.length) % items.length;
      render();
    };
    const prev = button('Vorige afbeelding', '←', () => move(-1));
    const next = button('Volgende afbeelding', '→', () => move(1));
    prev.disabled = next.disabled = items.length < 2;
    controls.append(modes, prev, count, next);
    toolbar.append(title, controls);
    root.prepend(toolbar);
    const hint = document.createElement('span');
    hint.className = 'screen-gallery-open';
    hint.textContent = 'Vergroten ↗';
    stage.append(hint);
    function render() {
      const item = items[state.index];
      root.dataset.device = item.device;
      title.textContent = item.title;
      count.textContent = `${state.index + 1} / ${items.length}`;
      phone.setAttribute('aria-pressed', String(item.device === 'mobile'));
      desktop.setAttribute('aria-pressed', String(item.device === 'desktop'));
      items.forEach((entry, index) => { entry.link.hidden = index !== state.index; });
      item.link.querySelector('img').loading = 'eager';
      root.classList.add('is-ready');
    }
    items.forEach(item => {
      item.link.setAttribute('aria-haspopup', 'dialog');
      item.link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        state.selected = true;
        openViewer(items, items.indexOf(item), item.link);
      });
    });
    swipe(stage, move);
    root.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    const adapt = () => {
      if (!state.selected) {
        const device = mobile.matches ? 'mobile' : 'desktop';
        items.sort((a, b) => Number(b.device === device) - Number(a.device === device));
        state.index = 0;
        render();
      }
    };
    mobile.addEventListener('change', adapt);
    adapt();
  });

  // Other project and source screenshots use the same accessible viewer.
  const remaining = Array.from(document.querySelectorAll(imageLinks))
    .filter(link => !link.closest('[data-screen-gallery]') && link.querySelector('img') && /\.(png|jpe?g|webp)$/i.test(link.getAttribute('href')));
  const otherItems = remaining.map(readItem);
  remaining.forEach((link, index) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openViewer(otherItems, index, link);
    });
  });
})();
