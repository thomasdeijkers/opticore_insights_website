(() => {
  const catalogue = {
  "omzet": {
    "label": "Omzetrapportage",
    "setup": 0,
    "monthly": 0,
    "requires": [],
    "monthlyDiscount": 0,
    "previousSetup": 750,
    "included": true
  },
  "forecasting": {
    "label": "Forecasting",
    "setup": 200,
    "monthly": 100,
    "requires": [
      "omzet"
    ],
    "monthlyDiscount": 75,
    "previousSetup": 1250
  },
  "voorraad": {
    "label": "Voorraad",
    "setup": 0,
    "monthly": 0,
    "requires": [],
    "monthlyDiscount": 0,
    "previousSetup": 750,
    "included": true
  },
  "inkoop": {
    "label": "Inkoop en bestellen",
    "setup": 300,
    "monthly": 100,
    "requires": [
      "omzet",
      "voorraad"
    ],
    "monthlyDiscount": 65,
    "previousSetup": 1250
  },
  "logistiek": {
    "label": "Magazijn en logistiek",
    "setup": 400,
    "monthly": 100,
    "requires": [
      "voorraad",
      "orders"
    ],
    "monthlyDiscount": 60,
    "previousSetup": 1500
  },
  "producten": {
    "label": "Productbeheer en publicaties",
    "setup": 300,
    "monthly": 80,
    "requires": [],
    "monthlyDiscount": 35,
    "previousSetup": 1000
  },
  "orders": {
    "label": "Orders en retouren",
    "setup": 0,
    "monthly": 0,
    "requires": [],
    "monthlyDiscount": 0,
    "previousSetup": 1000,
    "included": true
  },
  "marketing": {
    "label": "Marketing en ranking",
    "setup": 400,
    "monthly": 130,
    "requires": [
      "omzet",
      "producten"
    ],
    "monthlyDiscount": 75,
    "previousSetup": 1500
  },
  "financieel": {
    "label": "Financieel overzicht",
    "setup": 250,
    "monthly": 80,
    "requires": [
      "omzet"
    ],
    "monthlyDiscount": 50,
    "previousSetup": 1000
  },
  "controles": {
    "label": "Signalen en controles",
    "setup": 150,
    "monthly": 40,
    "requires": [
      "omzet",
      "voorraad"
    ],
    "monthlyDiscount": 20,
    "previousSetup": 500
  }
};
  const includedModules = ["omzet", "voorraad", "orders"];
  const base = { label: 'Startpakket', setup: 995, previousSetup: 1500, monthly: 279, monthlyDiscount: 130 };
  const money = value => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  function resolve(ids) {
    const ordered = new Set();
    function add(id) {
      if (!Object.hasOwn(catalogue, id) || ordered.has(id)) return;
      catalogue[id].requires.forEach(add);
      ordered.add(id);
    }
    includedModules.forEach(add);
    [...new Set(ids)].forEach(add);
    const modules = [...ordered], extraModules = modules.filter(id => !catalogue[id].included);
    // Reference: the previously published calculator, including its setup bundle discount.
    const previousGross = base.previousSetup + modules.reduce((n,id) => n + catalogue[id].previousSetup, 0);
    const previousRate = modules.length >= 6 ? 30 : modules.length >= 4 ? 20 : 10;
    const setupSubtotal = previousGross * (100 - previousRate) / 100;
    const setup = base.setup + extraModules.reduce((n,id) => n + catalogue[id].setup, 0);
    const discount = setupSubtotal - setup;
    const standardMonthly = base.monthly + extraModules.reduce((n,id) => n + catalogue[id].monthly, 0);
    const monthlyDiscount = base.monthlyDiscount + extraModules.reduce((n,id) => n + catalogue[id].monthlyDiscount, 0);
    return { modules, extraModules, setupSubtotal, discountRate: discount / setupSubtotal * 100,
      discount, setup, standardMonthly, monthlyDiscount, monthly: standardMonthly - monthlyDiscount, usage: false };
  }
  const selectionLabels = selected => ['Startpakket: omzetrapportage, voorraad en orders/retouren', ...selected.extraModules.map(id => catalogue[id].label)];
  function contactDraft(selected) {
    return 'Jouw pakket:\n' + selectionLabels(selected).map((label,i) => `${i+1}. ${label}`).join('\n')
      + `\n\nEerdere inrichtingsindicatie: ${money(selected.setupSubtotal)}\nPakketvoordeel inrichting: − ${money(selected.discount)}\nEenmalige inrichting: ${money(selected.setup)}\nStandaard per maand: ${money(selected.standardMonthly)}\nMaandkorting pakket: − ${money(selected.monthlyDiscount)}\nPer maand na korting: ${money(selected.monthly)}\nPrijsindicatie exclusief btw; offerte volgt na afstemming.`;
  }
  function calculatorURL(ids) {
    const known = [...new Set(ids.filter(id => Object.hasOwn(catalogue, id) && !catalogue[id].included))];
    return '/webapp-samenstellen/' + (known.length ? '?' + new URLSearchParams({ modules: known.join(',') }) : '') + '#modules';
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { catalogue, base, includedModules, resolve, contactDraft, calculatorURL };
  if (typeof document === 'undefined') return;
  const legacyModules = new URLSearchParams(window.location.search);
  if (/^\/modulaire-webapp(?:\/|\.html)?$/.test(window.location.pathname) && legacyModules.has('modules')) {
    window.location.replace(calculatorURL((legacyModules.get('modules') || '').slice(0, 500).split(',')));
    return;
  }
  const root = document.querySelector('[data-webapp-picker]');
  if (root) {
    const choices = [...root.querySelectorAll('input[type="checkbox"]')];
    const summary = root.querySelector('[data-module-summary]');
    const count = root.querySelector('[data-module-count]');
    const contacts = [...root.querySelectorAll('[data-module-contact]')];
    const reset = root.querySelector('[data-module-reset]');
    const restored = new URLSearchParams(window.location.search).get('modules');
    let requested = new Set(restored !== null ? restored.slice(0, 500).split(',').filter(id => Object.hasOwn(catalogue, id) && !catalogue[id].included) : choices.filter(input => input.checked && !catalogue[input.value].included).map(input => input.value));
    const show = (selector, value) => root.querySelectorAll(selector).forEach(node => { node.textContent = value; });
    function update() {
      const selected = resolve(requested);
      choices.forEach(input => {
        const neededBy = selected.modules.filter(id => catalogue[id].requires.includes(input.value));
        input.checked = selected.modules.includes(input.value);
        input.disabled = Boolean(catalogue[input.value].included) || neededBy.length > 0;
        const note = root.querySelector(`[data-module-auto="${input.value}"]`);
        note.hidden = !catalogue[input.value].included && neededBy.length === 0;
        note.textContent = catalogue[input.value].included ? 'Inbegrepen in het startpakket.' : neededBy.length ? 'Nodig voor: ' + neededBy.map(id => catalogue[id].label).join(', ') + '. Verwijder die module eerst.' : '';
      });
      const items = selectionLabels(selected);
      summary.replaceChildren(...items.map(label => {
        const item = document.createElement('li'); item.textContent = label; return item;
      }));
      count.textContent = selected.extraModules.length ? `Startpakket met ${selected.extraModules.length} extra ${selected.extraModules.length === 1 ? 'module' : 'modules'}, inclusief benodigde onderdelen.` : 'Omzetrapportage, voorraad en orders/retouren zijn inbegrepen in het startpakket.';
      show('[data-module-bar-count]', selected.extraModules.length ? `Startpakket + ${selected.extraModules.length} uitbreidingen` : base.label);
      show('[data-module-subtotal]', money(selected.setupSubtotal));
      show('[data-module-discount-label]', 'Pakketvoordeel inrichting');
      show('[data-module-discount]', selected.discount ? '− ' + money(selected.discount) : money(0));
      show('[data-module-setup]', money(selected.setup));
      show('[data-module-monthly-standard]', money(selected.standardMonthly));
      show('[data-module-monthly-discount]', selected.monthlyDiscount ? '− ' + money(selected.monthlyDiscount) : money(0));
      show('[data-module-monthly]', money(selected.monthly) + (selected.usage ? ' + verbruik' : ''));
      root.querySelector('[data-price-setup-was]').hidden = selected.discount === 0;
      root.querySelector('[data-price-monthly-was]').hidden = selected.monthlyDiscount === 0;
      root.querySelector('[data-module-usage]').hidden = !selected.usage;
      const params = new URLSearchParams({ onderwerp: 'webapp' });
      if (selected.modules.length) params.set('modules', selected.modules.join(','));
      contacts.forEach(contact => { contact.href = `/contact/?${params}#contact-form`; });
      reset.hidden = requested.size === 0;
      const address = new URL(window.location.href);
      if (requested.size) address.searchParams.set('modules', [...requested].join(','));
      else address.searchParams.delete('modules');
      window.history.replaceState(null, '', address);
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
    const priceDetails = root.querySelector('[data-price-details]');
    document.addEventListener('click', event => {
      if (priceDetails?.open && !priceDetails.contains(event.target)) priceDetails.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && priceDetails?.open) {
        priceDetails.open = false;
        priceDetails.querySelector('summary').focus();
      }
    });
    const header = document.querySelector('.site-header');
    const pricebar = root.querySelector('.webapp-pricebar');
    const setInsets = () => {
      if (!header || !pricebar) return;
      document.documentElement.style.setProperty('--calculator-header-height', `${header.getBoundingClientRect().height}px`);
      document.documentElement.style.setProperty('--calculator-bar-height', `${pricebar.getBoundingClientRect().height}px`);
    };
    if (header && pricebar && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(setInsets);
      observer.observe(header);
      observer.observe(pricebar);
    }
    window.addEventListener('resize', setInsets);
    setInsets();
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
      if (edit) edit.href = calculatorURL(selected.modules);
    }
  }
})();
