# Quality Conformance Score

This artifact rolls Aurora quality into ten evidence-backed categories. It is intended to expose where the biggest gaps still are, not to hide them behind a single average.

## Overall

- Overall score: 8.3/10
- Strongest category: combat-responsiveness (10/10)
- Weakest category: stage1-timing (5.6/10)

## Categories

### Player movement conformance
- Score: 5.9/10
- Evidence: player-movement report
- Read: Current movement scored 5.9/10 against the control-principles profile, versus 4.6/10 for the shipped local baseline.

### Shot and hit responsiveness
- Score: 10/10
- Evidence: close-shot-hit, movement fire window
- Read: Close-shot responsiveness passed, and movement-fire post-shot travel was 49.61, with shot delay 16ms.

### Stage-1 opening timing fidelity
- Score: 5.6/10
- Evidence: stage1-opening-first-dive report
- Read: 3/4 metrics were within tolerance; worst current delta was 5.5.

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
- Score: 8.4/10
- Evidence: challenge-stage correspondence
- Read: 5/5 challenge timing metrics were within tolerance; worst current delta was 0.483.

### Progression and persona depth
- Score: 8.8/10
- Evidence: persona-progression correspondence
- Read: 20/20 persona checks passed; progression ordering is still missing one ordering edge case.

### Audio identity and cue alignment
- Score: 5.6/10
- Evidence: audio-cue-alignment correspondence, aurora-audio-theme-comparison, galaga-audio-overlap
- Read: Audio score blends cue identity with measured cue timing. The dedicated cue-alignment report passed 9/9 metrics, with worst current delta 6.317.

### UI, shell, and graphics integrity
- Score: 9.2/10
- Evidence: dev candidate surface suite
- Read: The bundled front-door, panel, dock, graphics, attract, leaderboard, and audio shell surface suite passed.

## Next release reading

- Stage-1 opening timing fidelity: 5.6/10
- Audio identity and cue alignment: 5.6/10
- Player movement conformance: 5.9/10

