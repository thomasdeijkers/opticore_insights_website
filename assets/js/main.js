const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    if (window.location.protocol !== "file:") {
      return;
    }

    event.preventDefault();
    const data = new FormData(contactForm);
    const subject = encodeURIComponent(`Contactaanvraag: ${data.get("subject") || "OptiCore Insights"}`);
    const body = encodeURIComponent([
      `Naam: ${data.get("name") || ""}`,
      `Bedrijf: ${data.get("company") || ""}`,
      `E-mail: ${data.get("email") || ""}`,
      `Telefoon: ${data.get("phone") || ""}`,
      "",
      "Bericht:",
      data.get("message") || ""
    ].join("\n"));

    window.location.href = `mailto:info@opticore-insights.nl?subject=${subject}&body=${body}`;
  });
}
