# Quality Conformance Score

This artifact rolls Aurora quality into ten evidence-backed categories. It is intended to expose where the biggest gaps still are, not to hide them behind a single average.

## Overall

- Overall score: 7.4/10
- Strongest category: combat-responsiveness (10/10)
- Weakest category: stage1-timing (2.1/10)

## Categories

### Player movement conformance
- Score: 6/10
- Evidence: player-movement report
- Read: Current movement scored 6/10 against the control-principles profile, versus 4.6/10 for the shipped local baseline.

### Shot and hit responsiveness
- Score: 10/10
- Evidence: close-shot-hit, movement fire window
- Read: Close-shot responsiveness passed, and movement-fire post-shot travel was 43.13, with shot delay 5ms.

### Stage-1 opening timing fidelity
- Score: 2.1/10
- Evidence: stage1-opening-first-dive report
- Read: 1/4 metrics were within tolerance; worst current delta was 8.338.

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
- Score: 4.2/10
- Evidence: challenge-stage correspondence
- Read: 1/5 challenge timing metrics were within tolerance; worst current delta was 3.938.

### Progression and persona depth
- Score: 8.8/10
- Evidence: persona-progression correspondence
- Read: 20/20 persona checks passed; progression ordering is still missing one ordering edge case.

### Audio identity and cue alignment
- Score: 4.4/10
- Evidence: aurora-audio-theme-comparison, galaga-audio-overlap
- Read: Audio score blends cue-identity similarity against the preserved Galaga-inspired reference mix with the overlap/timing windows captured in the audio-overlap analysis.

### UI, shell, and graphics integrity
- Score: 9.2/10
- Evidence: dev candidate surface suite
- Read: The bundled front-door, panel, dock, graphics, attract, leaderboard, and audio shell surface suite passed.

## Next release reading

- Stage-1 opening timing fidelity: 2.1/10
- Challenge-stage timing fidelity: 4.2/10
- Audio identity and cue alignment: 4.4/10

