# Local Music Origin Comparison

Date: October16,2026, America/Toronto. Baseline: clean pushed main148f82e8.
Objective: explain working development music versus silent frozen-beta review,
without tuning audio, changing playlists, modifying the freeze or publishing.

## Result

Exact frozen beta works at http://localhost:8001/. The initial isolated-browser
run measured actual media time3.558->15.614s, readyState4, paused=false,
muted=false, provider error absent. A repeat measured3.506->15.550s. The Codex
built-in browser independently measured readyState4 and advancing playback;
after ordinary Enable Arcade Music, time45.233s, paused=false, muted=false.
The working developer origin localhost:8000 measured3.486->15.508s unmuted.
Both serving builds report source8e93394b; beta is1.4.2-beta.1 and development
is1.4.1.2. The user had also confirmed development sound/music. Their open
development tab still displayed an older cachedcf0 build, so fresh contexts
were used to avoid attributing the result solely to that older page.

Same beta at127.0.0.1:8001 in the built-in browser displayed two visible
"This video is unavailable" messages, media time0, paused=true, readyState0,
while warming. The initial automated probes at both IP origins logged YouTube
error150, then timed out trying to click a disabled warming button. HostedDEV's
initial probe also hit that short click timeout. Those automated failures are
setup-limited and do not establish final playback outcomes; a50-second-click
follow-up retains deeper observations separately.
That follow-up now confirms the beta IP failure after the warmup allowance:
manual startup stays loading, provider unavailable, media time0/readyState0
through all five samples. The repeated localhost control remains unmuted and
advancing. HostedDEV's longer observation also reaches real unmuted media
playback: time1.785->13.810s, readyState4, paused=false, no provider unavailable
message. Aurora's button still says Starting Arcade Music throughout those
samples. Thus a startup-status/API synchronization concern remains, but this
run disproves the broader claim that the playlist cannot play on hostedDEV.

The initial requests supplied both HTTP Referer and matching origin parameters
for localhost and IP. Missing identification is therefore not established as
the cause. Source comparison cf0e7a66..8e93394b shows no audio-runtime-shell
change. A localhost/IP origin-sensitive player failure is reproduced here;
the precise provider/client cause is not proved and may be environment-sensitive.
Do not claim all IP embeds universally fail or this proves every hosted lane.

## Smallest Correction

Use http://localhost:8001/ for beta review, not127.0.0.1:8001. The existing
tools/dev/local-host-config.js already distinguishes loopback bind host from
localhost browser host. Correct the work-packet/review links, not the package.
Beta music was enabled through its ordinary control; development preferences
and private-reference clips were not changed. No playlist substitution needed.

Frozen package still599files, inventory SHA256
9c858c85c5557c08590d7cbf05823c957c43dba92626dfda4cb3ae6f46e04946;
index72f465c5ca9e53cd9cf69ebf34c0cc5be665a129ef4c1fca8b416210c775d313.
Complete frozen/dist inventory equality was rechecked. No source runtime,
package metadata, hosted lane or release approval changed.

## Evidence And Limits

Primary private evidence: private-artifacts/music-origin-oct16/report.json,
follow-up.json, initial-probe-method.js, probe.js, probe/follow-up screenshots
and run logs. The recovered initial method matches the report's SHA256
ff38fe3e0b3277d83cff51ec4020247ed9e2d0418b56e0c93039130589c49ffd.
Reports include build identities, real media clocks/paused/muted/ready state,
embed/API request referrers, provider errors and test limitations. Browser UI
observations are lead observations, distinct from the persisted automated runs.
No credentials, personal browser storage or account tokens were inspected.

Reference: https://developers.google.com/youtube/iframe_api_reference explains
real player-state events, embed origin and error codes; existing iframe playback
is not proved by creation alone. This reference supports the test method, not
an undocumented universal localhost-versus-IP provider rule.

Next: obtain human listening/live-account
acceptance on the correct local beta origin, and retain a separate repair task
for startup/fallback status that can lag or mislabel actual playback. HostedDEV
media success is not yet hosted-beta acceptance and does not prove human audio.
No beta/production publication is authorized by this diagnostic result alone.
