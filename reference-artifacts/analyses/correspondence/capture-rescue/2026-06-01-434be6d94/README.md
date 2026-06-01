# Capture / Rescue Correspondence

This artifact compares the shipped local baseline and current local candidate across core capture-window and escape-recovery scenarios.

## Sources

- Profile: `tools/harness/reference-profiles/capture-rescue-correspondence.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`

## Summary

- Passed scenarios: 3/3
- Worst tracked-time drift: 0.017

## Scenarios

### capture-shot-early
- Scenario ok: yes
- Baseline session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-early-seed9043-2026-06-01T22-05-09-410Z-24468-bk5rr4/neo-galaga-session-ngt-1780351512905-3.json`
- Current session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-early-seed9043-2026-06-01T22-05-28-597Z-24512-kiy2q9/neo-galaga-session-ngt-1780351532845-3.json`
- Baseline counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":4,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"player_shot":1,"enemy_killed":1,"commentator_callout":1,"capture_escape":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- Current counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":4,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"player_shot":1,"score_awarded":1,"enemy_killed":1,"commentator_callout":1,"capture_escape":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- mustHave:harness_capture_escape_setup: baseline=yes, current=yes, ok=yes
- mustHave:player_shot: baseline=yes, current=yes, ok=yes
- mustHave:capture_escape: baseline=yes, current=yes, ok=yes
- mustNotHave:fighter_captured: baseline=no, current=no, ok=yes
- player_shot (anchor=harness_capture_escape_setup): baseline=0.147, current=0.147, drift=0, withinTolerance=yes
- capture_escape (field=timeSinceCaptureStart): baseline=0.18, current=0.18, drift=0, withinTolerance=yes

### capture-shot-late
- Scenario ok: yes
- Baseline session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-late-seed9044-2026-06-01T22-05-48-673Z-24558-0hk5id/neo-galaga-session-ngt-1780351553048-3.json`
- Current session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-late-seed9044-2026-06-01T22-06-08-799Z-24602-l63ama/neo-galaga-session-ngt-1780351573508-3.json`
- Baseline counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":3,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"key_up":1,"fighter_captured":1,"capture_retreat_phase":1,"harness_stop":1,"capture_export_reset":1}
- Current counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":3,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"key_up":1,"fighter_captured":1,"capture_retreat_phase":1,"harness_stop":1,"capture_export_reset":1}
- mustHave:harness_capture_escape_setup: baseline=yes, current=yes, ok=yes
- mustHave:fighter_captured: baseline=yes, current=yes, ok=yes
- mustNotHave:capture_escape: baseline=no, current=no, ok=yes
- fighter_captured (field=timeSinceCaptureStart): baseline=0.443, current=0.46, drift=0.017, withinTolerance=yes

### capture-escape-recovery
- Scenario ok: yes
- Baseline session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-escape-recovery-seed9032-2026-06-01T22-06-29-316Z-24659-jp59xa/neo-galaga-session-ngt-1780351592673-3.json`
- Current session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-escape-recovery-seed9032-2026-06-01T22-06-48-449Z-24710-kaxcij/neo-galaga-session-ngt-1780351614003-3.json`
- Baseline counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":4,"harness_capture_escape_setup":1,"enemy_attack_start":1,"harness_spawn_player_bullet":1,"enemy_killed":1,"commentator_callout":1,"capture_escape":1,"key_down":1,"player_shot":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- Current counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":5,"harness_capture_escape_setup":1,"enemy_attack_start":1,"harness_spawn_player_bullet":1,"score_awarded":1,"enemy_killed":1,"commentator_callout":1,"capture_escape":1,"key_down":1,"player_shot":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- mustHave:capture_escape: baseline=yes, current=yes, ok=yes
- mustHave:player_shot: baseline=yes, current=yes, ok=yes
- mustNotHave:fighter_captured: baseline=no, current=no, ok=yes
- mustNotHave:ship_lost: baseline=no, current=no, ok=yes
- capture_escape (field=timeSinceCaptureStart): baseline=0.267, current=0.267, drift=0, withinTolerance=yes

## Read

- This correspondence report is about rule and state-transition behavior, not visual feel.
- A scenario can pass outcome checks while still needing later timing or presentation tuning.
- Expand this pattern next into richer rescue-return, hostile-captured-fighter, and Stage 4 capture-pressure correspondence.
