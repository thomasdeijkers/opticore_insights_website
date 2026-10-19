const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Menu sluiten" : "Menu openen");
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu && menu.classList.contains("is-open")) {
    menu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Menu openen");
    menuToggle.focus();
  }
});

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    if (window.location.protocol !== "file:") {
      return;
    }

    event.preventDefault();
    const data = new FormData(contactForm);
    const topic = contactForm.querySelector('[name="topic"]');
    const topicLabel = topic?.selectedOptions[0]?.textContent;
    const details = Array.from(contactForm.querySelectorAll('fieldset:not([disabled]) [data-contact-detail]'))
      .filter(field => field.value.trim())
      .map(field => `${field.dataset.mailLabel}: ${field.value.trim()}`);
    const subject = encodeURIComponent(`Contactaanvraag: ${topicLabel || data.get("subject") || "OptiCore Insights"}`);
    const body = encodeURIComponent([
      `Naam: ${data.get("name") || ""}`,
      `Bedrijf: ${data.get("company") || ""}`,
      `E-mail: ${data.get("email") || ""}`,
      `Telefoon: ${data.get("phone") || ""}`,
      "",
      "Bericht:",
      data.get("message") || "",
      "",
      ...details
    ].join("\n"));

    window.location.href = `mailto:info@opticore-insights.nl?subject=${subject}&body=${body}`;
  });
}


document.querySelectorAll("[data-tabs]").forEach((group) => {
  const buttons = Array.from(group.querySelectorAll("[data-tab]"));
  const panes = Array.from(group.querySelectorAll("[data-pane]"));

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-tab");
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      panes.forEach((pane) => pane.classList.toggle("is-active", pane.getAttribute("data-pane") === target));
    });
  });
});
