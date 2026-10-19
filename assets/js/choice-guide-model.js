// Self-contained demonstration data; these are not saleable products or installation advice.
const option = (value, label) => ({ value, label });
export const models = {
  thermostaten: {
    title: 'Thermostaten',
    noun: 'thermostaat',
    steps: [
      { key: 'montage', title: 'Welke uitvoering zoek je?', label: 'Uitvoering', help: 'Kies een uitvoering uit het voorbeeldassortiment.', options: [option('opbouw', 'Opbouw'), option('inbouw', 'Inbouw'), option('draadloos', 'Draadloos')] },
      { key: 'protocol', title: 'Welk protocol heeft je voorkeur?', label: 'Protocol', help: 'In deze demo is het protocol een productkenmerk waarop je filtert.', options: [option('wifi', 'WiFi'), option('zigbee', 'Zigbee')] },
      { key: 'kleur', title: 'Welke kleur zoek je?', label: 'Kleur', help: 'Je kunt ook doorgaan zonder kleurvoorkeur.', options: [option('wit', 'Wit'), option('zwart', 'Zwart')] },
      { key: 'vorm', title: 'Welke vorm heeft je voorkeur?', label: 'Vorm', help: 'Met deze laatste keuze verfijn je de overgebleven modellen.', options: [option('rechthoekig', 'Rechthoekig'), option('vierkant', 'Vierkant'), option('rond', 'Rond')] }
    ],
    products: [
      { id: 'T01', montage: 'opbouw', protocol: 'wifi', kleur: 'wit', vorm: 'rechthoekig' },
      { id: 'T02', montage: 'opbouw', protocol: 'wifi', kleur: 'zwart', vorm: 'rechthoekig' },
      { id: 'T03', montage: 'inbouw', protocol: 'wifi', kleur: 'wit', vorm: 'vierkant' },
      { id: 'T04', montage: 'inbouw', protocol: 'zigbee', kleur: 'zwart', vorm: 'vierkant' },
      { id: 'T05', montage: 'draadloos', protocol: 'zigbee', kleur: 'wit', vorm: 'rechthoekig' },
      { id: 'T06', montage: 'draadloos', protocol: 'zigbee', kleur: 'zwart', vorm: 'rond' },
      { id: 'T07', montage: 'opbouw', protocol: 'zigbee', kleur: 'wit', vorm: 'rond' },
      { id: 'T08', montage: 'inbouw', protocol: 'wifi', kleur: 'zwart', vorm: 'rond' }
    ]
  },
  schakelaars: {
    title: 'Draadloze schakelaars',
    noun: 'schakelaar',
    steps: [
      { key: 'voeding', title: 'Welke uitvoering zoek je?', label: 'Uitvoering', help: 'Kies een productkenmerk uit het voorbeeldassortiment.', options: [option('kinetisch', 'Kinetisch'), option('batterij', 'Met batterijen')] },
      { key: 'bediening', title: 'Wat wil je kunnen bedienen?', label: 'Bediening', help: 'In het voorbeeldassortiment zijn aan/uit- en dimvarianten opgenomen.', options: [option('aanuit', 'Aan en uit'), option('dimmen', 'Ook dimmen')] },
      { key: 'knoppen', title: 'Hoeveel knoppen zoek je?', label: 'Knoppen', help: 'Kies een aantal of laat alle aantallen open.', options: [option('1', '1 knop'), option('2', '2 knoppen'), option('4', '4 knoppen')] },
      { key: 'kleur', title: 'Welke kleur zoek je?', label: 'Kleur', help: 'De uitkomst voldoet aan alle kenmerken die je hebt gekozen.', options: [option('wit', 'Wit'), option('zwart', 'Zwart')] }
    ],
    products: [
      { id: 'S01', voeding: 'kinetisch', bediening: 'aanuit', knoppen: '1', kleur: 'wit' },
      { id: 'S02', voeding: 'kinetisch', bediening: 'aanuit', knoppen: '2', kleur: 'wit' },
      { id: 'S03', voeding: 'kinetisch', bediening: 'dimmen', knoppen: '1', kleur: 'zwart' },
      { id: 'S04', voeding: 'batterij', bediening: 'aanuit', knoppen: '1', kleur: 'wit' },
      { id: 'S05', voeding: 'batterij', bediening: 'dimmen', knoppen: '2', kleur: 'zwart' },
      { id: 'S06', voeding: 'batterij', bediening: 'aanuit', knoppen: '4', kleur: 'zwart' },
      { id: 'S07', voeding: 'kinetisch', bediening: 'dimmen', knoppen: '2', kleur: 'wit' },
      { id: 'S08', voeding: 'batterij', bediening: 'dimmen', knoppen: '4', kleur: 'wit' }
    ]
  }
};

export function sanitizeAnswers(modelKey, input = {}) {
  if (!Object.hasOwn(models, modelKey)) return {};
  const model = models[modelKey];
  return Object.fromEntries(model.steps.filter(step => input[step.key] === '*' || step.options.some(o => o.value === input[step.key])).map(step => [step.key, input[step.key]]));
}

export function findMatches(modelKey, input = {}) {
  if (!Object.hasOwn(models, modelKey)) return [];
  const model = models[modelKey];
  const answers = sanitizeAnswers(modelKey, input);
  return model.products.filter(product => Object.entries(answers).every(([key, value]) => value === '*' || product[key] === value));
}

export function valueLabel(step, value) {
  return value === '*' ? 'Geen voorkeur' : step.options.find(o => o.value === value)?.label || 'Nog niet gekozen';
}

export function readState(search) {
  const params = new URLSearchParams(search);
  const key = params.get('voorbeeld');
  const modelKey = Object.hasOwn(models, key) ? key : 'thermostaten';
  const answers = sanitizeAnswers(modelKey, Object.fromEntries(params));
  return { modelKey, answers };
}

export function shareURL(base, modelKey, input) {
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  url.searchParams.set('voorbeeld', Object.hasOwn(models, modelKey) ? modelKey : 'thermostaten');
  for (const [key, value] of Object.entries(sanitizeAnswers(modelKey, input))) url.searchParams.set(key, value);
  return url.href;
}
