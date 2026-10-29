(() => {
  const form = document.querySelector('[data-contact-form]');
  const choice = form?.querySelector('#contact-topic');
  const fields = form?.querySelector('#contact-fields');
  const status = form?.querySelector('[data-contact-status]');
  if (!choice || !fields) return;

  const panels = [...fields.querySelectorAll('[data-contact-topic]')];
  const teamType = form.querySelector('#team-type');
  const teamPanels = [...fields.querySelectorAll('[data-team-type]')];
  function updateTeam() {
    for (const panel of teamPanels) {
      const active = choice.value === 'team' && panel.dataset.teamType === teamType?.value;
      panel.hidden = !active;
      panel.disabled = !active;
    }
  }
  function update(announce = false) {
    const active = panels.find(panel => panel.dataset.contactTopic === choice.value);
    for (const panel of panels) {
      panel.hidden = panel !== active;
      panel.disabled = panel !== active;
    }
    fields.hidden = !active;
    updateTeam();
    status.textContent = active && announce
      ? `De vragen voor ‘${choice.selectedOptions[0].textContent}’ staan hieronder.`
      : '';
  }

  // Only select a known topic; URL text is never rendered as HTML or form content.
  const requestedTopic = new URLSearchParams(window.location.search).get('onderwerp');
  if (panels.some(panel => panel.dataset.contactTopic === requestedTopic)) {
    choice.value = requestedTopic;
  }
  const requestedCollaboration = new URLSearchParams(window.location.search).get('samenwerking');
  if (choice.value === 'team' && teamType && [...teamType.options].some(option => option.value && option.value === requestedCollaboration)) {
    teamType.value = requestedCollaboration;
  }

  // Only authored role IDs may prefill the editable expertise field.
  const roles = {
    "marketing": "Marketing",
    "fullstack_frontend": "Fullstack developer · frontend",
    "fullstack_backend": "Fullstack developer · API’s",
    "fullstack_platform": "Fullstack developer · platform",
    "ux": "UX designer",
    "consultant": "Projectconsultant",
    "seo": "SEO specialist",
    "sea": "SEA specialist",
    "buitendienst": "Buitendienst"
};
  const requestedRole = new URLSearchParams(window.location.search).get('rol');
  const expertise = form.querySelector('#team-expertise');
  if (choice.value === 'team' && expertise && !expertise.value && Object.hasOwn(roles, requestedRole)) {
    const label = roles[requestedRole];
    expertise.value = window.SiteI18n?.text(label) || label;
  }

  choice.addEventListener('change', () => update(true));
  teamType?.addEventListener('change', updateTeam);
  // Restore the selected form when returning through browser history.
  window.addEventListener('pageshow', () => update());
  form.addEventListener('reset', () => requestAnimationFrame(() => update()));
  update();
})();
