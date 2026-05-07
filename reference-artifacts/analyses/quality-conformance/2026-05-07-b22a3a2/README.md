# Quality Conformance Score

This artifact rolls Aurora quality into eleven evidence-backed categories. It is intended to expose where the biggest gaps still are, not to hide them behind a single average.

## Overall

- Overall score: 9.1/10
- Strongest category: movement (10/10)
- Weakest category: audio (6.3/10)

## Categories

### Player movement conformance
- Score: 10/10
- Evidence: player-movement report
- Read: Current movement scored 10/10 against the control-principles profile, versus 10/10 for the shipped local baseline.

### Shot and hit responsiveness
- Score: 10/10
- Evidence: close-shot-hit, movement fire window
- Read: Close-shot responsiveness passed, and movement-fire post-shot travel was 56.53, with shot delay 12ms.

### Stage-1 opening timing fidelity
- Score: 8.5/10
- Evidence: stage1-opening-first-dive report
- Read: 4/4 metrics were within tolerance; worst current delta was 0.18.

### Stage-1 opening geometry fidelity
- Score: 10/10
- Evidence: stage1-opening-spacing report
- Read: Geometry held steady with 0 changed targets and max drift 0.

### Dive fairness and safety
- Score: 9.1/10
- Evidence: persona-stage2-safety
- Read: Shared stage-2 safety seeds passed, which keeps the early dive/collision windows within the intended persona guardrail.

### Capture and rescue rule fidelity
- Score: 10/10
- Evidence: capture-rescue correspondence
- Read: 3/3 capture scenarios matched, with worst tracked-time drift 0.004.

### Challenge-stage timing fidelity
- Score: 9.9/10
- Evidence: challenge-stage correspondence
- Read: 5/5 challenge timing metrics were within tolerance; worst current delta was 0.483.

### Progression and persona depth
- Score: 8.8/10
- Evidence: persona-progression correspondence
- Read: 20/20 persona checks passed; progression ordering is still missing one ordering edge case.

### Level arc and encounter shape
- Score: 7.9/10
- Evidence: level-arc-conformance report, level-expansion cycle evidence
- Read: Level arc score is 7.9/10 with 6/6 stage families blueprinted and 4/6 evidence windows present; weakest submetric is Pressure curve over time (7/10).

### Audio identity and cue alignment
- Score: 6.3/10
- Evidence: audio-cue-alignment correspondence, aurora-audio-theme-comparison, galaga-audio-overlap
- Read: Audio score blends cue identity, active reference similarity, reference-window precision, overlap timing, and cue alignment. 7/14 reference windows still need tighter segmentation; 22 candidate subwindows were found; active Aurora-vs-reference duration delta averages 3.236s.

### UI, shell, and graphics integrity
- Score: 9.2/10
- Evidence: dev candidate surface suite
- Read: The bundled front-door, panel, dock, graphics, attract, leaderboard, and audio shell surface suite passed.

## Next release reading

- Audio identity and cue alignment: 6.3/10
- Level arc and encounter shape: 7.9/10
- Stage-1 opening timing fidelity: 8.5/10
