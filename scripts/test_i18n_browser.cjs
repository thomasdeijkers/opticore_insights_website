/* All checks run against localhost. Forms are inspected, never sent. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const P=require('../assets/js/modular-webapp.js'),demoSession=require('./demo_browser_session.cjs');
const routes=require('../content/i18n/routes.json');
const base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8768/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
const pageURL=(canonical,lang)=>new URL(lang==='nl'?canonical:routes[canonical][lang],base).href;
const languages=['nl','de','en','fr'],normalized=s=>s.replace(/\s+/g,' ').trim();
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const lang of languages){
   for(const width of [320,390,844,1440]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,lang+' '+width+' '+page.url());
    await page.goto(pageURL('/',lang),{waitUntil:'networkidle'});
    assert.equal(await page.locator('[data-site-language]').inputValue(),lang);
    await noOverflow();
    await page.locator('[data-menu-toggle]').click();
    assert.equal(await page.locator('[data-menu-toggle]').getAttribute('aria-expanded'),'true');
    if(lang!=='nl')assert(!(await page.locator('[data-menu]').innerText()).includes('Diensten'));
    await page.keyboard.press('Escape');
    await page.goto(pageURL('/webapp-samenstellen/',lang),{waitUntil:'networkidle'});
    const money=n=>normalized(new Intl.NumberFormat({nl:'nl-NL',de:'de-DE',en:'en-GB',fr:'fr-FR'}[lang],{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n));
    for(const ids of [[],['marketing'],['marketing','logistiek']]){
     if(ids.length)await page.locator(`input[value=${ids.at(-1)}]`).check();
     const selected=P.resolve(ids);
     for(const text of await page.locator('[data-module-monthly]').allTextContents())assert.equal(normalized(text),money(selected.monthly));
     for(const text of await page.locator('[data-module-setup]').allTextContents())assert.equal(normalized(text),money(selected.setup));
    }
    const chosen=page.url();
    const target=lang==='fr'?'en':'fr';
    await page.locator('[data-site-language]').selectOption(target);
    await page.waitForURL(u=>u.pathname===routes['/webapp-samenstellen/'][target],{waitUntil:'domcontentloaded'});
    assert.equal(new URL(page.url()).searchParams.get('modules'),new URL(chosen).searchParams.get('modules'));
    await page.waitForLoadState('networkidle');
    const contact=await page.locator('[data-module-contact]').first().getAttribute('href');
    assert(contact.startsWith(routes['/contact/'][target]));
    await page.goto(new URL(contact,base).href,{waitUntil:'networkidle'});
    assert.equal(await page.locator('input[name=language]').inputValue(),target);
    assert.equal(await page.locator('[data-module-quote] table').count(),2);
    assert.equal(await page.locator('#webapp-modules').getAttribute('readonly'),'');
    await noOverflow();assert.deepEqual(errors,[]);await context.close();
   }
   const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(pageURL('/demo/modulaire-webapp/',lang),{waitUntil:'networkidle'});
   await page.locator('[data-demo-menu]').click();assert(await page.locator('.demo-access-dialog').isVisible());
   const request=await page.locator('.demo-access-request a').getAttribute('href');
   assert(new URL(request,base).pathname===(lang==='nl'?'/contact/':routes['/contact/'][lang]));
   if(lang!=='nl')assert(!(await page.locator('.demo-access-dialog').innerText()).includes('Wachtwoord'));
   await page.locator('[data-access-close]').click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await demoSession(context,base);
   await page.reload({waitUntil:'networkidle'});
   await page.locator('.workspace-root').waitFor();
   await page.locator('[data-demo-menu]').click();
   const articlePage=page.locator('[data-full-page=omzet-artikelen]');
   await page.locator('.demo-nav-group').filter({has:articlePage}).locator(':scope>summary').click();
   await articlePage.click();
   assert.equal(await page.evaluate(()=>FullWorkspace.inspect().page),'omzet-artikelen');
   if(lang!=='nl')assert.equal(await page.locator('[data-demo-title]').textContent()==='Omzet artikelen',false);
   assert.deepEqual(errors,[]);await context.close();
   console.log(lang+': mobile/tablet/desktop, menu, pricing/dependencies, language switch with selection, read-only contact quote and gated demo OK.');
  }
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
  const page=await context.newPage();
  for(const [lang,query] of [['de','Lagerbestand'],['en','inventory'],['fr','stocks']]){
   await page.goto(pageURL('/zoeken/',lang)+'?q='+encodeURIComponent(query),{waitUntil:'networkidle'});
   await page.locator('[data-search-results] li').first().waitFor();
   const hrefs=await page.locator('[data-search-results] h2 a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
   assert(hrefs.length&&hrefs.every(h=>h.startsWith('/'+lang+'/')));
  }
  await context.close();console.log('Search: translated queries return only pages in the current language.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
