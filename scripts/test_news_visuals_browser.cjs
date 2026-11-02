/* Regression for the empty news-logo column; localhost only, no external traffic. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright'),assert=require('node:assert/strict'),routes=require('../content/i18n/routes.json');
const base=new URL(process.env.NEWS_QA_BASE||'http://127.0.0.1:8787/');assert(['127.0.0.1','localhost'].includes(base.hostname));
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});try{
 for(const lang of ['nl','en','de','fr'])for(const width of [390,834,1440]){
  const context=await browser.newContext({viewport:{width,height:1000}});await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const home=lang==='nl'?'/':routes['/'][lang];await page.goto(new URL(home,base).href,{waitUntil:'networkidle'});
  const entries=page.locator('.home-updates .resource-list>li'),first=entries.first();await entries.locator('.news-brands img').evaluateAll(async images=>{for(const img of images){img.loading='eager';await img.decode();}});assert(await first.locator('.news-brands img').isVisible());
  const widths=await first.evaluate(el=>({entry:el.getBoundingClientRect().width,copy:el.querySelector('.news-entry-content').getBoundingClientRect().width}));assert(widths.copy>widths.entry*.55,lang+' '+width+' readable news width');
  const left=await entries.evaluateAll(nodes=>nodes.map(n=>n.querySelector('.news-entry-content').getBoundingClientRect().left));assert(Math.abs(left[0]-left[1])<2,'Old and new entries retain the same columns');
  // Even a future entry without media must use the full row, never the image column.
  await first.locator('.news-brands').evaluate(el=>el.remove());const fallback=await first.evaluate(el=>({entry:el.getBoundingClientRect().width,copy:el.querySelector('.news-entry-content').getBoundingClientRect().width}));assert(fallback.copy>fallback.entry*.95,'No-media fallback fills the row');
  const route='/nieuws/webapp-magazijn-omzet-inzicht/';await page.goto(new URL(lang==='nl'?route:routes[route][lang],base).href,{waitUntil:'networkidle'});
  assert(await page.locator('.news-identity .news-brands img').isVisible());const galleries=page.locator('.news-article [data-screen-gallery]');assert.equal(await galleries.count(),2);
  for(const gallery of await galleries.all()){const devices=width<=760?'mobile':width<=1100?'tablet':'desktop';const images=gallery.locator(`[data-screen-device=${devices}] img`);assert.equal(await images.count(),2);for(const img of await images.all())assert(await img.evaluate(el=>el.complete&&el.naturalWidth>0));}
  await galleries.first().locator('.screen-slide:visible').first().click();assert(await page.locator('dialog[open]').isVisible());await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
  console.log(`PASS consistent news identity/columns, no-media fallback, four responsive screenshots and viewer: ${lang} ${width}px`);await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
