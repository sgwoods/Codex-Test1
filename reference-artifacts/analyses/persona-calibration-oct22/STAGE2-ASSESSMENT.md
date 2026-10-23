# Stage 2 Assessment

October 22, 2026. No accepted runtime change, commit, push or publication.
HEAD bacb0c58. Retained controller SHA256
`a27c906faec56611e3295e3cc06edff59d869de70c8cf4c5cb6f6c709c0e6dfd`.

## Result

Reject the isolated Stage2 candidate. Preserve the capture/rescue keeper.
Candidate53d1de9d changes Professional normal Stage2 deadZone5->7 and enables
the current two-frame observed-motion hazard resolver in Stage2. It changes
neither enemies nor weapon/scoring rules. Acceptance was saved before testing.

| Seed | Expert score/kills/losses | Candidate score/kills/losses |
| --- | --- | --- |
|51101|2930 /34 /1|4190 /31 /0|
|51201|4250 /38 /0|4570 /37 /0|
|51301|5080 /28 /0|1890 /27 /0|

The unchanged short criterion fails. No full-game or reserved fresh-seed panel
was run for this rejected candidate. No threshold was changed. Localhost never
served it. The candidate's motion-cache fixtures pass8; that is not acceptance.

## Complete-Stage Measurement

A separate90-second diagnostic starts at Stage2 with three ships. Values below
stop at Stage2 clear, before Stage3. These are not900-second distribution data.
Both retained policies clear all40 enemies on each seed.

| Seed | Expert score /clear time | Retained Professional score /clear time |
| --- | --- | --- |
|51101|3560 /21.400s|3960 /19.133s|
|51201|4570 /17.417s|3840 /21.250s|
|51301|6260 /26.267s|6430 /22.033s|

Retained Professional loses no ships and has no captures in these three Stage2
segments. Expert has one destruction on51101; on51301 it has one capture plus
one destruction. Neither loses a ship on51201.

Rejected candidate51301 clears in28.167s for4230points, with no losses/captures.
It remains worse than the retained policy beyond the original16-second window.
The rejection is not simply an arbitrary cutoff effect.

Independent review found that3000 of the3190-point short51301 Expert/candidate
gap comes from two attacking-boss awards(1600,400) and destroying a captured
fighter(1000). Neither short run rescues a fighter. Thus destruction counts alone
miss capture costs, and raw score alone does not measure fighter preservation.

## Decision And Next Action

No new player-facing gain was accepted in this cycle. The gain is diagnostic:
the remaining retained51201 defect is730points and3.833seconds at Stage2 clear,
not merely a16-second score-window difference. Next reconstruct its firing and
target decisions around the high-value attacks. Test one narrowly scoped repair
only after identifying a missed opportunity. Preserve the existing matched
full-game acceptance and capture accounting.

Read-only reward audit identifies650points of the730-point gap at boss689324395.
Expert kills it attacking at5.733s for800; Professional kills it in formation
at15.400s for150, with no recorded attack for that boss. Expert/Professional
shots58/59 are nearly equal. Boss rewards total1500/850, butterflies1920/1840,
bees1150/1150. The policies change attack schedules, so this does not prove an
equivalent800-point opportunity was ignored. Next capture the3.8-5.8s schedule
divergence, target rankings, bullet poses and attack-selection RNG consumption.
Do not raise boss priority from this correlation alone.

The standalone Stage2-throughput check is not invoked by release preflight or
beta publication checks. It remains an explicitly adopted product hold. Passing
a publish command would not close it. No waiver or gate redesign occurred here.

Other beta work remains: live signed-in save/reload/separate-session checks for
both games; recovery/login and final audio acceptance; clean reviewed checkpoint;
authorized hostedDEV review; exact frozen-beta package checks and approval.

## Verification And Provenance

- Retained79mode-parity and13rescue/lifecycle fixtures pass again.
- git diff --check passes.
- Served localhost8000 HTML exactly matches dist/dev and embeds retained source.
  HTML SHA25626700ead3aa357ebab6eaf3a245e262fd8e2b17467d855867a7f4b91d58f99ba.
  Build1210,development1.4.1.5,bacb0c58.dirty. Frozen beta remains unchanged.
- Independent policy review and release-wiring audit completed read-only.
- stage2/ contains compact results, candidate/baseline source, frozen acceptance,
  method snapshots and checksum provenance. Method snapshots are provenance,
  not standalone runnable copies without their original input directories.
- Primary sessions and frozen HTML are losslessly archived privately at
  private-artifacts/persistent/stage2-oct22; recovery checks pass. Off-machine
  backup remains unverified. Public summaries omit local session-file paths.
- Versioned900-second score history remains13panels/250runs. Short diagnostics
  are deliberately not appended as comparable persona performance versions.
