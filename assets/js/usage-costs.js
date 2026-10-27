(function(scope){
  'use strict';
  function band(tiers,value,whole=false){
    if(!Number.isFinite(value)||value<0||(whole&&!Number.isInteger(value)))throw Error('Vul een geldig gebruiksvolume in. AI-aanvragen zijn hele aantallen.');
    return tiers.find(t=>t.max===null||value<=t.max);
  }
  function estimate(config,values,packageMonthly){
    if(!Number.isFinite(packageMonthly)||packageMonthly<0)throw Error('Het vaste pakketbedrag ontbreekt.');
    const database=band(config.database,Number(values.database)),text=band(config.text,Number(values.text),true),images=band(config.images,Number(values.images),true);
    const needsQuote=[database,text,images].some(t=>t.price===null),usage=needsQuote?null:database.price+text.price+images.price;
    return {database,text,images,usage,packageMonthly,total:usage===null?null:packageMonthly+usage,needsQuote};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={band,estimate};
  if(typeof document==='undefined')return;
  const form=document.querySelector('[data-usage-calculator]');if(!form)return;
  const config=JSON.parse(document.querySelector('#usage-pricing-data').textContent);
  const money=n=>new Intl.NumberFormat((typeof window !== 'undefined' && window.SiteI18n?.locale) || 'nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const requested=(new URLSearchParams(location.search).get('modules')||'').slice(0,500).split(',');
  const selected=scope.WebappPricing.resolve(requested);
  const show=(selector,text)=>document.querySelectorAll(selector).forEach(node=>node.textContent=text);
  show('[data-usage-package]',money(selected.monthly));
  document.querySelector('[data-usage-package-name]').textContent=selected.extraModules.length?'Startpakket + '+selected.extraModules.length+' uitbreidingen':'Startpakket';
  const back=scope.WebappPricing.calculatorURL(selected.extraModules);document.querySelector('[data-usage-back]').href=back;
  function update(){
    const error=document.querySelector('[data-usage-error]');error.textContent='';
    try{
      const data=Object.fromEntries(new FormData(form)),result=estimate(config,data,selected.monthly);
      for(const key of ['database','text','images'])show('[data-usage-'+key+']',result[key].price===null?'Op maat':money(result[key].price));
      show('[data-usage-total]',result.total===null?'Voorstel op maat':money(result.total));
      document.querySelector('[data-usage-quote]').hidden=!result.needsQuote;
    }catch(e){error.textContent=e.message;show('[data-usage-total]','Controleer je invoer');}
  }
  form.addEventListener('submit',event=>{event.preventDefault();update();});
  form.addEventListener('input',update);update();
})(typeof window!=='undefined'?window:globalThis);
