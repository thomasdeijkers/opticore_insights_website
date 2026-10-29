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
       const footerNavigation=!!a.closest('.footer-nav');
       const inline=a.parentElement.matches('p,dd,figcaption,small,td,th')&&!a.matches('.button,.text-link,.footer-social');
       const editorial=!!a.closest('.news-grid .news-card h2,.home-updates .resource-list h3,.news-page-intro .news-source-shortcuts,.news-article');
       const primary=a.matches('.button:not(.button-secondary),.footer-contact-link,.nav-contact');
       const quietNavigation=!!a.closest('.site-nav')&&!primary;
       const expected=breadcrumb||footerNavigation||inline||editorial||quietNavigation?'transparent':primary?'orange':'blue';
       const good=expected==='transparent'?transparent:expected==='blue'?c.backgroundColor==='rgba(23, 58, 101, 0.86)'&&c.color==='rgb(255, 255, 255)':c.backgroundColor==='rgba(255, 111, 48, 0.7)'&&c.color==='rgb(5, 29, 64)';
       if(!good||((breadcrumb||footerNavigation||editorial)&&c.borderTopWidth!=='0px')||(!inline&&!footerNavigation&&!editorial&&c.textDecorationLine.includes('underline')))
        bare.push({text:a.textContent.trim().slice(0,100),href:a.getAttribute('href'),expected,background:c.backgroundColor,color:c.color});
      }
     }
     if(marketing){
      for(const group of document.querySelectorAll('.actions,.section-more,.webapp-cost-nav')){
       const children=[...group.children].filter(e=>e.getClientRects().length);
       if(!group.getClientRects().length||!children.length||!children.every(e=>e.matches('a[href],button')))continue;
       const bounds=group.getBoundingClientRect(),rows=new Map();
       for(const child of children){const box=child.getBoundingClientRect(),row=Math.round(box.top);if(!rows.has(row))rows.set(row,[]);rows.get(row).push(box);}
       for(const row of rows.values()){
        row.sort((a,b)=>a.left-b.left);
        if(Math.abs(row[0].left-bounds.left)>1||Math.abs(row.at(-1).right-bounds.right)>1||row.length>(innerWidth<=760?2:3))bare.push({reason:'Action row does not fill its container',group:group.className,columns:row.length});
        for(let i=1;i<row.length;i++)if(row[i].left<row[i-1].right+7)bare.push({reason:'Action buttons overlap or have no spacing',group:group.className});
       }
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
  console.log(`Button audit OK: ${tasks.length} page views across all four languages, NL mobile pages and dynamic search; ${links} text actions use orange CTA, blue information and quiet breadcrumb/prose navigation; native demo stays independent; no horizontal overflow.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
