(() => {
  const catalogue = {
  "omzet": {
    "label": "Omzetrapportage",
    "setup": 750,
    "monthly": 60,
    "requires": [],
    "monthlyDiscount": 10
  },
  "forecasting": {
    "label": "Forecasting",
    "setup": 1250,
    "monthly": 100,
    "requires": [
      "omzet"
    ],
    "monthlyDiscount": 20
  },
  "voorraad": {
    "label": "Voorraad",
    "setup": 750,
    "monthly": 60,
    "requires": [],
    "monthlyDiscount": 10
  },
  "inkoop": {
    "label": "Inkoop en bestellen",
    "setup": 1250,
    "monthly": 100,
    "requires": [
      "omzet",
      "voorraad"
    ],
    "monthlyDiscount": 20
  },
  "logistiek": {
    "label": "Magazijn en logistiek",
    "setup": 1500,
    "monthly": 100,
    "requires": [
      "voorraad",
      "orders"
    ],
    "monthlyDiscount": 20
  },
  "producten": {
    "label": "Productbeheer en publicaties",
    "setup": 1000,
    "monthly": 80,
    "requires": [],
    "monthlyDiscount": 20
  },
  "orders": {
    "label": "Orders en retouren",
    "setup": 1000,
    "monthly": 80,
    "requires": [],
    "monthlyDiscount": 20
  },
  "marketing": {
    "label": "Marketing en ranking",
    "setup": 1500,
    "monthly": 130,
    "requires": [
      "omzet",
      "producten"
    ],
    "monthlyDiscount": 30
  },
  "financieel": {
    "label": "Financieel overzicht",
    "setup": 1000,
    "monthly": 80,
    "requires": [
      "omzet"
    ],
    "monthlyDiscount": 20
  },
  "controles": {
    "label": "Signalen en controles",
    "setup": 500,
    "monthly": 40,
    "requires": [
      "omzet",
      "voorraad"
    ],
    "monthlyDiscount": 10
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
    const standardMonthly = base.monthly + modules.reduce((n, id) => n + catalogue[id].monthly, 0);
    const monthlyDiscount = modules.reduce((n, id) => n + catalogue[id].monthlyDiscount, 0);
    return { modules, setupSubtotal, discountRate, discount, setup: setupSubtotal - discount,
      standardMonthly, monthlyDiscount, monthly: standardMonthly - monthlyDiscount, usage: false };
  }
  function contactDraft(selected) {
    return 'Implementatievolgorde:\n' + [base.label, ...selected.modules.map(id => catalogue[id].label)].map((label, i) => `${i + 1}. ${label}`).join('\n')
      + `\n\nInrichting vóór korting: ${money(selected.setupSubtotal)}\nBundelkorting (${selected.discountRate}%): − ${money(selected.discount)}\nEenmalige inrichting na korting: ${money(selected.setup)}\nStandaard per maand: ${money(selected.standardMonthly)}\nMaandkorting modules: − ${money(selected.monthlyDiscount)}\nPer maand na korting: ${money(selected.monthly)}${selected.usage ? ' + verbruik' : ''}\nPrijsindicatie exclusief btw; offerte volgt na afstemming.`;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { catalogue, base, resolve, contactDraft };
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
      root.querySelector('[data-module-monthly-standard]').textContent = money(selected.standardMonthly);
      root.querySelector('[data-module-monthly-discount]').textContent = selected.monthlyDiscount ? '− ' + money(selected.monthlyDiscount) : money(0);
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
  // Keep embedded dialogs clear of the site's sticky navigation.
  window.addEventListener('message', event => {
    const frame = document.querySelector('.webapp-demo-frame');
    if (!frame || event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'opticore-demo-dialog') return;
    const header = document.querySelector('.site-header');
    const inset = (header?.getBoundingClientRect().height || 0) + 16;
    window.scrollTo({ top: window.scrollY + frame.getBoundingClientRect().top - inset, behavior: 'instant' });
  });
  // Carry only known module IDs, their prerequisites and the basis into an editable draft.
  const field = document.querySelector('#webapp-modules');
  const params = new URLSearchParams(window.location.search);
  if (field && params.get('onderwerp') === 'webapp' && !field.value) {
    const selected = resolve((params.get('modules') || '').slice(0, 500).split(','));
    if (selected.modules.length) {
      field.value = contactDraft(selected);
      const edit = document.querySelector('[data-module-edit]');
      if (edit) edit.href = '/modulaire-webapp/?' + new URLSearchParams({ modules: selected.modules.join(',') }) + '#modules';
    }
  }
})();
