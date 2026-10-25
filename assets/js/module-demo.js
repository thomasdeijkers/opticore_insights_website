(() => {
  const modules = {
  "omzet": {
    "label": "Omzetrapportage",
    "intro": "Verkoop, kosten en marge bij elkaar.",
    "metrics": [
      [
        "Omzet deze maand",
        "€ 28.640",
        "+12,4% t.o.v. vorig jaar"
      ],
      [
        "Brutomarge",
        "38,2%",
        "Na kanaal- en verzendkosten"
      ],
      [
        "Bestellingen",
        "412",
        "Gemiddeld € 69,51 per order"
      ]
    ],
    "chart": "Omzet per maand",
    "headers": [
      "Kanaal",
      "Omzet",
      "Marge",
      "Trend"
    ],
    "rows": [
      [
        "Webshop",
        "€ 12.840",
        "41,2%",
        "+14,8%"
      ],
      [
        "Marketplace A",
        "€ 9.560",
        "35,4%",
        "+8,2%"
      ],
      [
        "Marketplace B",
        "€ 6.240",
        "36,1%",
        "+16,3%"
      ]
    ],
    "workheaders": [
      "Artikel",
      "Omzet",
      "Verkocht",
      "Signaal"
    ],
    "work": [
      [
        "Bureaulamp Nova",
        "€ 4.920",
        "82",
        "Groeit"
      ],
      [
        "Sensor Mini",
        "€ 3.240",
        "108",
        "Stabiel"
      ],
      [
        "Slimme stekker",
        "€ 2.760",
        "120",
        "Groeit"
      ]
    ],
    "note": "Omzet is exclusief btw. Retouren en annuleringen zijn in deze voorbeeldcijfers verwerkt."
  },
  "forecasting": {
    "label": "Forecasting",
    "intro": "Van verkoophistorie naar een onderbouwde verwachting.",
    "metrics": [
      [
        "Verwachte omzet",
        "€ 34.800",
        "Komende maand"
      ],
      [
        "Verwachte afzet",
        "580 stuks",
        "Voorraadplanning"
      ],
      [
        "Modelafwijking",
        "8,6%",
        "Fictieve controle op historie"
      ]
    ],
    "chart": "Afzet: historie en verwachting",
    "headers": [
      "Periode",
      "Afzet",
      "Verwachting",
      "Status"
    ],
    "rows": [
      [
        "Juli",
        "420",
        "438",
        "Historie"
      ],
      [
        "Augustus",
        "465",
        "452",
        "Historie"
      ],
      [
        "September",
        "510",
        "498",
        "Historie"
      ],
      [
        "Oktober",
        "—",
        "580",
        "Prognose"
      ]
    ],
    "workheaders": [
      "Artikel",
      "Verwachting",
      "Bandbreedte",
      "Advies"
    ],
    "work": [
      [
        "Bureaulamp Nova",
        "110",
        "95–125",
        "Voorraad bewaken"
      ],
      [
        "Sensor Mini",
        "145",
        "120–170",
        "Bijbestellen"
      ],
      [
        "Slimme stekker",
        "160",
        "140–185",
        "Voldoende"
      ]
    ],
    "note": "Dit is een fictieve prognose met onzekerheid. Een verwachting is geen toezegging over toekomstige verkoop."
  },
  "voorraad": {
    "label": "Voorraad",
    "intro": "Zie wat beschikbaar is en waar actie nodig is.",
    "metrics": [
      [
        "Voorraadwaarde",
        "€ 42.800",
        "Tegen fictieve inkoopwaarde"
      ],
      [
        "Aandacht nodig",
        "8 artikelen",
        "Onder minimumvoorraad"
      ],
      [
        "Beschikbaar",
        "2.460 stuks",
        "Na reserveringen"
      ]
    ],
    "chart": "Voorraaddekking per productgroep",
    "headers": [
      "Artikel",
      "Beschikbaar",
      "Minimum",
      "Status"
    ],
    "rows": [
      [
        "Bureaulamp Nova",
        "42",
        "25",
        "Voldoende"
      ],
      [
        "Sensor Mini",
        "8",
        "30",
        "Tekort"
      ],
      [
        "Slimme stekker",
        "160",
        "60",
        "Voldoende"
      ],
      [
        "Wandschakelaar",
        "12",
        "20",
        "Tekort"
      ]
    ],
    "workheaders": [
      "Locatie",
      "Artikel",
      "Geteld",
      "Verschil"
    ],
    "work": [
      [
        "A-01",
        "Sensor Mini",
        "8",
        "−2"
      ],
      [
        "A-02",
        "Bureaulamp Nova",
        "42",
        "0"
      ],
      [
        "B-01",
        "Slimme stekker",
        "160",
        "0"
      ]
    ],
    "note": "Fysieke, gereserveerde en beschikbare voorraad worden afzonderlijk bijgehouden."
  },
  "inkoop": {
    "label": "Inkoop en bestellen",
    "intro": "Bestelvoorstellen met voorraad, afzet en levertijd.",
    "metrics": [
      [
        "Besteladvies",
        "€ 4.260",
        "3 voorgestelde regels"
      ],
      [
        "Openstaande inkoop",
        "€ 8.940",
        "4 fictieve bestellingen"
      ],
      [
        "Spoedregels",
        "2",
        "Risico op voorraadtekort"
      ]
    ],
    "chart": "Verwachte ontvangsten per week",
    "headers": [
      "Artikel",
      "Voorstel",
      "Levertijd",
      "Prioriteit"
    ],
    "rows": [
      [
        "Sensor Mini",
        "120 stuks",
        "14 dagen",
        "Hoog"
      ],
      [
        "Wandschakelaar",
        "80 stuks",
        "10 dagen",
        "Hoog"
      ],
      [
        "Bureaulamp Nova",
        "60 stuks",
        "21 dagen",
        "Normaal"
      ]
    ],
    "workheaders": [
      "Bestelling",
      "Leverancier",
      "Bedrag",
      "Status"
    ],
    "work": [
      [
        "DEMO-INK-104",
        "Voorbeeldleverancier Noord",
        "€ 3.240",
        "Te beoordelen"
      ],
      [
        "DEMO-INK-105",
        "Voorbeeldleverancier Zuid",
        "€ 2.860",
        "Onderweg"
      ],
      [
        "DEMO-INK-106",
        "Voorbeeldleverancier West",
        "€ 2.840",
        "Bevestigd"
      ]
    ],
    "note": "Een bestelvoorstel wordt eerst beoordeeld. Deze demo plaatst geen bestellingen."
  },
  "logistiek": {
    "label": "Magazijn en logistiek",
    "intro": "Van order naar picklijst en verzendstatus.",
    "metrics": [
      [
        "Te picken",
        "18 orders",
        "Vandaag"
      ],
      [
        "Klaar voor verzending",
        "9 orders",
        "Controle afgerond"
      ],
      [
        "Uitzonderingen",
        "2",
        "Controle nodig"
      ]
    ],
    "chart": "Verwerkte orders per werkdag",
    "headers": [
      "Order",
      "Locatie",
      "Regels",
      "Status"
    ],
    "rows": [
      [
        "DEMO-2041",
        "A-01 → B-03",
        "3",
        "Te picken"
      ],
      [
        "DEMO-2042",
        "A-02",
        "1",
        "Gepickt"
      ],
      [
        "DEMO-2043",
        "B-01 → C-02",
        "2",
        "Controle nodig"
      ]
    ],
    "workheaders": [
      "Zending",
      "Vervoerder",
      "Pakketten",
      "Status"
    ],
    "work": [
      [
        "DEMO-Z-301",
        "Voorbeeldvervoerder A",
        "1",
        "Label klaar"
      ],
      [
        "DEMO-Z-302",
        "Voorbeeldvervoerder B",
        "2",
        "Aangemeld"
      ],
      [
        "DEMO-Z-303",
        "Voorbeeldvervoerder A",
        "1",
        "Onderweg"
      ]
    ],
    "note": "Verzendlabels en track & trace zijn fictief. Er wordt geen echte zending aangemaakt."
  },
  "producten": {
    "label": "Productbeheer",
    "intro": "Productgegevens en kanaalvereisten op één plek.",
    "metrics": [
      [
        "Actieve artikelen",
        "248",
        "In het voorbeeldassortiment"
      ],
      [
        "Compleet",
        "92%",
        "Verplichte velden aanwezig"
      ],
      [
        "Te controleren",
        "14",
        "Voor publicatie"
      ]
    ],
    "chart": "Volledigheid per productgroep",
    "headers": [
      "Artikel",
      "SKU",
      "Compleet",
      "Status"
    ],
    "rows": [
      [
        "Bureaulamp Nova",
        "DEMO-1001",
        "100%",
        "Gereed"
      ],
      [
        "Sensor Mini",
        "DEMO-1002",
        "82%",
        "Foto ontbreekt"
      ],
      [
        "Slimme stekker",
        "DEMO-1003",
        "96%",
        "Tekst controleren"
      ]
    ],
    "workheaders": [
      "Veld",
      "Bron",
      "Kanaal",
      "Controle"
    ],
    "work": [
      [
        "Titel",
        "Productbestand",
        "Webshop",
        "Goedgekeurd"
      ],
      [
        "Afbeelding",
        "Mediabibliotheek",
        "Marketplace A",
        "Controle nodig"
      ],
      [
        "Afmetingen",
        "Leveranciersdata",
        "Marketplace B",
        "Aanvullen"
      ]
    ],
    "note": "Wijzigingen worden gecontroleerd voordat ze naar een aangesloten verkoopkanaal gaan."
  },
  "orders": {
    "label": "Orders en retouren",
    "intro": "Bestellingen, leveringen en retouren in samenhang.",
    "metrics": [
      [
        "Nieuwe orders",
        "24",
        "Vandaag"
      ],
      [
        "Retouren open",
        "3",
        "Wachten op beoordeling"
      ],
      [
        "Orderwaarde",
        "€ 1.840",
        "Nieuwe orders vandaag"
      ]
    ],
    "chart": "Orderverloop afgelopen zes dagen",
    "headers": [
      "Order",
      "Kanaal",
      "Bedrag",
      "Status"
    ],
    "rows": [
      [
        "DEMO-2041",
        "Webshop",
        "€ 129",
        "Nieuw"
      ],
      [
        "DEMO-2042",
        "Marketplace A",
        "€ 69",
        "In verwerking"
      ],
      [
        "DEMO-2043",
        "Marketplace B",
        "€ 148",
        "Verzonden"
      ]
    ],
    "workheaders": [
      "Retour",
      "Artikel",
      "Reden",
      "Status"
    ],
    "work": [
      [
        "DEMO-R-81",
        "Bureaulamp Nova",
        "Past niet",
        "Te beoordelen"
      ],
      [
        "DEMO-R-82",
        "Sensor Mini",
        "Defect gemeld",
        "Ontvangen"
      ],
      [
        "DEMO-R-83",
        "Slimme stekker",
        "Dubbel besteld",
        "Afgerond"
      ]
    ],
    "note": "Klantnamen en adressen worden niet getoond. Alle order- en retourcodes zijn verzonnen."
  },
  "marketing": {
    "label": "Marketing en ranking",
    "intro": "Campagneprestaties naast marge en productinformatie.",
    "metrics": [
      [
        "Advertentiekosten",
        "€ 840",
        "Deze maand"
      ],
      [
        "ROAS",
        "4,8×",
        "Fictieve toeschrijving"
      ],
      [
        "Actieve campagnes",
        "12",
        "3 voorstellen klaar"
      ]
    ],
    "chart": "Toegeschreven campagneomzet",
    "headers": [
      "Campagne",
      "Kosten",
      "Omzet",
      "ROAS"
    ],
    "rows": [
      [
        "Bureaulampen",
        "€ 340",
        "€ 1.870",
        "5,5×"
      ],
      [
        "Slim wonen",
        "€ 280",
        "€ 1.260",
        "4,5×"
      ],
      [
        "Sensoren",
        "€ 220",
        "€ 902",
        "4,1×"
      ]
    ],
    "workheaders": [
      "Zoekterm",
      "Positie",
      "Vorige meting",
      "Advies"
    ],
    "work": [
      [
        "slimme bureaulamp",
        "8",
        "12",
        "Listing verbeteren"
      ],
      [
        "compacte sensor",
        "14",
        "16",
        "Test voorstel"
      ],
      [
        "wifi stekker",
        "6",
        "7",
        "Volgen"
      ]
    ],
    "note": "Rangposities en advertentieprestaties zijn voorbeelden. De demo start of wijzigt geen campagnes."
  },
  "financieel": {
    "label": "Financieel overzicht",
    "intro": "Inzicht in omzet, kosten en openstaande bedragen.",
    "metrics": [
      [
        "Omzet",
        "€ 28.640",
        "Deze maand, excl. btw"
      ],
      [
        "Kosten",
        "€ 19.860",
        "Volgens voorbeeldindeling"
      ],
      [
        "Resultaat",
        "€ 8.780",
        "Vóór belasting"
      ]
    ],
    "chart": "Omzet en kosten per maand",
    "headers": [
      "Categorie",
      "Bedrag",
      "Aandeel",
      "Controle"
    ],
    "rows": [
      [
        "Inkoop",
        "€ 14.820",
        "74,6%",
        "Verwerkt"
      ],
      [
        "Verkoopkosten",
        "€ 2.340",
        "11,8%",
        "Verwerkt"
      ],
      [
        "Logistiek",
        "€ 1.860",
        "9,4%",
        "Verwerkt"
      ],
      [
        "Overige kosten",
        "€ 840",
        "4,2%",
        "Controleren"
      ]
    ],
    "workheaders": [
      "Factuur",
      "Soort",
      "Bedrag",
      "Betaalstatus"
    ],
    "work": [
      [
        "DEMO-F-401",
        "Verkoop",
        "€ 1.280",
        "Openstaand"
      ],
      [
        "DEMO-F-402",
        "Inkoop",
        "€ 3.240",
        "Betaald"
      ],
      [
        "DEMO-F-403",
        "Creditnota",
        "− € 69",
        "Verwerkt"
      ]
    ],
    "note": "Dit overzicht is een voorbeeld en vervangt geen boekhouding of gecontroleerde jaarrekening."
  },
  "documenten": {
    "label": "Documentverwerking",
    "intro": "Van document naar gecontroleerde gegevens.",
    "metrics": [
      [
        "Deze maand",
        "186 documenten",
        "Fictieve verwerking"
      ],
      [
        "Gereed",
        "172",
        "Gecontroleerd"
      ],
      [
        "Te beoordelen",
        "14",
        "Onzekere regels"
      ]
    ],
    "chart": "Documenten verwerkt per week",
    "headers": [
      "Document",
      "Type",
      "Regels",
      "Status"
    ],
    "rows": [
      [
        "DEMO-factuur-041.pdf",
        "Inkoopfactuur",
        "12",
        "Controleren"
      ],
      [
        "DEMO-pakbon-019.pdf",
        "Pakbon",
        "8",
        "Gereed"
      ],
      [
        "DEMO-order-082.pdf",
        "Bestelling",
        "5",
        "Gereed"
      ]
    ],
    "workheaders": [
      "Herkend veld",
      "Waarde",
      "Zekerheid",
      "Controle"
    ],
    "work": [
      [
        "Factuurnummer",
        "DEMO-041",
        "Hoog",
        "Akkoord"
      ],
      [
        "Totaal excl. btw",
        "€ 3.240",
        "Hoog",
        "Akkoord"
      ],
      [
        "Artikelregel 4",
        "Sensor Mini, 120 stuks",
        "Laag",
        "Beoordelen"
      ]
    ],
    "note": "Onzekere herkenningen gaan eerst naar een controle. Geen echte documenten of bestanden worden gebruikt."
  },
  "planning": {
    "label": "Planning en projecten",
    "intro": "Taken, capaciteit en deadlines overzichtelijk plannen.",
    "metrics": [
      [
        "Actieve projecten",
        "6",
        "Voorbeeldprojecten"
      ],
      [
        "Deze week gepland",
        "28 uur",
        "Van 40 beschikbare uren"
      ],
      [
        "Deadlines",
        "3",
        "Binnen zeven dagen"
      ]
    ],
    "chart": "Geplande capaciteit per week",
    "headers": [
      "Project",
      "Volgende stap",
      "Deadline",
      "Status"
    ],
    "rows": [
      [
        "Nieuw assortiment",
        "Productdata controleren",
        "Woensdag",
        "Op schema"
      ],
      [
        "Magazijnindeling",
        "Locaties tellen",
        "Donderdag",
        "In uitvoering"
      ],
      [
        "Kanaaluitbreiding",
        "Testorders beoordelen",
        "Vrijdag",
        "Aandacht"
      ]
    ],
    "workheaders": [
      "Taak",
      "Verantwoordelijke",
      "Gepland",
      "Voortgang"
    ],
    "work": [
      [
        "Productfoto’s controleren",
        "Medewerker A",
        "4 uur",
        "50%"
      ],
      [
        "Voorraad tellen",
        "Medewerker B",
        "6 uur",
        "25%"
      ],
      [
        "Campagne beoordelen",
        "Medewerker A",
        "2 uur",
        "Gereed"
      ]
    ],
    "note": "Namen, projecten, capaciteit en deadlines zijn fictief. De demo bewaart geen persoonlijke planning."
  },
  "controles": {
    "label": "Taken en controles",
    "intro": "Afwijkingen vertalen naar concrete opvolging.",
    "metrics": [
      [
        "Open taken",
        "11",
        "In de voorbeeldwerkvoorraad"
      ],
      [
        "Hoge prioriteit",
        "3",
        "Vandaag beoordelen"
      ],
      [
        "Deze week afgerond",
        "24",
        "Fictieve controletaken"
      ]
    ],
    "chart": "Afgeronde controles per werkdag",
    "headers": [
      "Signaal",
      "Bron",
      "Prioriteit",
      "Status"
    ],
    "rows": [
      [
        "Voorraad onder minimum",
        "Sensor Mini",
        "Hoog",
        "Nieuw"
      ],
      [
        "Marge wijkt af",
        "Order DEMO-2041",
        "Hoog",
        "Te beoordelen"
      ],
      [
        "Afbeelding ontbreekt",
        "Product DEMO-1002",
        "Normaal",
        "In behandeling"
      ]
    ],
    "workheaders": [
      "Controle",
      "Eigenaar",
      "Deadline",
      "Opvolging"
    ],
    "work": [
      [
        "Besteladvies beoordelen",
        "Medewerker A",
        "Vandaag",
        "Open"
      ],
      [
        "Kostenregel controleren",
        "Medewerker B",
        "Vandaag",
        "In behandeling"
      ],
      [
        "Productdata aanvullen",
        "Medewerker A",
        "Morgen",
        "Open"
      ]
    ],
    "note": "Je kunt een voorbeeldregel openen en een demoactie proberen. Er worden geen echte taken verstuurd."
  }
};
  const names = Object.keys(modules);
  const root = document.querySelector('[data-demo]');
  if (!root) return;
  const nav = root.querySelector('[data-demo-nav]');
  const select = root.querySelector('[data-demo-select]');
  const search = root.querySelector('[data-demo-search]');
  const params = new URLSearchParams(location.search);
  let current = Object.hasOwn(modules, params.get('module')) ? params.get('module') : 'omzet';
  let work = params.get('view') === 'details';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  nav.innerHTML = names.map((id, i) => `<button type="button" data-demo-module="${id}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(modules[id].label)}</button>`).join('');
  select.innerHTML = names.map(id => `<option value="${id}">${esc(modules[id].label)}</option>`).join('');
  const dialog = root.querySelector('dialog');
  let activeRow;
  function render() {
    const m = modules[current];
    root.querySelector('[data-demo-title]').textContent = m.label;
    root.querySelector('[data-demo-intro]').textContent = m.intro;
    root.querySelector('[data-demo-note]').textContent = m.note;
    root.querySelector('[data-demo-metrics]').innerHTML = m.metrics.map(([label, value, note]) => `<article><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`).join('');
    root.querySelector('[data-demo-chart-title]').textContent = m.chart;
    const values = [42, 58, 50, 72, 66, 88];
    root.querySelector('[data-demo-bars]').innerHTML = values.map((n,i)=>`<div><i style="height:${n}%"></i><span>${['Mei','Jun','Jul','Aug','Sep','Okt'][i]}</span></div>`).join('');
    root.querySelector('[data-demo-overview]').hidden = work;
    root.querySelector('[data-demo-table-title]').textContent = work ? 'Details en werkvoorraad' : 'Overzicht per onderdeel';
    const headers = work ? m.workheaders : m.headers;
    const rows = work ? m.work : m.rows;
    const query = search.value.trim().toLocaleLowerCase('nl');
    const filtered = rows.map((row, index) => ({row, index})).filter(({row}) => !query || row.some(value => value.toLocaleLowerCase('nl').includes(query)));
    root.querySelector('thead').innerHTML = '<tr>'+headers.map(label=>`<th scope="col">${esc(label)}</th>`).join('')+'<th scope="col"><span class="sr-only">Actie</span></th></tr>';
    root.querySelector('tbody').innerHTML = filtered.length ? filtered.map(({row,index}) => '<tr>'+row.map((value,i)=>`<td data-label="${esc(headers[i])}">${i===3?'<span class="demo-pill">'+esc(value)+'</span>':esc(value)}</td>`).join('')+`<td><button type="button" data-demo-row="${index}" aria-label="Bekijk ${esc(row[0])}">Bekijk →</button></td></tr>`).join('') : '<tr><td colspan="5">Geen voorbeeldregels gevonden. Probeer een andere zoekterm.</td></tr>';
    root.querySelector('[data-demo-results]').textContent = `${filtered.length} voorbeeldregels`;
    root.querySelectorAll('[data-demo-module]').forEach(button => button.setAttribute('aria-current', button.dataset.demoModule === current ? 'page' : 'false'));
    root.querySelectorAll('[data-demo-view]').forEach(button => button.setAttribute('aria-pressed', String((button.dataset.demoView === 'details') === work)));
    select.value = current;
    history.replaceState(null, '', '?' + new URLSearchParams({module: current, view:work?'details':'overzicht'}));
  }
  function choose(id) { if (!Object.hasOwn(modules,id)) return; current=id; work=false; search.value=''; root.querySelector('[data-demo-status]').textContent=''; render(); }
  nav.addEventListener('click', event=>{const button=event.target.closest('[data-demo-module]');if(button)choose(button.dataset.demoModule);});
  select.addEventListener('change',()=>choose(select.value));
  root.querySelectorAll('[data-demo-view]').forEach(button=>button.addEventListener('click',()=>{work=button.dataset.demoView==='details';search.value='';render();}));
  search.addEventListener('input',render);
  root.querySelector('tbody').addEventListener('click',event=>{
    const button=event.target.closest('[data-demo-row]');if(!button)return;
    const m=modules[current],headers=work?m.workheaders:m.headers;
    activeRow=(work?m.work:m.rows)[Number(button.dataset.demoRow)];
    root.querySelector('[data-demo-dialog-title]').textContent=activeRow[0];
    root.querySelector('[data-demo-dialog-data]').innerHTML=headers.map((header,i)=>`<div><dt>${esc(header)}</dt><dd>${esc(activeRow[i])}</dd></div>`).join('');
    dialog.showModal();
  });
  root.querySelector('[data-demo-close]').addEventListener('click',()=>dialog.close());
  root.querySelector('[data-demo-action]').addEventListener('click',()=>{
    root.querySelector('[data-demo-status]').textContent=`Demoactie voor ${activeRow[0]} uitgevoerd. Dit is alleen een voorbeeld; er is niets naar een extern systeem verstuurd.`;
    dialog.close();
  });
  root.querySelector('[data-demo-reset]').addEventListener('click',()=>choose('omzet'));
  render();
})();
