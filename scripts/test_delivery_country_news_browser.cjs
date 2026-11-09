/* Local-only article and country drilldown regression in every published language. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const session=require('./demo_browser_session.cjs'),routes=require('../content/i18n/routes.json');
const base=new URL(process.env.DELIVERY_NEWS_QA_BASE||'http://127.0.0.1:8789/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});try{
for(const lang of ['nl','en','de','fr'])for(const width of [390,834,1440]){
 const context=await browser.newContext({viewport:{width,height:1000},colorScheme:'dark',reducedMotion:'reduce'});
 await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
 await session(context,base);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const demo=lang==='nl'?'/demo/modulaire-webapp/':routes['/demo/modulaire-webapp/'][lang];
 await page.goto(new URL(demo+'?page=dashboard&theme=dark',base).href,{waitUntil:'networkidle'});
 assert.equal(await page.locator('html').getAttribute('lang'),lang);
 const countries=page.locator('.demo-country-breakdown:visible').first();
 await countries.scrollIntoViewIfNeeded();
 assert.equal(await countries.locator('.demo-country-row').count(),4);
 for(const row of await countries.locator('.demo-country-row').all()){
  await row.locator('summary').focus();await page.keyboard.press('Enter');
  assert(await row.evaluate(el=>el.open));
  const values=await row.evaluate(el=>({total:Number(el.querySelector('summary>b').textContent.replace(/\D/g,'')),channels:[...el.querySelectorAll('ul>li>strong')].map(i=>Number(i.childNodes[0].textContent.replace(/\D/g,'')))}));
  assert(Math.abs(values.channels.reduce((sum,n)=>sum+n,0)-values.total)<=(values.channels.length+1)/2,'Whole-euro display stays within rounding bounds');
  assert.equal(await row.locator('li>strong>small').count(),values.channels.length,'Every channel shows its share within the country');
  await page.keyboard.press('Enter');assert.equal(await row.evaluate(el=>el.open),false);
 }
 const expected=await page.evaluate(()=>{const D=window.MarketplaceDemo,s=D.createState(),rows=D.deliveryCountries(s);return {sum:Math.round(rows.reduce((sum,r)=>sum+r.revenue,0)*100),total:Math.round(D.totals(s,1).revenue*100)};});
 assert.equal(expected.sum,expected.total);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 const url='/nieuws/webapp-omzet-per-bezorgland/';
 await page.goto(new URL(lang==='nl'?url:routes[url][lang],base).href,{waitUntil:'networkidle'});
 assert.equal(await page.locator('html').getAttribute('lang'),lang);
 assert(await page.locator('.news-identity .news-brands img').isVisible());
 const galleries=page.locator('[data-module-gallery=bezorglanden]');assert.equal(await galleries.count(),2);
 const device=width<=760?'mobile':width<=1100?'tablet':'desktop';
 for(const gallery of await galleries.all()){
  const images=gallery.locator(`[data-screen-device=${device}] img`);assert.equal(await images.count(),2);
  await images.evaluateAll(async items=>{for(const img of items){img.loading='eager';await img.decode();}});
  if(lang!=='nl')for(const image of await images.all())assert((await image.getAttribute('src')).includes('/localized/'+lang+'/'));
 }
 await galleries.first().locator('.screen-slide:visible').first().click();assert(await page.locator('dialog[open]').isVisible());
 await page.keyboard.press('Escape');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 assert.deepEqual(errors,[]);
 if(process.env.DELIVERY_NEWS_QA_OUTPUT){fs.mkdirSync(process.env.DELIVERY_NEWS_QA_OUTPUT,{recursive:true});await page.screenshot({path:path.join(process.env.DELIVERY_NEWS_QA_OUTPUT,`article-${lang}-${width}.png`),fullPage:true});}
 console.log(`PASS delivery-country arithmetic, keyboard drilldowns, article images and viewer: ${lang} ${width}px`);
 await context.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
