#!/usr/bin/env node
const { execFileSync } = require('child_process');
const {
  RELEASE_AUTHORITY_FILE,
  currentIdentity,
  readReleaseAuthority,
  machineIsAuthority,
  writeJson
} = require('../dev/machine-common');
const { ROOT } = require('./paths');

function git(args){
  return execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

function assertReleaseAuthority(action){
  const authority = readReleaseAuthority();
  if(!authority){
    throw new Error(`Release authority check failed: missing ${RELEASE_AUTHORITY_FILE}. Define the release authority before running ${action}.`);
  }
  const identity = currentIdentity();
  if(!machineIsAuthority(identity, authority)){
    throw new Error(
      `Release authority check failed for ${action}: current machine is "${identity.machine_id}" (${identity.machine_label}), ` +
      `but release authority belongs to "${authority.machine_id}" (${authority.machine_label}). ` +
      'Use "npm run release:show-authority" to inspect the current authority or hand it off intentionally.'
    );
  }
  return { authority, identity };
}

function assertReleaseMainCurrent(action){
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if(branch !== 'main'){
    throw new Error(`${action} must run from main. Current branch is "${branch}".`);
  }
  execFileSync('git', ['-C', ROOT, 'fetch', 'origin'], {
    stdio: ['ignore', 'ignore', 'ignore']
  });
  const head = git(['rev-parse', 'HEAD']);
  const originMain = git(['rev-parse', 'origin/main']);
  if(head !== originMain){
    throw new Error(`${action} requires local main to match origin/main. Local is ${head.slice(0, 7)} and origin/main is ${originMain.slice(0, 7)}.`);
  }
}

function writeReleaseAuthority(payload){
  writeJson(RELEASE_AUTHORITY_FILE, payload);
}

module.exports = {
  assertReleaseAuthority,
  assertReleaseMainCurrent,
  writeReleaseAuthority
};
