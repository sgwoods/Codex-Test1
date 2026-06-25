#!/usr/bin/env node
const { spawnSync } = require('child_process');
const { ROOT, DIST_DEV } = require('../build/paths');
const { privateReferenceAudioStatus } = require('../dev/private-reference-audio');
const { ensureLaneBuildFresh } = require('./browser-check-util');

const CHECKS = [
  {
    name: 'audio-theme-phases',
    args: ['tools/harness/check-audio-theme-phases.js']
  },
  {
    name: 'audio-cue-slots',
    args: ['tools/harness/check-audio-cue-slots.js']
  },
  {
    name: 'dev-graphics-options',
    args: ['tools/harness/check-dev-graphics-options.js']
  }
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function runCheck(check){
  const child = spawnSync(process.execPath, check.args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if(child.status !== 0 || child.error){
    fail(`local theme/audio readiness child check failed: ${check.name}`, {
      check: check.name,
      status: child.status,
      signal: child.signal || '',
      error: child.error ? String(child.error.message || child.error) : '',
      stdout: child.stdout || '',
      stderr: child.stderr || ''
    });
  }
  return {
    name: check.name,
    status: child.status,
    stdoutBytes: Buffer.byteLength(child.stdout || ''),
    stderrBytes: Buffer.byteLength(child.stderr || '')
  };
}

function summarizeAudio(status){
  return {
    ok: status.ok,
    issues: status.issues,
    next: status.next,
    requiredFiles: status.requiredFiles,
    distReferenceAudio: {
      ok: status.distReferenceAudio.ok,
      root: status.distReferenceAudio.root,
      isSymlink: status.distReferenceAudio.isSymlink,
      symlinkTarget: status.distReferenceAudio.symlinkTarget,
      resolvedPath: status.distReferenceAudio.resolvedPath,
      missing: status.distReferenceAudio.missing,
      mismatched: status.distReferenceAudio.mismatched
    },
    publicBoundary: {
      releaseChannel: status.publicBoundary.releaseChannel,
      publicArtifactBoundaryEnabled: status.publicBoundary.publicArtifactBoundaryEnabled,
      localhostReferenceAudioAvailable: status.publicBoundary.localhostReferenceAudioAvailable,
      hostedDevReferenceAudioAvailable: status.publicBoundary.hostedDevReferenceAudioAvailable,
      publicSafePrivateClipLeakPass: status.publicBoundary.publicSafePrivateClipLeakPass
    }
  };
}

function main(){
  let build;
  try{
    build = ensureLaneBuildFresh(DIST_DEV, { lane: 'dev', releaseChannel: 'development' });
  }catch(err){
    fail('failed to prepare a fresh dev build before local theme/audio readiness checks', {
      error: err && err.stack ? err.stack : String(err)
    });
  }

  const audioStatus = privateReferenceAudioStatus();
  if(!audioStatus.ok){
    fail('local Galaga reference audio is not ready for localhost theme inspection', summarizeAudio(audioStatus));
  }

  const checks = CHECKS.map(runCheck);
  console.log(JSON.stringify({
    ok: true,
    artifactType: 'local-theme-audio-readiness',
    generatedAt: new Date().toISOString(),
    build: {
      rebuilt: build.rebuilt,
      reason: build.reason,
      lane: 'dev',
      releaseChannel: build.buildInfo?.releaseChannel || '',
      version: build.buildInfo?.version || '',
      buildLabel: build.buildInfo?.buildLabel || '',
      commit: build.buildInfo?.commit || ''
    },
    audio: summarizeAudio(audioStatus),
    themeCoverage: {
      localReference: 'private reference clips are readable and hash-valid before browser theme checks run',
      galagaStyleSynth: 'dev graphics options covers the public-safe Galaga-style synth preset',
      auroraPublic: 'dev graphics options covers the Aurora public preset',
      cueRouting: 'audio theme phases and cue slots cover runtime cue resolution'
    },
    checks
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack ? err.stack : String(err));
}
