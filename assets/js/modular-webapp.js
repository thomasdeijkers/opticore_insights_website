(() => {
  const catalogue = {
  "omzet": {
    "label": "Omzetrapportage",
    "setup": 0,
    "requires": [],
    "included": true,
    "currentMonthly": 0
  },
  "forecasting": {
    "label": "Forecasting",
    "setup": 300,
    "requires": [
      "omzet"
    ],
    "currentMonthly": 20
  },
  "voorraad": {
    "label": "Voorraad",
    "setup": 0,
    "requires": [],
    "included": true,
    "currentMonthly": 0
  },
  "inkoop": {
    "label": "Inkoop en bestellen",
    "setup": 500,
    "requires": [
      "omzet",
      "voorraad"
    ],
    "currentMonthly": 40
  },
  "logistiek": {
    "label": "Magazijn en logistiek",
    "setup": 400,
    "requires": [
      "voorraad",
      "orders"
    ],
    "currentMonthly": 30
  },
  "producten": {
    "label": "Productbeheer en publicaties",
    "setup": 300,
    "requires": [],
    "currentMonthly": 20
  },
  "beeldstudio": {
    "label": "Product Image Studio",
    "setup": 300,
    "requires": [],
    "currentMonthly": 30
  },
  "orders": {
    "label": "Orders",
    "setup": 0,
    "requires": [],
    "included": true,
    "currentMonthly": 0
  },
  "marketing": {
    "label": "Marketing en ranking",
    "setup": 600,
    "requires": [
      "omzet",
      "producten"
    ],
    "currentMonthly": 60
  },
  "financieel": {
    "label": "Financieel overzicht",
    "setup": 400,
    "requires": [
      "omzet"
    ],
    "currentMonthly": 40
  },
  "klantenservice": {
    "label": "Klantenservice en tickets",
    "setup": 250,
    "requires": [
      "orders"
    ],
    "currentMonthly": 20
  },
  "facturatie": {
    "label": "Facturen en offertes",
    "setup": 250,
    "requires": [
      "orders"
    ],
    "currentMonthly": 20
  },
  "controles": {
    "label": "Signalen en controles",
    "setup": 200,
    "requires": [
      "omzet",
      "voorraad"
    ],
    "currentMonthly": 20
  },
  "listing": {
    "label": "Listingoptimalisatie",
    "setup": 200,
    "requires": [
      "producten"
    ],
    "currentMonthly": 20
  },
  "picken": {
    "label": "Picklijsten en verzending",
    "setup": 300,
    "requires": [
      "logistiek",
      "orders"
    ],
    "currentMonthly": 30
  }
};
  const includedModules = ["omzet", "voorraad", "orders"];
  const base = { label: 'Startpakket', setup: 995, currentMonthly: 149 };
  // Advice prices are derived from the actual payable price, with a 20% uplift.
  for (const item of [base, ...Object.values(catalogue)]) {
    item.monthly = Math.round(item.currentMonthly * 1.2);
    item.monthlyDiscount = item.monthly - item.currentMonthly;
    item.standardSetup = Math.round(item.setup * 1.2);
  }
  const money = value => new Intl.NumberFormat((typeof window !== 'undefined' && window.SiteI18n?.locale) || 'nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
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
    // Keep payable package prices separate from the derived advice prices.
    const setupSubtotal = base.standardSetup + extraModules.reduce((n,id) => n + catalogue[id].standardSetup, 0);
    const setup = base.setup + extraModules.reduce((n,id) => n + catalogue[id].setup, 0);
    const discount = setupSubtotal - setup;
    const standardMonthly = base.monthly + extraModules.reduce((n,id) => n + catalogue[id].monthly, 0);
    const monthlyDiscount = base.monthlyDiscount + extraModules.reduce((n,id) => n + catalogue[id].monthlyDiscount, 0);
    return { modules, extraModules, setupSubtotal, discountRate: discount / setupSubtotal * 100,
      discount, setup, standardMonthly, monthlyDiscount, monthly: standardMonthly - monthlyDiscount, usage: true };
  }
  function quoteRows(selected) {
    return [{ id: 'basis', label: base.label, note: includedModules.map(id => catalogue[id].label).join(', '), ...base },
      ...selected.extraModules.map(id => ({ id, ...catalogue[id] }))];
  }
  function contactDraft(selected) {
    return 'Jouw pakket:\n' + quoteRows(selected).map((row,i) => `${i+1}. ${row.label}${row.note ? ' (' + row.note + ')' : ''}: ${money(row.setup)} inrichting / ${money(row.currentMonthly)} per maand`).join('\n')
      + `\n\nAdviesprijs inrichting: ${money(selected.setupSubtotal)}\nVoordeel inrichting: − ${money(selected.discount)}\nEenmalige inrichting: ${money(selected.setup)}\nAdviesprijs per maand: ${money(selected.standardMonthly)}\nVoordeel per maand: − ${money(selected.monthlyDiscount)}\nPer maand na korting: ${money(selected.monthly)}\nExclusief btw, AI- en databaseverbruik. Gebruikskosten: opticore-insights.nl/gebruikskosten/. Offerte volgt na afstemming.` + '\nRetourverwerking is maatwerk.';
  }
  function calculatorURL(ids) {
    const known = [...new Set(ids.filter(id => Object.hasOwn(catalogue, id) && !catalogue[id].included))];
    return '/webapp-samenstellen/' + (known.length ? '?' + new URLSearchParams({ modules: known.join(',') }) : '') + '#modules';
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { catalogue, base, includedModules, resolve, contactDraft, calculatorURL, quoteRows };
  if (typeof window !== 'undefined') window.WebappPricing = { catalogue, base, includedModules, resolve, calculatorURL };
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
      const items = quoteRows(selected).map(row => row.note ? `${row.label}: ${row.note}` : row.label);
      summary.replaceChildren(...items.map(label => {
        const item = document.createElement('li'); item.textContent = label; return item;
      }));
      count.textContent = selected.extraModules.length ? `Startpakket met ${selected.extraModules.length} extra ${selected.extraModules.length === 1 ? 'module' : 'modules'}, inclusief benodigde onderdelen.` : 'Omzetrapportage, voorraad en orders zijn inbegrepen in het startpakket.';
      show('[data-module-bar-count]', selected.extraModules.length ? `Startpakket + ${selected.extraModules.length} uitbreidingen` : base.label);
      show('[data-module-subtotal]', money(selected.setupSubtotal));
      show('[data-module-discount-label]', 'Voordeel inrichting');
      show('[data-module-discount]', selected.discount ? '− ' + money(selected.discount) : money(0));
      show('[data-module-setup]', money(selected.setup));
      show('[data-module-monthly-standard]', money(selected.standardMonthly));
      show('[data-module-monthly-discount]', selected.monthlyDiscount ? '− ' + money(selected.monthlyDiscount) : money(0));
      show('[data-module-monthly]', money(selected.monthly));
      root.querySelector('[data-price-setup-was]').hidden = selected.discount === 0;
      root.querySelector('[data-price-monthly-was]').hidden = selected.monthlyDiscount === 0;
      root.querySelector('[data-module-usage]').hidden = !selected.usage;
      const params = new URLSearchParams({ onderwerp: 'webapp' });
      if (selected.modules.length) params.set('modules', selected.modules.join(','));
      contacts.forEach(contact => { contact.href = `/contact/?${params}#contact-form`; });
      root.querySelectorAll('[data-module-usage-link]').forEach(link => { const hash = new URL(link.href, location.href).hash; const query = selected.extraModules.length ? '?' + new URLSearchParams({ modules: selected.extraModules.join(',') }) : ''; link.href = '/gebruikskosten/' + query + hash; });
      root.querySelectorAll('[data-module-roadmap-link]').forEach(link => { const query = selected.extraModules.length ? '?' + new URLSearchParams({ modules: selected.extraModules.join(',') }) : ''; const path = '/implementatie/' + query; link.href = window.SiteI18n?.url(path) || path; });
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
  // Present an immutable quote table; retain its text equivalent for the existing form handler.
  const field = document.querySelector('#webapp-modules');
  const params = new URLSearchParams(window.location.search);
  function populateContactQuote() {
    if (!field || params.get('onderwerp') !== 'webapp') return;
    const selected = resolve((params.get('modules') || '').slice(0, 500).split(','));
    if (selected.modules.length) {
      field.value = contactDraft(selected);
      const edit = document.querySelector('[data-module-edit]');
      if (edit) edit.href = calculatorURL(selected.modules);
      const target = document.querySelector('[data-module-quote]');
      if (!target) return;
      target.replaceChildren();
      const element = (tag, text, className) => { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; };
      const rows = quoteRows(selected);
      for (const period of [
        { caption: 'Per maand', current: 'currentMonthly', advice: 'monthly', discount: 'monthlyDiscount', total: selected.monthly, adviceTotal: selected.standardMonthly, discountTotal: selected.monthlyDiscount },
        { caption: 'Eenmalige inrichting', current: 'setup', advice: 'standardSetup', discount: null, total: selected.setup, adviceTotal: selected.setupSubtotal, discountTotal: selected.discount }
      ]) {
        const table = element('table', null, 'contact-module-quote-table');
        table.setAttribute('role', 'table');
        table.append(element('caption', period.caption));
        const head = element('thead'), headings = element('tr');
        for (const label of ['Module', 'Eindprijs', 'Korting', 'Advies']) { const th = element('th', label); th.scope = 'col'; headings.append(th); }
        head.append(headings); table.append(head);
        const amountRow = (label, current, discount, advice, note = '', total = false) => {
          const tr = element('tr', null, total ? 'contact-module-quote-total' : '');
          const title = element('th', label); title.scope = 'row';
          if (note) title.append(element('small', note));
          const final = element('td', null, 'contact-module-quote-final'); final.append(element('strong', money(current)));
          const saving = element('td', discount ? '− ' + money(discount) : '—', discount ? 'contact-module-quote-discount' : 'contact-module-quote-zero');
          const reference = element('td', null, 'contact-module-quote-advice'); reference.append(element('s', money(advice)));
          tr.append(title, final, saving, reference); return tr;
        };
        const body = element('tbody');
        for (const row of rows) body.append(amountRow(row.label, row[period.current], period.discount ? row[period.discount] : row.standardSetup - row.setup, row[period.advice], row.note));
        const foot = element('tfoot'); foot.append(amountRow('Totaal', period.total, period.discountTotal, period.adviceTotal, '', true));
        table.append(body, foot); target.append(table);
      }
      target.append(element('p', 'Retourverwerking is maatwerk.', 'form-note'));
      target.append(element('p', 'Prijsindicatie exclusief btw, AI- en databaseverbruik. De getoonde kortingen gelden tot en met 31 december 2027. Je ontvangt een offerte na afstemming.', 'form-note'));
    }
  }
  populateContactQuote();
  field?.form?.addEventListener('reset', () => requestAnimationFrame(populateContactQuote));
})();
