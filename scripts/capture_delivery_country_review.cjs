/* Private review thumbnails from the real local DOM; no public upload. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const session=require('./demo_browser_session.cjs'),routes=require('../content/i18n/routes.json');
const base=new URL(process.env.DELIVERY_NEWS_QA_BASE||'http://127.0.0.1:8789/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
const output=process.env.DELIVERY_NEWS_QA_OUTPUT;assert(output,'Choose a private output folder outside the repository');
assert(!path.resolve(output).startsWith(path.resolve(__dirname,'..')+path.sep));
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});try{
fs.mkdirSync(output,{recursive:true});
for(const lang of ['nl','en','de','fr']){
 const context=await browser.newContext({viewport:{width:1280,height:1400},deviceScaleFactor:1,colorScheme:'dark',reducedMotion:'reduce'});
 await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());await session(context,base);
 const page=await context.newPage();const route=lang==='nl'?'/demo/modulaire-webapp/':routes['/demo/modulaire-webapp/'][lang];
 await page.goto(new URL(route+'?page=dashboard&theme=dark',base).href,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const section=page.locator('.demo-country-breakdown:visible').first();await section.scrollIntoViewIfNeeded();
 for(const [index,name] of ['overzicht','nederland','belgie','duitsland'].entries()){
  await section.locator('details').evaluateAll(items=>items.forEach(el=>{el.open=false;}));
  if(index)await section.locator('details').nth(index-1).locator('summary').press('Enter');
  const file=path.join(output,`review-${lang}-${name}.jpg`);
  await section.screenshot({path:file,type:'jpeg',quality:40,scale:'css'});
  if(fs.statSync(file).size>39000)await section.screenshot({path:file,type:'jpeg',quality:25,scale:'css'});
  assert(fs.statSync(file).size<=40000,'Review payload size limit');
 }
 await context.close();
}
console.log('Captured sixteen private, fictional review thumbnails in four languages.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
