# Exact Beta Acceptance And Delivery

Date: October15,2026, America/New_York. Lead baseline: clean mainb7ce2898.
Human authorized steps6/7/8, conditional beta publication, no production.
Candidate: 1.4.2-beta.1+build.1195.sha.8e93394b.beta, source
8e93394bbc290d374d005cf13206e42e8c099b78. Gameplay bytes are unchanged.
Frozen inventory:599files,86,208,738bytes, SHA256
9c858c85c5557c08590d7cbf05823c957c43dba92626dfda4cb3ae6f46e04946.
Beta index SHA256:
72f465c5ca9e53cd9cf69ebf34c0cc5be665a129ef4c1fca8b416210c775d313.

## Step6

PASS: existing check-public-package-runtime.js --root FROZEN_BETA
--expected-sha FULL_SOURCE_SHA --flows. Both games boot, normal inputs advance
the runtime, ordinary end/results/restart work, settings37/46 persist across
reload, and Professional Challenge Tour displays results and reachesStage7.
All13 top-level HTML pages have generated CSP/referrer policy. Dev-only launcher,
private-reference theme and schedule-trial guards reject public use. No page
errors, missing local assets or private-audio requests. External HTTP/WebSocket
traffic is blocked in this test: it does not prove online authentication/music.

Exact-root account test PASS: normal sign-in/reset/signup controls enabled and
dummy fields fillable, no submission, remote score writes remain blocked.
Wrong source SHA rejected before browser launch. The six tracked security
observations are false against this exact root. These checks are not a complete
security certification or independent media-rights audit. No new media was added.
The prior50private-audio hash exclusion remains valid for unchanged inventory.

## Step7

Automated subset PASS. Ordinary Professional Challenge Tour ran600browser-clock
seconds toStage159, without runtime fault or stopped Watch state. A separate
120-real-second run advanced throughStages3,7,11,15,19,23,27, with changing canvas
fingerprints and no runtime fault. Passive browser WebAudio taps measured peak
0.1801,1015nonzero samples of2412; context running, default40/60mix, effects unmuted.
This measures effects output, not human audibility or online soundtrack quality.
Music was off until its normal start button was requested separately.

Separate30-second online music check FAILED playback acceptance: the public
platform-default playlist iframe displays "This video is unavailable" while
the game reports playing/Stop Arcade Music. The same mismatch was observed in
the Codex built-in browser, not only headless Chromium. The built-in browser
needed a temporary desktop viewport to access the desktop dock; its narrow
default view hides those controls. No region/auth/embed/network cause is yet
proved, and a playing label is not audio proof. Keep publication held. The
recorded playlist ID and full player/network evidence remain private in music.json.
Investigate an actually playable public music source and truthful playback
status next; any source/runtime change requires a new candidate and validation,
not editing this freeze in place. No music repair is claimed here.
The existing Embeddable Arcade Jukebox alternative also reported unavailable in
an isolated automated session. Therefore simply substituting a playlist is not
an evidence-backed repair. Next diagnostic: compare provider playback on HTTPS
hostedDEV and an ordinary browser session, then distinguish embed/origin/API
attachment failure from unavailable content. No external browser was opened.

Initial long-test failure occurred after virtual completion while selecting the
real-clock front door. Two subsequent setup retries exposed paused-input redraw
timing and inaccessible closure-local audio state. The accepted run advances
only setup timing then resumes real time, and observes browser audio routing
instead of reaching into game closure state. No game source or frozen bytes
were changed to make these tests pass. Original partial/failure evidence retained.
One unseeded tour is not every-seed, perfect-route, all-late-path or original
Galaga-speed conformance. Earlier measured keepers remain scoped evidence.

Live successful login/session persistence and human public-theme listening remain
UNVERIFIED. A private-sign-in/listening question was sent to the human; no
credentials are requested in chat. Frozen beta is served locally at127.0.0.1:8001.
Do not claim Step7 complete or publish while these acceptance checks are open.

## Step8

Delivery repair only, no gameplay edits. Exact-root account mode prevents the
release preflight from silently rebuilding dist/beta on HEAD drift. Default
standalone account-check behavior remains compatible. New publish:beta:frozen
keeps complete code-review/beta preflight gates, checks full frozen inventory
before/after gates and staging, rejects non-beta diffs with --no-renames, and
checks committed Git blobs/modes, including no-change cases, before push.
The outer wrapper performs hosted identity/smoke and all-file HTTP hash checks.

Twelve contract fixtures pass, including tamper/missing/extra/symlink/digest,
Git mode and outside-to-beta rename rejection. Five isolated publisher fixtures
pass: accepted, full-gate failure, gate-time mutation, protected-path prune and
no-change tree verification. Gate/network bodies are substituted only in these
fixtures. Real preflight/dry-run is still required. Wrapper post-push HTTP failure
handling is source-reviewed, not yet exercised by publication.

Two independent read-only reviewers found and closed rename/no-change defects.
Current implementation is approved within that bounded scope, not beta acceptance.
Initial real code-review gate blocked missing summary.json inventory; it was
refreshed, inspected and committed, not bypassed. no-mistakes is installed but repository-unconfigured;
no pipeline success is claimed. Project gates remain authoritative.

No beta/production publication or production-approval receipt has occurred.
Real code-review, full beta preflight and frozen publication dry run PASS at
source checkpoint2412e8fd, pushed main. Authority/current-main/hostedDEV,
documentation, audio, security and exact-root account gates all passed. The
temporary public clone passed beta-only path and committed blob/mode checks.
No public push occurred in that dry run. Every599frozen/dist beta file remains
exact. This validates delivery preparation, not the failed music acceptance.
Post-test full public Git-tree comparison matches the pre-task tree
f7be418e7ea5ddfb70c649b5db08fe0cb030705c: DEV, beta and production unchanged.
The result-documentation follow-up does not relabel the tested runtime8e93394b
or imply gates were rerun at a later HEAD. The existing four-commit freshness
window still applies to future attempts; rerun gates and stop if it expires.

Remaining: resolve public music playback/status, verify live account and audible
acceptance, then rerun gated beta publication with exact-byte/protected-lane
verification for the accepted candidate. Stop on any gate
failure; do not relabel, silently rebuild or weaken freshness. Raw test scripts,
reports, screenshots and logs persist under private-artifacts/beta-acceptance-oct15.
