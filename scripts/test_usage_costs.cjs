const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const config=require('../content/usage-pricing.json'),{estimate}=require('../assets/js/usage-costs.js'),P=require('../assets/js/modular-webapp.js');
assert.equal(config.status,'indicative_proposal');assert.equal(config.vatIncluded,false);
for(const key of ['database','text','images']){
 const tiers=config[key];let previous=-1;
 for(const t of tiers){if(t.max!==null){assert(t.max>previous);previous=t.max;}assert(t.price===null||(Number.isFinite(t.price)&&t.price>=0));}
 assert.equal(tiers.at(-1).max,null);assert.equal(tiers.at(-1).price,null);
}
const small=estimate(config,{database:1,text:0,images:0},149);assert.equal(small.total,154);assert.equal(small.usage,5);
const boundaries=[[2,100,10,15],[2.1,101,11,50],[10,500,50,50],[10.1,501,51,140],[50,2000,200,140]];
for(const [database,text,images,expectedUsage] of boundaries)assert.equal(estimate(config,{database,text,images},149).usage,expectedUsage,'Single band per usage type, no cumulative tier charging');
for(const values of [{database:51,text:0,images:0},{database:1,text:2001,images:0},{database:1,text:0,images:201}]){const r=estimate(config,values,379);assert(r.needsQuote);assert.equal(r.total,null);assert.equal(r.usage,null,'Never display unknown consumption as free');}
for(const values of [{database:-1,text:0,images:0},{database:1,text:.5,images:0},{database:NaN,text:0,images:0}])assert.throws(()=>estimate(config,values,149));
assert.throws(()=>estimate(config,{database:0,text:0,images:0},NaN));
const complete=P.resolve(Object.keys(P.catalogue));assert(complete.usage);assert.equal(estimate(config,{database:1,text:0,images:0},complete.monthly).total,384);
assert.deepEqual(config.modules.map(m=>m.id),['omzet','voorraad','orders','producten','inkoop','marketing','logistiek','financieel','forecasting','controles']);
assert.equal(new Set(config.modules.map(m=>m.id)).size,10);
const page=fs.readFileSync(path.join(__dirname,'../gebruikskosten/index.html'),'utf8');
for(const key of ['database','text','images'])for(const t of config[key])assert(page.includes(t.label));
assert(page.includes('Voorstelstaffels'));assert(page.includes('5.000 tekens'));assert(page.includes('1.024 × 1.024'));assert(page.includes('niet bij elkaar op'));
for(const m of config.modules)assert(page.includes('id="usage-module-'+m.id+'"'));
for(const file of ['modulaire-webapp','webapp-samenstellen','prijzen']){const html=fs.readFileSync(path.join(__dirname,'..',file+'.html'),'utf8');assert(html.includes('exclusief AI- en databaseverbruik'));assert(html.includes('href="/gebruikskosten/"'));assert(!html.includes('hosting, database, back-ups'));}
assert.equal(page,fs.readFileSync(path.join(__dirname,'../gebruikskosten.html'),'utf8'));
assert(P.contactDraft(complete).includes('AI- en databaseverbruik'));
console.log('Usage pricing OK: database/text/image boundaries, zero AI, one band per category, unknown totals require a quote, shared database charged once, module scope, exclusions, contact summary and page aliases.');
