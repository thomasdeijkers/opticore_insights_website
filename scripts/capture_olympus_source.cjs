/* Render the actual, locally running Olympus frontend using invented API records.
   Usage: node scripts/capture_olympus_source.cjs --output=<absolute directory>
   The private frontend is never copied into this repository or the media bundle. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const fixture=require('./olympus_capture_fixture.cjs');
const output=process.argv.find(a=>a.startsWith('--output='))?.slice(9);
assert(output&&path.isAbsolute(output),'An external absolute snapshot directory is required');
const root=path.resolve(__dirname,'..');assert(!path.resolve(output).startsWith(root+path.sep));
const base=new URL(process.env.OLYMPUS_CAPTURE_BASE||'http://127.0.0.1:8874/');
assert(['127.0.0.1','localhost'].includes(base.hostname),'Only local Olympus frontends are allowed');
const devices={desktop:{width:1280,height:900,scale:2},tablet:{width:834,height:1112,scale:2},mobile:{width:390,height:844,scale:3}};
const scenes=[{id:'dashboard',route:'taken',heading:'Dashboard'},{id:'planning',route:'planning',heading:'Weekplanning'},{id:'opdrachten',route:'opdrachten',heading:'Opdrachten'},{id:'menu',route:'taken',heading:'Dashboard',only:'mobile'}];

// Apply the portfolio dark palette to actual computed Olympus styles, not pixels.
function snapshot(){
 const rgb=value=>{const m=value?.match(/^rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?\)$/);return m?{r:+m[1],g:+m[2],b:+m[3],a:m[4]===undefined?1:+m[4]}:null;};
 const hsl=c=>{const a=[c.r,c.g,c.b].map(v=>v/255),max=Math.max(...a),min=Math.min(...a),d=max-min,l=(max+min)/2;let h=0;if(d){h=max===a[0]?(a[1]-a[2])/d+(a[1]<a[2]?6:0):max===a[1]?(a[2]-a[0])/d+2:(a[0]-a[1])/d+4;h*=60;}return {h,s:d?d/(1-Math.abs(2*l-1)):0,l};};
 const background=value=>{const c=rgb(value);if(!c||c.a===0)return value;const {h,s,l}=hsl(c);if(s>.65&&l>.3&&l<.75)return value;if(l>.83){if(s>.15){if(h>70&&h<170)return '#14372c';if(h<65)return '#3b3022';if(h>170&&h<250)return '#153047';return '#34263e';}return l>.98?'#122731':'#0b1c26';}if(l>.65)return '#263d47';if(s>.1&&h>70&&h<170)return '#234c38';if(s>.1&&h>170&&h<265)return '#263d5c';return value;};
 const text=(value,bright)=>{const c=rgb(value);if(!c||c.a===0)return value;const {h,s,l}=hsl(c);if(bright&&l<.55)return '#23323c';if(s<.25)return l<.4?'#e1eaef':l<.8?'#a5b8c2':'#eef4f6';if(h>70&&h<170)return '#86c6a1';if(h<65)return '#edc479';if(h>170&&h<250)return '#9acbe5';return '#d4a8db';};
 const copy=document.documentElement.cloneNode(true),originals=[...document.documentElement.querySelectorAll('*')],clones=[...copy.querySelectorAll('*')];
 for(let i=0;i<originals.length;i++){
  const from=originals[i],to=clones[i];if(!to||from.tagName!==to.tagName)throw Error('Snapshot tree mismatch');
  const style=getComputedStyle(from),bg=rgb(style.backgroundColor),bright=bg&&bg.a>.5&&hsl(bg).s>.65&&hsl(bg).l>.3&&hsl(bg).l<.75;
  for(const property of ['background-color','color','border-top-color','border-right-color','border-bottom-color','border-left-color']){
   const value=style.getPropertyValue(property);let target=property==='background-color'?background(value):property==='color'?text(value,bright):rgb(value)?.a===0?value:'#304650';const original=rgb(value);if(property==='background-color'&&original?.a>0&&original.a<1&&/^#[0-9a-f]{6}$/i.test(target)){const parts=target.slice(1).match(/../g).map(x=>parseInt(x,16));target=`rgba(${parts.join(',')},${original.a})`;}to.style.setProperty(property,target,'important');
  }
  if(from.matches('.brand,.brand img'))to.style.setProperty('background-color','#fff','important');
  if(from.tagName==='INPUT')to.setAttribute('value',from.value);
  if(from.tagName==='TEXTAREA')to.textContent=from.value;
  if(from.tagName==='OPTION')to.toggleAttribute('selected',from.selected);
 }
 copy.setAttribute('lang','nl');copy.setAttribute('data-olympus-capture','actual-frontend');copy.setAttribute('data-theme','dark');
 copy.querySelectorAll('script,link[rel=modulepreload]').forEach(n=>n.remove());
 const style=document.createElement('style');style.textContent='html,body{background:#0b1c26!important;color:#e1eaef!important;color-scheme:dark}.brand{background:white!important}.brand img{background:white!important}.capture-data-note{border:1px solid #467861;border-radius:5px;background:#19382c!important;color:#a5d8b9!important;padding:5px 9px;font-size:11px;white-space:nowrap}@media(max-width:1100px){.top-right .secure-tag{display:none}}@media(max-width:760px){.topbar{flex-wrap:wrap;height:auto;min-height:61px;row-gap:8px;padding-block:10px}.top-right{margin-left:auto;flex-shrink:0}}*{animation:none!important;transition:none!important;caret-color:transparent!important}';copy.querySelector('head').append(style);
 const note=document.createElement('span');note.className='capture-data-note';note.textContent='Fictieve gegevens';copy.querySelector('.top-right')?.prepend(note);
 return '<!doctype html>'+copy.outerHTML;
}

(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});try{
 const records=[];
 for(const [device,size] of Object.entries(devices))for(const scene of scenes.filter(s=>!s.only||s.only===device)){
  const context=await browser.newContext({viewport:{width:size.width,height:size.height},deviceScaleFactor:size.scale,reducedMotion:'reduce',timezoneId:'Europe/Amsterdam'}),page=await context.newPage(),errors=[],unknown=[];
  page.on('pageerror',error=>errors.push(error.message));
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname))return route.continue();if(url.origin!==base.origin)return route.abort();if(!url.pathname.startsWith('/api/'))return route.continue();try{return route.fulfill({json:fixture.response(url.pathname+url.search,route.request().method())});}catch(error){unknown.push(error.message);return route.fulfill({status:500,json:{detail:error.message}});}});
  await page.goto(new URL('/dashboard/'+scene.route+'?jaar=2026&week=43',base).href,{waitUntil:'networkidle'});
  await page.getByRole('heading',{level:1,name:scene.heading,exact:true}).waitFor();
  if(scene.id==='planning')await page.locator('.planning-compact tbody tr').first().waitFor();
  if(scene.id==='opdrachten')await page.locator('.orders-workspace tbody tr').first().waitFor();
  if(scene.id==='menu')await page.locator('.mobile-menu').click();
  await page.evaluate(()=>document.fonts.ready);
  assert.deepEqual(errors,[]);assert.deepEqual(unknown,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  let html=await page.evaluate(snapshot);
  // Source images only contain the already-public Olympus logo; inline it.
  const logo=await context.request.get(new URL('/olympus_bouw_logo.png',base).href);assert(logo.ok());
  html=html.replaceAll('/olympus_bouw_logo.png','data:image/png;base64,'+(await logo.body()).toString('base64'));
  const name=scene.id+'-'+device;fs.writeFileSync(path.join(output,name+'.html'),html);
  records.push({id:scene.id,device,...size,file:name+'.html'});await context.close();console.log('Actual Olympus snapshot: '+name);
 }
 fs.writeFileSync(path.join(output,'snapshots.json'),JSON.stringify(records,null,2)+'\n');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1});
