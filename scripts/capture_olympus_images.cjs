/* Capture translated static snapshots of the actual Olympus frontend.
   Snapshots and media output must stay outside the public source checkout. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const arg=name=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3);
const source=path.resolve(arg('source')||''),translated=path.resolve(arg('translated')||''),output=path.resolve(arg('output')||''),root=path.resolve(__dirname,'..');
for(const directory of [source,translated,output])assert(directory!==root&&!directory.startsWith(root+path.sep),'Use external snapshot/media directories');
const sourceCommit=arg('source-commit');assert(/^[a-f0-9]{40}$/.test(sourceCommit),'Pin the original Olympus source revision');
const shots=JSON.parse(fs.readFileSync(path.join(source,'snapshots.json'),'utf8'));
assert.equal(shots.length,10);
const server=http.createServer((req,res)=>{try{const file=path.resolve(translated,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));assert(file.startsWith(translated+path.sep)&&file.endsWith('.html'));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});const images={};
 try{for(const language of ['nl','de','en','fr'])for(const shot of shots){
  const context=await browser.newContext({viewport:{width:shot.width,height:shot.height},deviceScaleFactor:shot.scale,colorScheme:'dark',reducedMotion:'reduce'});
  try{const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await context.route('**/*',route=>{const url=new URL(route.request().url());return url.origin===base||['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)?route.continue():route.abort();});
   assert((await page.goto(base+'/'+language+'/'+shot.file,{waitUntil:'networkidle'})).ok());
   await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
   assert.equal(await page.locator('html').getAttribute('lang'),language);assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.equal(await page.locator('script').count(),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,language+'/'+shot.file);assert.deepEqual(errors,[]);
   const name='client-olympus-'+shot.id+'-'+shot.device+'-dark.jpg';const file=language==='nl'?'assets/img/examples/'+name:'assets/img/localized/'+language+'/examples/'+name;
   const target=path.join(output,file);fs.mkdirSync(path.dirname(target),{recursive:true});await page.screenshot({path:target,type:'jpeg',quality:95});
   images[file]={language,device:shot.device,theme:'dark',width:shot.width,height:shot.height,scale:shot.scale,sha256:crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')};
   console.log('Captured '+language+'/'+shot.id+'/'+shot.device);
  }finally{await context.close();}
 }
 fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({source:'Actual Olympus frontend; invented API fixtures; static translated DOM; portfolio dark palette',sourceCommit,images},null,2)+'\n');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
