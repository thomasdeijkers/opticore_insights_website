# Project brands and category icons

Original assets copied without changes from the existing project repositories:

- `hellosmart.png`: `Home_assistant/transip-migration/dist/assets/dealer-hellosmart.png`.

- `smartlife-domotica.svg`: `Home_assistant/transip-migration/dist/assets/dealer-smartlife.svg`.
- `top-groep-nederland.png`: `top_groep_nederland/apps/dashboard/static/top-groep-nederland.png`.
- `de-valk-advies.webp`: `devalkadvies/logo.webp`.
- `rust-werkt.svg`: `rustwerkt_website/rustwerkt-testsite/assets/img/rustwerkt-logo.svg`.
- `olympus-bouw.png`: `olympus_bouw/public/olympus_bouw_logo.png`.
- `home-assistant-hub.webp`: `Home_assistant/transip-migration/dist/assets/home-assistant-logo.webp`.

The Home Assistant hub project uses the same mark and project name as the
existing website header. It identifies that website project, not Home Assistant
as a commissioning organization. Rust Werkt remains labelled as a website concept.
Brand images retain their original colors and proportions, on white backgrounds.

`assets/img/rubric-icons.svg` is a local, code-drawn set of decorative line icons.
Visible category names remain the accessible labels; icons are aria-hidden.
No external font, icon CDN or runtime dependency is needed.

`project-hellosmart.jpg` is a direct browser screenshot of the public HelloSmart homepage, captured on 2026-10-20; no private store data is shown.

`home-workspace.webp` is a decorative stock workspace photograph by Carter Hightower on Unsplash:
https://unsplash.com/photos/4GD9RphwnZA (Unsplash License).
Downloaded at 1920px wide in WebP format from
https://images.unsplash.com/photo-1743796055651-41c743ff2465?auto=format&fit=crop&fm=webp&q=78&w=1920
on 2026-10-21. It illustrates working with digital tools and notes; it is not presented as an OptiCore office, employee or product screenshot. A light overlay keeps foreground text readable on mobile and desktop.

## Technology topic illustrations

Added for the Power BI, Excel, Python and PostgreSQL explanations and the related links in the dashboard, automation and knowledge overviews. Logos identify the software discussed; their original colors and proportions are preserved. Public source credit is available in the expandable ‘Beeldbronnen’ section on each affected page.

- `technology/power-bi.svg` and `technology/excel.svg`: original Microsoft assets from `https://github.com/microsoft/PowerBI-Icons/tree/main/SVG` (`Power-BI.svg`, `Excel-Workbook.svg`). Repository content is CC BY 4.0; trademark rights remain with Microsoft. See `https://github.com/microsoft/PowerBI-Icons#legal-notices`.
- `technology/python.svg`: official Python Software Foundation symbol from `https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/python-logo-only.svg`, linked by `https://www.python.org/community/logos/`.
- `technology/postgresql.png`: original PostgreSQL elephant from `https://www.postgresql.org/media/img/about/press/elephant.png`, linked by `https://www.postgresql.org/about/press/presskit18/#graphics`. See the project's trademark policy at `https://www.postgresql.org/about/policies/trademarks/`.
- `power-bi-customer-report.png` (1954 × 1141) and `power-bi-customer-profitability.png` (578 × 569): unmodified `customer2.png` and `power-bi-dash.png` from `https://learn.microsoft.com/en-us/power-bi/create-reports/media/sample-customer-profitability/`. The Microsoft/obviEnce sample and its context: `https://learn.microsoft.com/en-us/power-bi/create-reports/sample-customer-profitability`. They are labelled as Microsoft sample reports, separately from OptiCore's own project screenshots.

The technology examples now use neutral illustrations for the De Valk Advies, Top Groep Nederland and Smartlife functionality, as described below. Public Power BI samples retain their original layout and attribution.

## Neutral dashboard and application examples — 22 October 2026

At the user's request, fifteen images of the actual application interfaces were replaced with a consistent neutral visual style. No client logos, OptiCore application branding, original app CSS, database, API or application code is included. Figures, names and articles are fictitious. These images illustrate functionality and must not be described as production screenshots.

- Editable source: `scripts/neutral_visuals.py` and `scripts/neutral_visuals.css`.
- Capture manifest: `scripts/neutral_visuals_manifest.json` (page, public filename, old filename, dimensions and alt text).
- Public assets: `assets/img/examples/`. Eight desktop images at 1280 × 900; seven phone images at 390 × 844.
- Generate static source pages with `python scripts/neutral_visuals.py <scratch-directory>` and serve that directory on loopback. Capture each manifest entry with the browser at the stated viewport size. Commit the reviewed JPEGs, not scratch HTML output.
- The same responsive HTML/CSS produces the phone and desktop layouts. Keep full viewport captures and the gallery's existing automatic device selection.
- Existing product logos and unmodified Microsoft/bol source screenshots remain separate from this neutral example collection. Public website project screenshots are also unchanged.
- The superseded application-interface assets were removed from the repository and are no longer deployed.

## Security and login examples — 22 October 2026

`assets/img/security/` contains two original empty Olympus login screenshots and four unmodified public Google Authenticator assets. These were requested specifically for the security explanation; they do not replace or expose dashboard screens. No credentials, real QR enrollment codes or recovery keys are shown. Source URLs, dimensions and usage distinctions are documented in [security-page.md](security-page.md). Product attribution is visible on `/beveiliging/`.
