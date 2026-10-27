const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {catalogue,base,includedModules,resolve,contactDraft,calculatorURL}=require('../assets/js/modular-webapp.js');
const html=fs.readFileSync(path.join(__dirname,'../webapp-samenstellen/index.html'),'utf8');
const overview=fs.readFileSync(path.join(__dirname,'../modulaire-webapp/index.html'),'utf8');
const money=n=>'€ '+n.toLocaleString('nl-NL');
assert.deepEqual(includedModules,['omzet','voorraad','orders']);
const basic=resolve([]);assert.deepEqual(basic.modules,includedModules);assert.deepEqual(basic.extraModules,[]);
assert.equal(basic.setup,995);assert.equal(basic.monthly,149);assert.equal(basic.setupSubtotal,1244);assert.equal(basic.standardMonthly,186);
assert.deepEqual(resolve(['constructor','__proto__','<script>','documenten','planning']),basic,'Unknown IDs never add modules or fees');
const fees={forecasting:[200,20],inkoop:[300,30],logistiek:[400,40],producten:[300,40],marketing:[400,50],financieel:[250,30],controles:[150,20]};
for(const id of includedModules){assert(catalogue[id].included);assert.equal(catalogue[id].setup,0);assert.equal(catalogue[id].monthly,0);assert.equal(catalogue[id].monthlyDiscount,0);}
for(const [id,[setup,monthly]] of Object.entries(fees)){assert.equal(monthly%10,0,'Expansion monthly fees are multiples of ten');assert.equal(catalogue[id].setup,setup);assert.equal(catalogue[id].monthly-catalogue[id].monthlyDiscount,monthly);}
const growth=resolve(['inkoop','logistiek']);assert.equal(growth.setup,1695);assert.equal(growth.monthly,219);assert.equal(growth.setupSubtotal,2119);
const marketing=resolve(['marketing']);assert.deepEqual(marketing.extraModules,['producten','marketing']);assert.equal(marketing.setup,1695);assert.equal(marketing.monthly,239);
const complete=resolve(Object.keys(catalogue));assert.equal(complete.modules.length,10);assert.equal(complete.setup,2995);assert.equal(complete.monthly,379);assert.equal(complete.setupSubtotal,3745);assert.equal(complete.standardMonthly,475);assert.equal(complete.monthlyDiscount,96);
const standardSetup={forecasting:250,inkoop:375,logistiek:500,producten:375,marketing:500,financieel:313,controles:188};
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
 assert.equal(total.setupSubtotal,1244+total.extraModules.reduce((n,id)=>n+standardSetup[id],0));
 assert(Math.abs(total.discountRate-20)<.2,'Setup promotion remains about 20% for every selection');
 assert(Math.abs(total.monthlyDiscount/total.standardMonthly*100-20)<1.1,'Monthly promotion remains about 20% for every selection');
 assert.equal(total.discount,total.setupSubtotal-total.setup);assert(total.discount>=0);
 assert.deepEqual(resolve([...chosen,...chosen]),total,'No duplicate module fees');
}
assert.equal((html.match(/class="webapp-module-card"/g)||[]).length,10);
for(const id of ids){
 const card=html.match(new RegExp('<label class="webapp-module"><input[^>]*value="'+id+'"[\\s\\S]*?</label>'))?.[0];assert(card,id);
 if(catalogue[id].included){assert(card.includes('checked disabled'));assert(card.includes('€ 0 extra per maand'));}
 else {assert(card.includes('Nu '+money(fees[id][1])));assert(card.includes('<s>'+money(catalogue[id].monthly)+'</s>'));assert(card.includes('per maand'));}
 assert(!card.includes(' inrichting'));assert(!card.includes('webapp-module-requires'));
 const combined=[...html.matchAll(/<article class="webapp-module-card">[\s\S]*?<\/article>/g)].map(x=>x[0]).find(c=>c.includes('value="'+id+'"'));
 assert(combined.includes('id="gegevens-'+id+'"'));assert(combined.includes('<summary>Meer info</summary>'));
 const details=combined.slice(combined.indexOf('<summary>Meer info</summary>'));
 if(catalogue[id].included)assert(details.includes('Inbegrepen in het startpakket'));
 else{assert(details.includes(money(fees[id][0])+' inrichting'));assert(details.includes('<s>'+money(catalogue[id].monthly)+' per maand</s>'));}
 for(const device of ['mobile','desktop'])assert.equal((combined.match(new RegExp('data-screen-device="'+device+'"','g'))||[]).length,2);
 for(const image of combined.matchAll(/<img[^>]*src="(\/assets\/img\/module-examples\/[^"]+)"/g))assert(fs.statSync(path.join(__dirname,'..',image[1])).size>1000);
}
assert(html.includes('€ 995 inrichting'));assert(html.includes('€ 149 per maand'));
assert(!overview.includes('data-webapp-picker'));assert(!overview.includes('type="checkbox"'));assert.equal((overview.match(/class="webapp-module-choose"/g)||[]).length,10);
assert(overview.includes('webapp-demo-teaser-scroll'));assert(overview.includes('<iframe class="webapp-demo-frame"'));
assert(html.indexOf('class="webapp-pricebar"')<html.indexOf('class="webapp-module-grid"'));assert(html.includes('data-price-details'));
assert.equal(calculatorURL(['omzet','omzet','__proto__']),'/webapp-samenstellen/#modules');assert.equal(calculatorURL(['marketing','marketing','<script>']),'/webapp-samenstellen/?modules=marketing#modules');
const contact=fs.readFileSync(path.join(__dirname,'../contact/index.html'),'utf8');assert(/<textarea id="webapp-modules"[^>]*\breadonly/.test(contact));
const draft=contactDraft(complete).replace(/\u00a0/g,' ');assert(draft.includes('Eenmalige inrichting: € 2.995'));assert(draft.includes('Per maand na korting: € 379'));assert(draft.length<=1000);
for(const page of ['modulaire-webapp','webapp-samenstellen','prijzen','contact'])assert.equal(fs.readFileSync(path.join(__dirname,'..',page+'.html'),'utf8'),fs.readFileSync(path.join(__dirname,'..',page,'index.html'),'utf8'),'Alias: '+page);
const pricing=fs.readFileSync(path.join(__dirname,'../prijzen/index.html'),'utf8'),starter=pricing.slice(pricing.indexOf('<article class="card pricing-card pricing-webapp-start">'),pricing.indexOf('<details class="pricing-more"><summary>Meer info en voorbeeldpakketten'));
assert(starter.includes('Vanaf</span> € 149'));assert(starter.includes('<strong>€ 995</strong>'));assert(starter.includes('href="/webapp-samenstellen/"'));
assert(pricing.indexOf('pricing-webapp-start')<pricing.indexOf('id="html-websites"'));
assert(pricing.includes('€ 219/mnd'));assert(pricing.includes('€ 379/mnd'));
for(const vendor of ['MarktMentor','Channable','EffectConnect','Picqer','Logic4'])assert(pricing.includes(vendor));
console.log('Market pricing OK: three included modules, seven expansion fees, all 1024 combinations, dependencies, approximately 20% promotions, van/voor totals, read-only contact draft, aliases and advertised package examples.');
