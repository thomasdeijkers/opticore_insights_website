(function (scope) {
  'use strict';
  const channels = [
    {id:'bol',logo:'/assets/img/bol-wordmark.svg',label:'bol NL',country:'NL'}, {id:'amazon_nl',logo:'/assets/img/platforms/amazon.svg',label:'Amazon NL',country:'NL'},
    {id:'amazon_de',logo:'/assets/img/platforms/amazon.svg',label:'Amazon DE',country:'DE'}, {id:'praxis',logo:'/assets/img/platforms/praxis.png',label:'Praxis NL',country:'NL'}, {id:'brico',logo:'/assets/img/platforms/brico.png',label:'Brico BE',country:'BE'},
    {id:'mediamarkt',logo:'/assets/img/platforms/mediamarkt.svg',label:'MediaMarkt NL',country:'NL'}, {id:'kaufland',logo:'/assets/img/platforms/kaufland.svg',label:'Kaufland DE',country:'DE'}
  ];
  const months = ['Nov','Dec','Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt'];
  const seed = {
    products: [
      {sku:'DEMO-1001',name:'Thermostaat Luma',ean:'DEMO-EAN-1001',category:'Klimaat',supplier:'Voorbeeldleverancier Noord',cost:24,price:69,stock:36,reserved:4,external:12,location:'A-01',minimum:20,lead:21,batch:20,lastSale:2,rank:8,previousRank:12,listing:88,returns:3,weights:[.55,.2,.15,.1,0],offers:['published','published','failed','disabled','disabled'],history:[22,26,29,25,19,16,13,11,12,14,18,24]},
      {sku:'DEMO-1002',name:'Slimme stekker Pico',ean:'DEMO-EAN-1002',category:'Schakelen',supplier:'Voorbeeldleverancier Zuid',cost:8,price:24,stock:12,reserved:4,external:24,location:'A-02',minimum:30,lead:14,batch:50,lastSale:1,rank:14,previousRank:16,listing:76,returns:4,weights:[.6,.25,.1,.05,0],offers:['published','published','published','queued','disabled'],history:[40,48,36,39,42,45,41,46,50,54,58,62]},
      {sku:'DEMO-1003',name:'Deursensor Mini',ean:'DEMO-EAN-1003',category:'Sensoren',supplier:'Voorbeeldleverancier Zuid',cost:6,price:19,stock:220,reserved:0,external:0,location:'B-01',minimum:10,lead:14,batch:20,lastSale:210,rank:null,previousRank:null,listing:61,returns:1,weights:[.7,.2,.1,0,0],offers:['failed','disabled','disabled','disabled','disabled'],history:[8,5,3,2,1,0,0,0,0,0,0,0]},
      {sku:'DEMO-1004',name:'Draadloze schakelaar',ean:'DEMO-EAN-1004',category:'Schakelen',supplier:'Voorbeeldleverancier West',cost:11,price:34,stock:310,reserved:6,external:0,location:'B-02',minimum:15,lead:28,batch:25,lastSale:3,rank:21,previousRank:18,listing:92,returns:2,weights:[.5,.15,.15,.1,.1],offers:['published','published','published','published','published'],history:[24,27,25,23,22,20,18,16,14,12,10,9]},
      {sku:'DEMO-1005',name:'Ventilatieregelaar Air',ean:'DEMO-EAN-1005',category:'Klimaat',supplier:'Voorbeeldleverancier Noord',cost:31,price:89,stock:18,reserved:2,external:6,location:'C-01',minimum:12,lead:30,batch:10,lastSale:1,rank:6,previousRank:9,listing:95,returns:2,weights:[.5,.15,.1,.15,.1],offers:['published','published','disabled','published','published'],history:[9,11,13,12,11,10,12,15,18,21,24,28]},
      {sku:'DEMO-1006',name:'Bewegingssensor Sense',ean:'DEMO-EAN-1006',category:'Sensoren',supplier:'Voorbeeldleverancier West',cost:9,price:29,stock:44,reserved:3,external:10,location:'C-02',minimum:18,lead:21,batch:20,lastSale:2,rank:11,previousRank:15,listing:84,returns:2,weights:[.6,.2,.1,.1,0],offers:['published','published','queued','published','disabled'],history:[17,20,18,19,18,20,22,21,24,25,27,30]}
    ],
    purchases:[{id:'DEMO-IO-104',sku:'DEMO-1002',qty:100,received:false,status:'Bevestigd',supplier:'Voorbeeldleverancier Zuid',eta:'Over 10 dagen'}],
    orders:[{id:'DEMO-O-2041',sku:'DEMO-1001',channel:'bol',qty:1,status:'Te picken'}, {id:'DEMO-O-2042',sku:'DEMO-1002',channel:'amazon_nl',qty:2,status:'In verwerking'}, {id:'DEMO-O-2043',sku:'DEMO-1005',channel:'praxis',qty:1,status:'Verzonden'}, {id:'DEMO-O-2044',sku:'DEMO-1006',channel:'brico',qty:1,status:'Te picken'}, {id:'DEMO-O-2045',sku:'DEMO-1004',channel:'mediamarkt',qty:1,status:'In verwerking'}, {id:'DEMO-O-2046',sku:'DEMO-1005',channel:'kaufland',qty:2,status:'Te picken'}],
    returns:[{id:'DEMO-R-81',sku:'DEMO-1001',channel:'bol',qty:1,reason:'Past niet',sellable:true,received:false},{id:'DEMO-R-82',sku:'DEMO-1002',channel:'amazon_nl',qty:1,reason:'Defect gemeld',sellable:false,received:false}],
    shipments:[{id:'DEMO-FBA-31',sku:'DEMO-1001',destination:'Amazon DE',qty:12,status:'Onderweg'},{id:'DEMO-FBA-32',sku:'DEMO-1006',destination:'Amazon NL',qty:10,status:'Ontvangen'}],
    campaigns:[{id:'C-1',name:'Klimaat · handmatig',channel:'bol',sku:'DEMO-1001',cost:168,sales:840,clicks:310,budget:18,target:25}, {id:'C-2',name:'Schakelen · automatisch',channel:'amazon_nl',sku:'DEMO-1002',cost:225,sales:675,clicks:420,budget:24,target:25}, {id:'C-3',name:'Sensoren · catch-all',channel:'bol',sku:'DEMO-1006',cost:98,sales:560,clicks:190,budget:12,target:25}],
    signalsDone:['DEMO-1003-aging'],growth:0
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const createState = () => {
    const state=clone(seed);
    const channelWeights=[[.5,.17,.1,.08,0,.04,.11],[.55,.18,.08,.04,0,.01,.14],[.65,.15,.1,0,0,.1,0],[.2,.08,.07,.1,.1,.4,.05],[.45,.13,.08,.15,.1,.02,.07],[.5,.17,.08,.1,0,.02,.13]];
    state.products.forEach((p,i)=>{
      p.weights=channelWeights[i];p.offers.push(i===2?'disabled':'published',i===2?'disabled':i===4?'queued':'published');
      p.historyPrice=p.price;p.historyCost=p.cost;p.title=p.name;p.description='Voorbeeldproduct voor een slimme woning. Controleer altijd de toepassing en compatibiliteit.';
      p.previousHistory=p.history.map(n=>Math.round(n*(i===3?1.3:i%2?.95:.8)));
      if(i===2)p.previousHistory=[20,18,16,15,14,12,11,9,8,6,4,3];
    });
    state.campaigns.forEach(c=>{c.historyCosts=[.62,.7,.8,.76,.72,.8,.85,.9,.86,.92,.95,1].map(f=>Math.round(c.cost*f));});
    state.orders.forEach(o=>{o.unitPrice=product(state,o.sku).price;});
    state.shipments.filter(s=>s.status==='Onderweg').forEach(s=>{product(state,s.sku).reserved+=s.qty;s.reservation=true;});
    state.adviceReviews={};state.adviceHistory={};state.receipts=[];return state;
  };
  const product = (state,sku) => state.products.find(p=>p.sku===sku);
  const available = p => Math.max(0,p.stock-p.reserved);
  const ordered = (state,p) => state.purchases.filter(o=>o.sku===p.sku&&!o.received).reduce((n,o)=>n+o.qty-(o.receivedQty||0),0);
  const forecast = (state,p,n=3) => Math.ceil(p.history.slice(-3).reduce((a,b)=>a+b,0)/3*n*1.12*(1+state.growth/100));
  const coverage = p => {const daily=p.history.slice(-3).reduce((a,b)=>a+b,0)/90;return daily?Math.floor(available(p)/daily):null;};
  const need = (state,p) => Math.ceil(Math.max(0,forecast(state,p)+p.minimum-available(p)-ordered(state,p))/p.batch)*p.batch;
  function allocateCount(count,weights,capacity){
    const sum=weights.reduce((a,b)=>a+b,0);if(!sum)return weights.map(()=>0);
    const ideal=weights.map(w=>count*w/sum),values=ideal.map((n,i)=>Math.min(Math.floor(n),capacity?capacity[i]:count));
    const priority=ideal.map((n,i)=>({i,fraction:n-Math.floor(n)})).sort((a,b)=>b.fraction-a.fraction||a.i-b.i);
    let left=count-values.reduce((a,b)=>a+b,0);
    while(left>0)for(const {i} of priority)if(left>0&&(!capacity||values[i]<capacity[i])){values[i]++;left--;}
    return values;
  }
  function sales(state,p,period=12,channel='all',previous=false,offset=0) {
    const history=previous?p.previousHistory:p.history,end=history.length-offset,start=Math.max(0,end-period);
    const sum=values=>values.reduce((a,b)=>a+b,0),qty=sum(history.slice(start,end)),yearQty=sum(history);
    const yearReturns=Math.min(yearQty,p.returns+(previous?0:state.returns.filter(r=>r.sku===p.sku&&r.received).reduce((n,r)=>n+r.qty,0)));
    // Allocate returns cumulatively: the twelve monthly views reconcile with the year.
    let returned=yearQty?Math.floor(yearReturns*sum(history.slice(0,end))/yearQty)-Math.floor(yearReturns*sum(history.slice(0,start))/yearQty):0,channelQty=qty;
    if(channel!=='all'){
      const index=channels.findIndex(c=>c.id===channel);channelQty=0;returned=0;
      for(let i=start;i<end;i++){
        const gross=allocateCount(history[i],p.weights),monthReturns=yearQty?Math.floor(yearReturns*sum(history.slice(0,i+1))/yearQty)-Math.floor(yearReturns*sum(history.slice(0,i))/yearQty):0;
        const returns=allocateCount(monthReturns,gross,gross);channelQty+=gross[index]||0;returned+=returns[index]||0;
      }
    }
    const net=channelQty-returned,revenue=net*(p.historyPrice??p.price),cost=net*(p.historyCost??p.cost),fee=revenue*.12,shipping=net*3.2;
    return {qty:channelQty,returned,revenue,cost,fee,shipping,profit:revenue-cost-fee-shipping};
  }
  function totals(state,period=12,channel='all',previous=false,offset=0) {
    return state.products.reduce((total,p)=>{const s=sales(state,p,period,channel,previous,offset);for(const k of Object.keys(s))total[k]=(total[k]||0)+s[k];return total;},{});
  }
  function channelMonths(state,id){
    return months.map((month,i)=>{
      const current=totals(state,1,id,false,11-i),previous=totals(state,1,id,true,11-i);
      const enrich=(value,old)=>({...value,orders:Math.round(value.qty/1.15),margin:value.revenue?value.profit/value.revenue*100:0,returnRate:value.qty?value.returned/value.qty*100:0,share:totals(state,1,'all',old,11-i).revenue?value.revenue/totals(state,1,'all',old,11-i).revenue*100:0});
      return {month,year:i<2?2025:2026,current:enrich(current,false),previous:enrich(previous,true)};
    }).reverse();
  }
  function dashboardHeatmap(state){
    const count=channels.reduce((n,c)=>n+channelMonths(state,c.id)[0].current.orders,0);
    const days=['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'],times=['00–04','04–08','08–12','12–16','16–20','20–24'];
    const weights=days.flatMap((_,d)=>times.map((_,h)=>[1.35,1.08,1,.96,.9,.75,.65][d]*[.1,.16,.65,.8,1.4,.72][h]));
    const sum=weights.reduce((a,b)=>a+b,0),values=weights.map(w=>Math.floor(count*w/sum));
    weights.map((w,i)=>({i,remainder:count*w/sum-values[i]})).sort((a,b)=>b.remainder-a.remainder||a.i-b.i).slice(0,count-values.reduce((a,b)=>a+b,0)).forEach(x=>values[x.i]++);
    const peak=values.indexOf(Math.max(...values));return {days,times,values,count,peakDay:days[Math.floor(peak/6)],peakTime:times[peak%6]};
  }
  function annualForecast(state){
    const all=totals(state),old=totals(state,12,'all',true),factor=Math.max(.3,(old.revenue?all.revenue/old.revenue:1)*(1+state.growth/100));
    const elapsed=totals(state,10),remaining=totals(state,2,'all',false,10),prior=totals(state,10,'all',true);
    const ad=state.campaigns.reduce((n,c)=>n+c.historyCosts.slice(2).reduce((a,b)=>a+b,0)+c.historyCosts.slice(0,2).reduce((a,b)=>a+b,0)*factor,0);
    const revenue=elapsed.revenue+remaining.revenue*factor,profit=elapsed.profit+remaining.profit*factor,previous=prior.revenue+remaining.revenue;
    const nextFactor=1.15*(1+state.growth/100);
    return [{year:2026,revenue,ebit:profit-ad-5040,previous},{year:2027,revenue:revenue*nextFactor,ebit:(profit-ad)*nextFactor-5040,previous:revenue}];
  }
  const advertising = (state,period=12,channel='all') => state.campaigns.filter(c=>channel==='all'||c.channel===channel).reduce((n,c)=>n+c.historyCosts.slice(-period).reduce((a,b)=>a+b,0),0);
  function signalRows(state) {
    const list=[];
    for(const p of state.products){
      if(coverage(p)!==null&&coverage(p)<p.lead)list.push({id:p.sku+'-stock',sku:p.sku,label:'Voorraadtekort dreigt',priority:'Hoog',detail:`${coverage(p)} dagen dekking · ${p.lead} dagen levertijd`,module:'inkoop'});
      if(p.lastSale>180)list.push({id:p.sku+'-aging',sku:p.sku,label:'Incourante voorraad',priority:'Normaal',detail:`${p.lastSale} dagen zonder verkoop`,module:'voorraad'});
      if(p.history[11]<p.history[8]*.8)list.push({id:p.sku+'-sales',sku:p.sku,label:'Afzet daalt',priority:'Normaal',detail:'Huidige maand lager dan drie maanden geleden',module:'omzet'});
      if(p.offers.includes('failed'))list.push({id:p.sku+'-offer',sku:p.sku,label:'Publicatiefout',priority:'Hoog',detail:'Offerstatus vraagt controle',module:'producten'});
    }
    for(const c of state.campaigns)if(c.cost/c.sales*100>c.target)list.push({id:c.id+'-acos',sku:c.sku,label:'ACoS boven doel',priority:'Hoog',detail:`${(c.cost/c.sales*100).toFixed(1)}% · doel ${c.target}%`,module:'marketing'});
    return list.map(s=>({...s,done:state.signalsDone.includes(s.id)}));
  }
  function countStock(state,sku,qty) {
    const p=product(state,sku);if(!p||!Number.isInteger(qty)||qty<p.reserved||qty>10000)throw new Error('Telling moet een heel aantal zijn, minimaal de reservering en maximaal 10.000.');
    p.stock=qty;return p;
  }
  function propose(state,sku,qty) {
    const p=product(state,sku);if(!p||!Number.isInteger(qty)||qty<1||qty>10000)throw new Error('Kies een heel aantal tussen 1 en 10.000.');
    const order={id:'DEMO-IO-'+(105+state.purchases.length),sku,qty,received:false,status:'Te beoordelen',supplier:p.supplier,eta:'Na akkoord · '+p.lead+' dagen'};
    state.purchases.push(order);return order;
  }
  function receivePurchase(state,id,qty,reference) {
    const o=state.purchases.find(o=>o.id===id);if(!o||o.received)return false;
    if(reference&&state.receipts.some(r=>r.reference===reference))return false;
    const remaining=o.qty-(o.receivedQty||0),amount=qty===undefined?remaining:qty;
    if(!Number.isInteger(amount)||amount<1||amount>remaining)throw new Error('Kies een heel aantal tussen 1 en '+remaining+'.');
    product(state,o.sku).stock+=amount;o.receivedQty=(o.receivedQty||0)+amount;o.received=o.receivedQty===o.qty;
    o.status=o.received?'Ontvangen':'Deels ontvangen';state.receipts.push({order:id,qty:amount,reference:reference||'DEMO-ONTV-'+(state.receipts.length+1)});return true;
  }
  function receiveReturn(state,id) {
    const r=state.returns.find(r=>r.id===id);if(!r||r.received)return false;
    if(r.sellable)product(state,r.sku).stock+=r.qty;r.received=true;return true;
  }
  function setOffer(state,sku,channel,status) {
    const p=product(state,sku),index=channels.findIndex(c=>c.id===channel);
    if(!p||index<0||!['published','disabled','queued','failed'].includes(status))throw new Error('Onbekende offerstatus.');
    p.offers[index]=status;
  }
  function setBudget(state,id,budget) {
    const c=state.campaigns.find(c=>c.id===id);if(!c||!Number.isFinite(budget)||budget<1||budget>100)throw new Error('Kies een dagbudget tussen 1 en 100 euro.');
    c.budget=budget;
  }
  function completeSignal(state,id){if(signalRows(state).some(s=>s.id===id)&&!state.signalsDone.includes(id))state.signalsDone.push(id);}
  function createShipment(state,sku,destination,qty){
    const p=product(state,sku);
    if(!p||!channels.some(c=>c.id.startsWith('amazon')&&c.label===destination)||!Number.isInteger(qty)||qty<1||qty>available(p))throw new Error('Kies een bestemming en een aantal binnen de beschikbare voorraad.');
    p.reserved+=qty;
    const shipment={id:'DEMO-FBA-'+(33+state.shipments.length),sku,destination,qty,status:'Onderweg',reservation:true};
    state.shipments.push(shipment);return shipment;
  }
  function receiveShipment(state,id){
    const s=state.shipments.find(s=>s.id===id);if(!s||s.status!=='Onderweg')return false;
    const p=product(state,s.sku);if(!s.reservation||p.stock<s.qty||p.reserved<s.qty)throw new Error('Controleer eerst de voorbeeldvoorraad van deze zending.');
    p.stock-=s.qty;p.reserved-=s.qty;p.external+=s.qty;s.status='Ontvangen';return true;
  }
  function updateProduct(state,sku,changes){
    const p=product(state,sku);if(!p)throw new Error('Artikel niet gevonden.');
    const text={};for(const key of ['name','title','description'])if(key in changes){
      text[key]=String(changes[key]).trim();if(!text[key]||text[key].length>(key==='description'?1500:150))throw new Error('Vul een korte, geldige naam of tekst in.');
    }
    const amounts={};for(const key of ['price','cost'])if(key in changes){
      const n=Number(changes[key]);if(!Number.isFinite(n)||n<0||n>10000||(key==='price'&&n===0))throw new Error('Vul een geldig bedrag tot 10.000 euro in.');amounts[key]=n;
    }
    Object.assign(p,text,amounts);return p;
  }
  function addProduct(state,values){
    const name=String(values.name||'').trim(),price=Number(values.price),cost=Number(values.cost),stock=Number(values.stock);
    if(!name||name.length>150||!Number.isFinite(price)||price<=0||price>10000||!Number.isFinite(cost)||cost<0||cost>10000||!Number.isInteger(stock)||stock<0||stock>10000)throw new Error('Vul een naam, geldige prijzen en een heel voorraadaantal in.');
    const serial=1001+state.products.length,p={...clone(seed.products[0]),sku:'DEMO-'+serial,ean:'DEMO-EAN-'+serial,name,title:name,description:'Nieuw fictief demoartikel.',price,cost,stock,reserved:0,external:0,location:'N-01',category:'Nieuw assortiment',supplier:'Voorbeeldleverancier Noord',listing:40,returns:0,lastSale:0,rank:null,previousRank:null,history:Array(12).fill(0),previousHistory:Array(12).fill(0),offers:channels.map(()=> 'disabled')};
    p.weights=channels.map((_,i)=>i===0?1:0);state.products.push(p);return p;
  }
  function advanceOrder(state,id){
    const o=state.orders.find(o=>o.id===id);if(!o)throw new Error('Order niet gevonden.');
    if(o.status==='Verzonden')return false;
    o.status=o.status==='Te picken'?'In verwerking':'Verzonden';return true;
  }
  function adviceRows(state){
    const rows=state.campaigns.filter(c=>c.sales>0&&c.cost/c.sales*100>c.target).map(c=>({id:'budget-'+c.id,sku:c.sku,type:'Campagne',title:'Advertentiekosten vragen aandacht',reason:'De advertentiekosten zijn '+Math.round(c.cost/c.sales*100)+'% van de toegeschreven omzet; het doel is '+c.target+'%.',proposal:'Beoordeel het dagbudget en de productpagina voordat je verder opschaalt.',action:{kind:'budget',id:c.id}}));
    for(const p of state.products){
      if(p.listing<85)rows.push({id:'listing-'+p.sku,sku:p.sku,type:'Listing',title:'Maak de productinformatie completer',reason:'De fictieve listingcontrole vindt verbeterpunten in titel en kenmerken.',proposal:'Bekijk het tekstvoorstel en pas het aan voor jouw artikel.',action:{kind:'listing',id:p.sku}});
      if(coverage(p)!==null&&coverage(p)<p.lead)rows.push({id:'stock-'+p.sku,sku:p.sku,type:'Voorraad',title:'Controleer de voorraad voor je campagne',reason:'De voorraaddekking is korter dan de levertijd.',proposal:'Bekijk verkoop, voorraad en openstaande inkoop samen.',action:{kind:'proposal',id:p.sku}});
    }
    for(const old of Object.values(state.adviceHistory))if(!rows.some(r=>r.id===old.id))rows.push(clone(old));
    return rows.map(r=>({...r,decision:state.adviceReviews[r.id]||'open'}));
  }
  function reviewAdvice(state,id,decision){
    const row=adviceRows(state).find(a=>a.id===id);
    if(!row||!['open','approved','snoozed','rejected'].includes(decision))throw new Error('Onbekend voorbeeldvoorstel.');
    state.adviceHistory[id]=clone(row);
    state.adviceReviews[id]=decision;
  }
  function csv(headers,rows){
    const cell=value=>{let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
    return '\ufeff'+[headers,...rows].map(row=>row.map(cell).join(';')).join('\r\n');
  }
  const api={channels,months,createState,product,available,ordered,forecast,coverage,need,sales,totals,channelMonths,dashboardHeatmap,annualForecast,signalRows,advertising,countStock,propose,receivePurchase,receiveReturn,setOffer,setBudget,completeSignal,createShipment,receiveShipment,updateProduct,addProduct,advanceOrder,adviceRows,reviewAdvice,csv};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else scope.MarketplaceDemo=api;
})(typeof window!=='undefined'?window:globalThis);
