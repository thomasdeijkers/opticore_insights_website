/* Render only local, fictitious examples. Never connects to production apps. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const ROOT=path.resolve(__dirname,'..');
const site=new URL(process.env.DEMO_CAPTURE_BASE||'http://127.0.0.1:8765/');
const fixtures=new URL(process.env.DEMO_FIXTURE_BASE||'http://127.0.0.1:8766/');
for(const u of [site,fixtures])assert(['127.0.0.1','localhost'].includes(u.hostname),'Capture only local examples');
const darkName=name=>name.replace(/(\.[^.]+)$/,'-dark$1');
const {catalogue}=require('../assets/js/modular-webapp.js');
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'scripts/neutral_visuals_manifest.json'),'utf8'));
const newPath=name=>/-dark\.[^.]+$/.test(name)?name:darkName(name);
const records=[];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  async function capture(url,file,width,height,{modal,fullPage=false,scale=1}={}){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:scale,colorScheme:'dark',reducedMotion:'reduce'}),errors=[];
   await page.route('**/*',route=>[site.origin,fixtures.origin].includes(new URL(route.request().url()).origin)?route.continue():route.abort());
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(url,{waitUntil:'networkidle'});assert(response.ok(),url);
   await page.evaluate(()=>document.fonts.ready);
   if(url.startsWith(site.href+'demo/'))assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
   if(modal){await page.locator(modal).first().click();await page.locator('dialog[open]').waitFor();}
   await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=img.onerror=resolve;})));});
   assert.deepEqual(errors,[],url);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal page overflow: '+url);
   const target=path.join(ROOT,'assets/img',file);fs.mkdirSync(path.dirname(target),{recursive:true});
   await page.screenshot({path:target,fullPage,...(/\.jpg$/.test(file)?{type:'jpeg',quality:88}:{type:'png'})});
   const actualHeight=fullPage?await page.evaluate(()=>document.documentElement.scrollHeight):height;
   records.push({file,width,height:actualHeight,scale,url,theme:'dark'});await page.close();
  }
  const app=(module,view='overzicht',screen='')=>new URL('demo/modulaire-webapp/?'+new URLSearchParams({module,view,theme:'dark',...(screen?{screen}:{})}),site).href;
  const teaserOnly=process.argv.includes('--teaser-only');
  await capture(app('dashboard'),'demo/dashboard-portrait-dark-3x.png',390,844,{fullPage:true,scale:3});
  if(!teaserOnly)for(const [device,width,height] of [['desktop',1280,900],['mobile',390,844]]){
   for(const module of Object.keys(catalogue))for(const view of ['overzicht','details']){
    const modal=view==='details'?(module==='omzet'?'[data-article]':module==='producten'?'[data-demo-row]':null):null;
    await capture(app(module,view),`module-examples/${module}-${view}-${device}-dark.jpg`,width,height,{modal});
   }
   console.log(device+' module screens captured.');
  }
  if(!teaserOnly)for(const item of manifest){
   const name=item.file.replace(/-dark(?=\.[^.]+$)/,'');
   let url=new URL(item.page+'.html',fixtures).href,modal;
   if(name.startsWith('management-'))url=app('dashboard');
   else if(name.startsWith('forecast-'))url=app('forecasting');
   else if(name.startsWith('stock-'))url=app('voorraad');
   else if(name.startsWith('ranking-')){url=app('marketing','details');if(name==='ranking-mobile.jpg')modal='[data-demo-row]';}
   else if(name.startsWith('marketing-'))url=name==='marketing-overview-mobile.jpg'?app('marketing'):app('marketing','overzicht','agent');
   else if(name.startsWith('listing-')){url=app('producten','details');if(name==='listing-editor-mobile.jpg')modal='[data-demo-row]';}
   await capture(url,'examples/'+newPath(item.file),item.width,item.height,{modal});
  }
  const report=process.env.DEMO_CAPTURE_REPORT;
  if(report)fs.writeFileSync(report,JSON.stringify(records,null,2));
  console.log(records.length+' dark app images captured from local, fictitious examples.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
