/* The roadmap must use the calculator's real selection, including dependencies. */
const assert=require('node:assert/strict');
const P=require('../assets/js/modular-webapp.js'),R=require('../assets/js/implementation-roadmap.js');
const extras=Object.keys(P.catalogue).filter(id=>!P.catalogue[id].included);
assert.deepEqual(Object.keys(R.effort).sort(),extras.slice().sort());
assert.deepEqual(Object.keys(R.preparation).sort(),Object.keys(P.catalogue).sort());
const base=R.plan([]);assert.deepEqual(base.selection.modules,P.resolve([]).modules);
assert.deepEqual([base.minWeeks,base.maxWeeks],[3,5]);
for(let mask=0;mask<2**extras.length;mask++){
 const ids=extras.filter((_,i)=>mask&(1<<i)),result=R.plan(ids);
 assert.deepEqual(result.selection,P.resolve(ids));
 assert.deepEqual(result.preparation.map(item=>item.id),result.selection.modules);
 assert(result.preparation.every(item=>item.text&&item.label===P.catalogue[item.id].label));
 assert(Number.isInteger(result.minWeeks)&&Number.isInteger(result.maxWeeks));
 assert(result.minWeeks>=base.minWeeks&&result.maxWeeks>=base.maxWeeks&&result.maxWeeks>=result.minWeeks);
 const link=new URL(R.roadmapURL(ids),'https://opticore-insights.nl');
 assert.equal(link.pathname,'/implementatie/');
 assert.deepEqual(P.resolve((link.searchParams.get('modules')||'').split(',')).modules,result.selection.modules);
}
const requested=['wms','listing','beeldstudio'],copy=requested.slice(),selected=R.plan(requested);
assert.deepEqual(requested,copy);
assert(selected.selection.modules.includes('wms')&&selected.selection.modules.includes('producten'));
assert.deepEqual(R.plan(['__proto__','constructor','<img src=x onerror=alert(1)>']),base);
assert.deepEqual(R.plan(null),base);
const full=R.plan(extras);assert(full.minWeeks>base.minWeeks&&full.maxWeeks>base.maxWeeks);
console.log('Implementation roadmap OK: all 2048 packages retain actual module dependencies, preparation and safe round-trip links; indicative ranges remain ordered; unknown input is ignored.');
