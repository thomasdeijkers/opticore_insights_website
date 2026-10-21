(() => {
  const app = document.querySelector('[data-scan-app]');
  const questionnaire = document.querySelector('#scan-questions');
  if (!app || !questionnaire) return;
  const panels = [...app.querySelectorAll('[data-scan-step]')];
  const progress = [...document.querySelectorAll('[data-scan-progress]')];
  const status = app.querySelector('[data-scan-status]');
  const error = app.querySelector('[data-scan-error]');
  const next = app.querySelector('[data-scan-next]');
  const names = ['Je bedrijf', 'Het dagelijkse werk', 'Systemen en inzicht', 'Doel en prioriteit', 'Samenvatting en versturen'];
  const contactForm = document.querySelector('#scan-contact-form');
  const loading = app.querySelector('[data-scan-loading]');
  const recovery = app.querySelector('[data-scan-recovery]');
  const nextLabels = ['Verder naar dagelijks werk →', 'Verder naar systemen →', 'Verder naar je doel →', 'Verder naar samenvatting →'];
  let step = 0;
  let definitions = [];
  let busy = false;
  let analysis = null;
  let analyzedInput = '';

  function showError(message = '') {
    error.textContent = message;
    error.hidden = !message;
  }
  function showStep(index, focus = true) {
    step = index;
    for (const panel of panels) {
      const active = Number(panel.dataset.scanStep) === step;
      panel.hidden = !active;
      if (panel.tagName === 'FIELDSET') panel.disabled = !active;
    }
    questionnaire.hidden = step > 3;
    progress.forEach((item, i) => {
      if (i === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.classList.toggle('is-complete', i < step);
    });
    document.querySelector('[data-step-label]').textContent = `Stap ${step + 1} van 5 · ${names[step]}`;
    next.textContent = nextLabels[step] || '';
    questionnaire.querySelector('[data-scan-back]').hidden = step === 0;
    showError();
    status.textContent = '';
    if (step === 3) updateReview();
    if (focus) {
      const heading = panels[step].querySelector('h2');
      heading.focus({preventScroll: true});
      heading.scrollIntoView({behavior: 'auto', block: 'start'});
    }
  }
  function values() {
    const result = {};
    for (const field of definitions) {
      const controls = [...questionnaire.querySelectorAll(`[name="${field.key}"]`)];
      result[field.key] = field.type === 'checkboxes'
        ? controls.filter(input => input.checked).map(input => input.value)
        : (controls[0]?.value || '').trim();
    }
    return result;
  }
  function processAnswers() {
    const answers = values();
    return Object.fromEntries(definitions.filter(field => field.ai).map(field => [field.key, answers[field.key]]));
  }
  function processText() {
    const answers = processAnswers();
    return definitions.filter(field => field.ai).map(field => {
      const answer = Array.isArray(answers[field.key]) ? answers[field.key].join(', ') : answers[field.key];
      return `${field.label}\n${answer || 'Niet ingevuld'}`;
    }).join('\n\n');
  }
  function updateReview() {
    const answers = processAnswers();
    for (const list of app.querySelectorAll('[data-scan-review], [data-scan-final-review]')) {
      list.replaceChildren();
      for (const field of definitions.filter(field => field.ai)) {
        const term = document.createElement('dt');
        const definition = document.createElement('dd');
        term.textContent = field.label;
        definition.textContent = (Array.isArray(answers[field.key]) ? answers[field.key].join(', ') : answers[field.key]) || 'Niet ingevuld';
        list.append(term, definition);
      }
    }
  }
  function validCurrentStep() {
    let valid = true;
    for (const group of panels[step].querySelectorAll('[data-required-group]')) {
      const checked = !!group.querySelector('input:checked');
      group.querySelector('[data-group-error]').hidden = checked;
      if (!checked) {
        valid = false;
        group.querySelector('input').focus();
      }
    }
    if (!valid) return false;
    for (const control of panels[step].querySelectorAll('input,select,textarea')) {
      if (!control.reportValidity()) return false;
    }
    return true;
  }
  function setBusy(value) {
    busy = value;
    app.setAttribute('aria-busy', String(value));
    app.querySelectorAll('button').forEach(button => { button.disabled = value; });
    // Keep the submitted answers stable while the model is working.
    panels[3].disabled = value || step !== 3;
  }
  function resizeSummary() {
    if (step !== 4 || contactForm.hidden) return;
    for (const field of contactForm.querySelectorAll('textarea')) {
      field.style.height = 'auto';
      field.style.height = `${field.scrollHeight + 2}px`;
    }
  }
  contactForm.addEventListener('input', resizeSummary);
  window.addEventListener('resize', () => requestAnimationFrame(resizeSummary));
  function renderAnalysis(data) {
    document.querySelector('#scan-problem').value = data.problem;
    document.querySelector('#scan-approach').value = data.approach;
    document.querySelector('#scan-solution').value = data.solution;
    for (const [selector, items] of [['[data-scan-benefits]', data.benefits], ['[data-scan-questions]', data.questions]]) {
      const list = document.querySelector(selector);
      list.replaceChildren();
      for (const text of items) {
        const item = document.createElement('li');
        item.textContent = text;
        list.append(item);
      }
    }
  }
  async function makeAnalysis() {
    const answers = processAnswers();
    const fingerprint = JSON.stringify(answers);
    if (busy) return;
    showStep(4);
    recovery.hidden = true;
    if (analysis && fingerprint === analyzedInput) {
      contactForm.hidden = false;
      resizeSummary();
      return;
    }
    contactForm.hidden = true;
    document.querySelector('[data-scan-result-intro]').textContent = 'We maken automatisch een samenvatting van je keuzes. Je kunt die daarna aanpassen en versturen.';
    loading.hidden = false;
    setBusy(true);
    showError();
    status.textContent = 'Je procesantwoorden worden samengevat. Dit duurt meestal 10–30 seconden. Er wordt nog geen contactaanvraag verstuurd.';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    try {
      const bootstrapResponse = await fetch('/api/bedrijfsscan.php', {cache: 'no-store', credentials: 'same-origin', signal: controller.signal});
      const bootstrap = await bootstrapResponse.json();
      if (!bootstrapResponse.ok || !bootstrap.ready) throw new Error('De AI-scan is op dit moment niet beschikbaar. Je antwoorden blijven staan. Probeer het later opnieuw of neem rechtstreeks contact op.');
      const response = await fetch('/api/bedrijfsscan.php', {
        method: 'POST', credentials: 'same-origin', signal: controller.signal,
        headers: {'Content-Type': 'application/json', 'X-Scan-CSRF': bootstrap.csrf},
        body: JSON.stringify({answers, website: questionnaire.querySelector('[name="website"]').value})
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Het voorstel kon niet worden gemaakt. Je antwoorden zijn bewaard op deze pagina.');
      if (!result.analysis || !['problem', 'approach', 'solution'].every(key => typeof result.analysis[key] === 'string') || !['benefits', 'questions'].every(key => Array.isArray(result.analysis[key]) && result.analysis[key].every(item => typeof item === 'string'))) {
        throw new Error('De AI gaf geen volledig voorstel terug. Probeer het opnieuw; je antwoorden blijven staan.');
      }
      analysis = result.analysis;
      analyzedInput = fingerprint;
      renderAnalysis(analysis);
      updateReview();
      document.querySelector('[data-scan-result-intro]').textContent = 'Dit is een AI-samenvatting van je keuzes. Controleer de tekst en pas die gerust aan. Vul hieronder je contactgegevens in om je aanvraag te versturen. Het is een eerste denkrichting, geen definitief advies of offerte.';
      contactForm.hidden = false;
      resizeSummary();
      status.textContent = 'Je samenvatting is klaar. Er is nog geen contactaanvraag verstuurd.';
    } catch (failure) {
      showError(failure.name === 'AbortError' ? 'Het maken van het voorstel duurde te lang. Je antwoorden blijven staan. Probeer het nog eens.' : failure.message);
      status.textContent = '';
      recovery.hidden = false;
    } finally {
      clearTimeout(timeout);
      loading.hidden = true;
      setBusy(false);
    }
  }
  next.addEventListener('click', () => {
    if (busy || !validCurrentStep()) return;
    if (step === 3) makeAnalysis();
    else showStep(step + 1);
  });
  app.querySelectorAll('[data-scan-back]').forEach(button => button.addEventListener('click', () => {
    if (!busy) showStep(step - 1);
  }));
  questionnaire.addEventListener('submit', event => event.preventDefault());
  questionnaire.addEventListener('change', event => {
    const group = event.target.closest('[data-required-group]');
    if (group?.querySelector('input:checked')) group.querySelector('[data-group-error]').hidden = true;
  });
  app.querySelector('[data-scan-retry]').addEventListener('click', makeAnalysis);
  contactForm.addEventListener('submit', event => {
    if (busy || step !== 4 || !analysis || JSON.stringify(processAnswers()) !== analyzedInput) {
      event.preventDefault();
      showError('Maak eerst de samenvatting van je huidige antwoorden.');
      return;
    }
    const proposal = ['problem', 'approach', 'solution'].map(key => document.querySelector(`#scan-${key}`).value.trim());
    if (proposal.some(text => !text)) {
      event.preventDefault();
      showError('Laat het probleem, de aanpak en de oplossing ingevuld, zodat je aanvraag compleet is.');
      return;
    }
    // Compose the mail draft only on the explicit submit action, using the edited summary.
    document.querySelector('#scan-contact-message').value = [
      'Ik wil graag mijn bedrijfsscan met OptiCore Insights bespreken.',
      'SAMENVATTING (AI-concept, door mij gecontroleerd en eventueel aangepast)',
      `HET PROBLEEM\n${proposal[0]}`, `DE AANPAK\n${proposal[1]}`, `EEN MOGELIJKE OPLOSSING\n${proposal[2]}`,
      `WAT DIT KAN OPLEVEREN\n${analysis.benefits.map(text => '• ' + text).join('\n')}`,
      `NOG TE BESPREKEN\n${analysis.questions.map(text => '• ' + text).join('\n')}`,
      `MIJN PROCESKEUZES\n${processText()}`
    ].join('\n\n');
  });
  // No browser storage and no answers in query strings. Reloading starts a new scan.
  fetch('/assets/data/bedrijfsscan.json', {cache: 'no-cache'})
    .then(response => { if (!response.ok) throw new Error(); return response.json(); })
    .then(data => {
      definitions = data.steps.flatMap(item => item.fields);
      app.hidden = false;
      showStep(0, false);
    })
    .catch(() => {
      app.hidden = false;
      questionnaire.hidden = true;
      showError('De vragen konden niet worden geladen. Herlaad de pagina of gebruik het contactformulier via de link hiernaast.');
    });
})();
