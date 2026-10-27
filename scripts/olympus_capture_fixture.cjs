/* Invented records for local captures of the actual Olympus frontend.
   No production requests, credentials, source documents or personal data. */
const people=Array.from({length:8},(_,i)=>({id:'demo-zzp-'+(i+1),relatienummer:'DEMO-'+(i+101),voornaam:['Alex','Robin','Sam','Dani','Jamie','Kim','Chris','Lou'][i],achternaam:'Demo',naam:'Demo Bouwteam '+(i+1),contact_naam:['Alex','Robin','Sam','Dani','Jamie','Kim','Chris','Lou'][i]+' Demo',actief:true,revision:1,geboortedatum:'1990-01-01',kvk_nummer:'DEMO-KVK',btw_nummer:'DEMO-BTW',adres:'Voorbeeldstraat 1',postcode:'1234 AB',plaats:'Demostad',email:'vakman'+(i+1)+'@example.invalid',telefoon:'',betalingstermijn_dagen:14,betaalafspraak:'handmatig',verkoop_betaalwijze:'direct',bon:'Ja',kvk_geldig_tot:'2027-12-31',vca_geldig_tot:'2027-12-31',vca_type:'Basis',check_datum:'2026-10-01',check_geldig_tot:'2027-10-01',avb_geldig_tot:'2027-12-31',gpi_geldig_tot:'2027-12-31',vog_geldig_tot:'2027-12-31',bijzonderheden:'Fictief dossier voor deze schermopname.'}));
const clients=Array.from({length:4},(_,i)=>({id:'demo-klant-'+(i+1),relatienummer:'DEMO-K-'+(i+1),naam:['Demo Bouwgroep Noord','Demo Projecten Zuid','Demo Aannemer West','Demo Bouwbedrijf Oost'][i],actief:true,revision:1,adres:'Voorbeeldlaan 10',postcode:'1234 AB',plaats:'Demostad',email:'project'+(i+1)+'@example.invalid',betalingstermijn_dagen:14}));
const projects=['Renovatie Parkzicht','Nieuwbouw Havenkwartier','Verbouwing Centrum','Onderhoud Westpoort'];
const orders=people.map((z,i)=>({id:'demo-opdracht-'+(i+1),nummer:'DEMO-2026-'+(101+i),naam:projects[i%4],zzper_id:z.id,opdrachtgever_id:clients[i%4].id,zzper:z.contact_naam,opdrachtgever:clients[i%4].naam,revision:1,state_token:'local-only',jaar:2026,weeknummer:43,startdatum:'2026-10-19',einddatum:'2026-11-13',tarief:48+i,feepercentage:.05,controle_status:i<2?'concept':'vrijgegeven',status:i<2?'concept':'vrijgegeven',vergrendeld:false,documenten:[],blokkades:i<2?['Overeenkomst ter controle']:[],waarschuwingen:[],validation_issues:[],requirements:{},requirement_overrides:[],planning_weken:[{jaar:2026,weeknummer:43}],created_at:'2026-10-20T09:00:00',updated_at:'2026-10-26T09:00:00'}));
orders.forEach((order,i)=>{order.gereed=i>=2;if(i>=2)order.documenten=['opdracht_a','opdracht_p'].map((kind,n)=>({id:'demo-contract-'+i+'-'+n,workflow_type:kind,status:'gecontroleerd',bestandsnaam:'DEMO-overeenkomst.pdf',revision:1}));});
const rows=people.map((z,i)=>({id:'demo-planning-'+(i+1),zzper_id:z.id,zzper:z,naam:z.contact_naam,opdrachtgever:clients[i%4].naam,opdrachtgever_id:clients[i%4].id,klant:clients[i%4],opdracht_id:orders[i].id,opdracht_naam:projects[i%4],jaar:2026,weeknummer:43,blad:'PLANNING',groep:'Opdrachten',revision:1,gegevens:{B:z.contact_naam,C:'handmatig',D:48+i,E:z.relatienummer,G:'Ja',I:projects[i%4],J:clients[i%4].relatienummer,K:'M',L:'2027-12-31',M:'2027-12-31',N:'2026-10-01',O:'2027-12-31',Q:'Fictieve planning'},kleuren:{D:i===1?'afwachting':'goed',G:'goed',I:i===2?'todo':'goed'},document_status:{urenstaat:{aantal:i<5?1:0,gecontroleerd:i<4?1:0},parkeerbon:{aantal:0,gecontroleerd:0},bon:{aantal:0,gecontroleerd:0},declaraties:{aantal:0,gecontroleerd:0}},facturatie_klaar:i<4}));
const settings={check_geldigheid_maanden:12,workflow_controls:{},status_labels:{},kleuren:{}};
const documents=[{id:'demo-doc-1',bestandsnaam:'DEMO-weekstaat-week-43.pdf',workflow_type:'weekstaat',zzper:people[0].contact_naam,opdracht:projects[0],opdracht_id:orders[0].id,jaar:2026,weeknummer:43,status:'te_controleren',created_at:'2026-10-26T09:00:00'}];
const todos={totals:{total:8,planning_without_order:1,orders_to_review:2,whatsapp:0,invoice_ready:3,concept_invoices:1,sepa_ready:0,manual_payment:0},unlinked_documents:[],bulk_intake:[],documents_to_review:documents,orders_to_review:orders.slice(0,2),invoice_ready:orders.slice(2,5).map(o=>({order_id:o.id,opdracht:o.naam,zzper:o.zzper,opdrachtgever:o.opdrachtgever,jaar:2026,weeknummer:43,created_at:o.created_at})),concept_invoices:[{id:'demo-invoice-1',factuurnummer:'DEMO-2026-001',type:'verkoopfactuur',zzper:people[0].contact_naam,opdrachtgever:clients[0].naam,jaar:2026,weeknummer:43,created_at:'2026-10-26T09:00:00'}],whatsapp:[],open_planning:[{id:'demo-open-1',jaar:2026,weeknummer:43,project:'Demo bouwproject',zzper:people[7].contact_naam,opdrachtgever:clients[3].naam}]};
module.exports={people,clients,orders,rows,settings,todos,
 response(path,method='GET'){
  // The frontend requests automatic linking on mount. It is a local no-op here.
  if(method==='POST'&&new URL(path,'http://localhost').pathname==='/api/bulk-intake/auto-link')return {linked:0,skipped:0};
  if(method!=='GET'&&method!=='HEAD')throw Error('Capture attempted a write: '+method+' '+path);
  const url=new URL(path,'http://localhost');
  if(url.pathname==='/api/me')return {id:'demo-user',username:'demo',naam:'Demo gebruiker',rol:'beheerder',ui_version:'2026-10-19.2',ui_build:'2026-10-19.2'};
  if(url.pathname==='/api/masters/zzpers')return people;
  if(url.pathname==='/api/masters/opdrachtgevers')return clients;
  if(url.pathname==='/api/planning/alerts')return {meldingen:[],settings};
  if(url.pathname==='/api/todos')return todos;
  if(url.pathname==='/api/planning/rows')return rows;
  if(url.pathname==='/api/planning/settings')return settings;
  if(url.pathname==='/api/planning/weeks')return [{jaar:2026,weeknummer:43},{jaar:2026,weeknummer:42}];
  if(url.pathname==='/api/activity')return {planning:rows,documents:rows.slice(0,5).map((r,i)=>({id:'demo-weekstaat-'+i,soort:'weekstaat',workflow_type:'weekstaat',zzper_id:r.zzper_id})),invoices:[],totals:{}};
  if(url.pathname==='/api/orders')return orders;
  if(url.pathname==='/api/flow/cases')return [];
  if(url.pathname==='/api/bulk-intake'||url.pathname.startsWith('/api/bulk-intake/'))return {items:[],batches:[],files:[],upload_items:[],busy:false};
  throw Error('Unknown capture API: '+url.pathname);
 }};
