const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {catalogue,base,includedModules,resolve,contactDraft,calculatorURL,quoteRows}=require('../assets/js/modular-webapp.js');
const screens=require('../content/module-screenshots.json');
const html=fs.readFileSync(path.join(__dirname,'../webapp-samenstellen/index.html'),'utf8');
const overview=fs.readFileSync(path.join(__dirname,'../modulaire-webapp/index.html'),'utf8');
const money=n=>'€ '+n.toLocaleString('nl-NL');
assert.deepEqual(includedModules,['omzet','voorraad','orders']);
const basic=resolve([]);assert.deepEqual(basic.modules,includedModules);assert.deepEqual(basic.extraModules,[]);
assert.equal(basic.setup,995);assert.equal(basic.monthly,149);assert.equal(basic.setupSubtotal,1194);assert.equal(basic.standardMonthly,179);
assert.deepEqual(resolve(['constructor','__proto__','<script>','documenten','planning']),basic,'Unknown IDs never add modules or fees');
const fees={"forecasting":[300,20],"inkoop":[500,40],"logistiek":[400,30],"producten":[300,20],"beeldstudio":[300,30],"marketing":[600,60],"financieel":[400,40],"wms":[800,100],"facturatie":[250,20],"controles":[200,20],"listing":[200,20]};
for(const id of includedModules){assert(catalogue[id].included);assert.equal(catalogue[id].setup,0);assert.equal(catalogue[id].monthly,0);assert.equal(catalogue[id].monthlyDiscount,0);}
for(const [id,[setup,monthly]] of Object.entries(fees)){assert.equal(monthly%10,0,'Expansion monthly fees are multiples of ten');assert.equal(catalogue[id].currentMonthly,monthly);assert.equal(catalogue[id].monthly,Math.round(monthly*1.2));assert.equal(catalogue[id].setup,setup);assert.equal(catalogue[id].monthly-catalogue[id].monthlyDiscount,monthly);}
assert.deepEqual(resolve(['beeldstudio']).extraModules,['beeldstudio'],'Studio can be chosen without Productbeheer');
assert.equal(resolve(['producten','listing','beeldstudio']).monthly,219,'Product management, listing and Studio sum to the advertised bundle');
assert(!catalogue.klantenservice&&!catalogue.picken,'WMS replaces the earlier offers');
const wms=resolve(['wms']);assert.equal(wms.setup,1795);assert.equal(wms.monthly,249);assert.deepEqual(wms.extraModules,['wms']);
assert.equal(catalogue.wms.setup,800);assert.equal(catalogue.wms.currentMonthly,100);
assert(html.includes('tijdelijke medewerkers'));assert(html.includes('Nederlands, Engels, Duits, Pools, Arabisch en Turks'));
for(const view of screens.wms)for(const device of ['mobile','desktop'])assert(fs.statSync(path.join(__dirname,'../assets/img/wms-examples',`${view.id}-${device}.png`)).size>1000);
const growth=resolve(['inkoop','logistiek','wms']);assert.equal(growth.setup,2695);assert.equal(growth.monthly,319);assert.equal(growth.setupSubtotal,3234);
const marketing=resolve(['marketing','listing']);assert.deepEqual(marketing.extraModules,['producten','marketing','listing']);assert.equal(marketing.setup,2095);assert.equal(marketing.monthly,249);
assert.deepEqual(resolve(['listing']).extraModules,['producten','listing']);assert.equal(resolve(['listing']).monthly,189);assert.deepEqual(resolve(['picken']).extraModules,[]);
const complete=resolve(Object.keys(catalogue));assert.equal(complete.modules.length,14);assert.equal(complete.setup,5245);assert.equal(complete.monthly,549);assert.equal(complete.setupSubtotal,6294);assert.equal(complete.standardMonthly,659);assert.equal(complete.monthlyDiscount,110);
const standardSetup={"forecasting":360,"inkoop":600,"logistiek":480,"producten":360,"beeldstudio":360,"marketing":720,"financieel":480,"wms":960,"facturatie":300,"controles":240,"listing":240};
const ids=Object.keys(catalogue);
for(let mask=0;mask<(1<<ids.length);mask++){
 const chosen=ids.filter((_,i)=>mask&(1<<i)),total=resolve(chosen);
 assert.equal(new Set(total.modules).size,total.modules.length);
 assert.deepEqual(total.modules.slice(0,3),includedModules);
 for(const id of total.modules)for(const required of catalogue[id].requires)assert(total.modules.indexOf(required)<total.modules.indexOf(id));
 assert.equal(total.setup,995+total.extraModules.reduce((n,id)=>n+fees[id][0],0));
 assert.equal(total.monthly,149+total.extraModules.reduce((n,id)=>n+fees[id][1],0));
 assert.equal(total.monthly,total.standardMonthly-total.monthlyDiscount);
 assert.equal(total.monthly%10,9,'Every fixed promotional package total ends in 9');
 assert.equal(total.setupSubtotal,1194+total.extraModules.reduce((n,id)=>n+standardSetup[id],0));
 assert(Math.abs((total.setupSubtotal/total.setup-1)*100-20)<1e-7,'Setup advice is derived at 20% above the payable price');
 assert(Math.abs((total.standardMonthly/total.monthly-1)*100-20)<.2,'Monthly advice is about 20% above the payable price');
 assert.equal(total.discount,total.setupSubtotal-total.setup);assert(total.discount>=0);
 assert.deepEqual(resolve([...chosen,...chosen]),total,'No duplicate module fees');
 const quote=quoteRows(total);assert.equal(quote.length,1+total.extraModules.length);
 assert.equal(quote.reduce((n,row)=>n+row.currentMonthly,0),total.monthly);
 assert.equal(quote.reduce((n,row)=>n+row.monthly,0),total.standardMonthly);
 assert.equal(quote.reduce((n,row)=>n+row.monthlyDiscount,0),total.monthlyDiscount);
 assert.equal(quote.reduce((n,row)=>n+row.setup,0),total.setup);
 assert.equal(quote.reduce((n,row)=>n+row.standardSetup,0),total.setupSubtotal);
}
assert.equal((html.match(/class="webapp-module-card"/g)||[]).length,14);
for(const id of ids){
 const card=html.match(new RegExp('<label class="webapp-module"><input[^>]*value="'+id+'"[\\s\\S]*?</label>'))?.[0];assert(card,id);
 if(catalogue[id].included){assert(card.includes('checked disabled'));assert(card.includes('€ 0 extra per maand'));}
 else {assert(card.includes('Nu '+money(fees[id][1])));assert(card.includes('<s>'+money(catalogue[id].monthly)+'</s>'));assert(card.includes('per maand'));assert(card.indexOf('Nu '+money(fees[id][1]))<card.indexOf('Advies <s>'),'Current module price is first');}
 assert(!card.includes(' inrichting'));assert(!card.includes('webapp-module-requires'));
 const combined=[...html.matchAll(/<article class="webapp-module-card">[\s\S]*?<\/article>/g)].map(x=>x[0]).find(c=>c.includes('value="'+id+'"'));
 assert(combined.includes('id="gegevens-'+id+'"'));assert(combined.includes('<summary>Meer info</summary>'));
 const details=combined.slice(combined.indexOf('<summary>Meer info</summary>'));
 if(catalogue[id].included)assert(details.includes('Inbegrepen in het startpakket'));
 else{assert(details.includes(money(fees[id][0])+' inrichting'));assert(details.includes('Advies <s>'+money(catalogue[id].monthly)+'</s>'));assert(details.includes(money(catalogue[id].monthlyDiscount)+' voordeel per maand'));}
 for(const device of ['mobile','desktop'])assert.equal((combined.match(new RegExp('data-screen-device="'+device+'"','g'))||[]).length,screens[id].length);
 for(const image of combined.matchAll(/<img[^>]*src="(\/assets\/img\/module-examples\/[^"]+)"/g))assert(fs.statSync(path.join(__dirname,'..',image[1].split('?')[0])).size>1000);
}
assert(html.includes('€ 995 inrichting'));assert(html.includes('€ 149 per maand'));
assert(!overview.includes('data-webapp-picker'));assert(!overview.includes('type="checkbox"'));assert.equal((overview.match(/class="webapp-module-choose"/g)||[]).length,14);
assert(overview.includes('webapp-demo-teaser-scroll'));assert(overview.includes('<iframe class="webapp-demo-frame"'));
assert(overview.includes(`Met alle ${ids.length} modules samen betaal je ${money(complete.setup)} inrichting en ${money(complete.monthly)} per maand.`));
assert(!overview.includes('€ 399 per maand'));assert(!overview.includes('alle tien modules'));
assert(html.indexOf('class="webapp-pricebar"')<html.indexOf('class="webapp-module-grid"'));assert(html.includes('data-price-details'));
assert.equal(calculatorURL(['omzet','omzet','__proto__']),'/webapp-samenstellen/#modules');assert.equal(calculatorURL(['marketing','marketing','<script>']),'/webapp-samenstellen/?modules=marketing#modules');
const contact=fs.readFileSync(path.join(__dirname,'../contact/index.html'),'utf8');assert(/<textarea id="webapp-modules"[^>]*\breadonly/.test(contact));
assert(/<textarea id="webapp-modules"[^>]*\bhidden/.test(contact));assert(contact.includes('data-module-quote'));
const draft=contactDraft(complete).replace(/\u00a0/g,' ');assert(draft.includes('Eenmalige inrichting: € 5.245'));assert(draft.includes('Per maand na korting: € 549'));assert(draft.length<=2000);
for(const page of ['modulaire-webapp','webapp-samenstellen','prijzen','contact'])assert.equal(fs.readFileSync(path.join(__dirname,'..',page+'.html'),'utf8'),fs.readFileSync(path.join(__dirname,'..',page,'index.html'),'utf8'),'Alias: '+page);
const pricing=fs.readFileSync(path.join(__dirname,'../prijzen/index.html'),'utf8'),starter=pricing.slice(pricing.indexOf('<article class="card pricing-card pricing-webapp-start">'),pricing.indexOf('<details class="pricing-more"><summary>Meer info en voorbeeldpakketten'));
assert(starter.includes('Vanaf</span> € 149'));assert(starter.includes('<strong>€ 995</strong>'));assert(starter.includes('href="/webapp-samenstellen/"'));
assert(pricing.indexOf('pricing-webapp-start')<pricing.indexOf('id="html-websites"'));
assert(pricing.includes('€ 319/mnd'));assert(pricing.includes('€ 549/mnd'));assert(pricing.includes('Alle modules € 549'));assert(!pricing.includes('Alle modules € 379'));
for(const vendor of ['MarktMentor','Channable','EffectConnect','Picqer','Logic4'])assert(pricing.includes(vendor));
console.log('Market pricing OK: three included modules, eleven expansion fees, all 16384 combinations, dependencies, advice derived at +20%, van/voor totals, read-only contact draft, aliases and advertised package examples.');

for(const match of pricing.matchAll(/<article><h3>(?:Verkoop en logistiek|Compleet)<\/h3>[\s\S]*?<strong>€ ([\d.]+) inrichting · € ([\d.]+)\/mnd<\/strong><a href="([^"]+)"/g)){
 const url=new URL(match[3],'https://opticore-insights.nl');const selection=resolve(url.searchParams.get('modules').split(','));
 assert.equal(selection.setup,Number(match[1].replaceAll('.','')));assert.equal(selection.monthly,Number(match[2].replaceAll('.','')));
 if(match[0].includes('<h3>Compleet</h3>'))assert.equal(selection.modules.length,14);
}

assert(!pricing.includes('Listingoptimalisatie valt onder Productbeheer'));assert(pricing.includes('Extra modules kosten € 20–€ 100 per maand'));

assert.equal(catalogue.orders.label,'Orders');assert(!html.includes('Orders en retouren'));assert(html.includes('Retourverwerking is maatwerk'));assert(!screens.orders.some(v=>v.page==='retouren'));

assert(contactDraft(complete).includes('Retourverwerking is maatwerk.'));assert(html.includes('Retourverwerking en retourkoppelingen zijn maatwerk'));
