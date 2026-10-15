# Missed-Target Reference Discovery

October 7, 2026. Baseline cf0e7a66. Human direction: original missed-target
Challenge 8 footage before any exit repair. No Aurora-specific replacement
exit contract is approved.

## Result

Latest disposition: see STAGE31_SURVIVOR_SCREENING_OCT07.md. The30-hit result
was followed byStage44 and belongs toStage43. A different interval in the same
recording has23hits followedStage32. Five survivor samples show an upward turn;
complete tracks and settings remain unverified. Earlier entries below describe
discovery chronology, not the final stage classification.

In-app inspection follow-up, October7: playback now works through Codex's
in-app browser; external Chrome is no longer used. World-of-Longplays recording
29VVkfuXkVI visually inspected. Page identifies player SCHLAUCHI, upload
August3 2015, duration35:21, and warns that most channel videos use save states.
At displayed29:03 the game result visibly reads NUMBER OF HITS30 / BONUS3000.
This establishes a missed-target challenge candidate, not its exact stage,
revision/settings or individual exit trajectories. Chapter names are explicitly
auto-generated and must not authenticate Challenge8. Samples at28:23 show
ordinary combat; at28:38 show targets near the top. No target identity was
tracked continuously through exit. Browser seek settling is not frame/PTS
measurement. Candidate advanced from metadata-only to visually screened;
zero newly accepted complete exit tracks.

Screenshot persisted privately:
`private-artifacts/repo-mirror/reference-artifacts/analyses/challenge-visibility-oct03/longplay-29VVkfuXkVI-29m03s-result-oct07.png`.
This is a browser observation, not the primary source video. Next inspect the
stage banner before this challenge and follow individual survivors; if wrong
stage, retain for secondary comparison and inspect another candidate. Do not
discard it based solely on an auto-generated sixth-challenge chapter label.

Discovery only. No recording accepted, no new exit measurement, no gameplay
change. Search metadata is not visual or edition authentication.

| Candidate | Search metadata | Current disposition |
| --- | --- | --- |
| https://www.youtube.com/watch?v=dje5yVxLu6Y | hirudov, Arcade Longplay - Galaga (1981) Namco; indexed publication 2025-11-07; description says arcade full playthrough | Needs visual inspection; Stage 31 coverage, surviving targets and settings unknown |
| https://www.youtube.com/watch?v=XbrdhQF2rKg | hirudov, Galaga [Arcade Longplay] (1981) Namco; indexed publication 2025-12-27; description says arcade full playthrough | Needs visual inspection; may be duplicate/re-edit; independence unknown |
| https://www.youtube.com/watch?v=Vq2pBd_Szus | StoneSinner47, Stage 31 Perfect; description identifies Xbox One | Lower priority: perfect/port clip does not establish intact missed exits |
| https://www.youtube.com/watch?v=sRR15NqJHFw | Abraxas Arcadia, Stage 31 Perfect | Lower priority: perfect clip, settings and intact exits unverified |

Discovery context: https://galaga.group/micro31/ describes the Stage31/Challenge8
competition and distinguishes arcade revision/fire settings. It is not a
recording or trajectory reference.

## Inspection Limitation

Independent read-only discovery (Nash) returned three additional leads:
https://www.youtube.com/watch?v=ohQPDC742mg (Armando Gonzalez),
https://www.youtube.com/watch?v=8KOMvF_KuO4 (Shonne Sabermaker), and
https://www.youtube.com/watch?v=29VVkfuXkVI (World of Longplays).
These are reviewer-reported links, not lead-authenticated video observations.
Reviewer also reported no playback inspection and zero verified surviving
Challenge8 recordings. Assignment closed; no background search remains active.

Both in-app and Chrome browser entry points returned browser unavailable.
Web reader opening the two longplays returned cache-miss failures. No video
pixels were inspected. No timestamp, surviving target or hit total is inferred.
No remote media was downloaded to work around the playback limitation.
Localhost remains build1226/cf0e7a66; source checkout has uncommitted tool/docs
and evidence changes. No rebuild or release action in this search.

## Acceptance Task

## Expanded Search And Capture Strategy

October7 follow-up. Broader searches included no-shooting, ordinary longplay,
arcade Stage31 and replay capture. Additional discovery lead:
https://www.youtube.com/watch?v=A96y5eSXfFo (indexed TAS single-ship 31-stage
run). This is low priority for surviving exits: tool-assisted superplay can
censor targets just as perfect-score clips do. No visual validation performed.
Searches for "no fire" also return the enemy-stop-shooting exploit; these must
not be confused with the requested player-no-fire challenging-stage capture.

Inspection inventory now distinguishes two limitations: no integrated browser
provider is registered, while native Chrome is present but Computer Use returns
"permissions are not granted". Native inspection was attempted once. Human
was asked to enable Computer Use or provide a local recording. No permission
change made, no video downloaded as a playback workaround.

Controlled-capture route, supported by official MAME documentation:
https://docs.mamedev.org/commandline/commandline-all.html
(`-record`, `-playback`, `-exit_after_playback`, `-aviwrite`, `-snapview native`).
MAME is not on the current shell PATH; no Galaga input replay was found under
the project private-artifacts tree. This is a scoped inventory, not proof that
the user owns no emulator, cabinet or original game elsewhere.

Recommended protocol for an existing lawful original-game setup:

1. Identify exact arcade revision, emulator/build or hardware, difficulty,
   original/fast-fire setting, rotation and crop. Do not acquire game ROMs or
   install software as part of this discovery step.
2. Reach Stage31 normally, or use a verified stage-boundary save state with its
   provenance recorded. Any skip/cheat/state initialization must be disclosed;
   it is not equivalent to a natural run without comparison.
3. Release fire before the challenge. Hold the ship at center for one full run,
   then at left/right in separate runs if needed to test player-dependent paths.
   Record all five waves, result and next-stage spawn; preserve survivors intact.
4. Prefer emulator-native capture and input replay where supported. Keep exact
   emulator version, configuration/NVRAM and input together; replay desync is
   possible. Use an isolated capture profile, not deletion of existing user data.
5. Save primary recording privately with hash and frame/PTS metadata. Annotate
   each target from arrival through removal. Compare matching sprite bounds,
   velocity, full-view dwell and ship clearance, with explicit uncertainty.

An official commercial port is another potential recording source, not an
automatic original-ROM equivalent. Publisher listing:
https://store.steampowered.com/app/403430/ARCADE_GAME_SERIES_GALAGA/
lists Windows requirements and selectable old/new versions. It is not a direct
Mac solution established here; no purchase, install or edition equivalence
assumed. A creator/community capture request is also possible, but no message
has been sent on the user's behalf.

Decision: pursue ordinary footage inspection first once access is available;
use controlled no-fire capture if all candidate runs kill the relevant targets.
No accepted primary footage or source repair was delivered in this follow-up.

## Acceptance Checklist

1. Use an available playback surface or a supplied original recording.
2. Verify Stage31/Challenge8 and original arcade edition. Record revision,
   difficulty/fire settings and any unknowns. Exclude modified pattern hacks.
3. Locate at least one identified survivor in each implicated wave/family.
   Follow it without identity ambiguity from middle through exit/removal.
4. Record source URL/creator, time range, crop/coordinate mapping, frame rate,
   presentation timestamps, occlusion and shot-censoring limitations.
5. Persist authorized primary evidence with hash/provenance before using it
   for a source change. Do not convert URL metadata into accepted conformance.
6. Measure sprite bounds, continuity, speed, player clearance and full-view
   dwell. Compare current scheduled Aurora per-target firing opportunities.

Player outcome sought: correct exits that avoid inappropriate ship overlap,
without losing readable and realistically hittable targets. Beta remains blocked
until contact disposition/repair and the subsequent candidate/package gates.
