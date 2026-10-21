# Metadata review — 22 October 2026

All 59 indexable canonical pages received an individual review and updated metadata. Thirteen existing example pages keep their intentional noindex status and metadata. Canonicals, robots directives, visible page bodies, page addresses and publication dates are preserved. Legacy HTML aliases match their canonical page. Brand naming uses OptiCore Insights consistently.

Each page has a concrete topic and intent: commissioning a service, understanding a technology, requesting a proposal, reading a case, or navigating an overview. Service and explanation pages have distinct wording. Project metadata reflects the actual case; Rust Werkt remains a concept. Contact metadata names the company and keeps Thomas as the point of contact. Snippets retain the requested checkmarks where helpful.

Character lengths are editorial aids, not Google limits or guarantees. The report records actual HTML metadata; Google chooses its own title links and snippets depending on the query and device.

## Sources

- Google Search Central, title links: https://developers.google.com/search/docs/appearance/title-link
- Google Search Central, snippets: https://developers.google.com/search/docs/appearance/snippet

## Sources and checks

Static pages keep metadata in HTML. `scripts/news.py` renders the news overview and article pages; article metadata uses `seo_title` and `description` in `content/news.json`. Optional `seo_title` differs from the editorial article title without changing the visible headline or dates.

`scripts/metadata.py --check` validates required fields, canonical grouping, alias agreement, unique indexable titles/descriptions and consistent social metadata. The deployment workflow runs this after news and sitemap generation. The broader HTML audit also checks structured data, links and reachability.

Use `--export` with an output directory outside this repository for a readable HTML inventory and UTF-8 text inventory. Both list all 72 canonical URLs with actual titles, descriptions, lengths and robots status. Aliases are not counted twice. Use `--verify-live` after deployment to compare every canonical page against the server. Do not commit generated reports or email runtime data.
