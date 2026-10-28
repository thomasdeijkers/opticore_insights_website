/* Capture real translated, fictional screens. Isolated browsers; localhost only. */
const fs=require('node:fs'),http=require('node:http'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const demoSession=require('./demo_browser_session.cjs'),routes=require('../content/i18n/routes.json');
const ROOT=path.resolve(__dirname,'..'),OUTPUT=path.join(ROOT,'assets/img/localized');
const arg=name=>process.argv.find(v=>v.startsWith('--'+name+'='))?.slice(name.length+3);
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2','.ico':'image/x-icon'};
async function serve(root){
 const server=http.createServer(async(req,res)=>{
  try{
   const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '');
   if(!['GET','HEAD'].includes(req.method)||name.split('/').some(p=>p.startsWith('.'))){res.writeHead(403);return res.end();}
   let file=path.resolve(root,name);assert(file===root||file.startsWith(root+path.sep));let stat=await fs.promises.stat(file);
   if(stat.isDirectory()){file=path.join(file,'index.html');stat=await fs.promises.stat(file);}
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-store'});
   if(req.method==='HEAD')return res.end();const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);res.on('close',()=>stream.destroy());
  }catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return {server,base:new URL('http://127.0.0.1:'+server.address().port+'/')};
}
(async()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'opticore-captures-'));
 const python=process.env.PYTHON||(process.platform==='win32'?'python':'python3');
 let app,fixtures,browser;
 try{
  const planPath=path.join(temporary,'plan.json'),fixturePath=path.join(temporary,'fixtures');
  execFileSync(python,['scripts/localized_screenshots.py','--plan',planPath],{cwd:ROOT});
  execFileSync(python,['scripts/localized_screenshots.py','--fixtures',fixturePath],{cwd:ROOT});
  const plan=JSON.parse(fs.readFileSync(planPath,'utf8'));
  app=await serve(ROOT);fixtures=await serve(fixturePath);
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
  const nativeFile=file=>/^module-examples\/client-|^demo\/dashboard-client-|^examples\/client-(management|stock|forecast|ranking|marketing|listing)-/.test(file);
  let tasks=['nl','de','en','fr'].filter(l=>!arg('language')||l===arg('language')).flatMap(language=>plan.filter(item=>!item.external&&(language!=='nl'||nativeFile(item.file))&&(!arg('device')||item.device===arg('device'))&&(!arg('file')||new RegExp(arg('file')).test(item.file))).map(item=>({...item,language})));
  if(arg('limit'))tasks=tasks.slice(0,Number(arg('limit')));
  assert(tasks.length,'No captures selected');fs.mkdirSync(OUTPUT,{recursive:true});
  const previous=path.join(OUTPUT,'manifest.json'),images=fs.existsSync(previous)?JSON.parse(fs.readFileSync(previous,'utf8')).images:{};
  const valid=new Set(['de','en','fr'].flatMap(language=>plan.map(item=>language+'/'+item.file)));
  for(const file of Object.keys(images))if(!valid.has(file))delete images[file];
  const report=[];let next=0,completed=0;
  async function worker(){while(next<tasks.length){
   const task=tasks[next++],context=await browser.newContext({viewport:{width:task.width,height:task.height},deviceScaleFactor:task.scale,colorScheme:'dark',reducedMotion:'reduce',locale:{nl:'nl-NL',de:'de-DE',en:'en-GB',fr:'fr-FR'}[task.language],timezoneId:'Europe/Amsterdam'});
   try{
    await context.route('**/*',route=>[app.base.origin,fixtures.base.origin].includes(new URL(route.request().url()).origin)?route.continue():route.abort());
    await demoSession(context,app.base);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    const url=task.fixture?new URL(task.language+'/'+task.page+'.html',fixtures.base):new URL((task.language==='nl'?'/demo/modulaire-webapp/':routes['/demo/modulaire-webapp/'][task.language])+'?'+new URLSearchParams({page:task.page,theme:'dark',...(task.tab?{tab:task.tab}:{})}),app.base);
    assert((await page.goto(url.href,{waitUntil:'networkidle'})).ok(),url.href);
    if(!task.fixture){await page.locator('.workspace-complete .workspace-root').waitFor();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.equal(await page.evaluate(()=>FullWorkspace.inspect().page),task.page,'Capture must show the requested app page');}
    assert.equal(await page.locator('html').getAttribute('lang'),task.language);
    await page.evaluate(()=>document.fonts.ready);
    if(task.click)await page.locator(task.click).first().click();
    if(task.expand){const target=page.locator(task.expand).first();if(await target.locator('xpath=..').getAttribute('open')===null){await target.focus();await target.press('Enter');}}
    if(task.modal){const target=page.locator(task.modal).first(),parent=target.locator('xpath=ancestor::details').first();if(await parent.count()&&await parent.getAttribute('open')===null){await parent.locator(':scope>summary').focus();await parent.locator(':scope>summary').press('Enter');}await target.click();await page.locator('dialog[open]').waitFor();}
    if(task.focus){const target=page.locator(task.focus).first();await target.scrollIntoViewIfNeeded();if(task.align)await target.evaluate((el,align)=>el.scrollIntoView({block:align}),task.align);}
    if(!task.fixture)assert.equal(await page.locator('.demo-access-dialog').isVisible(),false,'Never capture a blocked demo login instead of the module');
    await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(async i=>{i.loading='eager';await i.decode();}));});
    assert.deepEqual(errors,[],url.href);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow: '+url.href);
    const file=task.language+'/'+task.file,target=task.language==='nl'?path.join(ROOT,'assets/img',task.file):path.join(OUTPUT,file);fs.mkdirSync(path.dirname(target),{recursive:true});
    await page.screenshot({path:target,fullPage:Boolean(task.fullPage),...(file.endsWith('.jpg')?{type:'jpeg',quality:94}:{type:'png'})});
    const data=fs.readFileSync(target);
    if(task.language!=='nl')images[file]={language:task.language,device:task.device,theme:'dark',width:task.width,height:task.fullPage?await page.evaluate(()=>document.documentElement.scrollHeight):task.height,scale:task.scale,sha256:crypto.createHash('sha256').update(data).digest('hex')};
    const leftovers=await page.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,th,button,label,summary')].filter(e=>e.getBoundingClientRect().width&&!e.closest('.language-picker')).map(e=>e.textContent.trim().replace(/\s+/g,' ')).filter(t=>/\b(?:jouw|een|gegevens|koppelingen|worden|bijbestellen|bekijken|voorraadbeheer)\b/i.test(t)).slice(0,20));
    if(leftovers.length)report.push({file,leftovers});
    completed++;if(completed%30===0||completed===tasks.length)console.log(completed+'/'+tasks.length+' localized dark screenshots captured.');
   }finally{await context.close();}
  }}
  await Promise.all(Array.from({length:Number(arg('workers')||3)},worker));
  const revision=crypto.createHash('sha256').update(JSON.stringify(Object.entries(images).sort(([a],[b])=>a.localeCompare(b)))).digest('hex').slice(0,16);
  fs.writeFileSync(previous,JSON.stringify({revision,images},null,2)+'\n');
  if(arg('report'))fs.writeFileSync(arg('report'),JSON.stringify(report,null,2)+'\n');
  console.log('Saved '+Object.keys(images).length+' localized captures; revision '+revision+'. Review flags: '+report.length);
 }finally{
  await browser?.close();for(const item of [app,fixtures])if(item)await new Promise(resolve=>item.server.close(resolve));
  const resolved=path.resolve(temporary);assert(resolved.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(resolved).startsWith('opticore-captures-'));
  fs.rmSync(resolved,{recursive:true,force:true});
 }
})().catch(error=>{console.error(error);process.exitCode=1});
