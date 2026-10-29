/* Progressive enhancement: swipe/keyboard/previous/next, deliberately no autoplay. */
(() => {
  document.querySelectorAll('[data-expectations]').forEach(section => {
    const track = section.querySelector('.expectations-track');
    const slides = [...track.children];
    const previous = section.querySelector('[data-expectation-prev]');
    const next = section.querySelector('[data-expectation-next]');
    const count = section.querySelector('.expectations-count');
    let frame, selected = 0;
    const index = () => Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    function update() {
      const current = index();
      selected = current;
      count.textContent = `${current + 1} / ${slides.length}`;
      previous.disabled = current === 0;
      next.disabled = current === slides.length - 1;
    }
    function go(target, immediate = false) {
      target = Math.max(0, Math.min(slides.length - 1, target));
      track.scrollTo({left: target * track.clientWidth, behavior: immediate || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
    previous.addEventListener('click', () => go(index() - 1));
    next.addEventListener('click', () => go(index() + 1));
    track.addEventListener('keydown', event => {
      if (event.target !== track) return;
      const targets = {ArrowLeft: index() - 1, ArrowRight: index() + 1, Home: 0, End: slides.length - 1};
      if (!(event.key in targets)) return;
      event.preventDefault(); go(targets[event.key]);
    });
    track.addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }, {passive:true});
    // Keep the selected card aligned if the viewport rotates or resizes.
    const observer = new ResizeObserver(() => {
      go(selected, true); update();
    });
    observer.observe(track);
    section.querySelector('.expectations-controls').hidden = false;
    section.querySelector('.expectations-carousel').classList.add('is-enhanced');
    update();
  });
})();
