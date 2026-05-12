# Harmonie 43 — Mist / Zicht (scrollable viewer)

Single-file HTML-viewer waarin je het Nederlandse **HARMONIE-AROME Cy43**
weermodel kan bekijken voor **mist** en **zicht**, frame voor frame,
verticaal scrollable tot het maximale voorspeluur (standaard +48 u).

## Gebruik

Open `index.html` in een browser. Geen build-stap, geen dependencies.

- **Preset** — kies een publieke bron. Het URL-template wordt automatisch ingevuld.
- **URL-template** — pas zelf aan als de preset niet (meer) werkt. Placeholders:
  - `{hh}` → uurnummer, 2 cijfers (`00`..`48`)
  - `{h}`  → uurnummer, 1+ cijfers (`0`..`48`)
  - `{HH}` → uurnummer, 3 cijfers (`000`..`048`)
  - `{param}` / `{PARAM}` → `zicht` / `mist`
- **Parameter** — schakel tussen mist en zicht.
- **Horizon** — `+24`, `+36`, `+48` (max Harmonie 43) of `+60` uur.
- **↻** — herlaad alle frames met cache-buster.

### Sneltoetsen

| Toets | Actie |
| --- | --- |
| `↓` / `j` | volgend uur |
| `↑` / `k` | vorig uur |
| `PgDn`    | +6 uur |
| `PgUp`    | −6 uur |
| `Home`    | naar +00 u |
| `End`     | naar laatste uur |

De rechterbalk toont alle uren als jump-links.

## Eigen URL invullen

De ingebakken presets zijn educated guesses — publieke weersites veranderen
soms hun URL-schema. Werkt een preset niet?

1. Open de bron in je browser en zoek een werkende afbeelding.
2. Rechtsklik → "afbeeldingsadres kopiëren".
3. Plak in het URL-template-veld en vervang het uurgetal door `{hh}`.
4. Optioneel: vervang `zicht`/`mist` in de URL door `{param}`.

De state (template, parameter, horizon) wordt bewaard in `localStorage`
en in de URL-hash, dus je kan de pagina delen of bookmarken.
