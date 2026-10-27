const demoBrowserSession=require('./demo_browser_session.cjs');
/* Orientation regression checks against the local public demo only. */
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8765/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  await ctx.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
  await demoBrowserSession(ctx,base);
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const rotate=async(width,height)=>{await p.setViewportSize({width,height});await p.waitForTimeout(120);};
  const imageDevice=async device=>{await p.waitForFunction(device=>document.querySelector('.webapp-demo-teaser-scroll img').currentSrc.includes(`dashboard-client-${device}-dark.png`),device);};
  const noOverflow=async()=>assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  for(const route of ['', 'modulaire-webapp/']){
   await rotate(390,844);await p.goto(new URL(route,base).href,{waitUntil:'networkidle'});await imageDevice('mobile');
   for(const [width,height] of [[844,390],[667,375],[568,320],[1194,430]]){
    await rotate(width,height);await imageDevice('tablet');
    const card=await p.locator('.webapp-demo-teaser').boundingBox();assert(card.width>Math.min(500,width-100),'Landscape preview uses the available width');
    assert((await p.locator('.webapp-demo-teaser-scroll').boundingBox()).height<=420);await noOverflow();
   }
   await rotate(390,844);await imageDevice('mobile');await noOverflow();
  }
  console.log('PASS phone rotation: both teasers select tablet captures and widen in landscape, then return to mobile.');
  const details=p.locator('#gegevens-producten'),gallery=details.locator('[data-module-gallery]');await details.locator(':scope>summary').click();
  await p.waitForFunction(()=>document.querySelector('#gegevens-producten [data-module-gallery]')?.dataset.device==='mobile');
  assert.equal(await gallery.getAttribute('data-device'),'mobile');await gallery.locator('[data-screen-open-all]').click();
  const viewer=p.locator('dialog.image-viewer[open]');await viewer.getByRole('button',{name:'Volgende afbeelding',exact:true}).click();
  const title=await viewer.locator('#image-viewer-title').textContent();
  for(const [width,height,device] of [[844,390,'tablet'],[667,375,'tablet'],[1194,430,'tablet'],[390,844,'mobile']]){
   await rotate(width,height);assert.equal(await gallery.getAttribute('data-device'),device);
   assert.equal(await viewer.locator('#image-viewer-title').textContent(),title,'Keep the selected scene while rotating');
   assert(new URL(await viewer.locator('.image-viewer-stage img').getAttribute('src'),base).pathname.endsWith(`-${device}-dark.jpg`));
  }
  await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.documentElement.style.overflow),'');await noOverflow();
  console.log('PASS open viewer rotation: tablet images, retained scene, portrait recovery and scrolling.');
  await p.goto(new URL('demo/modulaire-webapp/?page=dashboard&theme=dark',base).href,{waitUntil:'networkidle'});
  await p.locator('.workspace-root [data-channel-detail=bol]>summary').click();
  for(const [width,height] of [[844,390],[667,375],[568,320],[1194,430],[390,844]]){
   await rotate(width,height);assert.equal(await p.evaluate(()=>FullWorkspace.inspect().page),'dashboard');
   assert.equal(await p.locator('.workspace-root [data-channel-detail=bol]').getAttribute('open'),'');assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');
   assert.equal(await p.locator('.demo-sidebar').evaluate(el=>getComputedStyle(el).position),'fixed');
   await p.locator('[data-demo-menu]').click();assert.equal(await p.locator('.demo-workspace').evaluate(el=>el.inert),true);
   await p.keyboard.press('Escape');assert.equal(await p.locator('.demo-workspace').evaluate(el=>el.inert),false);await noOverflow();
   if(width===844&&process.env.DEMO_ROTATION_REPORT_DIR){fs.mkdirSync(process.env.DEMO_ROTATION_REPORT_DIR,{recursive:true});await p.screenshot({path:path.join(process.env.DEMO_ROTATION_REPORT_DIR,'demo-phone-landscape.png')});}
  }
  assert.deepEqual(errors,[]);await ctx.close();
  const desktop=await browser.newContext({viewport:{width:1440,height:900}});await demoBrowserSession(desktop,base);const d=await desktop.newPage();
  await d.goto(new URL('',base).href,{waitUntil:'networkidle'});assert((await d.locator('.webapp-demo-teaser img').evaluate(i=>i.currentSrc)).includes('-desktop-dark.png'));
  await d.setViewportSize({width:1280,height:500});await d.waitForTimeout(120);assert((await d.locator('.webapp-demo-teaser img').evaluate(i=>i.currentSrc)).includes('-desktop-dark.png'),'Short desktop windows stay desktop');
  await desktop.close();console.log('PASS demo rotation: compact tablet layout, working menu, unchanged data/theme, no overflow; desktop stays desktop.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
