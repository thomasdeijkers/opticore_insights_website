/* Visual contract for every published route and dynamically rendered search results. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const routes=require('../content/i18n/routes.json'),base=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8878/');
assert(['127.0.0.1','localhost'].includes(base.hostname));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const tasks=Object.keys(routes).flatMap(route=>['nl','de','en','fr'].map(lang=>({url:lang==='nl'?route:routes[route][lang],width:1440,lang})).concat([{url:route,width:390,lang:'nl'}]));
 tasks.push(...['nl','de','en','fr'].flatMap(lang=>[1440,390].map(width=>({url:(lang==='nl'?'/zoeken/':routes['/zoeken/'][lang])+'?q=webapp',width,lang}))));
 let next=0,links=0;const failures=[];
 try{
  async function worker(){
   const context=await browser.newContext({reducedMotion:'reduce'});
   await context.route('**/*',route=>new URL(route.request().url()).origin===base.origin?route.continue():route.abort());
   await require('./demo_browser_session.cjs')(context,base);const page=await context.newPage();
   while(next<tasks.length){const task=tasks[next++];
    await page.setViewportSize({width:task.width,height:1000});
    const response=await page.goto(new URL(task.url,base).href,{waitUntil:'load'});assert(response.ok(),task.url);
    await page.waitForFunction(()=>document.querySelector('.demo-shell')||[...document.styleSheets].some(s=>s.href?.includes('/link-buttons.css')));
    if(task.url.includes('?q='))await page.locator('[data-search-results] a, .search-results a').first().waitFor();
    const result=await page.evaluate(()=>{
     const bare=[];let count=0;
     const marketing=[...document.styleSheets].some(s=>s.href?.includes('/link-buttons.css'));
     if(document.querySelector('.demo-shell')){
      if(marketing)bare.push({reason:'Website button stylesheet leaked into native demo'});
      if(document.querySelector('.demo-topbar .demo-package-link'))bare.push({reason:'Sales CTA in native app header'});
     }else{
      for(const a of document.querySelectorAll('a[href]')){
       if(!a.getClientRects().length||!a.textContent.trim()||a.matches('.brand,.footer-brand,.skip-link,.screen-slide,.portfolio-cover,.webapp-demo-teaser-scroll')||a.querySelector('img'))continue;
       const c=getComputedStyle(a);count++;
       const transparent=c.backgroundColor==='rgba(0, 0, 0, 0)';
       const breadcrumb=!!a.closest('.breadcrumbs');
       const inline=a.parentElement.matches('p,dd,figcaption,small,td,th')&&!a.matches('.button,.text-link,.footer-social');
       const primary=a.matches('.button:not(.button-secondary),.footer-contact-link,.nav-contact');
       const quietNavigation=!!a.closest('.site-nav')&&!primary;
       const expected=breadcrumb||inline||quietNavigation?'transparent':primary?'blue':'orange';
       const good=expected==='transparent'?transparent:expected==='blue'?c.backgroundColor==='rgb(23, 90, 150)'&&c.color==='rgb(255, 255, 255)':c.backgroundColor==='rgb(255, 243, 233)'&&c.color==='rgb(146, 59, 22)';
       if(!good||(breadcrumb&&(c.paddingTop!=='0px'||c.borderTopWidth!=='0px'))||(!inline&&c.textDecorationLine.includes('underline')))
        bare.push({text:a.textContent.trim().slice(0,100),href:a.getAttribute('href'),expected,background:c.backgroundColor,color:c.color});
      }
     }
     return {count,bare,overflow:document.documentElement.scrollWidth>innerWidth+1};
    });links+=result.count;
    if(result.bare.length||result.overflow)failures.push({...task,...result});
   }
   await context.close();
  }
  await Promise.all(Array.from({length:4},worker));
  assert.deepEqual(failures,[],JSON.stringify(failures,null,2));
  console.log(`Button audit OK: ${tasks.length} page views across all four languages, NL mobile pages and dynamic search; ${links} text actions respect primary blue, secondary orange and quiet breadcrumb/prose navigation; native demo stays independent; no horizontal overflow.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
