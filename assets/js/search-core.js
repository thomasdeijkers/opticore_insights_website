/* Shared by the browser and the relevance checks; no network or DOM access. */
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OpticoreSearch = api;
})(typeof window === 'undefined' ? {} : window, () => {
  function normalize(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  }
  const aliases = [
    ['voorraad','stock','voorraadbeheer'], ['forecast','forecasting','omzetverwachting','voorspelling'],
    ['koppeling','koppelingen','integratie','integraties','api'], ['ai','kunstmatige'],
    ['website','websites','webontwikkeling'],
    ['prijs','prijzen','kosten','tarieven'], ['zzp','zzper','freelance'],
    ['beveiliging','security','veiligheid'], ['tijdwinst','tijdbesparing']
  ];
  function terms(query) {
    return [...new Set(normalize(query).replace(/\bmarketing agent\b/g,'marketingagent').split(' ').filter(Boolean))].slice(0, 12).map(term => {
      const group = aliases.find(group => group.includes(term));
      return [...new Set([term, ...(group || [])])];
    });
  }
  function has(text, group) {
    const words = text.split(' ');
    return group.some(term => words.some(word => word.startsWith(term)));
  }
  function prepare(pages) {
    return pages.map(page => ({...page, normalizedTitle:normalize(page.title),
      normalizedDescription:normalize(page.description),
      sections:page.sections.map(section => ({...section,
        normalizedHeading:normalize(section.heading), normalizedAnchor:normalize(section.anchor), normalizedText:normalize(section.text)}))}));
  }
  function search(pages, query, category = '') {
    const groups = terms(query);
    if (!groups.length) return [];
    const phrase = normalize(query);
    const results = [];
    for (const page of pages) {
      if (category && page.category !== category) continue;
      const whole = [page.normalizedTitle, page.normalizedDescription,
        ...page.sections.map(s => s.normalizedHeading+' '+s.normalizedText)].join(' ');
      if (!groups.every(group => has(whole, group))) continue;
      let best = page.sections[0];
      let bestScore = -1;
      for (const section of page.sections) {
        const score = groups.reduce((total, group) => total +
          (has(section.normalizedHeading, [group[0]]) ? 10 : has(section.normalizedHeading, group) ? 5 : 0) +
          (has(section.normalizedAnchor, [group[0]]) ? 8 : 0) +
          (has(section.normalizedText, [group[0]]) ? 2 : has(section.normalizedText, group) ? 1 : 0), 0) +
          (section.normalizedHeading.includes(phrase) ? 7 : 0);
        if (score > bestScore) { best = section; bestScore = score; }
      }
      const score = bestScore + groups.reduce((total, group) => total +
        (has(page.normalizedTitle, group) ? 12 : 0) +
        (has(page.normalizedDescription, group) ? 3 : 0), 0) +
        (page.normalizedTitle.includes(phrase) ? 15 : 0);
      const literalSection = groups.some(group=>has(best.normalizedHeading+' '+best.normalizedAnchor,[group[0]]));
      const url = page.url + (best.anchor && literalSection ? '#'+encodeURIComponent(best.anchor) : '');
      results.push({page, section:best, score, url});
    }
    return results.sort((a,b) => b.score-a.score || a.page.title.localeCompare(b.page.title,'nl'));
  }
  function excerpt(result, query) {
    const text = result.section.text || result.page.description;
    const words = terms(query).flat();
    let position = 0;
    for (const match of text.matchAll(/[\p{L}\p{N}]+/gu)) {
      if (words.some(word => normalize(match[0]).startsWith(word))) {position=match.index;break;}
    }
    let start = Math.max(0, position-60);
    if (start) {const space=text.indexOf(' ',start);start=space<0?start:space+1;}
    let end = Math.min(text.length,start+220);
    if (end<text.length) {const space=text.lastIndexOf(' ',end);if(space>start)end=space;}
    return (start?'… ':'')+text.slice(start,end)+(end<text.length?' …':'');
  }
  return {normalize, terms, prepare, search, excerpt};
});
