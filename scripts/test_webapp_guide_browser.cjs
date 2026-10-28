/* Buyer guidance must work with keyboard, native disclosures and localized navigation. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const routes=require('../content/i18n/routes.json'),base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8878/');
assert(['localhost','127.0.0.1'].includes(base.hostname));
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});try{
 for(const lang of ['nl','de','en','fr'])for(const width of [390,844,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(new URL(lang==='nl'?'/modulaire-webapp/':routes['/modulaire-webapp/'][lang],base).href,{waitUntil:'networkidle'});
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  const navigation=page.locator('.webapp-topic-nav'),details=page.locator('.webapp-more');
  assert.equal(await navigation.locator('a').count(),8);
  assert(await navigation.evaluate(nav=>[...nav.querySelectorAll('a')].every(a=>document.getElementById(a.hash.slice(1)))));
  assert.equal(await details.count(),12);assert.equal(await page.locator('.webapp-more[open]').count(),0);
  assert.equal(await page.locator('.webapp-knowledge-card .webapp-guide-icon[aria-hidden=true]').count(),12);
  for(const item of await details.all()){
   await item.locator('summary').focus();await page.keyboard.press('Enter');
   assert(await item.evaluate(el=>el.open));assert(await item.locator('div').isVisible());
   const name=await item.getAttribute('name');assert.equal(await page.locator(`details[name="${name}"][open]`).count(),1);
  }
  await navigation.locator('a[href="#beheer"]').click();
  assert.equal(new URL(page.url()).hash,'#beheer');
  const top=await page.locator('#beheer').evaluate(el=>el.getBoundingClientRect().top),header=await page.locator('.site-header').evaluate(el=>el.getBoundingClientRect().bottom);assert(top>=header-2,'Anchor hidden behind sticky header');
  assert.deepEqual((await page.locator('#praktijk a').evaluateAll(links=>links.map(a=>a.pathname))).sort(),['/projecten/smartlife-domotica/','/projecten/olympus-bouw/'].map(url=>lang==='nl'?url:routes[url][lang]).sort());
  assert(await page.locator('.webapp-topic-link').first().evaluate(el=>getComputedStyle(el).backgroundColor==='rgb(255, 243, 233)'));
  assert.equal(await page.locator('h1').count(),1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  if(lang!=='nl')assert(!(await page.locator('.webapp-knowledge').allTextContents()).join(' ').includes('Meer info'));
  await context.close();
 }
 console.log('WebApp guide OK: four languages at phone, tablet and desktop widths; keyboard disclosures, exclusive groups, icon semantics, topic targets, sticky-header navigation, own project links and no overflow.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
