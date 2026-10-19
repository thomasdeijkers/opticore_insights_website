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

  // Only select a known topic; URL text is never rendered as HTML or form content.
  const requestedTopic = new URLSearchParams(window.location.search).get('onderwerp');
  if (panels.some(panel => panel.dataset.contactTopic === requestedTopic)) {
    choice.value = requestedTopic;
  }

  choice.addEventListener('change', () => update(true));
  // Restore the selected form when returning through browser history.
  window.addEventListener('pageshow', () => update());
  form.addEventListener('reset', () => requestAnimationFrame(() => update()));
  update();
})();
