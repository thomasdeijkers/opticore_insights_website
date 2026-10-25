(() => {
  const catalogue = {
  "omzet": {
    "label": "Omzetrapportage",
    "setup": 750,
    "monthly": 59,
    "requires": []
  },
  "forecasting": {
    "label": "Forecasting",
    "setup": 1250,
    "monthly": 99,
    "requires": [
      "omzet"
    ]
  },
  "voorraad": {
    "label": "Voorraad",
    "setup": 750,
    "monthly": 59,
    "requires": []
  },
  "inkoop": {
    "label": "Inkoop en bestellen",
    "setup": 1250,
    "monthly": 99,
    "requires": [
      "omzet",
      "voorraad"
    ]
  },
  "logistiek": {
    "label": "Magazijn en logistiek",
    "setup": 1500,
    "monthly": 99,
    "requires": [
      "voorraad",
      "orders"
    ]
  },
  "producten": {
    "label": "Productbeheer",
    "setup": 1000,
    "monthly": 79,
    "requires": []
  },
  "orders": {
    "label": "Orders en retouren",
    "setup": 1000,
    "monthly": 79,
    "requires": []
  },
  "marketing": {
    "label": "Marketing en ranking",
    "setup": 1500,
    "monthly": 129,
    "requires": [
      "omzet",
      "producten"
    ]
  },
  "financieel": {
    "label": "Financieel overzicht",
    "setup": 1000,
    "monthly": 79,
    "requires": [
      "omzet"
    ]
  },
  "documenten": {
    "label": "Documentverwerking",
    "setup": 1250,
    "monthly": 79,
    "requires": []
  },
  "planning": {
    "label": "Planning en projecten",
    "setup": 750,
    "monthly": 49,
    "requires": []
  },
  "controles": {
    "label": "Taken en controles",
    "setup": 500,
    "monthly": 39,
    "requires": [
      "planning"
    ]
  }
};
  const base = { label: 'Basisomgeving', setup: 1500, monthly: 79 };
  const money = value => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  function resolve(ids) {
    const ordered = new Set();
    function add(id) {
      if (!Object.hasOwn(catalogue, id) || ordered.has(id)) return;
      catalogue[id].requires.forEach(add);
      ordered.add(id);
    }
    [...new Set(ids)].forEach(add);
    const modules = [...ordered];
    return { modules, setup: base.setup + modules.reduce((n, id) => n + catalogue[id].setup, 0),
      monthly: base.monthly + modules.reduce((n, id) => n + catalogue[id].monthly, 0), usage: ordered.has('documenten') };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { catalogue, base, resolve };
  if (typeof document === 'undefined') return;
  const root = document.querySelector('[data-webapp-picker]');
  if (root) {
    const choices = [...root.querySelectorAll('input[type="checkbox"]')];
    const summary = root.querySelector('[data-module-summary]');
    const count = root.querySelector('[data-module-count]');
    const contact = root.querySelector('[data-module-contact]');
    const reset = root.querySelector('[data-module-reset]');
    let requested = new Set(choices.filter(input => input.checked).map(input => input.value));
    function update() {
      const selected = resolve(requested);
      choices.forEach(input => {
        const neededBy = selected.modules.filter(id => catalogue[id].requires.includes(input.value));
        input.checked = selected.modules.includes(input.value);
        input.disabled = neededBy.length > 0;
        const note = root.querySelector(`[data-module-auto="${input.value}"]`);
        note.hidden = neededBy.length === 0;
        note.textContent = neededBy.length ? 'Nodig voor: ' + neededBy.map(id => catalogue[id].label).join(', ') + '. Verwijder die module eerst.' : '';
      });
      const items = [base.label, ...selected.modules.map(id => catalogue[id].label)];
      summary.replaceChildren(...items.map(label => {
        const item = document.createElement('li'); item.textContent = label; return item;
      }));
      count.textContent = selected.modules.length ? `${selected.modules.length} ${selected.modules.length === 1 ? "module" : "modules"} naast de basisomgeving, inclusief benodigde voorgangers.` : 'De basisomgeving is inbegrepen. Kies je eerste module.';
      root.querySelector('[data-module-setup]').textContent = money(selected.setup);
      root.querySelector('[data-module-monthly]').textContent = money(selected.monthly) + (selected.usage ? ' + verbruik' : '');
      root.querySelector('[data-module-usage]').hidden = !selected.usage;
      const params = new URLSearchParams({ onderwerp: 'webapp' });
      if (selected.modules.length) params.set('modules', selected.modules.join(','));
      contact.href = `/contact/?${params}`;
      reset.hidden = requested.size === 0;
    }
    root.addEventListener('change', event => {
      const input = event.target;
      if (!Object.hasOwn(catalogue, input.value)) return;
      if (input.checked) requested.add(input.value); else requested.delete(input.value);
      update();
    });
    reset.addEventListener('click', () => { requested.clear(); update(); });
    window.addEventListener('pageshow', update);
    update();
  }
  // Carry only known module IDs, their prerequisites and the basis into an editable draft.
  const field = document.querySelector('#webapp-modules');
  const params = new URLSearchParams(window.location.search);
  if (field && params.get('onderwerp') === 'webapp' && !field.value) {
    const selected = resolve((params.get('modules') || '').slice(0, 500).split(','));
    if (selected.modules.length) field.value = [base.label, ...selected.modules.map(id => catalogue[id].label)].join(' → ')
      + `. Indicatie: ${money(selected.setup)} inrichting; ${money(selected.monthly)}/maand${selected.usage ? ' + verbruik' : ''}, excl. btw.`;
  }
})();
