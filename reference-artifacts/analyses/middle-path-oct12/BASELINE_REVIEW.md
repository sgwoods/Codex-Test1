# Middle-Path Baseline Review

October 12, 2026. Baseline HEAD cf0e7a66 with accepted local changes.
Enemy source SHA256 1b442dfae869fe3f8a7cc39edaaa2d05860b3a7cdf33c5e796ebae13167ce532.
Bundle SHA256 9c320d50301a46f93f8f27bcc2f28af412b88043ba00e411f4a329c8585ef4fa.

## Rendered Evidence

The lead captured 24 canvas frames in Crown and Classic themes, using the same
normal-arrow side-column method as the preceding packet. Each first contact
has frames at offsets 0, 2 and 4. Full state, contact diagnostics, rendered ship
bounds and PNG hashes are in baseline-captures/report.json. No position was
assigned and no fire key was used. The controlled game clock is 60Hz; wall-clock
key timing is not fixed. These are visual diagnostic probes, not a perfect pilot.

The lead inspected Crown yellow-left target 725696614 at offset 4: the enemy
visibly overlaps the top of the ship. Crown green-right target 372665405 at
offset 4 also visibly touches/overlaps the ship. Classic green-left 261787956
at offset 4 is a glancing near-pass; this frame alone is not a clear pixel
intersection. Do not generalize every hitbox contact into a rendered overlap.

This distinction follows PROJECT_DIRECTION_REVIEW.md: nonlethal hitbox overlap
requires review, while visibly inappropriate passes through the ship are
defects. No lives are lost in these probes. The first two inspected examples
justify a bounded repair without imposing an unapproved lethal-collision rule.

The executable capture method remains at
private-artifacts/middle-path-oct12/capture-side-contacts.js. Its archived copy
must be run in that directory context for its relative harness import.

## Scope

The user approved measured middle-path and exit repair after the prior rejected
exit-only candidate. Preserve Stage 3, unaffected early paths, full entry,
normal shot witnesses, and result cadence. Separate numeric safety adaptation
from exact Galaga fidelity: original green evidence is qualitative; a complete
identified yellow survivor track is not currently available. Do not claim
reference-perfect geometry or all-level perfect feasibility.
