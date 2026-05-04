#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'formation-entry-0.1.json');
const SOURCES = [
  'src/js/13-galaxy-guardians-game-pack.js',
  'src/js/13-galaxy-guardians-gameplay-adapter.js',
  'src/js/13-galaxy-guardians-runtime.js'
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function inBand(value, band){
  return value >= band[0] && value <= band[1];
}

function loadRuntime(){
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for(const relPath of SOURCES){
    vm.runInContext(fs.readFileSync(path.join(ROOT, relPath), 'utf8'), sandbox, {
      filename: path.join(ROOT, relPath)
    });
  }
  vm.runInContext(`
    this.GALAXY_GUARDIANS_PACK = GALAXY_GUARDIANS_PACK;
    this.GALAXY_GUARDIANS_RUNTIME_PROFILE = GALAXY_GUARDIANS_RUNTIME_PROFILE;
    this.createGalaxyGuardiansRuntimeState = createGalaxyGuardiansRuntimeState;
    this.stepGalaxyGuardiansRuntime = stepGalaxyGuardiansRuntime;
    this.resetGalaxyGuardiansWave = resetGalaxyGuardiansWave;
    this.summarizeGalaxyGuardiansRuntime = summarizeGalaxyGuardiansRuntime;
  `, sandbox);
  return sandbox;
}

function main(){
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const runtime = loadRuntime();
  const rules = runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE.rules;
  const state = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
  const firstScout = state.aliens.find(alien => alien.role === 'scout');
  const firstScoutStart = { x: firstScout.x, y: firstScout.y, rackX: firstScout.rackX, rackY: firstScout.rackY };
  const samples = [];

  const frameCount = Math.ceil((rules.firstScoutDiveDelay + .35) * 60);
  for(let i = 0; i < frameCount; i++){
    runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
    if([12, 44, 78, 132, Math.ceil(rules.firstScoutDiveDelay * 60)].includes(i)){
      const summary = runtime.summarizeGalaxyGuardiansRuntime(state);
      const scout = state.aliens.find(alien => alien.id === firstScout.id);
      samples.push({
        t: +state.t.toFixed(3),
        enteringCount: summary.enteringCount,
        entrySettled: summary.entrySettled,
        entryComplete: summary.entryComplete,
        scout: { x: +scout.x.toFixed(2), y: +scout.y.toFixed(2), mode: scout.mode }
      });
    }
  }

  const summary = runtime.summarizeGalaxyGuardiansRuntime(state);
  const settle = state.events.find(event => event.type === 'formation_entry_settle');
  const complete = state.events.find(event => event.type === 'formation_rack_complete');
  const firstDive = state.events.find(event => event.type === 'alien_dive_start');
  const resetState = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1980 });
  for(let i = 0; i < 180; i++) runtime.stepGalaxyGuardiansRuntime(resetState, 1 / 60, {});
  runtime.resetGalaxyGuardiansWave(resetState, 'harness_reset_entry');
  const resetStartedAt = resetState.t;
  for(let i = 0; i < 80; i++) runtime.stepGalaxyGuardiansRuntime(resetState, 1 / 60, {});
  const resetSettle = resetState.events.filter(event => event.type === 'formation_entry_settle').at(-1);
  const resetComplete = resetState.events.filter(event => event.type === 'formation_rack_complete').at(-1);
  const result = {
    artifact: path.relative(ROOT, ARTIFACT),
    artifactStatus: artifact.status,
    rules: {
      formationEntrySettleAtSeconds: rules.formationEntrySettleAt,
      formationEntryCompleteAtSeconds: rules.formationEntryCompleteAt,
      formationEntryTravelYPx: rules.formationEntryTravelY,
      formationEntrySideSpreadPx: rules.formationEntrySideSpread,
      formationEntryRowLagSeconds: rules.formationEntryRowLag,
      firstScoutDiveDelaySeconds: rules.firstScoutDiveDelay
    },
    events: {
      start: state.events.find(event => event.type === 'formation_entry_start'),
      settle,
      complete,
      firstDive
    },
    firstScoutStart,
    samples,
    resetEntry: {
      startedAt: +resetStartedAt.toFixed(3),
      settleT: resetSettle?.t,
      completeT: resetComplete?.t,
      settleDelta: resetSettle ? +(resetSettle.t - resetStartedAt).toFixed(3) : null,
      completeDelta: resetComplete ? +(resetComplete.t - resetStartedAt).toFixed(3) : null
    },
    summary
  };

  if(artifact.gameKey !== runtime.GALAXY_GUARDIANS_PACK.metadata.gameKey){
    fail('Formation-entry artifact is not linked to the Galaxy Guardians pack', result);
  }
  for(const [key, expected] of Object.entries(artifact.runtimeRules)){
    if(key === 'diveMayStartOnlyAfterRackComplete') continue;
    const runtimeKey = key.replace('Seconds', '').replace('Px', '');
    const actual = result.rules[key] ?? rules[runtimeKey];
    if(Math.abs((+actual || 0) - (+expected || 0)) > .0001){
      fail(`Formation-entry runtime rule ${key} drifted from the artifact`, result);
    }
  }
  if(result.events.start?.t !== 0){
    fail('Formation-entry start must be emitted at runtime creation', result);
  }
  if(!settle || !inBand(settle.t, artifact.conformanceBands.formationEntrySettleAtSeconds)){
    fail('Formation-entry settle event drifted outside the artifact band', result);
  }
  if(!complete || !inBand(complete.t, artifact.conformanceBands.formationRackCompleteAtSeconds)){
    fail('Formation rack-complete event drifted outside the artifact band', result);
  }
  if(!firstDive || firstDive.t <= complete.t){
    fail('First scout dive started before the rack completed', result);
  }
  if(!inBand(firstDive.t - complete.t, artifact.conformanceBands.firstScoutDiveAfterRackCompleteDeltaSeconds)){
    fail('First scout dive delta after rack completion drifted outside the artifact band', result);
  }
  if(firstScoutStart.y >= firstScoutStart.rackY || firstScoutStart.x === firstScoutStart.rackX){
    fail('Formation-entry did not start the sampled scout off its final rack position', result);
  }
  if(samples[0].enteringCount !== artifact.conformanceBands.enteringAlienCountAtStart){
    fail('Formation-entry did not begin with all aliens in entering mode', result);
  }
  if(summary.enteringCount !== artifact.conformanceBands.enteringAlienCountAfterComplete || !summary.entryComplete){
    fail('Formation-entry did not settle all aliens into rack mode', result);
  }
  if(!resetSettle || !inBand(resetSettle.t - resetStartedAt, artifact.conformanceBands.formationEntrySettleAtSeconds)){
    fail('Formation-entry reset settle timing is not relative to the wave reset start', result);
  }
  if(!resetComplete || !inBand(resetComplete.t - resetStartedAt, artifact.conformanceBands.formationRackCompleteAtSeconds)){
    fail('Formation-entry reset rack-complete timing is not relative to the wave reset start', result);
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: result.artifact,
    settleT: settle.t,
    rackCompleteT: complete.t,
    firstDiveT: firstDive.t,
    firstDiveAfterRackComplete: +(firstDive.t - complete.t).toFixed(3),
    firstScoutStart,
    finalEnteringCount: summary.enteringCount,
    resetEntry: result.resetEntry,
    samples
  }, null, 2));
}

main();
