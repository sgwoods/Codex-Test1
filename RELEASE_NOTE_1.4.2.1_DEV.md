# Development 1.4.2.1: In-Game Build Details

Prepared October 28, 2026. Authorized destination: `/dev` only.

The build strip opens Platform Messages. Its BUILD row now opens an in-game
view of the release summary packaged with that exact artifact. It includes
lane, full build label, package version, build number, source revision, build
time and release-note date. Note date is not a claim of deployment date.

Enter and Space activate the row; Back and Escape return to the messages.
Closing the panel restores keyboard focus. Notes remain accessible offline;
online accounts and music are not promised to work offline. Opening the view
does not restart play. New promotions replace embedded lane metadata; previously
approved artifacts without the new view remain untouched.

Validation covers literal note serialization, lane metadata, isolated production
promotion, desktop/mobile layout, offline access, keyboard/focus behavior and
existing build-strip interactions. Hosted verification remains part of publish.

The development version is now `1.4.2.1`: iteration 1 after production 1.4.2.
Package SemVer and the frozen 1.4.2-beta.5 artifact are not advanced by this
development label. No beta or production promotion is authorized. Accumulate
a coherent set of player improvements before discussing the next beta.

Historical movement reports #248/#249 did not reproduce in a short guest
Chromium probe on production 1.4.2. No movement tuning is included.
