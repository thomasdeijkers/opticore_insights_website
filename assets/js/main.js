const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const storedTheme = localStorage.getItem("opticore-theme");
const initialTheme = storedTheme || "dark";

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (themeToggle) {
    const isLight = theme === "light";
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.setAttribute("aria-label", isLight ? "Schakel donker thema in" : "Schakel licht thema in");
  }
  if (themeLabel) {
    themeLabel.textContent = theme === "light" ? "Dark" : "Light";
  }
}

applyTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    localStorage.setItem("opticore-theme", nextTheme);
    applyTheme(nextTheme);
  });
}

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
