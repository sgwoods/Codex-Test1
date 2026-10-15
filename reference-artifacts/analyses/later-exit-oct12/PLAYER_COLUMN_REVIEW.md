# Player Column Review

October 12, 2026. Lead baseline HEAD cf0e7a66, with existing local changes.
Enemy source SHA256: 1b442dfae869fe3f8a7cc39edaaa2d05860b3a7cdf33c5e796ebae13167ce532.
Development bundle SHA256: 9c320d50301a46f93f8f27bcc2f28af412b88043ba00e411f4a329c8585ef4fa.

## Finding

The earlier zero-contact result for Stage 31 is a stationary centre-column
result. It is not an all-player-position guarantee. Normal arrow-key movement
to side columns reproduces additional nonlethal contacts. No target or player
position was assigned by the probe. No fire input was sent.

| Stage | Left settled X | Contacts | Right settled X | Contacts |
| --- | --- | --- | --- | --- |
| 31 | 52.17 | 3 | 256.73 | 1 |
| 35 | 52.17 | 4 | 256.73 | 1 |
| 39 | 52.17 | 6 | 256.73 | 1 |

Stage 31 left contacts begin at 10.283s and 14.433s in the middle phase,
then 14.983s in the exit. Its right contact begins at 10.267s in the middle.
Stages 35 and 39 have middle-phase left contacts at 7.017s and 7.550s,
and a right contact at 7.533s. Their remaining sampled left contacts are exits.
Contact events explicitly report nonLethal=1. All six runs complete.

This confirms a limitation of the proposed exit-only repair. Preserving every
pre-exit sample necessarily preserves those middle-phase contacts. An exit
candidate may improve a bounded defect, but cannot close the whole beta
contact gate. Do not claim that a stationary centre run proves row-wide safety.

## Method And Limits

Executable method and full raw events/diagnostics are retained with this packet.
The probe starts a seeded human challenge, holds one arrow until reaching the
requested column, releases it, and permits normal deceleration. Each game step
is 1/60s. Wall-clock key timing is not fixed, so compare recorded settled X
rather than assuming an identical named input on another machine.
Seeds are 9100 + stage. This is one seed and two reachable side columns per
stage, not an exhaustive human trajectory, visual pixel, or perfect-route test.
The contacts are executable collision events, not a claim of lost ships.

## Decision

Finish the one isolated candidate and preserve its result. Do not expand it
silently into middle-path tuning. Before beta acceptance, cover reachable ship
columns and resolve the inherited middle-path contacts in one bounded path
envelope/configuration packet. Reusing Stage 31 alone cannot solve them, since
Stage 31 also reproduces the defect. Preserve the accepted Stage 3 keepers.
