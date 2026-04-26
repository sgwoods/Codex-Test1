# Galaxy Guardians Event Schema Plan

Status: `runtime-aliased-event-plan`

The first playable preview uses the shared Platinum/Aurora event substrate, but
the event vocabulary below belongs to `Galaxy Guardians`.

## First Slice Events

| Event | Purpose | First Harness Use |
| --- | --- | --- |
| `game_start` | pack boot and session start | verify `gameKey` is `galaxy-guardians-preview` |
| `wave_setup` | settled rack or rack reset | compare against opening promoted windows |
| `player_move` | horizontal Galaxip movement | future movement envelope conformance |
| `player_shot` | one-shot cadence | one-shot preview harness |
| `regular_dive_start` | first active enemy pressure family | dive lifecycle harness |
| `enemy_projectile` | enemy shot pressure | projectile bound harness |
| `enemy_hit` | player shot hit result | scoring placeholder harness |
| `player_hit` | ship-loss path | later lifecycle harness |
| `wave_clear` | wave completion/reset | reset harness |

## Event Promotion Path

1. Start from generated promoted-window scaffolds under
   `reference-artifacts/analyses/galaxian-reference/nenriki-15-wave-session/promoted-windows/*/events/reference-events.json`.
2. Promote only visually confirmed events to `events-observed`.
3. Add exact timestamps and confidence labels.
4. Turn promoted events into harness correspondence targets.

## Runtime Alias Map

The first implementation keeps the shared fixed-screen event stream intact and
adds Galaxy Guardians semantic aliases when the active pack is
`galaxy-guardians-preview`.

| Shared Runtime Event | Galaxy Guardians Alias |
| --- | --- |
| `stage_spawn` | `wave_setup` |
| `enemy_attack_start` | `regular_dive_start` |
| `enemy_bullet_fired` | `enemy_projectile` |
| `enemy_killed` / `enemy_damaged` | `enemy_hit` |
| `ship_lost` | `player_hit` |
| `stage_clear` | `wave_clear` |

`game_start`, `player_move`, and `player_shot` are already logged directly as
semantic events.

Harness:

```sh
npm run harness:check:galaxy-guardians-event-log
```

## Aurora Expansion Reuse

Aurora's level-by-level expansion should use the same event shape, replacing
the game-specific families as needed:

- challenge-stage entry and scoring events
- later-level entry variation events
- new alien-family dive events
- late-run cleanup or unfair-collapse events

This keeps Aurora expansion and second-game ingestion on one evidence grammar.
