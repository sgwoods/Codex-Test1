# Capture / Rescue Correspondence

This artifact compares the shipped local baseline and current local candidate across core capture-window and escape-recovery scenarios.

## Sources

- Profile: `tools/harness/reference-profiles/capture-rescue-correspondence.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`

## Summary

- Passed scenarios: 3/3
- Worst tracked-time drift: 0.004

## Scenarios

### capture-shot-early
- Scenario ok: yes
- Baseline session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-early-seed9043-2026-04-19T17-01-01-573Z-74665-1yh79s/neo-galaga-session-ngt-1776618063845-3.json`
- Current session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-early-seed9043-2026-04-19T17-01-20-126Z-74834-ijorsv/neo-galaga-session-ngt-1776618082349-3.json`
- Baseline counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"player_shot":1,"enemy_killed":1,"capture_escape":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- Current counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":9,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"player_shot":1,"enemy_killed":1,"capture_escape":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- mustHave:harness_capture_escape_setup: baseline=yes, current=yes, ok=yes
- mustHave:player_shot: baseline=yes, current=yes, ok=yes
- mustHave:capture_escape: baseline=yes, current=yes, ok=yes
- mustNotHave:fighter_captured: baseline=no, current=no, ok=yes
- player_shot (anchor=harness_capture_escape_setup): baseline=0.007, current=0.011, drift=0.004, withinTolerance=yes
- capture_escape (field=timeSinceCaptureStart): baseline=0.183, current=0.183, drift=0, withinTolerance=yes

### capture-shot-late
- Scenario ok: yes
- Baseline session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-late-seed9044-2026-04-19T17-01-38-358Z-74959-qgorvy/neo-galaga-session-ngt-1776618100274-3.json`
- Current session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-shot-late-seed9044-2026-04-19T17-01-56-425Z-75143-5e9fsf/neo-galaga-session-ngt-1776618118617-3.json`
- Baseline counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"key_up":1,"fighter_captured":1,"capture_retreat_phase":1,"harness_stop":1,"capture_export_reset":1}
- Current counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":9,"harness_capture_escape_setup":1,"enemy_attack_start":1,"key_down":1,"key_up":1,"fighter_captured":1,"capture_retreat_phase":1,"harness_stop":1,"capture_export_reset":1}
- mustHave:harness_capture_escape_setup: baseline=yes, current=yes, ok=yes
- mustHave:fighter_captured: baseline=yes, current=yes, ok=yes
- mustNotHave:capture_escape: baseline=no, current=no, ok=yes
- fighter_captured (field=timeSinceCaptureStart): baseline=0.45, current=0.45, drift=0, withinTolerance=yes

### capture-escape-recovery
- Scenario ok: yes
- Baseline session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-escape-recovery-seed9032-2026-04-19T17-02-14-654Z-75524-avlk9j/neo-galaga-session-ngt-1776618136851-3.json`
- Current session: `reference-artifacts/analyses/correspondence/capture-rescue/capture-escape-recovery-seed9032-2026-04-19T17-02-33-327Z-75657-ge2xyj/neo-galaga-session-ngt-1776618155558-3.json`
- Baseline counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"harness_capture_escape_setup":1,"enemy_attack_start":1,"harness_spawn_player_bullet":1,"enemy_killed":1,"capture_escape":1,"key_down":1,"player_shot":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- Current counts: {"game_start":1,"stage_spawn":1,"stage_profile":1,"audio_cue":12,"harness_capture_escape_setup":1,"enemy_attack_start":1,"harness_spawn_player_bullet":1,"enemy_killed":1,"capture_escape":1,"key_down":1,"player_shot":1,"key_up":1,"harness_stop":1,"capture_export_reset":1}
- mustHave:capture_escape: baseline=yes, current=yes, ok=yes
- mustHave:player_shot: baseline=yes, current=yes, ok=yes
- mustNotHave:fighter_captured: baseline=no, current=no, ok=yes
- mustNotHave:ship_lost: baseline=no, current=no, ok=yes
- capture_escape (field=timeSinceCaptureStart): baseline=0.267, current=0.267, drift=0, withinTolerance=yes

## Read

- This correspondence report is about rule and state-transition behavior, not visual feel.
- A scenario can pass outcome checks while still needing later timing or presentation tuning.
- Expand this pattern next into richer rescue-return, hostile-captured-fighter, and Stage 4 capture-pressure correspondence.

