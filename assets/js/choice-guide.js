import { models, sanitizeAnswers, findMatches, valueLabel, readState, shareURL } from '/assets/js/choice-guide-model.js?v=20261020a';

const root = document.querySelector('[data-choice-demo]');
if (root) {
  const initial = readState(location.search);
  let modelKey = initial.modelKey;
  let answers = initial.answers;
  let stepIndex = models[modelKey].steps.findIndex(step => !Object.hasOwn(answers, step.key));
  if (stepIndex < 0) stepIndex = models[modelKey].steps.length;
  const stage = root.querySelector('[data-demo-stage]');
  const overview = root.querySelector('[data-demo-overview]');
  const progress = root.querySelector('[data-demo-progress]');
  const announce = root.querySelector('[data-demo-status]');
  const selectors = [...root.querySelectorAll('[data-demo-model]')];

  function el(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function button(text, handler, className = 'demo-secondary') {
    const element = el('button', className, text);
    element.type = 'button';
    element.addEventListener('click', handler);
    return element;
  }
  function productCount(count) { return `${count} ${count === 1 ? 'voorbeeldmodel' : 'voorbeeldmodellen'}`; }
  function updateURL(finished = false) {
    history.replaceState(null, '', shareURL(location.href, modelKey, finished ? answers : {}));
  }
  function reset() {
    answers = {};
    stepIndex = 0;
    updateURL();
    render(true);
  }
  function edit(index) {
    stepIndex = index;
    updateURL();
    render(true);
  }
  function renderOverview() {
    const model = models[modelKey];
    const matches = findMatches(modelKey, answers);
    overview.replaceChildren();
    overview.append(el('h3', '', 'Je selectie'), el('p', 'demo-match-count', String(matches.length)), el('p', 'demo-match-caption', `van ${model.products.length} voorbeeldmodellen`));
    const summary = el('dl', 'demo-summary');
    model.steps.forEach((step, index) => {
      const row = el('div');
      const term = el('dt', '', step.label);
      const description = el('dd');
      description.append(el('span', '', valueLabel(step, answers[step.key])));
      if (Object.hasOwn(answers, step.key)) {
        const change = button('Wijzig', () => edit(index), 'demo-edit');
        change.setAttribute('aria-label', `Wijzig ${step.label.toLowerCase()}`);
        description.append(change);
      }
      row.append(term, description);
      summary.append(row);
    });
    overview.append(summary, button('Opnieuw beginnen', reset));
    const inlineCount = stage.querySelector('[data-demo-inline-count]');
    if (inlineCount) inlineCount.textContent = `${productCount(matches.length)} over na je keuzes`;
    announce.textContent = matches.length ? `${productCount(matches.length)} ${matches.length === 1 ? 'voldoet' : 'voldoen'} aan je huidige keuzes.` : 'Geen voorbeeldmodel voldoet aan deze combinatie. Je kunt een keuze wijzigen.';
  }
  function renderResults() {
    const model = models[modelKey];
    const matches = findMatches(modelKey, answers);
    stage.append(el('p', 'eyebrow', 'Uitkomst van de demo'));
    const heading = el('h2', '', matches.length ? `${productCount(matches.length)} gevonden` : 'Geen passend voorbeeldmodel');
    heading.id = 'demo-heading';
    heading.tabIndex = -1;
    stage.append(heading, el('p', '', matches.length ? 'De uitkomst voldoet aan alle gekozen kenmerken. Je kunt je antwoorden rechts of hieronder wijzigen.' : 'In dit kleine voorbeeldassortiment komt deze combinatie niet voor. Wijzig een antwoord of kies bij een stap voor ‘Geen voorkeur’.'));
    if (matches.length) {
      const grid = el('div', 'demo-product-grid');
      matches.forEach(product => {
        const card = el('article', 'demo-product');
        card.append(el('p', 'demo-product-code', 'Voorbeeldproduct'), el('h3', '', `${model.noun.charAt(0).toUpperCase() + model.noun.slice(1)} ${product.id}`));
        const specs = el('dl');
        model.steps.forEach(step => {
          const row = el('div');
          row.append(el('dt', '', step.label), el('dd', '', valueLabel(step, product[step.key])));
          specs.append(row);
        });
        card.append(specs);
        grid.append(card);
      });
      stage.append(grid);
    }
    stage.append(el('p', 'demo-footnote', 'Dit zijn fictieve modellen om de werking te laten zien. In een keuzehulp voor jouw webshop kunnen hier de eigen artikelen en links naar productpagina’s staan.'));
    const share = el('div', 'demo-share');
    const label = el('label', '', 'Link naar deze uitkomst');
    label.htmlFor = 'demo-share-link';
    const input = el('input');
    input.id = 'demo-share-link';
    input.type = 'url';
    input.readOnly = true;
    input.value = shareURL(location.href, modelKey, answers);
    const status = el('p', 'demo-copy-status');
    status.setAttribute('role', 'status');
    const copy = button('Kopieer link', async () => {
      try {
        await navigator.clipboard.writeText(input.value);
        status.textContent = 'Link gekopieerd. Met deze link opent dezelfde uitkomst.';
      } catch {
        input.focus();
        input.select();
        status.textContent = 'Kopieer de geselecteerde link om deze uitkomst te bewaren.';
      }
    });
    share.append(label, input, copy, status);
    stage.append(share, button('Vorige stap', () => edit(model.steps.length - 1)));
    updateURL(true);
  }
  function renderQuestion() {
    const model = models[modelKey];
    const step = model.steps[stepIndex];
    stage.append(el('p', 'eyebrow', `Stap ${stepIndex + 1} van ${model.steps.length}`));
    const heading = el('h2', '', step.title);
    heading.id = 'demo-heading';
    heading.tabIndex = -1;
    const help = el('p', 'demo-question-help', step.help);
    help.id = 'demo-help';
    stage.append(heading, help);
    const fieldset = el('fieldset', 'demo-choices');
    fieldset.setAttribute('aria-labelledby', heading.id);
    fieldset.setAttribute('aria-describedby', help.id);
    const legend = el('legend', 'visually-hidden', step.title);
    fieldset.append(legend);
    const error = el('p', 'demo-error', 'Kies een optie of ‘Geen voorkeur’ om verder te gaan.');
    error.hidden = true;
    error.id = 'demo-error';
    error.setAttribute('role', 'alert');
    // Counts use preceding answers, so a later answer never hides an available option.
    const preceding = Object.fromEntries(model.steps.slice(0, stepIndex).filter(s => Object.hasOwn(answers, s.key)).map(s => [s.key, answers[s.key]]));
    [...step.options, { value: '*', label: 'Geen voorkeur' }].forEach(option => {
      const label = el('label', 'demo-option');
      const radio = el('input');
      radio.type = 'radio';
      radio.name = 'demo-choice';
      radio.value = option.value;
      radio.checked = answers[step.key] === option.value;
      radio.addEventListener('change', () => {
        answers[step.key] = option.value;
        error.hidden = true;
        fieldset.removeAttribute('aria-invalid');
        renderOverview();
      });
      const copy = el('span');
      copy.append(el('strong', '', option.label), el('small', '', productCount(findMatches(modelKey, { ...preceding, [step.key]: option.value }).length)));
      label.append(radio, copy);
      fieldset.append(label);
    });
    stage.append(fieldset, error);
    const inlineCount = el('p', 'demo-inline-count');
    inlineCount.dataset.demoInlineCount = '';
    inlineCount.setAttribute('aria-hidden', 'true');
    stage.append(inlineCount);
    const controls = el('div', 'demo-controls');
    if (stepIndex > 0) controls.append(button('Vorige stap', () => edit(stepIndex - 1)));
    controls.append(button(stepIndex === model.steps.length - 1 ? 'Bekijk de uitkomst' : 'Volgende stap', () => {
      if (!Object.hasOwn(answers, step.key)) {
        error.hidden = false;
        fieldset.setAttribute('aria-invalid', 'true');
        fieldset.querySelector('input').focus();
        return;
      }
      stepIndex += 1;
      render(true);
    }, 'button'));
    stage.append(controls);
  }
  function render(focus = false) {
    answers = sanitizeAnswers(modelKey, answers);
    const model = models[modelKey];
    selectors.forEach(control => control.setAttribute('aria-pressed', String(control.dataset.demoModel === modelKey)));
    progress.replaceChildren();
    model.steps.forEach((step, index) => {
      const item = el('li', index < stepIndex ? 'is-complete' : '', `${index + 1}. ${step.label}`);
      if (index === stepIndex) item.setAttribute('aria-current', 'step');
      progress.append(item);
    });
    stage.replaceChildren();
    if (stepIndex === model.steps.length) renderResults();
    else renderQuestion();
    renderOverview();
    if (focus) stage.querySelector('#demo-heading').focus();
  }
  selectors.forEach(control => control.addEventListener('click', () => {
    if (control.dataset.demoModel === modelKey) return;
    modelKey = control.dataset.demoModel;
    reset();
  }));
  root.hidden = false;
  render();
}
