/* Local ranking interaction and responsive regression checks; fictional data only. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const session=require('./demo_browser_session.cjs');
const routes=require('../content/i18n/routes.json');
const base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8765/');
assert(['localhost','127.0.0.1'].includes(base.hostname));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const language of ['nl','de','en','fr'])for(const width of [390,834,1440]){
   const context=await browser.newContext({viewport:{width,height:900},colorScheme:'dark'});
   try{
    await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());await session(context,base);
    const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    const route=language==='nl'?'/demo/modulaire-webapp/':routes['/demo/modulaire-webapp/'][language];
    await p.goto(new URL(route+'?page=bol-ranking&theme=dark',base).href,{waitUntil:'networkidle'});
    await p.locator('.ranking-products').waitFor();
    const rows=p.locator('.ranking-products>.ranking-item');assert.equal(await rows.count(),12);
    assert(await p.locator('.ranking-photo img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)));
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    const unknown=p.locator('.ranking-products>.ranking-item[data-ranking-sku="DEMO-1003"]');assert.equal(await unknown.locator('.ranking-result>strong').textContent(),'—');
    await rows.first().locator('summary').first().click();assert.equal(await rows.first().locator('table tbody tr').count(),10);
    assert.equal((await rows.first().locator('table tbody td').nth(1).textContent()).trim(),await rows.first().locator('.ranking-result>strong').textContent());
    await p.locator('[data-w-form=rank-search] input').fill('DEMO-1001');await p.locator('[data-w-form=rank-search] button').click();assert.equal(await rows.count(),1);
    const oldPosition=await rows.first().locator('.ranking-result>strong').textContent();
    await p.locator('[data-w-action=rank-channel][data-id=amazon_de]').click();assert.notEqual(await rows.first().locator('.ranking-result>strong').textContent(),oldPosition);
    await p.locator('.ranking-view-tabs [data-full-tab=movers]').click();
    const fallers=p.locator('.ranking-mover-group').first();assert(await fallers.locator('.ranking-item').count());
    const change=await fallers.locator('.ranking-change').first().textContent();await p.locator('[data-w-action=rank-period][data-id="30"]').click();assert.notEqual(await fallers.locator('.ranking-change').first().textContent(),change);
    await fallers.locator('[data-w-action=rank-read]').first().click();assert.equal(await fallers.locator('.ranking-item').count(),0);
    await p.locator('.ranking-mover-group').nth(1).locator('[data-w-action=rank-focus]').first().click();assert.equal(await rows.count(),1);
    assert.equal(await p.locator('.ranking-view-tabs [data-full-tab=overview]').getAttribute('aria-current'),'page');
    await p.locator('[data-demo-theme]').click();assert.equal(await p.locator('html').getAttribute('data-theme'),'light');
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    assert.deepEqual(errors,[]);console.log('PASS ranking search, channels, details, lookbacks, read and article drilldown; '+language+' '+width+'px');
   }finally{await context.close();}
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
