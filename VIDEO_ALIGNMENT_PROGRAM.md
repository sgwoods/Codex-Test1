# Video Alignment Program

This program defines how preserved gameplay footage should be turned into durable analysis artifacts that Aurora can tune against.

The goal is not just to keep videos around. The goal is to extract structured evidence from them in forms that line up with Aurora's own runtime logs, timing libraries, and quality scorecards.

For future sibling games, this program feeds the broader ingestion process in:

- `CLASSIC_ARCADE_INGESTION_FRAMEWORK.md`

That framework describes how source discovery, manifests, event logs, semantic
models, correspondence targets, and harness plans should become a repeatable
way to build future Platinum game packs.

## Why This Matters

For the next fidelity cycle, preserved gameplay footage is most valuable when it gives us all of these together:

- labeled video windows
- aligned audio waveforms and spectrograms
- event timestamps that resemble Aurora harness logs
- extracted board/ship/enemy visuals for direct comparison
- committed summaries that survive beyond one analysis run

This is especially important for:

- movement conformance
- stage cadence
- audio identity and cue timing
- challenge-stage choreography
- boss and escort behavior
- future `Galaxian` / `Galaxy Guardians` scout-wave modeling
- reusable ingestion of later classic arcade variants

## Output Types We Want From Preserved Video

### 1. Reference Event Logs

Each important preserved gameplay window should be convertible into a log-like structure with:

- event id
- event family
- approximate timestamp
- source confidence
- notes

The target is not emulator-perfect reconstruction. The target is a stable reference log that can be compared with Aurora session logs.

Examples:

- `game_start`
- `formation_arrival`
- `stage_pulse`
- `enemy_dive_start`
- `enemy_lower_field`
- `challenge_transition`
- `challenge_results`
- `boss_hit`
- `boss_kill`
- `player_shot`
- `player_loss`

Where practical, these logs should also annotate:

- player movement intent
- firing actions
- visible lane corrections
- enemy group identity
- challenge / boss / capture state

That richer annotation is what will eventually let the same evidence support:

- more detailed personas
- persona-vs-player competition
- future learn-by-playing personas in simulation

### 2. Audio-Aligned Windows

Each important window should support:

- waveform plots
- spectrogram plots
- cue labels
- cue start and end timestamps
- overlap notes between cue families and visible gameplay events

This lets us reason about whether Aurora sounds are merely present or actually aligned to the same moments and phrase boundaries as the reference footage.

### 3. Visual Artifact Catalogs

Each window should also support reusable visual comparison artifacts such as:

- contact sheets
- extracted sprite crops
- board-state snapshots
- boss / escort / capture / challenge group examples
- player ship frames in movement windows

This should include labeled examples of:

- core alien families
- boss / escort combinations
- player ship movement states
- challenge / result presentation states

These should be tied to timestamps and notes so they can support both docs and future harness work.

## Reference-Analysis Workflow

For a new preserved gameplay source:

1. identify the specific gameplay window to analyze
2. generate a contact sheet or frame series
3. extract an audio window and waveform/spectrogram if audio matters
4. create a reference event log for the window
5. record the visual artifacts worth reusing
6. connect the resulting evidence to:
   - a reference profile
   - a correspondence check
   - a scorecard category
   - a release or fidelity note

## Priority Windows To Build Next

### Movement Windows

Use stage-opening reference footage to extract:

- tap correction
- hold travel
- reversal
- movement while firing

This is the next highest-priority trace family because movement tuning already showed that constant-only iteration is not enough.

### Stage Cadence Windows

Continue building windows for:

- opening sequence
- formation arrival
- convoy pulse cadence
- first dive commitment

These already map cleanly into the timing library and quality scorecard.

### Challenge Windows

Expand challenge-stage windows with:

- intro title timing
- target-group arrival
- scoreable upper-band phase
- results and perfect transitions

### Boss / Escort Windows

Create richer windows for:

- escort composition
- flagship attack setups
- boss hit timing
- boss death visibility and cue sync

## Relationship To Aurora Logs

Aurora already produces rich harness session logs. The new goal is to create reference-side logs with similar concepts, so we can compare:

- reference video event sequence
- Aurora runtime event sequence
- reference cue placement
- Aurora cue placement
- reference visual moment
- Aurora visual moment

This does not require exact parity of every field. It requires enough shared event families to make comparisons durable.

## Working Rule

For any new high-value preserved video analysis, try to produce all three:

1. a reference event log
2. audio-aligned artifacts where audio is relevant
3. visual comparison artifacts

If only one is practical in the first pass, record what is missing and why.
