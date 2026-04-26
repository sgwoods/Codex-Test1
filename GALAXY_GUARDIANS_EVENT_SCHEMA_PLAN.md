# Galaxy Guardians Event Schema Plan

Status: `first-playable-event-plan`

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

## Aurora Expansion Reuse

Aurora's level-by-level expansion should use the same event shape, replacing
the game-specific families as needed:

- challenge-stage entry and scoring events
- later-level entry variation events
- new alien-family dive events
- late-run cleanup or unfair-collapse events

This keeps Aurora expansion and second-game ingestion on one evidence grammar.
