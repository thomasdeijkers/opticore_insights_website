/* Exercise the public picker in the browser; never submit the contact form. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const P=require('../assets/js/modular-webapp.js');
const base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8765/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
const normalized=text=>text.replace(/\u00a0/g,' '),money=n=>'€ '+n.toLocaleString('nl-NL');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const width of [320,390,844,1440]){
   const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
   await ctx.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const route of ['webapp-samenstellen/','webapp-samenstellen.html']){
    await page.goto(new URL(route,base).href,{waitUntil:'networkidle'});
    const picker=page.locator('[data-webapp-picker]');
    async function totals(ids){
     const selected=P.resolve(ids);
     for(const [selector,value] of [['[data-module-setup]',selected.setup],['[data-module-monthly]',selected.monthly],['[data-module-subtotal]',selected.setupSubtotal],['[data-module-monthly-standard]',selected.standardMonthly]]){
      for(const text of await picker.locator(selector).allTextContents())assert.equal(normalized(text),money(value),selector);
     }
     for(const [id,item] of Object.entries(P.catalogue)){
      const box=picker.locator(`input[value="${id}"]`);
      assert.equal(await box.isChecked(),selected.modules.includes(id),id);
      assert.equal(await box.isDisabled(),Boolean(item.included)||selected.modules.some(other=>P.catalogue[other].requires.includes(id)),id);
     }
     assert.equal(await picker.locator('[data-module-summary] li').count(),1+selected.extraModules.length);
     const contact=new URL(await picker.locator('[data-module-contact]').first().getAttribute('href'),base);
     assert.deepEqual(P.resolve(contact.searchParams.get('modules').split(',')).modules,selected.modules);
     assert.deepEqual(errors,[]);
    }
    async function reset(){const details=picker.locator('[data-price-details]');if(await details.getAttribute('open')===null)await details.locator(':scope>summary').click();await picker.locator('[data-module-reset]').click();}
    await totals([]);
    assert.equal(await picker.locator('.webapp-calculator-demo-panel').getAttribute('open'),null);
    assert.equal(await picker.locator('.webapp-cost-faq details').count(),8);
    await picker.locator('.webapp-cost-faq summary').first().click();assert(await picker.locator('.webapp-cost-faq details').first().getAttribute('open')!==null);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(width>560){
     const lines=await picker.locator('.webapp-module-card').evaluateAll(cards=>cards.map(card=>({row:Math.round(card.getBoundingClientRect().top),price:card.querySelector('.webapp-module-monthly').getBoundingClientRect().top})));
     for(const row of new Set(lines.map(line=>line.row))){const values=lines.filter(line=>line.row===row).map(line=>line.price);assert(Math.max(...values)-Math.min(...values)<1,'Monthly prices align within each grid row');}
    }
    // The reported combination also adds Productbeheer as Marketing's prerequisite.
    await picker.locator('input[value=marketing]').check();await totals(['marketing']);
    await picker.locator('input[value=logistiek]').check();await totals(['marketing','logistiek']);
    await page.reload({waitUntil:'networkidle'});await totals(['marketing','logistiek']);
    await picker.locator('input[value=marketing]').uncheck();await totals(['logistiek']);
    await reset();await totals([]);
    for(const id of Object.keys(P.catalogue).filter(id=>!P.catalogue[id].included)){
     await picker.locator(`input[value="${id}"]`).check();await totals([id]);
     await reset();await totals([]);
    }
    const extras=Object.keys(P.catalogue).filter(id=>!P.catalogue[id].included);
    for(const id of extras)await picker.locator(`input[value="${id}"]`).check();
    await totals(extras);
    const contact=await picker.locator('[data-module-contact]').first().getAttribute('href');
    await page.goto(new URL(contact,base).href,{waitUntil:'networkidle'});
    assert.equal(await page.locator('[data-module-quote] table').count(),2);
    const monthly=await page.locator('[data-module-quote] table').first().locator('tfoot strong').textContent();
    assert.equal(normalized(monthly),money(P.resolve(extras).monthly));assert.deepEqual(errors,[]);
   }
   await ctx.close();console.log('PASS calculator totals, dependencies, restore, reset and contact at '+width+'px');
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
