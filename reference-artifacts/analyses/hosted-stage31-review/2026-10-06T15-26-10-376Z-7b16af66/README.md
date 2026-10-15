# Hosted Stage 31 Review

Verdict: dev-cleanup-known-issues. Retain dev candidate; no release promotion.
Hosted build:1.4.1.1+build.1224.sha.7b16af66, development, clean.
Source commit:7b16af661867c1391b6dbcb42bd85c4610dcf3b2.
URL:https://sgwoods.github.io/Aurora-Galactica/dev/
Local baseline before review:3df1b4ab. No hosted source changes.

Method: browser Settings UI selects Challenge8, three ships, Human or
Professional; Enter starts Stage31. Browser uses normal animation clock.
Fresh contexts, seed9131, default public Aurora theme. No path, schedule,
clock or enemy-state overrides. Report contains bundle/method hashes,
captured build identity, events, target bounds and SHA256-indexed canvas PNGs.

| Measure | No-fire Human Control | Professional |
| --- | --- | --- |
| Hits | 0/40 | 33/40 |
| Launch to clear | 22.073s | 18.875s |
| Clear to next spawn | 4.405s | 4.417s |
| Nonlethal target contacts | 4 | 0 |
| Maximum blank interval after first arrival | 0.183s | 1.167s |
| Full body entry observed | 40/40 | 38/40, shot-censored |
| Enemy shots / attack starts / ship losses | 0 / 0 / 0 | 0 / 0 / 0 |

Nine guard checks pass. Report ok:true means only those declared checks pass,
not complete gameplay acceptance. No-fire three-or-more-wave overlap0.875s;
no four/five-wave overlap. Sampled human14s image shows separated targets.
First packet human8s image shows target overlap near the stationary ship.
Professional14s images in both packets show no visible targets.
No-fire contact events occur at7.957,11.395,21.482,21.699s. Their permissibility
is unresolved: nonlethal does not mean visually conformant. No geometry repair.

The first packet at2026-10-06T15-24-05-374Z-7b16af66 has ok:false because its
seed assertion read a field absent from snapshot(). It is preserved unchanged.
Corrected repeat reads state().seed and confirms9131 in both runs. First
Professional score34/40 versus repeat33/40 shows normal-clock sensitivity;
these are two checks of one seed, not a success-rate distribution.

Public gameStart, challengeResults and stageTransition requests were logged;
Professional also logs firing/destruction cues. No private reference paths in
captured audio history. This does not prove audible mix, completed playback or
asset-byte exclusion. Canonical private clips are intentionally not hosted.
Local canonical-buffer results remain separate evidence.

RAF visibility samples are approximate, not exact fixed60Hz traces. Initial
arrival, result and handoff are excluded from idle; trailing offscreen exit
counts. Full body bounds do not prove unobstructed, hittable or perfect routes.
Earlier local controlled-clock classic-theme no-idle result does not establish
no blank interval in this normal-clock default-theme hosted run.

Independent source/evidence reviewer recommends known issues, not unconditional
acceptance. Next: measure the four contacts and pause against persisted original
Galaga clips; then decide whether a bounded repair is required. Player objective:
clear safe crossings and continuous shooting opportunities. Do not fix these by
subjective path changes or shorten canonical audio. No beta/production promotion.
