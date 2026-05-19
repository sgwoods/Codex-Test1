# Galaga Alien Motion Reference

User-supplied Galaga alien motion/pulse video ingested as a durable sprite-motion reference for taxonomy, pulse cadence, and clean role-silhouette review.

Generated: 2026-05-19T16:46:29.967Z

## Source

- Source video: `reference-artifacts/ingestion/galaga-alien-motion-reference/source-video/galaga-alien-pulse-reference.mp4`
- Duration: 20.533s
- Frame size: 576x576
- Frame rate: 30 fps

## Review Media

- Contact sheet: `reference-artifacts/analyses/galaga-alien-motion-reference/latest-media/alien-pulse-contact-sheet-1fps.png`
- Motion sheet: `reference-artifacts/analyses/galaga-alien-motion-reference/latest-media/alien-pulse-motion-sheet-2fps.png`

## Role Taxonomy

| Role | Key | Reference Use | Next Extraction |
|---|---|---|---|
| Fighter | `player-fighter` | Clean player silhouette, red/white/blue color placement, capture/rescue meaning, dual-fighter context. | Extract front, captured-red, and dual-fighter pulse/context crops. |
| Bee | `bee-zako` | Formation drone role, flank/wing pulse, small high-count enemy identity. | Extract closed/open pulse frames and score against Aurora bee-line cadence. |
| Butterfly | `butterfly-escort` | Red/white/blue block silhouette and leader-escort pulse identity. | Extract closed/open pulse frames and dive silhouette target. |
| Boss | `boss-galaga` | Boss wing/body shape, open/closed pulse, capture-beam host context, two-hit target identity. | Replace polluted boss crop targets with clean pulse frames and damage-state placeholders. |
| Scorpion | `scorpion` | Later-round morph target taxonomy and distinctive yellow/cyan/red silhouette. | Extract morph target front pose and any pulse frame available. |
| Bosconian-style morph | `bosconian` | Later-round morph novelty role and green/yellow/red color grammar. | Extract front pose for role taxonomy and future morph scoring. |
| Galaxian | `galaxian` | Later-round morph novelty and classic Galaxian callback silhouette. | Extract front pose and compare to Aurora specialty enemy families. |
| Dragonfly | `dragonfly` | Challenge-only alien identity and non-combat bonus-stage target shape. | Extract front pose and challenge-stage movement/pulse sample. |
| Satellite | `satellite` | Challenge-only alien identity, rotation-like silhouette, and late-stage novelty. | Extract front/rotation pulse sequence for challenge-stage scoring. |
| Starship | `starship` | Challenge-only alien identity and large blue/red target silhouette. | Extract front pose and compare against Aurora challenge-mosquito/starship proxies. |
| Tractor Beam | `tractor-beam` | Beam geometry and capture-state screen grammar. | Extract beam width sequence for capture lifecycle visual scoring. |

## Conformance Read

This artifact is stronger for human-readable taxonomy, pulse cadence, and clean silhouette targets than the currently polluted crop boxes in some rows. It should not replace source-sheet exact crops alone; it should validate and correct target crops, then seed temporal pulse/cadence scoring.

## Next Best Step

Use the motion sheet to extract clean per-role pulse pairs for Bee, Butterfly, and Boss first; then regenerate the runtime-vs-target table so bad crop boxes cannot masquerade as sprite conformance evidence.
