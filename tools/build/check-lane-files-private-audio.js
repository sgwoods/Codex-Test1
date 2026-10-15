#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { assetFilesForDist, devFiles, betaFiles, productionFiles } = require('./lane-files');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-private-audio-test-'));
const privateFiles = ['assets/reference-audio/cue.m4a', 'assets/reference-audio/nested/cue.m4a'];
const publicFiles = ['assets/public-tone.m4a', 'assets/icons/player.png', 'assets/reference-audio-public/keep.txt'];
try{
  for(const file of [...privateFiles, ...publicFiles]){
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), 'fixture');
  }
  for(const enumerate of [assetFilesForDist, devFiles, betaFiles, productionFiles]){
    const files = enumerate(root);
    for(const file of privateFiles) assert(!files.includes(file), `${enumerate.name} includes ${file}`);
    for(const file of publicFiles) assert(files.includes(file), `${enumerate.name} omits ${file}`);
  }
  for(const file of privateFiles) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), 'fixture');
  console.log('PASS: all public lane manifests exclude private audio and preserve public assets/local bytes');
}finally{
  fs.rmSync(root, { recursive: true, force: true });
}
