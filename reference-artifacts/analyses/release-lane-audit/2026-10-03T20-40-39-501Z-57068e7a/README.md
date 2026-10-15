# Hosted Lane Snapshot

Read-only HTTP fetch on October 3, 2026. Raw response metadata: dev.json,
beta.json, production.json. Cache-busting query used; no lane changed.

| Lane | Verified Label | Artifact Built At UTC |
| --- | --- | --- |
| Dev | 1.4.1.1+build.1177.sha.1d9966d1 | 2026-06-12 11:26:03.441 |
| Beta | 1.4.1-beta.1+build.1168.sha.edd6a736.beta | 2026-06-11 17:22:32.022 |
| Production | 1.4.1+build.1164.sha.54398ff5 | 2026-06-11 16:33:38.042 |

Dev URL: https://sgwoods.github.io/Aurora-Galactica/dev/build-info.json
Beta URL: https://sgwoods.github.io/Aurora-Galactica/beta/build-info.json
Production URL: https://sgwoods.github.io/Aurora-Galactica/build-info.json
Production is the site root; /production/build-info.json returned 404.
The web reader could not access JSON endpoints; direct read-only fetch succeeded.

These are build timestamps, not exact publication timestamps. Pages Last-Modified
can reflect a whole-site update and is not a lane-specific deployment record.
Production's release note is June 11. Its recorded beta approval was June 11
16:33:50.654Z for 1.4.1-beta.1+build.1164.sha.54398ff5.beta. Current beta is
build1168/edd6a736, so old production approval does not establish its eligibility.
All three hosted builds report clean source and expected channel identity.

Remote source main checked with git ls-remote: 181d8e29, September 24 source.
Local repair HEAD before diagnosis: 57068e7a, eleven commits ahead of main.
October cadence/entry repairs and review-launcher integration are not hosted.
No push, integration, lane preflight, publish, beta approval or promotion run.
