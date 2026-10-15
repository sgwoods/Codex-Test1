# Accepted Local Clearance Repair

October 12, 2026. Provisional gameplay keeper, not beta approval.

## Delivered

Green/yellow generic paths at Stage 31 and later now stay above the ship row
in the measured cases. The lead and independent reviewer confirmed rendered
yellow-left and green-right overlaps in the baseline, then visible separation
in the candidate. Stage 3, Stage 27 and unrelated paths stay unchanged.

The fixed 300/14 vertical envelope preserves lateral paths and local time.
A narrow lifecycle correction retires only wholly-offscreen, outward, later
generic exits with conservative sprite bounds and guarded nonreturning motion.
It does not hide visible targets or change player/collision/shot rules.

| Check | Result |
| --- | --- |
| Saved normal-key kills at 31/35/39 | 37/33/37, identical shot and kill events |
| Shots at 31/35/39 | 80/48/50, unchanged; no losses |
| Full-view targets | 40/40 in each tested stage |
| Scoped green/yellow row exposure | Zero in measured runs |
| Minimum conservative drawn clearance | 2.6 game units |
| Later last-visible-to-clear tail | 0.216s, baseline 0.233-0.250s |
| Clear-to-next-spawn | 4.433-4.434s |
| New reusable gate | Ten stage/theme cases pass on integrated build |
| Existing challenge motion-profile check | Passed; Stage 3/7/11 regression coverage |
| Build and diff validation | Passed |

The first revision introduced a 0.916s empty tail and was not accepted. The
lifecycle correction preserves its 4,168 sampled visible positions per later
stage while removing only offscreen lifetime. Final no-fire clear is about
0.4s later than baseline; visible opportunity increases. Some individual targets
remain visible longer. This is provisional Aurora pacing, not exact Galaga.

## Provenance And Reproduction

- Baseline enemy source: 1b442dfae869fe3f8a7cc39edaaa2d05860b3a7cdf33c5e796ebae13167ce532.
- Accepted enemy source: 5ec66e40d512d27fb22f4826ac4321328bd9d0979719b49dfea68ccb47713c89.
- Integrated localhost index: b2177360513b52b1290ff902ebe55c6742a3590eaeb58d6553e4790382126096.
- Build: 1.4.1.1+build.1226.sha.cf0e7a66.dirty, October 12 16:45 EDT.

Run `npm run harness:check:challenge-late-clearance` after building. This gate
checks the two resolved themes, no player shots, scoped body/visual bounds,
full-view samples, natural progression and separate visible/clear/spawn times.
Its 0.4s empty-tail ceiling is an engineering regression budget above the
measured approximately0.24s baseline, not a claimed canonical time. Cadence
uses the existing4.401s reference with0.1s tolerance.

integrated-gate.json is the final lead result. baseline-gate.json and
revision-a-gate.json are intentional negative controls. summary.json and
TRIAL_REVIEW.md describe isolated revision B; INDEPENDENT_REVIEW.md retains the
review chronology. The lead independently verified final B shot traces and
ordered events, fulfilling the review's pending final-shot condition. The two
recommended test assertions were added and pass on the integrated build.

Primary images and capture metadata are in baseline-captures and
candidate-captures. Those candidate images bind revision A's clearance motion;
B retains that motion and changes only offscreen retirement, as verified by
revision-comparison.json. Do not label the A image bundle hash as final B.
The capture scripts' executable locations are private-artifacts/middle-path-oct12;
archived copies here require that relative-import execution context.

Durable full packages, reports and executed methods are under
private-artifacts/middle-path-oct12/revision-a and revision-b. Original specialist
temporary paths in the reports are execution provenance, not the sole retained
copies. The stale A visibility-tail file copied with B is explicitly renamed
revision-a-visibility-tail.json; use B revision-comparison.json and the final
lead gate for accepted tail measurements. Baseline replay input reports remain
retained in earlier lead private-artifacts packets referenced by the methods.

## Limits And Next Step

Later-green joins still jump approximately162-203px. Blue contacts remain,
including two/six stationary contacts at35/39 and side-column examples. This
packet does not declare every challenge safe, prove40/40 feasibility, verify
all seeds/dual ships, or establish exact original fidelity. Full-view means
at least one full sample, not an entire continuously visible path. Sprite bounds
are conservative two-pose estimates, not exhaustive pixel masks.

Next repair the later-green join without changing the safe lower region or
demonstrated shots; then address blue exits separately. Beta gates, public
packaging, soak and live auth/audio remain later work. No publication, commit
or push occurred. No Guardians or Stage 3 tuning was performed.
