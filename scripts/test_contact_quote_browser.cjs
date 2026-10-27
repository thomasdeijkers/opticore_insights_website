/* Verify the presentation and unchanged form payload, without sending a request. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const P=require('../assets/js/modular-webapp.js'),base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8765/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
const normalized=text=>text.replace(/\u00a0/g,' '),money=n=>'€ '+n.toLocaleString('nl-NL');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  for(const width of [320,390,844,1440]){
   const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
   await ctx.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
   const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
   for(const modules of [[],['marketing'],Object.keys(P.catalogue),['constructor','<script>','unknown']]){
    const selected=P.resolve(modules),rows=P.quoteRows(selected),params=new URLSearchParams({onderwerp:'webapp',modules:modules.join(',')});
    await p.goto(new URL('contact/?'+params,base).href,{waitUntil:'networkidle'});
    const tables=p.locator('[data-module-quote] table');assert.equal(await tables.count(),2);
    assert.deepEqual(await tables.locator('caption').allTextContents(),['Per maand','Eenmalige inrichting']);
    for(let period=0;period<2;period++){
     const table=tables.nth(period);assert.equal(await table.locator('tbody tr').count(),rows.length);
     for(let i=0;i<rows.length;i++){
      const tr=table.locator('tbody tr').nth(i),r=rows[i],current=period?r.setup:r.currentMonthly,advice=period?r.standardSetup:r.monthly;
      assert(normalized(await tr.locator('th').textContent()).includes(r.label));
      assert.equal(normalized(await tr.locator('.contact-module-quote-final').textContent()),money(current));
      assert.equal(normalized(await tr.locator('.contact-module-quote-discount').textContent()),'− '+money(advice-current));
      assert.equal(normalized(await tr.locator('.contact-module-quote-advice').textContent()),money(advice));
      const style=await tr.locator('.contact-module-quote-final strong').evaluate(el=>({color:getComputedStyle(el).color,weight:getComputedStyle(el).fontWeight}));
      assert.equal(style.color,'rgb(0, 0, 0)');assert(Number(style.weight)>=700);
      assert.equal(await tr.locator('.contact-module-quote-discount').evaluate(el=>getComputedStyle(el).color),'rgb(33, 107, 67)');
     }
     assert.equal(normalized(await table.locator('tfoot .contact-module-quote-final').textContent()),money(period?selected.setup:selected.monthly));
    }
    const field=p.locator('#webapp-modules');assert.equal(await field.isVisible(),false);assert(await field.getAttribute('readonly')!==null);
    const draft=await field.inputValue();assert.equal(normalized(draft),normalized(P.contactDraft(selected)));
    assert.equal(await p.locator('[data-module-quote] input,[data-module-quote] textarea,[data-module-quote] select').count(),0);
    assert.equal(await p.evaluate(()=>new FormData(document.querySelector('[data-contact-form]')).get('details[modules]')),draft,'Text equivalent is still submitted');
    await p.locator('#webapp-message').fill('Dit is een lokale controle.');
    assert.equal(await field.inputValue(),draft,'Editable message does not change the quote');
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(width===390&&modules.length===1&&process.env.CONTACT_QUOTE_REPORT_DIR){fs.mkdirSync(process.env.CONTACT_QUOTE_REPORT_DIR,{recursive:true});await p.locator('[data-module-quote]').screenshot({path:path.join(process.env.CONTACT_QUOTE_REPORT_DIR,'contact-quote-mobile.png'),style:'.site-header{visibility:hidden!important}'});}
   }
   await p.locator('[data-contact-form]').evaluate(form=>form.reset());await p.waitForTimeout(80);
   assert.equal(normalized(await p.locator('#webapp-modules').inputValue()),normalized(P.contactDraft(P.resolve(['constructor','<script>','unknown']))),'Reset retains the calculated selection');
   assert.deepEqual(errors,[]);await ctx.close();console.log(width+': both cost tables, exact module/totals, green discounts, bold black prices, immutable selection, safe IDs and form payload OK.');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
