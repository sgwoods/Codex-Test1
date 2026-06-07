#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { analyze } = require('./analyze-run');
const { writePortableSummary } = require('./summary-path-util');
const { ensureUsableVideoArtifact } = require('./video-artifact-util');
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

function stamp(){
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function fileMtime(file){
  return fs.statSync(file).mtimeMs;
}

function copyFile(src, dst){
  fs.copyFileSync(src, dst);
  return dst;
}

function loadSession(file){
  return JSON.parse(fs.readFileSync(file, 'utf8')).session;
}

function findPairs(srcDir){
  if(!fs.existsSync(srcDir)) return [];
  const entries = fs.readdirSync(srcDir);
  const sessions = new Map();
  for(const name of entries){
    let m = name.match(/^neo-galaga-session-(ngt-[\d-]+)\.json$/);
    if(m){
      const rec = sessions.get(m[1]) || {};
      rec.id = m[1];
      rec.sessionFile = path.join(srcDir, name);
      sessions.set(m[1], rec);
      continue;
    }
    m = name.match(/^neo-galaga-video-(ngt-[\d-]+)\.webm$/);
    if(m){
      const rec = sessions.get(m[1]) || {};
      rec.id = m[1];
      rec.videoFile = path.join(srcDir, name);
      sessions.set(m[1], rec);
    }
  }
  return [...sessions.values()].filter(r => r.sessionFile && r.videoFile).sort((a,b)=>{
    const am = Math.max(fileMtime(a.sessionFile), fileMtime(a.videoFile));
    const bm = Math.max(fileMtime(b.sessionFile), fileMtime(b.videoFile));
    return bm - am;
  });
}

function collectPairs(sourceDirs){
  const pairs = [];
  for(const sourceDir of sourceDirs){
    for(const pair of findPairs(sourceDir)){
      pairs.push(Object.assign({}, pair, { sourceDir }));
    }
  }
  return pairs.sort((a,b)=>{
    const am = Math.max(fileMtime(a.sessionFile), fileMtime(a.videoFile));
    const bm = Math.max(fileMtime(b.sessionFile), fileMtime(b.videoFile));
    return bm - am;
  });
}

function buildSummary(session, outDir, files, sourceDir, searchedSourceDirs){
  return {
    name: 'imported-self-play',
    source: sourceDir,
    importSource: {
      selectedSourceDir: sourceDir,
      searchedSourceDirs: searchedSourceDirs || [sourceDir]
    },
    importedAt: new Date().toISOString(),
    duration: +(session.duration || 0),
    config: {
      stage: session.snapshots?.[0]?.stage || 0,
      ships: session.snapshots?.[0]?.lives || 0,
      challenge: !!session.snapshots?.[0]?.challenge
    },
    seed: session.seed || 0,
    state: session.snapshots?.[session.snapshots.length-1] || null,
    files,
    analysis: null
  };
}

function importLatest(opts={}){
  const sourceDirs = resolveImportSourceDirs(opts.source);
  const outRoot = path.resolve(opts.out || path.join(process.cwd(), 'harness-artifacts'));
  const pairs = collectPairs(sourceDirs);
  if(!pairs.length){
    throw new Error(`No matching neo-galaga session/video pairs found in: ${sourceDirs.join(', ')}`);
  }
  const pair = opts.sessionId ? pairs.find(p => p.id === opts.sessionId) : pairs[0];
  if(!pair) throw new Error(`No matching pair found for session id ${opts.sessionId}`);

  const outDir = ensureDir(path.join(outRoot, `imported-${pair.id}-${stamp()}`));
  const sessionDst = copyFile(pair.sessionFile, path.join(outDir, path.basename(pair.sessionFile)));
  const videoDst = copyFile(pair.videoFile, path.join(outDir, path.basename(pair.videoFile)));
  const session = loadSession(sessionDst);
  const artifactQuality = ensureUsableVideoArtifact(videoDst, +(session.duration || 0));
  const files = [sessionDst, videoDst];
  if(artifactQuality.repaired && artifactQuality.file && !files.includes(artifactQuality.file)) files.unshift(artifactQuality.file);
  const summaryPath = path.join(outDir, 'summary.json');
  const summary = buildSummary(session, outDir, files, pair.sourceDir, sourceDirs);
  summary.artifactQuality = artifactQuality;
  writePortableSummary(summaryPath, summary);
  const analysis = analyze(outDir);
  const finalSummary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  return {
    outDir,
    pairId: pair.id,
    sourceDir: pair.sourceDir,
    searchedSourceDirs: sourceDirs,
    importSourcePolicy: describeImportSourcePolicy(),
    files: finalSummary.files,
    analysis: analysis,
    summary: finalSummary
  };
}

if(require.main === module){
  const args = parseArgs(process.argv.slice(2));
  if(args.help){
    console.log('Usage: node tools/harness/import-latest-run.js [--source /absolute/path] [--session-id ngt-...] [--out /absolute/path]');
    console.log('Default source search order:');
    for(const dir of describeImportSourcePolicy().defaultImportSourceDirs){
      console.log(`- ${dir}`);
    }
    process.exit(0);
  }
  const result = importLatest({ source: args.source, sessionId: args['session-id'], out: args.out });
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { collectPairs, importLatest, findPairs };
