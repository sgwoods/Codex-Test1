#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  ROOT,
  DIST_DEV,
  DIST_PRODUCTION,
  DIST_BETA,
  DEV_BUILD_INFO,
  PRODUCTION_BUILD_INFO,
  BETA_BUILD_INFO
} = require('./paths');
const {
  laneConfig: preflightLaneConfig,
  checkGitClean,
  checkSourceDocs,
  checkArtifacts,
  checkBuildInfo
} = require('./check-publish-ready');

const OWNER = process.env.AURORA_PUBLIC_OWNER || 'sgwoods';
const REPO = process.env.AURORA_PUBLIC_REPO || 'Aurora-Galactica';
const DEFAULT_BRANCH = process.env.AURORA_PUBLIC_BRANCH || 'main';

const DEV_FILES = [
  'index.html',
  'release-dashboard.html',
  'project-guide.html',
  'application-guide.html',
  'platinum-guide.html',
  'player-guide.html',
  'build-info.json',
  'release-notes.json',
  'export.mov.png',
  'assets/platinum-platform-mark.png',
  'assets/galaxy-guardians-coming-soon.png',
  'assets/galaxy-guardians-coming-soon.svg'
];

const PRODUCTION_FILES = [
  'index.html',
  'release-dashboard.html',
  'project-guide.html',
  'application-guide.html',
  'platinum-guide.html',
  'player-guide.html',
  'build-info.json',
  'release-notes.json',
  'README.md',
  'export.mov.png',
  'assets/platinum-platform-mark.png',
  'assets/galaxy-guardians-coming-soon.png',
  'assets/galaxy-guardians-coming-soon.svg'
];

const BETA_FILES = [
  'index.html',
  'release-dashboard.html',
  'project-guide.html',
  'application-guide.html',
  'platinum-guide.html',
  'player-guide.html',
  'build-info.json',
  'release-notes.json',
  'export.mov.png',
  'assets/platinum-platform-mark.png',
  'assets/galaxy-guardians-coming-soon.png',
  'assets/galaxy-guardians-coming-soon.svg',
  'README.md',
  'README.txt'
];

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')){
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function run(cmd, args, options = {}){
  const result = execFileSync(cmd, args, {
    cwd: options.cwd || ROOT,
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe']
  });
  return typeof result === 'string' ? result.trim() : '';
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function removeEntry(target){
  fs.rmSync(target, { recursive: true, force: true });
}

function copyFile(src, dest){
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function loadJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function laneConfig(lane){
  if(lane === 'dev'){
    return {
      lane,
      sourceDir: DIST_DEV,
      buildInfo: DEV_BUILD_INFO,
      targetDir: 'dev',
      files: DEV_FILES,
      rootFiles: ['.github/workflows/pages.yml'],
      commitPrefix: 'Update dev lane from local build'
    };
  }
  if(lane === 'beta'){
    return {
      lane,
      sourceDir: DIST_BETA,
      buildInfo: BETA_BUILD_INFO,
      targetDir: 'beta',
      files: BETA_FILES,
      rootFiles: ['.github/workflows/pages.yml'],
      commitPrefix: 'Update beta lane from dev build'
    };
  }
  if(lane === 'production'){
    return {
      lane,
      sourceDir: DIST_PRODUCTION,
      buildInfo: PRODUCTION_BUILD_INFO,
      targetDir: '.',
      files: PRODUCTION_FILES,
      rootFiles: ['.github/workflows/pages.yml'],
      commitPrefix: 'Update production lane from dev build'
    };
  }
  throw new Error(`Unsupported lane "${lane}". Use --lane dev, --lane beta, or --lane production.`);
}

function stageArtifacts(repoDir, cfg){
  const targetBase = path.join(repoDir, cfg.targetDir);
  ensureDir(targetBase);
  for(const file of cfg.files){
    const src = path.join(cfg.sourceDir, file);
    const dest = path.join(targetBase, file);
    removeEntry(dest);
    copyFile(src, dest);
  }
  for(const file of cfg.rootFiles || []){
    const src = path.join(ROOT, file);
    const dest = path.join(repoDir, file);
    removeEntry(dest);
    copyFile(src, dest);
  }
}

function gitStatus(repoDir){
  return run('git', ['-C', repoDir, 'status', '--short']);
}

function currentBuildShort(cfg){
  const info = loadJson(cfg.buildInfo);
  return info.shortCommit || 'unknown';
}

function stagedPaths(cfg){
  const paths = cfg.files.map(file => cfg.targetDir === '.' ? file : path.join(cfg.targetDir, file));
  for(const file of cfg.rootFiles || []) paths.push(file);
  return paths;
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const lane = String(args.lane || '').toLowerCase();
  const dryRun = !!args['dry-run'];
  const keepTemp = !!args['keep-temp'];
  const cfg = laneConfig(lane);
  const preflightCfg = preflightLaneConfig(lane);
  checkGitClean();
  checkSourceDocs();
  checkArtifacts(preflightCfg);
  checkBuildInfo(preflightCfg);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), `aurora-${lane}-publish-`));
  const repoDir = path.join(tempRoot, 'public');
  const branch = String(args.branch || DEFAULT_BRANCH);
  const repoRef = `${OWNER}/${REPO}`;

  try{
    run('gh', ['repo', 'clone', repoRef, repoDir], { stdio: ['ignore', 'inherit', 'inherit'] });
    stageArtifacts(repoDir, cfg);
    const status = gitStatus(repoDir);
    if(!status){
      console.log(JSON.stringify({
        ok: true,
        changed: false,
        lane,
        repo: repoRef,
        branch,
        repoDir
      }, null, 2));
      return;
    }

    const short = currentBuildShort(cfg);
    const message = `${cfg.commitPrefix} ${short}`;
    run('git', ['-C', repoDir, 'add', '-f', ...stagedPaths(cfg)], { stdio: ['ignore', 'inherit', 'inherit'] });
    run('git', ['-C', repoDir, 'commit', '-m', message], { stdio: ['ignore', 'inherit', 'inherit'] });
    if(!dryRun){
      run('git', ['-C', repoDir, 'push', 'origin', branch], { stdio: ['ignore', 'inherit', 'inherit'] });
    }
    console.log(JSON.stringify({
      ok: true,
      changed: true,
      lane,
      repo: repoRef,
      branch,
      dryRun,
      repoDir,
      commitMessage: message
    }, null, 2));
  } finally {
    if(!keepTemp){
      removeEntry(tempRoot);
    }
  }
}

try{
  main();
} catch(err){
  console.error(err.message || err);
  process.exit(1);
}
