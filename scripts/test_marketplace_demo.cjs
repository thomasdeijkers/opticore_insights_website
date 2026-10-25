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
for(const c of D.channels)assert(fs.existsSync(path.join(__dirname,'..',c.logo)),'Local channel logo exists: '+c.label);
const source=fs.readFileSync(path.join(__dirname,'../assets/js/module-demo.js'),'utf8');
for(const key of Object.keys(catalogue))assert(source.includes(key+':{label:'),'Demo has priced marketplace module '+key);
assert(!source.includes('Planning en projecten'));assert(!source.includes('Documentverwerking'));
for(const key of Object.keys(catalogue)){
 for(const device of ['mobile','desktop'])for(const view of ['overzicht','details']){
  assert(fs.statSync(path.join(__dirname,`../assets/img/module-examples/${key}-${view}-${device}.jpg`)).size>1000);
 }
}
console.log('Marketplace demo OK: shared articles, reconciled channels, YoY, reservations, purchase/return idempotency, stock, forecast, offers, budgets and signal history.');
