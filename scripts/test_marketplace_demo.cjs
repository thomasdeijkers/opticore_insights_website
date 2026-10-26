const assert=require('node:assert/strict');
const D=require('../assets/js/marketplace-demo-data.js');
const {catalogue}=require('../assets/js/modular-webapp.js');
const fs=require('node:fs'),path=require('node:path');
const s=D.createState(),p=D.product(s,'DEMO-1001');
const total=D.totals(s),channelSum=D.channels.reduce((n,c)=>n+D.totals(s,12,c.id).revenue,0);
assert(Math.abs(total.revenue-channelSum)<.0001,'Channel revenue reconciles with totals');
assert.equal(D.sales(s,p,12,'brico').revenue,0,'Zero-revenue channel remains in article data');
assert.equal(total.profit,total.revenue-total.cost-total.fee-total.shipping);
assert(D.sales(s,D.product(s,'DEMO-1004')).revenue<D.sales(s,D.product(s,'DEMO-1004'),12,'all',true).revenue,'Example includes a real YoY decliner');
assert.equal(D.available(p),p.stock-p.reserved);
assert.equal(D.coverage(D.product(s,'DEMO-1003')),null,'No recent sales is not zero-day coverage');
const before=p.stock,initialNeed=D.need(s,p),order=D.propose(s,p.sku,20);
assert.equal(D.ordered(s,p),20);assert(D.need(s,p)<initialNeed,'Open purchase reduces reorder advice');
const afterProposalNeed=D.need(s,p);
assert.equal(D.receivePurchase(s,order.id),true);assert.equal(p.stock,before+20);
assert.equal(D.ordered(s,p),0);assert.equal(D.need(s,p),afterProposalNeed,'Receipt transfers pipeline to available stock');
assert.equal(D.receivePurchase(s,order.id),false);assert.equal(p.stock,before+20,'No duplicate receipt');
assert.throws(()=>D.countStock(s,p.sku,p.reserved-1));assert.throws(()=>D.countStock(s,p.sku,-1));
D.countStock(s,p.sku,50);assert.equal(D.available(p),50-p.reserved);
const stock=p.stock;assert(D.receiveReturn(s,'DEMO-R-81'));assert.equal(p.stock,stock+1);
assert.equal(D.receiveReturn(s,'DEMO-R-81'),false);assert.equal(p.stock,stock+1);
const defective=D.product(s,'DEMO-1002'),defectiveStock=defective.stock;D.receiveReturn(s,'DEMO-R-82');assert.equal(defective.stock,defectiveStock,'Defective return is not sellable stock');
const forecast=D.forecast(s,p);s.growth=20;assert(D.forecast(s,p)>forecast,'Scenario changes real forecast computation');
D.setOffer(s,p.sku,'amazon_de','queued');assert.equal(p.offers[2],'queued');assert.throws(()=>D.setOffer(s,p.sku,'not-a-channel','published'));
D.setBudget(s,'C-1',25);assert.equal(s.campaigns[0].budget,25);assert.throws(()=>D.setBudget(s,'C-1',500));
const signal=D.signalRows(s).find(x=>!x.done),revenueBefore=D.totals(s).revenue;D.completeSignal(s,signal.id);D.completeSignal(s,signal.id);
assert.equal(s.signalsDone.filter(id=>id===signal.id).length,1);assert.equal(D.totals(s).revenue,revenueBefore,'Resolving a signal never deletes revenue');
assert(D.advertising(s,12)>D.advertising(s,1));assert.equal(D.createState().products[0].stock,before,'New demo state resets mutations');
// Partial deliveries move only the received quantity from pipeline to stock.
const partial=D.createState(),pending=partial.purchases[0],part=D.product(partial,pending.sku),partStock=part.stock;
assert(D.receivePurchase(partial,pending.id,25,'receipt-one'));
assert.equal(part.stock,partStock+25);assert.equal(D.ordered(partial,part),75);
assert.equal(pending.status,'Deels ontvangen');
assert.equal(D.receivePurchase(partial,pending.id,25,'receipt-one'),false,'Receipt reference cannot be applied twice');
assert.throws(()=>D.receivePurchase(partial,pending.id,76,'receipt-invalid'));
assert.equal(part.stock,partStock+25,'Invalid receipt leaves stock unchanged');
assert(D.receivePurchase(partial,pending.id));assert.equal(D.ordered(partial,part),0);assert.equal(part.stock,partStock+100);
// Fulfilment reserves local stock, then transfers ownership to external stock once.
const fulfil=D.createState(),fp=D.product(fulfil,'DEMO-1004'),availableBefore=D.available(fp),externalBefore=fp.external;
const shipment=D.createShipment(fulfil,fp.sku,'Amazon NL',10);
assert.equal(D.available(fp),availableBefore-10);
assert.throws(()=>D.createShipment(fulfil,fp.sku,'Amazon NL',availableBefore));
assert(D.receiveShipment(fulfil,shipment.id));assert.equal(D.available(fp),availableBefore-10);
assert.equal(fp.external,externalBefore+10);assert.equal(D.receiveShipment(fulfil,shipment.id),false);
// Catalogue edits do not rewrite historical revenue, costs or order prices.
const edit=D.createState(),ep=edit.products[0],salesBefore=D.sales(edit,ep),orderPrice=edit.orders[0].unitPrice;
D.updateProduct(edit,ep.sku,{price:99,cost:35});assert.deepEqual(D.sales(edit,ep),salesBefore);assert.equal(edit.orders[0].unitPrice,orderPrice);
assert.throws(()=>D.updateProduct(edit,ep.sku,{name:'Should not save',price:-1}));assert.equal(ep.name,'Thermostaat Luma','Failed edits are atomic');
assert.throws(()=>D.addProduct(edit,{name:'Invalid',price:20,cost:5,stock:1.5}));assert.equal(edit.products.length,6);
const added=D.addProduct(edit,{name:'Nieuw voorbeeldartikel',price:20,cost:5,stock:10});
assert.equal(added.sku,'DEMO-1007');assert.equal(D.sales(edit,added).revenue,0);assert(added.offers.every(status=>status==='disabled'));
const openOrder=edit.orders[0];assert(D.advanceOrder(edit,openOrder.id));assert.equal(openOrder.status,'In verwerking');
assert(D.advanceOrder(edit,openOrder.id));assert.equal(openOrder.status,'Verzonden');assert.equal(D.advanceOrder(edit,openOrder.id),false);
const advice=D.adviceRows(edit).find(a=>a.type==='Listing');D.reviewAdvice(edit,advice.id,'approved');
D.product(edit,advice.sku).listing=100;assert.equal(D.adviceRows(edit).find(a=>a.id===advice.id).decision,'approved','Reviewed proposal survives changed source data');
D.reviewAdvice(edit,advice.id,'open');assert.equal(D.adviceRows(edit).find(a=>a.id===advice.id).decision,'open');
assert.throws(()=>D.reviewAdvice(edit,advice.id,'unknown'));
const exported=D.csv(['Artikel','Tekst'],[['="formula"','A;B'],['normal','a"b']]);
assert(exported.startsWith('\ufeff'));assert(exported.includes('"\'=""formula"""'));assert(exported.includes('"A;B"'));assert(exported.includes('"a""b"'));
for(const c of D.channels)assert(fs.existsSync(path.join(__dirname,'..',c.logo)),'Local channel logo exists: '+c.label);
const source=fs.readFileSync(path.join(__dirname,'../assets/js/module-demo.js'),'utf8');
for(const key of Object.keys(catalogue))assert(source.includes(key+':{label:'),'Demo has priced marketplace module '+key);
assert(!source.includes('Planning en projecten'));assert(!source.includes('Documentverwerking'));
for(const key of Object.keys(catalogue)){
 for(const device of ['mobile','desktop'])for(const view of ['overzicht','details']){
  assert(fs.statSync(path.join(__dirname,`../assets/img/module-examples/${key}-${view}-${device}-dark.jpg`)).size>1000);
 }
}
const demoHtml=fs.readFileSync(path.join(__dirname,'../demo/modulaire-webapp/index.html'),'utf8');
assert(demoHtml.includes('data-demo-theme role="switch"'));assert(demoHtml.includes('noindex,follow'));
for(const file of ['modulaire-webapp.html','prijzen.html','webapp-samenstellen.html']){
 const page=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
 assert(page.includes('href="/demo/modulaire-webapp/"'),'Prominent standalone demo link on '+file);
}
console.log('Marketplace demo OK: all priced modules, reconciled figures, partial/duplicate receipts, fulfilment reservations, immutable sales history, article edits, order flow, advice history, CSV safety and demo entry links.');
