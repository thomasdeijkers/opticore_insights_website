/* Native-layout demo regression. Local fictional data; no production traffic. */
const assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const session=require('./demo_browser_session.cjs'),routes=require('../content/i18n/routes.json');
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
    const path=language==='nl'?'/demo/modulaire-webapp/':routes['/demo/modulaire-webapp/'][language];
    await p.goto(new URL(path+'?page=marketing-agent&theme=dark',base).href,{waitUntil:'networkidle'});
    const cards=p.locator('[data-reference-advice]');await cards.first().waitFor();const initial=await cards.count();assert(initial>3);
    assert.equal(await p.locator('.marketing-agent-filter-buttons [data-w-action=marketing-type]').count(),6);
    assert.equal(await p.locator('.marketing-advice-channel-filter').count(),6);
    await p.locator('[data-w-action=marketing-type][data-id=bids]').click();assert.equal(await cards.count(),1);
    await cards.first().locator('summary').click();assert(await cards.first().locator('.ads-facts').isVisible());
    await cards.first().locator('[data-w-action=advice-later]').click();assert.equal(await cards.count(),0);
    await p.locator('.marketing-agent-filter-panel>summary').click();await p.locator('[data-w-action=marketing-status][data-id=snoozed]').click();assert.equal(await cards.count(),1);
    await cards.first().locator('[data-w-action=advice-reopen]').click();assert.equal(await cards.count(),0);
    await p.locator('[data-w-action=marketing-status][data-id=open]').click();assert.equal(await cards.count(),1);
    await p.locator('[data-w-action=marketing-type][data-id=bids]').click();assert.equal(await cards.count(),initial);
    await p.locator('[data-w-form=marketing-search]').locator('..').locator('summary').click();await p.locator('[data-w-form=marketing-search] input').fill('DEMO-1003');await p.locator('[data-w-form=marketing-search] button').click();assert.equal(await cards.count(),1);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    await p.goto(new URL(path+'?page=ads-engine&theme=dark',base).href,{waitUntil:'networkidle'});
    const campaigns=p.locator('.ads-campaign');await campaigns.first().waitFor().catch(async error=>{console.error(language,width,errors,await p.locator('body').innerText());throw error;});assert.equal(await campaigns.count(),4);
    const value=await p.locator('.ads-total-metrics dd').first().textContent();await p.locator('[data-w-action=ads-period][data-id="7"]').click();assert.notEqual(await p.locator('.ads-total-metrics dd').first().textContent(),value);
    await p.locator('.reference-channel-overview>summary').click();await p.locator('[data-w-action=ads-channel][data-id=bol]').click();assert.equal(await campaigns.count(),2);
    const first=campaigns.first();await first.locator(':scope>summary').click();await first.locator('.reference-keywords>summary').click();assert.equal(await first.locator('tbody tr').count(),3);
    const wordButton=first.locator('[data-w-action=keyword-toggle]').first();await wordButton.click();assert.equal(Object.values(await p.evaluate(()=>FullWorkspace.inspect().client)).filter(x=>x===true).length>0,true);
    await first.locator('.ads-campaign-menu').first().locator('summary').click();await first.locator('[data-w-action=campaign-toggle]').click();
    await p.locator('.ads-tabs [data-full-tab=archive]').click();assert.equal(await campaigns.count(),1);
    await p.locator('[data-demo-theme]').click();assert.equal(await p.locator('html').getAttribute('data-theme'),'light');
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
    console.log('PASS native marketing filters, advice decisions, channel totals, lookbacks, campaign/keyword controls, archive, light theme: '+language+' '+width+'px');
   }finally{await context.close();}
  }
  for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:900},colorScheme:'dark'});await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());await session(context,base);
   const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(new URL('/demo/modulaire-webapp/',base).href,{waitUntil:'networkidle'});const pages=await p.evaluate(()=>Object.keys(FullWorkspace.catalogue.pages));
   for(const page of pages){
    await p.goto(new URL('/demo/modulaire-webapp/?page='+page,base).href,{waitUntil:'networkidle'});await p.locator('.workspace-complete .workspace-root').waitFor();assert.equal(await p.evaluate(()=>FullWorkspace.inspect().page),page);
    assert((await p.locator('.workspace-root').innerText()).trim().length>10,page);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,page+' '+width);
    assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--soft').trim()),'#031d45');
   }
   assert.deepEqual(errors,[]);console.log('PASS all '+pages.length+' customer demo pages: shared native palette, rendered content, no errors/overflow at '+width+'px');await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
