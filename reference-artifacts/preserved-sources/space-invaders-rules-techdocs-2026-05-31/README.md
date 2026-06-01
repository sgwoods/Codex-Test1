# Space Invaders Rules And Technical Documents

This preserved-source package extends the `Windigo Invaders` intake lane with
written rules, score behavior, DIP settings, and service/manual artifacts.

## Current Role

- source family: `space-invaders-reference`
- planned Platinum game: `windigo-invaders`
- status: `rules-and-techdocs-accessioned`
- purpose: anchor rules, scoring, operator setup, and service documentation so
  the first Windigo slice does not guess at Space Invaders truth

## Preserved Source Set

### Derivative rules and scoring pages

- `web/classicgaming-space-invaders-play-guide.html`
  - source URL:
    `https://www.classicgaming.cc/classics/space-invaders/play-guide`
  - role: practical gameplay/rules summary with readable score values, UFO
    behavior notes, missile-family notes, and progression commentary
- `web/classicgaming-space-invaders-technical-info.html`
  - source URL:
    `https://www.classicgaming.cc/classics/space-invaders/technical-info`
  - role: index page exposing service-doc, schematic, pinout, and DIP links

### Technical and manual documents

- `docs/space-invaders-dip-switch-settings.txt`
  - source URL:
    `https://www.classicgaming.cc/classics/space-invaders/files/tech-info/space-invaders-dip-switch-settings.txt`
  - role: bonus-base and bases-per-game setup truth
- `docs/space-invaders-taito-cocktail-manual.zip`
  - source URL:
    `https://www.classicgaming.cc/classics/space-invaders/files/manuals/space-invaders-taito-cocktail-manual.zip`
  - role: operator/service HTML manual bundle with illustrations and setup pages
- `docs/space-invaders-taito-trimline-manual.zip`
  - source URL:
    `https://www.classicgaming.cc/classics/space-invaders/files/manuals/space-invaders-taito-trimline-manual.zip`
  - role: PDF operator/service manual bundle for Taito trimline configuration

## Most Useful Confirmed Facts

From the preserved play guide and DIP file:

- invader row values:
  - bottom two rows: `10`
  - middle two rows: `20`
  - top row: `30`
- full-screen total if all invaders are cleared: `990`
- mystery ship scoring is described with a deterministic shot-count pattern,
  including a `300`-point case
- bonus-base configuration:
  - `1000` or `1500`
- bases-per-game configuration:
  - `3`, `4`, `5`, or `6`

These are enough to move Windigo from “rules inferred from memory” to “first
written scoring/setup truth is in repo.”

## Why This Package Matters

This package reduces the biggest current intake risk for Windigo Invaders:
building a convincing runtime shell while still being vague about score values,
bonus rules, lives, and operator-facing setup.

It is especially valuable for:

- score-strip planning
- bonus/life policy
- player-count/setup assumptions
- cabinet-mode and operator-facing documentation
- later still-image/manual-page extraction

## Still Missing After This Package

This package does not remove the need for:

- cleaner original gameplay audio
- cabinet, bezel, title, and score-table stills
- bunker/cannon/invader-row close visual references
- event-labeled timing clips for fire, hit, descent, loss, and game over
- stronger primary-source score-table imagery or manual-page captures

## Next Best Follow-On

Use this package to update the Windigo dashboard from “find any rules source”
to “find stronger original score-table/still references and timing windows.”
