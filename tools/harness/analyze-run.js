#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function parseArgs(argv){
  const args = {};
  for(let i=0;i<argv.length;i++){
    const a = argv[i];
    if(!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i+1];
    if(!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function counts(events){
  const out = {};
  for(const e of events) out[e.type] = (out[e.type] || 0) + 1;
  return out;
}

function hasAudio(video){
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', video], { encoding: 'utf8' });
  if(probe.status !== 0) return { ok: false, error: probe.stderr.trim() || 'ffprobe failed' };
  const streams = probe.stdout.trim().split(/\s+/).filter(Boolean);
  return { ok: true, streams, audio: streams.includes('audio') };
}

function findRunFiles(target){
  const stat = fs.statSync(target);
  if(stat.isFile() && target.endsWith('.json')){
    const session = JSON.parse(fs.readFileSync(target, 'utf8')).session;
    return { dir: path.dirname(target), sessionFile: target, session };
  }
  const files = fs.readdirSync(target);
  const summary = files.includes('summary.json') ? path.join(target, 'summary.json') : null;
  const sessionFile = files.find(f => /^neo-galaga-session-.*\.json$/.test(f));
  const videoFile = files.find(f => /^neo-galaga-video-.*\.webm$/.test(f));
  return {
    dir: target,
    summaryFile: summary,
    sessionFile: sessionFile ? path.join(target, sessionFile) : null,
    videoFile: videoFile ? path.join(target, videoFile) : null,
    session: sessionFile ? JSON.parse(fs.readFileSync(path.join(target, sessionFile), 'utf8')).session : null
  };
}

function analyze(target){
  const run = findRunFiles(path.resolve(target));
  if(!run.session) throw new Error('No session JSON found to analyze.');
  if(!run.videoFile){
    const found = fs.readdirSync(run.dir).find(f => /^neo-galaga-video-.*\.webm$/.test(f));
    if(found) run.videoFile = path.join(run.dir, found);
  }
  const session = run.session;
  const eventCounts = counts(session.events || []);
  const stageClears = (session.events || []).filter(e => e.type === 'stage_clear').map(e => ({ t: e.t, stage: e.stage, score: e.score }));
  const challengeClears = (session.events || []).filter(e => e.type === 'challenge_clear').map(e => ({ t: e.t, stage: e.stage, hits: e.hits, total: e.total }));
  const shipLost = (session.events || []).filter(e => e.type === 'ship_lost').map(e => ({ t: e.t, stage: e.stage, score: e.score, livesBefore: e.livesBefore }));
  const audio = run.videoFile ? hasAudio(run.videoFile) : { ok: false, audio: false, error: 'no video file found' };
  const analysis = {
    id: session.id,
    seed: session.seed || 0,
    duration: session.duration,
    eventCounts,
    stageClears,
    challengeClears,
    shipLost,
    video: Object.assign({ file: run.videoFile || null }, audio)
  };
  if(run.summaryFile){
    const summary = JSON.parse(fs.readFileSync(run.summaryFile, 'utf8'));
    summary.analysis = analysis;
    fs.writeFileSync(run.summaryFile, JSON.stringify(summary, null, 2));
  }
  return analysis;
}

if(require.main === module){
  const args = parseArgs(process.argv.slice(2));
  const target = args.run || args.session || args.dir;
  if(args.help || !target){
    console.log('Usage: node tools/harness/analyze-run.js --run /absolute/path/to/run-dir');
    process.exit(args.help ? 0 : 1);
  }
  console.log(JSON.stringify(analyze(target), null, 2));
}

module.exports = { analyze };
