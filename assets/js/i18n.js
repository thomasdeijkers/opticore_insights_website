/* Offline localisation of interactive output; no third-party requests or input translation. */
(() => {
  'use strict';
  const config = window.OptiCoreLocale;
  if (!config) return;
  const language = config.language;
  const dictionary = config.strings || {};
  const mapping = config.routes;
  const normalize = value => String(value).replace(/\s+/g, ' ').trim();
  const escapeRE = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const translated = new Set(Object.values(dictionary));
  const patterns = Object.entries(dictionary).filter(([key]) => /__I18N_\d+__/.test(key))
    .sort((a,b) => b[0].length-a[0].length).map(([key,value]) => {
      const tokens = [...key.matchAll(/__I18N_\d+__/g)].map(match=>match[0]);
      return {expression:new RegExp('^'+key.split(/__I18N_\d+__/).map(escapeRE).join('(.+?)')+'$'),tokens,value};
    });
  const fragments = Object.keys(dictionary).filter(key => key.length>=3 && key.length<=160 &&
    !key.includes('__I18N_') && key!==dictionary[key] && !translated.has(key)).sort((a,b)=>b.length-a.length);
  const fragmentRE = fragments.length ? new RegExp('(?<![\\p{L}\\p{N}_])(?:'+fragments.map(escapeRE).join('|')+')(?![\\p{L}\\p{N}_])','gu') : null;

  function text(value, depth=0) {
    if (language==='nl' || typeof value!=='string' || !value.trim()) return value;
    const key=normalize(value);
    if (translated.has(key)) return value;
    let result=dictionary[key];
    if (result===undefined && depth<2) {
      for (const pattern of patterns) {
        const match=key.match(pattern.expression);
        if (!match) continue;
        result=pattern.value;
        pattern.tokens.forEach((token,index)=>{result=result.replace(token,text(match[index+1],depth+1));});
        break;
      }
    }
    if (result===undefined) result=fragmentRE ? key.replace(fragmentRE,match=>dictionary[match]) : key;
    return value.match(/^\s*/)[0]+result+value.match(/\s*$/)[0];
  }

  const reverse = new Map();
  Object.entries(mapping).forEach(([canonical,editions])=>{
    reverse.set(canonical,canonical);
    Object.values(editions).forEach(route=>reverse.set(route,canonical));
  });
  function url(value, target=language) {
    let address;
    try { address=new URL(value,location.href); } catch { return value; }
    if(address.origin!==location.origin || !['http:','https:'].includes(address.protocol))return value;
    let path=address.pathname;
    if(path.endsWith('.html'))path=path.slice(0,-5).replace(/\/$/,'')+'/';
    if(path==='/index/')path='/';
    const canonical=reverse.get(path);
    if(!canonical)return value;
    const next=target==='nl'?canonical:mapping[canonical][target];
    return next+address.search+address.hash;
  }
  window.SiteI18n={language,locale:{nl:'nl-NL',de:'de-DE',en:'en-GB',fr:'fr-FR'}[language],text,url};

  const attributes=['aria-label','aria-description','alt','title','placeholder','data-label'];
  const skip='script,style,code,pre,textarea,input,[contenteditable=true],[data-i18n-ignore],.language-picker';
  const seen=new WeakMap();
  const seenAttributes=new WeakMap();
  function localize(root) {
    if(root.nodeType===Node.TEXT_NODE) {
      if(!root.parentElement || root.parentElement.closest(skip))return;
      const current=root.nodeValue;
      if(seen.get(root)===current)return;
      const result=text(current);seen.set(root,result);
      if(result!==current)root.nodeValue=result;
      return;
    }
    if(root.nodeType!==Node.ELEMENT_NODE || root.matches('script,style,code,pre,[contenteditable=true],[data-i18n-ignore],.language-picker'))return;
    // An implicit option value is application state: preserve it before translating its label.
    if(root.tagName==='OPTION' && !root.hasAttribute('value'))root.setAttribute('value',root.textContent);
    for(const name of attributes)if(root.hasAttribute(name)){
      const current=root.getAttribute(name);
      const remembered=seenAttributes.get(root)||new Map();
      if(remembered.get(name)===current)continue;
      const next=text(current);remembered.set(name,next);seenAttributes.set(root,remembered);
      if(current!==next)root.setAttribute(name,next);
    }
    for(const name of ['href','action','src','data-src'])if(root.hasAttribute(name)){
      const current=root.getAttribute(name);
      if(current.startsWith('#') || root.closest('.language-picker'))continue;
      const next=url(current);if(current!==next)root.setAttribute(name,next);
    }
    if(!root.matches('textarea,input'))for(const child of root.childNodes)localize(child);
  }
  const pending=new Set();let queued=false;
  function flush() {
    queued=false;const nodes=[...pending];pending.clear();
    // Our own changes must not schedule another translation pass.
    observer.disconnect();
    try{for(const node of nodes)if(node.isConnected)localize(node);}
    finally{observe();}
  }
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='childList')record.addedNodes.forEach(node=>pending.add(node));
      else pending.add(record.target);
    }
    if(!queued&&pending.size){queued=true;queueMicrotask(flush);}
  });
  // Register before application scripts mount asynchronously rendered modules.
  function observe(){observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:[...attributes,'href','action','src','data-src']});}
  localize(document.body);
  observe();
  const picker=document.querySelector('[data-site-language]');
  picker?.addEventListener('change',()=>{
    if(!Object.hasOwn({nl:1,de:1,en:1,fr:1},picker.value))return;
    location.assign(url(location.href,picker.value));
  });
  // Keep locale on dynamically constructed links even when activated immediately.
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(link&&!link.closest('.language-picker')&&!link.getAttribute('href').startsWith('#'))link.setAttribute('href',url(link.href));
  },true);
})();
