/* Public cost answers must agree with the actual calculator, also without JS. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=require('../assets/js/modular-webapp.js');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'webapp-samenstellen.html'),'utf8');
assert.equal(html,fs.readFileSync(path.join(root,'webapp-samenstellen/index.html'),'utf8'));
assert.match(html,/<h1>Wat kost een webapp voor jouw bedrijf\?<\/h1>/);
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert.match(html,/<link rel="canonical" href="https:\/\/opticore-insights.nl\/webapp-samenstellen\/">/);
const rows=[...html.matchAll(/<tr data-cost-example="([^"]+)">([\s\S]*?)<\/tr>/g)];
assert.equal(rows.length,4);
for(const [,id,body] of rows){
 const href=body.match(/href="([^"]+)"/)[1],url=new URL(href,'https://opticore-insights.nl');
 assert.equal(url.pathname,'/webapp-samenstellen/');assert.equal(url.hash,'#modules');
 const result=P.resolve((url.searchParams.get('modules')||'').split(','));
 const euroValue=label=>Number(body.match(new RegExp('<td data-label="'+label+'">€ ([\\d.,]+)'))[1].replaceAll('.','').replace(',','.'));
 const total=result.setup+12*result.monthly;
 assert.equal(euroValue('Inrichting'),result.setup);
 assert.equal(euroValue('Per maand'),result.monthly);
 assert.equal(euroValue('Totaal eerste 12 maanden'),total);
 assert.equal(euroValue('Gemiddeld per maand in jaar 1'),Math.round(total*100/12)/100);
 assert.match(body,/eenmalig \+ 12 ×/);
 if(id==='marketing')assert(result.modules.includes('producten'),'Required Productbeheer is counted');
}
const data=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const page=data['@graph'].find(item=>item['@type']==='WebPage'),service=data['@graph'].find(item=>item['@type']==='Service');
assert.equal(page.mainEntity['@id'],service['@id']);assert.match(service.description,/Exclusief btw, AI- en databaseverbruik/);
assert(!data['@graph'].some(item=>item.aggregateRating||item['@type']==='FAQPage'));
const faq=html.match(/<div class="webapp-cost-faq">([\s\S]*?)<\/div><div class="actions">/)[1];
assert.equal((faq.match(/<details>/g)||[]).length,8);
assert.match(faq,/API-koppeling/);assert.match(faq,/maandelijkse kosten/);assert.match(faq,/volledig nieuwe applicatie op maat/);
for(const name of ['index.html','modulaire-webapp.html','prijzen.html'])assert.match(fs.readFileSync(path.join(root,name),'utf8'),/href="\/webapp-samenstellen\/"[^>]*>Bereken/);
// The dashboard offer is the same modular starter package, including its subscription.
const pricing=fs.readFileSync(path.join(root,'prijzen.html'),'utf8');
assert.equal(pricing,fs.readFileSync(path.join(root,'prijzen/index.html'),'utf8'));
const dashboard=pricing.match(/<article class="card pricing-card" id="dashboard">([\s\S]*?)<\/article>/)[1];
const euro=n=>'€ '+new Intl.NumberFormat('nl-NL').format(n);
assert(dashboard.includes(euro(P.base.setup)), 'Dashboard setup must match the starter package');
assert(dashboard.includes(euro(P.base.currentMonthly)), 'Dashboard subscription must match the starter package');
assert.match(dashboard,/<span>per maand<\/span>/);
assert.match(dashboard,/href="\/webapp-samenstellen\/"/);
assert(!pricing.includes('€ 2.495'), 'Do not advertise the obsolete dashboard starting price');
console.log('Cost content OK: static answers, four resolved price examples, dependencies, yearly totals, schema, aliases and internal links.');
