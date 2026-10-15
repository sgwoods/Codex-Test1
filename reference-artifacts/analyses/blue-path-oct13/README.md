# Accepted Parallel Blue Path Repairs

October 13, 2026. Both streams are accepted and integrated locally. Player
benefit: missed challenge targets leave continuously without the measured ship
crossings, while demonstrated scoring opportunities remain available.

## Current Identity

- Branch/HEAD: codex/oct03-local-integration, cf0e7a66 with local changes.
- Enemy source: 1f5df7a14c1b8819c6f73e885182d719e5e35b37fac82b545233db88e05dac31.
- Renderer source: 0dc985230420bb1281a22992ca9cd78b8516196f81b19a6c1d71e7a761c036cc.
- Integrated build: 0ba6d5a170662898a24e6a7e245ec9770110615cf6300fe472f675b60f4d5ce2.
- Label: 1.4.1.1+build.1226.sha.cf0e7a66.dirty, October13 15:41 EDT.

Localhost HTTP bytes match this checkout's dist/dev. No commit, push, main
integration or hosted publication occurred. Full integrated package is retained
at private-artifacts/blue-path-oct13/integrated-artifact.

## Delivered And Validated

| Check | Result |
| --- | --- |
| Blue cases across two themes | 34/34 pass; zero blue contacts or row-risk samples |
| Largest blue join step | 149.459 -> 4.718px per60Hz frame |
| Largest blue exit step | 8.661px, below12px engineering budget |
| Full-view targets | 40/40 in every tested case |
| Recorded31/35/39 hits | 37/33/37, no lost/gained target IDs |
| Recorded shots | 80/48/50; legal normal input, cooldown, ammo and motion |
| Extra Stage31 late shot | Space14.117 hits214629079 at14.217, retained |
| Green/yellow regression | Ten integrated cases pass |
| Early motion-profile, build, syntax, diff | Pass |
| Unsupported A configuration fallback | 320 actual-function VM comparisons equal baseline |
| A right-boundary direction checks | 373 pass; leftward actors are not prematurely culled on right |

Stream A (Nash) owns Stage31 group3. The analytic bridge recovers the old exit
before the additional late shot, then turns upper-left at u11.05. The first
direct-turn trial lost that real shot and was rejected. A later boundary review
found a target removed during a join despite future visibility; the scoped
lifecycle correction preserves that return. Nonconstant custom offset variants
retain baseline motion/removal. Leftward departure proves left-side retirement;
right-side retirement is disallowed until the conservative whole-upper exit.

Stream B (Hypatia) owns generic later blue groups1/3/5. Its bridge recovers the
existing exit after0.9local-u, then an identity-through300 vertical envelope
keeps lower exit bodies above the ship. A guarded analytic bound on all future
horizontal maxima prevents invisible early removal of returning oscillations.
The initial retirement used oversized body dimensions and caused a0.666s wait;
it was rejected. A renderer-owned extent derives from actual glyph layers and
flap accents, with conservative fallbacks. Worker validation includes768 actual
alpha masks,1056 helper cases and96 future-bound fixtures. These are bounded
tests, not exhaustive interval arithmetic or every future sprite/configuration.

The specialists cross-reviewed opposite streams. Lead integrated scoped source
hunks sequentially, fixed the direction restriction, verified fallback behavior,
built once, and ran combined acceptance. Both workers report their processes
complete. COMBINED_SOURCE_REVIEW.md in stream-b-review records final approval.

## Timing And Opportunity Tradeoffs

| No-fire stage | Baseline clear | Accepted clear | Accepted empty tail |
| --- | --- | --- | --- |
|31|21.417s|21.417s|0.234s|
|35|12.133s|14.850s|0.033s|
|39|12.133s|14.633s|0.033s|
|63|12.133s|15.317s|0.034s|
|127|12.133s|14.517s|0.034s|

Later no-fire stages last2.384-3.184s longer; last visible play extends by
approximately2.567-3.366s. This is visible opportunity, not additional empty
waiting. Post-clear spawn cadence remains4.433-4.434s. Some individual sampled
full-view windows decrease: up to0.350s in A and0.300s in B. Those provisional
tradeoffs are explicitly accepted with retained full entry, recorded hits and
the extra late-hit witness. Universal shootability is not established.

Stage35's same inputs still hit all33previously hit IDs and score is unchanged,
but nine hit times and subsequent shot-slot timing change. An earlier legitimate
interception frees a bullet slot sooner. Exact event equality is reported false
for35, true for31/39. Actual input/player parity, scoring IDs, score, legal
physics and natural completion are required; timing changes receive review.
The initial strict comparison remains retained. See ACCEPTANCE.md for this
decision and its rationale. No weapon or controller tuning was performed.

## Evidence And Reproduction

- integrated-exits.json and integrated-clearance.json bind the combined build.
  baseline-final-method-exits.json is the final method's negative control.
- Integrated raw shooting and late-shot reports, copied source/methods, worker
  manifests and rejected candidates are retained under private-artifacts/blue-path-oct13.
  INTEGRATED_MANIFEST.json binds the final sources, package, methods and reports;
  1975 copied A files and1541 copied B files were verified against worker manifests.
  Worker A runtime measurements bind a417/98ead; its final eligibility source
  is77f535/096469. Worker B binds e9d0/0dc985/7453ae. These are not relabeled as
  the final lead package; final integrated results above use1f5df7/0ba6d5.
- baseline-captures and integrated-captures contain30 matched canvas frames
  each. Reports bind bundle/method, baseline schedule, IDs, positions and PNGs.
  Lead and reviewer inspected representative Crown31 and Classic39 ship cases;
  this is not an exhaustive alpha-intersection review of every frame.
- combined-fallback.json and fallback-input-analytic.json retain the final lead
  supplemental VM checks. The final executable method hash is c35ff7f9...b919;
  an earlier reviewer chronology cites the initial0b321d38 method before the
  fixture was copied into durable lead storage. The same320/373 checks were
  rerun successfully; source/input identities and behavior are unchanged.
- Methods copied publicly for provenance retain their original execution
  contexts. Lead capture/fallback/late-shot methods run from private-artifacts/
  blue-path-oct13; worker methods need an isolated tools/harness context.

Reproduce with npm run harness:check:challenge-blue-exits and
npm run harness:check:challenge-recorded-shots. The latter defaults to the
retained frozen input/build paths and releases keys after the original trace,
then waits for natural next-stage spawn. Fixed trace-end truncation is not a hang.

## Remaining Beta Work

The measured default-theme path blockers are closed for this local packet.
These are provisional Aurora repairs informed by qualified original footage,
not exact canonical geometry/speed. Fixed seeds, sampled columns and primary
theme modes do not prove every human route, graphics variant, dual ship or
perfect-score feasibility. Lab renderer fallback extents were checked; complete
lab-mode lifecycle timing is outside the primary-theme gate. Unsupported route
variants retain their previous behavior. Guardians and Stage7 development were
not changed; existing Stage7 reference checks ran as regression coverage only.

Next: accepted-source checkpoint and range/version review, authorized dev gates
and review, exact beta package/security/runtime checks, bounded sustained play,
live account/audio checks and explicit beta approval. Planning allowance for
remaining release work is6-12active hours plus authorization/waiting time.
No release date is promised and beta is not declared ready by these local passes.
