# Capture / Rescue Correspondence

This artifact compares the shipped local baseline and current local candidate across core capture-window and escape-recovery scenarios.

## Sources

- Profile: `tools/harness/reference-profiles/capture-rescue-correspondence.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`

## Summary

- Passed scenarios: 3/3
- Worst tracked-time drift: 0

## Scenarios

### capture-shot-early
- Scenario ok: yes
- Baseline session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-early-seed9043-2026-06-01T17-22-14-566Z-57266-rw16g2/neo-galaga-session-ngt-1780334537753-3.json`
- Current session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-early-seed9043-2026-06-01T17-22-33-048Z-57308-9fx00p/neo-galaga-session-ngt-1780334554483-3.json`
- Baseline counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":4,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"player_shot":1,"enemy_killed":1,"commentator_callout":1,"capture_escape":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- Current counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":4,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"player_shot":1,"enemy_killed":1,"commentator_callout":1,"capture_escape":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- mustHave:harness_capture_escape_setup: baseline=yes, current=yes, ok=yes
- mustHave:player_shot: baseline=yes, current=yes, ok=yes
- mustHave:capture_escape: baseline=yes, current=yes, ok=yes
- mustNotHave:fighter_captured: baseline=no, current=no, ok=yes
- player_shot (anchor=harness_capture_escape_setup): baseline=0.147, current=0.147, drift=0, withinTolerance=yes
- capture_escape (field=timeSinceCaptureStart): baseline=0.18, current=0.18, drift=0, withinTolerance=yes

### capture-shot-late
- Scenario ok: yes
- Baseline session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-late-seed9044-2026-06-01T17-22-49-712Z-57357-7yx52t/neo-galaga-session-ngt-1780334571746-3.json`
- Current session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-late-seed9044-2026-06-01T17-23-06-986Z-57407-ll9e2r/neo-galaga-session-ngt-1780334588501-3.json`
- Baseline counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":3,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"key_up":1,"fighter_captured":1,"capture_retreat_phase":1,"harness_stop":1,"capture_export_reset":1}
- Current counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":3,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"key_up":1,"fighter_captured":1,"capture_retreat_phase":1,"harness_stop":1,"capture_export_reset":1}
- mustHave:harness_capture_escape_setup: baseline=yes, current=yes, ok=yes
- mustHave:fighter_captured: baseline=yes, current=yes, ok=yes
- mustNotHave:capture_escape: baseline=no, current=no, ok=yes
- fighter_captured (field=timeSinceCaptureStart): baseline=0.46, current=0.46, drift=0, withinTolerance=yes

### capture-escape-recovery
- Scenario ok: yes
- Baseline session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-escape-recovery-seed9032-2026-06-01T17-23-23-736Z-57440-hdeyox/neo-galaga-session-ngt-1780334605825-3.json`
- Current session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-escape-recovery-seed9032-2026-06-01T17-23-41-064Z-57473-jb601p/neo-galaga-session-ngt-1780334622509-3.json`
- Baseline counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":4,"harness_capture_escape_setup":1,"enemy_attack_start":1,"harness_spawn_player_bullet":1,"enemy_killed":1,"commentator_callout":1,"capture_escape":1,"key_down":1,"player_shot":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- Current counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":5,"harness_capture_escape_setup":1,"enemy_attack_start":1,"harness_spawn_player_bullet":1,"enemy_killed":1,"commentator_callout":1,"capture_escape":1,"key_down":1,"player_shot":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- mustHave:capture_escape: baseline=yes, current=yes, ok=yes
- mustHave:player_shot: baseline=yes, current=yes, ok=yes
- mustNotHave:fighter_captured: baseline=no, current=no, ok=yes
- mustNotHave:ship_lost: baseline=no, current=no, ok=yes
- capture_escape (field=timeSinceCaptureStart): baseline=0.267, current=0.267, drift=0, withinTolerance=yes

## Read

- This correspondence report is about rule and state-transition behavior, not visual feel.
- A scenario can pass outcome checks while still needing later timing or presentation tuning.
- Expand this pattern next into richer rescue-return, hostile-captured-fighter, and Stage 4 capture-pressure correspondence.

