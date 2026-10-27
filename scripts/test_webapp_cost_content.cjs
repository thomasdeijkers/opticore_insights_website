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
 const amounts=[...body.matchAll(/<td data-label="[^"]+">€ ([\d.]+)<\/td>/g)].map(m=>Number(m[1].replaceAll('.','')));
 assert.deepEqual(amounts,[result.setup,result.monthly,result.setup+12*result.monthly],id+' prices and first-year total');
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
console.log('Cost content OK: static answers, four resolved price examples, dependencies, yearly totals, schema, aliases and internal links.');
