const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function fail(message, payload){
  const err = new Error(message);
  err.payload = payload;
  throw err;
}

function ffprobeJson(file){
  const probe = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=index,codec_name,codec_type,duration,start_time',
    '-of', 'json',
    file
  ], {
    encoding: 'utf8',
    timeout: 30000
  });
  if(probe.status !== 0){
    fail('ffprobe failed', {
      file,
      stdout: probe.stdout,
      stderr: probe.stderr,
      status: probe.status,
      signal: probe.signal
    });
  }
  return {
    data: JSON.parse(probe.stdout || '{}'),
    stderr: (probe.stderr || '').trim()
  };
}

function assessVideoArtifact(file, expectedDuration=0){
  const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
  const { data, stderr } = ffprobeJson(file);
  const streams = Array.isArray(data.streams) ? data.streams : [];
  const videoStreams = streams.filter(s => s.codec_type === 'video');
  const formatDuration = +(data.format?.duration || 0);
  const drift = expectedDuration > 0 && formatDuration > 0 ? Math.abs(formatDuration - expectedDuration) : 0;
  const issues = [];
  if(!videoStreams.length) issues.push('no_video_stream');
  if(!(formatDuration > 0)) issues.push('missing_duration');
  if(expectedDuration > 0 && formatDuration > 0 && drift > 5) issues.push('duration_drift');
  if(size < 100 * 1024 && expectedDuration > 10) issues.push('tiny_for_duration');
  if(stderr) issues.push('ffprobe_stderr');
  return {
    file,
    size,
    expectedDuration,
    formatDuration,
    drift,
    videoStreams,
    stderr,
    issues,
    ok: !issues.length
  };
}

function repairedPathFor(file){
  const ext = path.extname(file);
  const base = file.slice(0, file.length - ext.length);
  return `${base}.review.mkv`;
}

function repairVideoArtifact(file){
  const out = repairedPathFor(file);
  const res = spawnSync('ffmpeg', [
    '-y',
    '-v', 'error',
    '-fflags', '+genpts',
    '-i', file,
    '-map', '0:v:0',
    '-c', 'copy',
    out
  ], {
    encoding: 'utf8',
    timeout: 120000
  });
  if(res.status !== 0){
    fail('ffmpeg repair failed', {
      file,
      out,
      stdout: res.stdout,
      stderr: res.stderr,
      status: res.status,
      signal: res.signal
    });
  }
  return out;
}

function ensureUsableVideoArtifact(file, expectedDuration=0){
  const initial = assessVideoArtifact(file, expectedDuration);
  if(initial.ok) return initial;
  const repairedFile = repairVideoArtifact(file);
  const repaired = assessVideoArtifact(repairedFile, expectedDuration);
  return Object.assign({}, repaired, {
    sourceFile: file,
    repaired: true,
    initialIssues: initial.issues,
    initialSize: initial.size,
    initialFormatDuration: initial.formatDuration
  });
}

module.exports = {
  assessVideoArtifact,
  ensureUsableVideoArtifact,
  repairedPathFor
};
