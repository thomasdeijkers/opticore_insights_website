(() => {
  const form = document.querySelector('[data-contact-form]');
  const choice = form?.querySelector('#contact-topic');
  const fields = form?.querySelector('#contact-fields');
  const status = form?.querySelector('[data-contact-status]');
  if (!choice || !fields) return;

  const panels = [...fields.querySelectorAll('[data-contact-topic]')];
  function update(announce = false) {
    const active = panels.find(panel => panel.dataset.contactTopic === choice.value);
    for (const panel of panels) {
      panel.hidden = panel !== active;
      panel.disabled = panel !== active;
    }
    fields.hidden = !active;
    status.textContent = active && announce
      ? `De vragen voor ‘${choice.selectedOptions[0].textContent}’ staan hieronder.`
      : '';
  }

  choice.addEventListener('change', () => update(true));
  // Restore the selected form when returning through browser history.
  window.addEventListener('pageshow', () => update());
  form.addEventListener('reset', () => requestAnimationFrame(() => update()));
  update();
})();
