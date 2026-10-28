# 1.4.2 Production Release

Prepared October 24, 2026. Published October 26, 2026; announcement October 27.
The deployed lane's build-info.json is the authority for current identity.
Gameplay source: beta5, ea779a76, build 1218. Previous release: 1.4.1.

This release adds per-game signed-in score storage, password recovery fixes,
stronger Professional play, replay history metadata fixes and smoother challenge
transitions. Existing Aurora scores are preserved; Guardians scores are separate.
Signed-in scores are not automatically proof of cheat-free gameplay.

Expert consistency remains an accepted beta limitation. Guardians remains a
playable preview. No new gameplay tuning is part of production packaging.

Acceptance record, October 24, 2026: the player accepted beta5 play and
reported successful password recovery. Live account score retrieval was
confirmed for both games, including a new Guardians 160-point run after reload.
Production publication completed October 26 after documentation generation,
PDF rendering and release gates passed. Public repository commit: 9c2888c.
Deploy Pages run 40379387684 succeeded. Hosted build identity, all 12 release
documentation assets, browser smoke and public portfolio synchronization passed.
The hosted white-paper HTML/PDF and provenance match the validated local bytes.
Documentation source: 3c7d2667cca3fb2da7515cb7d2a1fd1f543873f8.

## Highlights For Players

- Keep separate signed-in scores for Aurora Galactica and Galaxy Guardians,
  with existing Aurora scores preserved. Guests retain local scores.
- Try the stronger Professional pilot in Watch or supported rival play. Testing
  and those modes share controller rules; AI scores are not posted as human runs.
- Spend less time waiting through challenge results, with clearer exits and
  preserved shooting opportunities.
- Use the repaired password-recovery flow and more reliable new replay/history
  metadata. Replays are stored on the device, not promised as cloud-synced.
- See confirmed music-playback status and refreshed guides, dashboards and a
  readable white paper.

The accepted Aurora persona panel used ten seeded runs per tier with a
900-second limit per run. Professional median: 240,785 points; nine of ten runs
reached 200,000. Expert median: 81,275; six of ten reached 75,000. These are
bounded test results, not guaranteed scores or Guardians measurements. Wizard
is not included. See RELEASE_NOTE_1.4.2_BETA_5.md for the full panel and limits.

## Post-Release Human Check

October 27: the player reported completing a game. Supplied screenshots show a
signed-in pilot, two sorties, best score 2,680 and latest score 680 at Stage 1;
the replay picker shows a matching 680/Stage 1 run and five device-local replays.
This confirms the displayed run/profile/replay experience, not a new independent
database check. The user subsequently confirmed My Scores survived reload and
a new tab, completing the human persistence check. Zero verified runs is consistent
with account-linked scores remaining unverified, not evidence of a save failure.
No personal account identifiers are included in this release note.

Slack announcement: RELEASE_ANNOUNCEMENT_1.4.2_SLACK.md. This post-release source
update does not itself rebuild or republish the hosted documentation.

See RELEASE_VERSIONING.md for the relationship between dev 1.4.1.6 and
beta 1.4.2-beta.5. They share source ea779a76 and build 1218.
