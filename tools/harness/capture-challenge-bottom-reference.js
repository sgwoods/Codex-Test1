#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { execFileSync } = require('child_process');
const { createHash } = require('crypto');

const ROOT = path.resolve(__dirname, '../..');
const SOURCE = path.join(ROOT, 'private-artifacts/repo-mirror/reference-artifacts/analyses/challenge-visibility-oct03/challenge-all2.mp4');
const EXPECTED_HASH = '8d29ea711d09d243a2904bf9538981d97fe1fa323e4f920177688fa2b4c4c840';
const WINDOWS = [{ id: 'lower-left', start: 245.5, end: 247.5 }, { id: 'lower-right', start: 249, end: 251 }];
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function main(){
  assert.equal(hash(SOURCE), EXPECTED_HASH, 'Primary source must match persisted provenance');
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate:frame=best_effort_timestamp_time',
    '-of', 'json', SOURCE], { maxBuffer: 20 * 1024 * 1024, encoding: 'utf8' }));
  const frames = probe.frames.map((f, index) => ({ sourceFrameIndex: index, ptsSeconds: Number(f.best_effort_timestamp_time) }));
  assert(frames.every(f => Number.isFinite(f.ptsSeconds)));
  assert(frames.every((f, i) => !i || f.ptsSeconds > frames[i - 1].ptsSeconds), 'Decoded PTS must be strictly increasing');
  const out = path.join(ROOT, 'reference-artifacts/analyses/challenge-bottom-reference',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`);
  fs.mkdirSync(out, { recursive: true });
  const windows = [];
  for(const window of WINDOWS){
    const dir = path.join(out, window.id);
    fs.mkdirSync(dir);
    const selected = frames.filter(f => f.ptsSeconds >= window.start && f.ptsSeconds < window.end);
    assert(selected.length > 0);
    // Select decoded PTS directly; do not resample or infer frame identity from FPS.
    const filter = `select='gte(t,${window.start})*lt(t,${window.end})'`;
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', SOURCE,
      '-vf', filter, '-fps_mode', 'passthrough', '-frames:v', String(selected.length),
      path.join(dir, 'frame-%05d.png')], { stdio: 'pipe' });
    const files = fs.readdirSync(dir).filter(f => /^frame-\d{5}\.png$/.test(f)).sort();
    assert.equal(files.length, selected.length, 'Decoded frame and artifact counts must match');
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', SOURCE,
      '-vf', `${filter},select='not(mod(n,5))',scale=384:288,tile=4x3`,
      '-frames:v', '1', path.join(out, `${window.id}-sheet.jpg`)], { stdio: 'pipe' });
    windows.push({ ...window, filter, frames: selected.map((f, i) => ({ ...f,
      file: `${window.id}/${files[i]}`, sha256: hash(path.join(dir, files[i])) })),
      contactSheet: `${window.id}-sheet.jpg`, contactSheetStride: 5 });
  }
  const manifest = { generatedAt: new Date().toISOString(), commit, methodHash: hash(__filename),
    source: path.relative(ROOT, SOURCE), sourceSha256: EXPECTED_HASH,
    primaryManifest: 'reference-artifacts/analyses/galaga-challenge-video-reference/latest.json',
    stream: probe.streams[0], windows,
    limitations: ['Native PTS and pixel artifacts establish frame identity, not object identity or conformance.',
      'Active shooting may remove aliens before full trajectories; these windows cannot prove universal stationary-player clearance.',
      'Contact sheets sample every fifth native frame; label full native frames for overlap judgments.'] };
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ out, windows: windows.map(w => ({ id: w.id, frames: w.frames.length,
    firstPTS: w.frames[0].ptsSeconds, lastPTS: w.frames.at(-1).ptsSeconds })) }, null, 2));
}
try{ main(); }catch(err){ console.error(err); process.exitCode = 1; }
