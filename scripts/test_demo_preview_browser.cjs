/* Local-only checks: device selection must change the real, translated capture. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const routes=require('../content/i18n/routes.json');
const base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8878/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const language of ['nl','de','en','fr']) for(const route of ['/','/modulaire-webapp/']){
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
   await context.route('**/*',request=>new URL(request.request().url()).origin===base.origin?request.continue():request.abort());
   const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(new URL(language==='nl'?route:routes[route][language],base).href,{waitUntil:'networkidle'});
   const preview=page.locator('.webapp-demo-teaser'),controls=preview.locator('[data-demo-preview-controls]'),screen=preview.locator('.webapp-demo-teaser-scroll');
   assert(await controls.isVisible());assert.equal(await controls.locator('button').count(),3);
   const verify=async(device,type,ratio)=>{
    await page.waitForFunction(device=>{const image=document.querySelector('.webapp-demo-teaser img');return image.complete&&image.naturalWidth>0&&image.currentSrc.includes(`dashboard-client-${device}-dark.png`);},device);
    const box=await screen.boundingBox();assert(Math.abs(box.width/box.height-ratio)<.005);
    assert.equal(await preview.locator('.webapp-demo-device').evaluate(el=>getComputedStyle(el).getPropertyValue('--device-type').trim()),type);
    assert(await screen.evaluate(el=>el.scrollHeight>el.clientHeight));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const src=await preview.locator('img').evaluate(image=>image.currentSrc);
    if(language!=='nl')assert(src.includes(`/localized/${language}/`),'Use the current language’s screenshot');
   };
   await verify('desktop','laptop',16/10);
   for(const [device,type,ratio] of [['tablet','tablet',4/3],['mobile','phone',390/844],['desktop','laptop',16/10]]){
    const button=controls.locator(`[data-demo-preview-device=${device}]`);
    await button.click();await verify(device,type,ratio);
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    assert.equal(await controls.locator('[aria-pressed=true]').count(),1);
    assert.equal(await screen.evaluate(el=>el.scrollTop),0);
    await screen.evaluate(el=>el.scrollTop=150);assert(await screen.evaluate(el=>el.scrollTop>0));
   }
   // Native button keyboard activation must not navigate to the app.
   const mobileButton=controls.locator('[data-demo-preview-device=mobile]');
   await mobileButton.focus();await page.keyboard.press('Enter');await verify('mobile','phone',390/844);
   await page.setViewportSize({width:834,height:1112});assert(!(await controls.isVisible()));await verify('tablet','tablet',4/3);
   await page.setViewportSize({width:390,height:844});await verify('mobile','phone',390/844);
   await page.setViewportSize({width:844,height:390});await verify('tablet','tablet',4/3);
   await page.setViewportSize({width:1440,height:1000});await controls.waitFor({state:'visible'});await verify('mobile','phone',390/844);
   await controls.locator('[data-demo-preview-device=desktop]').click();await verify('desktop','laptop',16/10);
   const popupPromise=page.waitForEvent('popup');await screen.click({position:{x:50,y:50}});
   const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded');
   assert(new URL(popup.url()).pathname.includes(language==='nl'?'/demo/modulaire-webapp/':routes['/demo/modulaire-webapp/'][language]));
   await popup.close();assert.deepEqual(errors,[]);await context.close();
  }
  console.log('Device previews OK: home + WebApp in four languages; real captures, ratios, scroll, buttons/keyboard, automatic mobile/rotation and live-demo link.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
