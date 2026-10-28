/* Browser contracts for the fictional Studio: reversible edits, review gates and local downloads. */
const assert=require('node:assert/strict'),fs=require('node:fs/promises');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const session=require('./demo_browser_session.cjs'),routes=require('../content/i18n/routes.json');
const base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8765/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});try{
 for(const lang of ['nl','de','en','fr'])for(const width of [390,834,1440]){
  const ctx=await b.newContext({viewport:{width,height:900},acceptDownloads:true}),blocked=[],errors=[];
  try{
   await ctx.route('**/*',r=>{if(new URL(r.request().url()).origin===base.origin)return r.continue();blocked.push(r.request().url());return r.abort()});await session(ctx,base);
   const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
   const url=lang==='nl'?'/demo/modulaire-webapp/':routes['/demo/modulaire-webapp/'][lang];
   await p.goto(new URL(url+'?module=beeldstudio&theme=dark',base).href,{waitUntil:'networkidle'});
   const rows=p.locator('.studio-library tbody tr');await rows.first().waitFor();assert.equal(await rows.count(),12);
   assert.equal(await rows.first().evaluate(e=>getComputedStyle(e).display),'table-row');assert.equal(await rows.first().locator('td').count(),5);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await p.locator('[data-w-action=studio-open][data-id=DEMO-1001]').click();
   assert.equal(await p.locator('.studio-six-thumbs>button').count(),6);assert(await p.locator('[data-studio-house]').isChecked());
   if(width===390){
    await p.locator('[data-studio-house]').uncheck({force:true});assert(!(await p.locator('[data-studio-house]').isChecked()));
    await p.locator('[data-studio-image="3"]').click();assert.equal(await p.locator('.demo-studio-preview svg circle[opacity=".08"]').count(),0);
    await p.locator('[data-studio-house]').check({force:true});
    await p.locator('.workspace-tabs [data-full-tab=style]').click();
    await p.locator('[data-w-form=image-recipe] [name=brand]').fill('Demo <Brand>');await p.locator('[data-w-form=image-recipe] [name=headline]').fill('My product image');
    await p.locator('[data-w-form=image-recipe] [name=color]').selectOption('#f4724b');await p.locator('[data-w-form=image-recipe] button[type=submit]').click();
    assert((await p.locator('.studio-style-preview').textContent()).includes('Demo <Brand>'));assert((await p.locator('.studio-style-preview').textContent()).includes('My product image'));assert.equal(await p.locator('.studio-style-preview brand').count(),0);
    await p.locator('.workspace-tabs [data-full-tab=editor]').click();await p.locator('[data-studio-image="3"]').click();await p.locator('[data-studio-main]').click();assert.equal(await p.locator('.studio-six-thumbs>button').first().getAttribute('data-studio-image'),'3');
    await p.locator('[data-w-action=studio-remove]').click();assert.equal(await p.locator('.studio-six-thumbs>button').count(),5);
    await p.locator('[data-studio-reset]').click();assert.equal(await p.locator('.studio-six-thumbs>button').count(),6);
    await p.locator('[data-studio-review]').click();assert.equal(await p.locator('dialog[open] .demo-studio-review svg').count(),6);await p.locator('[data-commit]').click();
    await p.locator('.workspace-tabs [data-full-tab=channels]').click();await p.locator('.workspace-root>.workspace-panel .workspace-details>summary').first().click();
    assert(await p.locator('[data-w-action=studio-publish][data-id=bol]').isEnabled());await p.locator('[data-w-action=studio-publish][data-id=bol]').click();
    assert.equal(await p.evaluate(()=>FullWorkspace.inspect().client.studioPublished['DEMO-1001'].bol.length),6);
    const downloadPromise=p.waitForEvent('download');await p.locator('[data-w-action=studio-download-all]').click();const download=await downloadPromise,html=await fs.readFile(await download.path(),'utf8');assert.equal((html.match(/<svg /g)||[]).length,6);assert(html.includes('data:image/jpeg;base64,'));assert(html.includes('creativecommons.org'));assert(!html.includes('href="/assets/img/'));await download.delete();
    await p.locator('.workspace-tabs [data-full-tab=style]').click();await p.locator('[data-w-form=image-recipe] [name=headline]').fill('Revised product image');await p.locator('[data-w-form=image-recipe] button[type=submit]').click();
    await p.locator('.workspace-tabs [data-full-tab=channels]').click();await p.locator('.workspace-root>.workspace-panel .workspace-details>summary').first().click();assert(await p.locator('[data-w-action=studio-publish][data-id=bol]').isDisabled());
    await p.locator('.workspace-tabs [data-full-tab=editor]').click();await p.locator('[data-w-action=studio-archive]').click();assert.equal(await rows.count(),1);
    await p.locator('[data-w-action=studio-open][data-id=DEMO-1001]').click();await p.locator('[data-w-action=studio-archive]').click();assert.equal(await rows.count(),12);
    await p.locator('[data-w-form=studio-search] [name=query]').fill('DEMO-1002');await p.locator('[data-w-form=studio-search] button').click();assert.equal(await rows.count(),1);
   }
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);
   console.log('PASS Studio library, six scenes and responsive layout '+lang+' '+width+'px'+(width===390?'; brand toggle/edit, order/remove/reset, review gate, self-contained download and archive':''));
  }finally{await ctx.close();}
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
