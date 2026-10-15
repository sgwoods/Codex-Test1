# Stream A: Stage31 Group3 Defect Map

October13. Measurement/evidence map only; no gameplay edit or build.
Frozen HEAD cf0e7a666067ede385865ba02e73d1454eb132d1 plus overlay;
enemy source200861b97e05faa2f424f2d138d682da768853fdc5d98078f36566dada339a53,
build7e79f0c6cb6fbd2d6cb83adb9490b84d0516596ce9689aa0206e09ebcfdd5405,
manifestda79ebea6babf3dab8f943e9f4ce54b7aeed149c1c9c4a9d4141aa346e3c0649 verified.
Source-matched retained runtime/replay report uses0833847752e7e021243e74664c6f7a9b29e5575878e6dc79fd7a05a038be543a,
not a fresh frozen7e79browser measurement. Map method and every input hash are
in summary.json/report.json. Lead's independent frozen-build gate is the next
confirmation; do not relabel historical package identity.

Lead confirmation subsequently received and inspected: analyses/blue-path-oct13/
baseline-exits.json binds frozen7e79bundle and method2695b51a1bef33ee30301843d58ca1134cdb005a4bb3ce470a75bf134be20065.
Its34cases reproduce Stage31 left60/100 contacts, including zero-contact center
cases that still fail blue join budgets. It is separately retained as
lead-frozen-baseline-exits.json, not relabeled as this worker's browser run.
Lead also reports exact frozen37/33/37kills and80/48/50shots confirmation.

## Actual Failure

Target214629079, blue-purple-finale, zero-based wave2/group3, rogue/stingray.
Human launch, seed9131, no firing; ordinary arrow hold/release, no assigned
position. Frozen performance clock plus controlled60Hz; actual settled columns
are42.12/85/195/266.95, not requested60/100/180/250.

| Actual ship x | Contact time | Enemy pose | Phase |
| --- | --- | --- | --- |
|42.12|15.000s|55.24,340.12|exit|
|85.00|14.900s|93.17,325.78|exit|
|195.00 /266.95|No recorded group3 contact| | |

Contact at14.900s corresponds to u12.0088. At15.000s the target's local u is
12.1854 (derived from its sampled trace). Contacts are nonlethal body crossings,
not contact-frame teleports. Earlier join:13.583s,u9.68357,(126.79,213.05) ->
13.600s,u9.71300,(177.62,114.30),111.064px displacement. Whole group3 has five
observed joins and three existing middle-phase removals; missing joins do not
authorize resurrecting/replacing those targets.

Visible target drawn-pose union overlaps the player's vertical band323.6..346.4
from14.833s/u11.8911 through15.083s/u12.3326. Collision vertical-overlap interval
for this rogue uses enemy half-height5.04 and player half-height6 at y335:
14.900s/u12.0088 through15.033s/u12.2443. These are60Hz sampled, rounded-pose
estimates, not continuous onset or alpha-mask proof. Last sampled alive pose
15.333s/u12.7741 is(-10.05,392.68), already below the viewport.
Other group3 survivors132766890/212535042 also enter the ship's vertical band,
without contact at these sampled ship columns. Do not repair only one ID.

## Retained Real Shot Witnesses

Same saved normal-key37/40 run,80shots, no life losses:

| Target | Actual kill time | Local u at kill |
| --- | --- | --- |
|521982333|8.417s|0.5592|
|753126167|8.533s|0.6181|
|132766890|8.783s|0.9419|
|212535042|9.550s|2.4135|
|214629079|10.050s|3.4437|
|642159901|12.167s|6.7991|

Earliest/latest group3 real-hit witnesses are8.417/12.167s. All occur before
u9.7; target214629079's witness precedes its13.600s exit by3.55s. These are actual
shot-associated kills in the retained engine run, not assigned hits. Individual
bullet-launch IDs are not logged; do not fabricate a shot-to-kill launch mapping.
Targets352310587/353909248 lack retained kills and expire in middle beforeu9.7.
No post-u9.7 real group3 hit witness is supplied by this37/40 run. It is a strong
regression control, not evidence that every late firing opportunity survives.

## Original Group3 Support And Limits

Controlling reference: lead STAGE31_SURVIVOR_SCREENING_OCT07.md and independent
blue-exit-reference-acceptance-oct12/REVIEW.md. World-of-Longplays29VVkfuXkVI,
SCHLAUCHI, August3 2015. Stage31 authenticated by23-hit result thenStage32 banner;
the earlier30-hit result belongs toStage43 and is excluded.
Reviewer observations: blue/red chain travels left above ship, turns upward,
survivors appear upper-left then disappear with unchanged187200score. Cropped
arrival screening provisionally places it in group3, not an established full
arrival census or per-target identity mapping. Group1/group5 down/outward
references are separate and must not be transplanted here.

Dense primary PNGs at1240.139904/1240.339902/1240.539900s contain two/one/no intact
survivors according to persisted independent screening. Their hashes verified
read-only this cycle:
01 631fa26567995b356a059bbe85eed1b7da64d9674e22399a8ff36ab735370881
02 a9f3a3324019d5c6d0a6bf6d13b74e35ff1427d81e5cc95f5a5d0a2c12e23ea4
03 0ee106f54516dec5bf85de17f6fc22954e7e53a66efb5da34bd1112ddbba7cfd.
They reside in lead private-artifacts/repo-mirror/reference-artifacts/analyses/
challenge-visibility-oct03/galaga-stage31-dense-exit-01..03.png.
The0.2s bracket bounds final disappearance only, not total exit duration.
ROM/difficulty/fire settings, native PTS, exact crop/body removal and individual
correspondence remain unknown. This map cites retained observers, not a new
browser/video inspection. Qualitative up-left supports a trial, not numeric fit.

## Proposed Minimal Repair Boundary For Coordination

ONE Stage31 wave2 selected-generic blue exit candidate, fromu9.7 onward.
Preserve all pre-u9.7 samples, groups1/5, green/yellow, Stage3/27 and later stages.
Match analytic blue middle endpoint/tangent at q=(9.7-entryDuration)/6.55.
Propose continuous tangent transition to up-left departure, composed before the
usual route/spacing/deconflict/bias offsets, not a cached post-offset pose.
Do not keep the downward ship-row crossing solely to preserve its defective late
travel. Do not change entry, force miss/hit, suppress contacts or use per-ID rules.

This map does NOT select rates or duration. Lead should coordinate one general
departure formula with StreamB before authoring, bounded by12px/60Hz, analytic
C0/C1, full drawn-row clearance and meaningful sampled visibility. Target214's
middle anchor near213px leaves room for a tangent-preserving upward turn without
the later-green329px constraint. Verify all five surviving anchors, not one.
No0.2s total-route duration, fixed upper endpoint or exact canonical lane shape
can be justified from the archived bracket. If geometry needs a local cap, label
it engineering safety and keep it scoped, not a shared blue tuning by implication.

Code ownership: raw blue exit branch06-enemy-behavior.js around640, conditional
S.stage===31 && wave===2 only, inside the already selected generic evaluator.
Analytic blue middle formula around545 supplies endpoint/derivative. StreamB
owns stage>=35 in the adjacent family branch; lead owns any shared helper or
lifecycle rule and integrates scoped hunks, never an entire worker enemy file.
Do not touch accepted wave0/wave4 blocks around664/680 or green/envelope rules.

## Acceptance Risks And Next Action

Lead gate stage31 scope: exact recorded31/35/39 shot/kill/loss events, both themes,
center/sides,40entry, continuous<=12px exit, natural clear and<=0.4empty tail,
clear-relative cadence4.401+/-0.1. Report blue later-known issues separately.
Actual glyph images supplement body/row proxy; no life loss alone is not visual
acceptance. Offscreen retirement requires complete glyph exit and nonreturn;
do not inherit generic+/-54 assumptions if the new path turns during the splice.
Preserving early37/40 alone cannot certify late shooting windows: consider one
bounded normal-input late-shot witness if the proposed departure shortens them,
not a controller/seed sweep. Unknown perfect feasibility stays unknown.

No fresh browser measurement was needed for this evidence-first map; primary
lead gate/captures can confirm frozen-build contact pixels. Stream A now stops
for lead map/design coordination. No gameplay file changed.
