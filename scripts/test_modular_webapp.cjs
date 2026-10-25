const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { catalogue, base, resolve } = require('../assets/js/modular-webapp.js');
const html = fs.readFileSync(path.join(__dirname, '../modulaire-webapp/index.html'), 'utf8');
const money = n => '€ ' + n.toLocaleString('nl-NL');
assert.deepEqual(resolve([]), { modules: [], setupSubtotal: 1500, discountRate: 0, discount: 0, setup: 1500, monthly: 79, usage: false });
assert.deepEqual(resolve(['forecasting']).modules, ['omzet', 'forecasting']);
assert.equal(resolve(['omzet', 'forecasting', 'voorraad']).setup, 3825);
assert.equal(resolve(['omzet', 'forecasting', 'voorraad']).monthly, 299);
const purchase = resolve(['inkoop']);
assert.deepEqual(purchase.modules, ['omzet', 'voorraad', 'inkoop']);
assert.equal(purchase.setup, 3825);
assert.equal(purchase.monthly, 299);
const combined = resolve(['forecasting', 'inkoop', 'logistiek', 'omzet', 'omzet']);
assert.equal(combined.modules.filter(id => id === 'omzet').length, 1);
assert.equal(combined.modules.filter(id => id === 'voorraad').length, 1);
assert.equal(combined.setup, 5600);
assert.equal(combined.monthly, 579);
assert.deepEqual(resolve(['<script>', '__proto__', 'constructor', 'unknown']), resolve([]));
assert.equal(resolve(['documenten']).usage, true);
for (const id of Object.keys(catalogue)) {
  const selected = resolve([id]);
  for (const required of catalogue[id].requires) {
    assert(selected.modules.indexOf(required) < selected.modules.indexOf(id), 'Predecessors precede ' + id);
  }
  const card = html.match(new RegExp('<label class="webapp-module"><input[^>]*value="'+id+'"[\\s\\S]*?</label>'))?.[0];
  assert(card, 'Public card: ' + id);
  assert(card.includes(money(catalogue[id].setup) + ' inrichting'), 'Visible setup price: ' + id);
  assert(card.includes(money(catalogue[id].monthly) + ' per maand'), 'Visible monthly price: ' + id);
  for (const required of catalogue[id].requires) assert(card.includes(catalogue[required].label), 'Visible dependency: ' + id);
}
assert.equal(new Set(resolve(Object.keys(catalogue)).modules).size, 12);
assert.equal((html.match(/class="webapp-module-card"/g)||[]).length,12);
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
  assert.equal(resolve(ids.filter((_,i)=>mask&(1<<i))).monthly % 10,9,'Every selection total ends in nine');
}
assert.equal(resolve(['omzet']).discountRate,0);
for(const [selected,rate] of [[['forecasting'],10],[['omzet','forecasting','voorraad'],10],[['forecasting','inkoop'],20],[['forecasting','inkoop','producten'],20],[['forecasting','inkoop','logistiek'],30]]) {
  const total=resolve(selected);assert.equal(total.discountRate,rate);
  assert.equal(total.discount,total.setupSubtotal*rate/100);
  assert.equal(total.setup,total.setupSubtotal-total.discount);
}
assert(html.includes('data-module-subtotal'));assert(html.includes('data-module-discount'));
assert(html.includes('<iframe class="webapp-demo-frame"'));
assert(html.indexOf('id="demo"')>html.indexOf('id="kosten"'));
assert(fs.readFileSync(path.join(__dirname,'../contact/index.html'),'utf8').includes('<textarea id="webapp-modules"'),'Readable module draft field');
assert(html.includes(money(base.setup) + ' inrichting'));
assert(html.includes(money(base.monthly) + ' per maand'));
for (const page of ['modulaire-webapp', 'prijzen', 'contact']) {
  assert.equal(fs.readFileSync(path.join(__dirname, '..', page + '.html'), 'utf8'), fs.readFileSync(path.join(__dirname, '..', page, 'index.html'), 'utf8'), 'Canonical and HTML alias: ' + page);
}
console.log('Module pricing OK: public prices, prerequisites, order, deduplication, untrusted IDs and aliases.');
