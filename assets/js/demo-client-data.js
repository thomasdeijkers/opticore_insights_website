/* A single fictional customer workspace. No accounts, APIs, mail or production data. */
(() => {
  'use strict';
  const D=window.MarketplaceDemo;
  const round=n=>Math.round((n+Number.EPSILON)*100)/100;
  function ensure(state){
    if(state.client)return state.client;
    state.orders.forEach((o,i)=>{o.customer='DEMO-K-'+(i+1);o.date='2026-10-'+(21+i);});
    state.products.forEach((p,i)=>{p.classification=i===2?'C':i===3?'B':'A';p.brand='Voorbeeldmerk';p.excluded=false;p.counted=false;p.contentApproved=false;});
    const client=state.client={
      company:{name:'Voorbeeldhandel Noord B.V.',email:'contact@voorbeeldhandel.example',address:'Voorbeeldstraat 1',postcode:'1234 AB',city:'Voorbeeldstad',vat:'DEMO-BTW-001',kvk:'DEMO-KVK-001'},
      customers:Array.from({length:6},(_,i)=>({id:'DEMO-K-'+(i+1),name:'Voorbeeldkoper '+['Noord','Zuid','West','Oost','Midden','Kust'][i],email:'inkoop'+(i+1)+'@voorbeeldkoper.example',city:'Demostad '+(i+1)})),
      team:[{id:'DEMO-U-1',name:'Demo beheerder',role:'Beheerder',enabled:true},{id:'DEMO-U-2',name:'Demo magazijn',role:'Magazijn',enabled:true},{id:'DEMO-U-3',name:'Demo marketing',role:'Marketing',enabled:true}],
      documents:[],quotes:[],drafts:[],manuals:[],labelQueue:[],feedRuns:[],reports:[],snoozed:[],excluded:[],invoiceSerial:1,quoteSerial:1,
      notifications:{stock:true,orders:true,marketing:true,digest:true},
      connections:D.channels.map((c,i)=>({id:c.id,status:i===5?'Controle nodig':'Bijgewerkt',last:'27-10-2026 09:'+String(10+i).padStart(2,'0'),enabled:true})),
      tickets:[{id:'DEMO-T-101',customer:'DEMO-K-1',order:'DEMO-O-2041',subject:'Vraag over het koffiezetapparaat',body:'Waar vind ik de handleiding van het koffiezetapparaat bij mijn bestelling?',status:'Open',priority:'Hoog',draft:''},{id:'DEMO-T-102',customer:'DEMO-K-2',order:'DEMO-O-2042',subject:'Wanneer wordt mijn bestelling bezorgd?',body:'Ik ontvang graag een update over de verwachte levering.',status:'Open',priority:'Normaal',draft:''},{id:'DEMO-T-103',customer:'DEMO-K-3',order:'DEMO-O-2043',subject:'Factuur van de bestelling',body:'Kunnen jullie de factuur bij mijn bestelling tonen?',status:'Uitgesteld',priority:'Laag',draft:''},{id:'DEMO-T-104',customer:'DEMO-K-4',order:'DEMO-O-2044',subject:'Retour is ontvangen',body:'Bedankt voor de bevestiging van de retour.',status:'Archief',priority:'Normaal',draft:'De retour is in dit voorbeeld verwerkt.'}],
      websitePages:[['/','Gadgets en elektronica voor elke dag'],['/keuken/','Koffiezetapparaten en tosti-ijzers'],['/telefoonaccessoires/','Telefoonladers en powerbanks'],['/audio/','Koptelefoons en speakers']].map(([url,title],i)=>({id:'DEMO-PAGE-'+i,url,title,queries:Array.from({length:10},(_,j)=>({term:[['gadgets','elektronica','handige accessoires'],['koffiezetapparaat','tosti-ijzer','waterkoker'],['telefoonlader','powerbank','USB-C lader'],['koptelefoon','bluetoothspeaker','audio accessoires']][i][j%3]+(j>2?' '+['advies','vergelijken','gebruiken','onderhoud','accessoires','voor thuis','kopen'][j-3]:''),position:4+i*3+j,previous:6+i*2+j+(j%3===0?-4:2),clicks:42-j*3,impressions:420-j*21}))})),
      logs:[{time:'09:16',type:'success',message:'Orders van de eigen verkoopkanalen zijn bijgewerkt.'},{time:'09:15',type:'warning',message:'Eén MediaMarkt-aanbod vraagt controle op een productkenmerk.'},{time:'09:14',type:'success',message:'Voorraadcontrole van de eigen artikelen afgerond.'},{time:'09:12',type:'info',message:'Herstelpunt van de voorbeeldomgeving beschikbaar.'}],
      formValues:{},adHistory:[],budgetYear:2027
    };
    state.products.slice(0,2).forEach((p,i)=>client.manuals.push({id:'DEMO-H-'+i,sku:p.sku,title:'Handleiding '+p.name,status:i?'Concept':'Goedgekeurd',text:'1. Controleer de meegeleverde onderdelen.\n2. Lees de installatievoorschriften van het product.\n3. Configureer het product volgens het voorbeeld.\n4. Controleer de werking.'}));
    orderInvoice(state,state.orders[0].id);
    quote(state,client.customers[1].id,[{sku:state.products[1].sku,qty:4,price:state.products[1].price,discount:5}]);
    client.drafts.push({id:'DEMO-CONCEPT-1',name:state.products[0].name,sku:'DEMO-1001',brand:'Voorbeeldmerk',text:state.products[0].description+' Dit is fictieve productinformatie.',status:'Concept'});
    client.reports.push({kind:'Voorraad',period:12,headers:['SKU','Artikel','Beschikbaar'],rows:state.products.map(p=>[p.sku,p.name,D.available(p)])});
    state.campaigns.push({id:'DEMO-GOOGLE-1',name:'Webshop · zoekcampagne',channel:'google',sku:'DEMO-1001',cost:75,sales:450,clicks:110,budget:8,target:25,historyCosts:Array(12).fill(65)});
    return client;
  }
  function log(state,message,type='success'){ensure(state).logs.unshift({time:'Demo',type,message});}
  function documentTotals(document){const subtotal=round(document.lines.reduce((n,l)=>n+l.qty*l.price*(1-(l.discount||0)/100),0));return {subtotal,vat:round(subtotal*.21),total:round(subtotal*1.21)};}
  function orderInvoice(state,orderId){
    const c=ensure(state),order=state.orders.find(o=>o.id===orderId);if(!order)throw Error('Kies een voorbeeldorder.');
    const existing=c.documents.find(d=>d.order===orderId);if(existing)return existing;
    const p=D.product(state,order.sku),doc={id:'DEMO-F-2026-'+String(c.invoiceSerial++).padStart(3,'0'),order:order.id,customer:order.customer,date:'27-10-2026',status:'Concept',lines:[{sku:p.sku,name:p.name,qty:order.qty,price:order.unitPrice,discount:0}]};
    c.documents.push(doc);log(state,'Orderfactuur '+doc.id+' als democoncept gemaakt.');return doc;
  }
  function quote(state,customer,lines){
    const c=ensure(state);if(!c.customers.some(k=>k.id===customer))throw Error('Kies een voorbeeldklant.');
    if(!lines.length||lines.some(l=>!D.product(state,l.sku)||!Number.isInteger(l.qty)||l.qty<1||l.qty>10000||!Number.isFinite(l.price)||l.price<0||!Number.isFinite(l.discount)||l.discount<0||l.discount>100))throw Error('Controleer aantallen, prijzen en korting.');
    const q={id:'DEMO-OFF-'+String(c.quoteSerial++).padStart(3,'0'),customer,date:'27-10-2026',status:'Concept',lines:lines.map(l=>({...l,name:D.product(state,l.sku).name}))};c.quotes.push(q);return q;
  }
  function keywords(state,sku,country='NL'){
    const p=D.product(state,sku),base=p.rank===null?37:p.rank+(country==='BE'?3:0);
    return Array.from({length:10},(_,i)=>({term:p.name.toLowerCase()+' '+['kopen','vergelijken','voor thuis','gebruiksaanwijzing','accessoires','onderhoud','aanbieding','productinformatie','gebruik','advies'][i],position:base+i,previous:(p.previousRank??42)+i+(country==='BE'?3:0),volume:900-i*62}));
  }
  function validateAmount(value,min=0,max=100000){const n=Number(value);if(!Number.isFinite(n)||n<min||n>max)throw Error('Vul een geldig bedrag in tussen '+min+' en '+max+'.');return n;}
  function priceCalculation(input){
    const cost=validateAmount(input.cost),shipping=validateAmount(input.shipping),fee=validateAmount(input.fee,0,90),margin=validateAmount(input.margin,0,90);
    if(fee+margin>=95)throw Error('De kanaalkosten en gewenste marge moeten samen onder 95% blijven.');
    const ex=round((cost+shipping)/(1-(fee+margin)/100));return {ex,inc:round(ex*1.21),contribution:round(ex-cost-shipping-ex*fee/100)};
  }
  function freightCalculation(input){
    const weight=validateAmount(input.weight,.1),volume=validateAmount(input.volume,.01),goods=validateAmount(input.goods),duty=validateAmount(input.duty,0,50);
    const rates={air:5.5,rail:2.4,sea:1.1},rate=rates[input.mode];if(!rate)throw Error('Kies een vervoerwijze.');
    const chargeable=Math.max(weight,volume*(input.mode==='air'?167:input.mode==='rail'?250:1000)),freight=round(chargeable*rate),importCost=round((goods+freight)*duty/100);
    return {chargeable,freight,importCost,total:round(goods+freight+importCost)};
  }
  window.DemoClientData={ensure,round,log,documentTotals,orderInvoice,quote,keywords,validateAmount,priceCalculation,freightCalculation};
})();
