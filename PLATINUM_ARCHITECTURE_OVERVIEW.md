# Platinum Architectural Overview

This document is the maintained short visual overview of how `Platinum` relates
to the applications it hosts.

Use it for the fast answer to:

- what Platinum is
- what Platinum owns
- what applications own
- where the current migration stands

For the canonical full platform guide, use:

- `<user-home>/Documents/Codex-Test1/PLATINUM.md`

## Diagram

```mermaid
flowchart TB
    subgraph "Platinum Platform"
        P1["Cabinet Shell and Layout\n- marquee\n- side rails\n- build stamp\n- popup framing"]
        P2["Runtime and Input\n- boot path\n- active pack selection\n- pause and wait mode\n- fullscreen and scaling"]
        P3["Shared Services\n- auth and session adapters\n- leaderboard policy\n- feedback transport\n- replay plumbing"]
        P4["Platform Harnesses\n- pack boot proof\n- shell and popup checks\n- dock button checks\n- lane and publish checks"]
        P5["Shared Contracts\n- gamePack\n- shell themes\n- entity contract\n- content surfaces"]
    end

    subgraph "Aurora Galactica Application"
        A1["Application Identity\n- title\n- front-door copy\n- shell accents\n- stage branding"]
        A2["Gameplay Rules\n- formations\n- stage flow\n- challenge cadence\n- scoring"]
        A3["Aurora Mechanics\n- capture and rescue\n- dual fighter\n- boss and escort behavior\n- challenge-stage motion"]
        A4["Aurora Assets and Content\n- sprites\n- audio identity\n- stage text\n- game-owned polish"]
        A5["Aurora Harnesses\n- challenge profile\n- capture lifecycle\n- scoring and outcome checks"]
    end

    subgraph "Other Applications"
        G1["Galaxy Guardians\n- hosted playable preview\n- owned runtime and rules"]
        G2["Other Future Packs\n- their own rules\n- their own content\n- their own harnesses"]
    end

    P5 --> A1
    P5 --> A2
    P5 --> A3
    P5 --> A4
    P5 --> G1
    P5 --> G2

    P1 --> A1
    P2 --> A2
    P3 --> A5
    P4 --> A5

    G1 -. hosted by .-> P2
    G2 -. hosted by .-> P2
```

## Current Read

Today the architecture is in this state:

- `Platinum` is real and visible in the shipped product
- `Aurora Galactica` is the first playable application on Platinum
- `Galaxy Guardians` has a hosted playable-preview runtime with an owned
  gameplay adapter, not merely a sibling shell. It remains preview status;
  public adapter registration and Rival parity are not enabled.
- hosted docs now need to describe the platform separately from the applications it hosts

## Boundary Principle

Applications do not share game-specific implementation directly. If Aurora,
Galaxy Guardians, or a future pack needs common behavior, that behavior should
move into Platinum as an explicit API, interface, capability, service, contract,
or harness helper. Game-owned rules, scoring, movement, visual identity, sound
cues, and event vocabulary stay with the owning application.

## Related Docs

- canonical platform guide:
  - `<user-home>/Documents/Codex-Test1/PLATINUM.md`
- application-layer guide:
  - `<user-home>/Documents/Codex-Test1/APPLICATIONS_ON_PLATINUM.md`
- game boundary audit:
  - `<user-home>/Documents/Codex-Test1/PLATINUM_GAME_BOUNDARY_AUDIT.md`
- repo technical map:
  - `<user-home>/Documents/Codex-Test1/ARCHITECTURE.md`
- release and testing discipline:
  - `<user-home>/Documents/Codex-Test1/TESTING_AND_RELEASE_GATES.md`
- launch art direction:
  - `<user-home>/Documents/Codex-Test1/PLATINUM_LAUNCH_ART_DIRECTION.md`
- forward-looking review:
  - `<user-home>/Documents/Codex-Test1/PLATINUM_LUECK_REVIEW.md`
