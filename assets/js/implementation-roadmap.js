(function () {
  'use strict';
  // Illustrative planning bands for configuring existing modules, not an SLA.
  const effort = {forecasting:1, inkoop:2, logistiek:2, producten:1, beeldstudio:2, marketing:3, financieel:2, controles:1, wms:2, facturatie:1, listing:1};
  const preparation = {
    omzet:'Verkoopkanalen, omzet, btw, inkoopkosten en marge afstemmen en vergelijken met de bron.',
    voorraad:'SKU’s, EAN’s, locaties en beschikbare voorraad controleren; verschillen tussen bronnen verklaren.',
    orders:'Orderregels, statussen, bedragen en levergegevens controleren. Retourverwerking blijft afzonderlijk maatwerk.',
    forecasting:'Verkoophistorie, seizoenen en voorraaddekking toetsen; een korte historie als beperking zichtbaar maken.',
    inkoop:'Leveranciers, inkoopprijzen, levertijden en bestelhoeveelheden afstemmen en bestelvoorstellen controleren.',
    logistiek:'Magazijnlocaties, tellingen en de beschikbare verzendkoppelingen inrichten en controleren.',
    producten:'Artikelnummers, EAN’s, kenmerken, varianten en publicatiestatussen op elkaar afstemmen.',
    beeldstudio:'Huisstijl, beeldbronnen en de reeks van zes beelden inrichten; AI-verbruik en publicatie controleren.',
    marketing:'Advertentieaccounts, zoekposities, budgetten, ACoS/TACoS en akkoordstappen controleren.',
    financieel:'Kanaalkosten, tegoeden en uitbetalingen onderscheiden en aansluiten op de bronbedragen.',
    controles:'Signalen, grenswaarden, eigenaren en vervolgstappen afspreken en meldingen praktisch testen.',
    wms:'Magazijnprocessen, ordergegevens, gebruikers en taalinstellingen afstemmen.',
    facturatie:'Factuurnummers, klantgegevens, btw en offerte- en factuurstatussen controleren.',
    listing:'Productgegevens, teksten en zoekwoorden inrichten; voorstellen beoordelen vóór publicatie.'
  };
  const pricing = typeof module !== 'undefined' && module.exports ? require('./modular-webapp.js') : window.WebappPricing;
  function plan(ids) {
    const selection = pricing.resolve(Array.isArray(ids) ? ids.filter(id=>typeof id==='string') : []);
    const points = selection.extraModules.reduce((sum,id)=>sum+effort[id],0);
    return {selection, minWeeks:3+Math.ceil(points/6), maxWeeks:5+Math.ceil(points/4),
      preparation:selection.modules.map(id=>({id,label:pricing.catalogue[id].label,text:preparation[id]}))};
  }
  function roadmapURL(ids) {
    const selected=pricing.resolve(Array.isArray(ids)?ids:[]),extra=selected.extraModules;
    return '/implementatie/'+(extra.length?'?'+new URLSearchParams({modules:extra.join(',')}):'');
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={plan,roadmapURL,effort,preparation};
  if(typeof document==='undefined')return;
  const root=document.querySelector('[data-implementation-roadmap]');if(!root||!pricing)return;
  const t=value=>window.SiteI18n?.text(value)||value;
  const url=value=>window.SiteI18n?.url(value)||value;
  const current=plan((new URLSearchParams(location.search).get('modules')||'').slice(0,500).split(','));
  root.querySelector('[data-roadmap-duration]').textContent=current.minWeeks+'–'+current.maxWeeks;
  root.querySelector('[data-roadmap-count]').textContent=String(current.selection.modules.length);
  root.querySelector('[data-roadmap-kind]').textContent=t(current.selection.extraModules.length?'Voorbeeld op basis van je gekozen modules':'Voorbeeld: het startpakket');
  const chips=root.querySelector('[data-roadmap-modules]'),focus=root.querySelector('[data-roadmap-preparation]');
  chips.replaceChildren();focus.replaceChildren();
  current.preparation.forEach(item=>{
    const chip=document.createElement('li');chip.textContent=t(item.label);chips.append(chip);
    const article=document.createElement('article'),heading=document.createElement('h3'),copy=document.createElement('p');
    heading.textContent=t(item.label);copy.textContent=t(item.text);article.append(heading,copy);focus.append(article);
  });
  root.querySelectorAll('[data-roadmap-edit]').forEach(link=>{link.href=url(pricing.calculatorURL(current.selection.extraModules));});
  const contact='/contact/?'+new URLSearchParams({onderwerp:'webapp',modules:current.selection.modules.join(',')})+'#contact-form';
  root.querySelectorAll('[data-roadmap-contact]').forEach(link=>{link.href=url(contact);});
})();
