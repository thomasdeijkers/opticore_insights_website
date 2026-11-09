/* Breadth audit of every current customer page/tab; local fictional data only. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const session=require('./demo_browser_session.cjs'),routes=require('../content/i18n/routes.json');
const base=new URL(process.env.DELIVERY_NEWS_QA_BASE||'http://127.0.0.1:8789/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});const result=[];try{
await Promise.all(['nl','en','de','fr'].map(async lang=>{
 const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'dark',reducedMotion:'reduce'});
 await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());await session(context,base);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const route=lang==='nl'?'/demo/modulaire-webapp/':routes['/demo/modulaire-webapp/'][lang];
 await page.goto(new URL(route+'?page=dashboard',base).href,{waitUntil:'networkidle'});await page.locator('.workspace-complete .workspace-root').waitFor();
 const pages=await page.evaluate(()=>Object.entries(DemoPageCatalogue.pages).flatMap(([id,p])=>(p.tabs?.length?p.tabs:[{id:''}]).map(t=>({id,tab:t.id}))));
 for(const width of [390,834,1440]){
  await page.setViewportSize({width,height:1000});
  for(const view of pages){
   const url=new URL(route,base);url.searchParams.set('page',view.id);if(view.tab)url.searchParams.set('tab',view.tab);
   await page.goto(url.href,{waitUntil:'load'});
   await page.waitForFunction(({id,tab})=>window.FullWorkspace?.mounted&&FullWorkspace.inspect().page===id&&(!tab||FullWorkspace.inspect().tab===tab),view);
   assert.equal(await page.locator('html').getAttribute('lang'),lang);
   assert((await page.locator('.workspace-complete .workspace-root').innerText()).trim().length>20,`${lang} ${width} ${view.id}/${view.tab}: empty view`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,`${lang} ${width} ${view.id}/${view.tab}: horizontal overflow`);
   assert.deepEqual(errors,[],`${lang} ${width} ${view.id}/${view.tab}`);
  }
  result.push({language:lang,width,pages:50,views:pages.length,errors:0});console.log(`PASS screen breadth: ${lang}, ${width}px, ${pages.length} page/tab views`);
 }
 await context.close();
}));
if(process.env.DEMO_AUDIT_OUTPUT)fs.writeFileSync(process.env.DEMO_AUDIT_OUTPUT,JSON.stringify(result,null,2)+'\n');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
