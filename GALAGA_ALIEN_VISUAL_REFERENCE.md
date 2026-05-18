# Galaga Alien Visual Reference Pack

Generated: 2026-05-18T13:56:31.535Z

This report indexes the close-up Galaga alien reference images supplied on
2026-05-18. The pack is useful because Aurora's current sprite/alien
conformance has been too dependent on a small set of gameplay-frame crops. The
new evidence improves role vocabulary and target planning, especially for
Boss Galaga, bee/Zako, butterfly, challenge aliens, the player fighter,
projectiles, tractor beam, and explosion/capture-event surfaces.

## Policy

Only the ripped sprite sheet and explicit pixel-grid references are target candidates. Fan art, stickers, posters, and product images are retained as human-review context and must not drive numeric pixel conformance scores.

## Summary

- Supplied images: 11
- Existing committed images: 11
- Unique hashes: 10
- Target candidate images: 2
- Role coverage rows: 11
- Strongest target source: `general-sprites-sheet`

## Role Coverage

| Role | Images | Target candidates | Strongest score |
|---|---:|---:|---:|
| `bee-line` | 7 | 1 | 10/10 |
| `boss-line` | 9 | 1 | 10/10 |
| `but-line` | 7 | 1 | 10/10 |
| `challenge-dragonfly` | 2 | 1 | 10/10 |
| `challenge-mosquito` | 2 | 1 | 10/10 |
| `dual-fighter` | 1 | 1 | 10/10 |
| `explosions` | 1 | 1 | 10/10 |
| `player-fighter` | 11 | 2 | 10/10 |
| `projectiles` | 4 | 1 | 10/10 |
| `rogue-fighter` | 5 | 1 | 10/10 |
| `tractor-beam` | 4 | 1 | 10/10 |

## Indexed Images

| Id | Class | Dimensions | Target Use | Roles |
|---|---|---:|---|---|
| `general-sprites-sheet` | ripped-sprite-sheet | 458x216 | direct crop target candidate | `player-fighter`, `dual-fighter`, `rogue-fighter`, `bee-line`, `but-line`, `boss-line`, `challenge-dragonfly`, `challenge-mosquito`, `tractor-beam`, `projectiles`, `explosions` |
| `closeup-alien-lineup-black` | assembled-pixel-reference | 900x1082 | human review and role-shape target context | `player-fighter`, `rogue-fighter`, `bee-line`, `but-line`, `boss-line`, `challenge-dragonfly`, `challenge-mosquito`, `projectiles` |
| `pixel-cutout-lineup` | fan-product-reference | 570x428 | human review only | `player-fighter`, `bee-line`, `but-line`, `boss-line` |
| `player-fighter-grid` | pixel-grid-reference | 735x485 | player fighter crop-grid candidate | `player-fighter` |
| `formation-lineup-black` | assembled-pixel-reference | 736x552 | role proportion context | `player-fighter`, `bee-line`, `but-line`, `boss-line`, `projectiles` |
| `mobile-title-formation-reference` | screen-context-reference | 480x800 | start-screen and formation composition context | `player-fighter`, `rogue-fighter`, `bee-line`, `but-line`, `boss-line`, `tractor-beam` |
| `vertical-formation-art` | fan-art-reference | 570x713 | human review only | `player-fighter`, `bee-line`, `but-line`, `boss-line` |
| `tractor-beam-poster-a` | fan-art-reference | 677x1200 | capture/tractor-beam context | `player-fighter`, `rogue-fighter`, `boss-line`, `tractor-beam` |
| `compact-player-alien-lineup` | assembled-pixel-reference | 300x300 | role proportion context | `player-fighter`, `bee-line`, `but-line`, `boss-line`, `projectiles` |
| `player-fighter-sticker` | fan-product-reference | 600x600 | human review only | `player-fighter` |
| `tractor-beam-poster-b-duplicate` | fan-art-reference | 677x1200 | duplicate of tractor-beam-poster-a | `player-fighter`, `rogue-fighter`, `boss-line`, `tractor-beam` |

## Next Best Steps

1. Add a crop-box manifest for general-sprites-sheet and promote exact role/pose crops.
2. Update the runtime sprite scorer to compare Aurora live crops against multiple target poses per role, not one proxy pose.
3. Add challenge-stage target-family expectations: which alien families appear in each challenge stage and how novelty increases over time.
4. Add projectile, tractor-beam, and explosion visual-event targets so impact/capture feedback can be assessed with the same artifact strategy.
5. Keep the assembled/poster/product images visible in docs as human-review context but exclude them from numeric pixel conformance.
