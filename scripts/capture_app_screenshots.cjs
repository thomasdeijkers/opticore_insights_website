const demoBrowserSession=require('./demo_browser_session.cjs');
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
  async function capture(url,file,width,height,{modal,expand,fullPage=false,scale=2}={}){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:scale,colorScheme:'dark',reducedMotion:'reduce'}),errors=[];
   await page.route('**/*',route=>[site.origin,fixtures.origin].includes(new URL(route.request().url()).origin)?route.continue():route.abort());
   await demoBrowserSession(page,site);
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(url,{waitUntil:'networkidle'});assert(response.ok(),url);
   await page.evaluate(()=>document.fonts.ready);
   if(url.startsWith(site.href+'demo/'))assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
   if(expand){const summary=page.locator(expand).first();await summary.focus();await summary.press('Enter');}
   if(modal){assert.deepEqual(errors,[],url);assert(await page.locator(modal).count(),'Missing screenshot control: '+url);const target=page.locator(modal).first(),parent=target.locator('xpath=ancestor::details').first();if(await parent.count()&&await parent.getAttribute('open')===null){const summary=parent.locator(':scope>summary');await summary.focus();await summary.press('Enter');}await target.click();await page.locator('dialog[open]').waitFor();}
   await page.evaluate(async()=>{const images=[...document.images];images.forEach(img=>img.loading='eager');await Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=img.onerror=resolve;})));});
   assert.deepEqual(errors,[],url);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal page overflow: '+url);
   const target=path.join(ROOT,'assets/img',file);fs.mkdirSync(path.dirname(target),{recursive:true});
   await page.screenshot({path:target,fullPage,...(/\.jpg$/.test(file)?{type:'jpeg',quality:94}:{type:'png'})});
   const actualHeight=fullPage?await page.evaluate(()=>document.documentElement.scrollHeight):height;
   records.push({file,width,height:actualHeight,scale,url,theme:'dark'});await page.close();
  }
  const routes={dashboard:[['dashboard'],['dashboard']],omzet:[['omzet'],['artikelkaart']],forecasting:[['forecasting','overview'],['forecasting','seasonality']],voorraad:[['voorraad'],['voorraad-incourant']],inkoop:[['inkoop','overview'],['inkoop','ordered']],logistiek:[['locaties'],['fulfilment','transit']],producten:[['publicaties'],['verbeteringen']],orders:[['orders'],['retouren','processing']],marketing:[['ads-engine','campaigns'],['bol-ranking']],financieel:[['exploitatie','stats'],['bol-afrekening']],controles:[['signalen','open'],['signalen','handled']]};
  const app=(module,view='overzicht',screen='')=>{let [page,tab]=routes[module][view==='details'?1:0];if(screen==='agent')page='marketing-agent';return new URL('demo/modulaire-webapp/?'+new URLSearchParams({page,theme:'dark',...(tab?{tab}:{})}),site).href;};
  const teaserOnly=process.argv.includes('--teaser-only');
  const dashboardOnly=process.argv.includes('--dashboard-only');
  const productScreensOnly=process.argv.includes('--product-screens-only');
  for(const [device,width,height,scale] of [['desktop',1440,1000,2],['tablet',1112,834,2],['mobile',390,844,3]])await capture(app('dashboard'),`demo/dashboard-client-${device}-dark.png`,width,height,{fullPage:true,scale});
  if(!teaserOnly&&!dashboardOnly&&!productScreensOnly)for(const [device,width,height] of [['desktop',1280,900],['tablet',834,1112],['mobile',390,844]]){
   for(const module of Object.keys(catalogue))for(const view of ['overzicht','details']){
    const modal=view==='details'&&module==='producten'?'[data-w-host="listing"]':null;
    await capture(app(module,view),`module-examples/client-${module}-${view}-${device}-dark.jpg`,width,height,{modal});
   }
   console.log(device+' module screens captured.');
  }
  if(!teaserOnly)for(const item of manifest){
   // Actual Olympus captures are restored from their pinned media release.
   if(item.source==='olympus')continue;
   if(dashboardOnly&&!item.file.startsWith('client-management-'))continue;
   if(productScreensOnly&&!/^client-(management|forecast|stock|ranking|marketing|listing)-/.test(item.file))continue;
   const name=item.file.replace(/^client-/,'').replace(/-dark(?=\.[^.]+$)/,'');
   let url=new URL(item.page+'.html',fixtures).href,modal,expand;
   if(name.startsWith('management-'))url=app('dashboard');
   else if(name.startsWith('forecast-'))url=app('forecasting');
   else if(name.startsWith('stock-'))url=app('voorraad');
   else if(name.startsWith('ranking-')){url=name==='ranking-overview-mobile.jpg'?new URL('demo/modulaire-webapp/?page=bol-ranking&tab=movers&theme=dark',site).href:app('marketing','details');}
   else if(name.startsWith('marketing-'))url=name==='marketing-overview-mobile.jpg'?app('marketing'):app('marketing','overzicht','agent');
   else if(name.startsWith('listing-')){url=app('producten','details');if(name==='listing-editor-mobile.jpg')modal='[data-w-host="listing"]';}
   await capture(url,'examples/'+newPath(item.file),item.width,item.height,{modal,expand});
   if(item.file.includes('-desktop-'))await capture(url,'examples/'+newPath(item.file).replace('-desktop-','-tablet-'),834,1112,{modal,expand});
  }
  const report=process.env.DEMO_CAPTURE_REPORT;
  if(report)fs.writeFileSync(report,JSON.stringify(records,null,2));
  console.log(records.length+' dark app images captured from local, fictitious examples.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
