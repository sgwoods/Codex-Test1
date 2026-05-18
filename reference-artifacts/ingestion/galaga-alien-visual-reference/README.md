# Galaga Alien Visual Reference

Close-up Galaga alien and player-fighter visual references supplied locally on
2026-05-18. This folder preserves the supplied images as an ingestion input for
Aurora's sprite, alien-index, challenge-stage, projectile, tractor-beam, and
explosion visual-conformance work.

Run:

```sh
npm run harness:analyze:galaga-alien-visual-reference
npm run harness:check:galaga-alien-visual-reference
```

The analyzer writes:

`reference-artifacts/analyses/galaga-alien-visual-reference/latest.json`

## Use Policy

- Treat `general-sprites-sheet.png` as the strongest supplied static crop-target
  candidate.
- Treat assembled pixel references as human-review context until crop provenance
  is tightened.
- Treat fan art, stickers, posters, and product-style images as explanatory
  visual context only. They must not drive numeric pixel conformance scores.
- Preserve all supplied files in the manifest, including the duplicate
  tractor-beam poster, so the ingestion history is complete.

## Next Promotion Step

Add a crop-box manifest for `general-sprites-sheet.png`, promote role/pose
target crops, then update runtime sprite scoring so Aurora can compare live
canvas sprites against multiple Galaga target poses rather than a single proxy
per role.
