const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');

const [manifestFile, outputFile] = process.argv.slice(2);
assert(manifestFile, 'Supply an archive report.json manifest and optional new output filename');
assert(process.env.AURORA_PRIVATE_ARCHIVE_ROOT, 'Set AURORA_PRIVATE_ARCHIVE_ROOT to the provisioned private archive directory');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
assert.equal(manifest.artifactType, 'private-evidence-archive-manifest');
assert.equal(manifest.isMeasurementReport, false);
const archive = manifest.archive;
const root = path.resolve(process.env.AURORA_PRIVATE_ARCHIVE_ROOT);
const stored = path.resolve(root, archive.relativePath);
assert(stored.startsWith(root + path.sep), 'Archive path escapes the configured root');
assert.equal(archive.compression, 'gzip');
assert(Number.isSafeInteger(archive.originalBytes) && archive.originalBytes > 0 && archive.originalBytes <= 256 * 1024 * 1024);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const compressed = fs.readFileSync(stored);
assert.equal(compressed.length, archive.compressedBytes);
assert.equal(hash(compressed), archive.compressedSha256);
const original = zlib.gunzipSync(compressed, { maxOutputLength: archive.originalBytes + 1 });
assert.equal(original.length, archive.originalBytes);
assert.equal(hash(original), archive.originalSha256);
if (outputFile) fs.writeFileSync(outputFile, original, { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify({ verified: true, originalSha256: archive.originalSha256,
  originalBytes: original.length, restored: Boolean(outputFile) }));
