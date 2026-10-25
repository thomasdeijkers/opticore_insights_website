(() => {
  const catalogue = {
  "omzet": {
    "label": "Omzetrapportage",
    "setup": 750,
    "monthly": 60,
    "requires": []
  },
  "forecasting": {
    "label": "Forecasting",
    "setup": 1250,
    "monthly": 100,
    "requires": [
      "omzet"
    ]
  },
  "voorraad": {
    "label": "Voorraad",
    "setup": 750,
    "monthly": 60,
    "requires": []
  },
  "inkoop": {
    "label": "Inkoop en bestellen",
    "setup": 1250,
    "monthly": 100,
    "requires": [
      "omzet",
      "voorraad"
    ]
  },
  "logistiek": {
    "label": "Magazijn en logistiek",
    "setup": 1500,
    "monthly": 100,
    "requires": [
      "voorraad",
      "orders"
    ]
  },
  "producten": {
    "label": "Productbeheer",
    "setup": 1000,
    "monthly": 80,
    "requires": []
  },
  "orders": {
    "label": "Orders en retouren",
    "setup": 1000,
    "monthly": 80,
    "requires": []
  },
  "marketing": {
    "label": "Marketing en ranking",
    "setup": 1500,
    "monthly": 130,
    "requires": [
      "omzet",
      "producten"
    ]
  },
  "financieel": {
    "label": "Financieel overzicht",
    "setup": 1000,
    "monthly": 80,
    "requires": [
      "omzet"
    ]
  },
  "documenten": {
    "label": "Documentverwerking",
    "setup": 1250,
    "monthly": 80,
    "requires": []
  },
  "planning": {
    "label": "Planning en projecten",
    "setup": 750,
    "monthly": 50,
    "requires": []
  },
  "controles": {
    "label": "Taken en controles",
    "setup": 500,
    "monthly": 40,
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
    const setupSubtotal = base.setup + modules.reduce((n, id) => n + catalogue[id].setup, 0);
    const discountRate = modules.length >= 6 ? 30 : modules.length >= 4 ? 20 : modules.length >= 2 ? 10 : 0;
    const discount = setupSubtotal * discountRate / 100;
    return { modules, setupSubtotal, discountRate, discount, setup: setupSubtotal - discount,
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
    const restored = new URLSearchParams(window.location.search).get('modules');
    let requested = new Set(restored !== null ? restored.slice(0, 500).split(',').filter(id => Object.hasOwn(catalogue, id)) : choices.filter(input => input.checked).map(input => input.value));
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
      root.querySelector('[data-module-subtotal]').textContent = money(selected.setupSubtotal);
      root.querySelector('[data-module-discount-label]').textContent = `Bundelkorting (${selected.discountRate}%)`;
      root.querySelector('[data-module-discount]').textContent = selected.discount ? '− ' + money(selected.discount) : money(0);
      root.querySelector('[data-module-setup]').textContent = money(selected.setup);
      root.querySelector('[data-module-monthly]').textContent = money(selected.monthly) + (selected.usage ? ' + verbruik' : '');
      root.querySelector('[data-module-usage]').hidden = !selected.usage;
      const params = new URLSearchParams({ onderwerp: 'webapp' });
      if (selected.modules.length) params.set('modules', selected.modules.join(','));
      contact.href = `/contact/?${params}#contact-form`;
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
    if (selected.modules.length) {
      field.value = 'Implementatievolgorde:\n' + [base.label, ...selected.modules.map(id => catalogue[id].label)].map((label, i) => `${i + 1}. ${label}`).join('\n')
        + `\n\nInrichting vóór korting: ${money(selected.setupSubtotal)}\nBundelkorting (${selected.discountRate}%): − ${money(selected.discount)}\nEenmalige inrichting na korting: ${money(selected.setup)}\nPer maand: ${money(selected.monthly)}${selected.usage ? ' + verbruik' : ''}\nPrijsindicatie exclusief btw; offerte volgt na afstemming.`;
      const edit = document.querySelector('[data-module-edit]');
      if (edit) edit.href = '/modulaire-webapp/?' + new URLSearchParams({ modules: selected.modules.join(',') }) + '#modules';
    }
  }
})();
