const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { catalogue, base, resolve } = require('../assets/js/modular-webapp.js');
const html = fs.readFileSync(path.join(__dirname, '../modulaire-webapp/index.html'), 'utf8');
const money = n => '€ ' + n.toLocaleString('nl-NL');
assert.deepEqual(resolve([]), { modules: [], setup: 1500, monthly: 79, usage: false });
assert.deepEqual(resolve(['forecasting']).modules, ['omzet', 'forecasting']);
assert.equal(resolve(['omzet', 'forecasting', 'voorraad']).setup, 4250);
assert.equal(resolve(['omzet', 'forecasting', 'voorraad']).monthly, 296);
const purchase = resolve(['inkoop']);
assert.deepEqual(purchase.modules, ['omzet', 'voorraad', 'inkoop']);
assert.equal(purchase.setup, 4250);
assert.equal(purchase.monthly, 296);
const combined = resolve(['forecasting', 'inkoop', 'logistiek', 'omzet', 'omzet']);
assert.equal(combined.modules.filter(id => id === 'omzet').length, 1);
assert.equal(combined.modules.filter(id => id === 'voorraad').length, 1);
assert.equal(combined.setup, 8000);
assert.equal(combined.monthly, 573);
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
assert(html.includes(money(base.setup) + ' inrichting'));
assert(html.includes(money(base.monthly) + ' per maand'));
for (const page of ['modulaire-webapp', 'prijzen', 'contact']) {
  assert.equal(fs.readFileSync(path.join(__dirname, '..', page + '.html'), 'utf8'), fs.readFileSync(path.join(__dirname, '..', page, 'index.html'), 'utf8'), 'Canonical and HTML alias: ' + page);
}
console.log('Module pricing OK: public prices, prerequisites, order, deduplication, untrusted IDs and aliases.');
