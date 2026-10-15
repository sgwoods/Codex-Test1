# Public Ordinary-Flow Validation

Source baseline 0415a3858a7e8804ed5a2645af55a6e7cb74bf80, October4.
Actual production package: 1.4.1+build.1212.sha.0415a385.dirty.
Dirty metadata reflects documentation/tool/evidence work, not retained motion
source edits. The rejected candidate was restored before this build.

Accepted report.json records method/bundle hashes. static.json records all28
package files, zero private audio files and package.tar.gz SHA-256. Archive is
the complete tested public package, not the earlier cached output. No publish.

Passed with ordinary controls and read-only exported runtime observations:
- Both games start/switch with absent private harnesses and disabled review controls.
- Audio Mix37/46 values and labels persist through close/reopen and restart.
- Guardians held firing/alternating arrows reaches alien_flagship_collision
  end state at32.208 simulation seconds. Results/initials/scoreboard Enter prompts
  restart at Stage1/score0; owned runtime exists, resets and advances.
- Aurora idle human reaches ship-loss end state at31.327 simulation seconds;
  normal Enter flow restarts at Stage1/score0 with advancing clock.
- Reload retains Aurora Settings; normal Watch selection chooses Professional
  and Challenge Tour, starts Stage3, displays its challenge result, then reaches
  a running Stage7 with preserved persona/scope and advancing clock.
- No page exceptions, missing local assets or private audio requests.

Chromium uses disposable contexts, blocked service workers/external HTTP and
WebSockets. Clock installed before boot; ordinary RAF/timer callbacks are
advanced. Browser time paused briefly while selecting on the per-frame redrawn
front door. Persona/Watch use keyboard controls, scope uses real pointer input.
Settings changes use normal input/change events. No gameplay state assignment,
private launch, forced clear or private harness exposure. Browser/server closed.

Exploratory test iterations corrected expected results/initials progression,
hidden in-game Settings button (KeyT), closure-private helpers and unstable
per-frame DOM locators. Guardians idle180s did not reach an end state; final
test uses explicitly recorded ordinary keyboard play instead. These exploratory
failures are not separately accepted game defects or additional test passes.

Fresh output was necessary: previous cached dist/production included fifty old
private audio files, despite current manifest exclusions. It was moved intact to
/private/tmp/aurora-old-production-tumTJz/production before rebuilding empty.
No hosted exposure or permanent cleanup fix is established. The fresh package
at /private/tmp/aurora-clean-public-flows-N9cQzh passes static exclusion.

Command:
```sh
node tools/harness/check-public-package-runtime.js --root /path/to/frozen/package --expected-sha 0415a3858a7e8804ed5a2645af55a6e7cb74bf80 --flows
```

Limitations: not audible audio, live authentication/submission, actual packaged
beta, Guardians Watch, Watch-to-human restart, both result variants separately,
late-stage conformance or perfect-route feasibility. Nonblank canvas remains
weak visual smoke. Browser-clock coverage does not prove real-time interaction
robustness. Static inventory is required alongside request monitoring.
Independent read-only tool review passed; node syntax/git diff checks passed.
Optional no-mistakes command reports repository uninitialized; no pipeline pass.
Local persistence is not off-machine backup. No main push or lane publication.
