(() => {
  'use strict';
  const D=window.MarketplaceDemo;
  const modules={
    omzet:{label:'Omzetrapportage',intro:'Netto omzet, marge en YoY per marketplace en artikel.',views:['Kanaalomzet','Artikelen'],note:'Demo: netto verkoop na retouren, exclusief btw. Open een artikel voor kanaalomzet en de twaalfmaandentrend.'},
    forecasting:{label:'Forecasting',intro:'Afzet, seizoenstrend en voorraaddekking als basis voor inkoop.',views:['Afzetverwachting','Seizoentrend'],note:'Illustratieve forecast op recente afzet, een seizoensfactor en je groeiscenario. Geen voorspelling van echte verkopen.'},
    voorraad:{label:'Voorraad',intro:'Magazijn, reserveringen, externe voorraad en voorraadouderdom.',views:['Beschikbare voorraad','Overstock en incourant'],note:'Externe voorraad blijft apart. De dekking en het besteladvies gebruiken de beschikbare magazijnvoorraad.'},
    inkoop:{label:'Inkoop en bestellen',intro:'Van besteladvies per leverancier naar bestelling en ontvangst.',views:['Besteladvies','In bestelling'],note:'Voorstellen rekenen al bestelde aantallen mee. De demoontvangst verhoogt voorraad eenmaal en wijzigt geen extern systeem.'},
    logistiek:{label:'Magazijn en logistiek',intro:'Locaties, tellen en zendingen naar marketplace-fulfilment.',views:['Locaties en tellen','Fulfilment'],note:'Magazijnvoorraad en voorraad onderweg zijn aparte gegevens. Een zending is niet automatisch een externe ontvangst.'},
    producten:{label:'Productbeheer en publicaties',intro:'Artikelkaart, kanaaloffers en controleerbare listingvoorstellen.',views:['Publicatiestatus','Listingoptimalisatie'],note:'Een ingeschakeld offer is niet hetzelfde als bevestigde zichtbaarheid. Alle kanalen blijven in de artikelkaart zichtbaar, ook zonder omzet.'},
    orders:{label:'Orders en retouren',intro:'Verkooporders en retourverwerking per marketplace en artikel.',views:['Orders','Retouren'],note:'Een retourontvangst is geen terugbetaling. Alleen opnieuw verkoopbare retouren verhogen in deze demo de voorraad.'},
    marketing:{label:'Marketing en ranking',intro:'Campagnes, gewogen ACoS, TACoS en productranking.',views:['Campagnes','Productranking'],note:'Campagneomzet is toegeschreven advertentieomzet. ACoS = advertentiekosten / toegeschreven omzet; TACoS = kosten / totale netto verkoop over dezelfde periode.'},
    financieel:{label:'Financieel overzicht',intro:'Exploitatie, kanaalkosten en marketplace-tegoeden.',views:['Exploitatie','Marketplace-tegoeden'],note:'Marge, resultaat en verwachte uitbetalingen zijn verschillende begrippen. De voorbeeldafrekening is geen echte boekhouding.'},
    controles:{label:'Signalen en controles',intro:'Voorraadtekorten, omzetdalers en publicatiefouten met artikelcontext.',views:['Open signalen','Afgehandeld'],note:'Signalen volgen de voorbeeldgegevens. Afhandelen wijzigt geen omzet of voorraad; je kunt ieder signaal heropenen.'},
    dashboard:{label:'Bedrijfsoverzicht',intro:'Je cijfers, openstaande orders en aandachtspunten in één werkplek.',views:['Overzicht','Taken'],note:'Klik door naar een module of artikel en probeer de handelingen met deze fictieve gegevens.'},
    systeem:{label:'Jouw werkplek',intro:'Bekijk de voorbeeldkoppelingen en pas de uitstraling van de demo aan.',views:['Koppelingen','Instellingen'],note:'Deze demo is niet aangesloten op echte accounts. Alle acties blijven binnen deze voorbeeldomgeving.'}
  };
  const groups=[
    ['Overzicht','dashboard',[['Bedrijfsoverzicht','dashboard'],['Artikelkaarten','omzet','details']]],
    ['Producten','data',[['Artikelbeheer','producten','overzicht','catalogus'],['Publicaties','producten'],['Listingoptimalisatie','producten','details'],['Product Image Studio','producten','overzicht','studio']]],
    ['Orders en verkoop','shop',[['Orderoverzicht','orders'],['Retouren','orders','details']]],
    ['Omzet','dashboard',[['Omzet per kanaal','omzet'],['Omzet per artikel','omzet','details'],['Forecasting','forecasting']]],
    ['Inkoop','shop',[['Besteladvies','inkoop'],['In bestelling','inkoop','details'],['Leveranciers','inkoop','overzicht','leveranciers']]],
    ['Voorraad','shop',[['Voorraadlijst','voorraad'],['Overstock en incourant','voorraad','details']]],
    ['Magazijn','automation',[['Locaties en tellen','logistiek'],['Fulfilment','logistiek','details']]],
    ['Analyse','choice',[['Productranking','marketing','details'],['Open signalen','controles'],['Afgehandelde signalen','controles','details']]],
    ['Marketing','marketing',[['Marketingagent','marketing','overzicht','agent'],['Campagnes','marketing'],['Beoordeelde voorstellen','marketing','overzicht','historie']]],
    ['Financieel','data',[['Exploitatie','financieel'],['Marketplace-tegoeden','financieel','details']]],
    ['Systeem','security',[['Koppelingen','systeem'],['Demo-instellingen','systeem','details']]]
  ];
  const specialScreens={producten:['catalogus','studio'],inkoop:['leveranciers'],marketing:['agent','historie']};
  const root=document.querySelector('[data-demo]');if(!root||!D)return;
  let state=D.createState();
  const params=new URLSearchParams(location.search);
  let current=Object.hasOwn(modules,params.get('module'))?params.get('module'):'dashboard';
  let work=params.get('view')==='details';let special=specialScreens[current]?.includes(params.get('screen'))?params.get('screen'):'';let rows=[];let active={};
  let navOpen=false,receiptSerial=0,rankCountry=params.get('country')==='BE'?'BE':'NL';
  let studioSku='DEMO-1001',studioImage=0;
  const rankFor=(p,previous=false)=>{const n=previous?p.previousRank:p.rank;return n===null?null:n+(rankCountry==='BE'?3:0);};
  const q=selector=>root.querySelector(selector), esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const number=n=>new Intl.NumberFormat('nl-NL',{maximumFractionDigits:0}).format(n);
  const pct=n=>n===null?'—':new Intl.NumberFormat('nl-NL',{maximumFractionDigits:1}).format(n)+'%';
  const safeRatio=(a,b)=>b?a/b*100:null;
  const storageKey='opticore-webapp-demo-theme';
  let theme='light';
  try{const saved=localStorage.getItem(storageKey);if(['light','dark'].includes(saved))theme=saved;else if(window.matchMedia?.('(prefers-color-scheme: dark)').matches)theme='dark';}catch{}
  if(['light','dark'].includes(params.get('theme')))theme=params.get('theme');
  function applyTheme(value){
    theme=value==='dark'?'dark':'light';document.documentElement.dataset.theme=theme;
    q('[data-demo-theme]').setAttribute('aria-checked',String(theme==='dark'));
    q('[data-demo-theme-label]').textContent=theme==='dark'?'Licht':'Donker';
    q('[data-demo-theme-icon]').textContent=theme==='dark'?'☀':'◐';
    try{localStorage.setItem(storageKey,theme);}catch{}
    const settings=q('[data-demo-settings-theme]');if(settings)settings.value=theme;
  }
  applyTheme(theme);
  function setMenu(value){
    const wasOpen=navOpen;
    navOpen=Boolean(value);root.classList.toggle('demo-nav-open',navOpen);
    q('[data-demo-menu]').setAttribute('aria-expanded',String(navOpen));
    q('[data-demo-menu]').setAttribute('aria-label',navOpen?'App-menu sluiten':'App-menu openen');
    q('[data-demo-menu-close]').hidden=!navOpen;
    const mobile=window.matchMedia?.('(max-width: 760px)').matches;
    q('.demo-sidebar').inert=Boolean(mobile&&!navOpen);
    q('.demo-sidebar').setAttribute('aria-hidden',String(Boolean(mobile&&!navOpen)));
    q('.demo-workspace').inert=Boolean(mobile&&navOpen);
    if(mobile&&navOpen&&!wasOpen)q('.demo-sidebar summary').focus();
    if(mobile&&!navOpen&&wasOpen)q('[data-demo-menu]').focus();
  }
  const labels={published:'Offer gepubliceerd',failed:'Publicatiefout',disabled:'Niet gepubliceerd',queued:'In wachtrij'};
  const offer=status=>`<span class="offer-badge is-${status}" title="${labels[status]}"><b aria-hidden="true">${status==='published'?'✓':status==='failed'?'×':status==='queued'?'…':'−'}</b>${labels[status]}</span>`;
  const channelName=id=>D.channels.find(c=>c.id===id)?.label||id;
  const channelBrand=id=>{const c=D.channels.find(c=>c.id===id);return c?`<span class="channel-brand"><img src="${esc(c.logo)}" alt="${esc(c.label.replace(/ (NL|DE|BE)$/,''))}" width="74" height="27"><span class="channel-country" aria-label="${esc(c.country)}">${c.country}</span></span>`:esc(id);};
  const strip=document.createElement('div');strip.className='demo-channel-strip';strip.setAttribute('aria-label','Voorbeeldkanalen');strip.innerHTML=D.channels.map(c=>channelBrand(c.id)).join('');q('[data-demo-intro]').after(strip);
  const period=()=>Number(q('[data-demo-period]').value);
  const channel=()=>q('[data-demo-channel]').value;
  const stat=(label,value,note)=>({label,value,note});
  function fields() {
    if(current==='marketing'&&work)return [stat('Gevolgde artikelen',state.products.length,'Fictieve zoekwoordmetingen'),stat('In de top 10',state.products.filter(p=>rankFor(p)!==null&&rankFor(p)<=10).length,'Beste voorbeeldzoekwoord per artikel'),stat('Rankingland',rankCountry==='BE'?'België':'Nederland','bol · apart per land')];
    const all=D.totals(state,period(),channel()), stock=state.products.reduce((n,p)=>n+D.available(p)*p.cost,0);
    const campaigns=state.campaigns.filter(c=>channel()==='all'||c.channel===channel());
    const costs=campaigns.reduce((n,c)=>n+c.cost,0),adsSales=campaigns.reduce((n,c)=>n+c.sales,0),net30=D.totals(state,1,channel()).revenue;
    switch(current){
      case 'dashboard':return [stat('Netto omzet',money(all.revenue),'Na retouren · '+period()+' maanden'),stat('Marge',pct(safeRatio(all.profit,all.revenue)),money(all.profit)+' vóór advertenties'),stat('Open orders',state.orders.filter(o=>o.status!=='Verzonden').length,'Klaar om op te pakken'),stat('Aandachtspunten',D.signalRows(state).filter(s=>!s.done).length,'Voorraad, artikelen en marketing')];
      case 'systeem':return [stat('Modules',10,'Alle modules zijn te proberen'),stat('Voorbeeldkanalen',D.channels.length,'Met fictieve verkoopgegevens'),stat('Weergave',theme==='dark'?'Donker':'Licht','Aan te passen met de schakelaar')];
      case 'omzet':return [stat('Netto omzet',money(all.revenue),period()+' maanden · na retouren'),stat('Marge',pct(safeRatio(all.profit,all.revenue)),money(all.profit)+' vóór advertenties'),stat('Verkocht',number(all.qty),'YoY netto omzet: '+pct(safeRatio(all.revenue-D.totals(state,period(),channel(),true).revenue,D.totals(state,period(),channel(),true).revenue)))];
      case 'forecasting':return [stat('Afzet komende 3 maanden',number(state.products.reduce((n,p)=>n+D.forecast(state,p),0))+' stuks','Recent volume × seizoensfactor'),stat('Voorraadtekort dreigt',state.products.filter(p=>D.coverage(p)!==null&&D.coverage(p)<p.lead).length+' artikelen','Dekking korter dan levertijd'),stat('Groeiscenario',pct(state.growth),'Pas het scenario hieronder aan')];
      case 'voorraad':return [stat('Magazijnvoorraadwaarde',money(stock),'Beschikbaar × inkoopprijs'),stat('Incourant',state.products.filter(p=>p.lastSale>180).length+' artikelen','Langer dan 180 dagen geen verkoop'),stat('Overstock',state.products.filter(p=>D.coverage(p)>180).length+' artikelen','Meer dan 180 dagen dekking')];
      case 'inkoop':return [stat('Besteladvies',money(state.products.reduce((n,p)=>n+D.need(state,p)*p.cost,0)),'Inclusief openstaande inkoop'),stat('In bestelling',number(state.products.reduce((n,p)=>n+D.ordered(state,p),0))+' stuks','Nog te ontvangen'),stat('Leveranciers',new Set(state.products.filter(p=>D.need(state,p)>0).map(p=>p.supplier)).size,'Met een bestelvoorstel')];
      case 'logistiek':return [stat('Magazijn',number(state.products.reduce((n,p)=>n+D.available(p),0))+' stuks','Na reserveringen'),stat('Onderweg',number(state.shipments.filter(s=>s.status==='Onderweg').reduce((n,s)=>n+s.qty,0))+' stuks','FBA / externe bestemming'),stat('Extern',number(state.products.reduce((n,p)=>n+p.external,0))+' stuks','Apart van magazijnvoorraad')];
      case 'producten':return [stat('Artikelen',state.products.length,'Met SKU en demo-EAN'),stat('Publicatiefouten',state.products.reduce((n,p)=>n+p.offers.filter(s=>s==='failed').length,0),'Per afzonderlijk kanaal'),stat('Listingkwaliteit',pct(state.products.reduce((n,p)=>n+p.listing,0)/state.products.length),'Fictieve controlescore')];
      case 'orders':return [stat('Orders',state.orders.length,'Fictieve recente orders'),stat('Retouren open',state.returns.filter(r=>!r.received).length,'Wachten op ontvangst'),stat('Retourpercentage',pct(safeRatio(all.returned,all.qty)),'Gekozen omzetperiode')];
      case 'marketing':return [stat('Advertentiekosten',money(costs),'Laatste 30 dagen · gekozen kanaal'),stat('Gewogen ACoS',pct(safeRatio(costs,adsSales)),'Kosten / toegeschreven omzet'),stat('TACoS',pct(safeRatio(costs,net30)),'Kosten / netto verkoop 30 dagen')];
      case 'financieel':return [stat('Netto verkoop',money(all.revenue),'Excl. btw, na retouren'),stat('Resultaat vóór belasting',money(all.profit-D.advertising(state,period(),channel())-420*period()*(channel()==='all'?1:all.revenue/D.totals(state,period()).revenue)),'Na advertenties en toegerekende vaste kosten'),stat('Marketplace-tegoed',money(all.revenue-all.fee-all.revenue*.05),'Voorbeeld: na fees en 5% reserve')];
      default:return [stat('Open signalen',D.signalRows(state).filter(s=>!s.done).length,'Afgeleid uit dit voorbeeld'),stat('Hoge prioriteit',D.signalRows(state).filter(s=>!s.done&&s.priority==='Hoog').length,'Voorraad, publicatie of ACoS'),stat('Afgehandeld',state.signalsDone.length,'Heropenen blijft mogelijk')];
    }
  }
  function tableData() {
    const p=state.products,month=period(),ch=channel();
    const productRows=build=>p.map(item=>({sku:item.sku,...build(item)}));
    if(special==='catalogus')return {headers:['Artikel / SKU','Verkoopprijs','Inkoopprijs','Voorraad'],rows:productRows(p=>({cells:[p.name,money(p.price),money(p.cost),number(D.available(p))],action:{kind:'product-edit',id:p.sku,label:'Artikel bewerken'}}))};
    if(special==='leveranciers')return {headers:['Leverancier','Artikelen','In bestelling','Levertijd'],rows:[...new Set(p.map(p=>p.supplier))].map(name=>{const items=p.filter(p=>p.supplier===name);return {cells:[name,items.length,number(items.reduce((n,p)=>n+D.ordered(state,p),0))+' stuks',Math.max(...items.map(p=>p.lead))+' dagen'],action:{kind:'supplier',id:name,label:'Artikelen bekijken'}};})};
    switch(current){
      case 'dashboard':return {headers:['Aandachtspunt','Artikel','Prioriteit','Volgende stap'],rows:D.signalRows(state).filter(s=>!s.done).slice(0,work?20:5).map(s=>({sku:s.sku,cells:[s.label,D.product(state,s.sku).name,s.priority,modules[s.module].label],action:{kind:'signal',id:s.id,label:'Bekijk signaal'}}))};
      case 'systeem':return {headers:['Platform','Toepassing','Voorbeeldstatus','Gegevens'],rows:D.channels.map(c=>({brandCells:{0:c.id},cells:[c.label,'Orders, aanbod en omzet','Demokoppeling','Fictieve gegevens']}))};
      case 'omzet':return work?{headers:['Artikel / SKU','Netto omzet','Marge / YoY','Verkocht'],rows:productRows(p=>{const s=D.sales(state,p,month,ch);return {cells:[p.name,money(s.revenue),pct(safeRatio(s.profit,s.revenue))+' / '+pct(safeRatio(s.revenue-D.sales(state,p,month,ch,true).revenue,D.sales(state,p,month,ch,true).revenue)),number(s.qty)]};})}:{headers:['Marketplace','Netto omzet','Marge','Aandeel'],rows:D.channels.filter(c=>ch==='all'||c.id===ch).map(c=>{const s=D.totals(state,month,c.id),total=D.totals(state,month).revenue;return {brandCells:{0:c.id},cells:[c.label,money(s.revenue),pct(safeRatio(s.profit,s.revenue)),pct(safeRatio(s.revenue,total))],action:{kind:'channel',id:c.id,label:'Bekijk artikelen'}};})};
      case 'forecasting':return {headers:work?['Artikel / SKU','Laatste 3 mnd','Komende 3 mnd','Dekking']:['Artikel / SKU','Forecast 3 mnd','Beschikbaar','Besteladvies'],rows:productRows(p=>({cells:work?[p.name,number(p.history.slice(-3).reduce((a,b)=>a+b,0))+' stuks',number(D.forecast(state,p))+' stuks',D.coverage(p)===null?'Geen recente afzet':D.coverage(p)+' dagen']:[p.name,number(D.forecast(state,p))+' stuks',number(D.available(p)),number(D.need(state,p))+' stuks'],action:{kind:'proposal',id:p.sku,label:'Naar besteladvies'}}))};
      case 'voorraad':return {headers:work?['Artikel / SKU','Laatste verkoop','Dekking','Voorraadwaarde']:['Artikel / SKU','Beschikbaar','Gereserveerd','Extern'],rows:productRows(p=>({cells:work?[p.name,p.lastSale+' dagen geleden',D.coverage(p)===null?'Geen recente afzet':D.coverage(p)+' dagen',money(D.available(p)*p.cost)]:[p.name,number(D.available(p)),number(p.reserved),number(p.external)],action:{kind:'count',id:p.sku,label:'Voorraad tellen'}})).filter(r=>!work||D.product(state,r.sku).lastSale>180||D.coverage(D.product(state,r.sku))>180)};
      case 'inkoop':return work?{headers:['Bestelling','Artikel','Nog te ontvangen','Status'],rows:state.purchases.map(o=>({sku:o.sku,cells:[o.id,D.product(state,o.sku).name,number(o.qty-(o.receivedQty||0))+' van '+number(o.qty),o.status],action:o.received?null:{kind:'receive-purchase',id:o.id,label:'Ontvangst registreren'}}))}:{headers:['Artikel / SKU','Leverancier','Levertijd','Advies'],rows:productRows(p=>({cells:[p.name,p.supplier,p.lead+' dagen',number(D.need(state,p))+' stuks'],action:{kind:'proposal',id:p.sku,label:'Bestelvoorstel'}})).filter(r=>D.need(state,D.product(state,r.sku))>0)};
      case 'logistiek':return work?{headers:['Zending','Artikel','Bestemming','Status'],rows:state.shipments.map(s=>({sku:s.sku,cells:[s.id,D.product(state,s.sku).name,s.destination,s.status+' · '+s.qty+' stuks'],action:{kind:'shipment',id:s.id,label:'Zending bekijken'}}))}:{headers:['Artikel / SKU','Locatie','Fysiek','Beschikbaar'],rows:productRows(p=>({cells:[p.name,p.location,number(p.stock),number(D.available(p))],action:{kind:'count',id:p.sku,label:'Telling aanpassen'}}))};
      case 'producten':return work?{headers:['Artikel / SKU','Score','Controle','Voorstel'],rows:productRows(p=>({cells:[p.name,p.listing+'/100',p.listing<85?'Informatie aanvullen':'Gereed voor controle','Titel en kenmerken'],action:{kind:'listing',id:p.sku,label:'Bekijk listingvoorstel'}}))}:{headers:['Artikel / SKU','bol NL','Amazon NL','Overige kanalen'],rows:productRows(p=>({cells:[p.name,labels[p.offers[0]],labels[p.offers[1]],p.offers.slice(2).filter(s=>s==='published').length+' van 3 gepubliceerd'],action:{kind:'offers',id:p.sku,label:'Offers controleren'}}))};
      case 'orders':return work?{headers:['Retour','Artikel','Reden','Ontvangst'],rows:state.returns.filter(r=>ch==='all'||r.channel===ch).map(r=>({sku:r.sku,cells:[r.id,D.product(state,r.sku).name,r.reason,r.received?'Ontvangen':'Nog niet ontvangen'],action:r.received?null:{kind:'receive-return',id:r.id,label:'Retour ontvangen'}}))}:{headers:['Order','Marketplace','Artikel','Status'],rows:state.orders.filter(o=>ch==='all'||o.channel===ch).map(o=>({sku:o.sku,brandCells:{1:o.channel},cells:[o.id,channelName(o.channel),D.product(state,o.sku).name,o.status],action:{kind:'order',id:o.id,label:'Order bekijken'}}))};
      case 'marketing':return work?{headers:['Artikel / SKU','Positie','Vorige meting','Verandering'],rows:productRows(p=>({cells:[p.name,rankFor(p)===null?'Niet gevonden':'#'+rankFor(p),rankFor(p,true)===null?'—':'#'+rankFor(p,true),rankFor(p)===null?'Geen positie':(rankFor(p,true)-rankFor(p)>0?'+':'')+(rankFor(p,true)-rankFor(p))],action:{kind:'keywords',id:p.sku,label:'Zoekwoorden'}}))}:{headers:['Campagne','Kosten / omzet','ACoS / doel','Dagbudget'],rows:state.campaigns.filter(c=>ch==='all'||c.channel===ch).map(c=>({sku:c.sku,brandCells:{0:c.channel},cells:[c.name,money(c.cost)+' / '+money(c.sales),pct(c.cost/c.sales*100)+' / '+c.target+'%',money(c.budget)],action:{kind:'budget',id:c.id,label:'Budgetvoorstel'}}))};
      case 'financieel':return {headers:work?['Marketplace','Netto verkoop','Reserve (5%)','Verwacht tegoed']:['Marketplace','Netto omzet','Kanaal / verzending','Bijdrage'],rows:D.channels.filter(c=>ch==='all'||c.id===ch).map(c=>{const t=D.totals(state,month,c.id);return {brandCells:{0:c.id},cells:work?[c.label,money(t.revenue),money(t.revenue*.05),money(t.revenue-t.fee-t.revenue*.05)]:[c.label,money(t.revenue),money(t.fee+t.shipping),money(t.profit)],action:{kind:'channel',id:c.id,label:'Onderliggende artikelen'}};})};
      default:return {headers:['Signaal','Artikel','Prioriteit','Context'],rows:D.signalRows(state).filter(s=>s.done===work).map(s=>({sku:s.sku,cells:[s.label,D.product(state,s.sku).name,s.priority,s.detail],action:{kind:work?'reopen-signal':'signal',id:s.id,label:work?'Heropenen':'Signaal beoordelen'}}))};
    }
  }
  function chart() {
    let values,labels,title;
    if(['dashboard','omzet','forecasting','marketing','financieel'].includes(current)){
      values=D.months.map((_,i)=>state.products.reduce((n,p)=>n+p.history[i]*(current==='forecasting'?1:(p.historyPrice??p.price))*(channel()==='all'?1:p.weights[D.channels.findIndex(c=>c.id===channel())]||0),0));labels=D.months;title=current==='forecasting'?'Afzethistorie · 12 maanden':'Bruto verkooptrend · vóór retouren';
    }else if(['voorraad','inkoop','logistiek'].includes(current)){
      values=state.products.map(p=>current==='inkoop'?D.need(state,p):D.available(p));labels=state.products.map(p=>p.sku.replace('DEMO-',''));title=current==='inkoop'?'Besteladvies per SKU':'Beschikbare magazijnvoorraad per SKU';
    }else if(current==='producten'){
      values=D.channels.map((_,i)=>state.products.filter(p=>p.offers[i]==='published').length);labels=D.channels.map(c=>c.label);title='Gepubliceerde offers per marketplace';
    }else if(current==='orders'){
      values=D.channels.map(c=>state.orders.filter(o=>o.channel===c.id).length);labels=D.channels.map(c=>c.label);title='Recente demo-orders per marketplace';
    }else{values=[D.signalRows(state).filter(s=>!s.done).length,state.signalsDone.length];labels=['Open','Afgehandeld'];title='Opvolging van verkoopsignalen';}
    q('[data-demo-chart-title]').textContent=title;
    const max=Math.max(1,...values);
    q('[data-demo-bars]').innerHTML=values.map((v,i)=>`<div title="${esc(labels[i])}: ${number(v)}"><i style="height:${Math.max(0,v/max*80)}%"></i><span>${esc(labels[i])}</span></div>`).join('');
  }
  const studioLabels=['Vrijstaand product','In een rustige omgeving','Productinformatie'];
  function studioState(){
    if(!D.product(state,studioSku))studioSku=state.products[0].sku;
    state.studio??={};
    const p=D.product(state,studioSku);
    if(!state.studio[studioSku]||state.studio[studioSku].name!==p.name)state.studio[studioSku]={name:p.name,order:[0,1,2],approved:false};
    return state.studio[studioSku];
  }
  function studioSVG(sku,kind){
    const p=D.product(state,sku),shape={
      'DEMO-1001':'<rect x="-100" y="-100" width="200" height="200" rx="30" fill="#eef2f5" stroke="#b7c5ce" stroke-width="4"/><rect x="-70" y="-65" width="140" height="90" rx="12" fill="#183244"/><text x="0" y="-5" text-anchor="middle" font-size="36" fill="#fff">20.5°</text><circle cy="65" r="17" fill="#c1cfd8"/>',
      'DEMO-1002':'<rect x="-75" y="-95" width="150" height="190" rx="45" fill="#f3f5f7" stroke="#bac8d0" stroke-width="4"/><circle cy="-12" r="47" fill="#e1e8ed" stroke="#c1ced7" stroke-width="5"/><circle cx="-17" cy="-12" r="7" fill="#708291"/><circle cx="17" cy="-12" r="7" fill="#708291"/><circle cy="67" r="8" fill="#61aeaf"/>',
      'DEMO-1003':'<rect x="-80" y="-100" width="85" height="200" rx="25" fill="#f0f4f7" stroke="#b8c9d3" stroke-width="4"/><rect x="28" y="-100" width="45" height="200" rx="18" fill="#e4ecf1" stroke="#b8c9d3" stroke-width="4"/><circle cx="-38" cy="-63" r="5" fill="#69a9ae"/>',
      'DEMO-1004':'<rect x="-100" y="-100" width="200" height="200" rx="14" fill="#eff4f6" stroke="#bacbd3" stroke-width="4"/><path d="M0 -80V80M-80 0H80" stroke="#b9c8d1" stroke-width="3"/>',
      'DEMO-1005':'<rect x="-95" y="-95" width="190" height="190" rx="20" fill="#edf3f6" stroke="#b7c8d1" stroke-width="4"/><circle r="58" fill="#d9e5eb" stroke="#9aafb9" stroke-width="4"/><path d="M0 -40V-18" stroke="#557b8c" stroke-width="6" stroke-linecap="round"/>',
      'DEMO-1006':'<rect x="-65" y="-100" width="130" height="200" rx="43" fill="#f0f5f8" stroke="#b8c8d2" stroke-width="4"/><path d="M-45 15Q0 -25 45 15V62Q0 95 -45 62Z" fill="#d3e0e8"/><circle cy="-56" r="7" fill="#639fa9"/>'
    }[sku]||'<rect x="-90" y="-90" width="180" height="180" rx="22" fill="#e6eef3" stroke="#a6bdc9" stroke-width="4"/>';
    const background=kind===1?'<rect width="640" height="640" fill="#eef5f3"/><path d="M0 420H640V640H0Z" fill="#d3e4e0"/><path d="M70 0V420M0 420H640" stroke="#b6ceca" stroke-width="3"/><rect x="470" y="365" width="75" height="55" rx="6" fill="#8eb2aa"/><path d="M507 365V210M507 290Q440 270 458 220Q505 220 507 290M507 330Q570 290 551 255Q506 265 507 330" stroke="#739c90" stroke-width="12" fill="none"/>':kind===2?'<rect width="640" height="640" fill="#f0f6f9"/><path d="M0 0H640V150H0Z" fill="#d9ebf1"/>':'<rect width="640" height="640" fill="#fff"/>';
    const title=kind===2?`<text x="42" y="75" fill="#183244" font-size="26" font-weight="700">${esc(p.name)}</text><text x="42" y="115" fill="#506f80" font-size="17">${esc(p.category)} · fictief voorbeeld</text>`:'';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" font-family="Arial, sans-serif" role="img" aria-label="Schematisch voorbeeld: ${esc(p.name)} · ${esc(studioLabels[kind])}"><title>${esc(p.name)} · ${esc(studioLabels[kind])}</title>${background}${title}<ellipse cx="320" cy="490" rx="135" ry="20" fill="#183244" opacity=".09"/><g transform="translate(320 ${kind===2?350:315})">${shape}</g><text x="320" y="592" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#627587">Fictief product · schematisch demobeeld</text></svg>`;
  }
  function renderStudio(){
    const project=studioState(),p=D.product(state,studioSku);
    q('[data-demo-special]').innerHTML=`<div class="demo-studio-toolbar"><label>Artikel<select data-studio-product>${state.products.map(p=>`<option value="${esc(p.sku)}"${p.sku===studioSku?' selected':''}>${esc(p.name)} · ${esc(p.sku)}</option>`).join('')}</select></label><span>${project.approved?'Beeldset beoordeeld':'Concept · nog beoordelen'}</span></div><div class="demo-studio"><div><figure class="demo-studio-preview">${studioSVG(studioSku,studioImage)}<figcaption>${esc(studioLabels[studioImage])}${project.order[0]===studioImage?' · hoofdbeeld':''}</figcaption></figure><div class="demo-studio-thumbnails" aria-label="Kies een voorbeeldbeeld">${project.order.map((kind,i)=>`<button type="button" data-studio-image="${kind}" aria-pressed="${studioImage===kind}">${studioSVG(studioSku,kind)}<span>${i===0?'Hoofdbeeld':esc(studioLabels[kind])}</span></button>`).join('')}</div></div><article class="demo-studio-controls"><p class="demo-eyebrow">BEELDEN BIJ JE ARTIKEL</p><h2>${esc(p.name)}</h2><p>${esc(p.sku)} · ${esc(p.category)}</p><h3>Een samenhangende beeldset</h3><p>Kies uit drie vaste voorbeeldbeelden. Verander het hoofdbeeld, bekijk de hele set en beoordeel het resultaat.</p><p>In de echte Studio kun je bestaande beelden aanpassen met een opdracht, een serie maken op basis van een voorbeeldartikel en het resultaat controleren voordat je publiceert.</p><div class="demo-studio-actions"><button type="button" data-studio-main${project.order[0]===studioImage?' disabled':''}>Als hoofdbeeld instellen</button><button type="button" data-studio-review class="demo-primary">Beeldset beoordelen</button><button type="button" data-studio-download>Download dit voorbeeld (SVG)</button><button type="button" data-studio-reset>Originele volgorde herstellen</button></div><p class="demo-studio-disclaimer">Dit is een lokale demonstratie met fictieve illustraties. Er wordt geen AI-aanvraag uitgevoerd en niets naar bol of een ander platform verstuurd.</p></article></div>`;
  }
  function render() {
    if(special&&!specialScreens[current]?.includes(special))special='';
    if(special==='studio')work=false;
    root.dataset.module=current;root.dataset.screen=special;root.dataset.view=work?'details':'overzicht';
    const m=modules[current];q('[data-demo-title]').textContent=m.label;q('[data-demo-intro]').textContent=m.intro;q('[data-demo-note]').textContent=m.note;
    if(special==='agent'){q('[data-demo-title]').textContent='Marketingagent';q('[data-demo-intro]').textContent='Van verkoop, voorraad en advertenties naar voorstellen die je zelf beoordeelt.';}
    if(special==='historie'){q('[data-demo-title]').textContent='Beoordeelde voorstellen';q('[data-demo-intro]').textContent='Bekijk wat je hebt goedgekeurd, uitgesteld of afgewezen in deze demo.';}
    if(special==='catalogus')q('[data-demo-title]').textContent='Artikelbeheer';
    if(special==='leveranciers')q('[data-demo-title]').textContent='Leveranciers';
    if(!special&&work){const names={producten:'Listingoptimalisatie',orders:'Retouren',inkoop:'In bestelling',logistiek:'Fulfilment',marketing:'Productranking',financieel:'Marketplace-tegoeden',voorraad:'Overstock en incourant'};if(names[current])q('[data-demo-title]').textContent=names[current];}
    q('[data-demo-country-field]').hidden=!(current==='marketing'&&work);q('[data-demo-country]').value=rankCountry;
    q('[data-demo-channel]').closest('label').hidden=current==='marketing'&&work;
    q('[data-demo-home]').hidden=current!=='dashboard';
    q('[data-demo-home]').innerHTML=current==='dashboard'?'<div class="demo-quick-actions"><button type="button" data-route="producten|overzicht|catalogus"><strong>Artikelen beheren</strong><span>Open een artikelkaart of voeg een voorbeeld toe →</span></button><button type="button" data-route="inkoop|overzicht|"><strong>Inkoop voorbereiden</strong><span>Van besteladvies naar een bestelling →</span></button><button type="button" data-route="marketing|overzicht|agent"><strong>Voorstellen beoordelen</strong><span>Bekijk kansen voor listings en campagnes →</span></button></div>':'';
    const agent=current==='marketing'&&['agent','historie'].includes(special),settings=current==='systeem'&&work,studio=current==='producten'&&special==='studio';
    q('[data-demo-special]').hidden=!agent&&!settings&&!studio;
    if(studio){
      q('[data-demo-title]').textContent='Product Image Studio';
      q('[data-demo-intro]').textContent='Bekijk een beeldset, kies het hoofdbeeld en beoordeel de afbeeldingen voordat je verdergaat.';
      q('[data-demo-note]').textContent='Vaste, schematische voorbeelden met fictieve producten. Deze demo genereert geen AI-beelden en publiceert niets naar een platform.';
      renderStudio();
    }
    if(agent){
      const decisions={approved:'Goedgekeurd',snoozed:'Uitgesteld',rejected:'Afgewezen',open:'Open'};
      const advice=D.adviceRows(state).filter(a=>special==='historie'?a.decision!=='open':a.decision==='open');
      q('[data-demo-special]').innerHTML='<div class="demo-agent-intro"><h2>'+advice.length+' '+(special==='historie'?'beoordeelde voorstellen':'voorstellen om te bekijken')+'</h2><p>Open een voorstel, bekijk de onderbouwing en kies zelf de volgende stap.</p></div><div class="demo-advice-grid">'+(advice.length?advice.map(a=>`<article class="demo-advice-card"><div class="demo-advice-meta"><span>${esc(a.type)}</span><span>${esc(decisions[a.decision])}</span></div><h3>${esc(a.title)}</h3><button class="demo-product-link" type="button" data-open-article="${esc(a.sku)}">${esc(D.product(state,a.sku).name)}<small>${esc(a.sku)}</small></button><p>${esc(a.reason)}</p><p>${esc(a.proposal)}</p><div class="demo-advice-actions">${special==='historie'?`<button type="button" data-advice-review="${esc(a.id)}" data-decision="open">Opnieuw bekijken</button>`:`<button type="button" class="demo-primary" data-advice-action="${esc(a.id)}">Bekijk voorstel</button><button type="button" data-advice-review="${esc(a.id)}" data-decision="snoozed">Later</button><button type="button" data-advice-review="${esc(a.id)}" data-decision="rejected">Afwijzen</button>`}</div></article>`).join(''):'<p class="demo-empty">Hier staan nog geen voorstellen. Bekijk een andere weergave of begin de demo opnieuw.</p>')+'</div>';
    }else if(settings){
      q('[data-demo-special]').innerHTML='<article class="demo-settings"><h2>Maak de werkplek prettig voor jou</h2><p>Probeer de lichte en donkere weergave. Alleen je weergavevoorkeur wordt bewaard.</p><label>Weergave<select data-demo-settings-theme><option value="light"'+(theme==='light'?' selected':'')+'>Licht</option><option value="dark"'+(theme==='dark'?' selected':'')+'>Donker</option></select></label><h3>Opnieuw proberen</h3><p>Reset herstelt de fictieve artikelen, bestellingen en voorstellen. Je gekozen weergave blijft behouden.</p><button type="button" data-demo-settings-reset>Herstel de voorbeeldgegevens</button><a href="/webapp-samenstellen/" target="_top">Stel jouw eigen WebApp samen →</a></article>';
    }
    q('.demo-filters').hidden=agent||studio||current==='systeem';
    q('.demo-tabs').hidden=Boolean(special);
    q('.demo-table-panel').hidden=agent||settings||studio;
    q('[data-demo-metrics]').hidden=studio;
    q('[data-demo-create]').hidden=current!=='producten'||special!=='catalogus';
    q('[data-demo-metrics]').innerHTML=fields().map(s=>`<article><span>${esc(s.label)}</span><strong>${esc(s.value)}</strong><small>${esc(s.note)}</small></article>`).join('');
    q('[data-demo-channel]').disabled=!['dashboard','omzet','producten','orders','marketing','financieel'].includes(current)||special==='leveranciers';
    q('[data-demo-period]').disabled=!['dashboard','omzet','financieel','orders'].includes(current);
    q('[data-demo-scenario]').hidden=current!=='forecasting';q('[data-demo-growth]').value=state.growth;
    q('[data-demo-overview]').hidden=work||Boolean(special)||current==='systeem';chart();
    q('[data-demo-context]').hidden=current!=='financieel';
    if(current==='financieel'){const t=D.totals(state,period(),channel());q('[data-demo-context]').innerHTML='<h2>Exploitatie · kostenopbouw</h2>'+metricCards([['Inkoopwaarde',money(t.cost)],['Kanaalkosten',money(t.fee)],['Verzendkosten',money(t.shipping)],['Advertentiekosten',money(D.advertising(state,period(),channel()))],['Vaste kosten, toegerekend',money(420*period()*(channel()==='all'?1:t.revenue/D.totals(state,period()).revenue))],['Periode',period()+' maanden']]);}
    q('[data-demo-table-title]').textContent=special==='catalogus'?'Je artikelen':special==='leveranciers'?'Je leveranciers':current==='dashboard'?'Wat vraagt aandacht?':m.views[work?1:0];
    const data=tableData(),query=q('[data-demo-search]').value.trim().toLocaleLowerCase('nl');
    rows=data.rows.filter(r=>!query||[...r.cells,r.sku,D.product(state,r.sku)?.ean].filter(Boolean).some(v=>String(v).toLocaleLowerCase('nl').includes(query)));
    q('thead').innerHTML='<tr>'+data.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')+'<th scope="col">Actie</th></tr>';
    q('tbody').innerHTML=rows.length?rows.map((r,index)=>'<tr>'+r.cells.map((cell,i)=>`<td data-label="${esc(data.headers[i])}">${r.brandCells?.[i]?channelBrand(r.brandCells[i])+(i===0&&r.sku?`<small class="channel-caption">${esc(cell)}</small>`:''):i===0&&r.sku?`<button class="demo-product-link" type="button" data-article="${esc(r.sku)}">${esc(cell)}<small>${esc(r.sku)}</small></button>`:esc(cell)}</td>`).join('')+`<td>${r.action?`<button type="button" data-demo-row="${index}">${esc(r.action.label)} →</button>`:r.sku?`<button type="button" data-article="${esc(r.sku)}">Artikelkaart →</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="5">Geen regels in deze selectie. Pas de zoekterm of het filter aan.</td></tr>';
    q('[data-demo-results]').textContent=rows.length+' voorbeeldregels';
    const route=current+'|'+(work?'details':'overzicht')+'|'+special;
    root.querySelectorAll('[data-demo-route]').forEach(b=>{const selected=b.dataset.demoRoute===route;b.setAttribute('aria-current',selected?'page':'false');if(selected)b.closest('details').open=true;});
    root.querySelectorAll('[data-demo-view]').forEach(b=>{const index=b.dataset.demoView==='details'?1:0;b.textContent=m.views[index];b.setAttribute('aria-pressed',String((index===1)===work));});
    q('[data-demo-select]').value=route;
    const address=new URLSearchParams({module:current,view:work?'details':'overzicht'});if(special)address.set('screen',special);if(current==='marketing'&&work)address.set('country',rankCountry);
    history.replaceState(null,'','?'+address);
  }
  function choose(id,view='overzicht',screen=''){if(!Object.hasOwn(modules,id))return;current=id;work=view==='details';special=specialScreens[id]?.includes(screen)?screen:'';q('[data-demo-search]').value='';q('[data-demo-channel]').value='all';q('[data-demo-status]').textContent='';setMenu(false);render();window.scrollTo({top:0,behavior:'instant'});}
  function message(text){q('[data-demo-status]').textContent=text+' Alleen in deze demo; er is niets naar een extern systeem verstuurd.';}
  const dialog=q('dialog');
  const metricCards=items=>'<div class="article-metrics">'+items.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')+'</div>';
  function article(sku){
    const p=D.product(state,sku);if(!p)return;
    const s=D.sales(state,p),margin=safeRatio(s.profit,s.revenue);
    const html=`<p class="demo-eyebrow">ARTIKELKAART · ${esc(p.sku)} · ${esc(p.ean)}</p><p>${esc(p.category)} · ${esc(p.supplier)} · locatie ${esc(p.location)}</p>`+metricCards([['Omzet 12 maanden',money(s.revenue)],['Marge',pct(margin)],['Beschikbaar',number(D.available(p))],['In bestelling',number(D.ordered(state,p))],['Afzetforecast 3 mnd',number(D.forecast(state,p))],['Dekking',D.coverage(p)===null?'Geen recente afzet':D.coverage(p)+' dagen']])+`<h3>Marketplace omzet en publicatiestatus</h3><div class="article-channels">`+D.channels.map((c,i)=>{const v=D.sales(state,p,12,c.id);return `<div>${channelBrand(c.id)}<span>${money(v.revenue)}</span>${offer(p.offers[i])}</div>`;}).join('')+`</div><h3>Afzet en bruto omzet · 12-maandentrend</h3><div class="article-history">`+D.months.map((label,i)=>`<div><span>${label}</span><strong>${money(p.history[i]*(p.historyPrice??p.price))}</strong><small>${p.history[i]} stuks</small></div>`).join('')+`</div><div class="demo-dialog-links"><button type="button" data-modal-nav="inkoop" data-sku="${esc(sku)}">Besteladvies</button><button type="button" data-modal-nav="producten" data-sku="${esc(sku)}">Publicaties</button><button type="button" data-modal-nav="marketing" data-sku="${esc(sku)}">Ranking en advertenties</button><button type="button" data-new-shipment="${esc(sku)}">Fulfilmentzending maken</button><button type="button" data-edit-article="${esc(sku)}">Artikel bewerken</button></div>`;
    open(p.name,html,{kind:'article',sku});
  }
  function open(title,html,action){active=action;q('[data-demo-dialog-title]').textContent=title;q('[data-demo-dialog-content]').innerHTML=html;q('[data-demo-dialog-error]').textContent='';if(!dialog.open)dialog.showModal();if(window.parent!==window)window.parent.postMessage({type:"opticore-demo-dialog"},location.origin);}
  function numeric(label,value,min,max){return `<label class="demo-action-field">${label}<input type="number" data-action-value value="${value}" min="${min}" max="${max}" step="1"></label>`;}
  function button(text){return `<button class="demo-primary" type="button" data-commit>${text}</button>`;}
  function action(a,sku){
    const p=D.product(state,sku||a.id);
    switch(a.kind){
      case 'channel':choose('omzet');work=true;q('[data-demo-channel]').value=a.id;render();return;
      case 'count':open('Voorraad tellen · '+p.name,`<p>Magazijnlocatie ${esc(p.location)}. Er zijn ${p.reserved} stuks gereserveerd; externe voorraad (${p.external}) blijft apart.</p>`+numeric('Getelde fysieke magazijnvoorraad',p.stock,p.reserved,10000)+button('Telling in demo opslaan'),{...a,sku:p.sku});return;
      case 'proposal':open('Bestelvoorstel · '+p.name,`<p>${esc(p.supplier)} · levertijd ${p.lead} dagen. Advies houdt rekening met ${D.ordered(state,p)} al bestelde stuks. Er wordt geen echte bestelling geplaatst.</p>`+metricCards([['Beschikbaar',D.available(p)],['Forecast 3 mnd',D.forecast(state,p)],['Voorgesteld',D.need(state,p)]])+numeric('Aantal voor nieuwe voorbeeldbestelling',Math.max(p.batch,D.need(state,p)),1,10000)+button('Voorstel klaarzetten ter beoordeling'),{...a,sku:p.sku});return;
      case 'receive-purchase':{const o=state.purchases.find(o=>o.id===a.id),remaining=o.qty-(o.receivedQty||0);open('Levering ontvangen · '+o.id,`<p>${esc(D.product(state,o.sku).name)} · ${remaining} van ${o.qty} stuks nog te ontvangen. Je kunt ook een deel van de bestelling ontvangen.</p>`+numeric('Aantal ontvangen stuks',remaining,1,remaining)+button('Voorbeeldontvangst bevestigen'),{...a,receiptReference:'DEMO-ONTV-UI-'+(++receiptSerial)});return;}
      case 'receive-return':{const r=state.returns.find(r=>r.id===a.id);open('Retourontvangst · '+r.id,`<p>Reden: ${esc(r.reason)}. ${r.sellable?'Opnieuw verkoopbaar: de demo boekt één stuk terug op magazijnvoorraad.':'Niet opnieuw verkoopbaar: magazijnvoorraad wordt niet verhoogd.'} Dit bevestigt geen terugbetaling.</p>`+button('Retour in demo ontvangen'),a);return;}
      case 'offers':open('Offerstatus · '+p.name,'<p>De kanaalstatus staat los van historische omzet. Deze knoppen simuleren alleen een offerinstelling.</p><div class="offer-controls">'+D.channels.map((c,i)=>`<div>${channelBrand(c.id)}${offer(p.offers[i])}<button type="button" data-offer="${c.id}" data-sku="${p.sku}">${p.offers[i]==='published'?'Uitschakelen':'Inschakelen (wachtrij)'}</button></div>`).join('')+'</div>',{...a,sku:p.sku});return;
      case 'listing':open('Listing verbeteren · '+p.name,`<p>Voorbeeldscore: ${p.listing}/100. Vul aan wat de klant over het product moet weten.</p><div class="listing-compare"><div><strong>Huidige titel</strong><p>${esc(p.title)}</p><p>${esc(p.description)}</p></div><div><strong>Bewerk je voorstel</strong><label class="demo-action-field">Producttitel<input data-edit-title maxlength="150" value="${esc(p.title+' · voor je slimme woning')}"></label><label class="demo-action-field">Beschrijving<textarea data-edit-description maxlength="1500" rows="4">${esc(p.description+' In de productinformatie vind je de toepassing, installatie en benodigde onderdelen.')}</textarea></label></div></div><p>Je bewaart een voorbeeldconcept. Er wordt niets gepubliceerd op een marketplace.</p>`+button('Listingconcept goedkeuren'),{...a,sku:p.sku});return;
      case 'budget':{const c=state.campaigns.find(c=>c.id===a.id);open('Campagnevoorstel · '+c.name,metricCards([['ACoS',pct(c.cost/c.sales*100)],['Doel',c.target+'%'],['Dagbudget',money(c.budget)]])+'<p>Pas een voorbeeldbudget aan en bevestig het voorstel. Er wordt geen campagne gewijzigd bij een advertentieplatform.</p>'+numeric('Voorgesteld dagbudget in euro',c.budget,1,100)+button('Budgetvoorstel in demo goedkeuren'),a);return;}
      case 'keywords':open('Zoekwoorden · '+p.name,`<p>Fictieve zoekwoordmetingen voor bol ${rankCountry==='BE'?'België':'Nederland'}. Niet gevonden blijft apart zichtbaar.</p><div class="keyword-example"><div><strong>${esc(p.name.toLowerCase())}</strong><span>${rankFor(p)===null?'Niet gevonden':'#'+rankFor(p)}</span></div><div><strong>${esc(p.category.toLowerCase())} slim bedienen</strong><span>${rankFor(p)===null?'Nog niet gemeten':'#'+(rankFor(p)+7)}</span></div></div><p>Vorige meting: ${rankFor(p,true)===null?'onbekend':'#'+rankFor(p,true)}. De artikelkaart verbindt deze metingen met omzet en voorraad.</p><button type="button" data-open-article="${p.sku}">Open artikelkaart</button>`,{...a,sku:p.sku});return;
      case 'shipment':{const s=state.shipments.find(s=>s.id===a.id);open('Fulfilmentzending · '+s.id,`<p>${s.qty} stuks naar ${esc(s.destination)} · ${esc(s.status)}.</p><p>Je ziet voorraad in het magazijn, onderweg en op de externe locatie afzonderlijk.</p>`+(s.status==='Onderweg'?button('Voorbeeldzending als ontvangen registreren'):''),a);return;}
      case 'shipment-create':open('Voorbeeldzending aanmaken',`<p>${esc(p.name)} · ${D.available(p)} stuks beschikbaar. Het gekozen aantal wordt in deze demo gereserveerd.</p><label class="demo-action-field">Bestemming<select data-shipment-destination>${D.channels.filter(c=>c.id.startsWith('amazon')).map(c=>`<option>${esc(c.label)}</option>`).join('')}</select></label>`+numeric('Aantal stuks',1,1,D.available(p))+button('Zending in demo aanmaken'),{...a,sku:p.sku});return;
      case 'product-edit':open('Artikel bewerken · '+p.sku,`<label class="demo-action-field">Artikelnaam<input data-edit-name maxlength="150" value="${esc(p.name)}"></label><div class="demo-form-grid"><label class="demo-action-field">Verkoopprijs (€)<input type="number" data-edit-price min="0.01" max="10000" step="0.01" value="${p.price}"></label><label class="demo-action-field">Inkoopprijs (€)<input type="number" data-edit-cost min="0" max="10000" step="0.01" value="${p.cost}"></label></div>`+button('Artikel in demo bewaren'),{...a,sku:p.sku});return;
      case 'product-create':open('Nieuw voorbeeldartikel','<label class="demo-action-field">Artikelnaam<input data-edit-name maxlength="150" placeholder="Bijvoorbeeld slimme dimmer"></label><div class="demo-form-grid"><label class="demo-action-field">Verkoopprijs (€)<input type="number" data-edit-price min="0.01" max="10000" step="0.01" value="39"></label><label class="demo-action-field">Inkoopprijs (€)<input type="number" data-edit-cost min="0" max="10000" step="0.01" value="12"></label></div><label class="demo-action-field">Beginvoorraad<input type="number" data-edit-stock min="0" max="10000" step="1" value="0"></label>'+button('Voorbeeldartikel aanmaken'),a);return;
      case 'supplier':{const items=state.products.filter(p=>p.supplier===a.id);open(a.id,'<p>Artikelen van deze voorbeeldleverancier. Open een artikel om voorraad en besteladvies te bekijken.</p><div class="demo-supplier-products">'+items.map(p=>`<button type="button" data-open-article="${esc(p.sku)}"><strong>${esc(p.name)}</strong><span>${esc(p.sku)} · ${D.available(p)} beschikbaar · ${D.ordered(state,p)} in bestelling</span></button>`).join('')+'</div>',a);return;}
      case 'order':{const o=state.orders.find(o=>o.id===a.id);open('Verkooporder · '+o.id,`<p>${esc(channelName(o.channel))} · ${esc(D.product(state,o.sku).name)}</p>`+metricCards([['Aantal',o.qty],['Orderbedrag',money(o.qty*o.unitPrice)],['Status',o.status]])+`<button type="button" data-open-article="${o.sku}">Open artikelkaart</button>`+(o.status==='Verzonden'?'':button(o.status==='Te picken'?'Order in verwerking zetten':'Voorbeeldorder als verzonden markeren')),a);return;}
      case 'signal':{const s=D.signalRows(state).find(s=>s.id===a.id);open(s.label,`<p>${esc(D.product(state,s.sku).name)} · ${esc(s.detail)}</p><div class="demo-dialog-links"><button type="button" data-open-article="${s.sku}">Artikelkaart bekijken</button><button type="button" data-modal-nav="${s.module}" data-sku="${s.sku}">Open relevante module</button></div>`+button('Signaal in demo afhandelen'),a);return;}
      case 'reopen-signal':state.signalsDone=state.signalsDone.filter(id=>id!==a.id);render();message('Signaal heropend.');return;
    }
  }
  const iconNames={data:'book',shop:'commerce',marketing:'advice',security:'automation'};
  const routeValue=item=>item[1]+'|'+(item[2]||'overzicht')+'|'+(item[3]||'');
  q('[data-demo-nav]').innerHTML=groups.map(([label,icon,items])=>`<details class="demo-nav-group"${label==='Overzicht'?' open':''}><summary><svg viewBox="0 0 24 24" aria-hidden="true"><use href="/assets/img/rubric-icons.svg#${iconNames[icon]||icon}"></use></svg>${esc(label)}</summary><div>${items.map(item=>`<button type="button" data-demo-route="${routeValue(item)}">${esc(item[0])}</button>`).join('')}</div></details>`).join('');
  q('[data-demo-select]').innerHTML=groups.map(([label,_,items])=>`<optgroup label="${esc(label)}">${items.map(item=>`<option value="${routeValue(item)}">${esc(item[0])}</option>`).join('')}</optgroup>`).join('');
  q('[data-demo-channel]').innerHTML='<option value="all">Alle marketplaces</option>'+D.channels.map(c=>`<option value="${c.id}">${esc(c.label)}</option>`).join('');
  q('[data-demo-nav]').addEventListener('click',e=>{const b=e.target.closest('[data-demo-route]');if(b)choose(...b.dataset.demoRoute.split('|'));});
  q('[data-demo-select]').addEventListener('change',e=>choose(...e.target.value.split('|')));
  root.querySelectorAll('[data-demo-view]').forEach(b=>b.addEventListener('click',()=>{work=b.dataset.demoView==='details';q('[data-demo-search]').value='';render();}));
  q('[data-demo-country]').addEventListener('change',event=>{rankCountry=event.target.value==='BE'?'BE':'NL';render();});
  q('[data-demo-search]').addEventListener('input',render);q('[data-demo-channel]').addEventListener('change',render);q('[data-demo-period]').addEventListener('change',render);
  q('[data-demo-growth]').addEventListener('change',e=>{state.growth=Math.max(-20,Math.min(40,Number(e.target.value)||0));render();});
  q('tbody').addEventListener('click',e=>{const p=e.target.closest('[data-article]');if(p){article(p.dataset.article);return;}const b=e.target.closest('[data-demo-row]');if(b){const r=rows[Number(b.dataset.demoRow)];action(r.action,r.sku);}});
  q('[data-demo-close]').addEventListener('click',()=>dialog.close());
  q('[data-demo-theme]').addEventListener('click',()=>{applyTheme(theme==='dark'?'light':'dark');if(current==='systeem')render();});
  q('[data-demo-menu]').addEventListener('click',()=>setMenu(!navOpen));
  q('[data-demo-menu-close]').addEventListener('click',()=>setMenu(false));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navOpen){setMenu(false);q('[data-demo-menu]').focus();}});
  window.addEventListener('resize',()=>setMenu(false));
  q('[data-demo-create]').addEventListener('click',()=>action({kind:'product-create'}));
  q('[data-demo-export]').addEventListener('click',()=>{
    const data=tableData(),withSKU=rows.some(r=>r.sku),headers=withSKU?['SKU',...data.headers]:data.headers;
    const blob=new Blob([D.csv(headers,rows.map(r=>withSKU?[r.sku||'',...r.cells]:r.cells))],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='webapp-demo-'+current+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    message('Het overzicht met fictieve gegevens is geëxporteerd.');
  });
  root.addEventListener('click',event=>{
    const image=event.target.closest('[data-studio-image]');if(image){const value=Number(image.dataset.studioImage);if([0,1,2].includes(value)){studioImage=value;render();}return;}
    if(event.target.closest('[data-studio-main]')){const project=studioState();project.order=[studioImage,...project.order.filter(i=>i!==studioImage)];project.approved=false;render();message('Hoofdbeeld gewijzigd in het concept.');return;}
    if(event.target.closest('[data-studio-reset]')){const project=studioState();project.order=[0,1,2];project.approved=false;studioImage=0;render();message('De oorspronkelijke beeldvolgorde is hersteld.');return;}
    if(event.target.closest('[data-studio-review]')){const project=studioState();open('Beoordeel de voorbeeldbeelden','<p>Bekijk de volledige set. Je bevestigt alleen deze lokale demoversie; er wordt niets gepubliceerd.</p><div class="demo-studio-review">'+project.order.map((kind,i)=>'<figure>'+studioSVG(studioSku,kind)+'<figcaption>'+(i===0?'Hoofdbeeld':esc(studioLabels[kind]))+'</figcaption></figure>').join('')+'</div>'+button('Beeldset in demo goedkeuren'),{kind:'studio-review',sku:studioSku,signature:JSON.stringify(project.order)});return;}
    if(event.target.closest('[data-studio-download]')){const blob=new Blob([studioSVG(studioSku,studioImage)],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=studioSku+'-voorbeeld-'+(studioImage+1)+'.svg';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Het schematische voorbeeld is gedownload.');return;}
    const route=event.target.closest('[data-route]');if(route){choose(...route.dataset.route.split('|'));return;}
    const openArticle=event.target.closest('[data-open-article]');if(openArticle&&!dialog.contains(openArticle)){article(openArticle.dataset.openArticle);return;}
    const review=event.target.closest('[data-advice-review]');if(review){D.reviewAdvice(state,review.dataset.adviceReview,review.dataset.decision);render();message('Je keuze bij het voorstel is bewaard.');return;}
    const proposal=event.target.closest('[data-advice-action]');if(proposal){const advice=D.adviceRows(state).find(a=>a.id===proposal.dataset.adviceAction);action({...advice.action,adviceId:advice.id},advice.sku);return;}
    if(event.target.closest('[data-demo-settings-reset]'))resetDemo();
  });
  root.addEventListener('change',event=>{if(event.target.matches('[data-demo-settings-theme]')){applyTheme(event.target.value);render();}if(event.target.matches('[data-studio-product]')&&D.product(state,event.target.value)){studioSku=event.target.value;studioImage=studioState().order[0];render();}});
  q('[data-demo-dialog-content]').addEventListener('click',e=>{
    const shipment=e.target.closest('[data-new-shipment]');if(shipment){action({kind:'shipment-create',id:shipment.dataset.newShipment});return;}
    const edit=e.target.closest('[data-edit-article]');if(edit){action({kind:'product-edit',id:edit.dataset.editArticle});return;}
    const nav=e.target.closest('[data-modal-nav]');if(nav){dialog.close();choose(nav.dataset.modalNav);q('[data-demo-search]').value=nav.dataset.sku;render();return;}
    const p=e.target.closest('[data-open-article]');if(p){article(p.dataset.openArticle);return;}
    const o=e.target.closest('[data-offer]');if(o){const prod=D.product(state,o.dataset.sku),index=D.channels.findIndex(c=>c.id===o.dataset.offer);D.setOffer(state,prod.sku,o.dataset.offer,prod.offers[index]==='published'?'disabled':'queued');action({kind:'offers',id:prod.sku},prod.sku);render();message('Voorbeeld-offerinstelling bijgewerkt; inschakelen gaat eerst naar de wachtrij.');return;}
    if(!e.target.closest('[data-commit]'))return;
    const previousDecision=active.adviceId?state.adviceReviews[active.adviceId]||'open':null;
    try{
      if(active.adviceId)D.reviewAdvice(state,active.adviceId,'approved');
      let text='Voorbeeldactie opgeslagen.';const value=Number(q('[data-action-value]')?.value);
      switch(active.kind){
        case 'studio-review':if(active.sku!==studioSku||active.signature!==JSON.stringify(studioState().order))throw new Error('Bekijk eerst de actuele beeldset.');studioState().approved=true;text='De voorbeeldbeeldset is beoordeeld. Er is niets gepubliceerd.';break;
        case 'count':D.countStock(state,active.sku,value);text='Telling opgeslagen; beschikbare voorraad en besteladvies zijn bijgewerkt.';break;
        case 'proposal':D.propose(state,active.sku,value);current='inkoop';work=true;q('[data-demo-search]').value='';text='Bestelvoorstel klaargezet. Open de bestelling om een ontvangst te registreren.';break;
        case 'receive-purchase':D.receivePurchase(state,active.id,value,active.receiptReference);text='Levering verwerkt; de openstaande bestelling en voorraad zijn bijgewerkt.';break;
        case 'receive-return':D.receiveReturn(state,active.id);text='Retourontvangst geregistreerd; verkoopbare voorraad bijgewerkt waar van toepassing.';break;
        case 'budget':D.setBudget(state,active.id,value);text='Voorbeeld-dagbudget aangepast na beoordeling.';break;
        case 'listing':D.updateProduct(state,active.sku,{title:q('[data-edit-title]').value,description:q('[data-edit-description]').value});D.product(state,active.sku).listing=100;text='Listingconcept bewaard in de demo.';break;
        case 'product-edit':D.updateProduct(state,active.sku,{name:q('[data-edit-name]').value,price:q('[data-edit-price]').value,cost:q('[data-edit-cost]').value});text='De artikelgegevens zijn bijgewerkt.';break;
        case 'product-create':D.addProduct(state,{name:q('[data-edit-name]').value,price:q('[data-edit-price]').value,cost:q('[data-edit-cost]').value,stock:q('[data-edit-stock]').value});current='producten';special='catalogus';work=false;text='Het nieuwe voorbeeldartikel staat in het assortiment.';break;
        case 'shipment-create':D.createShipment(state,active.sku,q('[data-shipment-destination]').value,value);current='logistiek';special='';work=true;text='Voorbeeldzending klaargezet; de voorraad is gereserveerd.';break;
        case 'shipment':D.receiveShipment(state,active.id);text='De voorbeeldzending is ontvangen; de externe voorraad is bijgewerkt.';break;
        case 'order':D.advanceOrder(state,active.id);text='De status van de voorbeeldorder is bijgewerkt.';break;
        case 'signal':D.completeSignal(state,active.id);text='Signaal afgehandeld; onderliggende omzet en voorraad zijn behouden.';break;
      }
      dialog.close();render();message(text);
    }catch(error){if(active.adviceId)state.adviceReviews[active.adviceId]=previousDecision;q('[data-demo-dialog-error]').textContent=error.message;}
  });
  function resetDemo(){state=D.createState();rankCountry='NL';studioSku='DEMO-1001';studioImage=0;q('[data-demo-period]').value='12';choose('dashboard');message('De oorspronkelijke voorbeeldgegevens zijn hersteld.');}
  q('[data-demo-reset]').addEventListener('click',resetDemo);
  setMenu(false);
  render();
})();
