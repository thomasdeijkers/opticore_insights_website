/* Native picklist model: partial/combined orders, assembly leaves, undo and stock isolation. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const D=require('../assets/js/marketplace-demo-data.js'),context={window:{}};
vm.runInNewContext(fs.readFileSync('assets/js/demo-picklist.js','utf8'),context);const P=context.window.DemoPicklist;
const state=D.createState(),client={},model=P.model(state,client,D),stock=JSON.stringify(state.products);
const initial=model.data(),mouse=initial.to_pick.find(r=>r.sku==='DEMO-1003');assert.equal(mouse.quantity,2);assert(initial.to_pick.some(r=>r.sku==='DEMO-1011'&&r.quantity===2));
assert(!initial.to_pick.some(r=>r.sku==='DEMO-SET-DESK'),'Assembly parent must be replaced by pickable components');
assert.equal(model.update(mouse.sku,true,1,'to_pick').remaining,1);let data=model.data();assert.equal(data.not_picked.find(r=>r.sku===mouse.sku).quantity,1);assert.equal(data.picked.find(r=>r.sku===mouse.sku).quantity,1);assert(!data.to_pick.some(r=>r.sku===mouse.sku));
const before=JSON.stringify(client);assert.throws(()=>model.update(mouse.sku,true,2,'not_picked'));assert.equal(JSON.stringify(client),before,'Invalid pick is atomic');
model.update(mouse.sku,true,1,'not_picked');data=model.data();assert.equal(data.picked.find(r=>r.sku===mouse.sku).quantity,2);assert(!data.not_picked.some(r=>r.sku===mouse.sku));assert.throws(()=>model.update(mouse.sku,true,1,'not_picked'),'Cannot duplicate completed quantity');
model.update(mouse.sku,false,0,'to_pick');assert.equal(model.data().to_pick.find(r=>r.sku===mouse.sku).quantity,2);
assert.equal(JSON.stringify(state.products),stock,'Picking does not change stock, prices or sales history');
state.orders.find(o=>o.id==='DEMO-O-2042').status='Verzonden';assert(!model.data().picked.some(r=>r.sku==='DEMO-1002'),'Dispatched orders leave the active pick list');
assert(!fs.readFileSync('assets/js/demo-picklist.js','utf8').includes('fetch('),'No native production transport in the public demo');
console.log('Picklist model OK: assembly expansion, per-line partial allocation, remainder handling, undo, duplicate rejection and stock isolation.');
