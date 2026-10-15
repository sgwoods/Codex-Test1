#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const source = path.join(ROOT, 'private-artifacts/repo-mirror/reference-artifacts/analyses/challenge-visibility-oct03/challenge-all2.mp4');
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sourceSha256 = hash(source);
assert.equal(sourceSha256, '8d29ea711d09d243a2904bf9538981d97fe1fa323e4f920177688fa2b4c4c840');
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: ROOT }).trim();
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'frame=best_effort_timestamp_time', '-of', 'json', source],
  { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }));
const frames = probe.frames.map((frame, sourceFrameIndex) => ({ sourceFrameIndex, ptsSeconds: Number(frame.best_effort_timestamp_time) }));
assert(frames.every((frame, i) => Number.isFinite(frame.ptsSeconds) && (!i || frame.ptsSeconds > frames[i - 1].ptsSeconds)));
const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`;
const privateOut = path.join(ROOT, 'private-artifacts/repo-mirror/reference-artifacts/analyses/reference-wave-previews', id);
const publicOut = path.join(ROOT, 'reference-artifacts/analyses/reference-wave-previews', id);
fs.mkdirSync(privateOut, { recursive: true });
fs.mkdirSync(publicOut, { recursive: true });
const sheets = [];
for(let start = 240; start < 260; start += 4){
  const end = start + 4;
  const selected = frames.filter(frame => frame.ptsSeconds >= start && frame.ptsSeconds < end && frame.sourceFrameIndex % 6 === 0);
  assert.equal(selected.length, 20);
  const file = path.join(privateOut, `${start}-${end}.png`);
  const filter = `select='gte(t,${start})*lt(t,${end})*not(mod(n,6))',scale=480:360,tile=5x4`;
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', source, '-vf', filter, '-frames:v', '1', file]);
  sheets.push({ start, end, file: path.relative(ROOT, file), sha256: hash(file), filter,
    columns: 5, rows: 4, tiles: selected.map((frame, tileIndex) => ({ tileIndex, ...frame })) });
}
const manifest = { commit, source: path.relative(ROOT, source), sourceSha256, methodHash: hash(__filename), sheets,
  limitations: ['Row-major native-frame previews at 0.2-second spacing, not complete motion.',
    'No verified game edition, wave identity or complete exit annotation implied.',
    'Source pixels remain in ignored private storage; public metadata records hashes and actual native PTS.'] };
fs.writeFileSync(path.join(publicOut, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ publicOut, privateOut, sheets: sheets.length }));
