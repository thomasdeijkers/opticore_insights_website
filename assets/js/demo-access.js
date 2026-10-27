/* The dashboard is public; navigating the fictional demo requires a server session. */
(() => {
  'use strict';
  const root=document.querySelector('[data-demo]');
  if(!root)return;
  let authenticated=false,expiresAt=0,csrf='',pending=null,returnFocus=null;
  const dialog=document.createElement('dialog');
  dialog.className='demo-access-dialog';
  dialog.setAttribute('aria-labelledby','demo-access-title');
  dialog.innerHTML=`<div class="demo-access-heading"><div><p class="demo-access-eyebrow">WebApp-demo</p><h2 id="demo-access-title">Log in om verder te kijken</h2></div><button type="button" data-access-close aria-label="Inlogvenster sluiten">×</button></div><p>Ontdek alle modules met fictieve gegevens. Log in met de gegevens die je van ons hebt ontvangen.</p><form data-access-form><label for="demo-access-user">Gebruikersnaam<input id="demo-access-user" name="username" autocomplete="username" required maxlength="120"></label><label for="demo-access-password">Wachtwoord<input id="demo-access-password" name="password" type="password" autocomplete="current-password" required maxlength="256"></label><p data-access-error role="alert"></p><button type="submit" class="demo-access-submit">Inloggen</button></form><div class="demo-access-request"><p>Nog geen inloggegevens?</p><a href="/contact/?onderwerp=demo-toegang#contact-form" target="_top">Vraag gratis inloggegevens aan →</a><p>Je ontvangt de gegevens na je aanvraag.</p></div>`;
  root.append(dialog);
  const form=dialog.querySelector('form'),error=dialog.querySelector('[data-access-error]'),submit=form.querySelector('[type=submit]');
  function authorized(){return authenticated&&expiresAt>Date.now();}
  async function session(){
    const response=await fetch('/api/demo-access.php',{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
    const data=await response.json();
    if(!response.ok)throw Error(data.error||'Inloggen is momenteel niet beschikbaar.');
    authenticated=data.authenticated===true;expiresAt=Number(data.expiresAt)||0;csrf=data.csrf;
  }
  const ready=session().catch(()=>{});
  setInterval(()=>{if(authenticated&&document.visibilityState==='visible')session().catch(()=>{authenticated=false;});},30000);
  document.addEventListener('visibilitychange',()=>{if(authenticated&&document.visibilityState==='visible')session().catch(()=>{authenticated=false;});});
  function close(){form.elements.password.value='';dialog.close();pending=null;returnFocus?.focus();}
  function request(action=null){
    if(authorized()){action?.();return;}
    pending=action;returnFocus=document.activeElement;error.textContent='';
    if(!dialog.open)dialog.showModal();
    dialog.querySelector('[name=username]').focus();
  }
  dialog.querySelector('[data-access-close]').addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();error.textContent='';submit.disabled=true;submit.textContent='Inloggen…';
    try{
      await ready;if(!csrf)await session();
      const response=await fetch('/api/demo-access.php',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({username:form.elements.username.value.trim(),password:form.elements.password.value,csrf}),signal:AbortSignal.timeout(10000)});
      const data=await response.json();
      if(!response.ok||data.authenticated!==true)throw Error(data.error||'Inloggen lukt nu niet. Probeer het opnieuw.');
      authenticated=true;expiresAt=Number(data.expiresAt)||0;csrf=data.csrf;
      form.elements.password.value='';const action=pending;pending=null;dialog.close();returnFocus?.focus();action?.();
    }catch(failure){error.textContent=failure.name==='TimeoutError'?'De verbinding duurt te lang. Probeer het opnieuw.':['TypeError','SyntaxError'].includes(failure.name)?'Inloggen lukt nu niet. Controleer je verbinding en probeer het opnieuw.':failure.message;}
    finally{submit.disabled=false;submit.textContent='Inloggen';}
  });
  root.addEventListener('click',event=>{
    if(authorized()||event.target.closest('.demo-access-dialog,[data-demo-theme],.sidebar-note,.demo-photo-note')||!event.target.closest('button,a,summary'))return;
    const target=event.target.closest('button,a,summary');
    event.preventDefault();event.stopImmediatePropagation();request(()=>target.isConnected&&target.click());
  },true);
  root.addEventListener('submit',event=>{
    if(authorized()||event.target.closest('[data-access-form]'))return;
    event.preventDefault();event.stopImmediatePropagation();const target=event.target;request(()=>target.requestSubmit());
  },true);
  window.DemoAccess={ready,authorized,request};
})();
