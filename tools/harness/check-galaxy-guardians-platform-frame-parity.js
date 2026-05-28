#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'platform-frame-parity-0.1.json');
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const PLATFORM_SOURCE = path.join(ROOT, 'src', 'js', '03-platform-services.js');
const BOOT_SOURCE = path.join(ROOT, 'src', 'js', '00-boot.js');
const SUPABASE_SOURCE = path.join(ROOT, 'src', 'js', '05-supabase.js');
const LEADERBOARD_SOURCE = path.join(ROOT, 'src', 'js', '11-leaderboard-service.js');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function read(file){
  return fs.readFileSync(file, 'utf8');
}

function readJson(file){
  return JSON.parse(read(file));
}

function main(){
  const artifact = readJson(ARTIFACT);
  const pkg = readJson(PACKAGE_JSON);
  const scripts = pkg.scripts || {};
  const packSource = read(PACK_SOURCE);
  const platformSource = read(PLATFORM_SOURCE);
  const bootSource = read(BOOT_SOURCE);
  const supabaseSource = read(SUPABASE_SOURCE);
  const leaderboardSource = read(LEADERBOARD_SOURCE);
  const payload = {
    artifact: path.relative(ROOT, ARTIFACT),
    status: artifact.status
  };

  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Platform-frame parity artifact is not linked to the Guardians preview.', payload);
  }
  if(artifact.status !== 'shared-platform-frame-parity-contract'){
    fail('Platform-frame parity artifact has the wrong status.', payload);
  }

  const missingScripts = (artifact.requiredHarnessScripts || []).filter(name => !scripts[name]);
  if(missingScripts.length){
    fail('Platform-frame parity is missing required harness scripts.', { missingScripts, payload });
  }

  for(const fnName of artifact.requiredSharedCopyHelpers || []){
    if(!platformSource.includes(`function ${fnName}(`)){
      fail(`Platform-frame parity helper is missing: ${fnName}`, payload);
    }
  }

  const requiredCalls = [
    { source: bootSource, snippet: 'topScoreSavedLocallyPromptText(' },
    { source: supabaseSource, snippet: 'topScoreSigninPromptText(' },
    { source: leaderboardSource, snippet: 'remoteScoreFailureCopy(' }
  ];
  for(const requirement of requiredCalls){
    if(!requirement.source.includes(requirement.snippet)){
      fail(`Platform-frame parity source no longer uses required helper ${requirement.snippet}`, payload);
    }
  }

  for(const phrase of artifact.requiredPackPhrases || []){
    if(!packSource.includes(phrase)){
      fail(`Platform-frame parity pack source lost required phrase: ${phrase}`, payload);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    requiredHarnessScripts: artifact.requiredHarnessScripts,
    requiredSharedCopyHelpers: artifact.requiredSharedCopyHelpers,
    requiredPackPhrases: artifact.requiredPackPhrases
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}
