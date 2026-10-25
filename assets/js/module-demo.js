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
    controles:{label:'Signalen en controles',intro:'Voorraadtekorten, omzetdalers en publicatiefouten met artikelcontext.',views:['Open signalen','Afgehandeld'],note:'Signalen volgen de voorbeeldgegevens. Afhandelen wijzigt geen omzet of voorraad; je kunt ieder signaal heropenen.'}
  };
  const root=document.querySelector('[data-demo]');if(!root||!D)return;
  let state=D.createState();
  const params=new URLSearchParams(location.search);
  let current=Object.hasOwn(modules,params.get('module'))?params.get('module'):'omzet';
  let work=params.get('view')==='details';let rows=[];let active={};
  const q=selector=>root.querySelector(selector), esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const number=n=>new Intl.NumberFormat('nl-NL',{maximumFractionDigits:0}).format(n);
  const pct=n=>n===null?'—':new Intl.NumberFormat('nl-NL',{maximumFractionDigits:1}).format(n)+'%';
  const safeRatio=(a,b)=>b?a/b*100:null;
  const labels={published:'Offer gepubliceerd',failed:'Publicatiefout',disabled:'Niet gepubliceerd',queued:'In wachtrij'};
  const offer=status=>`<span class="offer-badge is-${status}" title="${labels[status]}"><b aria-hidden="true">${status==='published'?'✓':status==='failed'?'×':status==='queued'?'…':'−'}</b>${labels[status]}</span>`;
  const channelName=id=>D.channels.find(c=>c.id===id)?.label||id;
  const channelBrand=id=>{const c=D.channels.find(c=>c.id===id);return c?`<span class="channel-brand"><img src="${esc(c.logo)}" alt="${esc(c.label.replace(/ (NL|DE|BE)$/,''))}" width="74" height="27"><span class="channel-country" aria-label="${esc(c.country)}">${c.country}</span></span>`:esc(id);};
  const strip=document.createElement('div');strip.className='demo-channel-strip';strip.setAttribute('aria-label','Voorbeeldkanalen');strip.innerHTML=D.channels.map(c=>channelBrand(c.id)).join('');q('[data-demo-intro]').after(strip);
  const period=()=>Number(q('[data-demo-period]').value);
  const channel=()=>q('[data-demo-channel]').value;
  const stat=(label,value,note)=>({label,value,note});
  function fields() {
    const all=D.totals(state,period(),channel()), stock=state.products.reduce((n,p)=>n+D.available(p)*p.cost,0);
    const campaigns=state.campaigns.filter(c=>channel()==='all'||c.channel===channel());
    const costs=campaigns.reduce((n,c)=>n+c.cost,0),adsSales=campaigns.reduce((n,c)=>n+c.sales,0),net30=D.totals(state,1,channel()).revenue;
    switch(current){
      case 'omzet':return [stat('Netto omzet',money(all.revenue),period()+' maanden · na retouren'),stat('Marge',pct(safeRatio(all.profit,all.revenue)),money(all.profit)+' vóór advertenties'),stat('Verkocht',number(all.qty),'YoY netto omzet: '+pct(safeRatio(all.revenue-D.totals(state,period(),channel(),true).revenue,D.totals(state,period(),channel(),true).revenue)))];
      case 'forecasting':return [stat('Afzet komende 3 maanden',number(state.products.reduce((n,p)=>n+D.forecast(state,p),0))+' stuks','Recent volume × seizoensfactor'),stat('Voorraadtekort dreigt',state.products.filter(p=>D.coverage(p)!==null&&D.coverage(p)<p.lead).length+' artikelen','Dekking korter dan levertijd'),stat('Groeiscenario',pct(state.growth),'Pas het scenario hieronder aan')];
      case 'voorraad':return [stat('Magazijnvoorraadwaarde',money(stock),'Beschikbaar × inkoopprijs'),stat('Incourant',state.products.filter(p=>p.lastSale>180).length+' artikelen','Langer dan 180 dagen geen verkoop'),stat('Overstock',state.products.filter(p=>D.coverage(p)>180).length+' artikelen','Meer dan 180 dagen dekking')];
      case 'inkoop':return [stat('Besteladvies',money(state.products.reduce((n,p)=>n+D.need(state,p)*p.cost,0)),'Inclusief openstaande inkoop'),stat('In bestelling',number(state.purchases.filter(o=>!o.received).reduce((n,o)=>n+o.qty,0))+' stuks','Nog te ontvangen'),stat('Leveranciers',new Set(state.products.filter(p=>D.need(state,p)>0).map(p=>p.supplier)).size,'Met een bestelvoorstel')];
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
    switch(current){
      case 'omzet':return work?{headers:['Artikel / SKU','Netto omzet','Marge / YoY','Verkocht'],rows:productRows(p=>{const s=D.sales(state,p,month,ch);return {cells:[p.name,money(s.revenue),pct(safeRatio(s.profit,s.revenue))+' / '+pct(safeRatio(s.revenue-D.sales(state,p,month,ch,true).revenue,D.sales(state,p,month,ch,true).revenue)),number(s.qty)]};})}:{headers:['Marketplace','Netto omzet','Marge','Aandeel'],rows:D.channels.filter(c=>ch==='all'||c.id===ch).map(c=>{const s=D.totals(state,month,c.id),total=D.totals(state,month).revenue;return {brandCells:{0:c.id},cells:[c.label,money(s.revenue),pct(safeRatio(s.profit,s.revenue)),pct(safeRatio(s.revenue,total))],action:{kind:'channel',id:c.id,label:'Bekijk artikelen'}};})};
      case 'forecasting':return {headers:work?['Artikel / SKU','Laatste 3 mnd','Komende 3 mnd','Dekking']:['Artikel / SKU','Forecast 3 mnd','Beschikbaar','Besteladvies'],rows:productRows(p=>({cells:work?[p.name,number(p.history.slice(-3).reduce((a,b)=>a+b,0))+' stuks',number(D.forecast(state,p))+' stuks',D.coverage(p)===null?'Geen recente afzet':D.coverage(p)+' dagen']:[p.name,number(D.forecast(state,p))+' stuks',number(D.available(p)),number(D.need(state,p))+' stuks'],action:{kind:'proposal',id:p.sku,label:'Naar besteladvies'}}))};
      case 'voorraad':return {headers:work?['Artikel / SKU','Laatste verkoop','Dekking','Voorraadwaarde']:['Artikel / SKU','Beschikbaar','Gereserveerd','Extern'],rows:productRows(p=>({cells:work?[p.name,p.lastSale+' dagen geleden',D.coverage(p)===null?'Geen recente afzet':D.coverage(p)+' dagen',money(D.available(p)*p.cost)]:[p.name,number(D.available(p)),number(p.reserved),number(p.external)],action:{kind:'count',id:p.sku,label:'Voorraad tellen'}})).filter(r=>!work||D.product(state,r.sku).lastSale>180||D.coverage(D.product(state,r.sku))>180)};
      case 'inkoop':return work?{headers:['Bestelling','Artikel','Aantal','Status'],rows:state.purchases.map(o=>({sku:o.sku,cells:[o.id,D.product(state,o.sku).name,number(o.qty),o.status],action:o.received?null:{kind:'receive-purchase',id:o.id,label:'Ontvangst registreren'}}))}:{headers:['Artikel / SKU','Leverancier','Levertijd','Advies'],rows:productRows(p=>({cells:[p.name,p.supplier,p.lead+' dagen',number(D.need(state,p))+' stuks'],action:{kind:'proposal',id:p.sku,label:'Bestelvoorstel'}})).filter(r=>D.need(state,D.product(state,r.sku))>0)};
      case 'logistiek':return work?{headers:['Zending','Artikel','Bestemming','Status'],rows:state.shipments.map(s=>({sku:s.sku,cells:[s.id,D.product(state,s.sku).name,s.destination,s.status+' · '+s.qty+' stuks'],action:{kind:'shipment',id:s.id,label:'Zending bekijken'}}))}:{headers:['Artikel / SKU','Locatie','Fysiek','Beschikbaar'],rows:productRows(p=>({cells:[p.name,p.location,number(p.stock),number(D.available(p))],action:{kind:'count',id:p.sku,label:'Telling aanpassen'}}))};
      case 'producten':return work?{headers:['Artikel / SKU','Score','Controle','Voorstel'],rows:productRows(p=>({cells:[p.name,p.listing+'/100',p.listing<85?'Informatie aanvullen':'Gereed voor controle','Titel en kenmerken'],action:{kind:'listing',id:p.sku,label:'Bekijk listingvoorstel'}}))}:{headers:['Artikel / SKU','bol NL','Amazon NL','Overige kanalen'],rows:productRows(p=>({cells:[p.name,labels[p.offers[0]],labels[p.offers[1]],p.offers.slice(2).filter(s=>s==='published').length+' van 3 gepubliceerd'],action:{kind:'offers',id:p.sku,label:'Offers controleren'}}))};
      case 'orders':return work?{headers:['Retour','Artikel','Reden','Ontvangst'],rows:state.returns.filter(r=>ch==='all'||r.channel===ch).map(r=>({sku:r.sku,cells:[r.id,D.product(state,r.sku).name,r.reason,r.received?'Ontvangen':'Nog niet ontvangen'],action:r.received?null:{kind:'receive-return',id:r.id,label:'Retour ontvangen'}}))}:{headers:['Order','Marketplace','Artikel','Status'],rows:state.orders.filter(o=>ch==='all'||o.channel===ch).map(o=>({sku:o.sku,brandCells:{1:o.channel},cells:[o.id,channelName(o.channel),D.product(state,o.sku).name,o.status]}))};
      case 'marketing':return work?{headers:['Artikel / SKU','Positie','Vorige meting','Verandering'],rows:productRows(p=>({cells:[p.name,p.rank===null?'Niet gevonden':'#'+p.rank,p.previousRank===null?'—':'#'+p.previousRank,p.rank===null?'Geen positie':(p.previousRank-p.rank>0?'+':'')+(p.previousRank-p.rank)],action:{kind:'keywords',id:p.sku,label:'Zoekwoorden'}}))}:{headers:['Campagne','Kosten / omzet','ACoS / doel','Dagbudget'],rows:state.campaigns.filter(c=>ch==='all'||c.channel===ch).map(c=>({sku:c.sku,brandCells:{0:c.channel},cells:[c.name,money(c.cost)+' / '+money(c.sales),pct(c.cost/c.sales*100)+' / '+c.target+'%',money(c.budget)],action:{kind:'budget',id:c.id,label:'Budgetvoorstel'}}))};
      case 'financieel':return {headers:work?['Marketplace','Netto verkoop','Reserve (5%)','Verwacht tegoed']:['Marketplace','Netto omzet','Kanaal / verzending','Bijdrage'],rows:D.channels.filter(c=>ch==='all'||c.id===ch).map(c=>{const t=D.totals(state,month,c.id);return {brandCells:{0:c.id},cells:work?[c.label,money(t.revenue),money(t.revenue*.05),money(t.revenue-t.fee-t.revenue*.05)]:[c.label,money(t.revenue),money(t.fee+t.shipping),money(t.profit)],action:{kind:'channel',id:c.id,label:'Onderliggende artikelen'}};})};
      default:return {headers:['Signaal','Artikel','Prioriteit','Context'],rows:D.signalRows(state).filter(s=>s.done===work).map(s=>({sku:s.sku,cells:[s.label,D.product(state,s.sku).name,s.priority,s.detail],action:{kind:work?'reopen-signal':'signal',id:s.id,label:work?'Heropenen':'Signaal beoordelen'}}))};
    }
  }
  function chart() {
    let values,labels,title;
    if(['omzet','forecasting','marketing','financieel'].includes(current)){
      values=D.months.map((_,i)=>state.products.reduce((n,p)=>n+p.history[i]*(current==='forecasting'?1:p.price)*(channel()==='all'?1:p.weights[D.channels.findIndex(c=>c.id===channel())]||0),0));labels=D.months;title=current==='forecasting'?'Afzethistorie · 12 maanden':'Bruto verkooptrend · vóór retouren';
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
  function render() {
    const m=modules[current];q('[data-demo-title]').textContent=m.label;q('[data-demo-intro]').textContent=m.intro;q('[data-demo-note]').textContent=m.note;
    q('[data-demo-metrics]').innerHTML=fields().map(s=>`<article><span>${esc(s.label)}</span><strong>${esc(s.value)}</strong><small>${esc(s.note)}</small></article>`).join('');
    q('[data-demo-channel]').disabled=!['omzet','producten','orders','marketing','financieel'].includes(current);
    q('[data-demo-period]').disabled=!['omzet','financieel','orders'].includes(current);
    q('[data-demo-scenario]').hidden=current!=='forecasting';q('[data-demo-growth]').value=state.growth;
    q('[data-demo-overview]').hidden=work;chart();
    q('[data-demo-context]').hidden=current!=='financieel';
    if(current==='financieel'){const t=D.totals(state,period(),channel());q('[data-demo-context]').innerHTML='<h2>Exploitatie · kostenopbouw</h2>'+metricCards([['Inkoopwaarde',money(t.cost)],['Kanaalkosten',money(t.fee)],['Verzendkosten',money(t.shipping)],['Advertentiekosten',money(D.advertising(state,period(),channel()))],['Vaste kosten, toegerekend',money(420*period()*(channel()==='all'?1:t.revenue/D.totals(state,period()).revenue))],['Periode',period()+' maanden']]);}
    q('[data-demo-table-title]').textContent=m.views[work?1:0];
    const data=tableData(),query=q('[data-demo-search]').value.trim().toLocaleLowerCase('nl');
    rows=data.rows.filter(r=>!query||[...r.cells,r.sku,D.product(state,r.sku)?.ean].filter(Boolean).some(v=>String(v).toLocaleLowerCase('nl').includes(query)));
    q('thead').innerHTML='<tr>'+data.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')+'<th scope="col">Actie</th></tr>';
    q('tbody').innerHTML=rows.length?rows.map((r,index)=>'<tr>'+r.cells.map((cell,i)=>`<td data-label="${esc(data.headers[i])}">${r.brandCells?.[i]?channelBrand(r.brandCells[i])+(i===0&&r.sku?`<small class="channel-caption">${esc(cell)}</small>`:''):i===0&&r.sku?`<button class="demo-product-link" type="button" data-article="${esc(r.sku)}">${esc(cell)}<small>${esc(r.sku)}</small></button>`:esc(cell)}</td>`).join('')+`<td>${r.action?`<button type="button" data-demo-row="${index}">${esc(r.action.label)} →</button>`:r.sku?`<button type="button" data-article="${esc(r.sku)}">Artikelkaart →</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="5">Geen regels in deze selectie. Pas de zoekterm of het filter aan.</td></tr>';
    q('[data-demo-results]').textContent=rows.length+' voorbeeldregels';
    root.querySelectorAll('[data-demo-module]').forEach(b=>b.setAttribute('aria-current',b.dataset.demoModule===current?'page':'false'));
    root.querySelectorAll('[data-demo-view]').forEach(b=>{const index=b.dataset.demoView==='details'?1:0;b.textContent=m.views[index];b.setAttribute('aria-pressed',String((index===1)===work));});
    q('[data-demo-select]').value=current;
    history.replaceState(null,'','?'+new URLSearchParams({module:current,view:work?'details':'overzicht'}));
  }
  function choose(id){if(!Object.hasOwn(modules,id))return;current=id;work=false;q('[data-demo-search]').value='';q('[data-demo-channel]').value='all';q('[data-demo-status]').textContent='';render();}
  function message(text){q('[data-demo-status]').textContent=text+' Alleen in deze demo; er is niets naar een extern systeem verstuurd.';}
  const dialog=q('dialog');
  const metricCards=items=>'<div class="article-metrics">'+items.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')+'</div>';
  function article(sku){
    const p=D.product(state,sku);if(!p)return;
    const s=D.sales(state,p),margin=safeRatio(s.profit,s.revenue);
    const html=`<p class="demo-eyebrow">ARTIKELKAART · ${esc(p.sku)} · ${esc(p.ean)}</p><p>${esc(p.category)} · ${esc(p.supplier)} · locatie ${esc(p.location)}</p>`+metricCards([['Omzet 12 maanden',money(s.revenue)],['Marge',pct(margin)],['Beschikbaar',number(D.available(p))],['In bestelling',number(D.ordered(state,p))],['Afzetforecast 3 mnd',number(D.forecast(state,p))],['Dekking',D.coverage(p)===null?'Geen recente afzet':D.coverage(p)+' dagen']])+`<h3>Marketplace omzet en publicatiestatus</h3><div class="article-channels">`+D.channels.map((c,i)=>{const v=D.sales(state,p,12,c.id);return `<div>${channelBrand(c.id)}<span>${money(v.revenue)}</span>${offer(p.offers[i])}</div>`;}).join('')+`</div><h3>Afzet en bruto omzet · 12-maandentrend</h3><div class="article-history">`+D.months.map((label,i)=>`<div><span>${label}</span><strong>${money(p.history[i]*p.price)}</strong><small>${p.history[i]} stuks</small></div>`).join('')+`</div><div class="demo-dialog-links"><button type="button" data-modal-nav="inkoop" data-sku="${esc(sku)}">Besteladvies</button><button type="button" data-modal-nav="producten" data-sku="${esc(sku)}">Publicaties</button><button type="button" data-modal-nav="marketing" data-sku="${esc(sku)}">Ranking en advertenties</button></div>`;
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
      case 'receive-purchase':{const o=state.purchases.find(o=>o.id===a.id);open('Inkoopontvangst · '+o.id,`<p>Registreer ${o.qty} stuks ${esc(D.product(state,o.sku).name)} als ontvangen. In de echte app controleer je eerst de fysieke ontvangst en de bronbevestiging.</p>`+button('Voorbeeldontvangst bevestigen'),a);return;}
      case 'receive-return':{const r=state.returns.find(r=>r.id===a.id);open('Retourontvangst · '+r.id,`<p>Reden: ${esc(r.reason)}. ${r.sellable?'Opnieuw verkoopbaar: de demo boekt één stuk terug op magazijnvoorraad.':'Niet opnieuw verkoopbaar: magazijnvoorraad wordt niet verhoogd.'} Dit bevestigt geen terugbetaling.</p>`+button('Retour in demo ontvangen'),a);return;}
      case 'offers':open('Offerstatus · '+p.name,'<p>De kanaalstatus staat los van historische omzet. Deze knoppen simuleren alleen een offerinstelling.</p><div class="offer-controls">'+D.channels.map((c,i)=>`<div>${channelBrand(c.id)}${offer(p.offers[i])}<button type="button" data-offer="${c.id}" data-sku="${p.sku}">${p.offers[i]==='published'?'Uitschakelen':'Inschakelen (wachtrij)'}</button></div>`).join('')+'</div>',{...a,sku:p.sku});return;
      case 'listing':open('Listingvoorstel · '+p.name,`<p>Fictieve controlescore: ${p.listing}/100. Controleer titel, kenmerken en compleetheid vóór publicatie.</p><div class="listing-compare"><div><strong>Huidige titel</strong><p>${esc(p.name)}</p></div><div><strong>Voorstel</strong><p>${esc(p.name)} – slim bedienen, duidelijke installatie en compatibiliteitsinformatie</p></div></div><p>Een goedgekeurd concept is nog geen gepubliceerde marketplacewijziging.</p>`+button('Conceptvoorstel in demo goedkeuren'),{...a,sku:p.sku});return;
      case 'budget':{const c=state.campaigns.find(c=>c.id===a.id);open('Campagnevoorstel · '+c.name,metricCards([['ACoS',pct(c.cost/c.sales*100)],['Doel',c.target+'%'],['Dagbudget',money(c.budget)]])+'<p>Pas een voorbeeldbudget aan en bevestig het voorstel. Er wordt geen campagne gewijzigd bij een advertentieplatform.</p>'+numeric('Voorgesteld dagbudget in euro',c.budget,1,100)+button('Budgetvoorstel in demo goedkeuren'),a);return;}
      case 'keywords':open('Zoekwoorden · '+p.name,`<p>Ranking wordt per zoekwoord gevolgd; niet gevonden is geen nulpositie.</p><div class="keyword-example"><div><strong>${esc(p.name.toLowerCase())}</strong><span>${p.rank===null?'Niet gevonden':'#'+p.rank}</span></div><div><strong>${esc(p.category.toLowerCase())} slim bedienen</strong><span>${p.rank===null?'Nog niet gemeten':'#'+(p.rank+7)}</span></div></div><p>Vorige meting: ${p.previousRank===null?'onbekend':'#'+p.previousRank}. De artikelkaart verbindt deze metingen met omzet en voorraad.</p><button type="button" data-open-article="${p.sku}">Open artikelkaart</button>`,{...a,sku:p.sku});return;
      case 'shipment':{const s=state.shipments.find(s=>s.id===a.id);open('Fulfilmentzending · '+s.id,`<p>${s.qty} stuks naar ${esc(s.destination)} · ${esc(s.status)}.</p><p>Onderweg, externe voorraad en beschikbare magazijnvoorraad zijn afzonderlijke gegevens. Een voorraadverschil bij de marketplace is geen bevestigde zendingontvangst.</p>`,a);return;}
      case 'signal':{const s=D.signalRows(state).find(s=>s.id===a.id);open(s.label,`<p>${esc(D.product(state,s.sku).name)} · ${esc(s.detail)}</p><div class="demo-dialog-links"><button type="button" data-open-article="${s.sku}">Artikelkaart bekijken</button><button type="button" data-modal-nav="${s.module}" data-sku="${s.sku}">Open relevante module</button></div>`+button('Signaal in demo afhandelen'),a);return;}
      case 'reopen-signal':state.signalsDone=state.signalsDone.filter(id=>id!==a.id);render();message('Signaal heropend.');return;
    }
  }
  q('[data-demo-nav]').innerHTML=Object.entries(modules).map(([id,m],i)=>`<button type="button" data-demo-module="${id}"><span>${String(i+1).padStart(2,'0')}</span>${esc(m.label)}</button>`).join('');
  q('[data-demo-select]').innerHTML=Object.entries(modules).map(([id,m])=>`<option value="${id}">${esc(m.label)}</option>`).join('');
  q('[data-demo-channel]').innerHTML='<option value="all">Alle marketplaces</option>'+D.channels.map(c=>`<option value="${c.id}">${esc(c.label)}</option>`).join('');
  q('[data-demo-nav]').addEventListener('click',e=>{const b=e.target.closest('[data-demo-module]');if(b)choose(b.dataset.demoModule);});
  q('[data-demo-select]').addEventListener('change',e=>choose(e.target.value));
  root.querySelectorAll('[data-demo-view]').forEach(b=>b.addEventListener('click',()=>{work=b.dataset.demoView==='details';q('[data-demo-search]').value='';render();}));
  q('[data-demo-search]').addEventListener('input',render);q('[data-demo-channel]').addEventListener('change',render);q('[data-demo-period]').addEventListener('change',render);
  q('[data-demo-growth]').addEventListener('change',e=>{state.growth=Math.max(-20,Math.min(40,Number(e.target.value)||0));render();});
  q('tbody').addEventListener('click',e=>{const p=e.target.closest('[data-article]');if(p){article(p.dataset.article);return;}const b=e.target.closest('[data-demo-row]');if(b){const r=rows[Number(b.dataset.demoRow)];action(r.action,r.sku);}});
  q('[data-demo-close]').addEventListener('click',()=>dialog.close());
  q('[data-demo-dialog-content]').addEventListener('click',e=>{
    const nav=e.target.closest('[data-modal-nav]');if(nav){dialog.close();choose(nav.dataset.modalNav);q('[data-demo-search]').value=nav.dataset.sku;render();return;}
    const p=e.target.closest('[data-open-article]');if(p){article(p.dataset.openArticle);return;}
    const o=e.target.closest('[data-offer]');if(o){const prod=D.product(state,o.dataset.sku),index=D.channels.findIndex(c=>c.id===o.dataset.offer);D.setOffer(state,prod.sku,o.dataset.offer,prod.offers[index]==='published'?'disabled':'queued');action({kind:'offers',id:prod.sku},prod.sku);render();message('Voorbeeld-offerinstelling bijgewerkt; inschakelen gaat eerst naar de wachtrij.');return;}
    if(!e.target.closest('[data-commit]'))return;
    try{
      let text='Voorbeeldactie opgeslagen.';const value=Number(q('[data-action-value]')?.value);
      switch(active.kind){
        case 'count':D.countStock(state,active.sku,value);text='Telling opgeslagen; beschikbare voorraad en besteladvies zijn bijgewerkt.';break;
        case 'proposal':D.propose(state,active.sku,value);current='inkoop';work=true;q('[data-demo-search]').value='';text='Bestelvoorstel klaargezet. Open de bestelling om een ontvangst te registreren.';break;
        case 'receive-purchase':D.receivePurchase(state,active.id);text='Inkoopontvangst eenmaal verwerkt in de magazijnvoorraad.';break;
        case 'receive-return':D.receiveReturn(state,active.id);text='Retourontvangst geregistreerd; verkoopbare voorraad bijgewerkt waar van toepassing.';break;
        case 'budget':D.setBudget(state,active.id,value);text='Voorbeeld-dagbudget aangepast na beoordeling.';break;
        case 'listing':D.product(state,active.sku).listing=100;text='Listingconcept goedgekeurd. Dit publiceert geen product.';break;
        case 'signal':D.completeSignal(state,active.id);text='Signaal afgehandeld; onderliggende omzet en voorraad zijn behouden.';break;
      }
      dialog.close();render();message(text);
    }catch(error){q('[data-demo-dialog-error]').textContent=error.message;}
  });
  q('[data-demo-reset]').addEventListener('click',()=>{state=D.createState();q('[data-demo-period]').value='12';choose('omzet');});
  render();
})();
