/* Forecast navigation regression with fictional data on localhost. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const session=require('./demo_browser_session.cjs'),routes=require('../content/i18n/routes.json');
const base=new URL(process.env.DELIVERY_NEWS_QA_BASE||'http://127.0.0.1:8791/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
const output=process.env.FORECAST_REVIEW_OUTPUT;
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const lang of ['nl','en','de','fr']){
   const context=await browser.newContext({colorScheme:'dark',reducedMotion:'reduce',deviceScaleFactor:1});
   await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
   await session(context,base);
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const route=lang==='nl'?'/demo/modulaire-webapp/':routes['/demo/modulaire-webapp/'][lang];
   for(const width of [390,834,1440]){
    await page.setViewportSize({width,height:1000});
    await page.goto(new URL(route+'?page=dashboard',base).href,{waitUntil:'networkidle'});
    const cards=page.locator('.demo-forecast-year:visible');
    await cards.first().waitFor();
    await page.waitForTimeout(120);
    const grossLabels={nl:'Brutowinst',en:'Gross profit',de:'Bruttogewinn',fr:'Bénéfice brut'};
    assert((await cards.first().locator('.demo-forecast-gross-profit').innerText()).startsWith(grossLabels[lang]));
    const values=await cards.evaluateAll(items=>items.map(item=>({year:Number(item.dataset.forecastYear),amounts:[...item.querySelectorAll('.demo-forecast-pair strong')].map(el=>el.textContent)})));
    assert.deepEqual(values.map(item=>item.year),[2026,2027]);
    for(const item of values){
     await page.locator('[data-forecast-year="'+item.year+'"]:visible').click();
     await page.waitForFunction(year=>FullWorkspace.inspect().page==='exploitatie'&&FullWorkspace.inspect().forecastYear===year,item.year);
     assert.equal(new URL(page.url()).searchParams.get('period'),String(item.year));
     const amounts=await page.locator('.workspace-metric strong').allTextContents();
     const locale={nl:'nl-NL',en:'en-GB',de:'de-DE',fr:'fr-FR'}[lang];
     const parts=new Intl.NumberFormat(locale).formatToParts(1234.5);
     const group=parts.find(part=>part.type==='group').value,decimal=parts.find(part=>part.type==='decimal').value;
     const amount=value=>Number(value.split(group).join('').replace(decimal,'.').replace(/[^0-9.-]/g,''));
     assert(Math.abs(amount(amounts[0])-amount(item.amounts[0]))<=.51&&Math.abs(amount(amounts[2])-amount(item.amounts[1]))<=.51,'Selected year uses the same revenue and EBIT as its dashboard card, allowing whole-euro card rounding');
     await page.reload({waitUntil:'networkidle'});
     assert.equal(await page.evaluate(()=>FullWorkspace.inspect().forecastYear),item.year,'Reload preserves the selected year');
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
     await page.goto(new URL(route+'?page=dashboard',base).href,{waitUntil:'networkidle'});
    }
    await page.locator('[data-forecast-year="2026"]:visible').click();
    await page.locator('[data-forecast-year="2027"]:visible').click();
    assert.equal(await page.evaluate(()=>FullWorkspace.inspect().forecastYear),2027);
    await page.locator('[data-full-tab="settings"]:visible').click();
    assert.equal(await page.locator('[data-w-form="fixed-costs"]').count(),1,'Existing settings remain accessible');
    await page.locator('[data-full-tab="stats"]:visible').click();
    assert.equal(await page.evaluate(()=>FullWorkspace.inspect().forecastYear),2027,'Switching tabs preserves the year');
    await page.locator('[data-w-action="reset-filters"]:visible').click();
    assert.equal(await page.evaluate(()=>FullWorkspace.inspect().forecastYear),null,'Reset returns to the existing finance period');

    await page.goto(new URL(route+'?page=exploitatie&tab=stats&period=1999',base).href,{waitUntil:'networkidle'});
    assert.equal(await page.evaluate(()=>FullWorkspace.inspect().forecastYear),null,'Invalid year uses the existing finance view');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
    console.log('PASS annual forecast '+lang+' '+width);
   }
   if(output){
    fs.mkdirSync(output,{recursive:true});await page.setViewportSize({width:1280,height:1000});
    await page.goto(new URL(route+'?page=dashboard',base).href,{waitUntil:'networkidle'});
    const section=page.locator('.demo-forecast-years:visible');await section.scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,'review-'+lang+'-cards.jpg'),type:'jpeg',quality:12});
    await page.locator('[data-forecast-year="2027"]:visible').click();
    await page.waitForTimeout(120);
    await page.screenshot({path:path.join(output,'review-'+lang+'-details.jpg'),type:'jpeg',quality:12});
   }
   assert.deepEqual(errors,[]);await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
