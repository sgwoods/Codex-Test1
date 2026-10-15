# Visibility Repair: Local Known Issues

October 3, 2026. Baseline 6c24b1e9. No hosted publish.

## Browser Inspection

Built-in browser exercised Guardians selection, Settings, Professional Watch
launch, then Manual Play seed 13550. Watch pilot disappeared and canvas rendered
the manual review seed. Keyboard input was exercised; this is a launcher/input
smoke, not expert gameplay or auditory judgment. Proof: guardians-manual-review.png.
The front door still contains obsolete preview-shell copy; queue separately.

## Reproducible Comparison

Baseline: ../challenge-full-entry/2026-10-03T16-59-51-186Z-6c24b1e9/report.json
Candidate: ../challenge-full-entry/2026-10-03T17-00-22-291Z-6c24b1e9/report.json
Method hashes match. Only src/js/06-enemy-behavior.js source hash differs.
Both reports include individual JS source hashes and built index SHA-256.
Earlier reports are diagnostics, not the final acceptance pair.

The change delays horizontal exit removal until the existing entry phase ends.
Bottom removal remains active. No trajectory, speed or keeper parameter changed.
Missing full-entry targets by Challenge 1-10:
baseline: 4, 2, 0, 17, 17, 10, 25, 16, 16, 17.
candidate: 0, 0, 0, 0, 0, 0, 5, 0, 0, 0.
Continuous full-entry minimum for Challenges 8-10 is only 0.217s.
These are 60Hz, single-seed, normalized-spawn, no-fire geometry measurements,
not proof of human readability or perfect-route feasibility.

## Validation And Limits

Motion profile, correspondence (5/5, 4.433s versus 4.401s), natural outcome
distribution, source syntax and diff checks passed. Natural novice/advanced/expert
seed checks achieved 40/40 with zero challenge ship losses. This is not a
professional multi-seed result and does not establish the desired distribution.
Keeper artifact checks for groups 1,2,3,5 passed; authored paths untouched.
They do not replace fresh pixel-equivalence or perceptual overlap review.
Independent review found no definite guard defect; requested source identity and
natural outcome verification, now supplied. Full visibility remains failed.

## Primary Reference And Next Work

Source <user-home>/Downloads/challenge-all2.mp4 was copied to the ignored
private-artifacts/repo-mirror/reference-artifacts/analyses/challenge-visibility-oct03/.
SHA-256: 8d29ea711d09d243a2904bf9538981d97fe1fa323e4f920177688fa2b4c4c840.
Generated Challenge 7 sheet uses source seconds 215-249 at 1fps; visual review
shows diagonal trains and a 40-hit perfect result. It is not fine timing proof.
The private local copy is persisted but is not an off-machine backup.

Next: primary-video/object-track comparison of Stage 27 edge lanes and later
speed/dwell, then one bounded candidate with natural-spawn and no-combat safety
validation. Stage 7 authoring remains paused. Only after entry/readability
acceptance run professional trials. Prepared sweep: 16 predefined seeds per
challenge, repeated sentinel seeds, bounded diagnosis, explicit censored runs;
reactive persona failures alone cannot establish human impossibility.
