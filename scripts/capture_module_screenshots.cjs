const demoBrowserSession=require('./demo_browser_session.cjs');
/* Capture only the public, fictional local demo. No production data or APIs. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const ROOT=path.resolve(__dirname,'..'),plan=require('../content/module-screenshots.json');
const site=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8765/');
assert(['127.0.0.1','localhost'].includes(site.hostname),'Local captures only');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const [device,width,height,scale] of [['desktop',1280,900,2],['tablet',834,1112,2],['mobile',390,844,3]]){
   const requestedDevice=process.argv.find(arg=>arg.startsWith('--device='))?.split('=')[1];
   if(requestedDevice&&device!==requestedDevice)continue;
   let captured=0;
   const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:scale,colorScheme:'dark',reducedMotion:'reduce'});
   await ctx.route('**/*',route=>new URL(route.request().url()).origin===site.origin?route.continue():route.abort());
   await demoBrowserSession(ctx,site);
   for(const [module,views] of Object.entries(plan))for(const view of views){
    const requestedModule=process.argv.find(arg=>arg.startsWith('--module='))?.split('=')[1];
    if(requestedModule&&module!==requestedModule)continue;
    const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    const url=new URL('demo/modulaire-webapp/?'+new URLSearchParams({page:view.page,theme:'dark',...(view.tab?{tab:view.tab}:{})}),site);
    assert((await p.goto(url.href,{waitUntil:'networkidle'})).ok());
    await p.evaluate(()=>document.fonts.ready);
    assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');
    if(view.click)await p.locator(view.click).first().click();
    if(view.modal){const target=p.locator(view.modal).first(),parent=target.locator('xpath=ancestor::details').first();if(await parent.count()&&await parent.getAttribute('open')===null){const summary=parent.locator(':scope>summary');await summary.focus();await summary.press('Enter');}await target.click();await p.locator('dialog[open]').waitFor();}
    if(view.focus)await p.locator(view.focus).first().scrollIntoViewIfNeeded();
    await p.evaluate(async()=>{const images=[...document.images];images.forEach(img=>img.loading='eager');await Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=img.onerror=r;})));});
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,url.href);
    assert.deepEqual(errors,[],url.href);
    await p.screenshot({path:path.join(ROOT,`assets/img/module-examples/client-${module}-${view.id}-${device}-dark.jpg`),type:'jpeg',quality:94});
    await p.close();captured++;
   }
   await ctx.close();console.log(device+': '+captured+' dark demo screens captured.');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
