# Galaga Target Evidence Audit

Generated: 2026-05-19T17:59:44.826Z

This audit records which visual targets are trusted enough to drive conformance scoring, which rows are still provisional, and why human review rejected the earlier polluted target evidence. The aim is to prevent a bad crop from becoming an apparently precise metric.

## Summary

- Status: trusted-target-manifest-active
- Trusted motion-reference crops: 5
- Provisional source-sheet crops: 19
- Next best step: Regenerate runtime-vs-target scoring against the trusted Boss, Bee, and Butterfly primary targets, then promote player-fighter and temporal pulse-pair targets.

## Role Evidence

| Role | Status | Trusted / Provisional | Scoring Use | Next Gap |
| --- | --- | --- | --- | --- |
| Boss Galaga | trusted-primary-target-available<br>The prior sheet-cell primary crop visibly included neighboring/polluted pixels and was misleading in the Application Guide. | `boss-galaga-formation-front` (accepted-trusted-motion-reference)<br>`boss-galaga-flap-a` (accepted-trusted-motion-reference)<br>`boss-galaga-flap-b` (accepted-trusted-motion-reference) | Primary target for boss-line runtime comparison; sheet dive cells remain provisional until recropped from gameplay/motion windows.<br><br>Boss identity needs to read as the capture-beam host and high-value threat before motion and damage states are tuned. | Promote clean boss dive, damage, tractor-beam host, and captured-fighter paired frames. |
| Bee / Zako | trusted-primary-target-available<br>The prior sheet-cell crop was usable as a source-sheet hint but too small and ambiguous as a primary visible target. | `bee-zako-formation-front` (accepted-trusted-motion-reference) | Primary formation target for bee-line; flap and dive sheet cells remain provisional evidence.<br><br>Bee sprites set the baseline fleet texture and need to stay readable during formation rows and fast challenge-stage entries. | Extract target pulse pairs and dive silhouettes from clean temporal windows. |
| Butterfly / Escort | trusted-primary-target-available<br>The prior sheet-cell crop was not reliable enough for a human-readable target row. | `butterfly-escort-formation-front` (accepted-trusted-motion-reference) | Primary formation target for but-line; flap and dive sheet cells remain provisional evidence.<br><br>Butterflies are the player’s main convoy-shape cue; their red/white/blue block silhouette must be recognizable at speed. | Extract target pulse pairs and dive/escort turns from gameplay/motion windows. |
| Player Fighter | provisional-target-only<br>Player ship proportions have been corrected in runtime, but the target crop lane still needs a clean trusted crop from the user-supplied close-up examples or a stronger source window. | `player-fighter-single-front` (provisional-source-sheet-cell)<br>`player-fighter-dual-front` (accepted-first-pass-composite) | Provisional for player-fighter runtime comparison; not yet a final target claim.<br><br>The fighter must feel smaller, crisp, and separate from reserve icons while preserving shot alignment and dual-fighter readability. | Promote a clean player-fighter target and add dual-fighter spacing/scale target evidence. |

## Measurement Rule

Runtime sprite scores may use trusted motion-reference crops as primary formation targets. Provisional source-sheet cells remain useful evidence, but their scores must be interpreted as planning signals until a clean crop or temporal target window supersedes them.
