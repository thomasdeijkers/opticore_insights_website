/* Local browser integration: language-specific real Olympus screens and rotation. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const routes=require('../content/i18n/routes.json');
const base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8876/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
const url=(canonical,lang)=>new URL(lang==='nl'?canonical:routes[canonical][lang],base).href;
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{for(const lang of ['nl','de','en','fr'])for(const [width,height,device] of [[1440,1000,'desktop'],[834,1112,'tablet'],[390,844,'mobile']]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const canonical of ['/projecten/olympus-bouw/','/nieuws/olympus-bouw-weekkosten-planning/','/nieuws/olympus-bouw-documentintake-hervatten/']){
    assert((await page.goto(url(canonical,lang),{waitUntil:'networkidle'})).ok());const gallery=page.locator('[data-screen-gallery]');assert.equal(await gallery.getAttribute('data-device'),device);
    const prefix=lang==='nl'?'/assets/img/examples/':'/assets/img/localized/'+lang+'/examples/';
    const srcs=await gallery.locator('[data-screen-device]').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
    assert(srcs.length===10&&srcs.every(s=>s.startsWith(prefix+'client-olympus-')&&s.includes('-dark.jpg')));
    const preview=gallery.locator(`[data-screen-device="${device}"]`).first();await preview.click();await page.locator('dialog.image-viewer[open]').waitFor();
    const image=page.locator('.image-viewer-stage img');await image.evaluate(i=>i.decode());assert((await image.getAttribute('src')).includes('-dashboard-'+device+'-dark.jpg'));
    await page.keyboard.press('ArrowRight');await image.evaluate(i=>i.decode());assert((await image.getAttribute('src')).includes('-planning-'+device+'-dark.jpg'));
    if(device==='mobile'){
     // The same open planning scene must follow a phone rotation to tablet.
     await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>document.querySelector('[data-screen-gallery]').dataset.device==='tablet');
     assert((await image.getAttribute('src')).includes('-planning-tablet-dark.jpg'));await image.evaluate(i=>i.decode());
     await page.setViewportSize({width,height});await page.waitForFunction(()=>document.querySelector('[data-screen-gallery]').dataset.device==='mobile');
    }
    await page.keyboard.press('Escape');assert.equal(await page.locator('dialog.image-viewer').isVisible(),false);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    if(canonical.startsWith('/projecten/')){await gallery.locator('[data-screen-open-all]').click();await image.evaluate(i=>i.decode());assert((await image.getAttribute('src')).includes('-dashboard-'+device+'-dark.jpg'));await page.keyboard.press('Escape');}
   }
   assert.deepEqual(errors,[]);console.log(lang+' '+device+': project and both news galleries, language, images, viewer and rotation OK');
  }finally{await context.close();}
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
