# Contrast review — 20 October 2026

## Cause and fix

The reported screenshot is the earlier About page, before the shared `site.css`
layout. Reproducing that HTML from `da46000^` with the retained stylesheets showed
`#dbeafe` text on white: 1.22:1. A broad `!important` rule in `style.css` intended
for dark panels overrode the later light editorial theme.

The light About section and timeline introduction no longer receive that forced
light color. Dark panel text retains its matching background. Timeline number
labels now use dark text on orange (5.18:1).

The current shared layout also has darker body and secondary text, explicit
opaque placeholder colors, and clearer contact/demo control borders. Versioned
stylesheet links are updated in all HTML aliases and the news renderer.
The live hosting does not apply Apache cache-header directives, so the attempted
conditional `.htaccess` rule was removed after verification. The updated current
pages use new stylesheet version URLs; retained old theme files contain the fixes
as well. A previously cached old page may need a manual browser refresh.

## Verification

Read-only browser checks compare computed text colors against composited ancestor
backgrounds, including hidden-element filtering and input placeholders. The
comparison thresholds used were 4.5:1 for normal text and 3:1 for large text.

- 68 current canonical pages at 390 × 844: 3,940 text samples, no failures.
- The same 68 pages at the default desktop viewport: 4,275 samples, no failures.
- Eight earlier page layouts, served only by an external local QA fixture:
  About, portfolio, homepage, contact, services, dashboards, automation and
  knowledge index; no remaining text contrast failures.
- All six contact topics with their conditional fields shown: no failures.
- Completed choice-guide result: 147 samples, no failures.
- The exact About section from the screenshot was inspected visually on mobile.
- HTML structure, metadata, alias equality, internal links and sitemap validated.
- Live deployment: all 55 indexable pages and 16 images returned HTTP 200.

This is a focused contrast check, not a certification of overall accessibility.
Text baked into client logos or screenshots is outside the computed DOM check.
The QA fixture and browser reports are kept outside the public source tree.
