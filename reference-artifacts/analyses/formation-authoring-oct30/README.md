# Formation Authoring Visual Proof

October30, 2026. PR263 merged as `e0987756dbee9ab8268a99807e0c0a74046b45f6`.
G5.2 bounded proof: **configuration `{gx:22,gy:20,oy:32}` passes recorded
desktop/mobile visual and keyboard-input smoke checks at internal stages4/5**.
It is not installed in the shipped game. Other envelope values require their
own visual gate; JSON validation alone never certifies playability.

## Method And Provenance

- Actual Chromium runtime,40 cases: baseline, deliberately tight negative case,
  and eight corners of gx20/22,gy18/20,oy28/32; two stages and two viewports.
- Viewports1100x1000 and390x844; `auto` sprite mode, classic-arcade graphics,
  seed7723, controlled1/60 updates. Sample times0.65,4.8,6.2,7.6,9 seconds;
  keyboard movement and firing through10 seconds. Nine starting ships.
- Existing actual `spawnFormation`, renderer, keyboard and collision/scoring
  consumers run in the browser. Patches apply only to disposable in-memory pack
  records. No source/bundle mutation, external requests, account writes or upload.
- Frozen build1257, source `cb70121e9c5f29c483eec54f17b44e115a87c55f`.
  `git diff cb70121e e0987756 -- src` is empty: runtime source is identical.
  Bundle inventory SHA256:
  `e75da83616ce4e6eddb97a79e446f5e8b413d7fc4114bd1e3387ffca0884f3fe`.
- Private method: `private-artifacts/formation-visual-oct30/probe.js`.
  Method SHA256: `78af97985f0936dbc9745442f9db3792176ab24e105660eb8fbb7b146baf5210`.
  Validator SHA256: `41ca5fe185a58e11ca7b87888da7fbd3d749a2a6b66ffaf5613bf94176cddf07`.
  Receipts/screenshots: `private-artifacts/formation-visual-oct30/run-v3/`.
  Earlier exploratory run-v1/v2 remain retained. V3 adds validator hash/dirty
  provenance and explicit validator rejection before negative visual injection.
  Tightened minima are local follow-through, not part of baseline e0987756.
  Independent review recomputed all40 settled and200 active metrics in v2 and
  verified120 screenshot paths. V3 repeats those observations with provenance fixes.

## Results And Failures

| Scope | Result |
| --- | --- |
| Named candidate, four stage/viewport cases |4/4 pass;40 initial enemies, horizontal gap4, vertical gap6 |
| Candidate active overlap | Stage4 maximum2 pairs, Stage5 maximum3; existing limit8 |
| Candidate keyboard input | Left/right movement, release, firing with positive earned score; no page errors |
| Candidate images | Entry/rack/input frames retained; reviewed representative desktop/mobile frames show sprites, unobstructed player/HUD and populated canvas |
| Tight negative gx18/gy16 | Four expected spacing failures: horizontal gap0 and vertical gap2 |
| Baseline Stage4 and20/18/32 Stage4 | Four active-overlap failures across viewports:9 pairs at9seconds, limit8 |
| All cases |40 completed assertions;32 visual-guard passes and8 visual-guard failures. Completion is NOT universal visual acceptance |

Metrics execute the existing `check-formation-readability.js` functions with its
unchanged1.8 horizontal/2.8 vertical minimums and8-pair active limit. No thresholds
were relaxed. The validator now refuses gx<20 and gy<18 to avoid known compressed
targets; oy remains28-32. The baseline overlap defect remains a separate
player-quality investigation, not concealed by the named candidate passing.

The mobile layout still omits cabinet-side controls and has large top/bottom
margins. This proof checks canvas legibility and keyboard behavior at that size,
not touch controls or a comprehensive mobile UX acceptance. Entry and active
flight overlap are retained; no claim that sprites never cross each other.

## Acceptance Boundary

G5.2 now has runtime effects plus bounded visual/input evidence for one named
supported configuration. It does not prove every continuous parameter combination,
balance, natural stage progression, full careers, alternate sprite modes, audio
fidelity, Guardians, or release readiness. Source gameplay data remains unchanged.

Remaining adoption closure item: G6.3 approved off-machine recovery. Copy private
evidence to an approved private destination, restore into a fresh location and
compare manifest hashes. The existing local156-file restore is not that test.
This reliability item need not prevent independent gameplay investigation; do
not call the complete adoption program accepted until it is resolved or the
human explicitly accepts its deferral.
