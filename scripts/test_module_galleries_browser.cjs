/* Run against a local static server after capturing module screenshots. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const plan=require('../content/module-screenshots.json');
const base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8765/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const [device,width,height] of [['mobile',390,844],['tablet',834,1112],['desktop',1440,1000]]){
   const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
   await ctx.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
   const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
   for(const page of ['modulaire-webapp/','webapp-samenstellen/']){
    await p.goto(new URL(page,base).href,{waitUntil:'networkidle'});
    for(const [module,views] of Object.entries(plan)){
     const details=p.locator('#gegevens-'+module),gallery=details.locator('[data-module-gallery]');
     await details.locator(':scope>summary').click();
     assert.equal(await gallery.getAttribute('data-device'),device);
     assert.equal(await gallery.locator('.screen-slide:not([hidden])').count(),4);
     const opener=gallery.locator('[data-screen-open-all]');await opener.click();
     for(let i=0;i<views.length;i++){
      const dialog=p.locator('dialog.image-viewer[open]');
      assert(await dialog.locator('a.image-viewer-credits').isVisible());
      assert.equal(await dialog.locator('a.image-viewer-credits').getAttribute('href'),'/demo/beeldbronnen/');
      assert.equal(await dialog.locator('.image-viewer-count').textContent(),`${i+1} van ${views.length}`);
      assert.equal(await dialog.locator('#image-viewer-title').textContent(),views[i].title);
      const img=dialog.locator('.image-viewer-stage img');
      const expected=module==='wms'?`/assets/img/wms-examples/${views[i].id}-${device==='mobile'?'mobile':'desktop'}.png`:`client-${module}-${views[i].id}-${device}-dark.jpg`;
      assert(new URL(await img.getAttribute('src'),base).pathname.endsWith(expected));
      await img.evaluate(el=>el.decode());assert(await img.evaluate((el,min)=>el.naturalWidth>min,module==='wms'?300:700));
      if(i<views.length-1)await dialog.getByRole('button',{name:'Volgende afbeelding',exact:true}).click();
     }
     await p.keyboard.press('Escape');assert(await opener.evaluate(el=>document.activeElement===el));
     assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
     if(module==='producten'&&page==='modulaire-webapp/'&&process.env.MODULE_GALLERY_REPORT_DIR){
      const target=path.join(process.env.MODULE_GALLERY_REPORT_DIR,`module-gallery-${device}.png`);fs.mkdirSync(path.dirname(target),{recursive:true});await gallery.screenshot({path:target});
     }
     await details.locator(':scope>summary').click();
    }
   }
   assert.deepEqual(errors,[]);await ctx.close();console.log(device+': both module pages, all 46 scenes, correct device, four previews, viewer navigation, loading, focus and overflow OK.');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
