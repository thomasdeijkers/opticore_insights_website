const assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const session=require('./demo_browser_session.cjs'),routes=require('../content/i18n/routes.json');
const base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8765/');assert(['localhost','127.0.0.1'].includes(base.hostname));
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});try{
 for(const language of ['nl','de','en','fr'])for(const width of [390,834,1440]){
  const context=await browser.newContext({viewport:{width,height:900},colorScheme:'dark'});try{
   const blocked=[];await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():(blocked.push(r.request().url()),r.abort()));await session(context,base);
   const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const path=language==='nl'?'/demo/modulaire-webapp/':routes['/demo/modulaire-webapp/'][language];
   await p.goto(new URL(path+'?page=magazijn-picklijst&tab=to_pick&theme=dark',base).href,{waitUntil:'networkidle'});await p.locator('.picklist-item').first().waitFor();
   const row=()=>p.locator('.picklist-item').filter({has:p.locator('.picklist-sku',{hasText:'DEMO-1003'})});assert.equal(await row().locator('.picklist-image-quantity').textContent(),'2×');assert.equal(await row().locator('.picklist-item-main').evaluate(el=>el.firstElementChild.className),'picklist-row-actions');
   await row().locator('.picklist-item-main').focus();await row().locator('.picklist-item-main').press('Enter');assert(await row().locator('.picklist-item-description p').isVisible());
   await row().locator('.picklist-mark').click();await p.locator('.picklist-confirm[open]').waitFor();assert.equal(await p.locator('.picklist-quantity-tile').count(),2);
   await p.locator('.picklist-quantity-tile[data-quantity="1"]').click();await p.locator('.picklist-confirm-button').click();assert.equal(await p.locator('[data-picklist-tab=not_picked]').getAttribute('aria-selected'),'true');assert.equal(await row().locator('.picklist-image-quantity').textContent(),'1×');assert(await p.locator('.picklist-row-actions button').evaluateAll(buttons=>buttons.every(button=>button.scrollWidth<=button.clientWidth+1)));
   await row().locator('.picklist-revert').click();assert(!(await p.locator('.picklist-confirm-location').textContent()).includes('undefined'));await p.locator('.picklist-cancel').click();
   await row().locator('.picklist-revert').click();await p.locator('.picklist-confirm-button').click();await p.locator('[data-picklist-tab=to_pick]').click();assert.equal(await row().locator('.picklist-image-quantity').textContent(),'2×');
   await row().locator('.picklist-mark').click();await p.locator('.picklist-quantity-tile[data-quantity="1"]').click();await p.locator('.picklist-confirm-button').click();
   await row().locator('.picklist-mark').click();await p.locator('.picklist-confirm-button').click();assert.equal(await p.locator('[data-picklist-tab=picked]').getAttribute('aria-selected'),'true');assert.equal(await row().locator('.picklist-image-quantity').textContent(),'2×');
   await row().locator('.picklist-unmark').click();await p.locator('.picklist-cancel').click();assert.equal(await row().locator('.picklist-image-quantity').textContent(),'2×');await row().locator('.picklist-unmark').click();await p.locator('.picklist-confirm-button').click();
   await p.locator('[data-picklist-tab=to_pick]').click();assert.equal(await row().locator('.picklist-image-quantity').textContent(),'2×');
   await p.locator('[data-demo-theme]').click();assert.equal(await p.locator('html').getAttribute('data-theme'),'light');assert.equal(await row().locator('.picklist-image-quantity').textContent(),'2×');
   if(width>768){await p.evaluate(()=>window.print=()=>window.demoPrinted=true);await p.locator('[data-picklist-print]').click();assert.equal(await p.evaluate(()=>window.demoPrinted),true);}
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);
   await p.locator('.demo-topbar-brand').click();await p.locator('[data-full-page=orders-pakken][data-full-tab=picked]').click();assert.equal(await p.locator('[data-picklist-tab=picked]').getAttribute('aria-selected'),'true');
   console.log('PASS native picklist: native row layout, kits, partial quantities, remainder, undo/cancel, light, print and dashboard link: '+language+' '+width+'px');
  }finally{await context.close();}
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
