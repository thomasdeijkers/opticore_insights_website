(function (scope) {
  'use strict';
  const channels = [
    {id:'bol',logo:'/assets/img/bol-wordmark.svg',label:'bol NL',country:'NL'}, {id:'amazon_nl',logo:'/assets/img/platforms/amazon.svg',label:'Amazon NL',country:'NL'},
    {id:'amazon_de',logo:'/assets/img/platforms/amazon.svg',label:'Amazon DE',country:'DE'}, {id:'praxis',logo:'/assets/img/platforms/praxis.png',label:'Praxis NL',country:'NL'}, {id:'brico',logo:'/assets/img/platforms/brico.png',label:'Brico BE',country:'BE'}
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
    orders:[{id:'DEMO-O-2041',sku:'DEMO-1001',channel:'bol',qty:1,status:'Te picken'}, {id:'DEMO-O-2042',sku:'DEMO-1002',channel:'amazon_nl',qty:2,status:'In verwerking'}, {id:'DEMO-O-2043',sku:'DEMO-1005',channel:'praxis',qty:1,status:'Verzonden'}, {id:'DEMO-O-2044',sku:'DEMO-1006',channel:'brico',qty:1,status:'Te picken'}],
    returns:[{id:'DEMO-R-81',sku:'DEMO-1001',channel:'bol',qty:1,reason:'Past niet',sellable:true,received:false},{id:'DEMO-R-82',sku:'DEMO-1002',channel:'amazon_nl',qty:1,reason:'Defect gemeld',sellable:false,received:false}],
    shipments:[{id:'DEMO-FBA-31',sku:'DEMO-1001',destination:'Amazon DE',qty:12,status:'Onderweg'},{id:'DEMO-FBA-32',sku:'DEMO-1006',destination:'Amazon NL',qty:10,status:'Ontvangen'}],
    campaigns:[{id:'C-1',name:'Klimaat · handmatig',channel:'bol',sku:'DEMO-1001',cost:168,sales:840,clicks:310,budget:18,target:25}, {id:'C-2',name:'Schakelen · automatisch',channel:'amazon_nl',sku:'DEMO-1002',cost:225,sales:675,clicks:420,budget:24,target:25}, {id:'C-3',name:'Sensoren · catch-all',channel:'bol',sku:'DEMO-1006',cost:98,sales:560,clicks:190,budget:12,target:25}],
    signalsDone:['DEMO-1003-aging'],growth:0
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const createState = () => { const state=clone(seed); state.products.forEach((p,i)=>{p.previousHistory=p.history.map(n=>Math.round(n*(i===3?1.3:i%2?.95:.8)));if(i===2)p.previousHistory=[20,18,16,15,14,12,11,9,8,6,4,3];}); state.campaigns.forEach(c=>{c.historyCosts=[.62,.7,.8,.76,.72,.8,.85,.9,.86,.92,.95,1].map(f=>Math.round(c.cost*f));});return state; };
  const product = (state,sku) => state.products.find(p=>p.sku===sku);
  const available = p => Math.max(0,p.stock-p.reserved);
  const ordered = (state,p) => state.purchases.filter(o=>o.sku===p.sku&&!o.received).reduce((n,o)=>n+o.qty,0);
  const forecast = (state,p,n=3) => Math.ceil(p.history.slice(-3).reduce((a,b)=>a+b,0)/3*n*1.12*(1+state.growth/100));
  const coverage = p => {const daily=p.history.slice(-3).reduce((a,b)=>a+b,0)/90;return daily?Math.floor(available(p)/daily):null;};
  const need = (state,p) => Math.ceil(Math.max(0,forecast(state,p)+p.minimum-available(p)-ordered(state,p))/p.batch)*p.batch;
  function sales(state,p,period=12,channel='all',previous=false) {
    const qty=(previous?p.previousHistory:p.history).slice(-period).reduce((a,b)=>a+b,0);
    const returned=Math.min(qty,Math.round((p.returns+(previous?0:state.returns.filter(r=>r.sku===p.sku&&r.received).reduce((n,r)=>n+r.qty,0)))*period/12));
    const weight=channel==='all'?1:p.weights[channels.findIndex(c=>c.id===channel)]||0;
    const net=(qty-returned)*weight, revenue=net*p.price, cost=net*p.cost, fee=revenue*.12, shipping=net*3.2;
    return {qty:qty*weight,returned:returned*weight,revenue,cost,fee,shipping,profit:revenue-cost-fee-shipping};
  }
  function totals(state,period=12,channel='all',previous=false) {
    return state.products.reduce((total,p)=>{const s=sales(state,p,period,channel,previous);for(const k of Object.keys(s))total[k]=(total[k]||0)+s[k];return total;},{});
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
  function receivePurchase(state,id) {
    const o=state.purchases.find(o=>o.id===id);if(!o||o.received)return false;
    product(state,o.sku).stock+=o.qty;o.received=true;o.status='Ontvangen';return true;
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
  const api={channels,months,createState,product,available,ordered,forecast,coverage,need,sales,totals,signalRows,advertising,countStock,propose,receivePurchase,receiveReturn,setOffer,setBudget,completeSignal};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else scope.MarketplaceDemo=api;
})(typeof window!=='undefined'?window:globalThis);
