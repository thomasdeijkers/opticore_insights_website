/* Native warehouse_picklist.py/.js/.css interface, adapted to fictional local
   order lines. Picking reserves work; it never dispatches orders or edits stock. */
window.DemoPicklist=(()=>{
 'use strict';
 const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
 const partMap={'DEMO-SET-DESK':[['DEMO-1003',1],['DEMO-1011',1]]};
 function expand(sku,quantity,seen=[]){
  if(seen.includes(sku))throw Error('Circulaire samenstelling.');
  if(!partMap[sku])return [[sku,quantity]];
  return partMap[sku].flatMap(([part,count])=>expand(part,quantity*count,[...seen,sku]));
 }
 function lines(state){
  return [...state.orders.filter(o=>o.status!=='Verzonden').map(o=>({id:o.id,sku:o.sku,qty:o.qty})),{id:'DEMO-ASSEMBLAGE-01',sku:'DEMO-SET-DESK',qty:2}].flatMap(o=>expand(o.sku,o.qty).map(([sku,quantity])=>({key:o.id+'|'+o.sku+'|'+sku,sku,quantity})));
 }
 function model(state,client,D){
  if(!client.pickProgress){client.pickProgress={};const started=lines(state).find(l=>l.key==='DEMO-O-2042|DEMO-1002|DEMO-1002');if(started)client.pickProgress[started.key]=1;}
  const progress=client.pickProgress;
  function data(){
   const grouped=new Map();
   for(const line of lines(state)){
    const product=D.product(state,line.sku);if(!product)continue;
    const row=grouped.get(line.sku)||{sku:line.sku,title:product.name,image_url:product.image,location:product.location||'Onbekend',to_pick:0,picked:0,not_picked:0};
    const recorded=own(progress,line.key),picked=Math.max(0,Math.min(line.quantity,Number(progress[line.key])||0));
    row.picked+=picked;row[recorded?'not_picked':'to_pick']+=line.quantity-picked;grouped.set(line.sku,row);
   }
   const rows=[...grouped.values()].sort((a,b)=>a.location.localeCompare(b.location)||a.sku.localeCompare(b.sku)),result={counts:{}};
   for(const key of ['to_pick','picked','not_picked']){result[key]=rows.filter(r=>r[key]>0).map(r=>({...r,quantity:r[key],picked_quantity:r.picked}));result.counts[key]=result[key].length;}
   return result;
  }
  function update(sku,picked,quantity,scope){
   if(!['to_pick','not_picked'].includes(scope))throw Error('Onbekende pickstatus.');
   const source=lines(state).filter(l=>l.sku===sku);
   if(!picked){source.forEach(l=>delete progress[l.key]);return {remaining:0};}
   const candidates=source.filter(l=>scope==='to_pick'?!own(progress,l.key):own(progress,l.key)&&progress[l.key]<l.quantity);
   const maximum=candidates.reduce((n,l)=>n+l.quantity-(Number(progress[l.key])||0),0),amount=Number(quantity);
   if(!Number.isSafeInteger(amount)||amount<1||amount>maximum)throw Error('Vul een geldig pickaantal in.');
   let remaining=amount;
   for(const line of candidates){const before=Number(progress[line.key])||0,allocated=Math.min(line.quantity-before,remaining);if(scope==='to_pick'||allocated>0)progress[line.key]=before+allocated;remaining-=allocated;}
   return {remaining:data().not_picked.find(r=>r.sku===sku)?.quantity||0};
  }
  return {data,update};
 }
 function view(){return `<section class="hero-panel module-hero picklist-hero reference-picklist-hero"><div><p class="eyebrow">Magazijn</p><h1>Picklijst</h1><span>Pak artikelen per locatie. Assemblageartikelen staan als benodigde onderdelen op de lijst.</span></div><div class="picklist-actions"><button type="button" data-picklist-print>PDF openen / printen</button></div></section><p class="reference-demo-note">Fictieve orders · inclusief twee thuiswerksets met muis en toetsenbord.</p><section class="panel picklist-panel" data-warehouse-picklist><nav class="picklist-tabs" aria-label="Pickstatus"><button type="button" data-picklist-tab="to_pick" aria-selected="true">Te picken <b data-picklist-count="to_pick">0</b></button><button type="button" data-picklist-tab="picked" aria-selected="false">Gepickt <b data-picklist-count="picked">0</b></button><button type="button" data-picklist-tab="not_picked" aria-selected="false">Niet gepickt <b data-picklist-count="not_picked">0</b></button></nav><p class="picklist-status" data-picklist-status role="status" aria-live="polite"></p><div data-picklist-items></div></section>`;}
 let cleanup=()=>{};
 function destroy(){cleanup();cleanup=()=>{};}
 function mount(root,options){
  destroy();
  // Native controls from deployed opticore-intern@253e6357.
  const tabs=[...root.querySelectorAll('[data-picklist-tab]')],items=root.querySelector('[data-picklist-items]'),status=root.querySelector('[data-picklist-status]');
  const requestedTab=options.tab;
  let active=['to_pick','picked','not_picked'].includes(requestedTab)?requestedTab:'to_pick',data={to_pick:[],picked:[],not_picked:[],counts:{}},loading=false,refreshPending=false;
  const text=(tag,value,cls)=>{const node=document.createElement(tag);node.textContent=value??'';if(cls)node.className=cls;if(cls==='picklist-sku'||cls==='picklist-confirm-sku')node.setAttribute('data-i18n-ignore','');return node;};
  const dialog=document.createElement('dialog');dialog.className='picklist-confirm';
  const dialogTitle=text('h2','','picklist-confirm-title'),product=document.createElement('div');product.className='picklist-confirm-product';
  const dialogImage=document.createElement('img');dialogImage.className='picklist-confirm-image';dialogImage.alt='';
  const productInfo=document.createElement('div'),dialogSku=text('strong','','picklist-confirm-sku'),dialogDescription=text('p','','picklist-confirm-description');
  productInfo.append(dialogSku,dialogDescription);product.append(dialogImage,productInfo);
  const locationLabel=text('p','','picklist-confirm-location'),quantityLabel=text('p','Kies het aantal om te picken','picklist-quantity-label');
  const quantityTiles=document.createElement('div');quantityTiles.className='picklist-quantity-tiles';quantityTiles.setAttribute('role','group');quantityTiles.setAttribute('aria-label','Pickaantal');
  let selectedQuantity=0;
  const remainder=text('p','','picklist-confirm-remainder');
  const dialogActions=document.createElement('div');dialogActions.className='picklist-confirm-actions';
  const dialogCancel=text('button','Annuleren','picklist-cancel'),dialogConfirm=text('button','Bevestig gepickt','picklist-confirm-button');
  dialogCancel.type=dialogConfirm.type='button';dialogActions.append(dialogCancel,dialogConfirm);
  dialog.append(dialogTitle,product,locationLabel,quantityLabel,quantityTiles,remainder,dialogActions);root.append(dialog);
  function confirmPick(row,picked){
    const scope=active==='not_picked'?'not_picked':'to_pick';
    dialogTitle.textContent=picked?'Pickaantal bevestigen':'Pickstatus terugzetten';
    dialogSku.textContent=row.sku;dialogDescription.textContent=row.title;
    dialogImage.src=row.image_url||'';dialogImage.hidden=false;dialogImage.onerror=()=>{dialogImage.hidden=true;};
    const undoQuantity=active==='not_picked'?row.picked_quantity:row.quantity;
    locationLabel.textContent=`${picked?'Locatie':'Gepickt: '+undoQuantity+' stuks · locatie'} ${row.location}`;
    quantityLabel.hidden=!picked;quantityTiles.hidden=!picked;remainder.hidden=!picked;
    const total=Number(String(row.quantity).replace(',','.'))||0;
    selectedQuantity=picked?total:0;
    quantityTiles.replaceChildren();
    const updateRemainder=()=>{const remaining=Math.max(0,total-selectedQuantity);remainder.textContent=`Na deze pick blijft ${new Intl.NumberFormat(window.SiteI18n?.locale||'nl-NL',{maximumFractionDigits:2}).format(remaining)} over. Het restant komt in ‘Niet gepickt’.`;};
    if(picked){
      const options=[];
      for(let quantity=1;quantity<=Math.floor(total);quantity++)options.push(quantity);
      if(!Number.isInteger(total)&&total>0)options.push(total);
      options.forEach(quantity=>{
        const tile=text('button',`${new Intl.NumberFormat(window.SiteI18n?.locale||'nl-NL',{maximumFractionDigits:2}).format(quantity)} st.`,'picklist-quantity-tile');
        tile.type='button';tile.setAttribute('aria-pressed',String(quantity===selectedQuantity));
        tile.addEventListener('click',()=>{selectedQuantity=quantity;quantityTiles.querySelectorAll('.picklist-quantity-tile').forEach(option=>option.setAttribute('aria-pressed',String(Number(option.dataset.quantity)===selectedQuantity)));updateRemainder();});
        tile.dataset.quantity=String(quantity);quantityTiles.append(tile);
      });
    }
    updateRemainder();
    dialogConfirm.textContent=picked?'Ja, gepickt':'Ja, terugzetten';
    dialog.showModal();
    return new Promise(resolve=>{
      const finish=value=>{dialog.close();dialogCancel.removeEventListener('click',cancel);dialogConfirm.removeEventListener('click',accept);dialog.removeEventListener('cancel',onCancel);resolve(value?{confirmed:true,quantity:String(selectedQuantity),scope}:{confirmed:false});};
      const cancel=()=>finish(false),accept=()=>finish(true),onCancel=event=>{event.preventDefault();finish(false);};
      dialogCancel.addEventListener('click',cancel);dialogConfirm.addEventListener('click',accept);dialog.addEventListener('cancel',onCancel);
    });
  }
  function render(){
    tabs.forEach(tab=>tab.setAttribute('aria-selected',String(tab.dataset.picklistTab===active)));
    for(const key of ['to_pick','picked','not_picked']){const count=root.querySelector(`[data-picklist-count="${key}"]`);if(count)count.textContent=String(data.counts?.[key]??0);}
    items.replaceChildren();const rows=data[active]||[];
    if(!rows.length){items.append(text('p',active==='to_pick'?'Er staan geen nieuwe magazijnartikelen klaar.':active==='not_picked'?'Er zijn geen openstaande restanten.':'Er zijn nog geen artikelen gepickt.','picklist-empty'));return;}
    for(const row of rows){
      const article=document.createElement('article');article.className='picklist-item';
      const main=document.createElement('div');main.className='picklist-item-main';
      main.tabIndex=0;main.setAttribute('role','group');main.setAttribute('aria-label',`Artikel ${row.sku}, omschrijving tonen of verbergen`);main.setAttribute('aria-expanded','false');
      const location=text('strong',row.location,'picklist-item-location');
      const imageWrap=document.createElement('span');imageWrap.className='picklist-image-wrap';
      const image=document.createElement('img');image.className='picklist-image';image.alt='';image.loading='lazy';image.src=row.image_url||'';image.onerror=()=>{image.hidden=true;};
      try{const imageUrl=new URL(image.src,window.location.origin);if(!['http:','https:'].includes(imageUrl.protocol))image.hidden=true;}catch{image.hidden=true;}
      imageWrap.append(image,text('b',`${row.quantity}×`,'picklist-image-quantity'));
      const info=document.createElement('div');info.className='picklist-item-info';info.dataset.printTitle=row.title;info.append(text('strong',row.sku,'picklist-sku'));
      const description=document.createElement('details');description.className='picklist-item-description';
      description.append(text('summary','Omschrijving'),text('p',row.title));
      const toggleDescription=()=>{description.open=!description.open;main.setAttribute('aria-expanded',String(description.open));};
      main.addEventListener('click',event=>{if(!event.target.closest('button'))toggleDescription();});
      main.addEventListener('keydown',event=>{if(event.target===main&&(event.key==='Enter'||event.key===' ')){event.preventDefault();toggleDescription();}});
      const canPick=active==='to_pick'||active==='not_picked';
      const actions=document.createElement('div');actions.className='picklist-row-actions';
      const button=text('button',active==='to_pick'?'Gepickt':active==='not_picked'?'Verder picken':'Terugzetten',canPick?'picklist-mark':'picklist-unmark');button.type='button';
      button.addEventListener('click',async()=>{const choice=await confirmPick(row,canPick);if(choice.confirmed)await update(row.sku,canPick,choice.quantity,choice.scope,button);});
      actions.append(button);
      if(active==='not_picked'){
        const undo=text('button','Pick terugzetten','picklist-revert');undo.type='button';
        undo.addEventListener('click',async()=>{const choice=await confirmPick(row,false);if(choice.confirmed)await update(row.sku,false,choice.quantity,'not_picked',undo);});
        actions.append(undo);
      }
      main.append(actions,imageWrap,info,location);article.append(main,description);items.append(article);
    }
  }
  async function load(){data=options.data();status.textContent='';render();}
  async function update(sku,picked,quantity,scope,button){
   button.disabled=true;
   try{const result=options.update(sku,picked,quantity,scope);if(picked)active=Number(result.remaining)>0?'not_picked':'picked';options.onTab(active);await load();}
   catch(error){status.textContent=error.message;button.disabled=false;}
  }
  tabs.forEach(tab=>tab.addEventListener('click',()=>{active=tab.dataset.picklistTab;options.onTab(active);render();}));
  const print=root.parentElement.querySelector('[data-picklist-print]');print?.addEventListener('click',()=>window.print());
  cleanup=()=>{if(dialog.open)dialog.close();dialog.remove();};load();
 }
 return {model,view,mount,destroy};
})();
