# Private Evidence Recovery

Archive ID: sanitized-delivery-oct14.
The project lead holds the provisioned archive under the preservation checkout's
ignored private-artifacts/sanitized-delivery-oct14 directory. Its originals folder
contains content-addressed gzip files. That checkout is not this temporary
delivery worktree. The archive and unsanitized preservation branch remain local;
off-machine/private backup has NOT been verified. Do not describe them as cloud
archived or available to a fresh public clone.

Copy the complete private archive directory through an approved private transfer
when changing machines. It includes archive-index.json, prepare.js, identity-key.bin
and originals/. Do not commit or publicly upload that directory. The private key
preserves consistent synthetic identities if the sanitation is reproduced.

Set AURORA_PRIVATE_ARCHIVE_ROOT to that provisioned directory. For an archived
report, verify without restoring any file:

```sh
node reference-artifacts/analyses/sanitized-delivery-oct14/recover-private-evidence.js <archive-manifest-report.json>
```

An optional second argument names a new private output file. Existing files are
never overwritten. The helper checks the compressed size/hash and the original
size/hash. The default verification writes nothing. Never replace a public
archive pointer with the recovered raw report in a delivery commit.

The three archive pointers retain their historical report.json paths. They are
typed private-evidence-archive-manifest and explicitly not measurement reports.
Use each pointer's findingsPath for a compact curated summary, or retrieve the
original for detailed analysis. Samples and trajectories omitted from summaries
were not rerun or deleted from the private original. Do not supply archive
pointers or summaries to a generic metric collector as executed gate reports.

manifest.json lists every transformation with separate original/delivery hashes
and archive metadata. Metadata-redacted JSON keeps gameplay measurements but
removes configured account arrays and substitutes keyed synthetic identities for
other email strings. Documents use logical workspace/home/volume roots. The
original source, bundle and method identities remain historical, not identities
of newly executed tests. The prepare.js hash identifies the private transformation
method; reconstruction also requires the original preservation source and key.
