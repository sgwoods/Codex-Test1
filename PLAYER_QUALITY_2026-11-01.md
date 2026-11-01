# Player Quality And Persona Qualification

Local implementation and qualification completed November 1, 2026. Baseline `b17c5d63`; branch
`codex/guest-input-audit`. User authorized a two-hour local cycle: player quality
first, then persona capability. No hosted publication or score/account writes.

## Player Quality

### Reference audio cancellation

The historical issue247 requested/loaded mismatch is not sufficient evidence of
wrong playback. A cache hit updates requested/started but does not decode again;
last-loaded can correctly name a different asset. A real-browser fixture confirms
the game-over source uses its expected decoded buffer with offset2.3s/duration4.2s
while last-loaded names captured-fighter audio.

A separate race is reproduced: stopping a cue while its buffer is loading does
not stop the later promise callback from creating a source. Baseline browser
restart starts the old game-over cue; the repaired fixture does not. Per-request
cancellation now applies the same cue/clip predicate to pending and active
playbacks without evicting shared decoded buffers or cancelling unrelated cues.

- Before patch: six of nine executable VM regressions failed.
- After patch: eleven regressions pass, including cache microtasks, mixed active
  and pending cues, same-buffer isolation, new requests after stop and failed loads.
- Browser baseline failure: `private-artifacts/player-quality-nov01/audio-browser-baseline/summary.json`.
- Browser repaired passes: `private-artifacts/player-quality-nov01/audio-browser-v2/summary.json`
  and `audio-browser-v3/summary.json` after test-helper review repairs.
- Fresh isolated build also passes `fresh-audio-v1/summary.json`; its private
  hooks expose the actual built audio object without substituting playback logic.
- Fixture derivation and hashes: `private-artifacts/player-quality-nov01/derive.js`
  and `audio-input-v2-provenance.json`. Original build1257 metadata is retained;
  these are explicitly derived fixtures, not unchanged clean builds.
- Independent read-only source review found no blocking audio regression.

No sound selection, waveform, crop length, physics or scoring has been retuned.
The archived14s ending asset and labeled source video remain reference evidence;
the historical0.84s excerpt cannot establish full-phrase timing fidelity.
This does not close historical issue247 or prove acoustic/recorded-tail quality.

### Guest input and narrow controls

`private-artifacts/player-quality-nov01/guest-v5/summary.json` records seven
successful paths and42 real-time key movements on clean build1257. Paths cover
fresh guest launch, account focus at1100px, Settings recovery and synthetic blur
at1100/390px. Source runtime matches baseline before this cycle's audio repair.

One path is explicitly blocked: at390px the pilot button is hidden by an ancestor
under the620px CSS breakpoint. No authentication failure is inferred. Earlier
receipts v1-v4 retain test-development failures: offline-disabled input field,
fullscreen-hidden settings button, intentional250ms reset hold and hidden pilot.
The final method records reset recovery and keeps unreachable coverage failed.

Limits: account input enabling is a documented offline DOM fixture, blur is a
synthetic event, and these tests do not cover touch, OS focus switching, hosted
builds or real authentication transitions. A proposed tall-phone-only repair was
not integrated: it would leave shorter phones inaccessible or overlap the board.
A coherent responsive board/toolbar layout remains open, including existing
interactive controls beneath `aria-hidden` rail ancestors.

Fresh build1260 repeats the seven reachable paths with42 movements and seven
firing/release checks, all passing; each Space press emits two shots and none
after release. `fresh-guest-v1/summary.json` still reports overall failure because
the eighth narrow account path remains inaccessible. The negative result is not
waived or a release-readiness pass.

### Rival results HUD

Visual inspection of the natural Rival game-over screenshot found a display bug:
the top1UP label showed the Rival's567,390 points while the results panel correctly
showed the human's zero. The HUD selected the saved human score only during an
active P2 turn, not after completion. It now uses the saved human score in every
non-P1 Rival state, retaining the live score while P1 is active. Scoring, storage
and lane state are unchanged. Five regressions fail before the repair;8/8 pass
after it. A fresh isolated dirty build also passes five injected browser UI cases
(`private-artifacts/player-quality-nov01/fresh-hud-v1/summary.json`). These are
display fixtures, not natural scoring or persistence evidence. The same build
with only the HUD condition reverted fails at the first completed/non-P1 state
(`fresh-hud-baseline/summary.json`), showing567,390 instead of the human's zero.

## Persona Capability

The new natural Stage1 Watch/Rival driver is integrated locally, with a frozen
Expert candidate and clean build1257 as its input. It derives two private arms,
blocks external requests and writes before boot, decodes24 audio dependencies,
and records every requested tick plus raw events and intervention geometry.
No losses, points, board changes or stage jumps are injected. P1 is idle; this
does not prove human actuator feasibility or movement/fire after returning.

The preliminary900-second matrix (`private-artifacts/persona-natural-nov01/run-v1/`)
passes12 case assertions and14 comparisons but correctly fails coverage: the
candidate Rival does not return to P1 after intervention within that budget.
Independent review then strengthened ownership checks across the handoff tick
and separated automated post-veto time from subsequent manual-owner updates.
Those regression fixtures pass, including deliberate0-to999 score contamination.

The corrected `run-v2` extends the same seed91001 to a fixed1800-second budget,
without changing policy or searching seeds. All12 cases and14 comparisons pass,
with complete required coverage. Candidate Rival completes naturally at567,390
points/Stage85 after1775.267 requested seconds, including309 manual-owner updates
after post-veto return. Quiet/repeat/held trajectories agree within each arm/mode.
[Public summary and raw hashes](reference-artifacts/analyses/persona-calibration-nov01/natural-lifecycle.json)
bind that result. Watch/Rival trajectories are deliberately not equated:
shared RNG and rounded lane restoration differ. This is one seeded lifecycle
case, not a new persona skill distribution or world-record claim.

Independent review recomputed all14 comparisons from raw files, checked532,974
tick records, regenerated8,952 retained checkpoint hashes, and verified input,
method, policy and screenshot hashes plus exact derived HTML. Every tick hash
participates in comparisons; only retained checkpoints have enough state to
regenerate their hashes independently. This is not full-state replay proof.

The separate100-run qualification retains its original900-second budget and
matched/reserved seeds on clock-fixed source `cb70121e` / clean build1257.
All five frozen panel gates pass. Independent review verified400 raw artifact
hashes,30 non-Expert mechanical-equality pairs,11 Expert full-equality pairs and
nine Expert pre-intervention prefixes, plus the methods and copied inputs.
Lifecycle repetitions are not distribution observations.

| Persona / panel | Control median | Candidate median | Candidate range | Censored candidate runs |
| --- | ---: | ---: | ---: | ---: |
| Beginner / matched | 7,235 | 7,235 | 5,770-37,650 | 0/10 |
| Intermediate / matched | 21,995 | 21,995 | 2,560-43,220 | 0/10 |
| Expert / matched | 81,275 | 102,020 | 54,130-326,150 | 2/10 |
| Expert / reserved | 97,780 | 97,780 | 53,040-324,410 | 1/10 |
| Professional / matched | 240,785 | 240,785 | 197,300-356,660 | 10/10 |

Matched Expert75k attainment improves6/10 to7/10; reserved remains8/10.
Destructions fall32 to29 matched and34 to29 reserved, but unequal exposure means
these totals are not rates. Seed93007 still regresses146,380 to117,210. Censored
scores are lower bounds, not completed-career scores or world-record evidence.
Results and provenance remain at `private-artifacts/expert-current-nov01/`.

After independent acceptance, the exact frozen helper and Expert-only Stage4+
non-challenge dispatch were integrated locally in `src/js/05-player-flow.js`.
Byte provenance proves that removing those two additions recovers the baseline
file exactly (`private-artifacts/player-quality-nov01/expert-integration.json`).
The actual-source behavior/collider suite passes115 tests,17 of which failed
before integration. The regular simulation suite and controller-mode parity pass.
No human movement, other persona parameters, thresholds or Wizard mode changed.
This is local integration, not a merge, deployment or general skill-ladder pass.

The combined isolated dirty build passes five HUD browser cases and the audio
restart probe. A separate900-second-budget Expert seed91001 career completes at
131,920/Stage24, first active loss403.917s. Its non-audio events and mechanical
snapshots exactly match the qualified candidate; visual effect counts are
excluded. Receipt: `private-artifacts/player-quality-nov01/fresh-career-verification.json`.
Build label remains1260 on the same dirty baseline; exact input hashes, not that
reused dirty label alone, distinguish the pre/post-Expert builds. Combined input
inventory hash: `7e9ee41b6a598aec0526c6e8b576d5d734ca47498eed8fab76c526a569ab11d8`.

The [public100-run report](reference-artifacts/analyses/persona-calibration-nov01/CURRENT-BUILD.md)
and [score history](reference-artifacts/analyses/persona-score-history/README.md)
now preserve27 panels/510 observations. The exporter rechecks raw hashes,
outcomes, pairs and summaries;24 negative/positive tests pass. Earlier410
observations are unchanged. Fresh-build and lifecycle repeats are not added.

### Human movement boundary

The actual-source forced-axis audit at
`private-artifacts/player-quality-nov01/actuator-audit.json` quantifies a genuine
controller distinction at1/60s. It is not a skill or score comparison.

| Controller | First right tick | First left tick after8 right ticks | First released tick |
| --- | ---: | ---: | ---: |
| Human | +0.827 | +3.437 (still moving right) | -3.105 |
| Beginner | +3.667 | -3.667 | 0 |
| Intermediate | +4.693 | -4.693 | 0 |
| Expert | +6.160 | -6.160 | 0 |
| Professional | +6.453 | -6.453 | 0 |

Values are game-coordinate displacements, not screen pixels. Human control uses
acceleration, precision taps and deceleration; automated control directly updates
position and reverses instantly. Their lower top-speed multipliers do not make
their short evasions human-feasible. Watch/Rival/test agreement therefore does
not establish human actuator equivalence. No movement constants were changed.
The recommended next calibration experiment is a separately qualified shared
movement executor, not simultaneous score-threshold tuning or a Wizard claim.

## Validation And Next Work

Independent review found no blocking regression in the audio, HUD, exact Expert
integration or new helpers. The fast suite initially failed because sandboxed
process-tree inspection returned EPERM; the unchanged suite passed with required
macOS access. Both receipts are retained under `harness-artifacts/test-runs/`.
Simulation and documentation suites pass locally. No test thresholds were relaxed.
The no-mistakes review/PR/CI gate is the remaining integration step, not deployment.

1. Complete reviewed integration through existing gates; retain this report's
   local-versus-merged distinction until the forge confirms completion.
2. Qualify a shared movement executor separately, then tune the skill ladder.
   Do not change persona policy and human motion simultaneously.
3. Repair narrow controls across short/tall layouts and keyboard accessibility;
   the seven successful guest paths do not waive the eighth blocked path.
4. Measure the full final-loss audio phrase and bounded Guardians lifecycle.
   Physical worker containment, full-state replay and broader recovery stay open.

Production1.4.2, frozen beta.5 and hosted dev are unchanged. No score/account
writes, database mutation, publishing or new beta decision occurred.

Local preview: `http://127.0.0.1:8003/`, served from the isolated checkout
`/private/tmp/aurora-quality-build-nov01/dist/dev`, build1260/b17c5d63 dirty at
16:19UTC. It includes the three runtime changes and canonical private audio,
without the probe-only state hooks. PID26425/cwd and HTTP build identity checked.
Existing port8000 remains untouched on its older build1251.
