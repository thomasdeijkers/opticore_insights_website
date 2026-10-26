const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { catalogue, base, resolve, contactDraft, calculatorURL } = require('../assets/js/modular-webapp.js');
const html = fs.readFileSync(path.join(__dirname, '../webapp-samenstellen/index.html'), 'utf8');
const overview = fs.readFileSync(path.join(__dirname, '../modulaire-webapp/index.html'), 'utf8');
const money = n => '€ ' + n.toLocaleString('nl-NL');
assert.deepEqual(resolve([]), { modules: [], setupSubtotal: 1500, discountRate: 0, discount: 0, setup: 1500, standardMonthly: 79, monthlyDiscount: 0, monthly: 79, usage: false });
assert.deepEqual(resolve(['forecasting']).modules, ['omzet', 'forecasting']);
assert.equal(resolve(['omzet', 'forecasting', 'voorraad']).setup, 3825);
assert.equal(resolve(['omzet', 'forecasting', 'voorraad']).monthly, 259);
const purchase = resolve(['inkoop']);
assert.deepEqual(purchase.modules, ['omzet', 'voorraad', 'inkoop']);
assert.equal(purchase.setup, 3825);
assert.equal(purchase.monthly, 259);
const combined = resolve(['forecasting', 'inkoop', 'logistiek', 'omzet', 'omzet']);
assert.equal(combined.modules.filter(id => id === 'omzet').length, 1);
assert.equal(combined.modules.filter(id => id === 'voorraad').length, 1);
assert.equal(combined.setup, 5600);
assert.equal(combined.monthly, 479);
assert.deepEqual(resolve(['<script>', '__proto__', 'constructor', 'unknown']), resolve([]));
assert.deepEqual(resolve(['documenten','planning']),resolve([]),'Removed construction/document modules are not offered');
for (const id of Object.keys(catalogue)) {
  const selected = resolve([id]);
  for (const required of catalogue[id].requires) {
    assert(selected.modules.indexOf(required) < selected.modules.indexOf(id), 'Predecessors precede ' + id);
  }
  const card = html.match(new RegExp('<label class="webapp-module"><input[^>]*value="'+id+'"[\\s\\S]*?</label>'))?.[0];
  assert(card, 'Public card: ' + id);
  assert(card.includes(money(catalogue[id].setup) + ' inrichting'), 'Visible setup price: ' + id);
  assert(card.includes('<s>' + money(catalogue[id].monthly) + ' per maand</s>'), 'Visible standard monthly price: ' + id);
  assert(card.includes('Nu ' + money(catalogue[id].monthly - catalogue[id].monthlyDiscount) + ' per maand'), 'Visible reduced monthly price: ' + id);
  assert(card.includes(money(catalogue[id].monthlyDiscount) + ' korting per maand'), 'Visible monthly discount: ' + id);
  for (const required of catalogue[id].requires) assert(card.includes(catalogue[required].label), 'Visible dependency: ' + id);
}
assert.equal(new Set(resolve(Object.keys(catalogue)).modules).size, 10);
assert.equal((html.match(/class="webapp-module-card"/g)||[]).length,10);
assert(!html.includes('<section class="section" id="gegevens-per-module"'),'No separate duplicate module explanation');
for (const id of Object.keys(catalogue)) {
  assert.equal(catalogue[id].monthly % 10, 0, 'Module fees are multiples of ten');
  const combinedCard = [...html.matchAll(/<article class="webapp-module-card">[\s\S]*?<\/article>/g)].map(match=>match[0]).find(card=>card.includes('value="'+id+'"'));
  assert(combinedCard?.includes('id="gegevens-'+id+'"'), 'Source explanation belongs to module '+id);
  assert(combinedCard.includes('<summary>Meer info</summary>'));
  assert.equal((combinedCard.match(/data-screen-device="mobile"/g)||[]).length,2);
  assert.equal((combinedCard.match(/data-screen-device="desktop"/g)||[]).length,2);
  for (const image of combinedCard.matchAll(/<img[^>]*src="(\/assets\/img\/module-examples\/[^"]+)"/g)) {
    assert(fs.statSync(path.join(__dirname,'..',image[1])).size>1000,'Real screenshot asset '+image[1]);
  }
}
const ids=Object.keys(catalogue);
for(let mask=0;mask<(1<<ids.length);mask++) {
  const selection=resolve(ids.filter((_,i)=>mask&(1<<i)));
  assert.equal(selection.monthly % 10,9,'Every selection total ends in nine');
  assert.equal(selection.monthly,selection.standardMonthly-selection.monthlyDiscount);
  assert(selection.monthlyDiscount>=selection.modules.length*10 && selection.monthlyDiscount<=selection.modules.length*30);
}
assert.equal(resolve(['omzet']).discountRate,0);
for(const [selected,rate] of [[['forecasting'],10],[['omzet','forecasting','voorraad'],10],[['forecasting','inkoop'],20],[['forecasting','inkoop','producten'],20],[['forecasting','inkoop','logistiek'],30]]) {
  const total=resolve(selected);assert.equal(total.discountRate,rate);
  assert.equal(total.discount,total.setupSubtotal*rate/100);
  assert.equal(total.setup,total.setupSubtotal-total.discount);
}
assert(html.includes('data-module-subtotal'));assert(html.includes('data-module-discount'));
assert(overview.includes('<iframe class="webapp-demo-frame"'));
assert(overview.indexOf('id="demo"')>overview.indexOf('id="kosten"'));
assert(fs.readFileSync(path.join(__dirname,'../contact/index.html'),'utf8').includes('<textarea id="webapp-modules"'),'Readable module draft field');
assert(html.includes(money(base.setup) + ' inrichting'));
assert(html.includes(money(base.monthly) + ' per maand'));
for (const page of ['modulaire-webapp', 'webapp-samenstellen', 'prijzen', 'contact']) {
  assert.equal(fs.readFileSync(path.join(__dirname, '..', page + '.html'), 'utf8'), fs.readFileSync(path.join(__dirname, '..', page, 'index.html'), 'utf8'), 'Canonical and HTML alias: ' + page);
}
console.log('Module pricing OK: public prices, prerequisites, order, deduplication, untrusted IDs and aliases.');

// Price-change contract: preserve the original rates and discount each unique module once.
const expectedFees={omzet:[60,10],forecasting:[100,20],voorraad:[60,10],inkoop:[100,20],logistiek:[100,20],producten:[80,20],orders:[80,20],marketing:[130,30],financieel:[80,20],controles:[40,10]};
for(const [id,[standard,saving]] of Object.entries(expectedFees)) {
  assert.equal(catalogue[id].monthly,standard,id+' standard price retained');
  assert.equal(catalogue[id].monthlyDiscount,saving,id+' approved monthly reduction');
}
assert.equal(resolve(['omzet','orders']).standardMonthly,219);
assert.equal(resolve(['omzet','orders']).monthlyDiscount,30);
assert.equal(resolve(['omzet','orders']).monthly,189);
assert.equal(resolve(['omzet','orders','omzet']).monthlyDiscount,30,'Duplicate selections never duplicate the discount');
assert.equal(resolve(['inkoop']).monthlyDiscount,40,'Required predecessor modules get the same discount');
assert.equal(resolve(ids).standardMonthly,909);
assert.equal(resolve(ids).monthlyDiscount,180);
assert.equal(resolve(ids).monthly,729);
const draft=contactDraft(resolve(['omzet','orders'])).replace(/\u00a0/g,' ');
for(const line of ['Standaard per maand: € 219','Maandkorting modules: − € 30','Per maand na korting: € 189','Bundelkorting (10%): − € 325','Eenmalige inrichting na korting: € 2.925']) assert(draft.includes(line),line);
assert(contactDraft(resolve(ids)).length<=1000,'Full selection fits the editable contact field');
assert(html.includes('data-module-monthly-standard')&&html.includes('data-module-monthly-discount'));
console.log('Monthly discount OK: original rates retained, reduced fees, dependencies, all combinations and contact totals.');

// The calculator has its own route; the overview stays useful without selection controls.
assert(!overview.includes('data-webapp-picker'));
assert(!overview.includes('type="checkbox"'));
assert.equal((overview.match(/class="webapp-module-choose"/g)||[]).length,10);
assert(html.indexOf('class="webapp-pricebar"')<html.indexOf('class="webapp-module-grid"'));
assert(html.includes('data-price-details'));
assert.equal(calculatorURL(['omzet','omzet','<script>','__proto__']),'/webapp-samenstellen/?modules=omzet#modules');
assert.equal(calculatorURL([]),'/webapp-samenstellen/#modules');
console.log('Dedicated calculator OK: separate overview, top price summary and safe selection routes.');
