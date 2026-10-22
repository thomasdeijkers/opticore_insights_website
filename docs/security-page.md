# Security explanation page

Canonical route: `/beveiliging/`; identical legacy alias: `/beveiliging.html`.
The page is an explanation of implementation choices and agreed services, not a security certification or a promise that every customer application has identical controls.

## Verified implementation evidence

Read-only inspection on 22 October 2026:

- `olympus_bouw/backend/app.py`: scrypt password hashing with a per-account salt; server-side login check; server-side sessions with an expiry; Secure, HttpOnly and SameSite cookies; session deletion on logout; active-account check.
- `olympus_bouw/deploy/nginx-olympus-secure.conf`: HTTPS redirect, login rate limiting and private application indexing headers. This is configuration evidence, not a penetration test or independent runtime audit.
- Olympus does not show or implement TOTP in the inspected login flow. The page explicitly separates the Olympus password login example from optional Authenticator setup.
- `opticore-intern/apps/operations_dashboard/main.py`: supports password hashes and per-user six-digit TOTP with 30-second time steps. Deployment configuration and secrets were not read or copied. Do not claim that all existing accounts in all projects use an identical configuration.

No application source, accounts, private dashboard content, QR enrollment keys, recovery keys or credential files are published. Backend internals and deployment addresses are not linked on the public page. Personal account provisioning, role design, maintenance, backups, restore testing, SSO and extra verification are described as arrangements to establish per project.

## Original login images

`assets/img/security/olympus-login-desktop.jpg` (600 x 640) and
`olympus-login-mobile.jpg` (430 x 932) are direct browser screenshots of the empty Olympus login window. Both inputs were confirmed empty. No login was submitted. These are specifically requested login examples; existing neutral dashboard illustrations remain unchanged. The shared gallery automatically selects phone portrait versus desktop/tablet/landscape and opens the existing closeable image viewer.

## Official Google images

Unmodified public assets from Google's official Play Store listing, retrieved 22 October 2026:
https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=nl

- `google-authenticator-icon.png` (240 x 240): `https://play-lh.googleusercontent.com/4qyuLCJkVpVfoIeu6b0ld6LkKzPHHby9ZilLbxhUZLK4f64o65oHGW-ZsuVe3LAWDVuIZpkQISmmVvA4-qnofw=w240`.
- `google-authenticator-codes.jpg` (900 x 1950): `https://play-lh.googleusercontent.com/pXzvAkfAJWWthWh2VyarJSpcnAamcXEk_34CiVvAyopC879oMW2mGE8CvaqeNsICNgP2E0FU4fT-a550IN2x=w900`.
- `google-authenticator-setup.jpg` (900 x 1950): `https://play-lh.googleusercontent.com/d8SmgK0c50lqQlBY4YB3cSmqCTg5-UnvL424zh1m_s8lEzqQW4Uzbnl-LAy0TibpSjKXbrdcX9lVMudDX994rg=w900`.
- `google-authenticator-verification.jpg` (900 x 1950): `https://play-lh.googleusercontent.com/L1rjVN3V0Hu9o-6zY5Rp_FWCtWd2XmIXcvNJy2P1x0rhWcdzCBSfqkZZNk6fXotvP9KS8Kd9I9iKyjVwImgvUg=w900`.

The accounts and codes in the Google image are Google's public sample content. No code or enrollment value was taken from a real customer account. Google screenshots remain original phone screens on every device. The phone/desktop rule applies to the Olympus login views. Product attribution and source links appear on the page.

## Explanatory sources

- Google Authenticator Help: https://support.google.com/accounts/answer/1066447?hl=nl
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

Inbound contextual links: services, dashboards, modular webapp, API integrations, Olympus project story and knowledge index. The main menu stays compact. The canonical page is included in the crawlable sitemap.

## Huidige beeldweergave

De Olympus-inlogcaptures zijn vervangen door neutrale inlogvoorbeelden onder assets/img/examples/login-*. De galerij toont op mobiel het lege inlogvenster en de voorbeeldstap voor extra verificatie naast elkaar. De tekst beschrijft ze als illustratie, zonder te suggereren dat Olympus al Authenticator ondersteunt. De feitelijke beschrijving van scrypt en sessies voor Olympus blijft behouden. Officiele Google-appbeelden blijven ongewijzigd met bronvermelding. Zie scripts/neutral_visuals_manifest.json en docs/screenshot-gallery.md.
