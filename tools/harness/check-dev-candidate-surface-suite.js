#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');

const CHECKS = [
  {
    id: 'front-door-copy',
    description: 'Front-door shell copy and startup framing',
    script: 'check-front-door-copy-surface.js'
  },
  {
    id: 'popup-surfaces',
    description: 'Help, settings, leaderboard, account, and feedback panels',
    script: 'check-popup-surfaces.js'
  },
  {
    id: 'dock-buttons',
    description: 'Dock buttons and toggle actions',
    script: 'check-dock-button-actions.js'
  },
  {
    id: 'pilot-records-panel',
    description: 'Pilot records and account replay panel surface',
    script: 'check-pilot-records-panel.js'
  },
  {
    id: 'wait-score-overlay',
    description: 'Wait-mode score overlay surface',
    script: 'check-wait-score-overlay.js'
  },
  {
    id: 'leaderboard-build-date-filter',
    description: 'Leaderboard build/date trust context and filtering',
    script: 'check-leaderboard-build-date-filter.js'
  },
  {
    id: 'dev-graphics-options',
    description: 'Graphics options and visible rendering controls',
    script: 'check-dev-graphics-options.js'
  },
  {
    id: 'attract-score-cycle',
    description: 'Attract/wait score cycling surface',
    script: 'check-attract-score-cycle.js'
  },
  {
    id: 'audio-theme-phases',
    description: 'Audio theme selection by phase',
    script: 'check-audio-theme-phases.js'
  },
  {
    id: 'audio-cue-slots',
    description: 'Audio cue slot consistency',
    script: 'check-audio-cue-slots.js'
  }
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function runCheck(spec){
  const scriptPath = path.join(__dirname, spec.script);
  const run = spawnSync(process.execPath, [scriptPath], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 180000,
    maxBuffer: 1024 * 1024 * 20
  });
  const result = {
    id: spec.id,
    description: spec.description,
    script: spec.script,
    ok: run.status === 0,
    status: run.status,
    signal: run.signal,
    stdout: run.stdout ? run.stdout.trim() : '',
    stderr: run.stderr ? run.stderr.trim() : ''
  };
  if(!result.ok){
    fail('dev candidate surface suite failed', result);
  }
  return result;
}

const results = CHECKS.map(runCheck);

console.log(JSON.stringify({
  ok: true,
  checks: results.map(result => ({
    id: result.id,
    description: result.description,
    script: result.script
  }))
}, null, 2));
