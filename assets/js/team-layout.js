/* Keep each row of vacancy summaries aligned when copy wraps differently. */
(() => {
  const grid = document.querySelector('.team-roles');
  if (!grid) return;
  const summaries = [...grid.querySelectorAll('.team-role-summary')];

  function alignRows() {
    summaries.forEach(summary => { summary.style.minHeight = 0; });
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    for (let i = 0; i < summaries.length; i += columns) {
      const row = summaries.slice(i, i + columns);
      const height = Math.max(...row.map(summary => summary.getBoundingClientRect().height));
      row.forEach(summary => { summary.style.minHeight = `${height}px`; });
    }
  }

  let previousWidth = 0;
  const observer = new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (width !== previousWidth) {
      previousWidth = width;
      alignRows();
    }
  });
  observer.observe(grid);
  if (document.fonts) document.fonts.ready.then(alignRows);
  alignRows();
})();
