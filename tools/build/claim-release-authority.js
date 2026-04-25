#!/usr/bin/env node
const { execFileSync } = require('child_process');
const { ROOT } = require('./paths');
const { parseArgs, currentIdentity, readReleaseAuthority } = require('../dev/machine-common');
const { writeReleaseAuthority } = require('./release-authority');

function git(args){
  return execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

function gitStatus(){
  return git(['status', '--short']);
}

function gitUser(){
  return git(['config', 'user.name']) || process.env.USER || 'unknown';
}

function main(){
  if(gitStatus()){
    throw new Error('release:claim-authority requires a clean repo. Commit or stash current changes first.');
  }
  const args = parseArgs(process.argv.slice(2));
  const identity = currentIdentity();
  const authority = {
    machine_id: args['machine-id'] || identity.machine_id,
    machine_label: args.label || identity.machine_label,
    claimed_by: gitUser(),
    claimed_at: new Date().toISOString(),
    notes: args.notes || `Release authority claimed for ${args.label || identity.machine_label}.`
  };
  const existing = readReleaseAuthority();
  writeReleaseAuthority(authority);
  const changed = JSON.stringify(existing) !== JSON.stringify(authority);
  if(changed){
    execFileSync('git', ['-C', ROOT, 'add', 'release-authority.json'], { stdio: 'inherit' });
    execFileSync('git', ['-C', ROOT, 'commit', '-m', `Claim Aurora release authority for ${authority.machine_label}`], { stdio: 'inherit' });
  }
  console.log(JSON.stringify({
    ok: true,
    changed,
    release_authority: authority,
    next: changed
      ? ['git push origin main']
      : ['npm run release:show-authority']
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
}
