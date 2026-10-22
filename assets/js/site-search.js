(() => {
  const form = document.querySelector('[data-site-search]');
  if (!form) return;
  const input = form.querySelector('input[name=q]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const filters = [...document.querySelectorAll('[data-search-category]')];
  const more = document.querySelector('[data-search-more]');
  const error = document.querySelector('[data-search-error]');
  const suggestions = document.querySelector('[data-search-suggestions]');
  document.querySelector('[data-search-retry]')?.addEventListener('click',()=>location.reload());
  const core = window.OpticoreSearch;
  let pages;
  let category = '';
  let limit = 15;
  let timer;

  function highlight(element, text, query) {
    const groups = core.terms(query).flat();
    let last = 0;
    for (const word of text.matchAll(/[\p{L}\p{N}]+/gu)) {
      if (!groups.some(term => core.normalize(word[0]).startsWith(term))) continue;
      element.append(document.createTextNode(text.slice(last,word.index)));
      const mark = document.createElement('mark');
      mark.textContent = word[0];
      element.append(mark);
      last = word.index+word[0].length;
    }
    element.append(document.createTextNode(text.slice(last)));
  }
  function render(updateUrl = true) {
    if (!pages) return;
    const query = input.value.trim().slice(0,120);
    const found = core.search(pages, query, category);
    results.replaceChildren();
    filters.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.searchCategory===category)));
    suggestions.hidden = !!query;
    status.textContent = !query ? 'Zoek op een onderwerp, dienst, project of platform.' :
      found.length ? `${found.length} ${found.length===1?'resultaat':'resultaten'} voor ‘${query}’.` :
        `Geen resultaten voor ‘${query}’. Probeer een ander woord of kies ‘Alles’.`;
    for (const result of found.slice(0,limit)) {
      const item = document.createElement('li');
      const label = document.createElement('p');
      label.className = 'search-result-category';
      label.textContent = result.page.category;
      const heading = document.createElement('h2');
      const link = document.createElement('a');
      link.href = result.url;
      highlight(link,result.page.title,query);
      heading.append(link);
      const context = document.createElement('p');
      context.className = 'search-result-context';
      if (result.section.heading && result.section.heading!==result.page.title) context.textContent=result.section.heading;
      const summary = document.createElement('p');
      highlight(summary,core.excerpt(result,query),query);
      item.append(label,heading);
      if (context.textContent) item.append(context);
      item.append(summary);
      results.append(item);
    }
    more.hidden = found.length <= limit;
    if (updateUrl) {
      const url = new URL(location.href);
      if (query) url.searchParams.set('q',query);else url.searchParams.delete('q');
      if (category) url.searchParams.set('rubriek',category);else url.searchParams.delete('rubriek');
      history.replaceState(null,'',url);
    }
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    input.value = (params.get('q') || '').slice(0,120);
    const requested = params.get('rubriek') || '';
    category = filters.some(button=>button.dataset.searchCategory===requested) ? requested : '';
    limit = 15;
    render(false);
  }
  form.addEventListener('submit',event=>{event.preventDefault();clearTimeout(timer);limit=15;render();});
  input.addEventListener('input',()=>{clearTimeout(timer);limit=15;timer=setTimeout(render,140);});
  filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.searchCategory;limit=15;render();}));
  more.addEventListener('click',()=>{limit+=15;render(false);});
  addEventListener('popstate',restore);
  restore();
  status.textContent = 'Zoekfunctie wordt geladen…';
  fetch('/assets/search-index.json?v=20261022a',{cache:'no-cache'})
    .then(response=>{if(!response.ok)throw new Error('Index unavailable');return response.json();})
    .then(index=>{if(index.version!==1 || !Array.isArray(index.pages))throw new Error('Invalid index');pages=core.prepare(index.pages);render(false);})
    .catch(()=>{status.textContent='De zoekfunctie is tijdelijk niet beschikbaar.';error.hidden=false;});
})();
