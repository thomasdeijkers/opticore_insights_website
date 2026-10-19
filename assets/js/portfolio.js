document.querySelectorAll("[data-portfolio]").forEach((portfolio) => {
  const controls = portfolio.querySelector("[data-portfolio-filters]");
  const buttons = Array.from(portfolio.querySelectorAll("[data-portfolio-filter]"));
  const entries = Array.from(portfolio.querySelectorAll("[data-portfolio-categories]"));
  const count = portfolio.querySelector("[data-portfolio-count]");

  if (!controls || !count || !entries.length) return;
  controls.hidden = false;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.portfolioFilter;
      buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));

      let visible = 0;
      entries.forEach((entry) => {
        const categories = entry.dataset.portfolioCategories.split(" ");
        entry.hidden = category !== "all" && !categories.includes(category);
        if (!entry.hidden) visible += 1;
      });

      count.textContent = `${visible} ${visible === 1 ? "opdracht" : "opdrachten"}`;
    });
  });
});
