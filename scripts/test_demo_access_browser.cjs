/* Real local PHP login flow; test credentials come only from environment variables. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8767/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
const username=process.env.DEMO_TEST_USERNAME,password=process.env.DEMO_TEST_PASSWORD;
assert(username&&password,'Set local test credentials in the environment');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const width of [320,390,844,1440]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
   const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(new URL('demo/modulaire-webapp/',base).href,{waitUntil:'networkidle'});
   const dialog=p.locator('.demo-access-dialog');
   assert.equal(await p.evaluate(()=>FullWorkspace.inspect().page),'dashboard');assert(!await dialog.isVisible());
   await p.locator('[data-demo-theme]').click();assert(!await dialog.isVisible(),'Theme control remains available in the public preview');
   for(const selector of ['.demo-channel-detail>summary','.demo-channel-month>summary','.demo-dashboard-heatmap>summary','.demo-forecast-method>summary']){
    const summary=p.locator('.workspace-root '+selector).first();await summary.click();
    assert(await summary.evaluate(el=>el.parentElement.open),'Public dashboard detail must actually expand');
    assert(!await dialog.isVisible(),'Expanding dashboard details must not request a password');
   }
   const menu=p.locator('[data-demo-menu]');
   if(await menu.isVisible())await menu.click();
   assert(!await dialog.isVisible(),'Opening the app menu is public');
   const group=p.locator('[data-demo-nav] .demo-nav-group').filter({has:p.locator('[data-full-page=omzet-artikelen]')});
   if(await group.getAttribute('open')===null)await group.locator(':scope>summary').click();
   assert(!await dialog.isVisible(),'Expanding a menu group is public');
   await p.locator('[data-demo-nav] [data-full-page=dashboard]').click();
   assert(!await dialog.isVisible());assert.equal(await p.evaluate(()=>FullWorkspace.inspect().page),'dashboard');
   await p.locator('[data-demo-find]').click();assert(!await dialog.isVisible(),'Browsing search results is public');
   await p.locator('[data-demo-close]').click();assert(!await dialog.isVisible(),'Closing a public dialog is public');

   await p.locator('.workspace-root .demo-dashboard-products button').first().click();
   assert(await dialog.isVisible());assert.equal(await p.evaluate(()=>FullWorkspace.inspect().page),'dashboard');
   assert.equal(await dialog.locator('[name=username]').inputValue(),'');
   assert.equal(await dialog.locator('[name=password]').inputValue(),'');
   assert.equal(await dialog.locator('a').getAttribute('href'),'/contact/?onderwerp=demo-toegang#contact-form');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(width===390&&process.env.DEMO_ACCESS_SCREENSHOT)await dialog.screenshot({path:process.env.DEMO_ACCESS_SCREENSHOT});
   await dialog.locator('[name=username]').fill('Unknown user');await dialog.locator('[name=password]').fill(password);await Promise.all([p.waitForResponse(r=>r.url().endsWith('/api/demo-access.php')&&r.status()===401),dialog.locator('[type=submit]').click()]);
   await p.waitForFunction(()=>document.querySelector('[data-access-error]').textContent.length>0);
   assert(await dialog.isVisible());assert.equal(await p.evaluate(()=>FullWorkspace.inspect().page),'dashboard');
   assert((await dialog.locator('[data-access-error]').textContent()).includes('klopt niet'));
   await dialog.locator('[name=username]').fill(username);await dialog.locator('[name=password]').fill(password);await dialog.locator('[type=submit]').click();
   await p.waitForFunction(()=>FullWorkspace.inspect().page==='artikelkaart');assert(!await dialog.isVisible());
   await p.reload({waitUntil:'networkidle'});assert.equal(await p.evaluate(()=>FullWorkspace.inspect().page),'artikelkaart');assert(!await dialog.isVisible());
   assert.deepEqual(errors,[]);await context.close();console.log('PASS real login, invalid credentials, replayed click and session persistence at '+width+'px');
  }
  const context=await browser.newContext({viewport:{width:390,height:844}}),p=await context.newPage();
  await p.goto(new URL('demo/modulaire-webapp/?page=ads-engine',base).href,{waitUntil:'networkidle'});
  const dialog=p.locator('.demo-access-dialog');assert(await dialog.isVisible());assert.equal(await p.evaluate(()=>FullWorkspace.inspect().page),'dashboard');
  await dialog.locator('[name=username]').fill(username);await dialog.locator('[name=password]').fill(password);await dialog.locator('[type=submit]').click();
  await p.waitForFunction(()=>window.FullWorkspace?.mounted&&FullWorkspace.inspect().page==='ads-engine');assert(!await dialog.isVisible());
  await context.close();
  const guest=await browser.newContext({viewport:{width:390,height:844}}),g=await guest.newPage();
  await g.goto(new URL('demo/modulaire-webapp/',base).href,{waitUntil:'networkidle'});await g.locator('[data-demo-menu]').click();assert(!await g.locator('.demo-access-dialog').isVisible());
  const pageLink=g.locator('[data-demo-nav] [data-full-page=omzet-artikelen]'),menuGroup=pageLink.locator('xpath=ancestor::details');
  if(await menuGroup.getAttribute('open')===null)await menuGroup.locator(':scope>summary').click();
  assert(!await g.locator('.demo-access-dialog').isVisible());await pageLink.click();assert(await g.locator('.demo-access-dialog').isVisible());
  await g.keyboard.press('Escape');assert(!await g.locator('.demo-access-dialog').isVisible());assert.equal(await pageLink.evaluate(el=>el===document.activeElement),true);await pageLink.click();
  await g.locator('.demo-access-dialog a').click();await g.waitForURL('**/contact/**');
  assert.equal(await g.locator('#contact-topic').inputValue(),'demo-toegang');assert(await g.locator('[data-contact-topic=demo-toegang]').isVisible());
  assert((await g.locator('#demo-access-message').inputValue()).includes('gratis inloggegevens'));
  assert.equal(await g.locator('[data-contact-topic=demo-toegang]').isDisabled(),false);
  await guest.close();console.log('PASS public menu groups, protected page selections, direct module links and access request form; no contact request sent');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
