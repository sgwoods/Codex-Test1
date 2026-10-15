# Yellow Lane Reference Findings

October 3, 2026. Source baseline 85010e73. Read-only specialist analysis.
No gameplay change or release acceptance follows from this packet.

## Measurements

Primary source SHA-256:
8d29ea711d09d243a2904bf9538981d97fe1fa323e4f920177688fa2b4c4c840.
Local persisted source: private-artifacts/repo-mirror/reference-artifacts/analyses/challenge-visibility-oct03/challenge-all2.mp4.
Tracks: reference-artifacts/analyses/galaga-challenge-object-tracks/2026-05-19_03-29-40-fba7f625/tracks/challenge-07.json
and challenge-08.json. Extraction: 8 fps, first 16 seconds, 480x360 source,
ROI (103,0,274,347).

Challenge 7 has 48 detected tracklets, median span 1.00s. Challenge 8 has
60 tracklets, median span 0.88s. These are component/centroid spans, not
continuous full-sprite dwell or authoritatively identified alien identities.
Challenge 7 target-track-35 spans source 220.75-221.75s at normalized centroid
x 0.7454-0.8111, y 0.2635-0.3149. Track-38 spans 221.13-222.13s at
x 0.5105-0.5650, y 0.4592-0.5029. Track-39 spans 221.25-222.25s at
x 0.4186-0.4956, y 0.5124-0.5730. These support sustained interior motion,
not a required one-second threshold for every alien.

Runtime Stage 27 has five targets never fully entering: zero-based (wave,lane)
(0,4), (1,0), (2,4), (3,0), (4,4). Their centers approach x=276.4 or 3.6;
rendered extents require approximately x<=268 or x>=12. About nine additional
inward pixels would establish entry only, not adequate dwell.
Another five have only 0.133-0.150s continuous visibility.
Stage 31's weakest target is yellow wave lane 3, with 0.217s.
Stage 27 wave 0/lane 7 jumps from (401.21,155.09) at 1.9s to
(246.62,46.66) at 2.0s in persisted samples: a phase discontinuity.

## Limitations And Next Candidate

Track summaries omit bounding boxes and retain at most ten centroid samples.
Top 10.5% and bottom 12.5% of ROI are excluded, censoring edge entry.
Fragmentation, effects, shooting and identity changes contaminate durations.
Challenge 8's grouped tracks are not verified as the runtime yellow wave.
The one-fps primary contact sheet shows interior yellow trains and 40-hit
perfect results, but cannot establish fine timing.

Smallest justified candidate: yellow-diagonal-fan only, place entry endpoints
inside sprite bounds and join entry/sweep continuously. Preserve direction,
spacing and cadence initially. Do not impose an arbitrary one-second dwell,
blanket slowdown, or additional removal grace. Validate all ten challenges,
natural spawn, safety and keepers before acceptance; perfect sweep stays deferred.

## Automated Local Inspection

Final report and 16 screenshots:
../challenge-full-entry/2026-10-03T19-21-50-638Z-85010e73/.
Desktop 1440x1000 and mobile 390x844; stages 27/31; cumulative requested
simulated advances 1, 2, 3.2 and 5 seconds after normalized setup.
Controlled clock draws synchronously; screenshots follow browser presentation.
Canvas buffer/visibility smoke passes, capture-phase exceptions absent.
It is not enemy-pixel, occlusion, startup-error, audio or perceptual acceptance.
Full-entry verdict remains failed: missing counts 0,0,0,0,0,0,5,0,0,0.
Independent tooling review limitations were incorporated before the final run.
