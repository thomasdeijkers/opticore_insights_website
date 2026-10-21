const root = document.querySelector('[data-embedded-guides]');
if (root) {
  const tablist = root.querySelector('[data-guide-tabs]');
  const tabs = [...tablist.querySelectorAll('[data-guide-tab]')];
  const panels = [...root.querySelectorAll('[data-guide-panel]')];
  const known = new Set(tabs.map(tab => tab.dataset.guideTab));
  function requested() {
    const key = new URLSearchParams(location.search).get('voorbeeld');
    return known.has(key) ? key : 'schakelaars';
  }
  function select(key, updateURL = false) {
    if (!known.has(key)) return;
    for (const tab of tabs) {
      const active = tab.dataset.guideTab === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    }
    for (const panel of panels) panel.hidden = panel.dataset.guidePanel !== key;
    if (updateURL) history.replaceState(null, '', `${location.pathname}?voorbeeld=${key}#live-demo`);
  }
  tablist.setAttribute('role', 'tablist');
  for (const tab of tabs) {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `demo-${tab.dataset.guideTab}`);
    tab.addEventListener('click', event => {
      event.preventDefault();
      select(tab.dataset.guideTab, true);
    });
    tab.addEventListener('keydown', event => {
      let index = tabs.indexOf(tab);
      if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') index = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[index].dataset.guideTab, true);
      tabs[index].focus();
    });
  }
  for (const panel of panels) {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${panel.dataset.guidePanel}`);
  }
  // Retain each iframe and its answers when changing tabs. No source HTML or feeds are copied.
  window.addEventListener('popstate', () => select(requested()));
  select(requested());
}
