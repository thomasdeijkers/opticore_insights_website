(() => {
  // Portrait phones use phone captures; landscape phones use the tablet captures.
  const mobile = window.matchMedia('(max-width: 760px) and (orientation: portrait)');
  const tablet = window.matchMedia('(min-width: 761px) and (max-width: 1100px), (max-width: 760px) and (orientation: landscape), (orientation: landscape) and (pointer: coarse)');
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
      scene: link.dataset.screenTitle || image.alt,
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
      if (event.isPrimary && event.button === 0 && !disabled()) {
        start = { x: event.clientX, y: event.clientY };
        element.setPointerCapture(event.pointerId);
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
    const credits = document.createElement('a');
    credits.className = 'image-viewer-credits';
    credits.href = '/demo/beeldbronnen/';
    credits.target = '_blank';
    credits.rel = 'noopener noreferrer';
    credits.textContent = 'Productfoto’s en beeldbronnen ↗';
    credits.hidden = true;
    dialog.querySelector('.image-viewer-header>div').append(credits);
    const stage = dialog.querySelector('.image-viewer-stage');
    stage.querySelector('img').draggable = false;
    const arrows = dialog.querySelector('.image-viewer-arrows');
    const prev = button('Vorige afbeelding', '←', () => moveViewer(-1));
    const next = button('Volgende afbeelding', '→', () => moveViewer(1));
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
    dialog.querySelector('.image-viewer-kind').textContent = `${item.device === 'mobile' ? 'Mobiel' : item.device === 'tablet' ? 'Tablet' : 'Desktop'}${item.demo ? ' · Voorbeeldgegevens' : ''}`;
    dialog.querySelector('.image-viewer-credits').hidden = !/^\/assets\/img\/(?:localized\/(?:de|en|fr)\/)?(?:module-examples\/client-|examples\/client-(?:management|forecast|stock|ranking|marketing|listing)-)/.test(item.src);
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

  function openViewer(items, index, trigger, owner = null) {
    viewer ||= createViewer();
    active = { items, index, owner };
    opener = trigger;
    renderViewer();
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    viewer.dialog.showModal();
    viewer.close.focus();
  }

  document.querySelectorAll('[data-screen-gallery]').forEach(root => {
    // These local captures are produced alongside every desktop demo image.
    root.querySelectorAll('[data-screen-device="desktop"][data-screen-demo="true"]').forEach(link => {
      const src=link.getAttribute('href');
      if(!/^\/assets\/img\/(?:localized\/(?:de|en|fr)\/)?(?:module-examples|examples)\/[^?]+-desktop-dark\.(?:jpg|png)(?:\?[^#]*)?$/.test(src||''))return;
      const copy=link.cloneNode(true),tabletSrc=src.replace('-desktop-dark.','-tablet-dark.');
      copy.dataset.screenDevice='tablet';copy.dataset.screenPreview='tablet';copy.href=tabletSrc;
      const img=copy.querySelector('img');if(img){img.src=tabletSrc;img.width=834;img.height=1112;img.loading='lazy';}
      copy.hidden=true;link.parentElement.append(copy);
    });
    const allItems = Array.from(root.querySelectorAll('[data-screen-device]')).map(readItem);
    if (!allItems.length) return;
    let items = [];
    allItems.forEach(item => {
      item.link.setAttribute('aria-haspopup', 'dialog');
      item.link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openViewer(items, items.indexOf(item), item.link, root);
      });
    });
    const adapt = () => {
      const current = active?.owner === root ? active.items[active.index] : null;
      const device = mobile.matches ? 'mobile' : tablet.matches ? 'tablet' : 'desktop';
      const matching = allItems.filter(item => item.device === device);
      const candidates = matching.length ? matching : allItems;
      const seen = new Set();
      items = candidates.filter(item => {
        if (seen.has(item.src)) return false;
        seen.add(item.src);
        return true;
      });
      const requestedPreviews = Number(root.dataset.screenPreviews);
      const previewLimit = Number.isInteger(requestedPreviews) && requestedPreviews > 0 ? Math.min(requestedPreviews, 4) : items[0].device === 'mobile' ? 2 : 1;
      const previews = items.slice(0, previewLimit);
      root.dataset.device = items[0].device;
      root.dataset.previewCount = String(previews.length);
      allItems.forEach(item => { item.link.hidden = !previews.includes(item); });
      root.classList.add('is-ready');
      if (active?.owner === root) {
        active.items = items;
        active.index = Math.max(0, items.findIndex(item => item.scene === current?.scene));
        opener = previews.includes(items[active.index]) ? items[active.index].link : previews[0].link;
        renderViewer();
      }
    };
    mobile.addEventListener('change', adapt);
    tablet.addEventListener('change', adapt);
    adapt();
    const openAll = root.querySelector('[data-screen-open-all]');
    if (openAll) {
      openAll.hidden = false;
      openAll.addEventListener('click', () => openViewer(items, 0, openAll, root));
    }
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
