/* Local WMS model: fictional orders only. No network, printers or carrier APIs. */
(function(scope){
 'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x)),sum=x=>Object.values(x).reduce((n,v)=>n+Number(v),0);
 const kit={'DEMO-1003':2,'DEMO-1011':2};
 function model(state,D){
  const c=state.client||(state.client={}),w=c.wms||(c.wms={rounds:[],backorders:[],shipped:[],sequence:0,selected:'',picker:'DEMO-P1',mode:'batch'});
  const pickers=[{id:'DEMO-P1',name:'Alex',color:'#17c5ca'},{id:'DEMO-P2',name:'Sam',color:'#ff884d'}];
  const raw=()=>state.orders.filter(o=>o.status!=='Verzonden').map((o,i)=>({id:o.id,customer:t('Voorbeeldkoper')+' '+(i+1),channel:o.channel,country:D.channels.find(c=>c.id===o.channel)?.country||'NL',items:{[o.sku]:o.qty}})).concat([{id:'DEMO-ASSEMBLAGE-01',customer:t('Voorbeeldkoper set'),channel:'webshop',country:'NL',items:kit}]).filter(o=>!w.shipped.includes(o.id));
  const requirements=o=>Object.fromEntries(Object.entries(o.items).filter(([sku])=>!w.backorders.some(b=>b.order===o.id&&b.sku===sku)));
  const complete=o=>Object.entries(requirements(o)).every(([sku,q])=>Number(o.distributed[sku]||0)>=q);
  function rounds(){return w.rounds.filter(r=>!r.cancelled).map(r=>{
   const demand={};r.orders.forEach(o=>Object.entries(requirements(o)).forEach(([sku,q])=>demand[sku]=(demand[sku]||0)+q));
   return {...r,orders:r.orders.map(o=>({...o,complete:complete(o)})),demand,allPicked:Object.entries(demand).every(([sku,q])=>Number(r.picked[sku]||0)>=q),complete:r.orders.every(complete)};
  });}
  function queue(){const reserved=new Set(rounds().flatMap(r=>r.orders.map(o=>o.id)));return raw().filter(o=>!reserved.has(o.id)&&Object.keys(requirements(o)).length);}
  function snapshot(){return {rounds:rounds(),queue:queue(),orders:copy(raw()),openOrders:raw().length,backorders:copy(w.backorders),selected:w.selected,pickers,mode:w.mode,picker:w.picker};}
  function round(id){const r=w.rounds.find(r=>r.id===id&&!r.cancelled);if(!r)throw Error('Kies een actieve pickronde.');return r;}
  function start(picker,mode,limit){
   if(!pickers.some(p=>p.id===picker)||!['batch','direct'].includes(mode)||![5,10,15,20].includes(Number(limit)))throw Error('Controleer de gekozen pickronde.');
   const occupied=new Set(rounds().flatMap(r=>r.orders.filter(o=>!o.released).map(o=>o.bin))),free=Array.from({length:20},(_,i)=>i+1).filter(n=>!occupied.has(n));
   const orders=queue().slice(0,Math.min(Number(limit),free.length));if(!orders.length)throw Error('Geen vrije orders of orderbakken.');
   const r={id:'DEMO-R-'+(++w.sequence),picker,name:pickers.find(p=>p.id===picker).name,mode,revision:1,orders:orders.map((o,i)=>({...copy(o),bin:free[i],distributed:{},released:false})),picked:{},skipped:{},cancelled:false};
   w.rounds.push(r);w.selected=r.id;w.picker=picker;w.mode=mode;return copy(r);
  }
  function proposals(r,sku,amount){let left=amount;return r.orders.flatMap(o=>{const q=Math.min(left,Math.max(0,(requirements(o)[sku]||0)-Number(o.distributed[sku]||0)));left-=q;return q?[{order:o.id,bin:o.bin,quantity:q}]:[];});}
  function pick(id,sku,quantity,revision,confirmed=false){
   const r=round(id),view=rounds().find(r=>r.id===id),q=Number(quantity),allocated=r.orders.reduce((n,o)=>n+Number(o.distributed[sku]||0),0);
   if(r.revision!==revision)throw Error('De ronde is gewijzigd. Open het artikel opnieuw.');
   if(!Object.hasOwn(view.demand,sku)||!Number.isInteger(q)||q<allocated||q>view.demand[sku])throw Error('Controleer het pickaantal.');
   if(r.mode==='direct'&&q>Number(r.picked[sku]||0)&&!confirmed)throw Error('Bevestig de plaatsing in de orderbakken.');
   if(r.mode==='direct')proposals(r,sku,q-allocated).forEach(a=>{const o=r.orders.find(o=>o.id===a.order);o.distributed[sku]=(o.distributed[sku]||0)+a.quantity;});
   r.picked[sku]=q;delete r.skipped[sku];r.revision++;return snapshot();
  }
  function distribute(id,sku,revision,confirmed){
   const r=round(id),view=rounds().find(r=>r.id===id);
   if(r.revision!==revision||!confirmed||!view.allPicked)throw Error('Controleer en bevestig de artikelverdeling.');
   const allocated=r.orders.reduce((n,o)=>n+Number(o.distributed[sku]||0),0),rows=proposals(r,sku,Number(r.picked[sku]||0)-allocated);
   if(!rows.length)throw Error('Dit artikel is al verdeeld.');
   rows.forEach(a=>{const o=r.orders.find(o=>o.id===a.order);o.distributed[sku]=(o.distributed[sku]||0)+a.quantity;});r.revision++;return snapshot();
  }
  function cancel(id,confirmed){const r=round(id);if(!confirmed||r.orders.some(o=>o.released))throw Error('Controleer eerst de bakken en teruggelegde artikelen.');r.cancelled=true;r.revision++;w.selected='';return snapshot();}
  function skip(id,sku){const r=round(id);if(!rounds().find(x=>x.id===id).demand[sku])throw Error('Onbekend artikel.');r.skipped[sku]=true;r.revision++;return snapshot();}
  function backorder(id,order,sku){const r=round(id),o=r.orders.find(o=>o.id===order);if(!o||!o.items[sku]||Number(o.distributed[sku]||0)||Number(r.picked[sku]||0))throw Error('Alleen een nog niet gepickte orderregel kan op backorder.');if(!w.backorders.some(b=>b.order===order&&b.sku===sku))w.backorders.push({order,sku,quantity:o.items[sku]});r.revision++;return snapshot();}
  function restore(order,sku){const i=w.backorders.findIndex(b=>b.order===order&&b.sku===sku);if(i<0)throw Error('Backorder niet gevonden.');const active=rounds().find(r=>r.orders.some(o=>o.id===order));if(active&&active.orders.some(o=>o.released))throw Error('Deze order is al vrijgegeven.');w.backorders.splice(i,1);if(active)round(active.id).revision++;return snapshot();}
  function ship(id,order,method,confirmed){
   const r=round(id),o=r.orders.find(o=>o.id===order);if(!o||!complete(o)||o.released||!confirmed||!['postnl','dhl','pickup'].includes(method)||method==='pickup'&&o.channel!=='webshop')throw Error('Controleer order, verzendwijze en bevestiging.');
   if(w.backorders.some(b=>b.order===order))throw Error('Los eerst de openstaande backorder op.');
   o.released=true;w.shipped.push(o.id);const original=state.orders.find(x=>x.id===o.id);if(original)original.status='Verzonden';r.revision++;return snapshot();
  }
  return {snapshot,start,pick,distribute,proposals,cancel,skip,backorder,restore,ship,select:id=>{round(id);w.selected=id;}};
 }
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const t=x=>scope.SiteI18n?.text(x)??x;
 const label=x=>esc(t(x));
 const button=(title,action,data='')=>`<button type="button" data-wms-demo="${action}" ${data}>${label(title)}</button>`;
 const attrs=(r,sku='')=>`data-round="${r.id}" data-revision="${r.revision}" data-sku="${esc(sku)}"`;
 const bin=n=>`<span class="wms-bin-number" style="--wms-bin-hue:${Math.round((210+(n-1)*137.508)%360)}">${label('Bak')} ${n}</span>`;
 function view(api,D,state,tab='overzicht'){
  const s=api.snapshot(),active=s.rounds.find(r=>r.id===s.selected)||s.rounds.find(r=>!r.complete),p=sku=>D.product(state,sku);
  const photo=sku=>`<span class="wms-article-photo"><img src="${esc(p(sku)?.image)}" alt="${esc(p(sku)?.name)}" loading="lazy"></span>`;
  const navigation=`<nav class="warehouse-navigation" aria-label="${label('Magazijnstatus')}">${[['overzicht','Openstaande orders',s.openOrders],['picken','Openstaande pickrondes',s.rounds.filter(r=>!r.complete).length],['verdelen','Verdelen',s.rounds.filter(r=>r.allPicked&&!r.complete).length],['verzenden','Wordt ingepakt',s.rounds.flatMap(r=>r.orders.filter(o=>o.complete&&!o.released)).length],['backorders','Backorders',s.backorders.length]].map(([id,name,n])=>`<button type="button" data-full-page="wms" data-full-tab="${id}" aria-current="${tab===id?'page':'false'}"><span>${label(name)}</span><b>${n}</b></button>`).join('')}</nav>`;
  const rounds=s.rounds.filter(r=>!r.orders.every(o=>o.released)).map(r=>`<button class="wms-round-card" data-wms-demo="select" ${attrs(r)} style="--wms-picker-color:${s.pickers.find(p=>p.id===r.picker).color}"><strong>${esc(r.name)} · ${r.orders.length} ${label('orders')}</strong><span class="wms-round-meta"><span>${r.orders.filter(o=>o.complete).length} / ${r.orders.length}</span><small class="wms-round-mode">${label(r.mode==='direct'?'Direct in de bakken':'Eerst picken, dan verdelen')}</small></span></button>`).join('');
  const start=`<details class="wms-fold" data-wms-start-fold><summary>${label('Start nieuwe pickronde')}</summary><form data-wms-form="start" class="wms-start"><label>${label('Kies een orderpicker')}<select name="picker">${s.pickers.map(p=>`<option value="${p.id}"${p.id===s.picker?' selected':''}>${esc(p.name)}</option>`).join('')}</select></label><details class="wms-fold"><summary>${label('Werkwijze')}</summary><label><input type="radio" name="mode" value="batch"${s.mode==='batch'?' checked':''}>${label('Eerst alles picken, daarna verdelen')}</label><label><input type="radio" name="mode" value="direct"${s.mode==='direct'?' checked':''}>${label('Direct in de orderbakken')}</label></details><label>${label('Aantal orders')}<select name="limit">${[5,10,15,20].map(n=>`<option>${n}</option>`).join('')}</select></label><button type="submit"${s.queue.length?'':' disabled'}>${label('Gekozen kleurbakken bekijken')}</button></form></details>`;
  let body='';
  if(tab==='overzicht')body=`<div class="wms-next">${s.orders.map(o=>`<article class="wms-bin-card"><strong data-i18n-ignore>${esc(o.id)}</strong><p>${esc(o.customer)}</p>${Object.entries(o.items).map(([sku,q])=>`<div class="wms-bin-line">${photo(sku)}<span>${esc(sku)}<small>${esc(p(sku)?.name)}</small></span><b>${q}×</b></div>`).join('')}</article>`).join('')||`<p>${label('Geen vrije orders of orderbakken.')}</p>`}</div>`;
  if(tab==='picken'||tab==='verdelen'){
   body=`<div class="wms-round-cards">${rounds}</div>`;
   if(active){
    const r=active;
    body+=`<section class="wms-active-round-bar"><div class="wms-round-heading"><h2>${label('Pickronde')} · ${esc(r.name)}</h2>${button('Ronde annuleren','cancel',attrs(r)+(r.orders.some(o=>o.released)?' disabled':''))}${button('Picklijst printen','print',attrs(r))}</div></section>`;
    if(tab==='picken')body+=`<form data-wms-form="scan" class="wms-scan-form" ${attrs(r)}><label>${label('Artikel kiezen of scannen')}<input name="code" maxlength="128" autocomplete="off" required></label><button>${label('Scannen')}</button><p>${label('Scan een artikelnummer of kies een artikel hieronder.')}</p></form><div class="wms-pick-grid">${Object.entries(r.demand).sort(([a],[b])=>(p(a)?.location||'').localeCompare(p(b)?.location||'')).map(([sku,q])=>`<article class="wms-pick-card" data-sku="${esc(sku)}">${photo(sku)}<div><strong data-i18n-ignore>${esc(sku)}</strong><p>${esc(p(sku)?.name)}</p><b>${esc(p(sku)?.location)}</b><p>${label('Gepickt')} ${r.picked[sku]||0} / ${q} ${r.skipped[sku]?label('Overgeslagen'):''}</p>${button('Pickaantal bevestigen','pick',attrs(r,sku))}${button('Overslaan','skip',attrs(r,sku))}</div></article>`).join('')}</div>${r.allPicked&&r.mode==='batch'?`<div class="wms-distribution-prompt"><strong>${label('Alles gepickt · verdeel nu de artikelen over de orderbakken')}</strong><button data-full-page="wms" data-full-tab="verdelen">${label('Start verdelen')}</button></div>`:''}`;
    else body+=r.allPicked?`<div class="wms-distribution-articles">${Object.entries(r.demand).map(([sku,q])=>{const allocated=r.orders.reduce((n,o)=>n+Number(o.distributed[sku]||0),0);return `<article class="wms-bin-card">${photo(sku)}<strong data-i18n-ignore>${esc(sku)}</strong><p>${esc(p(sku)?.name)}</p><p>${allocated} / ${q} ${label('verdeeld')}</p>${button('Artikel verdelen','distribute',attrs(r,sku)+(allocated>=q?' disabled':''))}</article>`;}).join('')}</div>`:`<p>${label('Pick eerst alle artikelen van deze ronde.')}</p>`;
    body+=`<details class="wms-fold"><summary>${label('Orders en bakken')}</summary>${r.orders.map(o=>`<article class="wms-bin-card">${bin(o.bin)}<strong data-i18n-ignore>${esc(o.id)}</strong><p>${label(o.complete?'Compleet':'Nog niet compleet')}</p>${Object.keys(o.items).map(sku=>`<p>${esc(sku)} · ${o.distributed[sku]||0} / ${o.items[sku]} ${button('Op backorder zetten','backorder',attrs(r,sku)+` data-order="${o.id}"`)}</p>`).join('')}</article>`).join('')}</details>`;
   }else body+=`<p>${label('Start een pickronde om de artikelen te verzamelen.')}</p>`;
  }
  if(tab==='backorders')body=s.backorders.map(b=>`<article class="wms-bin-card"><strong>${esc(b.order)} · ${esc(b.sku)}</strong><p>${b.quantity}× · ${esc(p(b.sku)?.name)}</p>${button('Terug naar te picken','restore',`data-order="${b.order}" data-sku="${b.sku}"`)}</article>`).join('')||`<p>${label('Geen openstaande backorders.')}</p>`;
  if(tab==='verzenden')body=s.rounds.flatMap(r=>r.orders.filter(o=>o.complete&&!o.released).map(o=>`<article class="wms-bin-card">${bin(o.bin)}<h2>${esc(o.id)}</h2><p>${esc(o.customer)}</p>${Object.entries(o.items).map(([sku,q])=>`<div class="wms-bin-line">${photo(sku)}<span>${esc(p(sku)?.name)}</span><b>${q}×</b></div>`).join('')}${button('Order inpakken','shipping',attrs(r)+` data-order="${o.id}"`)}</article>`)).join('')||`<p>${label('Nog geen complete orders om in te pakken.')}</p>`;
  return `<section class="hero-panel wms-hero"><h1>WMS · ${label({overzicht:'Overzicht',picken:'Picken',verdelen:'Verdelen',verzenden:'Verzenden',backorders:'Backorders'}[tab]||'Overzicht')}</h1></section>${navigation}<section class="wms-workbench" data-wms-demo-root><p class="wms-demo-notice">${label('Fictieve demo. Er worden geen labels gekocht, printers aangestuurd of orders extern verzonden.')}</p>${start}<p role="status" data-wms-demo-status></p>${body}</section>`;
 }
 let controller;
 function destroy(){controller?.abort();controller=null;}
 function mount(root,{api,D,state,tab,refresh,navigate}){
  destroy();controller=new AbortController();const signal=controller.signal;
  const product=sku=>D.product(state,sku),get=id=>api.snapshot().rounds.find(r=>r.id===id),message=err=>{root.querySelector('[data-wms-demo-status]').textContent=t(err.message||err);};
  function modal(title,html,callback){const dialog=document.createElement('dialog');dialog.className='wms-cancel-dialog wms-demo-dialog';dialog.innerHTML=`<form><h2>${label(title)}</h2>${html}<p role="alert"></p><div class="wms-cancel-actions"><button type="button" data-close>${label('Terug')}</button><button type="submit">${label('Bevestigen')}</button></div></form>`;root.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove());dialog.querySelector('form').onsubmit=e=>{e.preventDefault();try{callback(new FormData(e.target));dialog.close();refresh();}catch(err){dialog.querySelector('[role=alert]').textContent=t(err.message);}};dialog.showModal();return dialog;}
  function openPick(r,sku){const q=r.demand[sku],picked=Number(r.picked[sku]||0);const dialog=modal('Pickaantal bevestigen',`<strong data-i18n-ignore>${esc(sku)}</strong><p>${esc(product(sku)?.name)}</p><p>${label('Locatie')} ${esc(product(sku)?.location)}</p><label>${label('Totaal gepickt')}<input name="quantity" type="number" min="0" max="${q}" value="${q}" step="1" required></label><p>${label('Benodigd')} ${q}</p>${r.mode==='direct'?`<div class="wms-bin-lines" data-direct-proposal>${api.proposals(r,sku,q-r.orders.reduce((n,o)=>n+Number(o.distributed[sku]||0),0)).map(a=>`<div>${bin(a.bin)} ${a.quantity}× · ${esc(a.order)}</div>`).join('')}</div><label><input name="placed" type="checkbox" required>${label('Ik heb de artikelen in de juiste bakken gelegd')}</label>`:''}`,f=>api.pick(r.id,sku,f.get('quantity'),r.revision,f.has('placed')));if(r.mode==='direct'){const input=dialog.querySelector('[name=quantity]');input.addEventListener('input',()=>{dialog.querySelector('[name=placed]').checked=false;const allocated=r.orders.reduce((n,o)=>n+Number(o.distributed[sku]||0),0);dialog.querySelector('[data-direct-proposal]').innerHTML=api.proposals(r,sku,Math.max(0,Number(input.value)-allocated)).map(a=>`<div>${bin(a.bin)} ${a.quantity}× · ${esc(a.order)}</div>`).join('');});}}
  root.addEventListener('click',e=>{const b=e.target.closest('[data-wms-demo]');if(!b||b.disabled)return;const a=b.dataset,d=a.wmsDemo,r=get(a.round);try{
   if(d==='select'){api.select(r.id);refresh();}
   if(d==='pick')openPick(r,a.sku);
   if(d==='skip'){api.skip(r.id,a.sku);refresh();}
   if(d==='cancel')modal('Pickronde annuleren',`<p>${label('Leg alle gepickte artikelen terug en maak de bakken leeg.')}</p><label><input type="checkbox" name="confirmed" required>${label('Alles terug op voorraad gelegd')}</label>`,f=>api.cancel(r.id,f.has('confirmed')));
   if(d==='distribute'){const allocated=r.orders.reduce((n,o)=>n+Number(o.distributed[a.sku]||0),0);modal('Artikel verdelen',`<strong data-i18n-ignore>${esc(a.sku)}</strong><p>${esc(product(a.sku)?.name)}</p>${api.proposals(r,a.sku,Number(r.picked[a.sku]||0)-allocated).map(x=>`<div class="wms-distribution-proposal-row">${bin(x.bin)}<span>${x.quantity}× · ${esc(x.order)}</span></div>`).join('')}`,()=>api.distribute(r.id,a.sku,r.revision,true));}
   if(d==='backorder')modal('Bevestig backorder',`<p>${esc(a.order)} · ${esc(a.sku)}</p>`,()=>api.backorder(r.id,a.order,a.sku));
   if(d==='restore'){api.restore(a.order,a.sku);refresh();}
   if(d==='shipping'){const o=r.orders.find(o=>o.id===a.order);modal('Order inpakken',`<p>${esc(o.id)} · ${esc(o.customer)}</p><label>${label('Verzendwijze')}<select name="method"><option value="postnl">PostNL</option><option value="dhl">DHL</option>${o.channel==='webshop'?`<option value="pickup">${label('Afhalen')}</option>`:''}</select></label><details class="wms-fold"><summary>${label('Pakbon bekijken')}</summary><h3>${label('Pakbon')} · ${esc(o.id)}</h3>${Object.entries(o.items).map(([sku,q])=>`<p>${q}× ${esc(sku)} · ${esc(product(sku)?.name)}</p>`).join('')}</details><p>${label('Alleen een lokale simulatie; er wordt geen verzendlabel gekocht.')}</p><label><input type="checkbox" name="confirmed" required>${label('Ik heb de artikelen en order gecontroleerd')}</label>`,f=>api.ship(r.id,o.id,f.get('method'),f.has('confirmed')));}
   if(d==='print'){modal('Picklijst printen',r.orders.map(o=>`<h3>${label('Bak')} ${o.bin} · ${esc(o.id)}</h3>${Object.entries(o.items).map(([sku,q])=>`<p>${q}× ${esc(sku)} · ${esc(product(sku)?.location)}</p>`).join('')}`).join(''),()=>scope.print());}
  }catch(err){message(err);}},{signal});
  root.addEventListener('submit',e=>{const form=e.target.closest('[data-wms-form]');if(!form)return;e.preventDefault();try{const f=new FormData(form);if(form.dataset.wmsForm==='start'){const snapshot=api.snapshot(),occupied=new Set(snapshot.rounds.flatMap(r=>r.orders.filter(o=>!o.released).map(o=>o.bin))),free=Array.from({length:20},(_,i)=>i+1).filter(n=>!occupied.has(n)),queue=snapshot.queue.slice(0,Math.min(Number(f.get('limit')),free.length));modal('Gekozen kleurbakken',queue.map((o,i)=>`<div>${bin(free[i])} ${esc(o.id)}</div>`).join(''),()=>api.start(f.get('picker'),f.get('mode'),Number(f.get('limit'))));}else{const r=get(form.dataset.round),code=String(f.get('code')).trim().toLowerCase(),sku=Object.keys(r.demand).find(sku=>[sku,product(sku)?.ean].some(x=>x?.toLowerCase()===code));if(!sku)throw Error('Dit artikel hoort niet bij deze pickronde.');openPick(r,sku);}}catch(err){message(err);}},{signal});
 }
 const api={model,view,mount,destroy};if(typeof module!=='undefined'&&module.exports)module.exports=api;else scope.DemoWms=api;
})(typeof window!=='undefined'?window:globalThis);
