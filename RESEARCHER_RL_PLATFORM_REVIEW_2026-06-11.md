# Researcher RL Platform Review

Date: 2026-06-11
Perspective: outside RL / agent-systems researcher
Status: planning input, not release authority

## Purpose

This note preserves an outsider research perspective on the Aurora / Platinum
project so future planning can reuse the observation rather than rediscover it
from chat.

The review looks at the project through a reinforcement-learning and agentic
systems lens, especially the Karpathy-style loop of concrete examples,
evaluator improvement, small candidate changes, rollouts, failure study, and
systematic feedback into the next iteration.

Relevant outside anchors:

- Andrej Karpathy, "Deep Reinforcement Learning: Pong from Pixels"
  - https://karpathy.github.io/2016/05/31/rl/
- Andrej Karpathy, "Software 2.0"
  - https://karpathy.medium.com/software-2-0-a64152b37c35

## Executive Read

The project is already halfway to the platform it wants to become.

The strongest idea is not "AI made a game." The stronger claim is:

- reference evidence becomes structured game truth
- structured truth becomes runtime behavior
- harnesses decide what survives
- release claims are backed by durable artifacts

That is the right foundation for a platform that can ingest gameplay video,
extract standardized descriptions of play, generate conformant game variants,
train or generate game players, and eventually support smart antagonist agents.

The next major step is to make the existing evidence and runtime discipline
more executable: define a stable gameplay intermediate representation and wrap
at least one game as a proper RL-style environment.

## What Has Been Done Well

### Layer Separation

The project already separates Platinum, game applications, ingestion,
harness/conformance, and release economics. This is the right abstraction for a
multi-game platform. Platinum should own reusable host capabilities. Games
should own rules, scoring, audiovisual identity, and conformance truth.
Reference artifacts should remain evidence, not hidden application code.

### Evidence-First Ingestion

The ingestion framework has the right components:

- source manifests
- preserved clips and windows
- contact sheets, waveforms, spectrograms, and motion traces
- reference-side event logs
- semantic slice profiles
- metric and scorer definitions
- runtime correspondence targets
- candidate implementation and harness plans

This is close to a source-to-game-pack compiler pipeline. The missing piece is
formal schema and execution tooling, not a new philosophy.

### Candidate-To-Keeper Discipline

The long-cycle keeper process is a strong research habit. It asks for reference
windows, extracted artifacts, stable evaluators, candidate sweeps, before/after
evidence, score/economics updates, and an explicit next gap.

That is exactly how to avoid the main failure mode of AI-assisted game work:
plausible-looking changes with no durable evidence that they improved the
system.

### Galaxy Guardians As An RL Seed

Galaxy Guardians is the cleanest seed for RL and agent work because it already
has:

- a game-owned runtime
- a seeded RNG
- an explicit event vocabulary
- compact player action inputs
- role/scoring/audio/visual catalogs
- deterministic persona policies
- offline VM-based simulation for longer-surface review

This is very close to a Gym-like environment, even though it is not yet exposed
through a standard `reset / step / observe / reward / done / info` interface.

### Harness And Metric Culture

The repo has a broad harness suite and an unusual amount of conformance
accounting. The best part is that stricter scorers are allowed to lower scores
when they expose truer gaps. That is important. A platform that trains agents
or generates games will otherwise learn to exploit weak metrics.

## Main Gaps

### No Formal Gameplay Environment Contract

The project has runtime state, scenarios, event logs, summaries, and persona
inputs. It does not yet have a versioned environment contract with:

- `reset(seed, config)`
- `step(action)`
- `observe(mode)`
- `reward(eventWindow)`
- `done`
- `info`

Without this, learned players, generated players, smart enemy directors, and
game variants will remain tied to browser globals or one-off harness scripts.

### Agents Are Still Mostly Scripted Heuristics

The persona layer is useful, but it is not yet learned. The current agents are
hand-authored behavior policies that provide deterministic review pressure.
That is a good baseline, but the next platform leap is to use those personas as
training data, curriculum baselines, and comparison policies.

### Enemy Intelligence Is Not Yet A Policy Surface

Alien behavior is still mostly runtime logic. Dive source selection, enemy-shot
source selection, escort joins, pressure timing, fairness deferral, and stage
rank scaling are decision points that should become an injectable
`EnemyDirectorPolicy`.

Smart antagonists should be constrained policies, not arbitrary difficulty
spikes. They should optimize pressure, spectacle, and conformance while being
penalized for unfair collisions, unreadable clutter, and broken reference
identity.

### Standardized Formats Are Implied, Not Finished

The docs describe event logs, semantic models, correspondence targets, and
harness generation. The project now needs concrete schemas that can be reused
across Aurora, Galaxy Guardians, Windigo Invaders, and later games.

### Metrics Need Holdout Discipline

The project already understands scorer resolution and confidence. The next
risk is overfitting to its own candidate gates. Generated players and generated
games should be evaluated against:

- training evidence
- holdout reference windows
- human-review bundles
- cross-persona stress tests
- conformance and anti-exploit guardrails

## Recommended Platform Direction

### Define A Platinum Gameplay IR

Create a small versioned schema family:

- `SourceManifest`
- `ReferenceWindow`
- `EventLog`
- `SemanticSlice`
- `RuntimeSpec`
- `ObservationSpec`
- `ActionSpec`
- `RewardSpec`
- `AgentSpec`
- `EnemyDirectorSpec`
- `VariationSpec`
- `ConformanceSpec`

The goal is not to model every future game perfectly. The goal is to make the
first two or three games share a durable execution vocabulary.

### Wrap Galaxy Guardians As The First Environment

Start with Galaxy Guardians because it is already isolated enough. Build a
Node-side environment wrapper around the existing VM simulation:

- `createEnv({ gameKey, seed, runtimeSpec })`
- `env.reset()`
- `env.step({ left, right, fire })`
- `env.observe("compact")`
- `env.observe("events")`
- `env.observe("pixels")` later, when useful
- `env.close()`

Use compact structured observations first. Pixel learning can come later once
the structured environment is stable.

### Build A Trajectory Dataset

Every human, persona, watch, rival, and learned-policy run should be exportable
as standardized trajectory data:

- observation
- action
- reward components
- emitted events
- score delta
- deaths and clears
- conformance labels
- confidence and source lineage

This becomes the project's Software 2.0 source material for generated players.

### Train Baseline Game Players

The first learned players should be modest:

1. behavior cloning from existing scripted personas
2. simple policy-gradient or PPO on compact observations
3. curriculum over stage bands and challenge windows
4. evaluation against score, survival, routeability, and conformance safety

Do not begin with raw pixels unless the goal is specifically to reproduce
Karpathy's Pong experiment. Structured observations will produce more useful
platform learning earlier.

### Add Smart Antagonist Policies

Introduce an `EnemyDirectorPolicy` interface. It can initially control:

- scout dive source
- flagship dive source
- escort join choice
- enemy shot source
- pressure deferral
- stage-rank pacing

Evaluate it against novice, intermediate, expert, professional, and learned
players. Reward should include pressure and score threat, but penalties should
protect fairness, visual readability, routeability, and reference identity.

### Generate Variations Through Specs

Game variations should come from `RuntimeSpec` and `SemanticSlice` mutations,
not ad hoc code edits.

Examples:

- altered rack composition
- new enemy role ratios
- different dive grammar
- shifted scoring table
- alternate pressure curve
- themed audio/visual catalogs
- challenge-stage movement families

Every variation should be classified by automated review:

- conformant homage
- safe variant
- interesting but low-confidence
- unfair
- broken
- too far from reference

### Use Models As Proposal Engines

Models should propose schemas, semantic slices, reward terms, motion grammar
candidates, policy architectures, and interpretation notes. Local CPU/browser
harnesses should do the repeated judging.

The best long-term pattern is:

model proposes -> environment rolls out -> scorer evaluates -> artifact
persists -> human reviews important deltas -> accepted changes become runtime
or schema keepers.

## Suggested Next Work Blocks

### Block 1: Gameplay IR Planning

Create `PLATINUM_GAMEPLAY_IR.md` and `reference-artifacts/schemas/gameplay-ir/`
with draft schemas for events, observations, actions, rewards, agents,
variations, and conformance specs.

Success condition:

- one Galaxy Guardians run can be described by the schema without losing key
  runtime information.

### Block 2: Guardians Environment Wrapper

Extract a small Node-facing `GalaxyGuardiansEnv` from the existing VM harness.

Success condition:

- a script can run 1,000 seeded compact-observation episodes without a browser
  and write standard trajectory summaries.

### Block 3: Persona-To-Policy Dataset

Convert existing deterministic personas into a training/evaluation dataset.

Success condition:

- novice, advanced, expert, and professional trajectories are saved in the same
  schema and can be replayed or scored by a shared evaluator.

### Block 4: First Learned Player Baseline

Train or prototype a small player policy against compact observations.

Success condition:

- the learned player beats novice survival or score on held-out seeds without
  violating conformance/safety guardrails.

### Block 5: Enemy Director Interface

Replace hard-coded Guardians pressure choices with a default
`EnemyDirectorPolicy` that reproduces current behavior.

Success condition:

- the default policy is behavior-preserving, and an experimental policy can be
  evaluated without editing core runtime code.

### Block 6: Variation Generator

Create a spec-level variation sampler for Guardians opening-slice parameters.

Success condition:

- sampled variations are scored and classified automatically, with at least one
  safe variant and at least one rejected variant documented.

## Planning Implication

Aurora challenge-stage conformance, Guardians first-class promotion, Watch/Rival
mode, generated players, smart aliens, and future game ingestion should not be
treated as separate projects. They are all expressions of the same platform
need:

- standardized evidence
- standardized runtime specs
- standardized environment stepping
- standardized trajectories
- standardized evaluator outputs

The next high-leverage planning move is to make that standard explicit and use
Galaxy Guardians as the first executable proof.
