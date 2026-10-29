"""Shared public components, authored once before localising each edition."""
import re

SCENES = [
    ('communicatie', 'Duidelijke communicatie', 'We maken afspraken begrijpelijk en houden je op de hoogte van voortgang, keuzes en vervolgstappen.', 'AI-sfeerbeeld: samen een project bespreken.'),
    ('inzicht', 'Inzicht waar je iets mee kunt', 'We brengen relevante cijfers samen en leggen uit wat ze betekenen, zodat je beter kunt bepalen waar actie nodig is.', 'AI-sfeerbeeld: cijfers en inzichten bekijken.'),
    ('automatisering', 'Minder handwerk', 'We kijken welke terugkerende stappen slimmer kunnen, met aandacht voor controle, uitzonderingen en de mensen die ermee werken.', 'AI-sfeerbeeld: werken aan een slimme workflow.'),
    ('samenwerken', 'Samenwerking die meegroeit', 'We beginnen met een afgebakende stap. Daarna breiden we gericht uit op basis van wat jouw bedrijf en werkwijze nodig hebben.', 'AI-sfeerbeeld: op afstand samen aan een project werken.'),
]


def expectations():
    slides = ''.join(f'<article class="expectation-slide" role="group" aria-label="{i} / 4"><figure><img src="/assets/img/collaboration-v1/{key}.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="{alt}"><figcaption>AI-sfeerbeeld</figcaption></figure><div class="expectation-copy"><span class="expectation-number" aria-hidden="true">0{i}</span><h3>{title}</h3><p>{copy}</p></div></article>' for i, (key, title, copy, alt) in enumerate(SCENES, 1))
    return ('<!-- expectations:start --><section class="expectations-section" data-expectations aria-labelledby="expectations-heading"><div class="container">'
            '<div class="expectations-heading"><p class="eyebrow">Onze werkwijze</p><h2 id="expectations-heading">Wat je van OptiCore kunt verwachten.</h2></div>'
            '<div class="expectations-carousel" role="region" aria-label="Onze werkwijze in vier punten">'
            '<div class="expectations-track" id="expectations-track" tabindex="0" aria-label="Blader door onze werkwijze">' + slides + '</div>'
            '<div class="expectations-controls" hidden><button type="button" data-expectation-prev aria-label="Vorig punt" aria-controls="expectations-track"><span aria-hidden="true">←</span></button>'
            '<span class="expectations-count" aria-live="polite" aria-atomic="true">1 / 4</span>'
            '<button type="button" data-expectation-next aria-label="Volgend punt" aria-controls="expectations-track"><span aria-hidden="true">→</span></button></div></div>'
            '</div></section><!-- expectations:end -->')


def public_components(source):
    if '<footer class="site-footer"' not in source:
        return source
    def footer(match):
        block = re.sub(r'<li>\s*<a\b[^>]*href="/zoeken/"[^>]*>.*?</a>\s*</li>', '', match[0], flags=re.S)
        return re.sub(r'<div class="footer-contact">.*?</div>', '', block, flags=re.S)
    source = re.sub(r'<footer class="site-footer"[^>]*>.*?</footer>', footer, source, flags=re.S)
    source = re.sub(r'<!-- expectations:start -->.*?<!-- expectations:end -->', '', source, flags=re.S)
    # Insert inside main, visually immediately before the site footer.
    position = source.rfind('</main>')
    if position != -1:
        source = source[:position] + expectations() + source[position:]
        for tag in ('<link rel="stylesheet" href="/assets/css/expectations-carousel.css?v=20261029">', '<script src="/assets/js/expectations-carousel.js?v=20261029" defer></script>'):
            source = source.replace(tag, '')
        source = source.replace('</head>', '<link rel="stylesheet" href="/assets/css/expectations-carousel.css?v=20261029"></head>')
        source = source.replace('</body>', '<script src="/assets/js/expectations-carousel.js?v=20261029" defer></script></body>')
    return source
