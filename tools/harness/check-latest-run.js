#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { importLatest, collectPairs } = require('./import-latest-run');
const { describeImportSourcePolicy, resolveImportSourceDirs } = require('./artifact-source-policy');

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

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function readJson(file, fallback=null){
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function writeJson(file, data){
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function summarize(result){
  const a = result.analysis || {};
  const challenge = (a.challengeClears || [])[0] || null;
  const artifactQuality = result.summary?.artifactQuality || null;
  const artifactWarning = artifactQuality && !artifactQuality.ok
    ? 'Video artifact quality deviated from expected. File an immediate bug and repair/remux before using this run for synchronized review.'
    : null;
  return {
    status: 'imported',
    pairId: result.pairId,
    outDir: result.outDir,
    duration: a.duration || 0,
    score: result.summary?.state?.score || 0,
    stage: result.summary?.state?.stage || 0,
    lives: result.summary?.state?.lives || 0,
    videoAudio: !!a.video?.audio,
    challenge: challenge ? { stage: challenge.stage, hits: challenge.hits, total: challenge.total } : null,
    shipLosses: (a.shipLost || []).length,
    lifeLosses: (a.lifeLost || []).length,
    postHitPause: a.postHitPauseMetrics || null,
    artifactQuality,
    artifactWarning
  };
}

function checkLatest(opts={}){
  const sourceDirs = resolveImportSourceDirs(opts.source);
  const outRoot = path.resolve(opts.out || path.join(process.cwd(), 'harness-artifacts'));
  const stateFile = path.join(ensureDir(outRoot), '.latest-import-state.json');
  const state = readJson(stateFile, {}) || {};
  const pairs = collectPairs(sourceDirs);
  if(!pairs.length){
    return {
      status: 'none',
      searchedSourceDirs: sourceDirs,
      importSourcePolicy: describeImportSourcePolicy(),
      message: `No matching neo-galaga run pair found in: ${sourceDirs.join(', ')}`
    };
  }
  const latest = opts.sessionId ? pairs.find(p => p.id === opts.sessionId) : pairs[0];
  if(!latest){
    return { status: 'missing', message: `No matching pair found for session id ${opts.sessionId}` };
  }
  if(!opts.force && state.lastImportedId === latest.id && state.lastImportedSource === latest.sourceDir){
    return {
      status: 'unchanged',
      pairId: latest.id,
      sourceDir: latest.sourceDir,
      searchedSourceDirs: sourceDirs,
      outDir: state.lastOutDir || null,
      importSourcePolicy: describeImportSourcePolicy(),
      message: `Latest run ${latest.id} is already imported`
    };
  }
  const result = importLatest({ source: latest.sourceDir, sessionId: latest.id, out: outRoot });
  writeJson(stateFile, {
    lastImportedId: result.pairId,
    lastImportedSource: result.sourceDir,
    lastOutDir: result.outDir,
    updatedAt: new Date().toISOString()
  });
  return Object.assign(summarize(result), {
    sourceDir: result.sourceDir,
    searchedSourceDirs: sourceDirs,
    importSourcePolicy: describeImportSourcePolicy()
  });
}

if(require.main === module){
  const args = parseArgs(process.argv.slice(2));
  if(args.help){
    console.log('Usage: node tools/harness/check-latest-run.js [--source /absolute/path] [--out /absolute/path] [--session-id ngt-...] [--force]');
    console.log('Default source search order:');
    for(const dir of describeImportSourcePolicy().defaultImportSourceDirs){
      console.log(`- ${dir}`);
    }
    process.exit(0);
  }
  console.log(JSON.stringify(checkLatest({
    source: args.source,
    out: args.out,
    sessionId: args['session-id'],
    force: !!args.force
  }), null, 2));
}

module.exports = { checkLatest };
