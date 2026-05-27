# Galaga Target Evidence Audit

Generated: 2026-05-27T06:58:28.054Z

This audit records which visual targets are trusted enough to drive conformance scoring, which rows are still provisional, and why human review rejected the earlier polluted target evidence. The aim is to prevent a bad crop from becoming an apparently precise metric.

## Summary

- Status: trusted-target-manifest-active
- Trusted motion-reference crops: 6
- Provisional source-sheet crops: 18
- Provisional-only roles: 1
- Next best step: Promote clean challenge-specialty target windows before treating late challenge alien graphics as release-facing conformance truth.

## Role Evidence

| Role | Status | Trusted / Provisional | Scoring Use | Next Gap |
| --- | --- | --- | --- | --- |
| Boss Galaga | trusted-primary-target-available<br>The prior sheet-cell primary crop visibly included neighboring/polluted pixels and was misleading in the Application Guide. | `boss-galaga-formation-front` (accepted-trusted-motion-reference; authority 7.5/10 trusted-cleaned-motion-reference)<br>`boss-galaga-flap-a` (accepted-trusted-motion-reference; authority 7.5/10 trusted-cleaned-motion-reference)<br>`boss-galaga-flap-b` (accepted-trusted-motion-reference; authority 7.5/10 trusted-cleaned-motion-reference) | Primary target for boss-line runtime comparison; sheet dive cells remain provisional until recropped from gameplay/motion windows.<br><br>Boss identity needs to read as the capture-beam host and high-value threat before motion and damage states are tuned. | Promote clean boss dive, damage, tractor-beam host, and captured-fighter paired frames. |
| Bee / Zako | trusted-primary-target-available<br>The prior sheet-cell crop was usable as a source-sheet hint but too small and ambiguous as a primary visible target. | `bee-zako-formation-front` (accepted-trusted-motion-reference; authority 7.5/10 trusted-cleaned-motion-reference) | Primary formation target for bee-line; flap and dive sheet cells remain provisional evidence.<br><br>Bee sprites set the baseline fleet texture and need to stay readable during formation rows and fast challenge-stage entries. | Extract target pulse pairs and dive silhouettes from clean temporal windows. |
| Butterfly / Escort | trusted-primary-target-available<br>The prior sheet-cell crop was not reliable enough for a human-readable target row. | `butterfly-escort-formation-front` (accepted-trusted-motion-reference; authority 7.5/10 trusted-cleaned-motion-reference) | Primary formation target for but-line; flap and dive sheet cells remain provisional evidence.<br><br>Butterflies are the player’s main convoy-shape cue; their red/white/blue block silhouette must be recognizable at speed. | Extract target pulse pairs and dive/escort turns from gameplay/motion windows. |
| Player Fighter | trusted-primary-target-available<br>Player ship proportions were corrected in runtime, but the earlier target crop lane still leaned on a tiny provisional source-sheet cell. | `player-fighter-single-front` (accepted-trusted-motion-reference; authority 7.5/10 trusted-cleaned-motion-reference)<br>`player-fighter-dual-front` (accepted-trusted-motion-reference-composite; authority 7.2/10 trusted-derived-composite) | Primary target for player-fighter runtime comparison and the derived dual-fighter composite; turn/capture poses remain provisional.<br><br>The fighter must feel smaller, crisp, and separate from reserve icons while preserving shot alignment and dual-fighter readability. | Promote clean turn, captured, carried, rescue, and dual-fighter spacing evidence from true target gameplay windows. |
| Challenge Specialty Aliens | provisional-target-only<br>The current challenge-only target crops are small source-sheet cells. They are helpful taxonomy hints, but human review has not promoted them to canonical scoring truth. | `challenge-green-family-front` (provisional-source-sheet-cell; authority 3.2/10 planning-only-challenge-specialty-cell)<br>`challenge-green-family-dive` (provisional-source-sheet-cell; authority 3.2/10 planning-only-challenge-specialty-cell)<br>`challenge-yellow-family-front` (provisional-source-sheet-cell; authority 3.2/10 planning-only-challenge-specialty-cell)<br>`challenge-yellow-family-dive` (provisional-source-sheet-cell; authority 3.2/10 planning-only-challenge-specialty-cell)<br>`challenge-magenta-family-front` (provisional-source-sheet-cell; authority 3.2/10 planning-only-challenge-specialty-cell)<br>`challenge-blue-yellow-family-front` (provisional-source-sheet-cell; authority 3.2/10 planning-only-challenge-specialty-cell) | Do not use these cells as release-facing proof of challenge alien graphical conformance. Use them to plan runtime families and to prioritize better ingestion.<br><br>Late challenging stages should introduce memorable bonus-stage aliens. The current evidence is enough to say we need novelty, not enough to claim the novelty is visually conformant. | Extract clean challenge-specialty alien frames from segmented motion clips or target gameplay windows, then split the generic role into named target families. |

## Measurement Rule

Runtime sprite scores may use trusted motion-reference crops as primary formation targets. Provisional source-sheet cells remain useful evidence, but their scores must be interpreted as planning signals until a clean crop or temporal target window supersedes them.
