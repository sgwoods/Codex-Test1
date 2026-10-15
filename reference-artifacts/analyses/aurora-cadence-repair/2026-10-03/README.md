# October Cadence Repair

Source commit: b620f2df. Baseline: 868a100d, with pre-repair cadence recorded
under correspondence/challenge-stage-timing/2026-10-03-3cd38260.

## Result

Challenge 1 perfect clear to Stage 4 spawn improved from 15.150s to 4.433s
against preserved target 4.401s: 10.717s faster, 0.032s above target.
Fresh correspondence passed 5/5 measurements. See
`../../correspondence/challenge-stage-timing/2026-10-03-b620f2df/report.json`.
The local dist/production perfect probe produced missing events, so the
reference-target comparison is valid but the production drift comparison for
those metrics is unavailable. Forced perfect clear is timing evidence, not
routeability proof.

## Changes

- resultHoldWindow: 4.25s default and per-challenge 7.77-15.77s overrides to 1.45s.
- resultBannerWindow: 4.25s default and per-challenge overrides to 1.15s.
- nextStageWindow: 7.35s to 2.95s.
- nextCueLeadBeforeSpawn: 3.15s to 1.55s.
- Preserve result/perfect sources during challenge-result queue cleanup and
  normal stage-transition cue playback. Canonical archived clip bytes and
  four-second runtime duration remain unchanged.
- Fix overlap analyzer selection of new directories rather than latest files.
- Add actual Web Audio start/stop/ended continuity regression check.

## Validation And Limits

Actual audio-source check at b620f2df verified localhost build identity,
four seconds of completion for both result and perfect, no explicit stops,
Stage 4 progression, and no page errors. See
`../../challenge-result-audio-continuity/2026-10-03-b620f2df/report.json`.

Natural outcomes passed for novice/advanced/expert, each with 4.433s handoff and
zero challenge ship losses. Summaries are persisted in natural-outcomes/.
These ran after the timing port and before the queue-audio-only correction;
they do not establish professional multi-seed perfect routeability.
Motion/profile check passed. Existing group 1/2/3/5 keeper artifact checks
passed and each protected group 4. These artifact checks validate preserved
keeper records, not newly generated visual equivalence. Runtime path/layout
source was unchanged. Build and diff checks passed; direct syntax check of
00-boot.js is inapplicable before build placeholder substitution. Built page
was exercised by the browser continuity test without page errors.

Independent reviewer found and helped resolve queue-time cancellation missed
by June patch. No remaining scoped normal Stage 3-to-4 blocker was found.
Researcher verified both archive clips are exactly four seconds and match
accession hashes; completeness relative to original cabinet audio beyond
these archived extractions is not independently established.

Perceptual mix acceptance remains a human localhost review: expected result
and transition overlap is approximately 1.467s. Challenge-only watch mode
uses a different challengeTransition cue that still cancels result audio;
this packet does not claim that mode is repaired. No hosted publish occurred.

## Next Phase

After human cadence/audio acceptance, inspect Challenge 1 full sprite entry
by group against persisted object tracks and available primary source frames.
Reference track package:
`reference-artifacts/analyses/galaga-challenge-object-tracks/2026-05-19_03-29-40-fba7f625/`.
Its 16-second window cuts group 5 at 15.88s; verify primary frame coverage and
private bytes before treating it as a complete full-route reference.
Keep visibility and multi-seed routeability repairs separate.
