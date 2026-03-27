#!/usr/bin/env node
const fs = require('fs');
const { execFileSync } = require('child_process');
const {
  ROOT,
  DIST_PRODUCTION,
  DIST_BETA,
  PRODUCTION_BUILD_INFO,
  BETA_BUILD_INFO
} = require('./paths');

const REQUIRED_PRODUCTION = [
  'index.html',
  'release-dashboard.html',
  'project-guide.html',
  'build-info.json',
  'export.mov.png'
];

const REQUIRED_BETA = [
  'index.html',
  'release-dashboard.html',
  'project-guide.html',
  'build-info.json',
  'release-notes.json',
  'export.mov.png',
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

function git(args){
  const out = execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return typeof out === 'string' ? out.trim() : '';
}

function laneConfig(lane){
  if(lane === 'beta'){
    return {
      lane,
      dir: DIST_BETA,
      buildInfo: BETA_BUILD_INFO,
      required: REQUIRED_BETA,
      nextStep: 'Run "npm run build && npm run promote:beta" first.'
    };
  }
  if(lane === 'production'){
    return {
      lane,
      dir: DIST_PRODUCTION,
      buildInfo: PRODUCTION_BUILD_INFO,
      required: REQUIRED_PRODUCTION,
      nextStep: 'Run "npm run build && npm run promote:production" first.'
    };
  }
  throw new Error('Use --lane beta or --lane production.');
}

function loadJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function checkGitClean(){
  const status = git(['status', '--short']);
  if(status){
    throw new Error(`Publish preflight failed: repo is not clean.\n${status}\nCommit or stash changes before publishing.`);
  }
}

function checkArtifacts(cfg){
  if(!fs.existsSync(cfg.dir)){
    throw new Error(`Publish preflight failed: missing ${cfg.dir}. ${cfg.nextStep}`);
  }
  for(const file of cfg.required){
    const full = require('path').join(cfg.dir, file);
    if(!fs.existsSync(full)){
      throw new Error(`Publish preflight failed: missing ${full}. ${cfg.nextStep}`);
    }
  }
  if(!fs.existsSync(cfg.buildInfo)){
    throw new Error(`Publish preflight failed: missing ${cfg.buildInfo}. ${cfg.nextStep}`);
  }
}

function checkBuildInfo(cfg){
  const info = loadJson(cfg.buildInfo);
  const head = git(['rev-parse', 'HEAD']);
  if(info.dirty){
    throw new Error(`Publish preflight failed: ${cfg.buildInfo} is marked dirty. Rebuild from a clean tree first.`);
  }
  if(info.commit !== head){
    throw new Error(`Publish preflight failed: ${cfg.buildInfo} was built from ${info.shortCommit || info.commit}, but HEAD is ${head.slice(0, 7)}. ${cfg.nextStep}`);
  }
  return info;
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const cfg = laneConfig(String(args.lane || '').toLowerCase());
  checkGitClean();
  checkArtifacts(cfg);
  const info = checkBuildInfo(cfg);
  console.log(JSON.stringify({
    ok: true,
    lane: cfg.lane,
    dir: cfg.dir,
    label: info.label,
    commit: info.shortCommit || String(info.commit || '').slice(0, 7)
  }, null, 2));
}

if(require.main === module){
  try{
    main();
  } catch(err){
    console.error(err.message || err);
    process.exit(1);
  }
}

module.exports = {
  laneConfig,
  checkGitClean,
  checkArtifacts,
  checkBuildInfo
};
