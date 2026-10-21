(() => {
  const labels = new Map([
    ['omzet', 'Omzetrapportage'], ['forecasting', 'Forecasting'],
    ['voorraad', 'Voorraad'], ['inkoop', 'Inkoop en bestellen'],
    ['logistiek', 'Magazijn en logistiek'], ['producten', 'Productbeheer'],
    ['orders', 'Orders en retouren'], ['marketing', 'Marketing en ranking'],
    ['financieel', 'Financieel overzicht'], ['documenten', 'Documentverwerking'],
    ['planning', 'Planning en projecten'], ['controles', 'Taken en controles']
  ]);
  const root = document.querySelector('[data-webapp-picker]');
  if (root) {
    const choices = [...root.querySelectorAll('input[type="checkbox"]')];
    const summary = root.querySelector('[data-module-summary]');
    const count = root.querySelector('[data-module-count]');
    const contact = root.querySelector('[data-module-contact]');
    const reset = root.querySelector('[data-module-reset]');
    function update() {
      const selected = choices.filter(input => input.checked && labels.has(input.value));
      summary.replaceChildren(...selected.map(input => {
        const item = document.createElement('li');
        item.textContent = labels.get(input.value);
        return item;
      }));
      summary.hidden = selected.length === 0;
      count.textContent = selected.length ? `${selected.length} ${selected.length === 1 ? 'module gekozen' : 'modules gekozen'}` : 'Kies de modules die bij je bedrijf passen.';
      const params = new URLSearchParams({ onderwerp: 'webapp' });
      if (selected.length) params.set('modules', selected.map(input => input.value).join(','));
      contact.href = `/contact/?${params}`;
      reset.hidden = selected.length === 0;
    }
    root.addEventListener('change', update);
    reset.addEventListener('click', () => { choices.forEach(input => { input.checked = false; }); update(); });
    window.addEventListener('pageshow', update);
    update();
  }
  // Carry only known module IDs into an editable contact draft, without submitting it.
  const field = document.querySelector('#webapp-modules');
  const params = new URLSearchParams(window.location.search);
  if (field && params.get('onderwerp') === 'webapp' && !field.value) {
    const selected = [...new Set((params.get('modules') || '').slice(0, 500).split(','))]
      .filter(id => labels.has(id));
    field.value = selected.map(id => labels.get(id)).join(', ');
  }
})();
