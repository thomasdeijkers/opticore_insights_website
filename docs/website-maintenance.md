# Onderhoudsscherm tijdens publicatie

`https://opticore-insights.nl/onderhoud.php` toont een voorbeeld van het eigen onderhoudsscherm. De tekst is: **De website wordt verbeterd, kom zo bij ons terug voor meer informatie.** Het scherm bevat het spelletje en het eenvoudige supportformulier dat een e-mailconcept in het mailprogramma van de bezoeker opent. Het gebruikt eigen bestanden, geen dashboard of externe diensten.

De bestaande workflow **Deploy static site to TransIP** voert vóór de gewone website-upload `scripts/site_maintenance.py begin` uit met dezelfde SFTP-instellingen. Die publiceert eerst de onderhoudspagina en de bijbehorende bestanden, voegt een beheerd blok toe aan de bestaande `.htaccess` en zet de marker `.opticore-maintenance`. Andere bestaande Apache-regels blijven behouden. Een HTTP-controle bevestigt de tijdelijke 503-pagina voor zowel de homepage als een dieper HTML-adres. Bij een mislukte activeringscontrole worden de configuratie en marker teruggezet.

Tijdens de update blijven alleen `onderhoud.php` en `maintenance/` bereikbaar. Gewone browserpagina's krijgen HTTP 503 met `Retry-After: 30` en zonder cache. API- en POST-verzoeken ontvangen JSON met 503; hun acties worden niet opnieuw uitgevoerd. Het automatisch verversen is alleen voor GET-pagina's en pauzeert tijdens het invullen van de supportvraag.

Na de SFTP-upload controleert `finish` de checksum van de geüploade homepage, verwijdert de marker en controleert de publieke homepage op HTTP 200. Bij een mislukte upload blijft het onderhoudsscherm actief tot een volgende geslaagde publicatie. Het script verwijdert geen websitebestanden en de gewone SFTP-upload heeft `delete_remote_files: false`. Verouderde bestanden worden dus niet automatisch opgeruimd.

De bestanden in `maintenance/` en `onderhoud.php` worden uitsluitend in de eerste, afzonderlijke upload bijgewerkt; de grote upload slaat ze over. Zo kan een bezoeker tijdens de upload geen half geschreven onderhoudsscherm ophalen. `.htaccess` wordt via SFTP expliciet als verborgen bestand bijgewerkt. Er zijn geen extra serverrechten of gewijzigde VPS-instellingen nodig.
